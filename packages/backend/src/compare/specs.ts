import type { DesignSpecs, LiveSpecs, FontSpec } from '../types';

export interface SpecDiffResult {
  colorDrift: string[];
  fontDrift: FontSpec[];
  spacingDrift: number[];
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

function findMissingColors(design: string[], live: string[]): string[] {
  const liveLowerSet = new Set(live.map((c) => c.toLowerCase()));
  return design.filter((c) => !liveLowerSet.has(c.toLowerCase()));
}

function findMissingFonts(design: FontSpec[], live: FontSpec[]): FontSpec[] {
  return design.filter((df) => {
    return !live.some(
      (lf) =>
        lf.family.toLowerCase() === df.family.toLowerCase() &&
        Math.abs(lf.size - df.size) < 2 &&
        lf.weight === df.weight
    );
  });
}

function findMissingSpacing(design: number[], live: number[]): number[] {
  const liveSet = new Set(live);
  return design.filter((ds) => {
    return !liveSet.has(ds) && !live.some((ls) => Math.abs(ls - ds) <= 2);
  });
}
