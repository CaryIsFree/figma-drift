import type { FigmaNode } from './api.js';
import type { DesignSpecs, FontSpec, SpecItem } from '../types.js';
import { rgbaToHex } from '../lib/utils.js';

type ValueMap<T> = Map<string, { value: T; nodes: { id: string; name: string }[] }>;

export function extractDesignSpecs(node: FigmaNode): DesignSpecs {
  const colors: ValueMap<string> = new Map();
  const fonts: ValueMap<FontSpec> = new Map();
  const spacing: ValueMap<number> = new Map();

  traverseNode(node, colors, fonts, spacing);

  return {
    colors: mapToSpecItems(colors),
    fonts: mapToSpecItems(fonts),
    spacing: mapToSpecItems(spacing).sort((a, b) => a.value - b.value),
    dimensions: {
      width: node.absoluteBoundingBox?.width ?? 0,
      height: node.absoluteBoundingBox?.height ?? 0,
    },
  };
}

function mapToSpecItems<T>(map: ValueMap<T>): SpecItem<T>[] {
  return Array.from(map.values());
}

function traverseNode(
  node: FigmaNode,
  colors: ValueMap<string>,
  fonts: ValueMap<FontSpec>,
  spacing: ValueMap<number>
): void {
  if (!node) return;

  const nodeInfo = {
    id: node.id ?? `node-${Date.now()}-${Math.random()}`,
    name: node.name ?? 'Unnamed Node'
  };

  if (node.fills) {
    for (const fill of node.fills) {
      if (fill.type === 'SOLID' && fill.color) {
        const hex = rgbaToHex(fill.color);
        addToMap(colors, hex, hex, nodeInfo);
      }
    }
  }

  if (node.style) {
    const { fontFamily, fontSize, fontWeight } = node.style;
    if (fontFamily && fontSize) {
      const font: FontSpec = {
        family: fontFamily,
        size: fontSize,
        weight: fontWeight ?? 400,
      };
      const key = `${font.family}-${font.size}-${font.weight}`;
      addToMap(fonts, key, font, nodeInfo);
    }
  }

  if (node.paddingLeft !== undefined) addToMap(spacing, String(node.paddingLeft), node.paddingLeft, nodeInfo);
  if (node.paddingRight !== undefined) addToMap(spacing, String(node.paddingRight), node.paddingRight, nodeInfo);
  if (node.paddingTop !== undefined) addToMap(spacing, String(node.paddingTop), node.paddingTop, nodeInfo);
  if (node.paddingBottom !== undefined) addToMap(spacing, String(node.paddingBottom), node.paddingBottom, nodeInfo);
  if (node.itemSpacing !== undefined) addToMap(spacing, String(node.itemSpacing), node.itemSpacing, nodeInfo);

  if (node.children) {
    for (const child of node.children) {
      traverseNode(child, colors, fonts, spacing);
    }
  }
}

function addToMap<T>(
  map: ValueMap<T>,
  key: string,
  value: T,
  nodeInfo: { id: string; name: string }
): void {
  if (!map.has(key)) {
    map.set(key, { value, nodes: [] });
  }
  map.get(key)!.nodes.push(nodeInfo);
}
