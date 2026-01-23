import { describe, it, expect } from 'vitest';
import { compareSpecs } from '../src/compare/specs';
import type { DesignSpecs, LiveSpecs, FontSpec } from '../src/types';

/**
 * Edge case tests for spec comparison.
 * 
 * Tests tolerance boundaries and real-world scenarios that may cause
 * false positives or false negatives in drift detection.
 */

// Helper to create a minimal DesignSpecs object
function createDesignSpecs(overrides: Partial<DesignSpecs> = {}): DesignSpecs {
  return {
    colors: [],
    fonts: [],
    spacing: [],
    dimensions: { width: 800, height: 600 },
    ...overrides,
  };
}

// Helper to create a minimal LiveSpecs object
function createLiveSpecs(overrides: Partial<LiveSpecs> = {}): LiveSpecs {
  return {
    colors: [],
    fonts: [],
    spacing: [],
    dimensions: { width: 800, height: 600 },
    ...overrides,
  };
}

describe('Color Tolerance Edge Cases', () => {
  // COLOR_TOLERANCE = 15 (Euclidean RGB distance)
  
  describe('exact matches', () => {
    it('detects exact hex match (case insensitive)', () => {
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: ['#ff0000'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
      expect(result.colorDrift.length).toBe(0);
    });

    it('detects exact hex match with different case', () => {
      const design = createDesignSpecs({
        colors: [{ value: '#AbCdEf', nodes: [{ id: '1:1', name: 'Text' }] }],
      });
      const live = createLiveSpecs({ colors: ['#ABCDEF'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });
  });

  describe('within tolerance (should PASS)', () => {
    it('passes when color distance is exactly at threshold (15)', () => {
      // #FF0000 (255,0,0) vs #F00000 (240,0,0) = distance 15
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: ['#F00000'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
      expect(result.colorDrift.length).toBe(0);
    });

    it('passes when color is very slightly different', () => {
      // #FF0000 vs #FE0101 = tiny difference, well within tolerance
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: ['#FE0101'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('passes with slight shade variation', () => {
      // #808080 (gray) vs #858585 (slightly lighter gray)
      const design = createDesignSpecs({
        colors: [{ value: '#808080', nodes: [{ id: '1:1', name: 'Border' }] }],
      });
      const live = createLiveSpecs({ colors: ['#858585'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });
  });

  describe('outside tolerance (should FAIL)', () => {
    it('fails when color distance exceeds threshold', () => {
      // #FF0000 (255,0,0) vs #E00000 (224,0,0) = distance 31, outside tolerance
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: ['#E00000'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.colorDrift.length).toBe(1);
      expect(result.colorDrift[0]?.value).toBe('#FF0000');
    });

    it('fails when color is completely different', () => {
      // Red vs Blue
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: ['#0000FF'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.colorDrift.length).toBe(1);
    });

    it('fails when color is missing entirely', () => {
      const design = createDesignSpecs({
        colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      });
      const live = createLiveSpecs({ colors: [] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.colorDrift.length).toBe(1);
    });

    it('fails when multiple colors are missing', () => {
      const design = createDesignSpecs({
        colors: [
          { value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] },
          { value: '#00FF00', nodes: [{ id: '1:2', name: 'Success' }] },
          { value: '#0000FF', nodes: [{ id: '1:3', name: 'Link' }] },
        ],
      });
      const live = createLiveSpecs({ colors: ['#FF0000'] }); // Only red exists

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.colorDrift.length).toBe(2); // Green and Blue missing
    });
  });

  describe('boundary edge cases', () => {
    it('handles black (#000000)', () => {
      const design = createDesignSpecs({
        colors: [{ value: '#000000', nodes: [{ id: '1:1', name: 'Text' }] }],
      });
      const live = createLiveSpecs({ colors: ['#000000'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('handles white (#FFFFFF)', () => {
      const design = createDesignSpecs({
        colors: [{ value: '#FFFFFF', nodes: [{ id: '1:1', name: 'Background' }] }],
      });
      const live = createLiveSpecs({ colors: ['#ffffff'] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('handles near-black vs black', () => {
      // #000000 vs #0A0A0A = distance ~17, outside tolerance
      const design = createDesignSpecs({
        colors: [{ value: '#000000', nodes: [{ id: '1:1', name: 'Text' }] }],
      });
      const live = createLiveSpecs({ colors: ['#0F0F0F'] });

      const result = compareSpecs(design, live);

      // Distance = sqrt(15^2 + 15^2 + 15^2) = ~26, outside tolerance
      expect(result.hasDrift).toBe(true);
    });
  });
});

describe('Font Weight Edge Cases', () => {
  describe('exact weight match required', () => {
    it('passes when weight matches exactly', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 16, weight: 400 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
      expect(result.fontDrift.length).toBe(0);
    });

    it('fails when weight is different (400 vs 500)', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 16, weight: 500 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.fontDrift.length).toBe(1);
    });

    it('fails when weight is different (700 vs 400)', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 700 }, nodes: [{ id: '1:1', name: 'Heading' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 16, weight: 400 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
    });

    it('fails when bold (700) becomes normal (400)', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Roboto', size: 14, weight: 700 }, nodes: [{ id: '1:1', name: 'Label' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Roboto', size: 14, weight: 400 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.fontDrift[0]?.value.weight).toBe(700);
    });
  });

  describe('font size tolerance (±2px)', () => {
    it('passes when size is within 2px tolerance', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 17, weight: 400 }], // 1px difference
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('passes at exactly 2px difference boundary', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 14, weight: 400 }], // Exactly 2px smaller (but < 2 fails)
      });

      const result = compareSpecs(design, live);

      // Math.abs(14 - 16) < 2 = false, so this should FAIL
      expect(result.hasDrift).toBe(true);
    });

    it('passes at 1.9px difference (within tolerance)', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 14.1, weight: 400 }], // 1.9px difference
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('fails when size difference exceeds 2px', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Arial', size: 12, weight: 400 }], // 4px difference
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
    });
  });

  describe('font family matching', () => {
    it('passes with case-insensitive family match', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'arial', size: 16, weight: 400 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('fails when font family is different', () => {
      const design = createDesignSpecs({
        fonts: [
          { value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Body' }] },
        ],
      });
      const live = createLiveSpecs({
        fonts: [{ family: 'Helvetica', size: 16, weight: 400 }],
      });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
    });
  });
});

describe('Spacing Tolerance Edge Cases', () => {
  // Spacing tolerance is ±2px

  describe('within tolerance', () => {
    it('passes when spacing matches exactly', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [16] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('passes when spacing is within 2px tolerance', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [17] }); // 1px difference

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('passes at exactly 2px difference (boundary)', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [18] }); // 2px difference

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });
  });

  describe('outside tolerance', () => {
    it('fails when spacing difference exceeds 2px', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [20] }); // 4px difference

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.spacingDrift.length).toBe(1);
    });

    it('fails when spacing is missing entirely', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
    });

    it('fails at 3px difference (just outside tolerance)', () => {
      const design = createDesignSpecs({
        spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Container' }] }],
      });
      const live = createLiveSpecs({ spacing: [19] }); // 3px difference

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
    });
  });

  describe('multiple spacing values', () => {
    it('passes when all spacing values are found', () => {
      const design = createDesignSpecs({
        spacing: [
          { value: 8, nodes: [{ id: '1:1', name: 'Small' }] },
          { value: 16, nodes: [{ id: '1:2', name: 'Medium' }] },
          { value: 24, nodes: [{ id: '1:3', name: 'Large' }] },
        ],
      });
      const live = createLiveSpecs({ spacing: [8, 16, 24] });

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(false);
    });

    it('fails when one spacing value is missing', () => {
      const design = createDesignSpecs({
        spacing: [
          { value: 8, nodes: [{ id: '1:1', name: 'Small' }] },
          { value: 16, nodes: [{ id: '1:2', name: 'Medium' }] },
          { value: 24, nodes: [{ id: '1:3', name: 'Large' }] },
        ],
      });
      const live = createLiveSpecs({ spacing: [8, 16] }); // 24 missing

      const result = compareSpecs(design, live);

      expect(result.hasDrift).toBe(true);
      expect(result.spacingDrift.length).toBe(1);
      expect(result.spacingDrift[0]?.value).toBe(24);
    });
  });
});

