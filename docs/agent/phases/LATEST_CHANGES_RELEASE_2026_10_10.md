# Phase Report — Latest changes review and release, 2026-10-10

## Objective

Review and publish all pending application refinements, preserving the latest
main-branch implementation and the offline reading and persistence contracts.
The owner's latest instruction supersedes earlier local-only publication holds.

## Scope completed

Owner fallback follow-up refines the bundled Amiri Quran rendering at native
regular weight, removes synthetic/QCF ink thickening and scales natural word
gaps with text. Canonical Arabic bytes, fifteen slots, verse/line identities
and page furniture are unchanged. Fractional word measurements prevent
accumulated desktop Chromium rounding from overrunning the line measure.
Final containment is measured on the next painted frame because WebKit can
report stale child bounds during the fit write. Late font swaps trigger another
fit. All 12 phone/desktop canonical-line checks passed across Chromium, Firefox
and WebKit (1.3m); 24 viewer/meaning unit tests passed (4.25s). Synchronization
and magnification checks passed all nine cross-engine cases (1.7m).

Further owner follow-ups synchronize the main Mushaf to the existing exact-recording
audio clock. Arabic words and corresponding English verses share the current cue;
manual page selection or native English scrolling pauses following, with an explicit
return control. Automatic page following does not record completion. The English
pane starts beside Arabic without a surrounding card and uses shared 18/20/24px
type; expanded desktop listening mirrors the same English-left/Arabic-right layout.
A measured compact dock clearance protects the complete page. English emphasis
is verse-level because Arabic timestamps do not establish English word timings.

Masbaha and صلاة على النبي now reuse the Zikr tools grid, spacing, aligned
controls, disclosure and two-column desktop counter. Their existing targets,
counting, persistence, sound and reset behavior remain intact. Home continuation
labels use one line with ellipsis and preserve their complete accessible name.

Owner follow-up adds Audio options/menu and footer refinement to this release.
The menu now has a quiet heading, aligned labelled rows and consistent selection
indicators; the disclosure has a distinct rounded rectangular surface and subtle
chevron. Corrected collapse CSS preserves reading geometry. Consolidated Reader
keyboard help so one shortcut invocation cannot open two dialogs.

The owner's subsequent screenshot corrections are implemented: 18px footer row
spacing, centered icon/label groups, down-to-hide/up-to-show tools chevron, and
a desktop four-column grid with the counter spanning the two middle columns.
Calm reveal/chevron motion uses existing tokens and disables under reduced motion.

Inspected the pending implementation and release state, preserved the local work,
fast-forwarded main by 14 existing remote commits, and reconciled overlapping
Reader, Quran, audio and documentation changes. Retained upstream reading-only
Benefit placement, complete ayah image sharing, surah sharing and offline release
history. Repaired demonstrated contrast, translation validation/cache and browser
fixture defects. The plan was to review existing completed phases, repair their
integration, verify all gates, and publish one coordinated application release.

## Files changed

- Quran: per-surah English assets; preparation and coverage scripts; translation
  loaders; Quran bilingual, page-meaning and listening views; ayah interaction;
  playback cue; Mushaf magnification/viewer/menu/settings; Khatmah reader.
- Reader/audio: footer tools, counting guidance and keyboard help; Reader screen
  and styles; floating player and styles; shared icon exports.
- Settings/progress: prayer location and notifications panels; Reading and
  Accessibility navigation; elapsed-period and garden calculations; prayer,
  Friday and progress statistics; settings routing and localized copy.
- Review/release: relevant unit and browser tests, isolated suites, bundle
  baseline/authorized output ceiling, release manifest/history, architecture,
  design, prayer/audio/content contracts, decision log and phase reports.

## Components added or modified

New StandaloneCounterFooter, shared reader-footer CSS, QuranTranslationText,
useMushafPlayback, ReaderFooterTools, MushafMagnificationControl, QuranListeningTranslation,
QuranPageTranslationPanel, QuranBilingualStreamView and PrayerLocationPanel;
existing Reader, player, sharing, progress and shared controls refined. Existing
state normalization, Quran Arabic and audio identity boundaries remain intact.

## User-visible changes

Stable two-row Reader actions and tools disclosure; keyboard help and calmer
audio transport/options; 100–200% printed-page enlargement; English meaning
matched to displayed verses with listening cues where available; distinct prayer
location/reminder settings; recording rates through today with honest missing-data
explanations. Preserve complete image/text sharing and offline update history.

## Accessibility work

Restored selected controls' paired surface/ink contrast; maintained 44px Quran
actions, native independently scrollable meaning regions and visible focus;
localized region names and explicit text language/direction. Native disclosure,
dialog Escape/focus recovery, responsive geometry and automated accessibility are
covered by browser checks. Automated tests do not establish complete WCAG
conformance; physical-device and human assistive-technology review remain separate.

## Tests added or updated

Complete 114-chapter/6,236-verse translation coverage; invalid/malformed identifiers,
offline Cache Storage reads and denied-storage recovery; source attribution;
page/verse identity, audio options, magnification, footer geometry, elapsed-period
statistics and prayer settings. Preserved upstream image export and reader tests.
Audio fixtures now open the existing Audio options dialog before interacting with
moved controls. The approved 52px expanded Play control has exact width and height
assertions; the superseded 64px expectation is removed without lowering target
requirements.

## Commands run

Node 24.21.0 and repository pnpm 11.19.0; unchanged lockfile and dependency set.

