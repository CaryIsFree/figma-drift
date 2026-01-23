# Crossroads 2: The Presales Gap (Phase 1B Analysis)

> **Objective:** Identify exactly what is missing from the current MVT (Phase 1B) that prevents a "Shut up and take my money" reaction from our Ideal Customer Profile (IPC).

---

## The Persona: "Alex" (Engineering Lead)
*   **Context:** Series B Startup. 10 Engineers. 2 Designers.
*   **Pain:** "Designers keep slacking me screenshots of pixels that are off. Developers ignore them because 'it looks fine to me'."
*   **Goal:** Automate the "Design QA" step so they can ship faster.

---

## The MVT Experience (Current State)

Alex runs:
```bash
figma-drift check <figma-url> <staging-url>
```

**Result:**
```
Drift Detected! (9.57%)
- Colors missing: #FF0000
- Fonts missing: Inter 16px
```

### Why Alex WON'T Pay Yet (The Gap)

#### 1. "It's comparing Apples to Oranges" (The Scale Mismatch)
*   **The Problem:** Alex points it at `staging.app.com/dashboard`. The Figma file is just the "User Card" component.
*   **The Result:** 99% Drift. The tool compared a 300px card to a 1920px dashboard.
*   **The Reaction:** "This tool is dumb. It doesn't know *where* the component is."
*   **The Presale Killer:** Alex closes the terminal. **Trust is lost in 5 seconds.**
*   **Phase 1B Fix:** We MUST support `--selector ".user-card"`. It changes the experience from "Broken" to "Precision Surgical Tool".

#### 2. "Okay, it's different. Now what?" (The Actionability Gap)
*   **The Problem:** The tool says `#FF0000` is missing.
*   **The Result:** Alex has to manually grep their codebase for the wrong color.
*   **The Reaction:** "I'm still doing the work. I just have a robot yelling at me now."
*   **The Presale Killer:** The tool creates *anxiety*, not *solutions*.
*   **Phase 1B Fix:** We can't fix the code (Phase 2), but we CAN be specific. "Missing #FF0000 (Found in Figma Node: 'Submit Button')." *We implemented this in the recent Ralph Loop, so this gap is closing.*

#### 3. "I can't run this on my React App" (The Auth/State Gap)
*   **The Problem:** Alex's app is behind a login or is a fast-loading SPA.
*   **The Result:** Screenshot captures the "Loading..." spinner or the "Please Login" screen.
*   **The Reaction:** "It only works on static marketing pages? Useless for my product."
*   **The Presale Killer:** It fails the "Real World" test immediately.
*   **Phase 1B Fix:** Add `--delay` (simple) and `--headers "Cookie=session=..."` (medium). Without these, we effectively target 0% of SaaS apps.

---

## The "Presales" Roadmap (How to get the Check)

To convert Alex from "Curious" to "Customer" in Phase 1B, we must move from **"Drift Detection"** to **"Component Verification"**.

### The Winning Pitch (MVT+)
> "Don't check your whole site. Check your **Critical Paths**."

**The Command that Sells:**
```bash
figma-drift check <figma-btn-url> <live-url> --selector "#submit-btn" --threshold 0.05
```

**The Output that Sells:**
```
✅ VISUAL PASS: Button matches Design (99.8% accuracy)
❌ SPEC FAIL:
   - Wrong Color: Found #CC0000, Expected #FF0000
   - Context: Used on 'Submit Button' (Figma) vs '#submit-btn' (Live)
```

### Immediate Action Items (The Bridge to Presales)

| Feature | Effort | Impact on Presale | Why? |
|---------|--------|-------------------|------|
| **Selector Flag** | Low | 🚨 CRITICAL | Prevents "Apples to Oranges" comparison. Essential for trust. |
| **Delay/Wait** | Low | 🔴 HIGH | Allows testing of React/Vue apps (SPAs) without "Loading..." ghosts. |
| **Auth Headers** | Med | 🟡 MEDIUM | Allows testing behind login (Session Cookies). |
| **Diff Image** | Low | 🟢 LOW | "Show me the picture." (Already partially done). |

---

---

## Conclusion (Updated January 22, 2026)
The MVT has evolved from a technology demo into a **robust technical foundation**. 

With implementation of **comprehensive testing (90 tests)** and migration to **Vitest** for Playwright compatibility, we have addressed technical debt and are ready for external validation.

**Current Status:**
- **Technical Foundation:** ✅ SOLID (90 tests, 0 failures, 24 skipped when no token)
- **Playwright Compatible:** ✅ YES (migrated from bun:test to vitest)
- **Next Step:** 🚀 Phase 1C External Validation

We are now ready to adapt our tool to fit the site of external testers and collect the "Would you pay?" signal with confidence.