describe('Element Missing Entirely', () => {
  it('detects when all design specs are missing from live', () => {
    const design = createDesignSpecs({
      colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      fonts: [{ value: { family: 'Arial', size: 16, weight: 400 }, nodes: [{ id: '1:1', name: 'Button' }] }],
      spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Button' }] }],
    });
    const live = createLiveSpecs({
      colors: [],
      fonts: [],
      spacing: [],
    });

    const result = compareSpecs(design, live);

    expect(result.hasDrift).toBe(true);
    expect(result.colorDrift.length).toBe(1);
    expect(result.fontDrift.length).toBe(1);
    expect(result.spacingDrift.length).toBe(1);
  });

  it('detects partial presence (color exists, font missing)', () => {
    const design = createDesignSpecs({
      colors: [{ value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] }],
      fonts: [{ value: { family: 'Arial', size: 16, weight: 700 }, nodes: [{ id: '1:1', name: 'Button' }] }],
    });
    const live = createLiveSpecs({
      colors: ['#FF0000'],
      fonts: [{ family: 'Arial', size: 16, weight: 400 }], // Wrong weight
    });

    const result = compareSpecs(design, live);

    expect(result.hasDrift).toBe(true);
    expect(result.colorDrift.length).toBe(0); // Color matches
    expect(result.fontDrift.length).toBe(1); // Font weight mismatch
  });
});

