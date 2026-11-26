# Coordinated implementation and release — 2026-11-25

## Owner authority and objective

The owner explicitly requests coordinating all working sessions, completing their approved implementation, waiting for implementation and validation, pushing all changes and verifying deployment. This supersedes earlier local-only commit/publication holds for the current shared-checkout batch. This coordination chat is the sole release owner. Preserve independent source-review, licensing, translation and physical-device acceptance boundaries; release authority does not turn review drafts into approved content.

## Plan before editing

1. Inspect the required repository contracts, current main checkout, every relevant working chat and current production/Actions state. Preserve all completed and in-progress work. The deployed starting commit is `885ce257fa9cb86ce20b0be11f8a5a7ea802ccfe`; Quality 45495500512 and Pages 45503908028 succeeded.
2. Collect final handoffs for Home, Settings, completion, overlays, seamless headers/system bars, Learn/documents, additional-audio pilot and Sharing/Masbaha/Quran. Ask the active owners to finish their already approved scopes and focused verification without competing commits, pushes or aggregate gate runs. Record concrete unfinished work and resolve integration defects before freezing inputs.
3. Inspect the combined diff, tests and screenshots. Keep review-only English/audio content behind its existing production gates and preserve the independent source-audit worktree. Repair confirmed failures with the smallest coherent changes, retaining all assertions, coverage and bundle ceilings.
4. Rewrite the current bilingual release manifest for this batch, archive it through the existing tool, document final handoffs and complete the frozen install, full non-browser check, affected feature/browser verification, core browser smoke and Pages build. Reuse only genuine exact-input successful receipts.
5. Commit the reviewed shared-checkout batch and push `origin/main` through the tracked hook. Monitor every triggered workflow, inspect every failed job and remediate until exact-commit Quality / verify and Pages build/deploy succeed. Verify deployed SHA, assets and real production application behavior.

## Scope boundaries

No force push, shared-history rewrite, hook bypass, weakened checks, new runtime dependency, speculative content correction or secret disclosure. The separate `codex/dhikr-source-alignment` worktree is not silently merged. Real Android/system-bar, hardware, screen-reader and independent religious/language acceptance retain their documented limits. Native changes require a new binary where applicable; a Pages/live-update deployment alone cannot ship them to installed older binaries.

## Evidence and report

Final results belong in `docs/agent/reports/COORDINATED_RELEASE_2026_11_25_REPORT.md`, linked to the existing per-feature reports and screenshot galleries. The report must distinguish completed implementation, passing checks, intentional production exclusions and remaining independent acceptance.
