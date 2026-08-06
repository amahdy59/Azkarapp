# Agent Operating Workflow

## Session 1 — Analysis only

Send the bootstrap prompt and the active phase file. Require:

- Current-state summary
- Affected files
- Existing reusable components
- Contract conflicts
- Proposed implementation plan
- Risk list
- Test plan
- Acceptance-criteria mapping

Do not allow edits in this session.

## Session 2 — Plan review

Review the proposed plan manually.

Approve only when:

- Scope matches the phase
- Existing architecture is respected
- No hidden redesign or dependency replacement is included
- Tests are specific
- Data/offline behavior is understood
- Visual evidence is planned

Record product decisions in `DECISION_LOG.md`.

## Session 3 — Implementation

Tell the agent to execute the approved plan.

Require:

- Small coherent edits
- Tests in the same change
- No unrelated formatting
- Intermediate targeted tests
- Honest reporting of failures

## Session 4 — Verification

Ask the agent to:

1. Review its own diff against the phase.
2. Run required gates.
3. Capture screenshots/evidence.
4. Check RTL/LTR and text scaling.
5. Produce the phase report.

## Session 5 — Human review

You should inspect:

- Actual browser behavior
- Mobile and desktop layout
- Arabic and English
- Keyboard flow
- Focus visibility
- Reader behavior
- Persistence after reload
- Offline behavior where relevant

## Session 6 — Fix-only pass

Give the agent a numbered list of observed defects. Do not reopen broad redesign discussion. Require a focused remediation diff and rerun affected tests.

## Session 7 — Merge and reset

- Merge only after definition of done.
- Pull latest `main`.
- Create a new branch for the next phase.
- Do not carry a dirty working tree across phases.

## Context-management rule

In long agent sessions, restate:

- Active phase
- Approved decisions
- Files in scope
- Prohibited changes
- Required tests

Do not rely on the agent remembering an earlier conversation that is not present in the repository.

## Prompt discipline

Good prompt:

> Implement only the approved Home phase. Reuse the shared RoutineRow. Do not change persisted state or reader behavior. Run the named tests and return the phase report.

Bad prompt:

> Make the whole app perfect and modern.
