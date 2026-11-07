# Phase Report — Progress and application visual consistency

## Objective

Make Progress calmer, more legible and efficient across phones, tablets and desktop; align ordinary page titles/spacing and inspect the rest of the application for coherent controls, cards, material, icons and purposeful motion. Preserve offline reading, saved data, reviewed content and every release gate.

## Scope completed

This is the owner-directed continuation of PROGRESS_FILTER_EXPORT_2026_11_01, including successive screenshot corrections. The earlier 75ef3458 candidate was canceled before deployment because it was superseded. Source review covers the screen families below and shared presentation primitives; browser evidence samples actual core routes and states. This is not a claim that every possible saved-data, device or assistive-technology combination has been manually accepted.

| Screen family                     | Improved                                                                                                                                                                                                                                                     | Deliberately retained / checked                                                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress                          | Visible shared title; common frame/gutters; two tabs; compact mobile filter; equal adjacent control heights; rounded compact empty image; four/two/one metric columns; reusable neutral metric cards with clear values/unknown states; Settings-owned export | Exact inclusive date scope, civil/devotional boundaries, known goals, truthful zero/absence, chart tables, fitting calendar/date sheet, full-width opaque sticky protection |
| Library / saved items             | Shared title recipe, enlarged title/tab height alignment, narrowed motion properties                                                                                                                                                                         | Stationary controls with separately scrolling list, native filter disclosure, existing cards, selected state, saved count and 44px tabs                                     |
| Search                            | Shared visible title/back band and outer frame; localized short title with separately visible field label                                                                                                                                                    | Deferred search/index behavior, original document title, query normalization, batches, recent search recovery, live result count and reviewed result text                   |
| Quran wird / Qibla                | Shared title band/gutters; Qibla single-column zero-minimum layout prevents enlarged English overflow                                                                                                                                                        | Plan/form presentation, purposeful wider grids, compass controls and existing calculations                                                                                  |
| Friday / prayer detail / Benefits | Common outer header/content gutters and consistent utility gaps; Friday fills reuse accessible shared transform progress bars                                                                                                                                | Reviewed sources, prayer/Friday logic, sticky filter ownership, cards, sharing entry points and exact ratios                                                                |
| More utilities                    | Tile icon/copy reflow, consistent section gap                                                                                                                                                                                                                | Existing line icons, themed surfaces and one native action per tile                                                                                                         |
| Settings                          | Shared title anatomy, responsive gutters, explicit full backup versus dated Progress JSON in one export sheet                                                                                                                                                | Two-pane hierarchy on wider screens, narrower readable forms, visible labels, native fields, existing restore/reset/account actions                                         |
| Home                              | Narrow broad transition declarations to actual changing properties                                                                                                                                                                                           | Prayer frame alignment, opaque/Glass material contracts, time hierarchy, current/next selection, shared action cues and both reduced-motion preferences                     |
| Reader / Masbaha / Salawat        | Explicit compact-header opt-in; narrower transition properties; bounded Undo arrival                                                                                                                                                                         | Centered devotional toolbar, content measure, reading/counter focus, full-canvas count ownership, completion recovery, footer/picker and reduced-motion contracts           |
| Mushaf                            | Narrow theme-swatch transition properties                                                                                                                                                                                                                    | Edge-to-edge paper, separate printed-page appearance, stationary tools, gesture/tap ownership, protected search/pickers and page-turn motion                                |
| Onboarding / completion / auth    | Consistency review and existing responsive regression coverage; no visual rewrite                                                                                                                                                                            | Deliberate centered/focused task layouts and next-action hierarchy; these are not ordinary browsing-page headers                                                            |
| Shared overlays / controls        | Progress adopts shared field/select shells; shared select chevron gets a brief state transition; explicit export busy/error/save feedback                                                                                                                    | Portalled opaque dropdown protection, collision/height limits, native labels, keyboard recovery, sheet/dialog motion and safe areas                                         |

The development-only audio-content review tool is not treated as a public ordinary page. No new runtime dependency, icon library, religious-content edit, state schema or sync behavior is introduced.

