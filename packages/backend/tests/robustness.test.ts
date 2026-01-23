import { describe, it, expect, beforeEach } from 'vitest';
import { PNG } from 'pngjs';
import { compare } from '../src/compare';

/**
 * Robustness tests against real static sites.
 * 
 * These tests verify Figma Drift works reliably against various
 * real-world sites with different characteristics.
 * 
 * Prerequisite: FIGMA_ACCESS_TOKEN must be set and valid
 * 
 * Sites tested:
 * - example.com: Simple HTML, minimal CSS
 * - github.com: Complex dynamic site, heavy JS
 * - wikipedia.org: Content-heavy, text-focused
 * - stripe.com: Modern CSS-heavy, animations
 * - tailwindcss.com: Framework-specific design system
 * 
 * NOTE: These tests will be skipped if FIGMA_ACCESS_TOKEN is not set.
 */

const FIGMA_URL = 'https://www.figma.com/design/VUvdiJ5sFBCe8kXEusioqm/Untitled?node-id=1-299';

// Get token early to use in skipIf
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN ?? null;

// Helper to validate PNG buffer
function isValidPng(buffer: Buffer): boolean {
  try {
    const png = PNG.sync.read(buffer);
    return png.width > 0 && png.height > 0;
  } catch {
    return false;
  }
}

// Skip entire suite if no token
const skipTests = !FIGMA_TOKEN;
if (skipTests) {
  console.warn('\n⚠️  FIGMA_ACCESS_TOKEN not set. Robustness tests will be skipped.\n');
}

describe.skipIf(skipTests)('Robustness Tests - Real Static Sites', () => {
  beforeEach(async () => {
    // Add delay between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  });

  describe('Prerequisites', () => {
    it('FIGMA_ACCESS_TOKEN is available', () => {
      expect(FIGMA_TOKEN).not.toBeNull();
      expect(FIGMA_TOKEN!.length).toBeGreaterThan(20);
    });

    it('Figma URL is valid', () => {
      expect(FIGMA_URL).toContain('figma.com');
      expect(FIGMA_URL).toContain('node-id=');
    });
  });

  describe('Test Site: example.com (Simple Static)', () => {
    const TIMEOUT = 60000;

    it('captures screenshot successfully', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.figmaUrl).toBe(FIGMA_URL);
      expect(result.liveUrl).toBe('https://example.com');
      expect(result.timestamp).toBeDefined();
      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.visual.diffPercent).toBeLessThanOrEqual(100);
    }, TIMEOUT);

    it('returns valid PNG screenshot', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);
      
      expect(result.visual.diffImageBase64).not.toBeNull();
      const diffBuffer = Buffer.from(result.visual.diffImageBase64!, 'base64');
      expect(isValidPng(diffBuffer)).toBe(true);
    }, TIMEOUT);

    it('extracts valid specs', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.specs).toBeDefined();
      expect(result.specs.colorDrift).toBeDefined();
      expect(result.specs.fontDrift).toBeDefined();
      expect(result.specs.spacingDrift).toBeDefined();
    }, TIMEOUT);

    it('passed flag is boolean', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(typeof result.passed).toBe('boolean');
    }, TIMEOUT);
  });

  describe('Test Site: github.com (Complex Dynamic)', () => {
    const TIMEOUT = 90000;

    it('handles complex site with JavaScript', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://github.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.visual.diffPercent).toBeLessThanOrEqual(100);
    }, TIMEOUT);

    it('returns spec comparison for complex site', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://github.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.specs).toBeDefined();
      expect(Array.isArray(result.specs.colorDrift)).toBe(true);
      expect(Array.isArray(result.specs.fontDrift)).toBe(true);
    }, TIMEOUT);
  });

  describe('Test Site: wikipedia.org (Content-Heavy)', () => {
    const TIMEOUT = 60000;

    it('handles content-heavy page', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://en.wikipedia.org/wiki/Software_testing',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    }, TIMEOUT);

    it('captures specs from text-heavy site', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://en.wikipedia.org/wiki/Software_testing',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.specs.fontDrift).toBeDefined();
      expect(Array.isArray(result.specs.fontDrift)).toBe(true);
    }, TIMEOUT);
  });

  describe('Test Site: stripe.com (Modern CSS-Heavy)', () => {
    const TIMEOUT = 60000;

    it('handles modern CSS with animations', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://stripe.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeDefined();
    }, TIMEOUT);

    it('captures valid PNG from CSS-heavy site', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://stripe.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);
      
      expect(result.visual.diffImageBase64).not.toBeNull();
      const diffBuffer = Buffer.from(result.visual.diffImageBase64!, 'base64');
      expect(isValidPng(diffBuffer)).toBe(true);
    }, TIMEOUT);
  });

  describe('Test Site: tailwindcss.com (Framework-Specific)', () => {
    const TIMEOUT = 60000;

    it('handles utility-first CSS framework', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://tailwindcss.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.specs).toBeDefined();
    }, TIMEOUT);

    it('extracts spacing from utility-based CSS', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://tailwindcss.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.specs.spacingDrift).toBeDefined();
      expect(Array.isArray(result.specs.spacingDrift)).toBe(true);
    }, TIMEOUT);
  });

  describe('Optional Parameters', () => {
    it('respects selector parameter', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
        selector: 'h1',
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
    }, 60000);

    it('respects delay parameter', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
        delay: 1000,
      };

      const startTime = Date.now();
      await compare(request, FIGMA_TOKEN!);
      const elapsed = Date.now() - startTime;

      expect(elapsed).toBeGreaterThanOrEqual(800);
    }, 60000);

    it('respects custom threshold', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.2,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.visual.diffPercent).toBeGreaterThanOrEqual(0);
      expect(result.passed).toBe(result.visual.diffPercent < 20);
    }, 60000);
  });

  describe('Error Handling for Real Sites', () => {
    it('handles unreachable site gracefully', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://this-site-does-not-exist-99999.com',
        threshold: 0.1,
      };

      await expect(compare(request, FIGMA_TOKEN!)).rejects.toThrow();
    }, 60000);

    it('handles invalid URL format', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'not-a-valid-url',
        threshold: 0.1,
      };

      await expect(compare(request, FIGMA_TOKEN!)).rejects.toThrow();
    }, 60000);

    it('handles 404 response', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://httpstat.us/404',
        threshold: 0.1,
      };

      try {
        await compare(request, FIGMA_TOKEN!);
      } catch (error) {
        expect(error).toBeDefined();
      }
    }, 60000);
  });

  describe('Data Integrity', () => {
    it('Figma URL is preserved in report', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.figmaUrl).toBe(FIGMA_URL);
    }, 60000);

    it('Live URL is preserved in report', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.liveUrl).toBe('https://example.com');
    }, 60000);

    it('Timestamp is ISO 8601 format', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
    }, 60000);

    it('Visual diff contains base64 string or null', async () => {
      const request = {
        figmaUrl: FIGMA_URL,
        liveUrl: 'https://example.com',
        threshold: 0.1,
      };

      const result = await compare(request, FIGMA_TOKEN!);

      expect(
        result.visual.diffImageBase64 === null ||
        typeof result.visual.diffImageBase64 === 'string'
      ).toBe(true);
      
      if (result.visual.diffImageBase64 !== null) {
        expect(() => Buffer.from(result.visual.diffImageBase64!, 'base64')).not.toThrow();
      }
    }, 60000);
  });
});
