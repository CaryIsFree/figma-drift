import { chromium, type Browser } from 'playwright';
import type { LiveSpecs, CaptureResult, DesignSpecs } from '../types.js';
import { scrapeDOM } from '../figma/dom-scraper.js';
import { matchComponent } from '../figma/component-matcher.js';

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
  cookies?: string[],
  figmaSpecs?: DesignSpecs
): Promise<{ screenshot: Buffer; specs: LiveSpecs }> {
  console.log(`[DEBUG] Capturing page data for ${url} (target resolution: ${width}x${height})`);
  const browser = await getBrowser();
  const context = await browser.newContext({
    extraHTTPHeaders: headers,
    deviceScaleFactor: 2,
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
      width: Math.max(Math.ceil(width * 2), 1280),
      height: Math.max(Math.ceil(height * 2), 720),
    });

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    if (delay && delay > 0) {
      await page.waitForTimeout(delay);
    }

    let clip: { x: number; y: number; width: number; height: number } | undefined;
    let targetSelector = selector;

    if (!targetSelector && figmaSpecs) {
      const elements = await scrapeDOM(page);
      const match = matchComponent(figmaSpecs, elements);
      if (match) {
        console.log(`[DEBUG] Best match found: ${match.element.tagName}.${match.element.className} at (${match.x}, ${match.y}) with confidence ${match.confidence}`);
        if (match.confidence > 0.3) {
          clip = {
            x: match.x,
            y: match.y,
            width: match.width,
            height: match.height
          };
          console.log(`[DEBUG] Applying clip: ${JSON.stringify(clip)}`);
        }
      }
    }

    const extractSpecsScript = `
      (function(selectorArg, clipArg) {
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

        let root = document.body;
        if (selectorArg) {
          root = document.querySelector(selectorArg) || document.body;
        } else if (clipArg) {
          // Find the element at the center of the clip area as a heuristic for the root
          const el = document.elementFromPoint(clipArg.x + clipArg.width/2, clipArg.y + clipArg.height/2);
          if (el) root = el;
        }

        processElement(root);
        root.querySelectorAll('*').forEach(processElement);

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
          dimensions: { width: root.clientWidth, height: root.clientHeight },
        };
      })(${targetSelector ? JSON.stringify(targetSelector) : 'null'}, ${clip ? JSON.stringify(clip) : 'null'})
    `;

    const specs = await page.evaluate(extractSpecsScript) as LiveSpecs;

    let screenshot: Buffer;
    if (targetSelector) {
      const locator = page.locator(targetSelector).first();
      await locator.waitFor({ state: 'visible', timeout: 5000 });
      screenshot = await locator.screenshot({ type: 'png' });
    } else if (clip) {
      screenshot = await page.screenshot({ type: 'png', clip });
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
