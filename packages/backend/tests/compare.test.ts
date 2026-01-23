import { describe, it, expect } from 'vitest';
import { compareSpecs } from '../src/compare/specs';

describe('compareSpecs', () => {
  it('detects missing colors', () => {
    const design = {
      colors: [
        { value: '#ff0000', nodes: [{ id: '1', name: 'Frame' }] },
        { value: '#00ff00', nodes: [{ id: '2', name: 'Button' }] }
      ],
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
    expect(result.colorDrift).toHaveLength(1);
    expect(result.colorDrift[0].value).toBe('#00ff00');
    expect(result.colorDrift[0].nodes[0].name).toBe('Button');
    expect(result.hasDrift).toBe(true);
  });

  it('returns no drift when specs match', () => {
    const design = {
      colors: [{ value: '#ff0000', nodes: [] }],
      fonts: [{ value: { family: 'Inter', size: 16, weight: 400 }, nodes: [] }],
      spacing: [{ value: 8, nodes: [] }, { value: 16, nodes: [] }],
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
