# Engineering and release checklist

Universal Progress dates: choose one day, Today, a Gregorian month and a range through the common picker; verify identical selected scope across tabs, exact Records/export, inclusive/leap/current-month boundaries, future/reversed/empty errors, unapplied drafts, Apply/Cancel/Escape focus recovery and collapsed-phone state. No secondary record search or always-visible explanatory prose. Inspect 320px/200% text, RTL/LTR, native date/month support and protected dropdown geometry. Switch every detailed topic, including Custom range and day-only Reflection; hidden topics must unmount. Verify empty activity separately from known zero targets, unknown goals and populated days.

Motion/control polish: verify Home action-icon feedback on keyboard focus and fine-pointer hover, preserved RTL orientation, still OS/app reduced-motion alternatives, stationary photos and unavailable-action exclusion. Press Space then Escape/Tab, switch to pointer input and leave/background the page: no latched delegated feedback or synthesized actions. Native ranges retain Home/End/arrow values, meaningful value text, focus outlines and bounded engagement tints/halos in every motion mode. Capture Arabic phone/English desktop evidence across Chromium/Firefox/WebKit; physical touch and screen-reader slider acceptance remain manual. See e2e/motion-control-polish.spec.ts and the local phase report.

Mushaf/Progress continuation: repeat centre taps and verify one hide/show per tap, bottom-handle/Escape recovery, independent word/ayah actions, same-word/chip/outside dismissal and retained All meanings. Check reversed up/down page-colour gestures without changing application appearance, including Follow app, pointer cancellation and magnified/overflowing native scrolling. Hold page JSON and chapter meanings independently to prove early critical fonts and unblocked page turns. Inspect one stationary-toolbar arrival in ordinary/reduced motion, and visible close/focus recovery in mobile sheets and wider dialogs/side panels. For Progress, verify shared-range keyboard/RTL tabs, card-to-own-trend focus, unchanged counts/export scope, denominator-only bars, unknown goal recovery, labelled Expand/Collapse filters, 320px/200% text, protected menus and all material/accessibility fallbacks.

Mobile sharing/filter/lock regression: assert full compact-viewport bounds across every step, safe footer/close reachability, 320px/200% text recovery, and retained design when switching zikr/actual filtered collection. Export-card scope is independent. Inspect larger previews and short balanced/long top-anchored cards without lost text. Verify collapsed Library/Progress summaries, typing retention, category/preset auto-collapse, Custom validation/apply/cancel, native keyboard/focus and wide-layout exposure. Lock checks must cover actual half-hold progress, early cancellation/backgrounding/unmount, internal route/hash attempts without synthetic history pushes, continued audio and Escape recovery. Native device pinning and real screen-reader/safe-area acceptance remain human checks.

Prayer restoration regression: with cards condensed and details open, move to the top, leave focus on the horizontal prayer-list region and close details. Cards must restore without another scroll event or focus move. Repeat while focus remains on an actual prayer button: preserve the hold until blur, including blur to the list region. Retain 96px/8px hysteresis, keyboard/native horizontal access, Arabic/English, 200% text, short-window recovery and the unchanged WebKit sticky assertions. This includes the owner's approved local follow-up to the independently reproduced failure.

Dropdown protection regression: open shared searchable pickers, Select and contextual menus above real form actions. Assert opaque computed backgrounds, viewport bounds and hit testing (not merely z-index or axe); verify independent list scrolling, input/icon clearance, search, selection, Escape/Tab and focus return at 320px/200% text, phone/tablet/desktop in Arabic/English. Cover light/midnight/dark with solid/Glass plus high contrast, reduced transparency, unavailable backdrop filters and forced colors. Never fix clipping with a larger z-index alone or reuse translucent card fills for functional overlays. See `e2e/dropdown-protection.spec.ts`.

