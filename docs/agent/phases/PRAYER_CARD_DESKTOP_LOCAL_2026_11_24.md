# Expanded desktop prayer card — local refinement

The owner requests all prayer information within the expanded desktop card, improved spacing, passive hadith references and the recording date in the card rather than a modal. They also request actual screenshot evidence throughout implementation. This supersedes the earlier date-in-information-sheet and desktop information-dialog presentation only. Preserve the 2026-11-24 publication hold and independent Home, Qibla, Downloads, prayer-settings and surah work.

## Plan and scope

1. Inspect the shared PrayerActionsCard, PrayerMomentPanel, Home overrides and existing reviewed guidance models.
2. Reuse those models in a presentation-only desktop guidance component. Keep the compact information dialog and its focus recovery. Desktop uses the existing 1200px shell boundary; a 40rem card container controls internal columns and stacks at enlarged text.
3. Group checklist/date and virtue independently, with 12px related spacing, a 32px wide gutter and bounded card insets. The owner's screenshot correction rejects the full-width lower band: keep Sunnah guidance directly below the virtue and Rawatib directly below the checklist/date, in two independent columns. References, grading and rank remain complete passive text. Preserve Fajr sunrise and Friday alternatives.
4. Keep the exact dayKey, selected calendar/Hijri adjustment, prayer availability, recording callbacks, offline ownership and source text unchanged. Resizing an open compact dialog to desktop closes it, recovers focus to Read and cannot reopen a stale dialog on return.
5. Update unit/browser contracts, capture actual RTL/LTR Glass/solid and enlarged screenshots, inspect them, run targeted tests and the intact non-browser quality gate/Pages build. Record existing mixed-checkout failures separately without weakening checks.

No content interpretation, state migration, network service, new timer, dependency, release-note edit, commit or publication is authorized. Physical-device and assistive-technology acceptance remain separate.

## Approved final reference and release authority

The owner approves the final actual-font proposal: tighten the desktop heading-to-first-row gap without shrinking controls, align metadata/checklist edges, make section headings quieter and render all complete quotations/references consistently. These refinements are implemented and verified through the coordinated release. The owner then explicitly requests coordinating the other working chat and pushing all pending changes; this supersedes the earlier publication hold for the batch. See COORDINATED_RELEASE_2026_11_24.md for the active release plan and release owner.
