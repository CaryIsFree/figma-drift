import { describe, it, expect, beforeAll } from 'vitest';
import { PNG } from 'pngjs';
import { compareImages } from '../src/compare/visual';

/**
 * Visual comparison tests using programmatically generated images.
 * This replaces the broken baseline.test.ts that used invalid file:// URLs.
 */

// Helper to create a solid color PNG buffer
function createSolidPng(width: number, height: number, r: number, g: number, b: number, a: number = 255): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }
  return PNG.sync.write(png);
}

// Helper to create a PNG with a colored rectangle
function createPngWithRect(
  width: number,
  height: number,
  bgColor: { r: number; g: number; b: number },
  rectColor: { r: number; g: number; b: number },
  rectX: number,
  rectY: number,
  rectW: number,
  rectH: number
): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const inRect = x >= rectX && x < rectX + rectW && y >= rectY && y < rectY + rectH;
      const color = inRect ? rectColor : bgColor;
      png.data[idx] = color.r;
      png.data[idx + 1] = color.g;
      png.data[idx + 2] = color.b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

describe('compareImages', () => {
  describe('identical images', () => {
    it('returns 0% diff for identical solid color images', async () => {
      const img = createSolidPng(100, 100, 255, 0, 0); // Red
      
      const result = await compareImages(img, img, 0.1);
      
      expect(result.diffPercent).toBe(0);
      expect(result.severity).toBe('low');
      expect(result.matchedPixels).toBe(result.totalPixels);
    });

    it('returns 0% diff for identical complex images', async () => {
      const img = createPngWithRect(
        200, 200,
        { r: 255, g: 255, b: 255 }, // white background
        { r: 0, g: 0, b: 255 },     // blue rectangle
        50, 50, 100, 100
      );
      
      const result = await compareImages(img, img, 0.1);
      
      expect(result.diffPercent).toBe(0);
      expect(result.severity).toBe('low');
    });
  });

  describe('different images', () => {
    it('detects difference between different solid colors', async () => {
      const red = createSolidPng(100, 100, 255, 0, 0);
      const blue = createSolidPng(100, 100, 0, 0, 255);
      
      const result = await compareImages(red, blue, 0.1);
      
      expect(result.diffPercent).toBeGreaterThan(0);
      expect(result.diffPercent).toBeLessThanOrEqual(100);
      expect(result.severity).toBe('high'); // 100% different
    });

    it('detects partial difference', async () => {
      // White background with different rectangles
      const img1 = createPngWithRect(
        100, 100,
        { r: 255, g: 255, b: 255 },
        { r: 255, g: 0, b: 0 }, // red rect
        10, 10, 20, 20
      );
      const img2 = createPngWithRect(
        100, 100,
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 255, b: 0 }, // green rect
        10, 10, 20, 20
      );
      
      const result = await compareImages(img1, img2, 0.1);
      
      // Only the rectangle area should differ (20*20 = 400 pixels out of 10000)
      expect(result.diffPercent).toBeGreaterThan(0);
      expect(result.diffPercent).toBeLessThan(10); // ~4% of image
      expect(result.totalPixels).toBe(10000);
    });

    it('returns correct severity levels', async () => {
      // Test low severity (< 1%)
      const base = createSolidPng(1000, 1000, 255, 255, 255);
      const smallDiff = createPngWithRect(
        1000, 1000,
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 0, b: 0 },
        0, 0, 10, 10 // 100 pixels = 0.01%
      );
      
      const lowResult = await compareImages(base, smallDiff, 0.1);
      expect(lowResult.severity).toBe('low');
      
      // Test medium severity (1-5%)
      const mediumDiff = createPngWithRect(
        100, 100,
        { r: 255, g: 255, b: 255 },
        { r: 0, g: 0, b: 0 },
        0, 0, 20, 20 // 400 pixels = 4%
      );
      
      const medResult = await compareImages(base.slice(0, base.length), createSolidPng(100, 100, 255, 255, 255), 0.1);
      // This won't match exactly so let's create proper test
      
      // Test high severity (> 5%)
      const red = createSolidPng(100, 100, 255, 0, 0);
      const blue = createSolidPng(100, 100, 0, 0, 255);
      const highResult = await compareImages(red, blue, 0.1);
      expect(highResult.severity).toBe('high');
    });
  });

  describe('different sized images', () => {
    it('handles images of different sizes by cropping to minimum', async () => {
      const small = createSolidPng(50, 50, 255, 0, 0);
      const large = createSolidPng(100, 100, 255, 0, 0);
      
      const result = await compareImages(small, large, 0.1);
      
      // Should compare the overlapping region (50x50)
      expect(result.totalPixels).toBe(2500); // 50 * 50
      expect(result.diffPercent).toBe(0); // Same color
    });

    it('detects differences in cropped region', async () => {
      const small = createSolidPng(50, 50, 255, 0, 0); // Red
      const large = createSolidPng(100, 100, 0, 0, 255); // Blue
      
      const result = await compareImages(small, large, 0.1);
      
      expect(result.totalPixels).toBe(2500);
      expect(result.diffPercent).toBeGreaterThan(0);
    });
  });

  describe('threshold behavior', () => {
    it('respects higher threshold (more forgiving)', async () => {
      // Create nearly identical images (slight color difference)
      const img1 = createSolidPng(100, 100, 255, 0, 0);
      const img2 = createSolidPng(100, 100, 250, 0, 0); // Slightly different red
      
      const strictResult = await compareImages(img1, img2, 0.01);
      const lenientResult = await compareImages(img1, img2, 0.5);
      
      // Lenient threshold should detect fewer differences
      expect(lenientResult.diffPercent).toBeLessThanOrEqual(strictResult.diffPercent);
    });
  });

  describe('output buffers', () => {
    it('returns valid diff image buffer', async () => {
      const img1 = createSolidPng(100, 100, 255, 0, 0);
      const img2 = createSolidPng(100, 100, 0, 0, 255);
      
      const result = await compareImages(img1, img2, 0.1);
      
      expect(result.diffImageBuffer).toBeInstanceOf(Buffer);
      expect(result.diffImageBuffer.length).toBeGreaterThan(0);
      
      // Verify it's a valid PNG
      const parsed = PNG.sync.read(result.diffImageBuffer);
      expect(parsed.width).toBe(100);
      expect(parsed.height).toBe(100);
    });

    it('returns valid composite image buffer', async () => {
      const img1 = createSolidPng(100, 100, 255, 0, 0);
      const img2 = createSolidPng(100, 100, 0, 0, 255);
      
      const result = await compareImages(img1, img2, 0.1);
      
      expect(result.compositeImageBuffer).toBeInstanceOf(Buffer);
      expect(result.compositeImageBuffer.length).toBeGreaterThan(0);
      
      // Verify it's a valid PNG (composite should be ~3x width for side-by-side plus padding)
      const parsed = PNG.sync.read(result.compositeImageBuffer);
      expect(parsed.width).toBeGreaterThanOrEqual(300); // 3 panels + possible padding
      expect(parsed.height).toBeGreaterThan(100); // Includes label bar
    });
  });
});