Prayer seconds/motion regression: verify Arabic/English at 320/390/tablet/desktop and 200% text; single-line digits without the localized remaining-time word on mobile; stable name/time/card width; actual dated interval progress; shared expanded/condensed clock; no live announcements; hidden/offscreen cancellation and current-wall-time recovery. Check both OS and app reduced motion remove seconds fade/ring interpolation. Retain prayer boundary/DST/record tests and manual device/screen-reader/performance acceptance; browser evidence alone is not full compliance.

Focused Progress acceptance: reconcile each overview/table/export against shared sparse daily facts, separate civil and devotional windows, known/unknown goals, duplicate pages/records, repeating/free plans and explicit manual completions. Validate Custom dates atomically (invalid/reversed/future), actual Hijri/weekday periods, leap/DST days, complete-day comparison windows and bounded bins. A new Quran plan must not invent old targets. Chart gaps distinguish unavailable from zero; count axes start at zero and percentage axes stay fixed. No combined worship score. Preserve old exact-data/item/offline assertions through optional detail; replace old tab/no-select assertions with meaningful labelled-range checks.

Verify 320px at actual 200% text, ordinary 390px, tablet and wide layouts in Arabic/English and all engines. Assert first-phone overview fits before long charts; no horizontal document spill, table has keyboard scroll recovery, correct sort/paging/search and complete-scope export. Verify focus after Apply/Cancel, keyboard chart exploration, no hidden data entry and contrast scans. Supported Glass color/image must stay identical at rest/scroll; activate frost only and retain opaque fallbacks. Physical screen-reader/touch acceptance remains manual.

Local reliability/performance acceptance (2026-10-20): preference-reset parse/read/quota failures must preserve exact saved bytes and announce failure without reload. Compare the mount-owned count writer with full normalization, including count reset, malformed counters, Masbaha items, new/removed fields, settings/history changes, day rollover, quota retry and independent mounts. Prove unchanged history is not traversed on partial counts and verify an actual displayed tally survives reload without lifecycle events. Boot reuse must invalidate on exact primary/legacy bytes and the devotional day, including another tab's write while chunks load. Share compatibility/generation must prepare identical Quran glyph inputs once per generation, invalidate changed text/identity, stop cancelled font/glyph work before layout and retain complete-image/offline/URL-cleanup tests. Indexed path judgments must match individual historical policies and judge each garden day once. Measure runtime work separately from real storage/device latency. Use a dedicated production preview directory/port when other sessions are building; retain failures and do not relax timing assertions.

Progress internal-overflow regression: Arabic and English at 320×480 and computed 200% text must exercise actual filter overflow, tab/title overlap geometry, the opaque scrolled title, independent record frost, fixed title bounds, upward reversal and transparent internal rest. Keep the inner backdrop filter disabled even when its shared scrolled selector is active. Keyboard Tab from Share must expose the selected tab beneath the title and within the filter viewport. Test Chromium, Firefox and WebKit. Cancelled exports must skip canvas/layout allocation before preparation, after pending fonts and after pending glyphs, while retaining progressive URL cleanup tests.

Progress/header review regression: a presentation-only down/up elevation cycle must reuse unchanged history; record changes and the configured devotional-day rollover must still refresh it. Verify supported Glass and unavailable-frost CSS recovery separately, including upward/reversed scrolling, fixed header bounds, original hysteresis, one frost owner and readable opaque fallback. The new fallback fixture disables only positive frost feature queries, never product assertions. Preserve exact data/export checks alongside any compact Progress redesign.

Sharing footer text enlargement: after applying 200% text, verify the actual computed font and strict per-button overflow bounds in all engines. Copy image retains its wider column span; resetting its placement can strand it in the 44px back-button track in Firefox during font-relative container reflow. Keep ordinary phone labels and the existing enlarged-text viewport/action bounds intact.