## Files changed

- Presentation: LayoutShells, ProgressMetricCard, ProgressDashboard, ProgressRangeToolbar, ProgressSelectField, select-field.css, ReadingScreenChrome; affected screen and Settings wrappers; shared layout/surface tokens and Progress CSS.
- Export: App callback, progressExport, DataExportMenu and Settings Account & data contract.
- Motion consistency: existing HomeCards, DailyCompanionsCard, PrayerTrackerCards, ProgressViews, MushafQuickMenu, Reader and Library transitions; FridayProgressStats uses existing ProgressBar.
- Localization: progressDashboard plus Arabic/English Search title; release manifest and generated archive.
- Evidence: page-layout-consistency and progress-card-design browser specs, updated affected Progress/Settings/responsive flows, focused unit regressions and this report.

## Components added or modified

ProgressMetricCard is presentation only: the dashboard supplies indexed normalized values, localized captions and navigation. It uses the existing icon export layer, typography/theme tokens and ProgressBar. DataExportMenu uses the existing ResponsiveSheet, FormField and Button. Export processing loads on intent; no reusable visual component reads storage or calls a remote service. Shared headers/fields are reused rather than duplicated.

## User-visible changes

- Ordinary titles occupy one predictable band with a shared 80rem outer measure and responsive 16/24/32px default-size gutters. Subtitles sit below that band and cannot raise titles.
- Adjacent date selector and view buttons have the same actual row height and top edge, with a 48px minimum and intrinsic enlarged-text growth. Phone dates remain behind the filter icon with the applied scope visible.
- Wide empty periods use a 176px-wide rounded image beside text/actions. Measured at 834px and 1440px: empty panel 166px high, image radius 20px, picker/tabs 50.796875px high with zero top offset. Phone imagery remains bounded and stacked.
- Metric cards use stable theme surfaces, consistent line-icon tiles, dominant 30px values, subordinate denominators/captions and aligned flexible footers. Zero saved records and unknown goals remain distinct; count-only Quran pages do not invent a progress denominator. Arabic and English values align with their own language direction.
- Progress retains Overview/Trends; JSON is under Settings → Account & data → Export beside the existing restorable full backup.

## Accessibility work

Native buttons, headings, labelled fields, tabs and progress semantics remain. The card has one full-area action with a visible full-card keyboard outline. Menus retain protected opaque portals and 48px options; native date picker internals follow the platform. Completed mobile filters restore their visible opener; sheet/calendar recovery remains. Export range validation, double-submit protection, frozen submitted dates, aria-busy and truthful error/save announcements are covered. No color-only status or claim about unrecorded worship is added. Both application and OS reduced motion retain static feedback and remove movement.

## Tests added or updated

- page-layout-consistency: twelve ordinary routes in Arabic/English, 390/834/1680px and 320px/200% text; title coordinates/type/wrapping, frame/gutters, adjacent control geometry, image radius/size and metric columns; default/app/OS motion modes.
- progress-card-design: three themes × Solid/Glass × empty/recorded states, Arabic/English, phone/tablet/desktop/enlarged widths; footer/value alignment, target sizes, theme material, focused activation and scoped axe checks; high-contrast and forced-color recovery.
- Existing Progress cases retain exact metrics, calendar/date semantics, chart tables, keyboard navigation and bounded opaque menus. Retired Records-tab expectations move to Settings export/retained exact chart data, including downloads of both complete backup and exact dated progress JSON.
- Units cover export boundaries (including overnight civil/devotional scopes), no snapshot mutation, file failures/retry, busy/double-submit protection, stale success clearing, invalid ranges, zero/unknown captions, visible Search title/label and exact Friday ratios. Original Friday future-period/salawat regression cases are preserved.

## Commands run

