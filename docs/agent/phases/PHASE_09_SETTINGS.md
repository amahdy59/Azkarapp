# Phase 09 — Settings and Accessibility Preferences

## Objective

Reorganize settings by user intent, show current state and use correct control semantics.

## Scope

Settings overview, subsections, appearance, language, date/calendar, reminders, accessibility, account/data and support grouping.

## Required reading

- Settings recommendations
- Settings e2e tests
- State normalization/persistence
- Supabase/account documents where affected

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Inventory every setting, owner, default, persistence and current control type.
2. Identify duplicated controls and unclear values.
3. Map proposed IA without changing data shape unnecessarily.
4. Identify radio versus switch versus navigation semantics.
5. Identify calendar setting misclassification.
6. Define guest, sync, offline and account status copy.
7. Identify migration/testing needs for any preference change.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Reorganize approved settings groups.
2. Show useful current values in rows.
3. Correct control semantics.
4. Move calendar/date configuration to General.
5. Add approved reduce-motion/reduce-transparency accessibility options if not already present and safe.
6. Clarify guest/local and sync state.
7. Preserve normalization and persistence.
8. Add/update settings and corruption-recovery tests.

## Acceptance criteria

- Users can find settings by intent
- Current values are visible
- Radio/switch/tab semantics are correct
- Preferences persist safely
- Guest mode remains fully usable for core features
- Accessibility settings do not excuse an inaccessible default theme
- Arabic/English copy is complete

## Required tests and evidence

Run settings unit/e2e tests, state tests, `pnpm check` and `pnpm test:e2e`. Capture settings IA and control states in both languages.

## Prohibited changes

- No mandatory account
- No privacy-policy change without approval
- No state-field addition without full normalization/merge tests
- No duplicate language/theme controls in navigation unless explicitly justified

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
