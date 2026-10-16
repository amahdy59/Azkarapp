# Phase Report — Home prayer grid, notch and compact widths

## Objective

Apply the requested notch connection, narrower equal-width prayer summaries and 2px additional top/inline padding. Verify local screenshots before another push.

## Scope completed

- Capped the centered overview at 60rem, with equal growing tracks and a 9.75rem compact minimum (previously 10rem). Desktop cards are about 184px at the cap, compact cards 156px at ordinary text size.
- Increased top/inline header and footer inline insets to 14px, retaining 12px header bottom padding. Time digits remain 16px; existing period markers use secondary 12px typography, and compact cards use a 6px minimum column gap (10px on wider cards).
- Added paired small rounded tabs below the selected summary and above its expanded panel. The selected summary tab points downward and the panel's receiving tab upward. These are stationary, pointer-transparent, opaque in solid modes, forced-color aware, and add no backdrop filter. The row reserves bottom space for the selected tab without clipping its native scroller.
- Kept full-card native activation, progress outside button semantics, aria-expanded, focus, source/timing/recording rules and local publication hold.
- Aligned both tips to one measured horizontal anchor, following row scrolling and resize; both tips hide together when the summary leaves the visible row.
- Owner-approved correction replaces side-swapping desktop placement with a full-width disclosure beneath the summary row. Wider screens use two internal columns; contextual cards stay in fixed horizontal positions beneath it. Phone reading order stays stacked.
- Removed decorative top/bottom Home utility-header strokes, preserving existing tinted/scrolled contrast and focus indicators.
- Fixed an existing single-Sunnah checkbox presentation bug: after clearing, false split fields no longer mask a later true aggregate value. Existing legacy split completions remain visible; Dhuhr's before/after fields remain independent. Record writes, normalization and reviewed content are unchanged.
- Unified the Home utility header and main content on a centered 64rem outer measure. Existing responsive page gutters yield a 60rem desktop content grid for prayer summaries, expanded detail, contextual pair, Wird and lower sections. The selected compact card stays fully visible next to another card on phones with the same 8px gap used on desktop; decorative tips are aligned on first paint.

## Files changed

- `src/app/components/home-wird.css`
- `src/app/components/PrayerTrackerCards.tsx`
- `src/app/screens/HomeScreen.tsx`
- `e2e/home-clarity.spec.ts`
- `e2e/compact-prayer.spec.ts`
- `e2e/counter-feedback.spec.ts`
- `e2e/home-glass-material.spec.ts`
- `src/app/hooks/usePrayerNotchAlignment.ts`
- `src/app/content/prayerActions.ts` and its new regression test.
- Design-system, decision log, active Home phase and this report.

Earlier unpushed full-card interaction changes remain preserved and reported separately.

## Components added or modified

Existing prayer summary and expanded Home panel classes only; no new component/dependency or persisted data.

The alignment hook observes existing surface geometry and schedules decorative updates with animation frames; cleanup removes its observers, listeners and properties.

## User-visible changes

Smaller consistently sized cards, more top/side breathing room, full-size time digits with secondary period labels, and aligned rounded selection/expanded-panel tabs. The expanded panel spans the same Home grid as the prayer row and lower content; Maghrib/Isha keep neighboring content in place. Phone selection shows a neighboring prayer beside the chosen one instead of an empty stretch. The Home utility header has a quieter borderless edge.

## Accessibility work

No connector pointer target or animation. Original button semantics, full-card keyboard focus and native progress remain; text is complete and naturally enlarges. Equal card/footer geometry, actual padding and full-footer pointer/keyboard interaction are verified in Arabic/English and 200% text. Reduced transparency/forced colors keep static opaque cues. Automated checks do not replace real assistive-technology/device acceptance.

## Tests added or updated

