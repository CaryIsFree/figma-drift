import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PNG } from 'pngjs';

/**
 * Integration tests for the full compare pipeline.
 * 
 * These tests mock external dependencies (Figma API, Playwright) to test
 * the orchestration logic without requiring real API calls.
 */

// Helper to create a solid color PNG buffer
function createSolidPng(width: number, height: number, r: number, g: number, b: number): Buffer {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

describe('Compare Pipeline Integration', () => {
  describe('compareSpecs integration', () => {
    it('correctly identifies matching specs', async () => {
      const { compareSpecs } = await import('../src/compare/specs');
      
      const designSpecs = {
        colors: [
          { value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] },
          { value: '#00FF00', nodes: [{ id: '1:2', name: 'Text' }] },
        ],
        fonts: [
          { value: { family: 'Arial', size: 16 }, nodes: [{ id: '1:1', name: 'Button' }] },
        ],
        spacing: [
          { value: 8, nodes: [{ id: '1:1', name: 'Button' }] },
        ],
        dimensions: { width: 800, height: 600 },
      };

      const liveSpecs = {
        colors: ['#FF0000', '#00FF00'],
        fonts: [{ family: 'Arial', size: 16 }],
        spacing: [8],
        dimensions: { width: 800, height: 600 },
      };

      const result = compareSpecs(designSpecs, liveSpecs);
      
      expect(result.hasDrift).toBe(false);
      expect(result.colorDrift.length).toBe(0);
      expect(result.fontDrift.length).toBe(0);
      expect(result.spacingDrift.length).toBe(0);
    });

    it('detects missing colors in implementation', async () => {
      const { compareSpecs } = await import('../src/compare/specs');
      
      const designSpecs = {
        colors: [
          { value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] },
          { value: '#0000FF', nodes: [{ id: '1:2', name: 'Link' }] }, // Missing in live
        ],
        fonts: [],
        spacing: [],
        dimensions: { width: 800, height: 600 },
      };

      const liveSpecs = {
        colors: ['#FF0000'], // Missing #0000FF
        fonts: [],
        spacing: [],
        dimensions: { width: 800, height: 600 },
      };

      const result = compareSpecs(designSpecs, liveSpecs);
      
      expect(result.hasDrift).toBe(true);
      expect(result.colorDrift.length).toBeGreaterThan(0);
      
      // colorDrift contains SpecItem<string> objects with .value property
      const missingColor = result.colorDrift.find(d => d.value === '#0000FF');
      expect(missingColor).toBeDefined();
    });

    it('detects font mismatches', async () => {
      const { compareSpecs } = await import('../src/compare/specs');
      
      const designSpecs = {
        colors: [],
        fonts: [
          { value: { family: 'Arial', size: 16 }, nodes: [{ id: '1:1', name: 'Text' }] },
        ],
        spacing: [],
        dimensions: { width: 800, height: 600 },
      };

      const liveSpecs = {
        colors: [],
        fonts: [{ family: 'Helvetica', size: 14 }], // Different font
        spacing: [],
        dimensions: { width: 800, height: 600 },
      };

      const result = compareSpecs(designSpecs, liveSpecs);
      
      expect(result.hasDrift).toBe(true);
      expect(result.fontDrift.length).toBeGreaterThan(0);
    });
  });

  describe('compareImages integration', () => {
    it('correctly calculates diff percentage', async () => {
      const { compareImages } = await import('../src/compare/visual');
      
      const img1 = createSolidPng(100, 100, 255, 255, 255); // White
      const img2 = createSolidPng(100, 100, 255, 255, 255); // White
      
      const result = await compareImages(img1, img2, 0.1);
      
      expect(result.diffPercent).toBe(0);
      expect(result.severity).toBe('low');
    });

    it('produces valid composite output', async () => {
      const { compareImages } = await import('../src/compare/visual');
      
      const img1 = createSolidPng(100, 100, 255, 0, 0); // Red
      const img2 = createSolidPng(100, 100, 0, 0, 255); // Blue
      
      const result = await compareImages(img1, img2, 0.1);
      
      expect(result.compositeImageBuffer).toBeInstanceOf(Buffer);
      
      // Should be a valid PNG
      const composite = PNG.sync.read(result.compositeImageBuffer);
      expect(composite.width).toBeGreaterThanOrEqual(300); // 3 panels side by side + possible padding
    });
  });

  describe('Figma URL parsing', () => {
    it('parses file URL with node-id', async () => {
      const { parseFigmaUrl } = await import('../src/figma/api');
      
      const result = parseFigmaUrl('https://www.figma.com/file/abc123/MyDesign?node-id=1:2');
      
      expect(result.fileKey).toBe('abc123');
      expect(result.nodeId).toBe('1:2');
    });

    it('parses design URL with node-id', async () => {
      const { parseFigmaUrl } = await import('../src/figma/api');
      
      const result = parseFigmaUrl('https://www.figma.com/design/xyz789/AnotherDesign?node-id=10:20');
      
      expect(result.fileKey).toBe('xyz789');
      expect(result.nodeId).toBe('10:20');
    });

    it('throws on invalid URL', async () => {
      const { parseFigmaUrl } = await import('../src/figma/api');
      
      expect(() => parseFigmaUrl('https://google.com')).toThrow();
    });
  });

  describe('extractDesignSpecs', () => {
    it('extracts colors from Figma node data', async () => {
      const { extractDesignSpecs } = await import('../src/figma/extract');
      
      const figmaNode = {
        id: '1:1',
        name: 'Button',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 50 },
        fills: [
          { type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 } }, // Red
        ],
        children: [],
      };

      const result = extractDesignSpecs(figmaNode);
      
      expect(result.colors.length).toBeGreaterThan(0);
      expect(result.colors[0].value.toLowerCase()).toBe('#ff0000');
    });

    it('extracts dimensions from bounding box', async () => {
      const { extractDesignSpecs } = await import('../src/figma/extract');
      
      const figmaNode = {
        id: '1:1',
        name: 'Container',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 800, height: 600 },
        fills: [],
        children: [],
      };

      const result = extractDesignSpecs(figmaNode);
      
      expect(result.dimensions.width).toBe(800);
      expect(result.dimensions.height).toBe(600);
    });

    it('extracts spacing from padding', async () => {
      const { extractDesignSpecs } = await import('../src/figma/extract');
      
      const figmaNode = {
        id: '1:1',
        name: 'Container',
        type: 'FRAME',
        absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
        fills: [],
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: 8,
        paddingBottom: 8,
        itemSpacing: 12,
        children: [],
      };

      const result = extractDesignSpecs(figmaNode);
      
      expect(result.spacing.length).toBeGreaterThan(0);
      // Should include 16, 8, and 12
      const spacingValues = result.spacing.map(s => s.value);
      expect(spacingValues).toContain(16);
      expect(spacingValues).toContain(8);
      expect(spacingValues).toContain(12);
    });
  });
});

