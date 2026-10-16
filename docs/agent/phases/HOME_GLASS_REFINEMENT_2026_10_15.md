# Home glass clarity and material refinement

## Owner approves complete release — 2026-10-16

The owner accepts the previews and explicitly requests applying and pushing all pending changes. This supersedes the local-preview publication holds below for the completed Home glass, Friday naming, contextual footers, countdown alignment and current-to-next focus work. Release plan: inspect the combined diff/current deployment; replace and archive the bilingual notes since deployed commit `6b9a515a`; run the intact pre-push gates; commit and push to `origin/main`; monitor the complete exact-commit Quality matrix and Pages build/deploy/production verification; inspect and repair any failure without reducing assertions; confirm the deployed SHA and production browser behavior. Final report: `output/home-refinements-release-2026-10-16/PHASE_REPORT.md`.

## Owner current-to-next focus continuation — 2026-10-16

The owner approves quieter previous/later cards and a gradual emphasis handoff from current to next. Plan: derive bounded decorative strengths from the existing dated timeline during the final 30 minutes; change only reflections, boundaries and a stationary shallow glow; retain text contrast, card opacity, glass/solid accessibility fallbacks, equal geometry, reading content, selection and recording. Verify early/approach/adhan, midnight/DST, scenes, responsive geometry and supported engines; capture actual phone/desktop previews and run intact quality. Current starts at 100%, next at 15%; by adhan current decoration reaches 50% and next reaches 100%, then normal temporal state rollover applies. This supersedes prior next-only strong-surface priority. Local image review precedes publication. Results: `docs/agent/HOME_PRAYER_FOCUS_2026_10_16_REPORT.md`.

## Owner next-prayer/footer continuation — 2026-10-16

The owner subsequently approves the proposed alignment refinement. Apply 14px tabular countdown text aligned with the time column and keep the native progress bar full-width beneath it on all cards, with matching 8px insets. Existing icon/status and name/time rows already provide the approved shared alignment; retain them and equal card dimensions. Verify actual countdown text edges in Arabic/English, full-width bar insets, responsive wrapping and 200% text. Keep local previews before publication.

The owner requests Friday's noon label الجمعة, removal of Rawatib summaries from small cards, more prominence for next prayer and remaining time in its footer. Plan: inspect existing presentation/date/record contracts; replace summary-only footers with contextual countdown, saved-location/adhkar/unrecorded or prayer-sequence text; keep next uniquely accented; derive Friday display naming from the supplied dayKey while preserving `dhuhr` identity; update unit/browser assertions, responsive/enlargement evidence and documentation; run intact local quality. This supersedes all earlier small-card Sunnah/footer and progress-placement requirements below. Reviewed expanded details, calculations and persisted state remain. Local screenshot review still precedes publication. See `docs/agent/HOME_PRAYER_PRIORITY_2026_10_16_REPORT.md`.

## 2026-10-16 material visibility continuation

The owner's latest request strengthens all Home cards across desktop/mobile views. Plan: compare actual normal-preference phone/desktop captures, refine the shared Home material without layout/content changes, verify every card category across scenes/themes/languages/responsive sizes, retain contrast and opaque accessibility fallbacks, and provide local previews before publication. The implemented material uses 16px blur/135% saturation, 5.5% maximum directional sheen, 26% ordinary/24% prayer edges and a brighter inset reflection with a shallower shadow. Earlier numerical material values below are superseded; tint hierarchy and photo scrim remain. Evidence and exact command results: `docs/agent/HOME_GLASS_VISIBILITY_2026_10_16_REPORT.md`.

The owner requests visibly translucent Home surfaces on mobile and desktop, preserving the approved layout and drawing on Apple's materials guidance. Improve the existing implementation rather than add a new visual system or platform dependency.

## Approved scope and plan

1. Capture and inspect current Home at phone and desktop sizes; inspect normal, application-reduced and system-reduced transparency separately.
2. Refine shared Home-only materials: lighter tonal fills, restrained frost, readable scenery, quiet directional edge highlights and shallower shadows. Keep stronger material behind long devotional text and scrolled header controls. One backdrop filter per surface; no nested glass controls or decorative motion.
3. Preserve all routes, content, layout, progress, prayer state and appearance preferences. Keep reduced-transparency/high-contrast/unsupported-filter surfaces readable and solid. Adapt Apple's material hierarchy to CSS; do not claim native Liquid Glass rendering or universal visual perfection.
4. Extend material tests to cover phone/desktop, bright-source contrast, all time-of-day scenes and readable fallbacks. Capture actual before/after previews; verify existing responsive, keyboard and axe checks. Complete the intact release gates if publishing.