| Command                                                          | Result                                                                                                                                                   |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pnpm install --frozen-lockfile                                   | Passed, exit 0.                                                                                                                                          |
| Source comparison against en.sahih                               | 114 chapters, 6,236 verses, zero text mismatches.                                                                                                        |
| Focused translation/integrity unit suite                         | 12 passed across four files, exit 0, 7.58s.                                                                                                              |
| Focused accessibility/audio/Benefit/Quran Chromium browser suite | 39 passed, exit 0, 1.7m.                                                                                                                                 |
| pnpm check                                                       | Passed, exit 0, 153.9s; coverage, types, lint, format, content/timing, build and budgets. Final snapshot is verified again by the tracked pre-push hook. |
| pnpm build:pages                                                 | Passed, exit 0; plain Mushaf JSON retained.                                                                                                              |
| pnpm audit:prod                                                  | Passed, exit 0; no production vulnerabilities.                                                                                                           |
| pnpm archive:release-notes                                       | Archived 2026-10-10, preserving 236 historical releases.                                                                                                 |
| pnpm check:release-notes                                         | Passed, exit 0.                                                                                                                                          |

Additional verification: ayah attribution 5 tests passed (21.48s); player/footer
38 tests passed (20.65s). Menu/footer browser suite: 49 passed and one duplicate
keyboard-help failure, corrected with a regression test and focused rerun.
Final UI unit suite: 45 passed in three files (38.72s). Corrected footer/keyboard
browser rerun: 11 passed (1.2m). Spacing/audio suite: 27 passed (1.4m). Desktop
four-column grid suite: 16 passed (1.1m), including exact shared column edges,
counter span, 18px row separation, icon/label centering and chevron states.
Latest complete non-browser gate passed in 174.3s before the final footer-only
corrections; the tracked pre-push gate checks the final snapshot again.
Full browser and deployment results are recorded after completion. Earlier
interrupted runs remain in local diagnostics; they exposed contrast defects,
outdated moved-control fixtures and the superseded button size. No assertions,
coverage thresholds or accessibility checks were bypassed to conceal failures.

Main-Mushaf and paired/magnified reading checks passed across Chromium, Firefox
and WebKit (18 Quran cases in the 24-pass run; three Home measurement failures
were corrected by checking distinct line positions because ellipsis creates
multiple rectangles on the same line). Standalone footer and Home checks then
passed all 27 cases in 3.1m. Masbaha/Salawat and tools unit checks passed 26 tests
in 13.45s; main synchronization tests verify manual pause, return, timing gaps
and exact recording identity. The complete non-browser gate passed in 135.9s,
Pages build passed, and the production audit found no known vulnerabilities.
An additional screenshot review matched standalone action typography and used
existing shorter Sound/Reset labels, retaining full accessible action names.
The final complete browser run is against this refinement; the earlier full
run was deliberately stopped before committing, rather than reported as a pass.
The full sweep exposed insufficient light-theme contrast on the new disabled
Reset action. Full-contrast ink with a dashed border and muted surface preserves
disabled semantics. The existing contrast check and eight standalone geometry
cases passed after repair (9 passed, 33.8s); assertions remain unchanged.
The broad sweep also identified superseded fixed-width counter and duplicate
keyboard-help fixture expectations. Tests now require the exact two-column
desktop counter span and one reachable help dialog with focus recovery. The
stationary-pointer guidance test uses an ordinary counted zikr rather than a
complete-surah counter-only view. Dismissed guidance retains its reopen target
on both phone and desktop. English pointer/scrollbar interaction pauses following
and is excluded from the printed page's tap-to-focus gesture, preserving tools.

## Visual/manual evidence

Local evidence includes translation-reading and magnification screenshots from
the completed feature phases, plus current browser output under test-results.
Source fidelity evidence: output/quran-translation-source-verification.json.
Release gate, browser and audit logs are retained under output/release-*.
Reviewed final desktop/mobile footer screenshots are preserved in
output/release-ui-evidence. Menu geometry and nested-volume focus are captured
by the audio browser spec. Deliberate initial-route baseline is 158,039 gzip
bytes; no individual file, CSS or initial-route ceiling is increased.
Preserved main-mushaf-synchronized.png, masbaha-desktop.png and salawat-mobile.png
show aligned reading panes, dock clearance and shared standalone footer geometry.

## Documentation updated

Architecture, design system, prayer times, audio architecture, content authoring,
agent index, decision log and this report. Historical local-only phase reports
remain historical; the new release decision explicitly supersedes their holds.

## Decisions recorded

Owner requests self-review and publication of all application work. Owner
explicitly authorizes the 11 MiB total-output exception for this release; all
other ceilings and baseline growth guards remain. Existing plain Mushaf URLs
are preserved for older installed versions: experimental compression at those
URLs was rejected because older clients expect JSON. The source-verified Saheeh
International corpus is attributed without rewriting its wording or independently
interpreting religious content.

## Known limitations or remaining risks

First-time English asset access needs connectivity; previously read chapters
are cached and unavailable meaning never blocks Arabic reading. Browser storage
can be denied or evicted. Listening emphasis remains at verse level for English
and retains the repository's existing timing provenance. Source fidelity is not
independent scholarly endorsement. The full corpus adds about 909 kB of static
assets; the explicitly approved total-output exception does not raise other budgets.

## Out-of-scope findings

Three pre-existing loose workplace notes describe an organization chart, names
and team structure. They are unrelated to Azkarapp and remain local. An unrelated
credential file also remains local; no contents are included in commits or reports.
The pre-integration stash remains available as a recovery copy.

## Recommended next step

Physical-device and assistive-technology review of enlarged Quran reading and
the completed Reader/audio controls, retaining current content/timing review rules.
