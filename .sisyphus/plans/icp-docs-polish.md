# Plan: Phase 1C Technical Validation Documentation Polish

## TL;DR

> **Quick Summary**: Prepare the project for external technical validation by neutralizing "sales" language, improving cross-platform reliability, and establishing clear feedback loops for testers.
> 
> **Deliverables**:
> - Pricing-free `SPEC.md` and `PROJECT_STATUS.md` for Phase 1C.
> - High-visibility "30-Second Test" at the top of `README.md`.
> - Platform-specific (PowerShell/CMD/Bash) setup instructions.
> - New `FEEDBACK.md`, `CONTRIBUTING.md`, and GitHub Issue Templates.
> 
> **Estimated Effort**: Small (2-3 hours)
> **Parallel Execution**: YES - Internal docs (SPEC/STATUS) can be updated independently of External docs (README/Templates).
> **Critical Path**: Internal Cleanup → README Restructure → GitHub Infrastructure → Feedback System.

---

## Context

### Original Request
"Modify existing documentation... to make sure our ICP actually understand how to use this thing and other stuff?"

### Interview Summary
**Key Decisions**:
- **Phase Separation**: Strictly separate Technical Validation (1C) from Market Validation (2).
- **Setup Reliability**: Address Windows PowerShell quoting issues in `.env` creation.
- **Jargon Translation**: Map "node-id" and "threshold" to designer-friendly terms.
- **Beta Control**: Create `CONTRIBUTING.md` to prevent premature PRs and clarify beta status.

### Metis Review
**Identified Gaps** (addressed):
- **Hidden Sales Language**: Identified $15/mo references in troubleshooting that needed neutralization.
- **Redundancy Check**: Confirmed `FEEDBACK.md` (successes) and Issue Templates (failures) are distinct and necessary.
- **Windows Edge Cases**: Provided `Set-Content` as the reliable PowerShell alternative for `.env` setup.

---

## Work Objectives

### Core Objective
Transform the repository from a "Personal Project" into a "Tester-Ready Beta" by focusing on technical reliability, ease of use, and structured feedback loops.

### Concrete Deliverables
- `SPEC.md`: Removed payment success criteria from Phase 1C.
- `PROJECT_STATUS.md`: Added "Attempted vs Successful" validation counter.
- `README.md`: Restructured for "30-Second Test" and neutralized pricing language.
- `FEEDBACK.md`: New file for successful run reporting.
- `CONTRIBUTING.md`: New file with Beta status disclaimer.
- `.github/ISSUE_TEMPLATE/*.md`: New templates for structured bug reports.

### Definition of Done
- [x] No mention of $20/mo or payment validation in Phase 1C documentation.
- [x] README shows 30-Second Test immediately after the tagline.
- [x] Windows PowerShell setup command uses `Set-Content`.
- [x] `CONTRIBUTING.md` clearly states PRs are not accepted during beta.

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES
- **User wants tests**: Manual-only (Markdown rendering verification).
- **QA approach**: Verify all internal links, check formatting in a Markdown previewer, and double-check Windows commands for correctness.

---

## Execution Strategy

### Dependency Matrix

| Task | Depends On | Blocks | Can Parallelize With |
|------|------------|--------|---------------------|
| 1. Internal Doc Cleanup | None | None | 2, 3, 4 |
| 2. README Restructure | None | 5 | 1, 3, 4 |
| 3. GitHub Infrastructure | None | None | 1, 2, 4 |
| 4. FEEDBACK.md Creation | None | None | 1, 2, 3 |
| 5. Final Quality Review | 1, 2, 3, 4 | None | None |

---

## TODOs

- [x] 1. Internal Doc Neutralization (SPEC/STATUS)
- [x] 2. README Restructure & Neutralization
- [x] 3. GitHub Infrastructure (Issue Templates & CONTRIBUTING)
- [x] 4. Feedback Survey System (FEEDBACK.md)
- [x] 5. Final Quality Review
  **What to do**:
  - Verify all internal links between README, FEEDBACK, and CONTRIBUTING.
  - Check for any missed sales language using search.

  **Recommended Agent Profile**:
  - **Category**: `unspecified-low`
  - **Skills**: [`markdown`]

---

## Success Criteria

### Verification Commands
```bash
grep -iE "20/mo|15/mo|pay" SPEC.md README.md docs/PROJECT_STATUS.md
# Expected: No hits in Phase 1C sections or troubleshooting
```

### Final Checklist
- [x] "30-Second Test" is the first instructional section.
- [x] Windows PowerShell command is correct.
- [x] No pricing mentioned for testers.
- [x] All feedback loops (Issues, FEEDBACK.md) are clearly linked.

