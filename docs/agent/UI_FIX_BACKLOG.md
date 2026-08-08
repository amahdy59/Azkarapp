# UI fix backlog

User-supplied list, 2026-08-08. Verified against the codebase before scheduling
so nothing already-done gets rebuilt. Items keep the user's original numbering.

## Already done — do not rebuild

| Item                                        | Status                             | Evidence                                                                                                                     |
| ------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **1.2** Dynamic background by zikr type     | **Done**                           | `TimeOfDayBackground` already maps morning / evening / before_sleep / after_prayer / friday                                  |
| **2.1** No background on non-Home screens   | **Done** (DEC-026)                 | Only `HomeScreen.tsx` imports `TimeOfDayBackground`                                                                          |
| **1.1** Home text contrast                  | **Done** (DEC-035)                 | Light-theme hero failed at 1.98:1 and was fixed with `--on-media` tokens; all five modes now pass an automated contrast gate |
| **4.3** Tap-anywhere disabled during surahs | **Partly done** — see defect below | `handleSurfaceTap` returns early when `z.isSurah`                                                                            |
| **4.4** Friday CTA arrow direction          | **Verified correct** (DEC-043)     | Rendered arrow points right in LTR and left in RTL, matching the directional-icon contract                                   |

## Verified defect found while triaging

**4.3 is inverted for short surahs.** Twelve azkar carry `isSurah: true`, including
`s-hm-99-ikhlas` (قل هو الله أحد), `falaq` and `nas`. Those are three-line surahs
repeated 3×, but tap-anywhere is currently **disabled** for them — the exact case
the user says it should still apply to. Only genuinely long surahs (Al-Kahf,
Al-Mulk) should require the counter button.

Fix needs a way to distinguish long from short. `isSurah` alone is the wrong
signal; a `isLongSurah` flag or a length-derived predicate is needed. Content
data changes are governed by the Phase 06 prohibition on content rewriting, so
prefer deriving over editing `azkar.ts`.

## Conflicts with existing decisions — need a call before implementing

| Item                                           | Conflict                                                                                                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **2.2** Background texture on non-home screens | DEC-002/Phase 02 deliberately made surfaces opaque and reserved decorative treatments. A texture is a foundations-level change and should be a token, not per-screen CSS         |
| **5.5** Top nav declutter (2-line max)         | Phase 05 (DEC-028/029) just rebuilt this top bar to match the supplied Figma. This request supersedes that design — confirm the Figma is no longer authoritative for the top bar |
| **3.1** Remove filters                         | Marked "needs a decision" by the user. Removing a control is a product call                                                                                                      |

## Remaining work, by the user's priority

## P0 bug pass — completed 2026-08-08

| Item                                     | Result                                                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **5.3** Counter undersized               | Fixed the circular counter at the documented 184×184 CSS px; verified it fits a 320px viewport and remains 184px on desktop               |
| **5.4** Bottom-nav selected line overlap | Gave each nav item the full available height; the top indicator now clears the icon while retaining the persistent non-color selected cue |
| **4.4** Friday CTA arrow                 | No change required: browser inspection confirmed right in LTR and left in RTL                                                             |
| Home image `fetchPriority` React warning | Switched to the standard lowercase DOM attribute; the `high` hint remains present and a fresh browser console has no warnings             |

**P1 — core UX**

- 3.1 Search + filter side by side (pending the removal decision)
- 3.2 Search icon must not navigate away prematurely
- 3.3 Arabic search input must be right-aligned with RTL cursor
- 3.4 Visible labels on all inputs
- 4.2 Mushaf-style long-surah reading with page separators
- 4.3 Scope tap-disable to long surahs only (see defect above)
- 5.5 Top nav 2-line layout (pending the Figma conflict)

**P2 — visual system**

- 1.3 Masbaha button responsive sizing
- 2.2 Background texture (pending the DEC-002 conflict)
- 2.2b Consistent card radii, checkmarks, buttons
- 2.2c Counter consistency across the two counter types
- 2.2d Counter click sound with an on/off setting

**P3 — new features**

- 5.1 Zikr Benefits card + screen + WhatsApp share
- 5.2 Saved/liked zikr surfaced on Home
- 5.6 Before-sleep checklist completion feedback and redesign

## Sequencing note

The P0 batch is complete. The remaining two counter themes (2.2c, 2.2d)
overlap heavily and should be one piece of work, not separate changes.
`useZikrCounter` is at 89% coverage and `CustomCounterScreen` at 43%, so the
second counter needs characterization tests before restructuring.
