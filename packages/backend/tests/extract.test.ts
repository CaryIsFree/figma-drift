import { describe, it, expect } from 'bun:test';
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
    expect(specs.colors).toContain('#ff0000');
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
    expect(specs.spacing).toContain(16);
    expect(specs.spacing).toContain(8);
  });
});
