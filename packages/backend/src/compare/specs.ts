import type { DesignSpecs, LiveSpecs, FontSpec, SpecItem } from '../types';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result || !result[1] || !result[2] || !result[3]) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return { r, g, b };
}

function colorDistance(c1: string, c2: string): number {
  const rgb1 = hexToRgb(c1);
  const rgb2 = hexToRgb(c2);
  
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  return dist; // Max 441.75 (√255² * 3)
}

const COLOR_TOLERANCE = 15; // Threshold for "visually identical" (DeltaE ~2000)

export interface SpecDiffResult {
  colorDrift: SpecItem<string>[];
  fontDrift: SpecItem<FontSpec>[];
  spacingDrift: SpecItem<number>[];
  hasDrift: boolean;
}

export function compareSpecs(
  design: DesignSpecs,
  live: LiveSpecs
): SpecDiffResult {
  const colorDrift = findMissingColors(design.colors, live.colors);
  const fontDrift = findMissingFonts(design.fonts, live.fonts);
  const spacingDrift = findMissingSpacing(design.spacing, live.spacing);

  return {
    colorDrift,
    fontDrift,
    spacingDrift,
    hasDrift: colorDrift.length > 0 || fontDrift.length > 0 || spacingDrift.length > 0,
  };
}

function findMissingColors(design: SpecItem<string>[], live: string[]): SpecItem<string>[] {
  const liveLowerSet = new Set(live.map((c) => c.toLowerCase()));
  return design.filter((item) => {
    if (liveLowerSet.has(item.value.toLowerCase())) {
      return false;
    }
    for (const liveColor of live) {
      const dist = colorDistance(item.value, liveColor);
      if (dist <= COLOR_TOLERANCE) {
        return false;
      }
    }
    return true;
  });
}

function findMissingFonts(design: SpecItem<FontSpec>[], live: FontSpec[]): SpecItem<FontSpec>[] {
  return design.filter((item) => {
    const df = item.value;
    return !live.some(
      (lf) =>
        lf.family.toLowerCase() === df.family.toLowerCase() &&
        Math.abs(lf.size - df.size) < 2 &&
        lf.weight === df.weight
    );
  });
}

function findMissingSpacing(design: SpecItem<number>[], live: number[]): SpecItem<number>[] {
  const liveSet = new Set(live);
  return design.filter((item) => {
    const ds = item.value;
    return !liveSet.has(ds) && !live.some((ls) => Math.abs(ls - ds) <= 2);
  });
}
