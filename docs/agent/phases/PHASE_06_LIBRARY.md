# Phase 06 — Azkar Library and Search

## Objective

Make collections easy to scan, search, understand and open.

## Scope

Library index, collection/saved tabs, category cards, search results and empty states.

## Required reading

- Library recommendations
- Content-authoring rules
- Search implementation
- Category data and navigation tests

## Step 1 — Analysis only

Do not edit code. Complete all of the following:

1. Map category taxonomy and stable IDs.
2. Map search matching and normalization behavior.
3. Identify inconsistent cards and empty progress bars.
4. Define user-facing grouping without changing source content.
5. Define tab semantics and result announcements.
6. Define not-started/in-progress/complete states.

Return the plan using the analysis-only format in `docs/agent/PROMPT_LIBRARY.md`.

## Step 2 — Approval gate

Do not implement until the user approves the plan and any required decisions are recorded in `docs/agent/DECISION_LOG.md`.

## Step 3 — Implementation

1. Implement consistent category cards.
2. Add state-appropriate progress presentation.
3. Improve taxonomy presentation while preserving IDs.
4. Implement accessible tabs.
5. Improve search result count, empty state and keyboard behavior.
6. Remove internal roadmap messaging from production UI.
7. Add/update tests and screenshots.

## Acceptance criteria

- Search is clear and announced
- Tabs work by keyboard and screen reader
- Category cards are consistent
- No decorative empty progress bar for not-started categories
- Content text is not altered by normalization
- Arabic/English layouts are correct

## Required tests and evidence

Run targeted search/library tests, axe, `pnpm check` and `pnpm test:e2e`. Capture search empty/results and category-state screenshots.

## Prohibited changes

- No content-source rewriting
- No unstable category-ID migration
- No release of unreviewed collections
- No search dependency without approval

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
