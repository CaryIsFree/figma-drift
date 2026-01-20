import type { FigmaNode } from './api';
import type { DesignSpecs, FontSpec } from '../types';
import { rgbaToHex, deduplicateFonts } from '../lib/utils';

export function extractDesignSpecs(node: FigmaNode): DesignSpecs {
  const colors = new Set<string>();
  const fonts: FontSpec[] = [];
  const spacing = new Set<number>();

  traverseNode(node, colors, fonts, spacing);

  return {
    colors: Array.from(colors),
    fonts: deduplicateFonts(fonts),
    spacing: Array.from(spacing).sort((a, b) => a - b),
    dimensions: {
      width: node.absoluteBoundingBox?.width ?? 0,
      height: node.absoluteBoundingBox?.height ?? 0,
    },
  };
}

function traverseNode(
  node: FigmaNode,
  colors: Set<string>,
  fonts: FontSpec[],
  spacing: Set<number>
): void {
  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        const hex = rgbaToHex(fill.color);
        colors.add(hex);
      }
    }
  }

  if (node.style) {
    const { fontFamily, fontSize, fontWeight } = node.style;
    if (fontFamily && fontSize) {
      fonts.push({
        family: fontFamily,
        size: fontSize,
        weight: fontWeight ?? 400,
      });
    }
  }

  if (node.paddingLeft !== undefined) spacing.add(node.paddingLeft);
  if (node.paddingRight !== undefined) spacing.add(node.paddingRight);
  if (node.paddingTop !== undefined) spacing.add(node.paddingTop);
  if (node.paddingBottom !== undefined) spacing.add(node.paddingBottom);
  if (node.itemSpacing !== undefined) spacing.add(node.itemSpacing);

  if (node.children) {
    for (const child of node.children) {
      traverseNode(child, colors, fonts, spacing);
    }
  }
}