CI browser scheduling uses nine Linux jobs with the complete existing inventory; each installs only its required browser engines. `pnpm test:e2e:inventory` rejects missing, extra or duplicate cases before publishing the matrix. `Quality / verify` requires the quality job, every browser job and every mergeable report; Pages still requires its successful exact-current-main workflow. Feature selection and the local smoke do not replace this full CI gate. Avoid another full local run merely to repeat an unchanged successful CI commit. See `docs/agent/TEST_STRATEGY.md` for focused development and scheduling-only validation.

## Reading reliability follow-up

- Exercise rapid Next/Previous, reversal, count bursts before rendering and reset during completion. Latest text/counter must match, partial counts must survive return/reload, and old completion must not advance another entry.
- Verify Later across repeated update events, navigation and reload; the same release is deferred 24 hours, a new release can appear, and About permits manual review without applying it.
- Preserve exact sharing bounds through 320px/200% text, live resize, font settling and short landscape windows. Passing retries do not establish the cause of a prior geometry failure.
- Browser evidence covers Arabic/English, reduced motion, keyboard/focus, target geometry, audio recovery and automated accessibility. Record physical checks separately in `docs/agent/evidence/reading-reliability/DEVICE_CHECKLIST.md`; do not claim human assistive-technology or device performance results from emulation.

This document makes the project checklist auditable. A recommendation is **met** only when its automated check passes or a dated manual test record exists. “Not applicable” requires a reason in the pull request.

## Automated gates

Every pull request must pass the pinned-toolchain check, `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test:e2e`, `pnpm build:pages`, and `pnpm audit:prod`.

These full gates run once in the Quality CI job for every application release. Pages waits for successful Quality for the exact current-main commit, then builds and deploys without duplicating its suite. During development, use affected unit/browser tests. Locally, the push hook runs frozen install, full `pnpm check` (or its unchanged, less-than-24-hour content-bound receipt), `pnpm test:e2e:fast` and Pages build. Broader changes and uncertain scope still warrant full local browser verification. CI never trusts the local receipt.

The local smoke includes offline Reader/counting and Settings recovery in addition to navigation/legal coverage. Browser runs produce a JSON timing report inspected with `pnpm test:timings`; retry costs must remain visible. Tooling tests run in Node, and CI forbids focused browser tests. An occupied preview port fails without terminating another session. See `docs/agent/TEST_STRATEGY.md` for the change-based selection policy.

| Concern               | Evidence                                                                                                              |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Type safety           | Strict TypeScript and `tsc --noEmit`                                                                                  |
| Code hygiene          | ESLint, React Hooks rules, JSX accessibility rules, and Prettier                                                      |
| Critical data logic   | Unit tests and enforced coverage thresholds for persistence, merging, progress, prayer calculation, and auth          |
| Accessibility         | Axe WCAG A/AA scans across onboarding, home, and settings; keyboard and touch-target checks                           |
| Browser compatibility | Full Chromium viewport matrix plus Firefox desktop and WebKit mobile core-flow smoke tests                            |
| Performance           | Screen lazy loading, Vite tree shaking, per-asset bundle ceilings, and a recorded baseline growth is measured against |
| Supply chain          | Exact pnpm pin, frozen lockfile, seven-day quarantine, and `pnpm audit:prod` on PRs and `main` pushes                 |
| Secrets               | Runtime environment variables; `.env*` excluded except `.env.example`                                                 |
| Deployment            | Pages requires successful full Quality for the exact current-main commit before building and verifies production      |

Dependency updates must be resolved with the pnpm release declared by `packageManager`. A package that is younger than `minimumReleaseAge` must not enter the lockfile through a local-policy bypass. Select an eligible reviewed release, wait for the quarantine to expire, or record an explicit security exception before changing `minimumReleaseAgeExclude`.

Current per-file production budgets are 480 KiB JavaScript, 164 KiB CSS, and 1 MiB for another asset, with compressed ceilings of 140 KiB per JavaScript file and 28 KiB per CSS file. The complete initial route graph, derived from Vite's build manifest, must remain below 250 KiB gzip including HTML, static JavaScript imports, and CSS. The recorded baseline is tighter than these backstops and must be updated downward after a material reduction; any increase requires a fresh production measurement and justification in the same change.

