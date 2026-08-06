# Decision Log

Record user-approved product, design and architectural decisions here. Do not erase prior decisions; supersede them with a new entry.

## Template

### DEC-000 — Decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Approved / Rejected / Superseded
- **Owner:**
- **Related phase:**
- **Context:**
- **Options considered:**
- **Decision:**
- **Why:**
- **Consequences:**
- **Files/contracts to update:**
- **Tests/evidence required:**
- **Supersedes:** None

---

## DEC-001 — Wide-screen shell strategy

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 00 / Phase 04
- **Context:** Existing design documentation preserves a centered mobile-sized canvas on wide viewports, while the current UX improvement direction favors a more productive desktop layout.
- **Options considered:** Preserve mobile canvas; fully fluid desktop; hybrid shell.
- **Decision:** Hybrid shell (Option C)—responsive dashboards and settings, constrained reader/focused flows.
- **Why:** It uses desktop space effectively without making devotional reading lines too wide.
- **Consequences:** Requires updates to `docs/DESIGN_SYSTEM.md`, responsive Playwright tests, shell components and screenshots.
- **Tests/evidence required:** Mobile, tablet and desktop viewport matrix; Arabic/English; reader measure; keyboard navigation.
- **Supersedes:** None

---

## DEC-002 — Home primary action design

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 05
- **Context:** The Home screen needs a clear focal point for devotional routine initiation.
- **Options considered:** Multiple equal cards; single dominant CTA with contextual recommendation.
- **Decision:** One contextual Start or Continue primary action card.
- **Why:** Gives each screen one dominant next action, reducing cognitive friction and decision fatigue.
- **Consequences:** HomeScreen CTA hierarchy focus, routine continuation logic.
- **Tests/evidence required:** HomeScreen tests, keyboard tab order, Playwright visual check.
- **Supersedes:** None

---

## DEC-003 — Functional content surface treatment

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 02 / Phase 03
- **Context:** High transparency or heavy background patterns can degrade text legibility for sacred and devotional text.
- **Options considered:** Glassmorphism with heavy transparency; stable opaque surfaces.
- **Decision:** Use stable opaque surfaces for functional reading content.
- **Why:** Guarantees strict WCAG contrast compliance and high legibility across light, dark, and midnight themes.
- **Consequences:** Theme CSS tokens use controlled card opacity/solid surfaces for reading content.
- **Tests/evidence required:** Contrast audits across light/dark/midnight themes.
- **Supersedes:** None

---

## DEC-004 — Reader measure and container width

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 07
- **Context:** Wide text lines cause fatigue when reading long Arabic adhkar or Qur'anic text.
- **Options considered:** Fluid full-screen text width; constrained reading width.
- **Decision:** Constrained reader width (~430px–600px maximum).
- **Why:** Maintains optimal line length (50–75 characters) for devotional focus and calm reading.
- **Consequences:** Reader container remains max-w constrained on tablet and desktop screens.
- **Tests/evidence required:** ReaderScreen responsive layout tests across viewports.
- **Supersedes:** None

---

## DEC-005 — Progress tone and streak framing

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 08
- **Context:** Gamified streak penalties or guilt-inducing warnings conflict with a calm devotional app.
- **Options considered:** Punitive streak resets and loss warnings; supportive and non-punitive progress experience.
- **Decision:** Supportive, encouraging, non-punitive progress framing.
- **Why:** Keeps sacred and devotional reflection peaceful and encouraging without punitive gamification.
- **Consequences:** Progress microcopy and garden states emphasize reflection over punishment.
- **Tests/evidence required:** ProgressScreen content review and i18n copy verification.
- **Supersedes:** None
