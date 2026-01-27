# Component Matching Algorithm

## Overview
The component matcher uses a 6-point heuristic scoring system to identify DOM element most likely to correspond to a Figma frame.

## Scoring Algorithm

### 1. Size Match (3.0 points max)
Prioritizes geometry over styling because dimensions are strongest identity signal.

**Thresholds:**
- **Perfect match** (<10% deviation): 3.0 points
- **Close match** (<30% deviation): 1.5 points
- **Tolerable match** (<50% deviation): 0.5 points
- **No match** (≥50% deviation): 0 points

**Why these thresholds?**
- 10% tolerance accounts for rounding errors in Figma-to-DOM translation
- 30% captures responsive variations while filtering clear mismatches
- 50% is upper bound for any plausible match

### 2. Background Color Match (1.0 point)
If element's backgroundColor matches any Figma color: +1.0 point

### 3. Text Color Match (1.0 point)
If element's color matches any Figma color: +1.0 point

### 4. Text Presence (1.0 point)
If Figma has text AND DOM element has text: +1.0 point

## Confidence Calculation

**Formula**: `confidence = score / 6.0`

**Interpretation:**
- 0.83+ (≥5/6): Excellent match
- 0.50+ (≥3/6): Good match
- 0.30+: Minimum threshold for clipping (see screenshot.ts)

**Why size is weighted 3x higher than color?**
- Geometry is identity: Two elements are "the same button" primarily by size/position
- Styling is mutable: Colors, fonts can change across theming while element remains functionally identical
- Priority: Match layout first, style second

## Edge Cases

**Case 1: Multiple similar elements**
- Algorithm returns highest-scoring match
- Requires human verification for ambiguous cases

**Case 2: No text in Figma**
- Text presence check skipped
- Max score becomes 5.0 instead of 6.0
