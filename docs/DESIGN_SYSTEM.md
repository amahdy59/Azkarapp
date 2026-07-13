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

## Reader contract

- The header uses fixed physical placement: back on the left, screen title centered, menu on the right. Its internal grid is LTR; Arabic title and menu content retain RTL semantics.
- The single top progress track is the only session-position indicator. Do not add a second “1 of 26” text row above the zikr.
- Reader content shows the zikr only. EN, TR, and Listen controls are intentionally hidden until a future approved feature revision.
- There is no separator between zikr content and the counter.
- The counter ring is 184 CSS px. The entire counter surface is the 44 px-plus accessible tap target, not only the ring. It uses `touch-action: manipulation`, supports Enter/Space, and sits in the upper-middle/lower-thumb transition zone so one-handed use remains comfortable.
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
- Normal maximum height is the smaller of 82 dynamic-viewport-height units and 720 px.
- At heights of 560 px or less, maximum height becomes `100dvh - 12px`.
- Content scrolls inside the sheet with overscroll containment. The 64 px handle/close header is sticky so dismissal remains reachable.
- Horizontal content margins use `clamp(16px, 6vw, 24px)`. Bottom padding includes the device safe-area inset.
- The close action uses the logical `end` edge and a 44×44 px target, so it follows RTL correctly.

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

| Surface                    | Required microinteraction                                                                                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Splash/onboarding/auth     | One directional screen entrance; buttons compress slightly on press; progress dots resize smoothly. No looping decoration.                                                                   |
| Home/category/search       | Cards compress to 98% on press; progress changes animate; completed state remains visible without replaying celebration whenever the list opens.                                             |
| Bottom navigation          | Active icon performs one 220 ms lift/pop; press feedback remains subtle and does not reorder tabs.                                                                                           |
| Reader — new zikr          | Content settles upward over 260 ms. The empty ring performs one 600 ms “calm breath” and halo, with “Take a calm breath, then tap to begin.” It never blocks the first tap.                  |
| Reader — each count        | Number performs a 160 ms restrained pop, ring progress animates, a short 8 ms supported-device vibration confirms the physical tap, and the existing pulse ring responds once.               |
| Reader — completion        | Lock duplicate taps, fill the ring, animate a drawn check, announce completion, use a short completion vibration pattern where supported, retain the state for exactly 500 ms, then advance. |
| Reader menu/save/reference | Menu opens in 160 ms, save heart pops once, scrim fades in, and sheet rises in 260 ms with the close control immediately available.                                                          |
| Settings                   | Toggle thumb and color change together in 200–300 ms; rows use opacity/press feedback; destructive actions do not celebrate.                                                                 |
| Session completion         | Main check uses the celebration pop/glow once; summary cards enter with a short stagger; primary actions compress on press.                                                                  |

### Accessibility and feedback

- Completion uses a visible check, text, progress state, an assertive live-region announcement, and optional vibration; it never relies on color or vibration alone.
- Ready-state copy is announced when a new zikr starts. Counter activation supports pointer, Enter, and Space.
- Never delay navigation for decorative motion except the documented 500 ms completion acknowledgement.
- Do not add autoplaying, looping, flashing, parallax, or large lateral movement. Haptics must be short, optional, and ignored gracefully when unsupported.

## Responsive shell

- At viewport widths up to 430 px, the app is full-bleed and uses `100vw × 100dvh`.
- Above 430 px, preserve the centered 390 px mobile design canvas; do not stretch cards or reader content across tablet/desktop widths.
- The reference layouts are verified at 390×844, 643×275, and 1110×835. Playwright protects phone, tablet, and desktop shell geometry.

## Change control

Any typography, direction, reader-control, counter-size, motion timing, modal-height, or shell-width change must update this document and its automated regression coverage in the same change. Visual approval alone does not replace formatting, lint, strict types, unit/build, accessibility, and responsive browser gates.
