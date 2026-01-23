import { describe, it, expect } from 'vitest';
import { parseFigmaUrl } from '../src/figma/api';

describe('parseFigmaUrl', () => {
  it('extracts file key from /file/ URL', () => {
    const url = 'https://www.figma.com/file/abc123/MyDesign?node-id=1-2';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('abc123');
    expect(result.nodeId).toBe('1:2');
  });

  it('extracts file key from /design/ URL', () => {
    const url = 'https://www.figma.com/design/xyz789/Test?node-id=10-20';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('xyz789');
    expect(result.nodeId).toBe('10:20');
  });

  it('handles URL without node-id', () => {
    const url = 'https://www.figma.com/file/abc123/MyDesign';
    const result = parseFigmaUrl(url);
    expect(result.fileKey).toBe('abc123');
    expect(result.nodeId).toBeNull();
  });

  it('throws on invalid URL', () => {
    expect(() => parseFigmaUrl('https://google.com')).toThrow();
  });
});
