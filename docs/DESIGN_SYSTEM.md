# Azkar design system

This is the implementation source of truth for visual and interaction decisions. New screens and refactors must follow this file together with `QUALITY_CHECKLIST.md`. If an older mockup conflicts with a decision recorded here, this document and the current approved Figma modes take precedence.

## Authoritative references

| Area                        | Reference                                                                   |
| --------------------------- | --------------------------------------------------------------------------- |
| Figma file                  | `W5uCKGhODwqBmZU1etuRH3` — Azkar Application                                |
| Core screens                | Nodes `443:2541`, `443:1533`, `443:1401`, and `443:1747`                    |
| Additional Midnight screens | Nodes `443:2376` and `450:2648`                                             |
| Theme modes                 | Light, Midnight, and Dark/OLED variable modes in the Figma appearance panel |
| Semantic tokens             | `src/styles/theme/tokens.css`                                               |
| Typography                  | Offline system-family stacks in `src/styles/theme/tokens.css`               |
| Shared shell/navigation     | `src/app/components/LayoutShells.tsx`                                       |
| Reader implementation       | `src/app/screens/ReaderScreen.tsx`                                          |
| Product icon library        | Untitled UI Icons via `src/app/components/icons.ts`                         |

## Typography contract

The app uses offline system-family stacks so first render, installed-PWA use, and privacy do not depend on a third-party font service.

| Content                                                   | Typeface                               | CSS contract                                                                           | Direction                    |
| --------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| English UI                                                | Native sans-serif stack                | Default `body` family; `font-sans` or `latin-ui` for explicit mixed-language fragments | LTR                          |
| Arabic UI, labels, navigation, settings, and instructions | Native Arabic-capable sans-serif stack | Inherited from `[lang="ar"] body`; `arabic-ui` for explicit mixed-language fragments   | RTL                          |
| Zikr, du'a, Qur'anic, and Arabic evidence text            | Native Arabic reading stack            | Add the `zikr-text` class and `lang="ar"`                                              | RTL                          |
| Numeric counters                                          | Existing numeral formatter/font helper | `counterNumeralFontFamily` or `numeralFontFamily`                                      | LTR inside the numeric group |

### Display title role

The largest in-app heading — the category name on Home's routine card, and any future card
that leads with a single short phrase — uses `text-[clamp(1.5rem,4.5vw,1.875rem)]` with
`md:text-[2.25rem]`: 24 px compact, 36 px desktop.

It was 28–48 px, which crowded the card it sits in and, because the heading truncates to one
line, clipped long Arabic category names sooner than it needed to. 36 px still reads as
unmistakably dominant against the 14 px body copy beneath it — a 2.6× ratio — while leaving
the card's other content room to breathe (DEC-074).

This is the ceiling for in-app headings. The marketing landing page is a separate context
and keeps its own larger scale.

Rules:

- A zikr excerpt remains zikr content even when it appears on Home, Category, onboarding, reader, counter, or reference surfaces; use `zikr-text` in every location.
- `arabic-ui` is the explicit Arabic interface role and `zikr-text` is the devotional reading role. Do not restore the legacy `font-arabic` alias: it mapped interface labels and Quran text to the same family and caused visible typeface changes between otherwise equivalent labels.
- English and Arabic interface copy use the corresponding offline system stacks. The document `lang` and `dir` are set by `App.tsx` and screens may repeat `dir` at layout boundaries to make behavior explicit.
- Mixed-direction controls must use logical CSS properties (`start`, `end`, `ms`, `me`) or a deliberately isolated `dir="ltr"` physical layout. Arabic text inside that layout gets its own `dir="rtl"` or `dir="auto"`.
- Do not encode direction by reversing arrays. Keep semantic DOM/tab order stable and mirror only directional icons.

## Iconography contract

- Every product interface icon comes from the official `@untitledui/icons` package and is imported through `src/app/components/icons.ts`. Do not import another icon library directly or add a hand-drawn SVG for an interface action.
- Use the Untitled line style at its native two-pixel stroke. Standard sizes are 16 px for compact metadata, 18-20 px for row actions, and 20-24 px for primary navigation. The containing interactive target remains at least 44 x 44 px.
- Back navigation uses `ArrowPrevious`; forward navigation uses `ArrowNext`. Nested-row disclosure uses `ChevronNext`, while calendar/carousel previous and next actions use `ChevronPrevious` and `ChevronNext`.
- Directional Previous/Next components carry Untitled's `data-rtl-flip` attribute and mirror through the global RTL rule. Do not add local `rtl:-scale-x-100` transforms to them.
- `RotateCcw` is reserved for an actual reset or restart action. It must never represent returning to prior content.
- Icons inside labeled buttons are decorative and remain hidden from assistive technology; the control supplies the accessible name. Icon-only controls require a localized `aria-label`.
- Custom SVG is limited to non-icon artwork: the Azkar brand mark, third-party provider logos, decorative illustrations, device/status mockups, and data visualizations such as progress rings. These exceptions must never be substituted for an interactive Untitled icon.