## Sources

- https://developer.apple.com/design/human-interface-guidelines/materials
- https://developer.apple.com/videos/play/wwdc2025/219/

The existing 48%/58% Home tints and 18px blur may be superseded by measured values in this phase. This is a visual-only owner-authorized correction; it does not authorize religious content, persistence or dependency changes.

## Implemented materials and evidence

Shared Home surfaces use 20% navy with 12px blur/115% saturation, restrained 3.5% highlight, light edges and an 8px/24px shallow shadow. Reading uses 32%, the resting header 28% and scrolled header 48%; photo captions keep their existing 66% contrast material. A 56%/54%/64% continuous page scrim bounds normal text contrast without adding a dense navy tint separately to every card. Primary actions and existing unblurred nested controls remain. Solid states cover the app preference, device preference, high contrast and missing backdrop-filter support. Appearance copy explains those states in both languages.

Actual morning/evening/night/Friday screenshots at 390/1440px are under `output/home-glass-2026-10-15/material-tests/`; mobile and desktop previews were inspected and shown inline to the owner. The current in-app-browser baseline reported system reduced transparency, so its solid screenshots are explicitly fallback evidence rather than a same-mode visual comparison. Chromium's explicit no-preference fixtures verify normal glass separately. Eight scene cases check decoded photography, material hierarchy, scrolled-header contrast, no overflow and axe; a live preference/high-contrast case plus the existing three preference/contrast regressions passed (12 tests, 31.3s). The conservative computed-color test still requires 4.5:1 against a white source pixel; no assertion, deadline or budget is weakened.

The broader initial responsive run exposed Chromium's system preference where an older assertion assumed blur. The corrected assertion requires opaque/no-filter for that preference and blur otherwise. Normal glass has separate explicit coverage, so this change does not conceal missing blur. Final responsive, quality, release and production outcomes are recorded in the phase report at `output/home-glass-2026-10-15/PHASE_REPORT.md`.

## Owner prayer-strip continuation

During refinement, the owner explicitly requests at least three timings on desktop and a beautiful remaining-time progress indicator. Use the shared 900px desktop breakpoint for current, next and following prayers; phone retains two and All still exposes five. The following occurrence may be tomorrow; its preview must not overwrite today's recordable/tracked prayer state. Keep existing openability/recording rules.

Show a quiet native progress element only for the next prayer, with a visible localized countdown and accessible remaining-time value. Its value decreases from 100% to zero over the interval from the previous adhan to the upcoming adhan; it is not a claim about when a religious prayer window ends. Use the existing minute clock, no animation or repeated live announcements. Derive dated occurrences from the selected location/timezone and actual elapsed instants, including midnight and DST. Reuse the existing native reminder civil-time conversion via a shared content utility; do not alter calculation methods, coordinates, reminders or persisted tracking. Test boundaries, remote timezone, next-day timings, dynamic responsiveness and native semantics, then show actual previews before publication.

## Owner fit-or-scroll continuation (supersedes the focused/disclosure layout)

The owner now requests two columns per small card (icon/name and time/status), more air above the remaining-time bar, removal of All/Less, and all five prayers fitting or scrolling according to actual available width. Move the overview above both desktop columns so it can use the full Home width; keep prayer detail and contextual cards in their existing paired layout below. Preserve canonical Fajr–Isha DOM order and all recording rules. All five cards stay mounted; there is no following-day preview substitution for past prayers.

Cards use 11.5–15rem widths at normal text size and 8rem minimum/default height, with growth for enlarged text and a viewport-aware minimum at narrow/enlarged sizes. Native horizontal overflow exposes a partial neighboring card and a localized hint only when measured overflow exists. The scrollable region receives keyboard focus only when needed. Initially reveal the next prayer without moving the page vertically; ordinary updates do not override manual scrolling. No carousel dependency, extra navigation buttons, content edit or persisted-state change.

