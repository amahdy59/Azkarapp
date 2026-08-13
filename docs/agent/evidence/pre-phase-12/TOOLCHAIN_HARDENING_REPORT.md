# Pre-Phase-12 Toolchain Hardening Report

## Objective completed

Make dependency installation and local/CI release gates reproducible before Phase 12 without changing application behavior.

## Root causes resolved

- The repository declared pnpm 9.15.0 while its seven-day `minimumReleaseAge` policy was enforced only by newer pnpm runtimes.
- `@testing-library/user-event@14.6.4` entered the lockfile one day after publication and correctly failed the repository quarantine.
- `pnpm check` invoked nested scripts through `npm`, so it failed in a pnpm-only runtime.
- Vitest excluded tooling tests under `scripts/`, leaving the existing lint-rule guards undiscovered by the normal gate.
- Local Playwright projects required separately installed system Chrome while CI used Playwright's pinned Chromium.
- The tracked pre-push hook was not active because `core.hooksPath` is local Git configuration and is not cloned.
- Git for Windows hooks run under `sh`, which did not resolve Codex's available `pnpm.cmd` shim or its bundled Node runtime through the normal command names.
- Three local browser workers caused one reproducible page crash under sustained Windows desktop load.
- Three E2E checks relied on ambient focus or a duplicated Home/Progress test id before lazy navigation settled, allowing full-matrix-only races.
- The quality build and Playwright web-server build reused `dist` back-to-back, allowing OneDrive to retain a filesystem lock while Vite tried to empty it.

## Changes completed

- Pinned pnpm 11.19.0 in `packageManager` and `engines.pnpm`.
- Added a tested Node-major and exact-pnpm verifier and made `pnpm check` run it first.
- Pinned `@testing-library/user-event` to eligible 14.6.3 and corrected its lockfile integrity without weakening the seven-day quarantine.
- Replaced internal `npm run` calls with `pnpm run`.
- Added `scripts/**/*.test.mjs` to the Vitest gate.
- Standardized local and CI Playwright projects on repository-pinned browser engines.
- Added `pnpm setup:browsers` and installed Chromium, Firefox, and WebKit locally.
- Kept retries disabled; local runs use two workers and CI retains three.
- Synchronized the affected accessibility, Progress, and keyboard tests with their stable screen, route-owned focus, or target locator.
- Isolated Playwright's production-preview build in ignored `.playwright-dist` output so it cannot contend with the quality or Pages build.
- Excluded that generated Playwright output from both Git and ESLint scanning.
- Expanded Quality to run on pull requests and direct `main` pushes, including Pages build and production audit.
- Expanded pre-push to verify toolchain, frozen install, quality, full E2E, and Pages build.
- Made the pre-push hook resolve POSIX `pnpm` binaries, Windows `pnpm.cmd` shims, and a shim-adjacent bundled Node runtime.
- Added an install `prepare` script that activates the tracked `.githooks` directory.
- Updated setup, quality, supply-chain, and decision documentation.

## Verification evidence

| Command / evidence                                   | Result                                                                                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm run verify:toolchain`                          | Passed: Node 24.x and pnpm 11.19.0                                                        |
| `pnpm install --frozen-lockfile`                     | Passed: 710 lockfile entries accepted by the seven-day supply-chain policy                |
| Focused tooling tests                                | Passed: 2 files / 7 tests                                                                 |
| `pnpm check`                                         | Passed: formatting, lint, typecheck, audio validation, 89 files / 431 tests, build/budget |
| `pnpm test:e2e`                                      | Passed: 372 tests, 4 intentionally skipped, zero retries, five browser/device projects    |
| `pnpm build:pages`                                   | Passed: PWA build and bundle budgets                                                      |
| `pnpm audit:prod`                                    | Passed: no known production vulnerabilities                                               |
| `git config --get core.hooksPath`                    | `.githooks`                                                                               |
| Previously crashed tablet Saved flow, isolated rerun | Passed                                                                                    |

## User-visible behavior

None. No application source, religious content, persistence, synchronization, prayer calculation, or runtime dependency changed.

## Remaining constraints

- A fresh machine must have Node 24.x and pnpm 11.19.0 before the repository can verify itself.
- The first browser-test setup downloads Playwright's pinned engines; subsequent runs reuse the local cache.
- Local full E2E takes about 19 minutes with two workers on this Windows/OneDrive checkout. The slower setting is deliberate and does not add retries.

## Recommended next phase

Begin Phase 12 analysis-only accessibility auditing after GitHub Quality, Pages deployment, and production smoke verification pass for this commit.