## Geometry and control contract

- Spacing follows a 4 px grid. Page gutters are role-based: 16 px for dense settings, 20 px for standard app screens, and 24 px for focused onboarding and sheets. Documented set: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64.
- **Compact sub-scale.** Chips, badges, icon-and-label rows and other compact internal elements may use the 2 px half-steps between those values — 2, 6, 10, 14, 18 px (`gap-1.5`, `py-2.5`, `p-3.5`, and so on). This is a deliberate part of the contract, not drift: at the scale of a 20 px badge the next full step is a 100% jump, and the app already relies on these in roughly 175 places. The half-steps are for spacing _inside_ a component. Page gutters, section rhythm and the gaps between cards stay on the full 4 px set above.
- Radius roles are 8 px for compact internal elements, 12-14 px for controls, 16-20 px for standard cards, and 24 px for major containers and sheets. Full-radius for chips and compact segmented controls only.
- Elevation: Use three levels only (Flat/bordered surface, Raised card, Modal/sheet). Avoid applying a large soft shadow to every card. Raised and Modal/sheet are backed by the `--ds-shadow-raised`/`--ds-shadow-overlay` tokens (`src/styles/theme/tokens.css`), mapped to the `shadow-raised`/`shadow-overlay` Tailwind utilities.
- Control heights have three roles: compact 44 px, regular 48 px, and prominent 52 px. Every interactive target remains at least 44×44 CSS px.
- Use subtle borders to separate passive surfaces and the higher-contrast control border for inputs and toggles. Meaningful control boundaries must reach 3:1 non-text contrast.
- Focus indicators have exactly two roles:
  - **Controls** (buttons, links, inputs, tabs, radios, switches, cards acting as buttons) use `focus-visible:ring-[3px] focus-visible:ring-ring` — the semantic ring color at the full 3 px width. Add `focus-visible:ring-inset` only where an ancestor's `overflow: hidden` would clip an outward ring (e.g. rows inside a clipped settings card). Destructive actions may substitute `focus-visible:ring-destructive`.
  - **Scroll regions** (non-control containers that are focusable only so keyboard users can scroll them) use `focus-visible:ring-1 focus-visible:ring-ring/40` — deliberately subtle, because a full 3 px ring around a page-sized region is visually overwhelming and the region is not an actionable control.
- The global `:focus-visible` outline rule in `src/styles/theme/surfaces.css` remains the automatic fallback, so an element that opts out of both treatments still gets a visible token-driven indicator rather than none.

## Color roles

Gold should primarily indicate:

- Primary action
- Selected state
- Limited brand emphasis

Gold should not be the default for small text, low-contrast metadata, every icon and every border.

Semantic tokens are defined for:

- Background and Surface (Opaque, high-contrast cards and reading areas). `bg-card` is opaque by default in every theme; the blurred/translucent glass treatment (`.glass-card`/`.wird-card`) is an explicit opt-in reserved for decorative, non-functional surfaces, never the default for functional or devotional content.
- Text strong/default/muted
- Primary and on-primary
- Border passive/control
- Focus
- Success/warning/error/info — `--success`/`--warning`/`--info`/`--destructive` each ship with a paired `-foreground` token, defined per theme (including light theme, where the saturated hue is darkened to hold AA text/badge contrast) and mapped to `bg-success`/`text-warning`/etc. Tailwind utilities.
- Progress track/fill
- Scrim

## Component states

Every interactive component should define:

- Default
- Hover where applicable
- Pressed
- Focus-visible
- Selected/checked
- Disabled
- Loading
- Error where applicable

### System feedback contract

- Empty content is ordinary page content, not a live region. It may offer one clear next action.
- A newly occurring recoverable error uses `role="alert"`, explains what remains safe, and provides the smallest useful recovery. Move focus to the recovery heading only when the failure blocks the current screen.
- Loading states include visible text, `aria-busy`, and a restrained indicator that yields to reduced motion. Do not rely on an unlabeled spinner.
- Success, cancellation, reconnect, and other non-urgent outcomes use a narrowly scoped polite status. Never make an entire interactive card, sheet, or notice a live region.
- Disable the initiating action while an asynchronous operation is pending. Retry must be idempotent and must not duplicate writes.
- Offline feedback may briefly occupy the full status row, then collapses to a 44 px user-expandable indicator. Account-sync errors remain independently retryable/dismissible, while reading and counting stay available.
- Raw provider, network, cache, clipboard, and database messages are diagnostic data, not product copy. Map them to localized user-safe outcomes and send only privacy-safe metadata to observability.
- Recoverable code-split failures offer **Try again** and **Go to Azkar** first. **Refresh app** appears only after retry fails; no automatic reload is permitted.

## Reader contract

