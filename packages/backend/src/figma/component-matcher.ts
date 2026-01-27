import type { DesignSpecs } from '../types.js';
import type { ElementInfo } from './dom-scraper.js';
import {
  SIZE_TOLERANCE_PERFECT,
  SIZE_TOLERANCE_CLOSE,
  SIZE_TOLERANCE_TOLERABLE,
  SIZE_MATCH_PERFECT_SCORE,
  SIZE_MATCH_CLOSE_SCORE,
  SIZE_MATCH_TOLERABLE_SCORE,
  BACKGROUND_COLOR_MATCH_SCORE,
  TEXT_COLOR_MATCH_SCORE,
  TEXT_PRESENCE_SCORE,
  MAX_MATCH_SCORE,
} from '../lib/constants.js';

export interface MatchResult {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  element: ElementInfo;
}

/**
 * Matches DOM elements to Figma specs using heuristic scoring.
 *
 * Scoring breakdown (max 6.0 points):
 * - Size match: 3.0 points (primary signal)
 * - Background color: 1.0 point
 * - Text color: 1.0 point
 * - Text presence: 1.0 point
 *
 * @param figmaSpecs - Figma design specs to match against
 * @param elements - Scraped DOM elements to evaluate
 * @returns Best matching element with confidence score, or null if no match
 */
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

    // Size is primary identity signal: geometry is less mutable than styling
    // Scoring thresholds: capture rounding errors, responsive variations, but filter clear mismatches
    if (sizeMatchWidth < SIZE_TOLERANCE_PERFECT && sizeMatchHeight < SIZE_TOLERANCE_PERFECT) {
      score += SIZE_MATCH_PERFECT_SCORE; // 3.0: Perfect size match
    } else if (sizeMatchWidth < SIZE_TOLERANCE_CLOSE && sizeMatchHeight < SIZE_TOLERANCE_CLOSE) {
      score += SIZE_MATCH_CLOSE_SCORE; // 1.5: Close size match (responsive)
    } else if (sizeMatchWidth < SIZE_TOLERANCE_TOLERABLE && sizeMatchHeight < SIZE_TOLERANCE_TOLERABLE) {
      score += SIZE_MATCH_TOLERABLE_SCORE; // 0.5: Tolerable size match
    }

    const figmaColors = new Set(figmaSpecs.colors.map(c => c.value.toLowerCase()));
    if (figmaColors.has(el.backgroundColor.toLowerCase())) score += BACKGROUND_COLOR_MATCH_SCORE;
    if (figmaColors.has(el.color.toLowerCase())) score += TEXT_COLOR_MATCH_SCORE;

    const hasFigmaText = figmaSpecs.fonts.length > 0;
    if (hasFigmaText && el.text.length > 0) score += TEXT_PRESENCE_SCORE;

    if (score > maxScore) {
      maxScore = score;
      bestMatch = {
        x: el.x,
        y: el.y,
        width: el.width,
        height: el.height,
        // Normalize to 0-1 range: 6.0 is max possible score (3 size + 1 bg + 1 color + 1 text)
        confidence: score / MAX_MATCH_SCORE,
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
