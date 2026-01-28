# SPEC.md - Figma Drift Detection

> **Lean spec for 8-10 hrs/week founder with AI leverage**
> Last Updated: January 19, 2026

---

## 1. What We're Building

**Figma Drift** detects visual differences between Figma designs and live implementations.

**One-Liner:** Know when your site doesn't match the design—before users do.

---

## 2. Product Ladder

| Phase | Form Factor | Purpose |
|-------|-------------|---------|
| **MVT** | CLI + Backend | Prove core logic works (your env + ICP env) |
| **MVP** | Figma Plugin (wraps backend) | Ship to presale customers |
| **MLP** | Figma Plugin (polished) | Make it lovable |
| **MMP** | Figma Plugin (scalable) | Public launch |

**Critical Architecture Decision:** The backend is the shared core. MVT CLI and MVP Plugin are just different clients calling the same backend.

```
MVT:                              MVP/MLP/MMP:
┌─────────┐                       ┌──────────────┐
│   CLI   │ ──┐                   │ Figma Plugin │ ──┐
└─────────┘   │                   └──────────────┘   │
              ▼                                      ▼
        ┌───────────────────────────────────────────────┐
        │              SHARED BACKEND                    │
        │  - Figma API extraction                       │
        │  - Playwright screenshot                      │
        │  - pixelmatch diffing                         │
        │  - JSON report generation                     │
        └───────────────────────────────────────────────┘
```

**Why this matters:** Figma plugins can't run Playwright (sandbox). Backend is required for MVP. Building it in MVT means zero rebuild for MVP.

---

## 3. Target User (ICP)

**Primary:** Solo developer or small team (2-5) shipping design-heavy products.

- Uses Figma for design
- Deploys to Vercel/Netlify/similar
- Wants automation, hates manual QA
- Budget: $20-50/mo

**Anti-target:** Enterprise with dedicated QA team (they have Applitools).

---

## 4. MVT Scope (4-6 weeks at 8-10 hrs/week)

### In Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| Backend API | Single endpoint: POST /compare | P0 |
| Figma extraction | Colors, fonts, spacing from REST API | P0 |
| Screenshot capture | Playwright headless on server | P0 |
| Visual diff | pixelmatch overlay output | P0 |
| JSON response | { driftPercent, diffImageUrl, specs } | P0 |
| CLI client | `npx figma-drift check` calls backend | P0 |

### Out of Scope (MVT)

