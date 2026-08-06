# Delivery Roadmap

## Phase sequence

### Phase 00 — Repository audit

No code changes. Verify architecture, component inventory, documentation conflicts, current tests, state boundaries and target scope.

### Phase 01 — Baseline capture

Create repeatable screenshots, accessibility reports, performance observations and behavior inventory before visual changes.

### Phase 02 — Design foundations

Resolve responsive-shell decision. Improve tokens, focus, surfaces, contrast roles, typography, spacing, radius and global motion preferences.

### Phase 03 — Shared components

Consolidate buttons, cards, rows, tabs, radio choices, progress and system states.

### Phase 04 — Shell and navigation

Implement approved mobile/tablet/desktop navigation and content-shell behavior.

### Phase 05 — Home

Clarify contextual recommendation, one primary CTA, daily routine rows, continuation and contextual modules.

### Phase 06 — Library

Improve search, taxonomy, tabs, card states and empty results.

### Phase 07 — Reader

Protect and refine the central reading/counting experience, source integrity, focus, announcements and completion behavior.

### Phase 08 — Progress

Create day/week/month/year insight views with accessible alternatives and gentle language.

### Phase 09 — Settings

Reorganize settings IA, show current values and correct control semantics.

### Phase 10 — System states

Standardize loading, offline, empty, error, permission, update and synchronization states.

### Phase 11 — Responsive and internationalization validation

Test all important views in Arabic/English, RTL/LTR, text scaling and viewport matrix.

### Phase 12 — Accessibility remediation

Run automated, manual, keyboard and assistive-technology testing; fix and document evidence.

### Phase 13 — Release hardening

Performance, bundle, PWA, security, dependency, privacy, deployment and store-readiness checks.

## Dependency rules

- Do not redesign screens before foundational tokens and shared components are stable.
- Do not redesign Progress before Reader/session data semantics are understood.
- Do not claim accessibility completion before the final manual phase.
- Do not release immediately after a major shell refactor without regression evidence.

## Recommended iteration size

Each phase should normally fit one pull request. If a phase exceeds roughly one focused review unit, split it by component or screen while preserving the phase acceptance criteria.

## Stop/go review after each phase

Ask:

1. Did the phase solve the named user problem?
2. Is the visual system more consistent?
3. Did accessibility improve or regress?
4. Did the diff remain within scope?
5. Are all tests meaningful and passing?
6. Is the next phase still correctly ordered?
