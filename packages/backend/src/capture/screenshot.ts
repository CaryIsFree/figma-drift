import { chromium, type Browser } from 'playwright';
import type { LiveSpecs } from '../types';
import { rgbStringToHex, deduplicateFonts } from '../lib/utils';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    browser = await chromium.launch({
      headless: true,
    });
  }
  return browser;
}

export async function captureScreenshot(
  url: string,
  width: number,
  height: number
): Promise<Buffer> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: Math.ceil(width), height: Math.ceil(height) });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
    });

    return screenshot;
  } finally {
    await page.close();
  }
}

export async function extractLiveSpecs(url: string): Promise<LiveSpecs> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const specs = await page.evaluate(() => {
      const colors = new Set<string>();
      const fonts: { family: string; size: number; weight: number }[] = [];
      const spacing = new Set<number>();

      const elements = document.querySelectorAll('*');

      elements.forEach((el) => {
        const style = window.getComputedStyle(el);

        const bgColor = style.backgroundColor;
        const textColor = style.color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(rgbStringToHex(bgColor));
        }
        if (textColor) {
          colors.add(rgbStringToHex(textColor));
        }

        const fontFamily = style.fontFamily.split(',')[0]?.trim().replace(/['"]/g, '');
        const fontSize = parseFloat(style.fontSize);
        const fontWeight = parseInt(style.fontWeight) || 400;
        if (fontFamily && fontSize) {
          fonts.push({ family: fontFamily, size: fontSize, weight: fontWeight });
        }

        const paddings = [
          parseFloat(style.paddingTop),
          parseFloat(style.paddingRight),
          parseFloat(style.paddingBottom),
          parseFloat(style.paddingLeft),
        ];
        paddings.forEach((p) => {
          if (p > 0) spacing.add(Math.round(p));
        });
      });

      function rgbStringToHex(rgb: string): string {
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        const r = parseInt(match[1] ?? '0');
        const g = parseInt(match[2] ?? '0');
        const b = parseInt(match[3] ?? '0');
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }

      return {
        colors: Array.from(colors),
        fonts,
        spacing: Array.from(spacing).sort((a, b) => a - b),
      };
    });

    const uniqueFonts = deduplicateFonts(specs.fonts);
    const viewport = page.viewportSize();

    return {
      colors: specs.colors,
      fonts: uniqueFonts,
      spacing: specs.spacing,
      dimensions: {
        width: viewport?.width ?? 0,
        height: viewport?.height ?? 0,
      },
    };
  } finally {
    await page.close();
  }
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