## Architecture rules

1. Use the existing layer-based structure documented in the README; do not introduce a competing feature structure.
2. Screens render and coordinate interaction. Put persistence and remote calls in `state.ts` or `src/lib`, static data in `content`, translations in `i18n`, and reusable visual patterns in `components`.
3. Use descriptive camelCase functions/values and PascalCase React components/types. Component filenames match their primary export.
4. Prefer typed props and function signatures. Add a “why” comment only when a constraint or decision is not evident from the code.
5. Search before creating a utility or component. Explain every new runtime dependency in the pull request.
6. Use theme variables and shared components before adding one-off colors, spacing, or motion.
7. AI-assisted code must be identified in the pull request and read, understood, tested, and reviewed by a human. Generated imports and prototypes are not evidence of correctness.
8. Update the README and relevant `docs/` source of truth when behavior, state, APIs, environment variables, or operational procedures change.

## Performance and resilience rules

- Lazy-load screens and genuinely heavy features. Avoid speculative memoization; profile before and after performance changes.
- Lists expected to exceed 20 visible items require pagination, incremental rendering, or virtualization.
- Images must declare useful alternative text, intrinsic dimensions where known, and lazy loading below the fold. Prefer WebP/AVIF for raster content.
- Debounce only expensive continuous input. Do not add polling when events, push, or user-triggered refresh is sufficient.
- Bound remote reads, avoid per-row calls, and document caching/invalidations beside the service boundary.
- Core reading, counting, and progress remain locally available. Remote sync failures must preserve local state and show actionable feedback.

## Accessibility and UX rules

- Use native elements first, one `main` landmark, logical headings, associated labels, and 44×44 CSS-pixel touch targets.
- Every action must work by keyboard with a visible focus indicator. Gestures need button alternatives.
- Meet WCAG AA contrast; do not communicate meaning by color alone.
- Announce asynchronous errors, loading, and meaningful state changes without making entire screens live regions.
- Support 200% text zoom, `prefers-reduced-motion`, RTL, narrow screens, safe-area insets, and predictable browser back/close behavior.
- Every asynchronous flow needs loading, success, empty, and actionable error behavior as applicable. Confirm destructive actions.

## Manual release record

Automation cannot prove the following. Complete and date this table for a release candidate; attach screenshots or issue links where useful.

| Test                    | Required result                                                                                              | Date / tester / evidence                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Keyboard-only core flow | Logical order, visible focus, no traps; onboarding → category → reader → completion → settings               | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts` (partial: tab order, visible focus, no trap) |
| Screen reader           | VoiceOver, TalkBack, or NVDA completes the same core flow with understandable names and announcements        | Pending                                                                                              |
| Text resize             | 200% browser zoom and largest app text setting do not hide content or actions                                | 2026-08-13 / automated / `e2e/manual-checklist.spec.ts`; one-line headings at 320/390/412 px         |
| Contrast                | Light, dark, high-contrast, and color-blind modes pass a contrast analyzer                                   | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts` (all 5 modes)                                |
| Responsive layout       | 320 px mobile, 390 px mobile, tablet, and desktop reflow without clipping                                    | 2026-08-13 / automated / includes OnePlus Nord 4 412×924, bounded onboarding, and zikr overview      |
| RTL                     | Arabic onboarding, navigation, category, reader, counter, and settings have correct order and icon direction | Pending                                                                                              |
| Safe areas              | iOS notch/home indicator and Android cutout do not cover controls                                            | Pending                                                                                              |
| Poor connectivity       | Offline banner appears; local reading/progress works; sync recovers after reconnect                          | Pending                                                                                              |
| Prayer time and DST     | Effective timezone/offset match the detected location; online and offline results use the selected method    | 2026-08-07 / automated / `e2e/manual-checklist.spec.ts`                                              |
| Performance             | Record cold load, interaction responsiveness, and React Profiler evidence on a representative mobile device  | Pending                                                                                              |
| Media access            | Audio alternatives/transcripts and image descriptions are correct wherever media is introduced               | Pending                                                                                              |