Home-specific material and fallback rules live in the existing Home-loaded home-wird.css, before its caption and reading/header overrides. This preserves cascade/visual behavior while keeping the initial stylesheet under its unchanged compressed-size ceiling. The shared media material and page-scrim rule remain in the theme stylesheet.

## Owner grouping and hierarchy correction — 2026-10-16

The owner approves implementing the supplied critique and requires images before pushing. This supersedes the previous 11.5rem width, 8rem height and next-only initial alignment: use five visibly bounded inset cards, 9.75–15rem normal widths and a 7rem minimum that grows naturally. Identity and timing share three shared grid rows: icon/availability explanation, name/time baseline, and quiet viewed/temporal status. Next alone has an accent border and a contained countdown/progress footer; current retains its explicit localized status, while selection says Viewing without a competing outline. Disabled future details visibly explain the existing 30-minute availability rule. Secondary labels use scalable 12px text. No nested blur or motion is added.

Initially show current and next together when their combined width fits. Otherwise reveal next with part of the preceding bounded card; preserve chronological order, native keyboard scrolling, unobscured inset focus and manual scroll through minute updates. Before-Fajr wrapping may put current Isha at the other end of the canonical row. Keep the overflow hint close to the trailing edge. Verify Arabic/English at 320/390/1440px, enlarged text, all background scenes, reduced transparency, contrast and supported browser engines. Publication is deferred for screenshot review; no push in this continuation.

## Owner density and alignment correction — 2026-10-16

The owner removes the 30-minute availability explanation and rejects unused space below ordinary cards. Supersede the prior 7rem minimum/equal-height stretching: cards align at the top and end immediately after their content; next alone extends for its compact countdown footer. Every icon, name and time occupies the same shared row position across prayers at normal text sizes, independently of temporal/selected status. Keep existing openability logic and disabled semantics, natural enlarged-text growth and the screenshot-before-publication gate.

### Owner spacing and icon polish — 2026-10-16

Balance the compact summary header with 0.625rem top/inline and 0.5rem bottom padding. Use one 1.75rem icon badge per prayer, with the existing icon, a subtle current-color tint and border, and no additional blur. Every badge and identity/time row stays consistently positioned; natural text growth and existing focus/contrast fallbacks remain. The next footer is the only additional card height. This is the owner's follow-up visual refinement, still local for image review.

### Owner closer identity/timing groups — 2026-10-16

Center the two content-sized columns with a consistent 0.5rem gap instead of stretching them toward the card edges. Retain balanced header padding, icon badges, shared vertical positions and natural enlarged-text wrapping. The normal minimum width is 9.75rem to retain readable English times while keeping current and next together at 390px.

When enlarged text leaves less than 8rem of card space, a card container query uses two shrinkable tracks so the compact centered group can wrap without clipping. Normal text retains the content-sized columns.

### Owner removes horizontal-scroll copy — 2026-10-16

Remove the visible horizontal-scroll hint in both languages and its obsolete described-by reference. Retain the named, keyboard-focusable native scroll region, scrollbar and partial neighboring card. No change to prayer availability or tracking.

### Owner tighter side padding and card widths — 2026-10-16

Use 0.5rem equal side padding, 0.625rem top padding and 0.5rem column gap. Bound ordinary cards to 9.75–10.5rem rather than allowing them to grow to 15rem. Bound the centered overview to 57rem above the existing desktop columns, keeping mobile width/scrolling and shell breakpoints intact. This removes the large empty margins created when a compact centered group sits inside an overly wide card.

### Owner final spacing values — 2026-10-16

The owner clarifies that the extra whitespace belongs between the two columns. Use a 0.625rem (10px default) column gap, up 2px, with 0.375rem (6px default) equal side padding. Keep top padding 0.625rem and bottom 0.5rem. Cards now span 9.5–10rem, with a centered 54.5rem overview. All row alignment, readability, scroll and enlargement checks remain.

### Owner 4px top and side padding — 2026-10-16

Set summary-header top and both side insets to 0.25rem (4px at normal text size); retain the 10px column gap and 8px bottom inset. The owner asks for recommendations about removing the outer surface and small-card outlines; those structural/material changes are recommendations only in this continuation, not implemented. Keep visible prayer boundaries until a proposed alternative has been previewed and tested.

## Owner approves standalone cards and responsive spacing — 2026-10-16