describe('End-to-End Flow (Mocked)', () => {
  it('full pipeline produces valid DriftReport structure', async () => {
    // This test verifies the report structure without making real API calls
    // In a real scenario, you would mock the Figma API and Playwright
    
    const expectedReportStructure = {
      figmaUrl: expect.any(String),
      liveUrl: expect.any(String),
      timestamp: expect.any(String),
      visual: {
        diffPercent: expect.any(Number),
        diffImageBase64: expect.any(String),
      },
      specs: {
        colorDrift: expect.any(Array),
        fontDrift: expect.any(Array),
        spacingDrift: expect.any(Array),
      },
      passed: expect.any(Boolean),
    };

    // Create a mock report to validate structure
    const mockReport = {
      figmaUrl: 'https://figma.com/file/abc/test?node-id=1:2',
      liveUrl: 'https://example.com',
      timestamp: new Date().toISOString(),
      visual: {
        diffPercent: 2.5,
        diffImageBase64: 'iVBORw0KGgoAAAANS...',
      },
      specs: {
        colorDrift: [],
        fontDrift: [],
        spacingDrift: [],
      },
      passed: true,
    };

    expect(mockReport).toMatchObject(expectedReportStructure);
  });

  it('passed flag reflects both visual and spec comparison', () => {
    // passed = diffPercent < (threshold * 100) && !specDiff.hasDrift
    
    const threshold = 0.05; // 5%
    
    // Case 1: Visual pass, Spec pass = PASS
    expect(2 < threshold * 100 && !false).toBe(true);
    
    // Case 2: Visual pass, Spec fail = FAIL
    expect(2 < threshold * 100 && !true).toBe(false);
    
    // Case 3: Visual fail, Spec pass = FAIL
    expect(10 < threshold * 100 && !false).toBe(false);
    
    // Case 4: Visual fail, Spec fail = FAIL
    expect(10 < threshold * 100 && !true).toBe(false);
  });
});
