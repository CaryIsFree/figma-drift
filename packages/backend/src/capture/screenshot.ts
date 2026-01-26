import { chromium, type Browser } from 'playwright';
import type { LiveSpecs, CaptureResult } from '../types';

export type { CaptureResult };

let _browser: Browser | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    _browser = await chromium.launch();
  }
  return _browser;
}

export async function capturePageData(
  url: string,
  width: number,
  height: number,
  selector?: string,
  delay?: number,
  headers?: Record<string, string>,
  cookies?: string[]
): Promise<{ screenshot: Buffer; specs: LiveSpecs }> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    extraHTTPHeaders: headers,
  });
  
  if (cookies && cookies.length > 0) {
    await context.addCookies(cookies.map(c => {
      const parts = c.split(';').map(p => p.trim()).filter(p => p);
      if (parts.length === 0) return {} as any;
      const cookiePart = parts[0] ?? '';
      const [name, value] = cookiePart.split('=');
      return { name: name || '', value: value || '', domain: new URL(url).hostname, path: '/' } as any;
    }));
  }
  const page = await context.newPage();

  try {
    await page.setViewportSize({
      width: Math.max(Math.ceil(width), 100),
      height: Math.max(Math.ceil(height), 100),
    });

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Optional delay for dynamic content (SPAs)
    if (delay && delay > 0) {
      await page.waitForTimeout(delay);
    }

    try {
      await page.waitForLoadState('networkidle', { timeout: 5000 });
    } catch {
      // Ignore network idle timeout
    }

    const extractSpecsScript = `
      (function(selectorArg) {
        const colors = new Set();
        const fonts = [];
        const spacing = new Set();

        function rgbToHex(rgb) {
          const result = rgb.match(/\\d+/g);
          if (!result || result.length < 3) return rgb;
          const r = parseInt(result[0] || '0');
          const g = parseInt(result[1] || '0');
          const b = parseInt(result[2] || '0');
          return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        function processElement(el) {
          const style = window.getComputedStyle(el);

          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            colors.add(rgbToHex(style.backgroundColor));
          }
          if (style.color) {
            colors.add(rgbToHex(style.color));
          }

          if (style.fontFamily && style.fontSize) {
            fonts.push({
              family: style.fontFamily.replace(/['"]/g, ''),
              size: parseFloat(style.fontSize),
              weight: parseInt(style.fontWeight) || 400,
            });
          }

          ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'gap'].forEach(function(prop) {
            const val = parseFloat(style[prop]);
            if (val > 0) spacing.add(val);
          });
        }

        let root = document;
        if (selectorArg) {
          const selected = document.querySelector(selectorArg);
          if (selected) {
            root = selected;
            processElement(selected);
          }
        }

        const elements = root.querySelectorAll('*');
        elements.forEach(processElement);

        const seen = new Set();
        const dedupedFonts = fonts.filter(function(f) {
          const key = f.family + '-' + f.size + '-' + f.weight;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        return {
          colors: Array.from(colors),
          fonts: dedupedFonts,
          spacing: Array.from(spacing).sort(function(a, b) { return a - b; }),
          dimensions: { width: 0, height: 0 },
        };
      })(${selector ? JSON.stringify(selector) : 'null'})
    `;

    const specs = await page.evaluate(extractSpecsScript) as LiveSpecs;

    let screenshot: Buffer;
    if (selector) {
      try {
        const locator = page.locator(selector).first();
        await locator.waitFor({ state: 'visible', timeout: 5000 });
        screenshot = await locator.screenshot({ type: 'png' });
      } catch (error: any) {
        throw new Error(`Failed to find or capture element with selector "${selector}": ${error.message}`);
      }
    } else {
      screenshot = await page.screenshot({ type: 'png', fullPage: false });
    }

    return { screenshot, specs };
  } finally {
    await context.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}