- Actual 14px content inset measurements, equal dimensions and smaller desktop width cap.
- Assert exactly one selected card, matching expanded prayer, decorative pointer-transparent paired tabs, no nested blur and enough scroller clearance.
- Retained strict name/time/status alignment, footer text containment, native keyboard/focus, full-footer activation, 200% text and original CI geometry reproduction.
- Initial narrower English run exposed Maghrib/time wrapping. Secondary period typography plus 6px compact column gap resolved it without reducing main time digits or widening individual cards.
- Assert paired centers differ by at most 1px in every prayer selection, both languages and phone/desktop; scroll/restore checks verify the anchor follows the row. The initial phone test reached an automatically selected off-screen Isha card; it now reveals that card before asserting visible alignment, preserving normal manual scrolling behavior.
- Every available checkbox for all five prayers is exercised by pointer and Space, checked/unchecked, saved across reload and independently cleared. Full-width panel and fixed contextual positions are asserted in both languages on phone/desktop; tablet/desktop geometry assertions now enforce the new approved contract.
- Initial all-checkbox test incorrectly tried opening all past prayers outside their availability window; its clock now holds each prayer inside the existing window. The corrected test exposed the real single-Sunnah rechecking bug, covered by seven targeted unit regressions and the browser on/off/on flow.
- Assert equal 8px small-card gaps at phone/desktop sizes, at least two visible cards at 390px, selected-card visibility, notch visibility, and the common content/header gutter alignment with the expanded and lower cards.

## Commands run

| Command                                                                                                  | Result                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test:run src/app/screens/HomeScreen.render.test.tsx src/app/components/PrayerActionsCard.test.tsx` | 28 passed; 11.64s                                                                                                                                |
| `pnpm test:run src/app/content/prayerActions.test.ts`                                                    | 7 passed; 2.53s                                                                                                                                  |
| `pnpm check`                                                                                             | Passed in 75.3s on the final implementation: unit coverage, typecheck, lint, formatting, build, content/timing validations and bundle/CSS checks |
| Targeted Chromium Home, compact prayer, detail and glass specs                                           | 29 passed in 1.2m: both languages, 390/1440px, all five prayer checkboxes, layout geometry and normal glass                                      |
| Targeted Firefox and WebKit compact prayer and Home clarity specs                                        | 16 passed in 5.2m: Maghrib/Isha, phone/desktop, narrow widths, enlarged text and keyboard focus                                                  |
| Additional WebKit Arabic desktop Fajr, Dhuhr and Asr checkbox groups                                     | 3 passed in 1.3m: completes five-prayer Arabic desktop WebKit checkbox coverage                                                                  |

The screenshot tests explicitly exercise normal glass in Chromium (system-reduced transparency is separately covered). Cross-engine and final grid checks follow. The original 4 all-checkbox fixture failures and 4 Sunnah regression failures are explained above; assertions and deadlines were retained. Because Windows WebKit can take tens of seconds per checkbox click, the all-prayer browser flow is divided into bounded prayer groups with unchanged interaction assertions and the same 90-second deadline.

## Visual/manual evidence

Actual local phone/desktop captures include ordinary and selected-notch states in both languages. The earlier notch prototype is retained under `output/playwright/home-prayer-notch-2026-10-16/`; the owner-approved unified grid, full-width disclosure, Maghrib/Isha and checked states are retained as `final-*.png` under `output/playwright/home-prayer-fixed-panel-2026-10-16/`. The final captures explicitly use normal glass; system-reduced transparency remains separately covered.

## Documentation updated

Design-system, prayer-time domain contract, decision log, index, active phase and this report. No release notes changed because no new publication is authorized before image review.

## Decisions recorded

The owner explicitly requests the previously proposed notch effect, smaller consistent widths and 2px larger top/side padding. The paired static rounded tabs implement that proposal without changing the responsive shell or drawing a continuous bridge across another column.

## Known limitations or remaining risks

The paired tabs identify related surfaces; they are not a literal continuous glass bridge. Both centers now align within 1px across supported engines. Native glass rendering varies by browser/GPU. Future prayer details retain the existing availability rules.

Owner review raised a layout-stability concern about swapping desktop halves for Maghrib/Isha and a later mobile empty-space concern. The owner approved the fixed, full-width disclosure and common Home grid; both are implemented locally and supersede the earlier prototype.

## Out-of-scope findings

The preceding pushed commit remains undeployed after its CI status-row failure. The local full-card follow-up fixes that assertion and is still awaiting owner image review; no additional push performed.

## Recommended next step

Review the supplied local desktop/phone images before any further publication.
