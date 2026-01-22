import { describe, it, expect } from 'bun:test';
import { compareImages } from '../src/compare/visual';

describe('Baseline Tests: Perfect Match', () => {
  it('should return < 5% drift for perfect match (anti-aliasing tolerance)', async () => {
    const figmaUrl = 'file:///mock/figma-perfect.png';
    const liveUrl = 'file:///tests/baselines/perfect-match/expected.html';
    
    const result = await compareImages(figmaUrl, liveUrl, 0.1);
    
    expect(result.diffPercent).toBeLessThan(5);
    expect(result.severity).toBe('low');
  });
});