Until every applicable row has dated evidence, the project must not claim complete manual checklist compliance.

### Automated vs. manual rows

Five rows above are now covered by `e2e/manual-checklist.spec.ts`, which runs in CI on every push. They are dated as automated evidence.

The remaining rows are **not** automatable and stay `Pending` until a person does them:

- **Screen reader** — needs a real VoiceOver/NVDA/TalkBack session. Automated keyboard coverage is not a substitute; it proves focus moves, not that announcements make sense.
- **Safe areas** — needs real notch/cutout hardware.
- **Performance** — needs a representative mobile device and profiler traces.
- **Media access** — needs human review of alternatives and descriptions.

The keyboard row is marked partial for the same reason: the automation proves tab order, focus visibility and absence of traps, but a human still has to confirm the flow is _sensible_.

## Sharing refinement checks

- The owner-approved Include sources control overrides older mandatory image/source checks: on by default, sources can be omitted from image, Text and ZIP exports. Verify first-listed reference selection without invented ranking, at most two visible source lines, ellipsis for unusually long names with preserved reference number, semantic preview agreement and original full citation in source-enabled Text/ZIP. Canonical reviewed payloads, glossary attribution and reminder QR/reading links remain intact.

- Compact collections: inspect source/count metadata row separation, full citations without repeated headings, 24px panel ink clearance, 20px gaps and unchanged 52px Arabic reading size. Confirm short passages center while long passages align right; short items stay intact and long readings continue on numbered cards without truncation. Toggle the optional subtitle and inspect header separation. Verify plain website text in every palette, Western export numbering in English and Arabic-Indic numbering in Arabic, preserved Text/ZIP source strings and unchanged QR/URL/filename digits. Single-card repetition pills retain their 16px clearance. The compact collection contract supersedes the older collection-pill and website-badge checks below.

- Inspect mirrored preview/settings columns at wide widths, preview-first compact reflow, short landscape windows, native disclosure indicators and collapsed additions summaries. Check unavailable-size descriptions, size/language help associations, visible selection checkmarks, dropdown Escape/focus restoration, enlargement exit, and controls scrolling above the footer.

- Complete quotations and selected additions either fit together or continue across measured numbered cards, without lost characters or reduced reading size. Each continuation repeats its heading and selected citation. Verify exact semantic Quran slices against drawn QCF glyphs, whole-item Text/ZIP payloads without duplicate narrations, all 21 Benefits independently of the visible batch, and matching Arabic/English exports.
- Both studios expose identical Story/Square/Portrait/Tall choices and dimensions through the shared selector, with at most two destination tags per size. Check keyboard selection/Escape, 320px/enlarged text, font settlement, compact preview bounds, all four ayah formats and Home trigger focus/identity recovery. Receiving-platform compression, crop, native share-sheet selection and human assistive-technology checks remain manual acceptance.
- Reviewed multi-page surahs export name, reviewed benefit/source and an exact Mushaf QR/link; no verse payload in image, Text or ZIP.
- Current/Selected/Entire-collection scope matches both files and archive text; unsupported native payloads expose Save/Copy.
- Check 320px width and 200% text: compact header/action footer remain visible, scrolling focus is unobscured, keyboard stays in the modal, and Escape restores the trigger.
- Inspect actual olive/gold/lavender exports and single/reminder cards. Real social compression, QR scanning, Android/iPhone share sheets, cutouts and human screen-reader checks must be recorded separately from browser emulation.
- Inspect Arabic/English pill ink bounds, its exact 16px gap, proportionally enlarged brand, header/title separation, website badge contrast, QR clearance and multi-card-only numbering. Check contextual single-zikr titles versus collection titles, Portrait reminder defaults and all four available formats; branding must not split or remove content.
- Verify content presets, independent English translation and Arabic-only reviewed word explanations, glossary attribution, hidden unavailable glossary options and unchanged full-text/format recovery. Ordinary cards have no scan instruction above the website; reminder QR labels belong beside their code.

