# Efficient release verification phase

## Objective

Owner requested faster release rules and test execution while preserving test quality. Remove repeated full suites and retain one complete CI release gate.

## Plan and inspection

The old agent procedure ran full local quality/browser/Pages gates; the pre-push hook repeated them; Quality and Pages each ran the same full CI suite. The completed local candidate passed 621 browser tests in 48.6 minutes. The second redundant local run was stopped before pushing after the owner requested optimization.

Implement content-bound local quality reuse; affected-feature development tests and a core local browser smoke; one fresh complete Quality CI gate; Pages waits for the exact successful current-main commit. Preserve all tests, assertions, coverage thresholds and bundle ceilings.

## Files and components

.githooks/pre-push, scripts/quality-receipt.mjs and tests, scripts/run-checks.mjs, Quality/Pages workflows, AGENTS.md, README, quality checklist, agent test strategy/decision log/index and this report. No runtime product dependencies or app components changed.

## Behavior

A successful pnpm check records the tested snapshot only if files remain unchanged during the check. The hook reuses it for at most 24 hours only when tracked/untracked inputs, installed dependency lock, Node/platform and build environment match. Frozen install and toolchain checks still run. Missing, stale, malformed, future or changed receipts require a fresh check. CI always runs all checks from scratch.

The hook runs the existing settings/navigation/legal desktop smoke suite and Pages build. Developers additionally run affected-feature browser tests; broad changes, browser infrastructure and uncertain scope warrant the full local suite. Full CI browser coverage remains unchanged. Quality now retains browser failure traces and has a 45-minute job bound.

Pages runs after successful push-triggered Quality on main, rejects foreign/PR runs, checks out the verified SHA, confirms current main and a successful Quality run for that SHA, builds and deploys it, and verifies that same SHA in production. Manual deployment requires the same successful Quality. Docs-only pushes do not deploy.

## Accessibility

Existing full keyboard, axe, touch-target, RTL/LTR and enlarged-text suites remain in CI, with affected checks locally. No accessibility assertions or standards changed.

## Tests and validation

Six receipt tests pass: unchanged/generated output and staging stability; tracked/untracked/deleted input invalidation; dependencies/environment invalidation; stale/future/malformed rejection; CI never reuses or writes receipts; a new check clears earlier success. Ignored local dotenv files also invalidate the receipt. Targeted Vitest exit 0, 4.21 seconds. The existing local core browser gate passed all 23 tests without retries in 2.2 minutes (exit 0), compared with 48.6 minutes for the full local suite.

Both changed workflows passed actionlint 1.7.12, downloaded from its official release and checksum-verified, exit 0. The smoke gate and final quality/build/push/production results are recorded in output/RELEASE_REPORT.md.

## Evidence and documentation

No product screenshot is required for this tooling-only phase. Original card/footer evidence remains in docs/agent/evidence. Updated owner release contract, README, quality checklist, test strategy and decisions.

## Risks and limitations

A local receipt is a performance aid, not a CI trust boundary. CI never accepts it. The shorter local smoke does not replace affected-feature tests or broad-change verification. The complete CI gate can still take time; this change removes duplication rather than lowering coverage. Physical-device and human assistive-technology checks remain pending for the product release.

## Recommended next phase

Use CI timing and failure evidence to identify expensive individual tests before changing test setup or project allocation. Preserve device-specific assertions and only remove repetitions demonstrated to provide no extra coverage.
