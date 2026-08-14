# Azkar design system

This is the implementation source of truth for visual and interaction decisions. New screens and refactors must follow this file together with `QUALITY_CHECKLIST.md`. If an older mockup conflicts with a decision recorded here, this document and the current approved Figma modes take precedence.

## Authoritative references

| Area                        | Reference                                                                   |
| --------------------------- | --------------------------------------------------------------------------- |
| Figma file                  | `W5uCKGhODwqBmZU1etuRH3` — Azkar Application                                |
| Core screens                | Nodes `443:2541`, `443:1533`, `443:1401`, and `443:1747`                    |
| Additional Midnight screens | Nodes `443:2376` and `450:2648`                                             |
| Theme modes                 | Light, Midnight, and Dark/OLED variable modes in the Figma appearance panel |
| Semantic tokens             | `src/styles/theme.css`                                                      |
| Typography                  | Offline system-family stacks in `src/styles/theme.css`                      |
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

Rules:

- A zikr excerpt remains zikr content even when it appears on Home, Category, onboarding, reader, counter, or reference surfaces; use `zikr-text` in every location.
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
- Radius roles are 8 px for compact internal elements, 12-14 px for controls, 16-20 px for standard cards, and 24 px for major containers and sheets. Full-radius for chips and compact segmented controls only.
- Elevation: Use three levels only (Flat/bordered surface, Raised card, Modal/sheet). Avoid applying a large soft shadow to every card. Raised and Modal/sheet are backed by the `--ds-shadow-raised`/`--ds-shadow-overlay` tokens (`src/styles/theme.css`), mapped to the `shadow-raised`/`shadow-overlay` Tailwind utilities.
- Control heights have three roles: compact 44 px, regular 48 px, and prominent 52 px. Every interactive target remains at least 44×44 CSS px.
- Use subtle borders to separate passive surfaces and the higher-contrast control border for inputs and toggles. Meaningful control boundaries must reach 3:1 non-text contrast.
- Focus indicators have exactly two roles:
  - **Controls** (buttons, links, inputs, tabs, radios, switches, cards acting as buttons) use `focus-visible:ring-[3px] focus-visible:ring-ring` — the semantic ring color at the full 3 px width. Add `focus-visible:ring-inset` only where an ancestor's `overflow: hidden` would clip an outward ring (e.g. rows inside a clipped settings card). Destructive actions may substitute `focus-visible:ring-destructive`.
  - **Scroll regions** (non-control containers that are focusable only so keyboard users can scroll them) use `focus-visible:ring-1 focus-visible:ring-ring/40` — deliberately subtle, because a full 3 px ring around a page-sized region is visually overwhelming and the region is not an actionable control.
