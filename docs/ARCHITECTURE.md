# Architecture Documentation

## Coordinate Systems

### Figma (Design Source)
- Uses `absoluteBoundingBox` in points (Figma's internal unit)
- Exports at 2x scale via `/images` endpoint
- Physical pixels = points × 2

### DOM (Live Source)
- Uses `getBoundingClientRect()` returning CSS pixels
- Coordinates include scroll offset: `left + window.scrollX`
- Independent of device scale factor

### Playwright (Capture Layer)
- Browser context configured with `deviceScaleFactor: 2`
- Viewport set to `width × 2` for layout stability
- Clip coordinates in CSS pixels (not physical)

### Pixelmatch (Comparison Layer)
- Receives physical pixel buffers from both sources
- Compares at 2x resolution for high-DPI accuracy
- Returns diff percentage at physical pixel level

## Architecture Decisions

### MVT → MVP Continuity
- Shared backend core serves both CLI and Figma Plugin
- Plugin sandbox cannot run Playwright directly
- Backend API: `/api/compare` endpoint for both clients

### Scaling Strategy
- 2x scaling ensures apples-to-apples comparison
- If changed to 1x: only top-left quarter visible
- Viewport minimums (1280×720) prevent layout shifts
