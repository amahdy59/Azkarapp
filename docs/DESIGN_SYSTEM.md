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
| Font loading                | `src/styles/fonts.css`                                                      |
| Shared shell/navigation     | `src/app/components/LayoutShells.tsx`                                       |
| Reader implementation       | `src/app/screens/ReaderScreen.tsx`                                          |
| Product icon library        | Untitled UI Icons via `src/app/components/icons.ts`                         |

## Typography contract

The following assignments are fixed. Do not substitute a visually similar font or restore legacy Amiri/Noto Naskh declarations.

| Content                                                   | Typeface                               | CSS contract                                                                           | Direction                    |
| --------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------- |
| English UI                                                | Inter                                  | Default `body` family; `font-sans` or `latin-ui` for explicit mixed-language fragments | LTR                          |
| Arabic UI, labels, navigation, settings, and instructions | Noto Sans Arabic                       | Inherited from `[lang="ar"] body`; `arabic-ui` for explicit mixed-language fragments   | RTL                          |
| Zikr, du'a, Qur'anic, and Arabic evidence text            | IBM Plex Sans Arabic                   | Add the `zikr-text` class and `lang="ar"`                                              | RTL                          |
| Numeric counters                                          | Existing numeral formatter/font helper | `counterNumeralFontFamily` or `numeralFontFamily`                                      | LTR inside the numeric group |

Rules:

- A zikr excerpt remains zikr content even when it appears on Home, Category, onboarding, reader, counter, or reference surfaces; use `zikr-text` in every location.
- English interface copy uses Inter. Arabic interface copy uses Noto Sans Arabic. The document `lang` and `dir` are set by `App.tsx` and screens may repeat `dir` at layout boundaries to make behavior explicit.
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

## Reader contract

- The header uses fixed physical placement: back on the left, screen title centered, menu on the right. Its internal grid is LTR; Arabic title and menu content retain RTL semantics.
- The single top progress track is the only session-position indicator. Do not add a second “1 of 26” text row above the zikr.
- Reader content shows the zikr only. EN, TR, and Listen controls are intentionally hidden until a future approved feature revision.
- There is no separator between zikr content and the counter.
- The counter ring is 184 CSS px. The entire counter surface is the 44 px-plus accessible tap target, not only the ring. It uses `touch-action: manipulation`, supports Enter/Space, and sits in the upper-middle/lower-thumb transition zone so one-handed use remains comfortable.
- Before counting, the only visible instruction is “Tap anywhere to count” (localized). Do not add breathing, readiness, motivational, or other generic helper copy.
- Per-zikr completion is visually checkmark-only: no text appears inside the ring or around it during the 500 ms acknowledgement. Completion details remain available through the nonvisual live-region announcement.
- Share, references, and save remain separate 48 px actions below the counter.
- The reader has one contained vertical scroll region. Short screens must preserve access to the zikr, counter, and actions without document-level horizontal overflow.

## Home and azkar-group contract

- Arabic group cards use an explicit physical LTR grid so visual placement is deterministic: Arabic text occupies the right column with its own `dir="rtl"`, the category icon sits to its left, and the back/entry chevron is the far-left element. English mirrors that physical grid.
- Group progress fills from the reading start edge: right-to-left for Arabic and left-to-right for English. DOM and tab order remain stable in both languages.
- The featured “start your zikr” card is time-aware: Morning from 05:00–14:59, Evening from 15:00–20:59, and Before Sleep from 21:00–04:59 local device time. It always opens the first zikr in the selected group.
- Each featured state uses its approved scene asset from `src/assets/home`: `morning-scene.png` for Morning, `evening-scene.png` for Evening, and `before-sleep-scene.png` for Before Sleep. Artwork is decorative, sits behind all copy, fills the card, and uses the theme-owned `--featured-scene-opacity` token plus a semantic card/background overlay for legibility in Light, Midnight, and Dark/OLED modes.
- Featured-card Arabic copy is right aligned and uses RTL semantics. Zikr excerpts retain the `zikr-text` typography contract; decorative artwork has empty alternative text.

## Reference sheet contract

- Width is fluid up to the 390 px app canvas.
- Normal height is the smaller of 82 dynamic-viewport-height units and 720 px, capped at `100dvh - 12px`.
- At heights of 560 px or less, height becomes `100dvh - 12px`.
- Content scrolls inside the sheet with overscroll containment. The 64 px handle/close header remains outside the scroll viewport so dismissal is always reachable.
- The Figma hierarchy is fixed: muted Arabic zikr card, translation, divider, transliteration, optional hadith, then source badge. Do not reintroduce metadata cards, timing notes, authenticity cards, or duplicate count information here.
- Sheet content uses 24 px horizontal padding and 16 px vertical section gaps. Bottom padding includes the device safe-area inset.
- The close control stays at the physical top-right to match the approved component in every locale and has a 44×44 px target.
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

- At viewport widths up to 430 px, the app is full-bleed and uses `100vw × 100dvh`.
- Above 430 px, preserve the centered 390 px mobile design canvas; do not stretch cards or reader content across tablet/desktop widths.
- The reference layouts are verified at 390×844, 643×275, and 1110×835. Playwright protects phone, tablet, and desktop shell geometry.

## Change control

Any typography, direction, reader-control, counter-size, motion timing, modal-height, or shell-width change must update this document and its automated regression coverage in the same change. Visual approval alone does not replace formatting, lint, strict types, unit/build, accessibility, and responsive browser gates.
