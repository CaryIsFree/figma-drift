# Crossroads: Untested Edge Cases & Known Concerns

> Last Updated: January 20, 2026
> Honest documentation of limitations and unverified functionality

---

## Untested Figma URL Formats

We successfully tested `/design/` format URLs during Phase 1B. However, the following Figma file types have been added to the parser **without end-to-end validation**:

| Format | Parser Status | Known Limitations |
|---------|---------------|-----------------|
| `/site/` | ✅ Supported (added to regex) | API behavior may differ from `/design/` |
| `/slides/` | ✅ Supported (added to regex) | Designed for presentations, not component design |
| `/figjam/` | ✅ Supported (added to regex) | Collaborative whiteboards, not individual UI components |
| `/buzz/` | ✅ Supported (added to regex) | Team brainstorming, not structured design files |
| `/make/` | ✅ Supported (added to regex) | Diagramming tool, not UI design |

### What This Means

**These formats parse correctly** and extract file keys, but:

1. **Different API endpoints may be used** — Sites, slides, and figjam files may not support `/files/{key}/nodes` the same way design files do
2. **Node-id formats could differ** — These products might structure node-ids differently
3. **Figma Variables API unavailable for free tier** — `/site/` files rely on token-based variables which may not be accessible
4. **Rate limits may vary** — Different file types may have different rate limits

### Recommendation for Testing

**Before using these formats with a customer's project:**

- Ask them: "Which Figma file type is this? (design, site, slides, figjam, buzz, make?)"
- Verify the URL structure matches our expected pattern
- Expect potential API differences (rate limits, endpoint behavior)
- Have a fallback plan: "If `/site/` doesn't work with our current parser, we can investigate"

---

## Dimension Edge Cases

**What we tested:** Figma frame at 466×191 pixels.

**Untested scenarios:**

| Scenario | Risk | Notes |
|----------|------|-------|
| Very large frames (5000×5000+) | 🟡 MEDIUM | Playwright timeout, pixelmatch performance, memory limits |
| Very wide frames (2000×10+) | 🟡 MEDIUM | Similar to above, may crop diff to tiny region |
| Very narrow frames (<100×50) | 🟡 MEDIUM | Screenshot may be grainy at small size |
| Zero-dimension frames (0×0 or missing) | 🔴 HIGH | Parser will throw error or return 0×0 |
| Non-integer dimensions (e.g., 467.5×191.5) | 🟡 LOW | Math.ceil rounds to 468×192, may cause minor pixel alignment issues |

### Recommendation

- **Reject invalid dimensions**: Before starting comparison, validate that both images have width > 0 and height > 0
- **Document in README**: Explain what dimensions are supported/recommended

---

## Live Site Edge Cases

**What we tested:** Static HTML fixture (`test-fixtures/brand-card.html`).

**Untested scenarios:**

| Scenario | Risk | Notes |
|----------|------|-------|
| Dynamic/JavaScript sites | 🟡 MEDIUM | May not render immediately (wait for JS) or have dynamic content loaded after initial HTML |
| SPA frameworks (React, Vue, Angular) | 🟡 MEDIUM | Client-side routing may delay page ready, Playwright may capture loading state instead of final render |
| Authentication-gated pages | 🔴 HIGH | Playwright will capture login screen or redirect instead of protected content |
| Dark mode toggles | 🟡 LOW | Screenshot may not reflect user's theme preference |
| Mobile-first sites (responsive) | 🟡 LOW | Viewport is 466×191 (desktop) but mobile may render at different aspect ratio |
| Lazy-loaded images | 🟡 LOW | Playwright may capture before image loads |
| Infinite scroll/parallax | 🟡 MEDIUM | Playwright may capture mid-scroll instead of full page |
| WebSockets/push notifications | 🟡 MEDIUM | `networkidle` may never fire (always waiting) |

### Recommendation

**For dynamic sites**, consider adding a wait delay after page load:

```typescript
await page.goto(url, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1000); // Wait for dynamic content
```

---

## Rate Limit Reality Check

