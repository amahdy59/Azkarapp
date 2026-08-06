# Baseline and Governance

## Current application baseline

Azkarapp is an Arabic/English offline-capable PWA built with React, TypeScript, Vite and Tailwind CSS. It includes local persistence, optional Supabase account synchronization, prayer-time behavior, PWA installation/update behavior, unit tests, Playwright browser tests and axe-core accessibility checks.

The repository already contains mature engineering contracts. The improvement program must strengthen rather than bypass them.

## Governance goals

1. Preserve user data and religious-content integrity.
2. Make every change reviewable and reversible.
3. Separate design decisions from implementation decisions.
4. Require evidence for accessibility, responsiveness, performance and regression safety.
5. Avoid uncontrolled agent-generated refactors.
6. Keep product behavior available offline.
7. Maintain Arabic-first quality without treating English as an afterthought.

## Decision classes

### Class A — implementation detail

The agent may decide without separate product approval when the choice:

- Follows existing contracts
- Does not change user behavior
- Does not alter data shape
- Does not add a dependency
- Is covered by the active phase

Examples: extracting repeated markup into a shared component, adding a missing test, replacing a physical margin with a logical property.

### Class B — product or design decision

Record and obtain approval before implementation.

Examples:

- Changing top-level navigation
- Replacing the fixed mobile canvas with a fluid desktop layout
- Changing daily progress semantics
- Removing or adding a home section
- Changing the relationship between complete and short azkar modes
- Introducing a new account requirement

### Class C — high-risk technical decision

Require a dedicated proposal, migration plan and rollback plan.

Examples:

- Replacing the router/navigation model
- Replacing state management
- Changing persisted state shape
- Changing Supabase schema or RLS
- Replacing the PWA strategy
- Changing prayer-time providers or calculation logic
- Introducing analytics or remote logging

## Known design-contract conflict to resolve

The existing design system documents a centered mobile-sized canvas on wide viewports. The desired screenshots and audit emphasize a more productive desktop composition with a persistent navigation area and multi-column content.

Phase 00 must choose and record one of these strategies:

1. **Preserve mobile canvas:** maintain a focused app-like experience on desktop.
2. **Responsive desktop shell:** use full-width desktop composition while preserving constrained reading widths.
3. **Hybrid shell:** fluid navigation and dashboards on desktop, constrained reader and focused flows.

### Recommended direction

Use the **hybrid shell**:

- Home, Library, Progress and Settings use desktop-aware layouts.
- Reader, dialogs and focused devotional flows retain a controlled reading width.
- Tablet uses a compact rail or drawer.
- Mobile uses full-width content and bottom navigation.

Do not implement this recommendation until it is recorded as approved in `DECISION_LOG.md`.

## Branch and review policy

- One roadmap phase per branch.
- One pull request per phase.
- Do not mix documentation-only decisions with large implementation diffs when avoidable.
- Require before/after evidence for visible changes.
- Require a rollback path for state, data, authentication, prayer-time or PWA changes.

## Completion truth

A phase is complete only when:

- Its acceptance criteria pass.
- Relevant tests pass.
- Required screenshots/evidence exist.
- Documentation is current.
- No unresolved critical or high-severity regression remains.
- The user has reviewed the user-visible result.