## Verified audit remediation checks

- `pnpm check` gives each run its own `coverage/check-<pid>` and `output/check-build-<pid>` directories. Bundle and CSS checks read that same build; their optional directory argument defaults to `dist`, preserving the Pages gate. Concurrent local checks must not combine coverage files or hashed build assets.
- Download and removal actions stay disabled while storage readiness is loading, so initial refreshes cannot clear a job's error or cancellation feedback.
- Verify Arabic/English Back and Previous/Next icons separately from the physical Mushaf page-turn controls.
- Inspect partial, empty, full and restored progress in both directions; translated fills must retain clipped geometry and divider thickness.
- Exercise menu keyboard focus in Light, Midnight and Dark, Escape focus return, OS reduced motion, and in-app reduced motion with OS motion enabled.
- Inspect compact sheet surface and inset ownership. Real cutout/gesture-navigation hardware, sensor feel and TalkBack/VoiceOver checks remain human evidence requirements.
- Capture current bundle measurements; never claim input latency or frame-rate gains without a representative-device trace.

- Sharing footer: verify Share/Save/Copy labels and decorative icons, one ordinary phone row, non-wrapping enlarged labels, 44px targets, matching selected payloads, explicit unavailable sharing, visible clipboard errors and quiet success announcements.

### Waveform player refinement

Verify one progress control per player form, RTL timeline/transport in Arabic and LTR in English, mirrored transport geometry and aligned icon centres, waveform source checksum coverage and truthful missing-data fallback. In Arabic, Previous/rewind are on the right and Next/forward on the left; Left Arrow seeks forward and Right Arrow seeks backward. Confirm manual Previous/Next with continuation off, final-natural-ending-only completion, internal segment/ritual progression, and independent prescribed-repeat state. Volume opens only on click/keyboard, remains vertical, changes no row geometry, and closes on Escape/outside press with correct focus restoration; iOS uses hardware volume. Retain narrow/landscape/200% text, all-theme axe and manual physical-device/screen-reader checks.

### Required audio release verification

Local pnpm check includes deterministic audio metadata validation. Quality CI additionally requires pnpm validate:audio for every approved hosted recording before deployment. No recording checks, coverage thresholds or budgets are removed.

### Shared-card divider clearance — 2026-10-05

Export rows reserve the measured alphabetic ascent and descent of their actual displayed glyphs, plus at least 8 pixels of trailing leading. Separators sit within a 40-pixel section gap, leaving at least 20 export pixels from visible text on either side, including Arabic diacritics. This applies to single-card supporting sections and combined-card source/count rows. Browser evidence must assert actual ink-to-divider clearance; nominal font size or line boxes alone are insufficient.

### Android release acceptance

Follow [docs/ANDROID.md](ANDROID.md). Require Android compilation, lint and native unit tasks in Quality in addition to the unchanged web matrix. Preserve signed-build, physical-device/TalkBack, offline audio/external export, widgets, permission/reboot/timezone and Play Console evidence separately from automated web checks. Verify that only the two permission-pending Muhammad Al-Shara recordings are excluded from Android and that Abdullah Muhammad/English downloads and exports remain available.

## Sharing steps and option integrity — 2026-10-19

