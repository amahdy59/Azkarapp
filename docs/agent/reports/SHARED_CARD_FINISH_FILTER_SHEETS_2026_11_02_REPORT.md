# Phase Report — Prayer-inspired cards and stationary filter sheets

## Objective

Apply the owner's chosen dark Glass visual reference to Progress metrics, make appropriate app card/control materials coherent, and replace in-flow phone filters with stable modal surfaces. Preserve the pending audio phase and keep the integrated result local for pre-release review.

## Scope completed

Generated Arabic light and English Glass images before the rounded-card revision. The owner selected the English Glass image. Progress metrics now use the existing 1.75rem large-card radius, centred icon/label/value hierarchy, quiet subordinate denominator, existing factual captions, and a matching full-card focus outline. Remove the redundant outer overview panel. Reuse the denser exact-records Glass tint for card legibility. Shared Card, CategoryCard, Button, IconButton and selected tabs/pills gain restrained edges or control reflection; stronger gloss stays on small controls/badges. Accessibility fallbacks flatten the finish.

The owner's icon follow-up replaces the dashboard's custom prayer rug/beads/mosque drawings with official Untitled UI line glyphs from the existing package via icons.ts. All metric glyphs use 24px/native 2px round strokes, with visible labels and decorative SVG semantics. No new dependency or global icon replacement is needed. Browser acceptance checks the shared glyph geometry/stroke/hidden semantics as well as the card layout.

Progress has one header date opener at every width, with selected period/dates retained as passive context. The existing period selector and custom-date validator live in the shared Modal without shifting cards. Metric customization remains independent with visible wording and a different icon. Compact Library filters use ResponsiveSheet with screen-owned search/group values, wrapping vertical choices, reachable results/clear actions and focus recovery; wider controls stay exposed. Shared Select/DropdownMenu/searchable-combobox portals default above the modal scrim and keep their protected opaque fill. Narrow Progress menus remove an inherited minimum width that exceeded the trigger at enlarged text.

The deferred-audio import regression discovered during audio verification is repaired by keeping Vite's shared preload helper outside the audio manual chunk. No budget ceiling is raised. The deliberately added bilingual audio UI is reflected in the reviewed baseline size update; exact values are in the generated final report.

## Files changed

ProgressDashboard, ProgressMetricCard, ProgressRangeToolbar, ProgressScreen and its styles/tests; ResponsiveFilters and tests/styles; AzkarLibraryScreen; shared Card/CategoryCard/LayoutShells/Tabs/Button/pill styles and Select/DropdownMenu/AccessibleCombobox; theme surfaces/materials; Vite chunk boundary and reviewed bundle baseline; affected Progress/Library/layout/accessibility browser specs and new shared-card-finish acceptance; README, design/architecture/quality, decision log, active phase/index and this report. Pending audio files are described in the companion audio phase report.

## Components added or modified

No new runtime dependency or second design system. Existing Modal, ResponsiveSheet, SheetHeader, shared controls, theme tokens, progress semantics and icon layer are reused. New bitmap images are review references under output/progress-card-design, not shipped UI or public assets.

## User-visible changes

Softer independent Progress cards, calm high-contrast data hierarchy, consistent badge/control reflection, stable date selection, clearer distinction between date filtering and metric selection, and a phone Library filter sheet that preserves query/group state. All actual counts, captions, religious text, historical calculations and settings-owned calendars remain unchanged.

## Accessibility work

Preserve native description lists/buttons, one labelled keyboard action per metric, full-card focus geometry, 44px targets, RTL/LTR DOM order, wrapping text and natural scrolling. Modal containment/Escape/Back/return focus reuse shared contracts. Portalled menus are tested for actual hit coverage, opaque fill, viewport bounds and keyboard recovery. High contrast, reduced transparency, Forced Colors and both reduced-motion alternatives remain explicit. Automated results are not claimed as full WCAG or physical assistive-technology acceptance.

## Tests added or updated

shared-card-finish checks the selected material hierarchy, 28px/56px enlarged radius, centred icon anatomy, matching focus radius, unchanged card geometry on open/close, topmost opaque menu hits, axe, retained filter values and enlarged/fallback screenshots. ResponsiveFilters unit tests verify the real portalled phone dialog, retained controlled value, restored focus and exposed wider controls. Existing browser tests are updated to the modal contract without dropping their behavior assertions. Geometry observations wait for the actual stable menu position instead of sampling the entering animation's first frame.

## Commands run

| Command                                                                 | Result                                                                                                                                                        |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Focused unit selection across audio, state, cards, filters and Progress | 209 passed, exit 0 before the final visual-only card revision                                                                                                 |
| pnpm lint; pnpm typecheck                                               | Passed, exit 0 before the final visual revision; final integrated check repeats these                                                                         |
| pnpm audit:prod                                                         | No known vulnerabilities, exit 0                                                                                                                              |
| Delayed-audio Listen regression, Chromium/Firefox/WebKit                | 3 passed, exit 0 after the deferred boundary repair                                                                                                           |
| Initial visual/browser attempts                                         | Detected and repaired scrim interception, menu minimum width, enlarged overview height and Forced Colors border-size shift; no assertions skipped or weakened |

