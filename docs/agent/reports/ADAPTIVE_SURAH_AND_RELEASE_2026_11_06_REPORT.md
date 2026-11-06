# Phase Report — Adaptive surah entry and release

## Objective

Deliver the approved responsive layout and visual refinements with stable page following and verifiable performance.

## Scope completed

- Adapted the existing long-surah entry to its available width and height.
- Clarified progress and notification states while keeping the existing material system.
- Separated the audio cue from the last timed verse used to locate the page.
- Corrected browser regressions for the approved Mushaf cue, fixed chrome, optional overnight reminders, compact layouts and asynchronously mounted controls. Raised the browser shard limit from 75 to 105 minutes after the Ubuntu mirror used 52 minutes for the WebKit installation alone.

## Files changed

Reader, Quran Wird and Progress presentation, notification readiness, Quran timing lookup and hook, the associated styles and translations, the release manifest and archive, browser and unit tests, and the Quality workflow.

## Components added or modified

ReaderScreen, QuranWirdScreen, ProgressDashboard, ProgressHeatmap, ProgressMetricCard, ProgressRoutineComparison, NotificationUpcoming, NotificationsPanel, PagedQuranListeningReader and QuranSurahListeningReader.

## User-visible changes

Surah artwork fills more of the screen with a focused crop and one primary reading action. The next configured reminder appears above permission and delivery controls. Progress distinguishes unrecorded pages from measured goal results. Breath gaps clear the word cue while holding the current reading position.

## Accessibility work

Retained 44 CSS px controls, logical RTL/LTR order, enlarged-text reflow, visible focus, meaningful progress text and reduced-motion styling. Browser tests exercise keyboard access and run the existing automated accessibility checks.

## Tests added or updated

Responsive artwork and fallback, exact over-goal and empty states, material scroll and focus regressions, and controlled audio positions during a gap and after resumption or rewind.

## Commands run

| Command                                                | Result                                                                                                                                                                |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused Vitest screen, calendar and reminder suite     | 84 tests passed in 7 files.                                                                                                                                           |
| Focused Vitest timing, media clock and listening suite | 37 tests passed in 3 files.                                                                                                                                           |
| Chromium component and performance sweep               | 76 passed, including all four throttled scrolling tests. The remaining case measured the image inside its border. The corrected 320 px case passed in the next sweep. |
| Deployment gates                                       | Full local and exact-commit workflow results are tracked in the release verification.                                                                                 |

## Visual/manual evidence

Browser captures are under `output/playwright/adaptive-surah-release`, including phone/tablet/desktop surah layouts, Home, Progress and notification settings, and the Mushaf during and after a breath.

## Documentation updated

Design system, Quran timing authoring contract, phase index, decision log, phase brief and bilingual release notes.

## Decisions recorded

The 384w and 768w WebP sources and bundled fallback suffice for the tested layouts. Dense Glass panels increase tint on the existing owner without an extra backdrop filter. Multi-item surah entries show Previous and Next below the artwork and actions at every width.

## Known limitations or remaining risks

Browser emulation and controlled media time do not cover physical-device notification delivery, native playback timing or a manual assistive technology review.

## Out-of-scope findings

The Ubuntu package mirror delayed browser setup. The release keeps the complete engine and assertion inventory.

## Recommended next step

Confirm exact-commit Quality and Pages results and smoke the deployed application.
