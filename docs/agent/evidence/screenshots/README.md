# Before / after visual evidence

Closes the screenshot debt tracked as a Known Limitation in the Phase 02–07 reports.

## What these are

| Directory  | Commit                                | Meaning                                   |
| ---------- | ------------------------------------- | ----------------------------------------- |
| `before/`  | `5290eeb` (`style: format AGENTS.md`) | The last commit **before** Phase 02 began |
| `after/`   | current `main`                        | After Phases 02–07                        |
| `current/` | latest verified capture               | Current pre-Phase-09 application state    |

Both sides were produced by running **the same file**, `e2e/evidence-capture.spec.ts`, against each commit — `before/` via a temporary detached `git worktree`, so the working tree was never checked out or stashed. Running the identical script on both sides is what makes this a genuine comparison rather than two unrelated snapshots.

To keep that possible, the capture spec deliberately uses only selectors that have been stable across the whole range: the onboarding test ids and the `nav-*` test ids.

## Regenerating

```bash
EVIDENCE_DIR=docs/agent/evidence/screenshots/after pnpm exec playwright test e2e/evidence-capture.spec.ts --project=desktop-chromium
```

## Coverage

The before/after comparison covers Home across all three themes (Midnight, Dark, Light) plus English Light; Library, Progress, Settings and a category screen at desktop width; and Home and Library at compact width. The current capture adds Home and Library at tablet width. Arabic unless the filename says otherwise.

## A correction worth recording

The first capture attempt was **wrong and was discarded**. `before/` had caught the _splash screen_ rather than Home: navigation mounts while the splash is still visible in pre-Phase-02 builds, so waiting on navigation alone returned too early. The tell was file size — 32 KB against 227 KB for the same shot on the other side. The spec now navigates to Home explicitly and waits for the splash wordmark to clear.

The Phase 01 baseline was lost the same way it was nearly lost again: it wrote to `testInfo.outputPath()`, which lands in `test-results/` and is never committed. These are written to a committed directory on purpose.

## Still outstanding

The **manual keyboard and screen-reader walkthrough** required by the Phase 07 evidence section has not been done. Screenshots do not substitute for it, and neither does automated keyboard coverage.