**Our experience:** 6 requests/month free tier limit is harsh.

**Real-world usage pattern:**
- Daily QA check: 10 requests/day
- Design iteration: 5-10 requests/day
- Production builds: 5-10 requests/day
- **Total: ~25 requests/day, 750 requests/month**

**What happens at 750 requests/month:**
- Free tier blocks immediately with 429 error
- Users would need Dev seat ($15/mo) OR 10 free-tier accounts OR caching

**This is NOT viable for production.** Presales expecting daily use will hit rate limits within their first week.

### Honest Recommendation

**For presales, be transparent:**

> "The free tier allows 6 Figma API requests per month. For design teams making frequent updates and daily QA checks, this may be insufficient for ongoing use. We recommend upgrading to a Dev seat ($15/mo) or implementing request caching for regular usage. Alternatively, schedule your drift checks to run during off-hours when rate limits reset."

---

## What Our Tool CAN Do (Clear Capabilities)

### Working
✅ Extracts all design specs from Figma nodes (colors, fonts, spacing, dimensions)
✅ Captures screenshots of any live URL with Playwright
✅ Compares images pixel-by-pixel using pixelmatch
✅ Detects missing colors, fonts, spacing
✅ Returns structured JSON report with drift percentage
✅ Works with any Figma URL that includes node-id
✅ Runs via CLI or can be integrated into CI/CD

### Limitations (What It CAN'T Do)

❌ No per-element annotations on diff images — Can't show user WHICH pixels changed
❌ No "fix this" workflow — Users can't click through from drift report to their live codebase
❌ No multi-frame comparison — Can only compare ONE Figma frame to ONE live URL at a time
❌ No baseline tracking — Can't tell if drift is increasing or decreasing over time
❌ No interactive investigation — Users can't step through analysis of where differences are
❌ No "drift timeline" — Can't see historical drift patterns
❌ No side-by-side viewer — Can't click "compare with this version" or see what code looked like last week

### What This Means

**This is a detection tool, NOT a presales platform.** It tells you something's different but doesn't help you:

- Fix the difference
- Understand what changed
- Prioritize which drifts matter most

**For developers**, this is perfect. For presales, they'd get:
- An automated alert: "Button colors don't match design"
- Actionable data: "Spacing is off by 8px on navbar"

**For non-technical presales, they get:** "9.57% drift detected" with no context.

---

## Known Issues & Gotchas

| Issue | Impact | Workaround | Status |
|--------|---------|------------|--------|
| Playwright first run slow | Browser download, caches after first run | - | RESOLVED |
| Browser reuse on Windows | Fixed with singleton pattern + isConnected check | - | RESOLVED |
| Bun incompatibility | Switched backend to Node.js via npx tsx | - | RESOLVED |
| Image dimension mismatch | Added cropping before pixelmatch | - | RESOLVED |
| `__name` error | Fixed by using string-based page.evaluate | - | RESOLVED |
| `networkidle` hangs | Changed to `domcontentloaded` with 10s timeout | - | RESOLVED |
| **Missing test coverage** | Unverified edge cases | **Added 65 tests** | **RESOLVED (2026-01-22)** |

### Note on Test Coverage
As of January 22, 2026, we have implemented **65 automated tests** that programmatically validate:
- Visual diffing with various image sizes and offsets
- Spec extraction from complex Figma JSON
- API endpoint robustness and error handling
- CLI argument parsing and edge cases
- Full E2E pipeline integration

This test-driven approach significantly reduces the risk of regression and provides a solid foundation for Phase 1C external validation.

---

## Recommendation: Before Presales

**Be honest about the 6-request limit.** Frame it as a constraint:

> "To use this tool effectively in production (daily checks, design iterations), you'll need a Dev seat ($15/mo) which provides 10 requests/minute. Alternatively, we can implement request caching to reduce API usage."

---

## Notes

- All untested items listed here should be validated with real customer projects before promising in presales
- Documentation should be updated to reflect these limitations once validated
- Consider adding an `--experimental` flag to enable features that haven't been production-tested
