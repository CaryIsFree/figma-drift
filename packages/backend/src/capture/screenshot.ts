import { chromium, type Browser, type Page } from 'playwright';
import type { LiveSpecs } from '../types';
import { deduplicateFonts } from '../lib/utils';

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ 
      headless: true,
      timeout: 15000,
    });
  }
  return browser;
}

export interface CaptureResult {
  screenshot: Buffer;
  specs: LiveSpecs;
}

export async function capturePageData(
  url: string,
  width: number,
  height: number
): Promise<CaptureResult> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    await page.setViewportSize({ 
      width: Math.max(Math.ceil(width), 100), 
      height: Math.max(Math.ceil(height), 100) 
    });
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    const [screenshot, specs] = await Promise.all([
      page.screenshot({ type: 'png', fullPage: false }),
      extractSpecsFromPage(page),
    ]);

    const viewport = page.viewportSize();

    return {
      screenshot,
      specs: {
        ...specs,
        dimensions: {
          width: viewport?.width ?? 0,
          height: viewport?.height ?? 0,
        },
      },
    };
  } finally {
    await page.close();
  }
}

interface PageSpecs {
  colors: string[];
  fonts: { family: string; size: number; weight: number }[];
  spacing: number[];
}

async function extractSpecsFromPage(page: Page): Promise<Omit<LiveSpecs, 'dimensions'>> {
  const specs: PageSpecs = await page.evaluate(`
    (function() {
      function rgbToHex(rgb) {
        var match = rgb.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        if (!match) return rgb;
        var r = parseInt(match[1] || '0');
        var g = parseInt(match[2] || '0');
        var b = parseInt(match[3] || '0');
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
      }

      var colors = [];
      var colorSet = {};
      var fonts = [];
      var spacing = [];
      var spacingSet = {};

      var elements = document.querySelectorAll('*');

      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var style = window.getComputedStyle(el);

        var bgColor = style.backgroundColor;
        var textColor = style.color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          var hex = rgbToHex(bgColor);
          if (!colorSet[hex]) { colorSet[hex] = true; colors.push(hex); }
        }
        if (textColor) {
          var hex2 = rgbToHex(textColor);
          if (!colorSet[hex2]) { colorSet[hex2] = true; colors.push(hex2); }
        }

        var fontFamily = style.fontFamily.split(',')[0];
        if (fontFamily) fontFamily = fontFamily.trim().replace(/['"]/g, '');
        var fontSize = parseFloat(style.fontSize);
        var fontWeight = parseInt(style.fontWeight) || 400;
        if (fontFamily && fontSize) {
          fonts.push({ family: fontFamily, size: fontSize, weight: fontWeight });
        }

        var paddings = [
          parseFloat(style.paddingTop),
          parseFloat(style.paddingRight),
          parseFloat(style.paddingBottom),
          parseFloat(style.paddingLeft)
        ];
        for (var j = 0; j < paddings.length; j++) {
          var p = Math.round(paddings[j]);
          if (p > 0 && !spacingSet[p]) { spacingSet[p] = true; spacing.push(p); }
        }
      }

      spacing.sort(function(a, b) { return a - b; });

      return { colors: colors, fonts: fonts, spacing: spacing };
    })()
  `);

  return {
    colors: specs.colors,
    fonts: deduplicateFonts(specs.fonts),
    spacing: specs.spacing,
  };
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}