Remove the outer prayer surface, preserving a plain layout/scroll wrapper. Each glass prayer card now owns its single material layer and all existing opacity/contrast fallbacks. Quiet 12% white edges define ordinary cards; next alone retains the accent edge/countdown. Icon badges retain their faint tint but no border. Cards expand equally to fill available wide-screen width; the compact 9.5rem minimum and native overflow remain on phones. Supersede the 54.5rem overview and 10rem card ceilings.

The owner correctly observes that centered content made the visible insets larger than CSS padding. Distribute identity/timing columns toward the two actual 4px header insets: icons/titles start at the logical leading edge and times/status end at the trailing edge. Space-between absorbs extra wide-card width between the columns, over a 10px minimum gap. The existing enlarged-text container fallback remains. Tests measure actual content-to-card insets (4px plus 1px border), wide-row fill, larger actual column separation and no outer surface, rather than checking CSS padding alone. Preserve source content, timing, recording, keyboard focus and the preview-before-push gate.

### Owner increases visible insets to 8px — 2026-10-16

Increase all summary-header insets to 0.5rem (8px at normal root size), including top and both sides, and match footer side insets. This supersedes the 4px values. Use a 10rem readable minimum so English labels/times fit the larger padding. Keep full-row wide-screen growth, space-between column expansion, standalone materials and quiet edges. Actual inset tests now require 8px plus the 1px border.

## Owner concise matching footers and clearer expanded record — 2026-10-16

Give every summary a useful muted footer, aligned with the next-prayer countdown footer: saved At home/At mosque, Not recorded for an unrecorded current/past prayer, or Later today for later prayers. Legacy mosque booleans resolve through the existing trackedLocation boundary. Only next has accented countdown/progress; never add fake progress to other cards or infer missed prayer. Shared 3rem footer minimum and equal-height cards preserve aligned tops/footers; enlarged text grows naturally. This supersedes the earlier natural shorter-card-bottom decision. Preserve 8px actual header insets.

For the larger shared panel, remove the screenshot-highlighted temporal status/minute countdown and separate completion tally. Replace those with an explicit localized Record for weekday/date line from the exact supplied tracking dayKey, using dateFromProgressDayKey; keep the native time datetime value. This is the saved record date, not a new claim about civil/prayer-day boundaries. Retain Fajr sunrise context, the reviewed virtue/source, all checklist items, info action and primary adhkar action. No prayer calculation, tracking date assignment, midnight boundary, openability or persisted schema changes. The earlier temporal summary compared selected-location HH:MM with device-local hours; removing it avoids repeating an inconsistent countdown in this action panel, without claiming the independent leading-prayer calculation is repaired. Broader panel restructuring remains a recommendation pending owner review. Keep previews local before pushing.

## Owner checkbox affordance, reviewed Sunnah footers and equal mobile widths — 2026-10-16

Independent tracking actions retain native checkbox semantics but now use rounded-square indicators, gold checkmarks and the existing visible focus/disabled behavior. The shared prayer tracker/action checkmark changes; noninteractive Today’s path status marks keep their round form explicitly. Other inspected multi-select controls already use native/square checkbox affordances. Single-choice radios remain unchanged.

Replace Later today in future-prayer footers with compact before/after counts derived from the existing reviewed getPrayerSunnah data. Label confirmed entries Rawatib and optional entries Optional/mustahabb, keeping their rank distinction. Use localized counts and plain interface labels without editing reviewed source text, references or counts. Recorded/unrecorded footers and next-prayer countdown remain.

All five mobile cards must keep equal widths; wide-screen cards also grow equally. Content never determines individual card width. Long footer summaries wrap completely without truncation, ellipsis or font shrinking. A shared CSS subgrid aligns both header and footer rows to the tallest content across every card; the existing 3rem footer minimum remains. All card heights and footer dividers stay aligned at normal and 200% text. Browser checks explicitly compare all widths, heights, footer tops and text bounds at 320/390/1440px in both languages. Keep the native horizontal scroller, 8px visible insets and no outer surface.

### Owner concise single-footer correction — 2026-10-16

The owner requires equal width AND height on every small card, with concise relevant copy that fits. Show only one reviewed Sunnah summary on future cards: prefer a confirmed before entry, otherwise a confirmed after entry, otherwise the available optional entry. This is an overview, not an exhaustive source summary; all before/after items and their evidence remain in the larger card/info view. Keep explicit Rawatib/Optional rank and counts; Maghrib therefore shows its confirmed after pair instead of two footer lines. Do not add a second footer line at normal text size or widen one card for text. All card and footer dimensions match, including on mobile. At accessibility text enlargement, preserve complete text and equal dimensions across the row.

