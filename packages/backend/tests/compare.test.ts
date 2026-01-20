import { describe, it, expect } from 'bun:test';
import { compareSpecs } from '../src/compare/specs';

describe('compareSpecs', () => {
  it('detects missing colors', () => {
    const design = {
      colors: ['#ff0000', '#00ff00'],
      fonts: [],
      spacing: [],
      dimensions: { width: 100, height: 100 },
    };
    const live = {
      colors: ['#ff0000'],
      fonts: [],
      spacing: [],
      dimensions: { width: 100, height: 100 },
    };

    const result = compareSpecs(design, live);
    expect(result.colorDrift).toContain('#00ff00');
    expect(result.hasDrift).toBe(true);
  });

  it('returns no drift when specs match', () => {
    const design = {
      colors: ['#ff0000'],
      fonts: [{ family: 'Inter', size: 16, weight: 400 }],
      spacing: [8, 16],
      dimensions: { width: 100, height: 100 },
    };
    const live = {
      colors: ['#ff0000'],
      fonts: [{ family: 'Inter', size: 16, weight: 400 }],
      spacing: [8, 16],
      dimensions: { width: 100, height: 100 },
    };

    const result = compareSpecs(design, live);
    expect(result.hasDrift).toBe(false);
  });
});
