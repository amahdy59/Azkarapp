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

- **Date:** Pending
- **Status:** Proposed
- **Owner:** Product owner
- **Related phase:** Phase 00 / Phase 04
- **Context:** Existing design documentation preserves a centered mobile-sized canvas on wide viewports, while the current UX improvement direction favors a more productive desktop layout.
- **Options considered:** Preserve mobile canvas; fully fluid desktop; hybrid shell.
- **Decision:** Pending approval.
- **Recommended option:** Hybrid shell—responsive dashboards and settings, constrained reader/focused flows.
- **Why:** It uses desktop space effectively without making devotional reading lines too wide.
- **Consequences:** Requires updates to `docs/DESIGN_SYSTEM.md`, responsive Playwright tests, shell components and screenshots.
- **Tests/evidence required:** Mobile, tablet and desktop viewport matrix; Arabic/English; reader measure; keyboard navigation.
- **Supersedes:** None