Final exact-snapshot check/build/inventory/browser outcomes and copied screenshots are recorded in output/progress-card-design/PHASE_REPORT.md, with the companion output/audio-continuity-review/PHASE_REPORT.md. These generated reports do not mutate tracked validation inputs. Superseded/terminated runs are not counted as successful acceptance.

## Visual/manual evidence

Built-in image_gen references: output/progress-card-design/arabic-light-reference.png and english-glass-reference.png, owner-selected approved-reference.png, with exact generation prompts in PROMPTS.md. Actual implementation screenshots and responsive/menu/queue evidence are copied beside the final generated reports. Reference images contain illustrative sample figures and are not product evidence; actual screenshots/automated geometry are evaluated separately.

## Documentation updated

README current Progress description, design-system material/geometry/filter contracts, architecture ownership/layering, quality acceptance, owner decision log, active phase and this report. The companion audio report retains device/background limitations.

## Decisions recorded

The owner clarifies date/filter duplication, limits pronounced gloss to controls/pills/icons, rejects still-boxy metrics, asks for image references first and selects the generated English Glass concept. Preserve the pending pre-release review/publication hold and all original persistence/content/release contracts.

## Known limitations or remaining risks

Physical Android/iOS, TalkBack/VoiceOver, real-font scaling, OEM reminder delivery and background audio timing still require actual device evidence. Field p75 startup/interaction/shift thresholds are targets, not measured current claims. The previous WebKit short-Reader CI retry remains a separate intake unless the targeted reproduction identifies and verifies a cause. No deployment, exact-commit CI or production success for this local phase is claimed.

## Out-of-scope findings

No new religious content, database/state migration, dependency, routing replacement or cache-policy redesign. Generated typography/scenery/navigation details do not replace established application contracts.

## Recommended next step

Review the actual implementation against the selected reference and complete physical device/assistive-technology/background checks. Publishing requires fresh bilingual release notes, intact local release hook and complete exact-commit Quality/Pages/production verification.

## Review continuation — 2026-11-02

Reviewed pushed 44b56ec0: Quality 41351970594 and Pages 41354693382 succeeded, including verify/build/deploy/verify-production; live HTML and manifest return HTTP 200 and deployment-meta.json matches the exact SHA. The merged Quality log proves all 2,699 identities, with the already-recorded short-Reader WebKit retry; no new failure is inferred from that green retry.

The interrupted final local surface report contains 50 passes and seven genuine WebKit date-opener focus failures. A standalone Arabic-phone reproduction fails identically. Progress now restores its explicit opener in Modal's close-autofocus callback instead of racing the focus trap with requestAnimationFrame. Four component regressions cover unfocused opening followed by Escape, Close, preset and custom Apply; the focused Progress selection passes all 18 tests. Existing browser focus assertions are retained. Review also catches and reverses an accidental Qibla selector substitution: calibration is still a native details/summary, unrelated to Library's new filter sheet.

Shared card default/app/OS entrance, actual keyboard outline and no-replay-on-disclosure checks now live in shared-card-finish rather than only an ad hoc screenshot script. Test strategy and quality guidance include these contracts. Final browser/inventory/check/Pages/audit results and screenshot locations are recorded in the generated report referenced above; earlier failed and superseded attempts remain separate evidence. The pre-release publication hold remains active.

The older progress-card-design regression still asserted leading-edge value alignment. A focused English-light reproduction confirms that expectation fails against the approved centred hierarchy. Replace it with a measured centre-alignment assertion at the same one-pixel tolerance in both languages; retain every theme/material/populated/empty/viewport, size, footer, opacity, axe and activation check.

The rebuilt three-engine selection then reports 54 passes and six card-test failures because its old RGB-only parser rejects the browser's valid color(srgb ...) serialization of the shared color-mix tint. Measure the background's painted alpha in a one-pixel native canvas instead, retaining alpha greater than zero for Glass and exactly one for Solid. Rerun those same six identities separately; no application assertion, appearance case or opacity requirement is removed. The controls/Progress feature commands now also include shared-card-finish, with mapping regressions.

The complete serial check passes in 277.4 seconds. Its following core smoke catches one remaining navigation test expecting the old inline date combobox after a Month deep link. The actual Month context is correct. Update that journey to assert the closed opener's value, open the shared modal, retain the original combobox Month assertion, and require Escape/focus return before continuing to Saved. Preserve Settings browser-Back checks. This changed input requires a fresh complete quality pass; the earlier receipt is not reused.

Visual review of the enlarged WebKit queue catches underlying listening text bleeding through its ordinary Glass tint despite passing axe. Extend the existing protected-overlay opaque-base selector to queue and filter sheets, retaining the shared reflection/frost. Assert opaque computed backgrounds for Progress/Library sheets and the queue. Preserve the superseded run's screenshots/log (158 passing cases before intentional termination; not a completed matrix), then rebuild the bounded affected three-engine selection and final core smoke. Final report distinguishes these results from the older artifact and the complete exact-snapshot non-browser gate.