- The global `:focus-visible` outline rule in `src/styles/theme.css` remains the automatic fallback, so an element that opts out of both treatments still gets a visible token-driven indicator rather than none.

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
- The single top progress track is the only session-position indicator. Do not add a second “1 of 26” text row above the zikr.
- Primary phone headings remain on one line and use responsive sizing before a final truncation safeguard. Validate the 412×924 OnePlus Nord 4 profile as well as the 320px compact profile.
- The Arabic source text remains visible in the Reader because it is the zikr itself. English mode may additionally show the reviewed translation and transliteration when those reading preferences are enabled; Arabic mode must not leak English supporting copy.
- There is no separator between zikr content and the counter.
- The Reader keeps the shared compact rectangular counter surface: up to 220 CSS px wide and 76 CSS px high, with a centered ratio and progress along its outline. The dedicated Custom Counter expands from a compact `min(288px, 78vw)` surface to 288 x 96 CSS px at tablet width and 448 x 144 CSS px at desktop width; the Friday Salawat counter uses the same compact expansion principle but remains capped at 320 x 104 CSS px on wider screens. Their numerals use `rem`, so they scale with the app-wide text-size preference. Every counter activation emits the same one-shot ripple unless reduced motion is active. For ordinary adhkar, a pointer activation anywhere on the Reader canvas counts and emits that ripple, except interactive controls, menus, dialogs, editable fields, and scrollbars. Full surahs are counter-only: neither the Quran text nor canvas whitespace may change the count. The explicit reading and counter surfaces support Enter/Space and use `touch-action: manipulation` where applicable.
- Before counting, the only visible instruction is localized and mode-specific: “Tap anywhere to count” for ordinary adhkar and “Tap counter when finished” inside the explicit counter for full surahs. Do not add breathing, readiness, motivational, or other generic helper copy.
- Reviewed difficult words in full surahs use a subtle semantic-primary tint plus a dotted underline, so meaning is never communicated by color alone. Activating a highlighted word opens a source-attributed meaning sheet and never changes the count. The inline-text target-size exception preserves Quran line flow; generous line height, visible focus, and keyboard activation preserve usability.
- Word-help matching may normalize Arabic marks only to locate approved source phrases. Rendering must splice the untouched Quran string, never replace or normalize the displayed Quran text.
- Per-zikr completion is visually checkmark-only: no text appears inside the ring or around it during the 500 ms acknowledgement. Completion details remain available through the nonvisual live-region announcement.
- Share, Benefit, and save remain separate actions below the counter with targets of at least 44×44 CSS px. Their flexible toolbar must stay inside a 320 px app canvas. On the wide-desktop reader (see below) these relocate into the hero's action cluster instead.
- Share generates a theme-aware 1080×2920 PNG locally. Mobile uses Web Share with an image file; unsupported browsers copy the PNG or download it. Arabic cards exclude English supporting content, while English cards include the Arabic zikr with meaning, pronunciation, benefit, and source.
- The reader has one contained vertical scroll region. Short screens must preserve access to the zikr, counter, and actions without document-level horizontal overflow.
- **Wide-desktop reader (≥1200px, `src/app/hooks/useMediaQuery.ts`):** gated at exactly the shell's own `large` tier boundary (where the labeled nav sidebar already appears), not a separate breakpoint, so the reader's chrome and the shell's chrome change together. The Reader swaps its plain header for a fixed dark-navy hero band (same `#0b1426` brand surface as Home's `.azkar-hero`, independent of the active theme) carrying the back control, category title, and the collection progress bar, and wraps the reading content in a bordered card. Menu, Benefit, save, share, and sound relocate into the hero's top-end action cluster — a single toolbar row with the back control at top-start, rather than a second row inside the card — instead of below the counter; the 320px-canvas/below-counter rule above applies to `large` tier and narrower. Benefit is icon-only here (unlike its labelled pill elsewhere); its tooltip previews the actual reviewed benefit text rather than repeating the button's own name. Previous and Next remain explicit buttons and sit at the logical side edges, vertically centered within the zikr card on tablet and desktop; compact layouts keep them beside the counter. The card has no separate "Zikr {index} of {total}" strip because the hero progress already communicates session position. The keyboard-shortcuts hint (→/←, R, Esc, plus Space for ordinary adhkar) sits below the counter in the card/page flow with at least 20 px clearance. The reading column itself stays capped at 600px and centered inside the wider card — width grows for chrome, not for line length, per the responsive-shell reading-measure rule below. Each Mushaf page (`MushafPageReader`'s `flat` prop) drops its own bordered surface here in favor of a plain divider, since the outer card already carries the elevation; mobile keeps the per-page card since it has no outer card. For long Surahs specifically: the hero shows the collection's reviewed benefit text (the same content the Benefit sheet shows, not new copy) as a one-line teaser, since a long Surah is always a single stable zikr per category so the line can't flicker as the reader advances; a floating pill (both trees, not desktop-only) reports the current Mushaf page and jumps to the counter, hidden on the first and last page.

## Home and azkar-group contract

- Home is the time-aware daily dashboard. The Azkar tab always opens the library index; it must never reopen an implicit previously selected category.
- Home's hero begins flush with the screen at every breakpoint. Each category image owns compact and wide focal positions chosen to preserve its mosque or primary subject under `object-fit: cover`. A short, finite particle drift may sit over the decorative image; it is non-interactive, hidden from assistive technology, and removed by reduced-motion, reduced-transparency, and high-contrast modes.
- Home's utility header has no filled background, border, or shadow. Hero, Benefits, and Friday imagery is displayed at full image opacity without a card-wide color or gradient overlay; functional copy remains on localized, high-contrast card surfaces rather than a blanket image scrim.
- The library owns global search and the complete set of released collections. Unreleased collections stay hidden until reviewed content and navigation exist.
- Category totals are derived from the content collection at runtime. Do not maintain duplicate display totals in category metadata.
- Arabic group cards use an explicit physical LTR grid so visual placement is deterministic: Arabic text occupies the right column with its own `dir="rtl"`, the category icon sits to its left, and the back/entry chevron is the far-left element. English mirrors that physical grid.
- Group progress fills from the reading start edge: right-to-left for Arabic and left-to-right for English. DOM and tab order remain stable in both languages.
- The featured “start your zikr” card uses the selected location's calculated prayer boundaries: Morning from Fajr until Asr, Evening from Asr until Isha, and Before Sleep from Isha until the following Fajr. Copy identifies after Asr until Maghrib as the preferred Evening window without hiding the collection afterward.
- The post-prayer tracker owns the actionable schedule. Every prayer card contains its own calculated local time; the next prayer card also contains its countdown, with no detached outlined schedule strip and no duplicate device clock. The featured routine card stays focused on the selected zikr, its mode, and its progress. Once that selected time-of-day collection is complete, the completion card announces and exits, and the routine CTA remains hidden for that collection until the recommendation changes.
- Each of the five post-prayer cards opens a prayer-specific reviewed flow. Shared adhkar appear for every prescribed prayer; Fajr and Maghrib additions are admitted only where their cited timing establishes them. Completion is stored under that prayer key and updates both Home and Progress without completing the other four prayers.
- Each featured state uses a lightweight semantic CSS gradient for Morning, Evening, or Before Sleep; contrast must remain legible in Light, Midnight, and Dark/OLED modes without downloading decorative imagery.
- Featured-card Arabic copy is right aligned and uses RTL semantics. Zikr excerpts retain the `zikr-text` typography contract; decorative artwork has empty alternative text.
- The Home Wird keeps a stable Morning, Evening, Before Sleep DOM and keyboard order. On Arabic layouts, CSS direction places Morning at the right edge; English places it at the left edge. Compact screens use full-width horizontal rows so labels never need ellipsis; tablet and desktop use three equal cards.
- The post-prayer tracker uses semantic theme surfaces rather than a fixed palette, so Light, Midnight, and Dark/OLED retain their current card, border, text, and primary colors. Fajr, Dhuhr, Asr, Maghrib, and Isha have distinct repository icons. Completed, current, next, earlier, and upcoming states each pair visible text with an icon or structural treatment; current keeps `aria-current="step"` and completed uses a check.
- Counter target controls use a labelled `fieldset`, minimum 44px presets, and a labelled numeric custom-target field. Presets wrap into a three-column compact grid instead of clipping horizontally, then become a single row when space permits. The authentic-zikr picker is a labelled dialog control; its searchable list presents only the zikr and a concise reviewed benefit, while the selected screen retains the source/grade detail.
- The Friday Home feature is expanded only from the selected location's Thursday Maghrib through (but not including) Friday Maghrib. It is compact at other times. The expanded card keeps a concise reviewed virtue on mobile and shows its existing reviewed virtues plus reading source directly at tablet and desktop. Development preview controls do not ship in the Home UI; tests seed the relevant time state directly.
- Saved quick access preserves deterministic catalogue order and does not add a separate persisted sort preference. Its count has a complete accessible name, each row names its source and category, lazy content announces loading or failure locally, and an empty state routes to Collections rather than an empty Saved view.

## Benefit sheet contract

- Sheets and dialogs are portaled to `document.body` by their Radix/Vaul primitives, so they are positioned against the browser viewport, not the app canvas. On compact viewports the sheet still rises from and stays attached to the bottom edge.
- Width is fluid up to `--content-reading` (600 px), per DEC-004/DEC-010 — not the 390 px canvas.
- Both presentations trap focus, restore focus to the trigger on close, dismiss on Escape, and lock background scroll (DEC-025).
- Normal height is the smaller of 82 dynamic-viewport-height units and 720 px, capped at `100dvh - 12px`.
- At heights of 560 px or less, height becomes `100dvh - 12px`.
- Content scrolls inside the sheet with overscroll containment. The 64 px handle/close header remains outside the scroll viewport so dismissal is always reachable.
- English hierarchy is translation, pronunciation, reviewed benefit, and English source. Arabic hierarchy is Arabic zikr, Arabic benefit, optional Arabic evidence, and Arabic source. Content from the other UI language must not appear.
- Sheet content uses 24 px horizontal padding and 16 px vertical section gaps. Bottom padding includes the device safe-area inset.
- The close control stays at logical end and has a 44×44 px target.
- Copy actions use Untitled UI `Copy04`, expose localized accessible labels, and replace the icon briefly with a check after a successful copy.

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

Four tiers, defined by width only. `useLayoutMode` and the CSS media queries in `src/styles/theme.css` must agree on these boundaries — a mismatch previously left one range with no navigation at all.

| Tier       | Width        | Shell                               | Navigation          |
| ---------- | ------------ | ----------------------------------- | ------------------- |
| `compact`  | ≤599px       | Full-bleed, no rounded canvas       | Bottom navigation   |
| `medium`   | 600px–899px  | Fluid grid, main + bottom-nav areas | Bottom navigation   |
| `expanded` | 900px–1199px | Fluid grid, rail + main areas       | Vertical nav rail   |
| `large`    | ≥1200px      | Fluid grid, sidebar + main areas    | Labeled nav sidebar |

- There is no drawer/off-canvas navigation variant; exactly one nav component mounts per tier.
- Navigation is hidden entirely on splash, onboarding and auth views at every tier.
- Height is never part of tier selection. Short landscape viewports keep the navigation for their width.
- Reader/focused flows: constrained reading measure (~430px–600px maximum), independent of tier. On the wide-desktop reader (≥1200px, see the Reader contract above) the card chrome around that column widens to fill the shell; the reading measure itself stays capped at 600px.
- Splash, onboarding, and authentication do not reserve an empty desktop navigation column. Their interactive content uses `--content-form` (40rem) and related controls stay grouped instead of being separated by viewport-filling spacers. Compact-height desktop and landscape views scroll from the top rather than centering into clipped content.
- Zikr collection overviews use `--content-form` (40rem) for the header, progress controls, introduction, and item list while remaining fluid and full-width below that measure.
- Routine length on a collection overview is a compact radio menu in the primary action row beside Continue/Start and Reset, rather than a full-width segmented control.
- Dashboard-tier screens opt into `.page-content-center` (max `--content-dashboard`); Settings uses its own two-pane with `--content-form` on the detail pane.
- Progress Day, Week, Month, and Year keep the compact 44rem measure through the expanded tier, then may use up to 72rem at the large desktop tier for calendars, summaries, and charts. Their semantic order and compact text size do not change.
- The reference layouts are verified at 320×700, 390×844, 643×275, and 1110×835. Playwright protects narrow-phone, phone, tablet, and desktop shell geometry.

## Change control

Any typography, direction, reader-control, counter-size, motion timing, modal-height, or shell-width change must update this document and its automated regression coverage in the same change. Visual approval alone does not replace formatting, lint, strict types, unit/build, accessibility, and responsive browser gates.