| Command / selection                                                  | Result recorded during implementation                                                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| pnpm typecheck                                                       | Passed after metric-card extraction; final complete gate remains authoritative                                           |
| Targeted nine unit files                                             | 53 passed in 8.85s; Friday original/new regression file subsequently 4 passed in 4.48s                                   |
| Progress/layout/reading/Settings Chromium selection                  | 60 passed in 4.7m                                                                                                        |
| Title/header Chromium + Firefox + WebKit                             | 36 passed in 3.9m                                                                                                        |
| Motion/trend/reference Chromium + Firefox + WebKit                   | 27 passed in 5.4m                                                                                                        |
| Wider layout/calendar/header across three engines                    | 54 passed in 6.2m                                                                                                        |
| Final spacing/header Chromium proof                                  | 15 passed in 1.0m                                                                                                        |
| Card theme Chromium selection                                        | 8 passed in 1.7m                                                                                                         |
| Ordinary geometry/card theme Firefox + WebKit                        | 38 passed in 6.2m                                                                                                        |
| Broader Chromium responsive/search/motion/reading/Progress selection | 64 passed, 2 Library enlarged-title alignment failures; corrected and re-proved separately, without weakening assertions |
| node scripts/check-motion-rules.mjs                                  | 0 errors, 1 existing documented Mushaf overscroll warning; its gesture contract remains intact                           |
| git diff --check                                                     | Passed                                                                                                                   |

Earlier interrupted Windows runs encountered host memory pressure and a closed WebKit process; passing targeted reruns replace those incomplete results. The new card-test material expectation initially assumed an opaque RGB paint in Glass; corrected to assert shared nonzero-alpha material, equal card paints, Solid opacity and actual contrast. This preserves the documented Glass contract.

Final exact-input quality, hook, CI and production acceptance results are reported with the shipped commit in the final release response; those release checks follow the implementation evidence above. The machine-readable logs/screenshots live under ignored output directories, rather than being bundled into the app. No receipt or successful release result is fabricated here.

## Visual/manual evidence

Current review artifacts are in output/progress-implemented-2026-11-01, with subsequent metric-theme crops under output/metric-card-design and geometry captures under output/library-title-alignment. Browser screenshots use synthetic guest data. Compare actual empty and populated phone/tablet/desktop screens, three theme palettes and Glass separately. Inspect real screenshots in addition to computed geometry and axe; automated contrast checks cannot prove composited text legibility or all physical-device behavior.

## Documentation updated

Architecture, design system, motion system, design-spec coverage, quality checklist, active phase, decision log, agent index and bilingual release notes/generated archive. Earlier historical descriptions remain explicitly superseded by the new decisions rather than silently rewritten.

## Decisions recorded

Shared ordinary title bands/gutters; matched controls/compact wider empty state; reusable adaptive metric hierarchy; app-wide consistency sweep; mobile filter disclosure; two Progress tabs; Settings export ownership. Back slots, two-pane hierarchy, focused text and immersive reading remain purposeful differences.

## Known limitations or remaining risks

The fixed 12MiB build gate identified 4,840 bytes of output overrun. Asset review found a superseded 91,651-byte optional timing pack with no active code/public/script reference; the active package is identical in the last production commit and current release. Preserve the old pack byte-for-byte in docs/agent/evidence/audio-timing-archives (SHA verified) instead of deploying both versions. The active loader/validator and 285 current records remain unchanged. Very old installed bundles requesting the superseded uncached URL can fall back to playback without those optional estimated highlights; the existing graceful fallback remains. No bundle ceiling or data/content assertion is weakened.

Physical Android/tablet behavior, human VoiceOver/TalkBack acceptance and field performance remain manual acceptance work. Browser automation and sample data establish the tested combinations only. Native date-picker appearance and operating-system share/save destinations remain platform-owned. The source audit is broad; it is not exhaustive visual acceptance of every possible account, reading and settings state.

## Out-of-scope findings

No new product feature, religious-content edit, database or remote authorization change. The existing Mushaf overscroll exception is documented and retained because it prevents paper bounce from interfering with page turns.

## Recommended next step

Complete the unchanged exact-input local gates, push the verified release, monitor Quality/Pages and confirm the live application and offline core. Then review the supplied screenshot set together and perform physical-device/assistive-technology acceptance for the changed surfaces.
