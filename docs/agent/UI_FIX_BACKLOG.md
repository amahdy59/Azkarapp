# UI fix backlog

User-supplied list, 2026-08-08. Items retain the user's original numbering. DEC-044 records the approved resolution of the earlier Home-header and non-Home-surface conflicts.

## Current release status

The complete numbered list is implemented and has passed the mandatory local release gate. All numbered items are marked **Verified complete**. The GitHub workflow, deployment, and production-smoke conclusions for the published commit belong in the release handoff; any failed release check reopens the affected item.

Final command results and manual/visual evidence belong in `docs/agent/evidence/pre-phase-09/PRE_PHASE_09_REPORT.md`.

## 1. Home page

| Item                             | Status                | Implementation evidence                                                                                                                                                                    |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1.1** Home text accessibility  | **Verified complete** | DEC-035 added semantic on-media tokens and automated contrast checks across all five appearance modes.                                                                                     |
| **1.2** Dynamic Home background  | **Verified complete** | Home selects Morning, Evening, Before Sleep, or Friday context; Friday overrides the ordinary time recommendation only on Home. Non-Home screens do not mount the photographic background. |
| **1.3** Responsive Masbaha entry | **Verified complete** | `TasbeehCounterButton` uses compact mobile geometry, grows through tablet spacing, fills its container, and caps its reading width on large screens.                                       |

## 2. Global surfaces except Home

| Item                                                  | Status                | Implementation evidence                                                                                                                                                                                                                                                                                                               |
| ----------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.1** Remove non-Home photography                   | **Verified complete** | DEC-026 restricts `TimeOfDayBackground` to Home; the current diff preserves that rule.                                                                                                                                                                                                                                                |
| **2.2a** Subtle non-Home texture                      | **Verified complete** | `App.tsx` exposes the active view; `ScreenContainer` and direct top-level screen roots supply the page-surface hooks. Theme CSS applies low-opacity tonal noise only to non-Home surfaces and disables it for high contrast, reduced transparency, and `prefers-reduced-transparency`. Functional and devotional cards remain opaque. |
| **2.2b** Card, button, and completion-cue consistency | **Verified complete** | Affected Library, Category, Friday, counter, Benefits, Saved, and sleep-checklist surfaces use the established radius, elevation, focus, target-size, and semantic-state contracts; oversized one-off hover shadows were removed from these flows.                                                                                    |
| **2.2c** Counter consistency and responsive geometry  | **Verified complete** | Reader and custom counter retain their distinct purposes while sharing the 184px counter surface, responsive constrained layout, keyboard guard behavior, and optional click-feedback contract. DEC-043 already verified Reader desktop/mobile geometry.                                                                              |
| **2.2d** Optional counter click sound                 | **Verified complete** | Reader and custom counter use the same device-local `azkarapp.counter-sound.v1` preference, visible 44px mute/unmute controls, and a short platform Web Audio click that fails safely when unsupported.                                                                                                                               |

## 3. Azkar Library and search

| Item                                               | Status                | Implementation evidence                                                                                                                                                                |
| -------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **3.1** Search and filters side by side on desktop | **Verified complete** | The existing first-class Collections/Saved tabs are retained and align beside search at 900px and wider; narrower layouts stack. DEC-044 records the keep-filters decision.            |
| **3.2** No premature search navigation             | **Verified complete** | Focusing the input or its visual search icon stays in Library. Navigation occurs only after non-whitespace text is entered or the form is submitted. The query is carried into Search. |
| **3.3** Natural Arabic input direction             | **Verified complete** | Empty Arabic search fields are explicitly RTL/right-start; typed content uses natural `dir="auto"`.                                                                                    |
| **3.4** Visible input labels                       | **Verified complete** | Library and Search expose visible, programmatically associated labels instead of relying on placeholders.                                                                              |

## 4. Friday Mode and long-surah reading

| Item                                     | Status                | Implementation evidence                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4.1** Responsive Friday layout         | **Verified complete** | Friday Mode is a one-column compact/tablet flow and a bounded two-column desktop grid; the hero and final dua action span the desktop grid.                                                                                                                                                                                                        |
| **4.2** Mushaf-style long-surah pages    | **Verified complete** | Al-Kahf, As-Sajdah, and Al-Mulk carry reviewed Madani Mushaf page ranges. `MushafPageReader` renders semantic page sections and visible separators from existing ayah markers without changing Quran text.                                                                                                                                         |
| **4.3** Counter only after long surahs   | **Verified complete** | Multi-page metadata is the long-surah signal. Long-surah text/canvas taps cannot count and the counter appears after the final page; short surahs such as Al-Ikhlas retain ordinary tap-anywhere counting.                                                                                                                                         |
| **4.4** Final Friday action and progress | **Verified complete** | The supporting subtext is removed; DEC-043 verified the arrow already points outward in LTR and RTL. Friday Mode shows a simple progress bar, current completion ratio, and start/continue/completion blessing copy. Comprehensive duas completed through the Friday-origin session are tracked per ISO week, separately from lifetime completion. |

## 5. Cross-cutting improvements

| Item                                       | Status                | Implementation evidence                                                                                                                                                                                         |
| ------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **5.1** Zikr Benefits Home card and screen | **Verified complete** | Home opens a lazy dedicated Benefits screen built only from existing reviewed benefit/source fields. Each item has an explicit WhatsApp share link.                                                             |
| **5.2** Saved zikr on Home                 | **Verified complete** | Home shows up to three saved items plus a route to the canonical Saved library. Regular, comprehensive-dua, and lazy Al-Kahf saved entries open the Reader without changing saved IDs or persistence semantics. |
| **5.3** Desktop Reader counter             | **Verified complete** | DEC-043 restored and browser-tested the documented 184×184 CSS-pixel counter on mobile and desktop.                                                                                                             |
| **5.4** Mobile bottom-nav overlap          | **Verified complete** | DEC-043 gave each nav item the full row height; the selected indicator clears the icon while preserving `aria-current` and a non-color cue.                                                                     |
| **5.5** Two-row compact Home header        | **Verified complete** | Date occupies row one; current time and prayer context occupy row two; streak is stacked above palms. DEC-044 supersedes only the conflicting prior Figma utility-header structure.                             |
| **5.6** Before-sleep checklist feedback    | **Verified complete** | The checklist now uses card-like 48px rows, explicit check states, a 0/3 progress indicator and progressbar, plus a restrained live completion confirmation that reverses if an item is unchecked.              |

## Verification completed before Phase 09

No known numbered implementation item remains open. The mandatory local gate passed with 67 Vitest files / 356 tests, 307 Playwright tests across the full browser matrix, a successful Pages build, and 12 refreshed current-state screenshots including tablet Home and Library. The published commit's GitHub Quality, Pages build/deploy, and production-smoke conclusions are recorded in the release handoff.
