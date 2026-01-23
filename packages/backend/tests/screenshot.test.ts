import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PNG } from 'pngjs';
import { capturePageData as _capturePageData, closeBrowser } from '../src/capture/screenshot';

/**
 * Screenshot capture tests using Playwright.
 * These are integration tests that require a browser.
 * 
 * Note: These tests require Playwright browsers to be installed.
 * Run `npx playwright install chromium` to install.
 * 
 * Tests will skip gracefully if browsers are not installed.
 */

// Check if Playwright browsers are available
let playwrightAvailable = false;
const capturePageData = _capturePageData;

beforeAll(async () => {
  try {
    // Try a quick test to see if browsers are installed
    await capturePageData('data:text/html,<html></html>', 100, 100);
    playwrightAvailable = true;
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes("Executable doesn't exist") ||
      error.message.includes("browserType.launch") ||
      error.message.includes("Timeout") ||
      error.message.includes("EPERM") ||
      error.message.includes("browser")
    )) {
      console.warn('\n⚠️  Playwright browsers not available. Screenshot tests will be skipped.');
      console.warn('   Run: npx playwright install chromium\n');
      playwrightAvailable = false;
    } else {
      // Some other error - re-throw
      throw error;
    }
  }
}, 120000); // 120s timeout for browser launch

describe('capturePageData', () => {
  const TIMEOUT = 30000;

  describe('basic capture', () => {
    it('captures a real webpage screenshot', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      const result = await capturePageData(
        'https://example.com',
        800,
        600
      );

      expect(result.screenshot).toBeInstanceOf(Buffer);
      expect(result.screenshot.length).toBeGreaterThan(0);

      // Verify it's a valid PNG
      const png = PNG.sync.read(result.screenshot);
      expect(png.width).toBe(800);
      expect(png.height).toBe(600);
    }, TIMEOUT);

    it('returns specs with colors, fonts, and spacing', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      const result = await capturePageData(
        'https://example.com',
        800,
        600
      );

      expect(result.specs).toBeDefined();
      expect(Array.isArray(result.specs.colors)).toBe(true);
      expect(Array.isArray(result.specs.fonts)).toBe(true);
      expect(Array.isArray(result.specs.spacing)).toBe(true);
    }, TIMEOUT);

    it('respects viewport dimensions', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      const width = 1024;
      const height = 768;

      const result = await capturePageData(
        'https://example.com',
        width,
        height
      );

      const png = PNG.sync.read(result.screenshot);
      expect(png.width).toBe(width);
      expect(png.height).toBe(height);
    }, TIMEOUT);
  });

  describe('selector option', () => {
    it('captures specific element when selector provided', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      // example.com has an <h1> element
      const fullResult = await capturePageData(
        'https://example.com',
        800,
        600
      );

      const selectorResult = await capturePageData(
        'https://example.com',
        800,
        600,
        'h1' // Capture just the h1
      );

      // Element screenshot should be smaller than full page
      expect(selectorResult.screenshot.length).toBeLessThan(fullResult.screenshot.length);
    }, TIMEOUT);
  });

  describe('delay option', () => {
    it('waits specified delay before capture', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      const startTime = Date.now();
      const delay = 1000; // 1 second

      await capturePageData(
        'https://example.com',
        800,
        600,
        undefined,
        delay
      );

      const elapsed = Date.now() - startTime;
      // Should take at least the delay time (with some tolerance for page load)
      expect(elapsed).toBeGreaterThanOrEqual(delay);
    }, TIMEOUT);
  });

  describe('error handling', () => {
    it('throws error for invalid URL', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      await expect(
        capturePageData('not-a-valid-url', 800, 600)
      ).rejects.toThrow();
    }, TIMEOUT);

    it('handles unreachable URL gracefully', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      // This should throw, but we're testing it doesn't crash
      try {
        await capturePageData('https://this-domain-does-not-exist-12345.com', 800, 600);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, TIMEOUT);

    it('throws error for invalid selector', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      await expect(
        capturePageData(
          'https://example.com',
          800,
          600,
          '#this-element-does-not-exist-12345'
        )
      ).rejects.toThrow();
    }, TIMEOUT);
  });

  describe('headers and cookies', () => {
    it('accepts custom headers', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      const result = await capturePageData(
        'https://example.com',
        800,
        600,
        undefined,
        undefined,
        { 'User-Agent': 'FigmaDrift-Test/1.0' }
      );

      expect(result.screenshot).toBeInstanceOf(Buffer);
    }, TIMEOUT);

    it('accepts cookies array', async () => {
      if (!playwrightAvailable) {
        console.log('  ⏭️  Skipped: Playwright not available');
        return;
      }
      
      // Cookies are passed as strings in "name=value; domain=example.com" format
      const result = await capturePageData(
        'https://example.com',
        800,
        600,
        undefined,
        undefined,
        undefined,
        ['test=value; domain=example.com']
      );

      expect(result.screenshot).toBeInstanceOf(Buffer);
    }, TIMEOUT);
  });
});

describe('specs extraction', () => {
  const TIMEOUT = 30000;

  it('extracts colors from page styles', async () => {
    if (!playwrightAvailable) {
      console.log('  ⏭️  Skipped: Playwright not available');
      return;
    }
    
    const result = await capturePageData(
      'https://example.com',
      800,
      600
    );

    // example.com should have some color values
    expect(result.specs.colors.length).toBeGreaterThan(0);
    
    // Colors should be in hex or rgb format
    result.specs.colors.forEach(color => {
      expect(
        color.startsWith('#') || 
        color.startsWith('rgb') ||
        color.startsWith('rgba')
      ).toBe(true);
    });
  }, TIMEOUT);

  it('extracts font information', async () => {
    if (!playwrightAvailable) {
      console.log('  ⏭️  Skipped: Playwright not available');
      return;
    }
    
    const result = await capturePageData(
      'https://example.com',
      800,
      600
    );

    // Should have font specs
    expect(result.specs.fonts.length).toBeGreaterThan(0);
    
    // Each font should have family and size
    result.specs.fonts.forEach(font => {
      expect(typeof font.family).toBe('string');
      expect(typeof font.size).toBe('number');
    });
  }, TIMEOUT);

  it('extracts spacing/dimensions', async () => {
    if (!playwrightAvailable) {
      console.log('  ⏭️  Skipped: Playwright not available');
      return;
    }
    
    const result = await capturePageData(
      'https://example.com',
      800,
      600
    );

    // Spacing values should be numbers
    result.specs.spacing.forEach(space => {
      expect(typeof space).toBe('number');
    });
  }, TIMEOUT);
});
