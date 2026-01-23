# Drift Detection Test Fixtures

## Purpose
These files are used to validate that the figma-drift MVT can detect code drift between a Figma design and a live implementation.

## Files

### `dialog-card-expected.html`
This is the "correct" implementation that should match the Figma design closely.

### `dialog-card-drifted.html`
This is the "drifted" implementation with INTENTIONAL differences:

| Property | Figma Design | Drifted Implementation | Expected Detection |
|----------|--------------|------------------------|-------------------|
| Padding | 32px | 24px | YES |
| Gap | 24px | 16px | YES |
| Close button position | top: 16px, right: 16px | top: 20px, right: 20px | YES |
| Heading font-weight | 600 | 500 | YES |
| Body text color | #666666 | #888888 | YES |
| Button border-radius | 6px | 4px | YES |
| Button border color | #1a1a1a | #999999 | YES |
| Button padding | 10px 20px | 8px 16px | YES |
| Button font-weight | 500 | 400 | YES |

## How to Test

1. Start a local server:
   ```bash
   cd test-fixtures
   npx serve .
   ```

2. Run the drift check:
   ```bash
   # Test against "correct" implementation (should show LOW drift)
   figma-drift check \
     "https://www.figma.com/design/VUvdiJ5sFBCe8kXEusioqm/Untitled?node-id=1-299" \
     "http://localhost:3000/dialog-card-expected.html" \
     --selector ".dialog-card"

   # Test against "drifted" implementation (should show HIGH drift)
   figma-drift check \
     "https://www.figma.com/design/VUvdiJ5sFBCe8kXEusioqm/Untitled?node-id=1-299" \
     "http://localhost:3000/dialog-card-drifted.html" \
     --selector ".dialog-card"
   ```

## Expected Results

- **Expected HTML**: Should show 2-5% drift (anti-aliasing noise only)
- **Drifted HTML**: Should show 15-40% drift (visible differences detected)

## Figma URL
```
https://www.figma.com/design/VUvdiJ5sFBCe8kXEusioqm/Untitled?node-id=1-299
```
