import { describe, it, expect } from 'vitest';
import { extractDesignSpecs } from '../src/figma/extract';

describe('extractDesignSpecs', () => {
  it('extracts colors from fills', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      fills: [{ type: 'SOLID', color: { r: 1, g: 0, b: 0, a: 1 } }],
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    };

    const specs = extractDesignSpecs(node);
    expect(specs.colors).toHaveLength(1);
    expect(specs.colors[0].value).toBe('#ff0000');
    expect(specs.colors[0].nodes[0].id).toBe('1');
  });

  it('extracts dimensions', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      absoluteBoundingBox: { x: 0, y: 0, width: 200, height: 150 },
    };

    const specs = extractDesignSpecs(node);
    expect(specs.dimensions.width).toBe(200);
    expect(specs.dimensions.height).toBe(150);
  });

  it('extracts spacing from padding', () => {
    const node = {
      id: '1',
      name: 'Frame',
      type: 'FRAME',
      paddingLeft: 16,
      paddingRight: 16,
      itemSpacing: 8,
      absoluteBoundingBox: { x: 0, y: 0, width: 100, height: 100 },
    };

    const specs = extractDesignSpecs(node);
    const values = specs.spacing.map(s => s.value);
    expect(values).toContain(16);
    expect(values).toContain(8);
  });
});
