# Phase Report — Desktop Home materials and audio controls lock

## Objective

Deliver the owner-approved Home Glass / Follow device / Solid choice, prevent the reported wrong recording from playing and add accidental-touch protection without changing religious counts.

## Scope completed

Inspected shared settings persistence, Home material fallbacks, audio catalogue/assignments, owner-preview timing pack and shared modal/focus primitives. Plan approved through the owner's two explicit choices: persist the three-state Home material, quarantine only the wrong Arabic variant and add a two-second hold unlock. Include the concurrent Qibla edits after verification; the owner explicitly superseded their no-push hold.

## Files changed

Settings types/state/App, AppearancePanel and HomeScreen; shared Home material CSS; FloatingAudioPlayer, AudioControlLock and ResponsiveSheet; Arabic/English copy; audio manifest/assets and compressed owner-preview timing pack; targeted unit/browser tests. Concurrent Qibla files are documented in QIBLA_SHORTCUT_VISIBILITY_2026_10_16.md.

## Components added or modified

AudioControlLock adds no dependency, storage or network calls. AppearancePanel uses shared SegmentedControl. Modal gains an opt-in outside-dismiss guard; existing consumers keep their behavior.

## User-visible changes

Home defaults to Follow device, remembers explicit Glass or Solid, and keeps decorative photos independent. Glass overrides app/device reduced transparency, with high contrast/forced colors retaining opaque surfaces. Expanded ordinary and Quran playback offer Lock controls. Short taps and outside touches cannot unlock; continuous pointer/Space/Enter hold for two seconds unlocks, with Escape recovery. Playback continues.

Arabic comprehensive-dua-39 is rejected; misc-ref-1 shares that asset. Approved English remains available. Identical bytes remain available for correctly matched friday-dua-25. Two wrong transcript timing records and rejected variant references were removed, preserving 287 remaining records. No replacement recording is approved by this change.

## Accessibility work

44px lock trigger, semantic named modal, focus trap/restoration, keyboard hold/Escape, canceled holds on release/cancel/blur, bilingual instructions and contrast fallbacks. Browser axe checks supplement keyboard/pointer verification; no claim of complete accessibility compliance.

## Tests added or updated

Three material values normalize/merge; quarantine leaves English available; timing loader rejects wrong variant references and retains the correct Friday entry; lock tap/cancel/hold/Escape tests. Browser tests cover Arabic/English, persisted material under OS reduced transparency, high contrast, forced colors, pointer/keyboard holds, media continuity and focus recovery. Prior prayer geometry tests now explicitly restore the expanded row after scrolling to detail; the hidden condensed countdown is checked for visibility separately from the footer. Full geometry/count assertions remain intact.

## Commands run

| Command                                         | Result                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Targeted audio architecture and lock unit tests | 23 passed before timing-pack change; full gate below verifies final input                    |
| Initial seven-case lock/material browser run    | 7 passed after fixing WebKit opener focus and test reload initialization                     |
| node scripts/validate-owner-timing-previews.mjs | Passed: 287 candidates, 241 recordings, 91,219 bytes                                         |
| pnpm build:pages                                | Passed including bundle budget                                                               |
| pnpm check                                      | Final run in progress; initial run correctly failed stale timing references and was repaired |
| Combined affected browser tests                 | In progress; exact final results recorded in release evidence                                |

## Visual/manual evidence

Evidence under output/audio-lock-review-2026-10-16. Hosted reported bytes matched manifest SHA-256 and size; the owner's speech report plus identical correctly assigned Friday recording establishes quarantine, not a newly reviewed recording. Browser captures cover Home glass and bilingual lock states. Initial prayer rerun was invalidated when a concurrent build replaced its served artifact; final verification uses a separate immutable snapshot server.

## Documentation updated

Design system, audio architecture, decision log, phase index and fresh bilingual release notes. Audio generated mapping report records reduced Arabic coverage.

## Decisions recorded

Explicit Glass override approved; lock only, no child repetition mode; verified Qibla inclusion approved. No religious content or prescribed count edits.

## Known limitations or remaining risks

Arabic guidance recording unavailable until a matching recording passes review. Lock prevents incidental in-app touches, not OS navigation or intentional Escape. Backdrop blur requires browser support. Initial release e3c4 failed CI because pre-existing prayer tests did not account for the newly approved condensed strip; production deployment is not claimed until final CI/deployment smoke succeeds.

## Out-of-scope findings

Concurrent Qibla shortcut changes are included with owner approval after responsive verification. Original religious sources, progress, count and audio completion rules remain intact.

## Recommended next step

Complete exact-commit CI and deployment smoke; obtain an independently reviewed matching Arabic guidance recording.