The attempted shared subgrid failed the 320px/200% text check by constraining natural footer content. It is removed. Reuse the existing ResizeObserver to measure natural footer child heights plus padding/progress margins and apply one shared minimum footer height. Observe content size as well as card size; measure natural children rather than synchronized boxes to avoid a growth feedback loop. Default concise labels fit the shared 3rem footer. This also preserves consistent geometry when font size changes or selection/recording changes.

## Owner approves one-purpose footers with Home glass preserved — 2026-10-16

Every prayer footer now contains the same kind of short reviewed Sunnah overview, regardless of temporal/recording state. Keep the exact established count/rank selection (confirmed before, then confirmed after, otherwise optional). Recording state moves into the main timing/status area. Temporal Now/Next/Passed/Not yet due labels sit above the time; next has its countdown below the time and one real interval bar above the footer boundary, outside the open button and outside the footer. All headers share fixed icon/name row geometry and equal card/footer dimensions. Increase only the bottom header clearance to 12px for the 4px progress bar and visible text gap; top and side insets remain 8px.

Preserve Home glass throughout: each standalone prayer card retains hero-glass/home-glass-surface and its existing tint, blur, saturation, edge highlight and opacity/contrast fallbacks. The plain row wrapper remains unboxed. Do not replace other Home materials, add nested blur or flatten the larger action/reading surfaces. Test every time-of-day scene, conservative bright-photo contrast, reduced transparency/high contrast and all summary/header/footer bounds alongside checkbox/focus/selection behavior. Native progress remains outside a button and is not a live announcement. Complete reviewed evidence and recording/openability/date contracts remain unchanged.

## Owner calendar consistency correction — 2026-10-16

Prayer record dates must follow the user's selected Hijri or Gregorian calendar, including the configured Hijri adjustment. Forward both settings through Home and the dedicated prayer screen into the shared panel and use formatDisplayDate, matching the Home header. Derive the displayed date from the supplied tracking dayKey; retain that original key in time datetime and all record writes, including across midnight. No calendar migration, prayer calculation or reviewed content change. Verify Arabic/English, both calendars, adjustment changes and unchanged record ownership; retain local image review before publication.

## Owner statistics interpretation note — 2026-10-16

The owner clarified: leave the existing checkboxes and card labels unchanged. For prayer-location statistics, an unchecked mosque option is to be interpreted as home, without requiring an explicit home confirmation; it must not be interpreted as a missed obligatory prayer. Preserve raw saved records and independent Sunnah/adhkar observations. This note records the rule for statistics work; the current Home/calendar refinement does not change statistical calculations, backfill records or modify controls.

## Owner final Home header and glass polish — 2026-10-16

On narrow phones the full selected calendar date takes priority over the palm and streak counters. A 44px Today’s path button opens the same sheet, which now displays both counts; the date can wrap rather than truncate. Desktop keeps its existing counter arrangement. The small prayer cards retain the approved 20% Home tint, 12px blur and 3.5% maximum highlight. Their card-specific override had reduced the edge to 12% white and removed the shared shallow outer shadow, making an otherwise active backdrop filter read as a flat dark rectangle against the dark upper sky. Restore an 18% quiet edge and the existing Home glass inset/outer shadow, keeping the next-prayer accent edge and all reduced-transparency/high-contrast fallbacks. Do not change the photo scrim, reviewed content, prayer timings or card anatomy.

## Owner balanced Home header — 2026-10-16

Keep the palm and streak counts visible in the Home header. Place the full selected-calendar date on the reading side and group the two indicators on the opposite side, following RTL/LTR direction. The two indicators share one 44px+ Today’s path action, a quiet inset glass pill and accessible count/name; this replaces the phone's palm-only button and the separate desktop counters/action. Strengthen the existing palm vector's stroke at its compact size without changing the icon system. Preserve the existing Today’s path sheet with full counts and status. Allow date wrapping on narrow screens, keep both indicators visible at 320px, and use the normal opaque fallback when transparency is reduced. Do not change the prayer cards or content.
