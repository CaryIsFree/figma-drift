export function rgbaToHex(color: { r: number; g: number; b: number; a: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function rgbStringToHex(rgb: string): string {
  const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgb;
  const r = parseInt(match[1] ?? '0');
  const g = parseInt(match[2] ?? '0');
  const b = parseInt(match[3] ?? '0');
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function deduplicateFonts<T extends { family: string; size: number; weight: number }>(fonts: T[]): T[] {
  const seen = new Set<string>();
  return fonts.filter((font) => {
    const key = `${font.family}-${font.size}-${font.weight}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