- Test Content/Design/Share and the shorter Text/Link/supplied-artwork paths; Previous/Next and direct step navigation preserve selections and announce context by heading focus.
- Verify absent/whitespace/reminder/wrong-language additions, partial coverage descriptions and exact image/text/ZIP content. Canonical zikr/dua English coverage is a corpus regression; Quran Benefits and Home use existing reviewed meanings.
- Every dropdown has a visible label/value, clear chevron, rectangular field boundary, keyboard selection, expanded state, Escape recovery and focus return.
- Check current/selected/all continuation cards, including a multi-card single reading; keep stale generations out of exports and release blob URLs.
- Exercise phone/desktop, 320px, 200% text, short landscape, RTL/LTR, themes, reduced motion, focus containment/return and visible Save/manual-copy recovery. Sticky preview must never intercept settings or selection.
- Retain physical native sharing/clipboard/OS download and human assistive-technology acceptance separately from automated checks.

Sharing arrow acceptance checks the actual rendered SVG tip direction and button positions in both languages, generated and approved artwork. Require complete visible 44px controls, nearby card/counter grouping, correct boundary disabling, pointer Previous/Next and keyboard ArrowLeft/ArrowRight/Home/End on the active collection.

Regenerate while viewing a later card: publish only the first replacement page, assert the prior selected image and count remain visible, and verify navigation/Save stay disabled. Resolve a shorter replacement sequence and verify the new first card becomes available.

Sharing action reflow is checked at 200% text size in Firefox as well as Chromium/WebKit, including Progress-card sharing. Preserve strict scrollWidth <= clientWidth assertions for every action, and capture the enlarged footer. Wird evidence tests enter Design/Content/Share through the actual step navigation while retaining every export, source, text/link and return-focus assertion.

Sharing follow-up acceptance: assert connected step progress, full-width phone fields, image/frame geometry in expanded and collapsed states at 320/390/834/1280px, outward card arrows, live generation retention and keyboard focus. Quran-wird responsive cases verify phone stacking, tablet/desktop columns, compact week history and 320px/200% text without horizontal clipping. Retain browser-engine and export assertions.

Caption acceptance: compare the exact shown caption with intercepted native file-share data, default attribution-only sharing, selected-card changes, full text copying/saving and exact reading-link copying. Generic home/progress URLs must not gain a reading-link action. Test missing/denied clipboard focus/selection recovery, image-state preservation, approved-artwork metadata, offline source/translation exports, RTL/LTR and narrow/enlarged layout. Native receiving-app caption handling still requires physical-device acceptance.

At normal text sizes, measure actual text-line rectangles for the scope dropdown and export labels at 320/390/834/1280px in both languages. Preserve 200% text recovery separately. Owner confirmation is required before publishing the current local sharing/wird refinement.

## Compact Quran wird form acceptance — 2026-10-19

Verify four top-level choices and the three schedule kinds, all six saved plan types, exact custom/repeating ranges, unchanged reading position/history, draft-only changes and Cancel. Check visible labels/hints, selected-state cues, keyboard choice/Escape/Enter submission, focus return and minimum 44px targets. Capture Arabic/English 320/390/834/1280px and 200% text, including the Juz selector and custom fields; no horizontal overflow or clipped labels. Run QuranWirdScreen/quranWirdGoal/state/i18n units, quran-wird-plan-form and existing khatmah-reader planning regressions plus responsive overview checks, full pnpm check and Pages build. Native receiving-app sharing and the separate Progress redesign remain outside this form change.

## Sharing board adaptation acceptance — 2026-10-19

Measure balanced settings/preview columns and Arabic/English placement at 834/1280px; verify intrinsic real-image bounds, nearby outward arrows and container reflow at 320/390px and 200% text. Skip design must preserve format/content/current image, focus Share and remain disabled during an operation. Keep exact caption/native/download/link assertions, clear stage-local status, verify visible precise feedback and actual retry/manual-copy recovery. Retain the default 390px scroll bounds and full-width phone fields. Check both generated/approved cards and the Ayah studio, selected states, keyboard/focus/Escape, axe and existing source-integrity rules.