- Figma plugin UI (that's MVP)
- Auth / user accounts
- Historical tracking
- Team features
- GitHub Action
- Token/variable extraction (Enterprise API)

**Why:** Prove the core comparison works. Plugin UI is just a skin on top.

---

## 5. Technical Architecture

### Backend (Core Engine)

```
POST /api/compare
Request:  { figmaUrl: string, liveUrl: string }
Response: { driftPercent: number, diffImageUrl: string, specs: {...} }

┌─────────────────────────────────────────────────────┐
│                  BACKEND SERVICE                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. EXTRACT          2. CAPTURE         3. COMPARE  │
│  ┌──────────┐        ┌──────────┐       ┌────────┐  │
│  │ Figma    │        │Playwright│       │pixelmatch│
│  │ REST API │        │ (server) │       │ + spec  │
│  └──────────┘        └──────────┘       │  diff   │
│       │                   │             └────────┘  │
│       ▼                   ▼                  │      │
│  design.json         live.png           report.json │
│                                          diff.png   │
└─────────────────────────────────────────────────────┘
```

### File Structure (Monorepo)

```
figma-drift/
├── packages/
│   ├── backend/            # Core engine (deployed)
│   │   ├── src/
│   │   │   ├── server.ts       # Express/Hono API
│   │   │   ├── figma/
│   │   │   │   ├── api.ts      # Figma REST client
│   │   │   │   └── extract.ts  # Spec extraction
│   │   │   ├── capture/
│   │   │   │   └── screenshot.ts
│   │   │   ├── compare/
│   │   │   │   ├── visual.ts   # pixelmatch
│   │   │   │   └── specs.ts
│   │   │   └── report/
│   │   │       └── output.ts
│   │   └── package.json
│   │
│   ├── cli/                # MVT client
│   │   ├── src/
│   │   │   └── index.ts    # Calls backend API
│   │   └── package.json
│   │
│   └── figma-plugin/       # MVP client (later)
│       ├── src/
│       │   ├── main.ts     # Figma sandbox
│       │   └── ui.tsx      # Plugin UI
│       └── manifest.json
│
├── package.json            # Workspace root
└── turbo.json              # Monorepo tooling
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js 20+, Hono (lightweight) |
| Language | TypeScript (strict) |
| Screenshots | Playwright |
| Diffing | pixelmatch |
| CLI | Commander.js |
| Plugin UI | React (later) |
| Hosting | DigitalOcean (student credits) |
| Build | esbuild / tsup |
| Test | Vitest |

---

## 6. Phase 1 Subphases (MVT)

| Phase | Focus | Question | Deliverable |
|-------|-------|----------|-------------|
| **1B** | Your Environment | Can I build it? | Works on YOUR Figma + staging |
| **1C** | External Testing | Does it work for them? | Works on 2+ EXTERNAL projects |
| **2** | Presales | Would you pay? | 5+ "yes" signals or prepayments |

**Framework addition: Phase 1A ensures MVT → MVP continuity.**

| Subphase | Question | Deliverable |
|----------|----------|-------------|
| **1A: ICP + Architecture** | Does MVT architecture support MVP? | This spec (done) |
| **1B: Your Environment** | Can I build it? | CLI + backend works on YOUR Figma/staging |
| **1C: ICP Environment** | Does it work for them? | Works on 2 EXTERNAL users' Figma/staging |

### Phase 1A: ICP + Architecture ✅

**Answered:**
- ICP: Solo dev / small team (2-5), Figma → Vercel/Netlify
- MVT: CLI + Backend
- MVP: Figma Plugin + SAME Backend
- Continuity: ✅ Backend is shared, no rebuild

### Phase 1B: Your Environment (Weeks 1-4)

| Week | Hours | Focus |
|------|-------|-------|
| 1 | 10 | Backend scaffold + Figma API extraction |
| 2 | 10 | Playwright screenshot on server |
| 3 | 10 | pixelmatch + JSON response |
| 4 | 10 | CLI client + test on YOUR project |

**Success Criteria:**
- [ ] `npx figma-drift check --figma=<url> --live=<url>` works
- [ ] Backend deployed (DigitalOcean or local + ngrok)
- [ ] Generates visual diff + spec comparison
- [ ] Tested on your own Figma frame + staging URL

### Phase 1C: ICP Environment (Weeks 5-6)

| Week | Hours | Focus |
|------|-------|-------|
| 5 | 8 | Outreach: find 2-3 testers (Slack, Discord, Twitter) |
| 6 | 8 | Run on their Figma + staging, collect feedback |

**Success Criteria:**
- [ ] Works on 2+ EXTERNAL users' projects
- [ ] Friction points documented

**Kill Criteria:**
- 0 responses after 2 weeks outreach → pivot
- Core logic fails to generalize across 2+ external projects → pivot
- Technical blockers insurmountable → pivot

---

## 7. Core Algorithms

### Spec Extraction (from Figma)

```typescript
interface DesignSpecs {
  colors: string[];           // Hex values
  fonts: { family: string; size: number; weight: number }[];
  spacing: number[];          // Unique padding/margin values
  dimensions: { width: number; height: number };
}
```

Extract from Figma node:
- `fills[0].color` → hex color
- `style.fontFamily`, `fontSize`, `fontWeight`
- `paddingLeft`, `paddingRight`, `itemSpacing`
- `absoluteBoundingBox.width/height`

### Screenshot Capture

```typescript
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ 
  path: 'live.png',
  fullPage: false,
  clip: { x, y, width, height }  // Match Figma frame dimensions
});
```

### Visual Diff

```typescript
const diff = pixelmatch(
  designPixels,
  livePixels, 
  diffOutput,
  width, 
  height,
  { threshold: 0.1 }
);
const driftPercent = (diff / (width * height)) * 100;
```

---

## 8. Constraints

### Time Budget (8-10 hrs/week)

**Total: ~56 hours to validation signal**

### AI Leverage Points

| Task | AI Can Do |
|------|-----------|
| Boilerplate code | Generate API scaffold, Figma client |
| Debugging | Fix Figma API quirks, Playwright issues |
| Outreach | Draft DMs, cold emails |
| Docs | README, usage examples |

### What AI Can't Do

- Find your first users (you do outreach)
- Make product decisions (you decide scope)
- Validate market (only real users can)

---

## 9. Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Figma API rate limits | Low | Cache responses, batch requests |
| Playwright flaky on server | Medium | Use `networkidle`, retry logic, headless config |
| Backend hosting costs | Low | DigitalOcean student credits, local + ngrok for MVT |
| No one responds to outreach | Medium | Try 3 channels before giving up |

---

## 10. Post-MVT Path

```
MVT (CLI + Backend)     Presales          MVP (Figma Plugin)
      ↓                    ↓                      ↓
  Works for you    →   5+ "would pay"   →   Plugin wraps same backend
  Works for 2 ICPs     or prepays           Minimal new code
```

**What changes from MVT → MVP:**
- Add: Figma plugin UI (React iframe)
- Add: Auth (Figma OAuth or API key)
- Keep: Entire backend (zero changes)

**What changes from MVP → MLP → MMP:**
- MLP: Polish UI, fix feedback, improve UX
- MMP: Add team features, historical tracking, billing

---

## 11. Reference

| Doc | Purpose |
|-----|---------|
| `EVALUATION.md` | Phase 0 scoring, market validation |
| `IMPLEMENTATION.md` | Step-by-step build guide for Phase 1B |
| `phase-0-complete-framework.md` | Evaluation criteria reference |
| `docs/CHANGELOG.md` | Version history |
| `docs/PROJECT_STATUS.md` | Current phase and progress |
