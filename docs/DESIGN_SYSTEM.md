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

## Reference sheet contract

- Width is fluid up to the 390 px app canvas.
- Normal maximum height is the smaller of 82 dynamic-viewport-height units and 720 px.
- At heights of 560 px or less, maximum height becomes `100dvh - 12px`.
- Content scrolls inside the sheet with overscroll containment. The 64 px handle/close header is sticky so dismissal remains reachable.
- Horizontal content margins use `clamp(16px, 6vw, 24px)`. Bottom padding includes the device safe-area inset.
- The close action uses the logical `end` edge and a 44×44 px target, so it follows RTL correctly.

## Responsive shell

- At viewport widths up to 430 px, the app is full-bleed and uses `100vw × 100dvh`.
- Above 430 px, preserve the centered 390 px mobile design canvas; do not stretch cards or reader content across tablet/desktop widths.
- The reference layouts are verified at 390×844, 643×275, and 1110×835. Playwright protects phone, tablet, and desktop shell geometry.

## Change control

Any typography, direction, reader-control, counter-size, modal-height, or shell-width change must update this document and its automated regression coverage in the same change. Visual approval alone does not replace formatting, lint, strict types, unit/build, accessibility, and responsive browser gates.
