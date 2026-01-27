import type { DesignSpecs } from '../types.js';
import type { ElementInfo } from './dom-scraper.js';

export interface MatchResult {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  element: ElementInfo;
}

export function matchComponent(
  figmaSpecs: DesignSpecs,
  elements: ElementInfo[]
): MatchResult | null {
  let bestMatch: MatchResult | null = null;
  let maxScore = 0;

  console.log(`[DEBUG] Matching ${elements.length} elements against Figma specs (${figmaSpecs.dimensions.width}x${figmaSpecs.dimensions.height})`);

  for (const el of elements) {
    let score = 0;

    const sizeMatchWidth = Math.abs(el.width - figmaSpecs.dimensions.width) / figmaSpecs.dimensions.width;
    const sizeMatchHeight = Math.abs(el.height - figmaSpecs.dimensions.height) / figmaSpecs.dimensions.height;
    
    if (sizeMatchWidth < 0.1 && sizeMatchHeight < 0.1) {
      score += 3;
    } else if (sizeMatchWidth < 0.3 && sizeMatchHeight < 0.3) {
      score += 1.5;
    } else if (sizeMatchWidth < 0.5 && sizeMatchHeight < 0.5) {
      score += 0.5;
    }

    const figmaColors = new Set(figmaSpecs.colors.map(c => c.value.toLowerCase()));
    if (figmaColors.has(el.backgroundColor.toLowerCase())) score += 1;
    if (figmaColors.has(el.color.toLowerCase())) score += 1;

    const hasFigmaText = figmaSpecs.fonts.length > 0;
    if (hasFigmaText && el.text.length > 0) score += 1;

    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        confidence: score / 6,
        element: el
      };
    }
  }

  if (bestMatch) {
    console.log(`[DEBUG] Best match: ${bestMatch.element.tagName}.${bestMatch.element.className} with confidence ${bestMatch.confidence}`);
  } else {
    console.log(`[DEBUG] No match found`);
  }

  return bestMatch;
}