For the board-inspired sharing finish, compare the actual browser capture with both supplied boards at matching dialog widths, including focused crops of the header, illustrated choices, menus, selection marks and footer. Verify decorative icon semantics, descriptive choice names, keyboard activation, rectangular buttons, preview panel padding, two-column additions, light/dark themes and full-width phone fields. Keep unchanged 200% footer bounds and 390px default no-scroll assertions; use actual computed grid geometry rather than the former inline column implementation. Capture and inspect console errors with the test-only visitor endpoint explicitly fulfilled. Record the final comparison in project-root design-qa.md.

For the larger sharing stepper, assert at least 32px circles, at least 5px label clearance, positive connector width centered on each circle, neutral/primary distinction and the exact completed/current/upcoming fill in RTL/LTR. Wait for the browser style frame through ordinary retrying assertions, never a fixed delay. Include collection and Ayah studios at 200% text; retain unchanged no-scroll and header/footer bounds.

## Footer and sharing feedback — 2026-10-20, local only

Verify labelled and icons-only devotional controls at 320px, normal/enlarged text, Arabic/English and all reader/counter layouts. Check 52px targets, complete accessible names, label reflow, focus recovery and persisted choice after real reload; legacy/invalid/synchronized values must preserve valid local settings. English meaning replaces Arabic only on explicit toggle without counting; Arabic/no-translation/long-Mushaf surfaces keep their existing behavior. Sharing phone previews remain in normal flow during upward/downward scrolling, first step omits unavailable Previous, and final three export targets have consistent ordinary heights. Test actual keyboard/pointer feedback with motion enabled and independently with app/OS reduced motion; retain sharing export, error/status, caption, focus and axe assertions. Physical touch and human assistive-technology acceptance remain separate.

## Remembered reading and feedback polish — 2026-10-20

Verify readerMeaningOnly survives leaving Reader/reload and is never uploaded or accepted from another device. Missing/invalid values default to Arabic; unavailable meanings preserve original text and the stored choice. Confirm language control bounds stay fixed while text scrolls and its accessible control relationship/focus survive switching. Test readonly live footer styles on cold Settings entry, both locales, normal/enlarged text and disabled sample semantics. Exercise actual native scrolling/keyboard recovery at 844×390 and 320×480/200% without shrinking targets or altering full Mushaf. Check finite color/press feedback, labelled/icon-only depth, details-key activation, cancellation, semantic unavailable controls and independent app/OS reduced-motion recovery. Physical-phone thumb reach, safe-area/keyboard interaction and human screen-reader acceptance remain pending until performed on hardware.

Progress mobile acceptance includes full-width field stacking, one-line selected values and option labels without shrinking/truncating text at 320/390px and 200% root text. Check every short metric name against its full card/description and export scope. Arabic timeline markers and earliest/latest labels must run right to left, English left to right; exercise pointer clicks at both ends, physical Left/Right, Home/End and range readouts. Verify adjacent fill/partition bars begin at the language start edge. Source records and exported chronology must remain unchanged. Coordinate with active shared-popup and prayer-countdown sessions before touching their files or duplicating their verification.
Final Progress/Mushaf polish: verify selected-date-first semantic order, retained range across tabs, uniformly legible exact Records in Glass/solid/fallbacks, and compact date header/Close/input hit testing at 320px/200% text. Toggle colour swipes in both hosts, verify disabled gestures leave the theme unchanged after reload and retain horizontal navigation/native scrolling, and expand/collapse the concise guide without closing settings. Missing/malformed preferences default on; remote merges preserve the local choice. Retain current paper during delayed turns, stale-request cancellation and independent meanings loading. Real phone performance and TalkBack/VoiceOver acceptance remain separate manual evidence.

The date-first grid must use a zero-minimum track so enlarged disclosure labels cannot force wider-than-viewport fields. Assert actual field overflow, trigger/menu width agreement, complete date-first keyboard order and covered-control recovery. Compact date fields are portalled; scope interaction to the named sheet. Scroll diagnostics must open real optional detail when the focused overview fits, retaining wheel/touch and frame assertions without synthetic page height. Compare related responsive geometry within one browser layout sample.