describe('Set-based Comparison (Known Limitation)', () => {
  /**
   * IMPORTANT: Current implementation uses SET-based comparison.
   * It checks if a value EXISTS anywhere in the live page, NOT if it's
   * in the correct position/element.
   * 
   * This is a known architectural limitation for MVT.
   */

  it('LIMITATION: swapped colors between elements are NOT detected', () => {
    // Design: Red button, Blue link
    // Live: Blue button, Red link (colors swapped)
    // Current behavior: PASSES (both colors exist)
    // Ideal behavior: FAILS (colors in wrong positions)
    
    const design = createDesignSpecs({
      colors: [
        { value: '#FF0000', nodes: [{ id: '1:1', name: 'Button' }] },
        { value: '#0000FF', nodes: [{ id: '1:2', name: 'Link' }] },
      ],
    });
    const live = createLiveSpecs({
      colors: ['#0000FF', '#FF0000'], // Both exist, but swapped
    });

    const result = compareSpecs(design, live);

    // This documents the CURRENT behavior (limitation)
    expect(result.hasDrift).toBe(false);
    // Note: A position-aware implementation would return true here
  });

  it('LIMITATION: element position changes are NOT detected', () => {
    // This test documents that position is not checked
    // The visual diff would catch this, but spec comparison won't
    
    const design = createDesignSpecs({
      spacing: [{ value: 16, nodes: [{ id: '1:1', name: 'Header' }] }],
    });
    const live = createLiveSpecs({
      spacing: [16], // Same value, but could be in footer instead of header
    });

    const result = compareSpecs(design, live);

    // Current behavior: PASSES (value exists)
    expect(result.hasDrift).toBe(false);
  });
});

describe('Empty and Edge Inputs', () => {
  it('handles empty design specs (nothing expected)', () => {
    const design = createDesignSpecs({});
    const live = createLiveSpecs({ colors: ['#FF0000'], fonts: [], spacing: [8] });

    const result = compareSpecs(design, live);

    expect(result.hasDrift).toBe(false); // Nothing to compare
  });

  it('handles both empty (nothing to compare)', () => {
    const design = createDesignSpecs({});
    const live = createLiveSpecs({});

    const result = compareSpecs(design, live);

    expect(result.hasDrift).toBe(false);
  });

  it('handles zero spacing value', () => {
    const design = createDesignSpecs({
      spacing: [{ value: 0, nodes: [{ id: '1:1', name: 'NoGap' }] }],
    });
    const live = createLiveSpecs({ spacing: [0] });

    const result = compareSpecs(design, live);

    expect(result.hasDrift).toBe(false);
  });
});