- The header follows reading direction: back is at logical start, the screen title stays centered, and the menu is at logical end. DOM and tab order remain stable.
- The top session block combines one progress track with compact percentage and completed/total labels above it. A heading sits below the track **only when the zikr carries a real surah name**; it stays one line, and truncation preserves the full name through its accessible name/title. It must never be derived from the zikr's own text or from the collection name: both restate something already on screen, once as a label for itself. At least 4px separates the track from that heading (10px on phones, 14px on the desktop hero), because Arabic harakat sit above the cap line and would otherwise crowd the track.
- The shared screen header title wraps to at most two lines rather than truncating, and steps down one size below 360px before doing so. A collection name that reads "أذكار ال..." names nothing, and fitting the longest names on one line at 320px would need a ~14px h1 — too small to read as a title. Every real collection name, Arabic and English, must fit within two lines at 320px, and the 56px header minimum must absorb the second line without the header growing. Validate the 412×924 OnePlus Nord 4 profile as well as the 320px compact profile.
- The Arabic source text remains visible in the Reader because it is the zikr itself. English mode may additionally show the reviewed translation and transliteration when those reading preferences are enabled; Arabic mode must not leak English supporting copy.
- There is no decorative separator between zikr content and the counter. Keyboard focus on the contained reading region must not render a clipped horizontal outline; the region removes its own outline while every interactive descendant retains a visible focus indicator.
- The Reader keeps the shared compact rectangular counter surface: up to 220 CSS px wide and 76 CSS px high, with a centered ratio and an internal logical-start fill clipped to the same 24px radius as the control. Previous/Next use the same opaque surface, border, radius, elevation, and focus treatment without the fill. The dedicated Custom Counter expands from a compact `min(288px, 78vw)` surface to 288 x 96 CSS px at tablet width and 448 x 144 CSS px at desktop width; the Friday Salawat counter uses the same compact expansion principle but remains capped at 320 x 104 CSS px on wider screens. Their numerals use `rem`, so they scale with the app-wide text-size preference. Every counter activation emits the same one-shot ripple unless reduced motion is active. For ordinary adhkar, a pointer activation anywhere on the Reader canvas counts and emits that ripple, except interactive controls, menus, dialogs, editable fields, and scrollbars. Full surahs are counter-only: neither the Quran text nor canvas whitespace may change the count. The explicit reading and counter surfaces support Enter/Space and use `touch-action: manipulation` where applicable.
- Before counting, the only visible instruction is localized and mode-specific: “Tap anywhere to count” for ordinary adhkar and “Tap counter when finished” inside the explicit counter for full surahs. Do not add breathing, readiness, motivational, or other generic helper copy.
- Reading-text size scales with the zikr's length so a three-word dhikr does not float in a full-height canvas: the multipliers are 1.6 under 30 characters, 1.45 under 60, 1.32 under 80 and 1.22 beyond, applied to the 16/18.5/21.5px text-size bases. **Reviewed multi-page surahs are exempt** and render at the unscaled base, so their Mushaf line breaks stay as reviewed.
- No reading text may render below a 21.3px legibility floor — what the shortest common dhikr rendered at before the scale increase. Fully vocalised Arabic loses its harakat first as size drops, so the floor is set by the smallest text that still has to be legible, not by a generic body minimum. The floor does not apply to the exempt surahs. The three text-size steps must stay visibly distinct at every length; a floor that collapses two steps into one is a regression. The table and both guarantees live in `src/app/screens/readingTypography.ts` under test.
- Reviewed difficult words in full surahs use a subtle semantic-primary tint plus a dotted underline, so meaning is never communicated by color alone. Activating a highlighted word opens a source-attributed meaning sheet and never changes the count. The inline-text target-size exception preserves Quran line flow; generous line height, visible focus, and keyboard activation preserve usability.
- Quran Wird opens with an opaque overview before the Mushaf: one direction-aware linear progress track with a text equivalent, the last verified reading position, and **Continue reading** as its sole primary action. Its title is **ورد القرآن / Quran Wird** everywhere, and the normal responsive app navigation remains present on this overview. The track fills from logical start, so Arabic fills right-to-left. A page records itself only after a four-second dwell in the reader, never from the overview and never merely by loading it. Plans are one-at-a-time (30-day khatmah, daily pages, or custom duration), sit behind progressive disclosure, and use the shared Radix Select primitive rather than the browser's native option popup. The week is the local Saturday-to-Friday week, matching the app's Arabic-first context rather than a rolling seven-day strip.
- The standalone 604-page Mushaf **is the whole screen** at every width: no card, no gutter, no letterbox, and no screen padding above or below it. Its header (Back, surah/juz index, word meanings, bookmark, page style) and footer (Previous, Page number, Next) sit in a reserved band that **keeps its height whether or not it is showing anything** — hiding the controls must never resize the reading canvas. Both rows are **held to the page's own measure**, so on a 2000px display Previous and Next sit under the paper they turn instead of out at the far corners (DEC-091). The page follows the app's Midnight, Dark, or Light theme by default; an explicit OLED option remains as a high-contrast reading override. Theme treatment uses the same semantic surface, ink, border, accent, and focus tokens as the rest of the app. **The controls step aside while you read** and return on a tap anywhere on the paper, or on the next page turn. They hold their ground while a menu or dialog is open, while the toolbar has keyboard focus, and — decisively — for anyone driving by keyboard: hidden controls use `visibility`, which takes them out of the tab order, so a keyboard reader who could not tab back would be stranded. Desktop and tablet footers show the unobtrusive `← / →` page-navigation hint. Once the controls step aside a slim status line stays behind with the page number and today's wird, because _where am I_ and _how is the wird going_ are the two questions worth answering without a tap. **The wird bar reads against the goal chosen on the overview**, computed by the one shared `effectiveDailyGoal` so the two screens cannot disagree. **The paper-bound controls are invariant across interface direction**: the left control and `ArrowLeft` advance; the right control and `ArrowRight` go back (DEC-094). A page turn **drags the paper only** — the chrome does not travel with it. The reference is the King Fahd Complex Madani Mushaf in QCF v2, and **all three things that define a page — which words are on it, which line each sits on, and which glyph draws it — come from that one edition** (DEC-090). `public/data/mushaf` ships the whole layout, so a page turn makes no network request and the page font is served from Cache Storage after its first load. A page mounts once, already in its final typeface. Every page lays out fifteen equal line slots. **The measure is derived, not chosen**: fifteen lines must fit the page height, which caps the type size, which in turn fixes how wide a line wants to be — so the column is set to exactly that width and the widest line always lands on the margin. Tablet and desktop pages use a slightly lower ink allowance to gain leading without dropping a canonical line or covering the footer. Facing-page text measures align toward the spine and the explicit gutter is capped at 64 px, preventing ultrawide dead space. A line that still overruns is scaled down, never clipped. A surah heading occupies exactly one line slot as a thin ornamented band. Weight for legibility comes from a hairline text stroke, tuned per theme. Page turns cross-fade in 150 ms and honour reduced motion. An eight-page in-memory cache plus a save-data-aware prefetch of both neighbours makes an ordinary turn a cache hit. Difficult-word tint, dotted underline, buttons and reviewed meanings appear only while the switch is on; their inline metrics equal unmarked text so toggling cannot move a line. The anchored meaning card reuses the shared word, concise-meaning, ayah, and King Fahd source anatomy, without audio or unsupported root data. The completion notice is opaque, wraps instead of truncating, sits clear of the footer, and dismisses itself after four seconds while retaining its polite status announcement.
- Word-help matching may normalize Arabic marks only to locate approved source phrases. Rendering must splice the untouched Quran string, never replace or normalize the displayed Quran text.
- Per-zikr completion is visually checkmark-only: no text appears inside the ring or around it during the 500 ms acknowledgement. Completion details remain available through the nonvisual live-region announcement.
- **The reader header carries at most two actions on every tier: Benefit and the overflow menu**, each at least 44×44 CSS px, and must stay inside a 320px app canvas. Save, share and the counter-sound toggle live inside that menu, not as header chrome — at 320px a third 44px target is the difference between the collection name fitting and truncating. The menu's contents do not vary by viewport width.
- Reading size is offered in that menu as a labelled radio group bound to the one app-wide text-size setting, never a second reader-only preference that Settings would have to be reconciled with.
- Share generates a theme-aware 1080×2920 PNG locally. Mobile uses Web Share with an image file; unsupported browsers copy the PNG or download it. Arabic cards exclude English supporting content, while English cards include the Arabic zikr with meaning, pronunciation, benefit, and source.
- The reader has one contained vertical scroll region. Short screens must preserve access to the zikr, counter, and actions without document-level horizontal overflow. For long Surahs, only the Mushaf text scrolls: Previous/Next remain centered at the logical side edges and the counter remains in its established footer position from the first page onward. Do not move navigation with the text, defer the counter until the last page, or add a floating page/counter shortcut.
- **Wide-desktop reader (≥1200px, `src/app/hooks/useMediaQuery.ts`):** gated at exactly the shell's own `large` tier boundary (where the labeled nav sidebar already appears), not a separate breakpoint, so the reader's chrome and the shell's chrome change together. The Reader swaps its plain header for a fixed dark-navy hero band (same `#0b1426` brand surface as Home's `.azkar-hero`, independent of the active theme) carrying the back control, category title, and the collection progress bar, and wraps the reading content in a bordered card. Benefit and the overflow menu relocate into the hero's top-end action cluster — a two-button row with the back control at top-start, rather than a second row inside the card. Save, share and sound stay in the menu here exactly as they do on phones, so the two-action rule above holds on every tier. Benefit is icon-only here (unlike its labelled pill elsewhere); its tooltip previews the actual reviewed benefit text rather than repeating the button's own name. Previous and Next remain explicit buttons and sit at the logical side edges, vertically centered within the reading viewport on tablet and desktop; compact layouts keep them beside the counter. The card has no separate "Zikr {index} of {total}" strip because the hero progress already communicates session position. The keyboard-shortcuts hint (→/←, R, Esc, plus Space for ordinary adhkar) sits below the counter in the card/page flow with at least 20 px clearance. The reading column itself stays capped at 600px and centered inside the wider card — width grows for chrome, not for line length, per the responsive-shell reading-measure rule below. Each Mushaf page (`MushafPageReader`'s `flat` prop) drops its own bordered surface here in favor of a plain divider, since the outer card already carries the elevation; mobile keeps the per-page card since it has no outer card. For long Surahs specifically, the hero shows the collection's reviewed benefit text (the same content the Benefit sheet shows, not new copy) as a one-line teaser, since a long Surah is always a single stable zikr per category so the line can't flicker as the reader advances.
- **Immersive Mushaf mode** is offered from the reader's overflow menu, and only for surahs whose reviewed metadata spans more than one page — there is nothing to flip through otherwise. It fills the viewport with exactly one Mushaf page and pages sideways: swipe, the footer Previous/Next, or the arrow keys. Paging is a scroll-snap track, not an index-and-transform carousel, so a swipe keeps its native momentum and the browser owns the RTL axis (an RTL container scrolls into negative `scrollLeft`; reimplementing that by hand is where carousels break Arabic). Arrow keys are physical, so `ArrowLeft` advances in RTL, while the footer buttons stay logical and their arrows flip with direction. The page indicator follows scroll position rather than the control that caused it, so a swipe, a keypress, and a button all report the same page. Escape closes. Reduce motion makes pages jump rather than glide; the landing position is identical either way.
- **Word meanings step through the passage in place.** A tap carries every annotated word on the current Mushaf page in reading order, not just the word tapped, so the sheet moves between them without closing. The scope is the page on screen, which is the passage being read — not every highlight in the surah. The stepper hides itself when a page has only one annotated word. Its index is clamped on read, because moving to another zikr replaces the group list and a stale index would point past the end of the new one.
- The keyboard-shortcut pill is one shared component (`CounterShortcutHints`) across the Reader, the Masbaha, and the Salawat counter, so a keycap restyle cannot land on one surface and miss the others. The row is forced LTR so entries always read keycap-then-label in the same order, while each label keeps the app's direction; otherwise an Arabic label drags its keycap to the far side of its own entry. It announces itself as a labelled group on all three.
- **The wird card has two surfaces, chosen by `onMedia`, not by layout.** Home stacks it on the hero photograph, so it uses fixed white/black overlays that stay legible over any image and reserves `min-h-[22rem]` so the card cannot resize under the photograph as routines complete. Progress sits on a plain scrolling surface: there the overlays read as a stray pane of glass and ignore the active theme, and the height reservation is simply empty card — it measured 227px of it. Progress passes `onMedia={false}` and gets ordinary `bg-background`/`border-border` cards at content height. Do not re-derive either behaviour from "is this the compact layout": that conflates two unrelated things and is what coupled them in the first place.
- **After-prayer cards show all five from the `lg` tier up, and two below it.** Wide viewports have room, so hiding any of them only costs a click to reveal what already fits. Narrower ones are a snap carousel where two cards is what fits without shrinking the prayer time — the thing being scanned for — so the rest sit behind a reveal. The reveal's presence depends on whether the viewport collapses the row at all, never on how many cards are hidden right now; deriving it from the current count makes it vanish the moment it is used. The next prayer is never hidden at any width.
- **Completion checks are gold** (`--primary`), overriding the earlier rule that reserved gold for temporal status. Status and completion never collide: status is a filled pill of text in the card's second section, completion is a 24px circle in the tracking rows. The checked state is set from React state rather than a `peer-checked:` variant — the variant matched the element and even drove its animation, yet its colour declarations never landed, leaving a ticked box visually identical to an unticked one while announcing correctly.
- **Recording a prayer at the mosque opens its virtue**, up to three narrations from Bukhari or Muslim with book and number, closing on a fixed du'a. It is built on the shared `Modal`, so motion, focus containment, focus restore and Escape match every other dialog. Clearing a tick opens nothing — undoing a mistake is not an occasion. Content lives in `src/app/content/prayerVirtues.ts` and is marked DRAFTED FOR REVIEW until a qualified reviewer signs the wording off.

## Home and azkar-group contract

- Home is the time-aware daily dashboard. The Azkar tab always opens the library index; it must never reopen an implicit previously selected category.
- Home's hero begins flush with the screen at every breakpoint. Its time-of-day photograph fills the complete hero at full opacity, while the routine and Today's Wird cards sit responsively over the lower scene on localized opaque surfaces. Compact layouts reserve visible scene space above the stacked cards; desktop uses a balanced five-column overlay. Each category image owns compact and wide focal positions chosen to preserve its primary subject under `object-fit: cover`; no image-wide overlay is permitted.
- Home's utility header is a transparent sticky overlay: it begins on the hero image, keeps its viewport position while Home scrolls, and has no filled background, border, or shadow. Its non-interactive metadata remains legible through an on-media color and text shadow. Hero, Benefits, and Friday imagery is displayed at full image opacity without a card-wide color or gradient overlay, tint, particle layer, or other decorative layer above the image. Raster artwork must not contain baked-in text; all copy remains semantic HTML on localized, high-contrast surfaces.
- The library owns global search and the complete set of released collections. Unreleased collections stay hidden until reviewed content and navigation exist.
- Category totals are derived from the content collection at runtime. Do not maintain duplicate display totals in category metadata.
- Arabic group cards use an explicit physical LTR grid so visual placement is deterministic: Arabic text occupies the right column with its own `dir="rtl"`, the category icon sits to its left, and the back/entry chevron is the far-left element. English mirrors that physical grid.
- Group progress fills from the reading start edge: right-to-left for Arabic and left-to-right for English. DOM and tab order remain stable in both languages.
- The featured “start your zikr” card uses the selected location's calculated prayer boundaries: Morning from Fajr until Asr, Evening from Asr until Isha, and Before Sleep from Isha until the following Fajr. Copy identifies after Asr until Maghrib as the preferred Evening window without hiding the collection afterward.
- The post-prayer tracker owns the actionable schedule. Every prayer card contains its own calculated local time; the next prayer card also contains its countdown, with no detached outlined schedule strip and no duplicate device clock. The featured routine card stays focused on the selected zikr, its mode, and its progress. Once that selected time-of-day collection is complete, the completion card announces and enters surface/copy/check; it leaves in the reverse check/copy/surface order, then contracts its layout row so adjacent content moves without a jump. The routine CTA remains hidden for that collection until the recommendation changes.
- Each of the five post-prayer cards opens a prayer-specific reviewed flow. Shared adhkar appear for every prescribed prayer; Fajr and Maghrib additions are admitted only where their cited timing establishes them. Completion is stored under that prayer key and updates both Home and Progress without completing the other four prayers.
- On compact screens the five post-prayer cards form a horizontal snap carousel with one full card and a visible next-card cue; tablet and desktop retain the multi-column grid. The Masbaha entry immediately follows this group in visual and DOM order.
- Each featured state uses a lightweight semantic CSS gradient for Morning, Evening, or Before Sleep; contrast must remain legible in Light, Midnight, and Dark/OLED modes without downloading decorative imagery.
- Featured-card Arabic copy is right aligned and uses RTL semantics. Zikr excerpts retain the `zikr-text` typography contract; decorative artwork has empty alternative text.
- The Home Wird keeps a stable Morning, Evening, Before Sleep DOM and keyboard order. On Arabic layouts, CSS direction places Morning at the right edge; English places it at the left edge. Compact screens use full-width horizontal rows so labels never need ellipsis; tablet and desktop use three equal cards. At desktop widths the Wird and featured-routine surfaces stretch to equal height with balanced internal padding; compact hero corners use the shared large radius rather than sharp edges.
- The post-prayer tracker uses semantic theme surfaces rather than a fixed palette, so Light, Midnight, and Dark/OLED retain their current card, border, text, and primary colors. Fajr, Dhuhr, Asr, Maghrib, and Isha have distinct repository icons. Completed, current, next, earlier, and upcoming states each pair visible text with an icon or structural treatment; current keeps `aria-current="step"` and completed uses a check.
- Counter target controls use one labelled 44px dropdown that announces the selected target, presents radio choices, and opens a labelled numeric custom-target dialog when needed. Do not render the complete preset set as competing inline buttons. The authentic-zikr picker is a labelled dialog control; its searchable list presents only the zikr and a concise reviewed benefit, while the selected screen retains the source/grade detail. The dedicated Masbaha and Friday Salawat surfaces place their reviewed evidence first, then devotional text, target filter, counter, and reset; clicking non-interactive canvas space counts while buttons, links, menus, dialogs, editable fields, and scrollbars are protected.
- The Friday Home feature is expanded only from the selected location's Thursday Maghrib through (but not including) Friday Maghrib. It is compact at other times. The expanded card keeps a concise reviewed virtue on mobile and shows its existing reviewed virtues plus reading source directly at tablet and desktop. Development preview controls do not ship in the Home UI; tests seed the relevant time state directly.
- Saved quick access preserves deterministic catalogue order and does not add a separate persisted sort preference. Its count has a complete accessible name, each row names its source and category, lazy content announces loading or failure locally, and an empty state routes to Collections rather than an empty Saved view.

## Benefit sheet contract

- Sheets and dialogs are portaled to `document.body` by their Radix/Vaul primitives, so they are positioned against the browser viewport, not the app canvas. On compact viewports the sheet still rises from and stays attached to the bottom edge.
- Width is fluid up to `--content-reading` (600 px), per DEC-004/DEC-010 — not the 390 px canvas.
- Both presentations trap focus, restore focus to the trigger on close, dismiss on Escape, and lock background scroll (DEC-025).
- Normal height is the smaller of 82 dynamic-viewport-height units and 720 px, capped at `100dvh - 12px`.
- At heights of 560 px or less, height becomes `100dvh - 12px`.
- Content scrolls inside the sheet with overscroll containment. The 64 px handle/close header remains outside the scroll viewport so dismissal is always reachable.
- **The sheet has exactly three sections in both languages: benefit, evidence, source — in that order.** It names the zikr rather than reprinting it: a single-line pill carrying the surah name and verse range, or the opening words elided with an ellipsis on a word boundary. The zikr's full text, its translation and its transliteration do not appear; the reader already shows them, and reprinting them pushed the evidence the sheet exists to serve below the fold.
- The recommended time belongs to the benefit, not to a section of its own. It sits inside the benefit section behind a clock icon, with a screen-reader-only label. A separate heading naming both timing _and_ guidance made the benefit the subject of two sections.
- Sections are separated by rules, not stacked cards, and no label is repeated inside the block it introduces.
- Apart from the close control, **the hadith carries the sheet's only copy button.** Names, one-line summaries and citations are read at a glance; a copy affordance beside each of them was five buttons competing with the text they belonged to.
- The hadith is Arabic in both interface languages — it is the narration itself, not supporting copy — so it always carries `lang="ar"` and RTL. Everything else follows the UI language, and content from the other UI language must not appear.
- The benefit is a brief statement of what the zikr yields. Authoring notes ("use the evening wording in the evening row", "recited together with …") are not benefits and must never reach this field; where a benefit is written from a narration, it may only restate what that record's own reviewed hadith says.
- Sheet content uses 24 px horizontal padding and 16 px vertical section gaps. Bottom padding includes the device safe-area inset.
- The close control stays at logical end and has a 44×44 px target.
- The copy action uses Untitled UI `Copy04`, exposes a localized accessible label, and replaces the icon briefly with a check after a successful copy.

## Benefits index contract

- The index has exactly two peer filters: Qur'an and Hadith. Cards do not repeat the active filter name or add a second category banner.
- A Qur'an card presents the verse, then one concise citation in the form “Surah name · surah:ayah.” A Hadith card presents the reviewed text, then its available reviewed book/reference and authenticity grade. Narrator metadata is shown only after it has been independently sourced and approved; it must never be inferred or invented.
- Derived benefits remain traceable in reviewed content data but are not repeated in the Benefits index. The index presents only the primary Qur'an or hadith evidence and its concise reviewed citation; this avoids a redundant disclosure and separator inside every card.
- Card surfaces are opaque and use the shared radius, border, text, and action tokens. Sharing is a named 44px icon action rather than a full-width competing call to action.

## Scrollbar contract

- Every native app scroll region and every Radix scroll area uses the same thin, rounded, theme-aware scrollbar treatment.
- Tracks are transparent. Thumbs use the semantic muted-foreground color at restrained opacity and shift toward the primary color on pointer hover.
- Scrollbars must not introduce horizontal overflow or steal content width; touch scrolling remains the primary mobile interaction.

## Motion and microinteraction contract

Motion supports comprehension and calm focus; it must never turn worship into a game. Prefer one clear response to an action, short durations, restrained scale, and no endless decorative motion.

### Timing and easing

| Role                    |       Duration | Use                                               |
| ----------------------- | -------------: | ------------------------------------------------- |
| Press feedback          |     120–150 ms | Buttons, cards, navigation                        |
| Small state change      |     160–220 ms | Count change, menu, favorite, active tab          |
| Screen/content entrance |     240–300 ms | New zikr, sheets, completion content              |
| Emphasis                |     440–600 ms | Counter readiness and completion check            |
| Auto-advance pause      | Exactly 500 ms | Preserve the completed check before the next zikr |

Use `cubic-bezier(0.22, 1, 0.36, 1)` for spring-like entrances and standard ease-out for opacity. Motion must use opacity/transform whenever possible. The existing `.reduce-motion` class and `prefers-reduced-motion` query collapse animations and transitions to 0.01 ms, but the semantic 500 ms completion pause remains.

### Screen audit

| Surface                    | Required microinteraction                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Splash/onboarding/auth     | One directional screen entrance; buttons compress slightly on press; progress dots resize smoothly. No looping decoration.                                                                         |
| Home/category/search       | Cards compress to 98% on press; progress changes animate; completed state remains visible without replaying celebration whenever the list opens.                                                   |
| Bottom navigation          | Active icon performs one 220 ms lift/pop; press feedback remains subtle and does not reorder tabs.                                                                                                 |
| Reader — new zikr          | Content settles upward over 260 ms. The empty ring performs one restrained 600 ms readiness pulse and halo; the only visible instruction is “Tap anywhere to count.”                               |
| Reader — each count        | Number performs a 160 ms restrained pop, ring progress animates, a short 8 ms supported-device vibration confirms the physical tap, and the existing pulse ring responds once.                     |
| Reader — completion        | Lock duplicate taps, fill the ring, animate a check with no visible text, announce completion nonvisually, use a short vibration pattern where supported, retain for exactly 500 ms, then advance. |
| Reader menu/save/reference | Menu opens in 160 ms, save heart pops once, scrim fades in, and sheet rises in 260 ms with the close control immediately available.                                                                |
| Settings                   | Toggle thumb and color change together in 200–300 ms; rows use opacity/press feedback; destructive actions do not celebrate.                                                                       |
| Session completion         | Main check uses the celebration pop/glow once; summary cards enter with a short stagger; primary actions compress on press.                                                                        |

### Accessibility and feedback

- Completion uses a visible check, progress state, an assertive live-region announcement, and optional vibration; it never relies on color or vibration alone.
- Ready-state copy is announced when a new zikr starts. Counter activation supports pointer, Enter, and Space.
- Never delay navigation for decorative motion except the documented 500 ms completion acknowledgement.
- Do not add autoplaying, looping, flashing, parallax, or large lateral movement. Haptics must be short, optional, and ignored gracefully when unsupported.

## Responsive shell

Four tiers, defined by width only. `useLayoutMode` and the CSS media queries in `src/styles/theme/layout.css` must agree on these boundaries — a mismatch previously left one range with no navigation at all.

| Tier       | Width        | Shell                               | Navigation          |
| ---------- | ------------ | ----------------------------------- | ------------------- |
| `compact`  | ≤599px       | Full-bleed, no rounded canvas       | Bottom navigation   |
| `medium`   | 600px–899px  | Fluid grid, main + bottom-nav areas | Bottom navigation   |
| `expanded` | 900px–1199px | Fluid grid, rail + main areas       | Vertical nav rail   |
| `large`    | ≥1200px      | Fluid grid, sidebar + main areas    | Labeled nav sidebar |

- There is no drawer/off-canvas navigation variant; exactly one nav component mounts per tier.
- **Component sub-steps at 768px and 1024px.** The four tiers govern the shell: which navigation mounts and how the page grid is laid out. Individual components may additionally step at 768px and 1024px — the counter's size steps, the Home card grid, the desktop scrollbar treatment and the app-shell border all do. These are deliberate and separate from the tier boundaries: a control can outgrow its size before the whole shell changes shape. Anything that changes _navigation or shell structure_ must use 600/900/1200; anything sizing a component within the page may use the sub-steps. `useLayoutMode` and the shell media queries continue to agree on the four tiers.
- Navigation is hidden entirely on splash, onboarding and auth views at every tier.
- Height is never part of tier selection. Short landscape viewports keep the navigation for their width.
- Reader/focused flows: constrained reading measure (~430px–600px maximum), independent of tier. On the wide-desktop reader (≥1200px, see the Reader contract above) the card chrome around that column widens to fill the shell; the reading measure itself stays capped at 600px.
- Splash, onboarding, and authentication do not reserve an empty desktop navigation column. Their interactive content uses `--content-form` (40rem) and related controls stay grouped instead of being separated by viewport-filling spacers. Compact-height desktop and landscape views scroll from the top rather than centering into clipped content.
- Zikr collection overviews use `--content-form` (40rem) for the header, progress controls, introduction, and item list while remaining fluid and full-width below that measure.
- Routine length on a collection overview is a compact radio menu in the primary action row beside Continue/Start and Reset, rather than a full-width segmented control.
- Library scope is a compact radio menu beside Search. A selected menu item uses a logical-start checkmark plus the semantic primary highlight; it never uses an unlabelled dot or an overlapping physical-left indicator in RTL.
- Home's paired hero cards use equal columns and equal stretch height from the expanded tier onward. The pair stays inside the 80rem dashboard measure, while each card remains fluid inside its column instead of expanding without a layout guide.
- The integrated Home hero reserves only compact utility-header clearance before its first card; viewport-filling blank spacers are prohibited.
- Masbaha and Friday Salawat use the Reader session hierarchy: icon actions in the header, compact progress metadata and track, centered devotional text, the shared counter surface, and target/reset controls below. Evidence opens from the header's book action instead of occupying the counting canvas.
- Progress always presents the current Wird views directly. The obsolete garden-visibility banner and hidden-state card are not part of the canonical Progress screen, and legacy stored visibility values cannot hide the Home current Wird.
- Dashboard-tier screens opt into `.page-content-center` (max `--content-dashboard`); Settings uses its own two-pane with `--content-form` on the detail pane.
- Progress Day, Week, Month, and Year keep the compact 44rem measure through the expanded tier, then may use up to 80rem at the large desktop tier for calendars, summaries, and charts. Their semantic order and compact text size do not change.
- The reference layouts are verified at 320×700, 390×844, 643×275, and 1110×835. Playwright protects narrow-phone, phone, tablet, and desktop shell geometry.

## Change control

Any typography, direction, reader-control, counter-size, motion timing, modal-height, or shell-width change must update this document and its automated regression coverage in the same change. Visual approval alone does not replace formatting, lint, strict types, unit/build, accessibility, and responsive browser gates.
