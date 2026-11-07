# Button family consistency and release

The owner requests that Choose metrics share the view pills' appearance and that the app use documented, tested button rules. The preceding audio Mushaf/Progress-control checkpoint passes 33 browser cases, 24 targeted units, the complete serial gate (210.2s) and Pages build. Preserve that work and all pending earlier edits. The latest owner instruction explicitly authorizes finishing and pushing **all pending changes**, superseding the earlier publication hold. Complete the intact release gates, push to origin/main, monitor all workflows, diagnose failures and verify production. No approval gate remains.

Plan before editing:

1. Audit the shared Button, IconButton, Tabs/choice-pill, secondary configuration actions, Settings rows and domain-specific reading/audio/counting controls. Preserve role hierarchy and existing devotional geometry; this is not a blanket CSS selector on every button.
2. Add one reusable neutral pill action to the shared Button/control recipes. Reuse choice-pill border/fill/radius, 54px normal pill-family geometry, theme tokens, 20px non-shrinking glyphs, full keyboard names/focus and restrained hover/press states. Long labels wrap and grow, with no fixed height or whole-control fading.
3. Move Choose metrics and copied Progress dialog/navigation actions onto shared Buttons. Use the pill family for equivalent Quran plan and Settings configuration navigation. Keep primary confirmation, destructive, link/ghost, transport/counter, row/card, native form and calendar roles distinct and documented. Same-row actions share their size role.
4. Add screenshot and measured-paint regressions on real Progress/Quran/Settings screens. Verify RTL/LTR, phone/320px/200%/desktop, solid/Glass, keyboard/Escape/focus recovery, disabled confirmation, forced colors and both reduced-motion preferences. Retain existing state, permission, modal and persistence tests.
5. Update the design-system rules with an explicit family/state/geometry matrix and record the audit, migrations, exceptions and screenshot evidence. Run focused units and affected browser engines, then complete quality/coverage, inventory and Pages gates with unchanged budgets.

No content, persistence/sync, data/permission semantics, recording/timing, runtime dependency or native-host change is authorized. Physical device/assistive-technology and owner visual acceptance remain separate.

## Owner follow-up and release corrections

The owner reports Settings-row hover still feels inconsistent and requests the listening menu to open from its own button. Extend this same control-family checkpoint: preserve row ink/geometry and separators, remove enabled-row press fading, and use the existing portalled Radix popover with an opaque protected surface, trigger origin, collision/height bounds and current-recording focus/reveal. Verify Arabic/English, 320px/200%, phone/tablet/desktop, solid/Glass, keyboard/Escape/recovery and actual screenshots. Preserve playback, selection and saved-position semantics.

Exact-commit CI found older material assertions still expecting the superseded Progress header/filter paint, a real 48px translation-column offset, and async test reads before Quran words/font layout settled. Reconcile tests to the documented new materials without dropping coverage, repair the alignment, and wait for real readiness before measuring. Inspect every failed shard and preserve full release gates.
