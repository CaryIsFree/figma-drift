# AGENTS.md - Agentic Coding Guidelines

> **Constraints for AI agents working on this repository**
> Last Updated: 2026-01-19

---

## Project Context

**Product:** Figma Drift Detection - Visual/spec diffing between Figma designs and live implementations.

**Architecture:** Monorepo with shared backend
- `packages/backend` - Core comparison engine (Hono, Playwright, pixelmatch)
- `packages/cli` - CLI client (MVT)
- `packages/figma-plugin` - Figma plugin (MVP/MLP/MMP)

**Key Constraint:** MVT → MVP continuity. Backend is shared core. No architecture rebuild between phases.

---

## 1. Development Commands

### Installation
```bash
# Install dependencies
bun install

# Or with npm
npm install
```

### Build
```bash
# Build all packages
bun run build

# Build specific package
bun run build:backend
bun run build:cli
bun run build:plugin
```

### Testing
```bash
# Run all tests
bun test

# Run single test file (CRITICAL for rapid iteration)
bun test path/to/test.spec.ts

# Run in watch mode
bun test --watch

# Run with coverage
bun test --coverage
```

### Linting
```bash
# Lint all packages
bun run lint

# Lint specific package
bun run lint:backend

# Auto-fix
bun run lint:fix
```

### Type Checking
```bash
# Type check all
bun run typecheck

# Type check specific package
bun run typecheck:backend
```

---

## 2. Code Style Guidelines

### File Organization
```
src/
├── main/          # Entry points (cli.ts, server.ts)
├── lib/           # Pure business logic, no framework deps
├── types/         # Shared TypeScript types
└── utils/          # Utility functions
```

### Imports

**Priority order:**
1. Relative imports for same package
2. Monorepo sibling imports (via alias)
3. External libraries

```typescript
// ✅ GOOD: Relative import (same package)
import { extractSpecs } from './lib/figma/extract';

// ✅ GOOD: Monorepo import (sibling package)
import { compareImages } from '@figma-drift/backend/lib';

// ❌ BAD: Long absolute path
import { compareImages } from '../../../packages/backend/src/lib/compare';
```

### Naming Conventions

| Type | Convention | Example |
|--------|-------------|----------|
| Files | kebab-case | `figma-extractor.ts`, `screenshot-capture.ts` |
| Components | PascalCase | `DiffResult`, `SpecComparison` |
| Functions | camelCase | `extractColors()`, `captureScreenshot()` |
| Constants | UPPER_SNAKE_CASE | `MAX_DIFF_THRESHOLD`, `DEFAULT_TIMEOUT` |
| Types/Interfaces | PascalCase | `DesignSpecs`, `DriftReport` |
| Private members | Leading underscore | `_cache`, `_parseInternal()` |

### Error Handling

**ALWAYS handle errors, never let them bubble uncaught.**

```typescript
// ✅ GOOD: Explicit error handling
export async function extractSpecs(url: string): Promise<DesignSpecs> {
  try {
    const response = await fetch(url);
    return response.json();
  } catch (error) {
    if (error instanceof NetworkError) {
      throw new ExtractionError(`Failed to fetch specs: ${error.message}`, { cause: error });
    }
    throw error;
  }
}

// ❌ BAD: Uncaught errors
export async function extractSpecs(url: string): Promise<DesignSpecs> {
  const response = await fetch(url); // Could throw
  return response.json();
}
```

**Error types:** Create domain-specific error types.

```typescript
class ExtractionError extends Error {
  constructor(message: string, options?: { cause?: Error }) {
    super(message, options);
    this.name = 'ExtractionError';
  }
}
```

### TypeScript Configuration

```typescript
// tsconfig.json (root)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Rules:**
- ✅ Use `interface` for public API contracts
- ✅ Use `type` for union types, function signatures
- ✅ Always provide explicit return types (no `any`)
- ❌ No `as any` or `@ts-ignore` (violates hard constraint)

### Async/Await

```typescript
// ✅ GOOD: Explicit error handling
async function process(): Promise<void> {
  try {
    await riskyOperation();
  } catch (error) {
    logger.error('Failed:', error);
    throw;
  }
}

// ❌ BAD: Silent failures
async function process(): Promise<void> {
  await riskyOperation(); // Error swallowed
}
```

### Constants & Configuration

```typescript
// ✅ GOOD: Centralized constants
// src/lib/constants.ts
export const FIGMA_API_BASE = 'https://api.figma.com/v1';
export const SCREENSHOT_TIMEOUT = 30000;
export const PIXELMATCH_THRESHOLD = 0.1;

// ❌ BAD: Magic numbers scattered
await page.goto(url, { timeout: 30000 });
const diff = pixelmatch(img1, img2, null, width, height, { threshold: 0.1 });
```

---

## 3. Git Etiquette

### Commit Messages
```bash
# Format: <scope>: <description>

feat(backend): add Figma API client
fix(cli): handle missing URL argument
test(backend): add screenshot capture unit tests
docs: update SPEC.md architecture diagram
refactor(extract): simplify spec parsing logic
```

**Never commit:**
- `node_modules/`
- `dist/` (unless explicitly intended)
- `.env` files
- Test logs or screenshots
- Editor configs (`.vscode/`, `.idea/`)

### Branch Workflow
```bash
# Create feature branch
git checkout -b feature/screenshot-capture

