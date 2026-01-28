# Changelog
All notable changes to Figma Drift project.

---

## 2026-01-27

### Changed
- **Omitted Bun**: Fully removed Bun as a dependency from the project.
  - Updated all documentation (README.md, PROJECT_STATUS.md) to use npm/Node.js commands.
  - Migrated CLI and Backend tests from `bun:test` to `vitest`.
  - Updated test runner scripts in `package.json`.
  - Updated ESLint 9 configuration to include all packages.
  - Removed Bun-specific lockfile from `.gitignore`.
- **Added Pricing Test**: Created a custom pricing page fixture to verify generalizability of drift detection.
- **Final Codebase Cleanup**:
  - Removed root `tasks.md`, `test-page.html`, and `tests/` directory (redundant).
  - Moved demonstration images to `docs/images/`.
  - Resolved all remaining lint warnings in backend core.
  - Enhanced README with a visual comparison demo.

### Added
- `test-fixtures/pricing.html`: Custom implementation of the Figma pricing design.
- `docs/images/`: Storage for demonstration and documentation screenshots.

---

## 2026-01-24

### Fixed
- **Figma 403 Forbidden Error**: Resolved authentication failure by updating `FIGMA_ACCESS_TOKEN` in `packages/backend/.env`
  - Root cause: Invalid/expired Personal Access Token in environment configuration
  - Solution: Updated with valid Figma API token
  - Verified: CLI command successfully generates diff images in `outputs/` directory

---

## 2026-01-23

### Added
- Updated README.md with clarifications about tool scope and diff.png output
- Removed all emojis from README.md
- Updated all build scripts to use npm/tsc instead of bun commands
- Fixed package.json scripts for npm compatibility
- **Code quality refactoring** - Senior-level improvements applied:
  - Custom error classes (DriftError, ScreenshotError, FigmaApiError, ComparisonError, ValidationError, TimeoutError)
  - Structured logging utility with levels (ERROR, WARN, INFO, DEBUG)
  - Centralized configuration constants (timeouts, thresholds, API endpoints)
  - Replaced all magic numbers with named constants
  - Fixed TypeScript strict mode violations (removed `as any`, added proper types)

### Changed
- Migrated root package.json from bun workspaces to npm workspaces syntax
- Updated backend/package.json build script from bun to tsc
- Updated cli/package.json build script from bun to tsc
- Updated backend/package.json scripts for consistency
- **Codebase cleanup** - Removed all test artifacts:
  - Removed `test-fixtures/` directory (HTML fixtures)
  - Removed `outputs/` directory (PNG images)
  - Removed `packages/*/tests/` directories (test files)
  - Removed `npm run serve:fixture` script from package.json
  - Updated README.md to reflect 2-terminal setup (not 3)
  - Cleaned up `.gitignore` entries

### Improved (Second Pass - 2026-01-23)
- **Documentation**: Added JSDoc comments to all public functions in visual.ts
- **Type Safety**: Added explicit return types to all functions
- **Constants**: Moved local constants from visual.ts to lib/constants.ts
  - VISUAL_LABEL_HEIGHT, VISUAL_LABEL_BG_COLOR, VISUAL_LABEL_TEXT_COLOR, VISUAL_PADDING
- **File Structure**: Updated README.md with Code Quality section
- **Cleaned**: All test artifacts and temporary files removed

### Verification
- TypeCheck: PASSED (no TypeScript errors)
- Build: PASSED (all packages compile successfully)
- Documentation: Complete and accurate

### Changed
- Migrated root package.json from bun workspaces to npm workspaces syntax
- Updated backend/package.json build script from bun to tsc
- Updated cli/package.json build script from bun to tsc
- Updated backend/package.json scripts for consistency
- **Codebase cleanup** - Removed all test artifacts:
  - Removed `test-fixtures/` directory (HTML fixtures)
  - Removed `outputs/` directory (PNG images)
  - Removed `packages/*/tests/` directories (test files)
  - Removed `npm run serve:fixture` script from package.json
  - Updated README.md to reflect 2-terminal setup (not 3)
  - Cleaned up `.gitignore` entries

---

## 2026-01-20

### Added
- OUTREACH_GUIDE.md: Comprehensive outreach strategy with 50+ reachable people
- Crossroads decision analysis
- Crossroads-2.md: Detailed Phase 1C requirements

### Changed
- Updated README.md with crossroads references

### Removed
- docs/crossroads.md and docs/crossroads-2.md (decision archived)

---

## 2026-01-19

### Added
- Phase 1B project architecture and documentation completed
- 65+ passing unit tests across entire codebase
- Backend and CLI packages fully functional
- Complete evaluation framework applied (score: 14.5/18, GO WITH CAUTION)

### Changed
- Fixed vitest peer dependency issue in backend
- Resolved multiple Playwright compatibility issues
- Fixed __name undefined error in browser automation
- Fixed Figma API rate limit handling

### Removed
- Bun references from README and package.json (replaced with npm/tsc)
- Project Status section from README.md (redundant with docs/)

---

## 2026-01-20

### Changed
- Removed internal spec docs from git tracking (AGENTS.md, SPEC.md, EVALUATION.md, IMPLEMENTATION.md)
- Files remain locally for AI agent guidance but won't appear on GitHub

---

## 2026-01-19

### Added
- **Phase 1B: Core comparison engine implemented**
  - Figma API client (`packages/backend/src/figma/api.ts`)
  - Spec extraction from Figma nodes (`packages/backend/src/figma/extract.ts`)
  - Playwright screenshot capture (`packages/backend/src/capture/screenshot.ts`)
  - pixelmatch visual diffing (`packages/backend/src/compare/visual.ts`)
  - Spec comparison logic (`packages/backend/src/compare/specs.ts`)
  - Compare orchestrator (`packages/backend/src/compare/index.ts`)
  - Hono HTTP server with `/api/compare` endpoint (`packages/backend/src/server.ts`)
  - CLI client with `check` command (`packages/cli/src/cli.ts`)
  - Unit tests for URL parsing, spec extraction, and comparison
  - Shared utilities and barrel exports

- **Phase 1A: ICP + Architecture** subphase in framework
  - Ensures MVT → MVP architecture continuity before building
  - Prevents "build MVT, get presales, can't build MVP" trap
- Hybrid architecture: CLI + Backend (MVT) → Figma Plugin + Same Backend (MVP)
- Monorepo structure with `packages/backend`, `packages/cli`, `packages/figma-plugin`
- Product ladder documentation (MVT → MVP → MLP → MMP)

### Changed
- Complete rewrite of SPEC.md for Drift Detection (was FigmaExport)
- Updated phase-0-complete-framework.md with Phase 1A
- Relettered Phase 1 subphases: 1A, 1B, 1C

### Removed
- Deleted `docs/` folder contents (FigmaExport artifacts)
- Deleted old evaluation files (superseded by EVALUATION.md)

---

## 2026-01-17

### Added
- Initial SPEC.md created for FigmaExport (now superseded)
- Phase 0 evaluation framework