# Commit frequently
git add .
git commit -m "feat(capture): implement Playwright screenshot"

# Push to remote
git push -u origin feature/screenshot-capture

# PR naming: feature/screenshot-capture
```

### Pull Request Requirements
```markdown
## Description
Brief description of change

## Type
- [ ] Bug fix
- [ ] Feature
- [ ] Refactor
- [ ] Tests
- [ ] Docs

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] All tests passing

## Checklist
- [ ] Lints pass
- [ ] Types check pass
- [ ] No `any` or `@ts-ignore`
- [ ] Documentation updated (if needed)
```

---

## 4. QA Guidelines

### Test Coverage
- **Minimum:** 80% coverage for critical paths
- **Target:** 90%+ for `packages/backend/lib/`

### Test Categories
```typescript
// Unit tests: Pure logic, no external deps
describe('extractSpecs', () => {
  it('parses colors correctly', () => {
    const input = { fills: [{ color: { r: 0, g: 0, b: 0, a: 1 }] };
    const result = extractSpecs(input);
    expect(result.colors).toEqual(['#000000']);
  });
});

// Integration tests: Real API calls, mocked Playwright
describe('Figma API integration', () => {
  it('fetches frame specs', async () => {
    const result = await fetchFrameSpecs(VALID_FRAME_URL);
    expect(result).toBeDefined();
  });
});
```

### Test Naming
```typescript
// Format: <unit>_<expected_behavior>
describe('screenshotCapture', () => {
  it('captures page screenshot successfully', async () => { });
  it('throws error on invalid URL', async () => { });
  it('times out after 30s', async () => { });
});
```

### Manual Testing Checklist
Before marking a task complete:
- [ ] Run affected unit tests
- [ ] Run integration tests
- [ ] Manual smoke test on local backend
- [ ] Verify `bun run lint` passes
- [ ] Verify `bun run typecheck` passes
- [ ] Test with a real Figma URL (if applicable)

---

## 5. DigitalOcean CLI Commands

**You have student developer pack. Use these commands.**

### Authentication
```bash
# Login (do once)
doctl auth init

# Verify authentication
doctl account get
```

### App Platform (for backend deployment)
```bash
# List existing apps
doctl apps list

# Create new app (from GitHub)
doctl apps create --spec .do/app.yaml

# View app logs
doctl apps logs <app-id>

# Deploy to existing app
doctl apps deploy <app-id> --build-dir=dist/backend
```

### App Spec Template (.do/app.yaml)
```yaml
name: figma-drift-backend
region: nyc3
services:
  - name: backend
    source_dir: ./packages/backend
    github:
      repo: XeroS/figma-drift
      branch: main
      deploy_on_push: true
    envs:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
    instance_count: 1
    instance_size_slug: basic-xxs
    run_command: bun start
```

### Databases (if needed later)
```bash
# Create PostgreSQL database
doctl databases create figma-drift-db --engine pg --version 15 --region nyc3

# List databases
doctl databases list

# Get connection string
doctl databases connection <db-id>
```

---

## 6. Automated Project Documentation

### README.md Updates
After significant changes, update:
- [ ] Installation instructions
- [ ] Usage examples
- [ ] Environment variables
- [ ] Deployment steps

### docs/PROJECT_STATUS.md Updates
After completing each phase:
```markdown
| Phase | Status | Notes |
|-------|--------|-------|
| **1B: Your Environment** | ✅ Complete | Backend deployed to DigitalOcean |
```

### docs/CHANGELOG.md Updates
Format:
```markdown
## YYYY-MM-DD

### Added
- Feature description

### Changed
- Updated existing feature

### Fixed
- Bug description
```

---

## 7. Critical Constraints (HARD BLOCKS)

**NEVER violate these:**

1. **Type safety:** No `as any`, `@ts-ignore`, `@ts-expect-error`
2. **Build artifacts:** Never commit `dist/`, `node_modules/`, `.env`
3. **Secrets:** Never commit API keys, Figma tokens, database URLs
4. **Breaking changes:** Document in CHANGELOG.md before merging
5. **Dependencies:** Run `bun audit` before installing new packages

### When You're Blocked

If stuck on:
- **API issues:** Check DigitalOcean status, rate limits, network
- **Playwright issues:** Test locally first, check browser version
- **Type errors:** Review tsconfig.json, check for circular deps
- **Test failures:** Run single test file with `--watch`, debug locally

**Ask before:** Spending >30 minutes on a single blocker.

---

## 8. Agentic Workflow

When asked to implement a feature:

1. **Read spec** - Check `SPEC.md` for architecture context
2. **Plan** - Identify affected packages (`backend`, `cli`, `plugin`)
3. **Implement** - Follow code style guidelines
4. **Test** - Add/verify tests before marking done
5. **Lint/Typecheck** - Run both before committing
6. **Document** - Update relevant docs if needed

**Stop at:** Lint errors, type errors, or failing tests.

**Never push:** Broken builds, `console.log` left in production code, TODOs without tracking issues.
