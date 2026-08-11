# Decision Log

Record user-approved product, design and architectural decisions here. Do not erase prior decisions; supersede them with a new entry.

## Template

### DEC-000 — Decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Approved / Rejected / Superseded
- **Owner:**
- **Related phase:**
- **Context:**
- **Options considered:**
- **Decision:**
- **Why:**
- **Consequences:**
- **Files/contracts to update:**
- **Tests/evidence required:**
- **Supersedes:** None

---

## DEC-001 — Wide-screen shell strategy

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 00 / Phase 04
- **Context:** Existing design documentation preserves a centered mobile-sized canvas on wide viewports, while the current UX improvement direction favors a more productive desktop layout.
- **Options considered:** Preserve mobile canvas; fully fluid desktop; hybrid shell.
- **Decision:** Hybrid shell (Option C)—responsive dashboards and settings, constrained reader/focused flows.
- **Why:** It uses desktop space effectively without making devotional reading lines too wide.
- **Consequences:** Requires updates to `docs/DESIGN_SYSTEM.md`, responsive Playwright tests, shell components and screenshots.
- **Tests/evidence required:** Mobile, tablet and desktop viewport matrix; Arabic/English; reader measure; keyboard navigation.
- **Supersedes:** None

---

## DEC-002 — Home primary action design

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 05
- **Context:** The Home screen needs a clear focal point for devotional routine initiation.
- **Options considered:** Multiple equal cards; single dominant CTA with contextual recommendation.
- **Decision:** One contextual Start or Continue primary action card.
- **Why:** Gives each screen one dominant next action, reducing cognitive friction and decision fatigue.
- **Consequences:** HomeScreen CTA hierarchy focus, routine continuation logic.
- **Tests/evidence required:** HomeScreen tests, keyboard tab order, Playwright visual check.
- **Supersedes:** None

---

## DEC-003 — Functional content surface treatment

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 02 / Phase 03
- **Context:** High transparency or heavy background patterns can degrade text legibility for sacred and devotional text.
- **Options considered:** Glassmorphism with heavy transparency; stable opaque surfaces.
- **Decision:** Use stable opaque surfaces for functional reading content.
- **Why:** Guarantees strict WCAG contrast compliance and high legibility across light, dark, and midnight themes.
- **Consequences:** Theme CSS tokens use controlled card opacity/solid surfaces for reading content.
- **Tests/evidence required:** Contrast audits across light/dark/midnight themes.
- **Supersedes:** None

---

## DEC-004 — Reader measure and container width

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 07
- **Context:** Wide text lines cause fatigue when reading long Arabic adhkar or Qur'anic text.
- **Options considered:** Fluid full-screen text width; constrained reading width.
- **Decision:** Constrained reader width (~430px–600px maximum).
- **Why:** Maintains optimal line length (50–75 characters) for devotional focus and calm reading.
- **Consequences:** Reader container remains max-w constrained on tablet and desktop screens.
- **Tests/evidence required:** ReaderScreen responsive layout tests across viewports.
- **Supersedes:** None

---

## DEC-005 — Progress tone and streak framing

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner
- **Related phase:** Phase 08
- **Context:** Gamified streak penalties or guilt-inducing warnings conflict with a calm devotional app.
- **Options considered:** Punitive streak resets and loss warnings; supportive and non-punitive progress experience.
- **Decision:** Supportive, encouraging, non-punitive progress framing.
- **Why:** Keeps sacred and devotional reflection peaceful and encouraging without punitive gamification.
- **Consequences:** Progress microcopy and garden states emphasize reflection over punishment.
- **Tests/evidence required:** ProgressScreen content review and i18n copy verification.
- **Supersedes:** None

---

## DEC-006 — Status token scope (success/warning/info)

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02
- **Context:** `--success`/`--warning` existed as a single global (non-theme-aware) pair, unused anywhere in `src`, and would fail AA contrast if ever used as text on the light theme. No `--info` token existed despite being documented as a required semantic family.
- **Options considered:** Leave as-is until a component needs them; make theme-aware now with paired `-foreground` tokens.
- **Decision:** Made `--success`/`--warning`/`--info` theme-aware (base/dark/light/midnight/high-contrast) with paired `-foreground` tokens, mapped into `@theme inline` as `bg-success`/`text-warning`/etc. utilities.
- **Why:** Prevents the next component that reaches for a status color from either failing contrast on light theme or bypassing the token system with a raw Tailwind palette color (as `ProgressViews.tsx`/`RoutineGarden.tsx` already had).
- **Consequences:** New hex values on light theme were hand-computed against the WCAG luminance formula, not verified with an automated tool — flagged for manual verification.
- **Files/contracts to update:** `src/styles/theme.css`, `docs/DESIGN_SYSTEM.md`, `docs/agent/DESIGN_SYSTEM_DELTA.md`.
- **Tests/evidence required:** Contrast verification with a real tool before/soon after release; `theme.test.ts` token assertions.
- **Supersedes:** None

---

## DEC-007 — `bg-card` opaque by default (DEC-003 reconciliation)

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** User (asked directly during Phase 02 implementation)
- **Related phase:** Phase 02
- **Context:** DEC-003 approved stable opaque surfaces for functional/devotional content, but `theme.css` applied `backdrop-filter: blur(16px)` to `.bg-card` itself — the utility nearly every card in the app uses — making glassmorphism the default, not an opt-in, which conflicted with DEC-003 and with `docs/DESIGN_SYSTEM.md`'s "Opaque, high-contrast cards" line.
- **Options considered:** (a) Make `bg-card` opaque by default, move blur to an explicit `.glass-card`/`.wird-card` opt-in; (b) keep `bg-card` translucent, reinterpret DEC-003 as Reader/counter-only; (c) per-surface-type decision.
- **Decision:** Option (a) — `bg-card` is opaque by default; `.glass-card`/`.wird-card` remain the explicit opt-in for decorative, non-functional surfaces only.
- **Why:** Directly matches DEC-003's language and `docs/DESIGN_SYSTEM.md`'s existing "Opaque, high-contrast cards" contract; lowest contrast risk.
- **Consequences:** Visual look of most cards app-wide changes (loses backdrop blur) unless they explicitly opt into `.glass-card`/`.wird-card`.
- **Files/contracts to update:** `src/styles/theme.css`, `docs/DESIGN_SYSTEM.md`.
- **Tests/evidence required:** Before/after screenshots across Light/Dark/Midnight.
- **Supersedes:** None (reconciles ambiguity left open by DEC-003)

---

## DEC-008 — Shadow/elevation token set

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02
- **Context:** No shadow token existed; components used Tailwind's raw default shadow scale ad hoc (`shadow-sm`/`-lg`/`-xl`/`-2xl` all appeared on nominally-equivalent card surfaces), conflicting with `docs/DESIGN_SYSTEM.md`'s "three levels only" elevation rule.
- **Options considered:** Full elevation redesign with new values; smallest-delta token set reusing existing shadow values already in use.
- **Decision:** Added exactly two new tokens, `--ds-shadow-raised`/`--ds-shadow-overlay`, mapped to `shadow-raised`/`shadow-overlay` Tailwind utilities, using the pre-existing `.glass-card` and `.word-meaning-dialog` shadow values so no surface's shadow visibly changes yet.
- **Why:** Makes the documented "three levels" (flat/raised/overlay) achievable without inventing new visual values or a redesign.
- **Consequences:** Existing `shadow-lg`/`shadow-xl`/etc. call sites are not migrated yet — deferred to Phase 03 as a wide, low-risk find/replace.
- **Files/contracts to update:** `src/styles/theme.css`, `docs/DESIGN_SYSTEM.md`.
- **Tests/evidence required:** Visual check once Phase 03 migrates call sites.
- **Supersedes:** None

---

## DEC-009 — Focus-ring color-token bypass fix

- **Date:** 2026-08-06
- **Status:** Approved (implemented — color only; width/opacity normalization deferred, see DEC-013)
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02
- **Context:** `HomeScreen.tsx` (reminder toggle, primary CTA), `TasbeehCounterButton.tsx`, `ProgressViews.tsx`, and `RoutineGarden.tsx` used a raw hex (`#fbbf24`) or raw Tailwind palette color (`amber-500`) for their focus ring instead of the `--ring` token, meaning colorblind-support mode (which remaps `--ring`) gave zero benefit on those controls.
- **Options considered:** Fix only the token bypass now; bundle with a full width/opacity normalization across all ~30 files with a `focus-visible:ring-*` override.
- **Decision:** Fixed the token bypass only (7 call sites → `ring-ring`); left width (`ring-1`/`ring-2`/`ring-[3px]`) and opacity (`ring-ring`/`ring-ring/40`/`ring-ring/50`) variance untouched.
- **Why:** The color bypass is an unambiguous accessibility defect (breaks an already-shipped colorblind feature). The width/opacity question is cosmetic and touches far more files with genuine judgment calls (e.g. scroll-container vs. primary-control treatment) — bundling it risked a rushed, under-reviewed pass across ~30 files.
- **Consequences:** Focus rings are now always token-colored; visible width/opacity is still inconsistent app-wide pending DEC-013.
- **Files/contracts to update:** `src/app/screens/HomeScreen.tsx`, `src/app/components/TasbeehCounterButton.tsx`, `src/app/components/ProgressViews.tsx`, `src/app/components/RoutineGarden.tsx`.
- **Tests/evidence required:** `pnpm test:e2e` (accessibility, responsive suites).
- **Supersedes:** None

---

## DEC-010 — Reader/modal max-width compliance fix

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02 / Phase 07
- **Context:** `QuranWordMeaningSheet.tsx` and `ReaderReferenceSheet.tsx` used `max-w-2xl` (672px) for their desktop dialog variant, exceeding DEC-004's approved ~430–600px cap. A separate, orphaned `.word-meaning-dialog` CSS rule (640px, unreferenced by any component) also would have violated the cap had it ever been wired up.
- **Options considered:** Leave as-is; cap both dialogs at the DEC-004 limit and delete the orphaned CSS.
- **Decision:** Both dialogs now use `max-w-[var(--content-reading)]` (600px, the same token `.reader-column` uses). The orphaned `.word-meaning-dialog`/`.word-meaning-dialog-positioner` CSS was deleted.
- **Why:** Brings implementation in line with an already-approved decision; reuses the existing token instead of a new magic number.
- **Consequences:** Desktop word-meaning and reference dialogs are narrower (600px vs. 672px).
- **Files/contracts to update:** `src/app/components/QuranWordMeaningSheet.tsx`, `src/app/components/ReaderReferenceSheet.tsx`, `src/styles/theme.css`.
- **Tests/evidence required:** Tablet/desktop visual check of both dialogs.
- **Supersedes:** None

---

## DEC-011 — Remove duplicate hard-coded palette (`theme.ts` `T` object)

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02
- **Context:** `src/app/theme.ts` exported a second, hand-maintained hex palette (`T`) duplicating `theme.css`'s values, with 24 of its 26 properties unused — a drift risk if either file were edited without the other.
- **Options considered:** Keep for potential future use; remove and inline the two values actually consumed.
- **Decision:** Removed `T`; the `theme-color` meta tag now uses two inlined literals with a comment pointing to `theme.css` as the source of truth.
- **Why:** Eliminates a second source of truth for colors that was already drifting (unused) from the real token file.
- **Consequences:** None — values were already identical; PWA `theme-color` behavior is unchanged.
- **Files/contracts to update:** `src/app/theme.ts`.
- **Tests/evidence required:** `pnpm typecheck`, manual PWA chrome-color spot check.
- **Supersedes:** None

---

## DEC-012 — Border-token aliasing documented, not collapsed

- **Date:** 2026-08-06
- **Status:** Approved
- **Owner:** Product owner (via Phase 02 analysis)
- **Related phase:** Phase 02
- **Context:** `--border`/`--border-subtle` and `--input`/`--border-control` are set to identical values in every theme — four token names expressing two visual weights.
- **Options considered:** Collapse to two token names (wider rename across every consumer); keep four names with a comment documenting the intentional aliasing.
- **Decision:** Kept all four names; added a comment in `theme.css` explaining the aliasing is intentional (a passive-separator pair and a stronger control-boundary pair) so it isn't "fixed" as a bug later.
- **Why:** Lowest-risk option; a rename touches every consumer of these tokens for a purely cosmetic naming cleanup.
- **Consequences:** None functionally; a future theme could diverge the two pairs if needed.
- **Files/contracts to update:** `src/styles/theme.css`.
- **Tests/evidence required:** None (comment-only change).
- **Supersedes:** None

---

## DEC-013 — Focus-ring width/opacity mechanism normalization

- **Date:** 2026-08-06 (proposed) / 2026-08-07 (resolved)
- **Status:** Approved — implemented in Phase 03 batch 7
- **Owner:** Product owner
- **Related phase:** Phase 02 (follow-up) / Phase 03
- **Context:** Roughly 30 files applied `focus-visible:ring-*` overrides with 4 different widths (`ring-1`/`ring-2`/`ring-[2px]`/`ring-[3px]`) and inconsistent opacity (`ring-ring`, `ring-ring/40`, `ring-ring/50`), on top of the shared `Button` primitive's own distinct border+translucent-ring treatment.
- **Options considered:** (a) Standardize on the existing global `outline`-based `:focus-visible` rule and delete all per-component ring classes; (b) standardize on the Tailwind `ring-*` box-shadow approach app-wide.
- **Decision:** Option (b), but with a correction to the premise. Auditing the call sites showed the variance was **not** uniform drift — it split cleanly along a real functional line:
  - **Controls** (all 24 `ring-2` sites, both `ring-[2px]` sites, and the 57 already-correct sites — zero of which were scroll regions) → normalized to `focus-visible:ring-[3px] focus-visible:ring-ring`.
  - **Scroll regions** (all 9 `ring-1` sites — every one a `tabIndex={0}` container with `overflow-y-auto`, focusable only so keyboard users can scroll) → kept deliberately subtle at `focus-visible:ring-1 focus-visible:ring-ring/40`.
    The global `outline` rule in `theme.css` is retained as the automatic fallback so a component that opts out of both still cannot ship with no focus indicator.
- **Why:** Option (a) would have required per-case negative `outline-offset` to replace the 5 `ring-inset` sites (rows inside `overflow: hidden` cards, where an outward outline is clipped) — no simpler than (b), with a much larger blast radius. And flattening scroll regions to the full 3 px control ring would have been a UX regression, not a consistency win: `docs/DESIGN_SYSTEM.md` scopes the 3 px rule to "focusable **controls**", and a page-sized region is not one.
- **Consequences:**
  - 26 control call sites got a slightly thicker ring (2px → 3px); `Button` and `Select` lost their translucent `ring-ring/50` in favor of the full-opacity token; `Button` also lost a stray `focus-visible:border-ring` that no other control had.
  - `Button`'s destructive variant was simplified from `ring-destructive/20` + a `dark:` override to a single `ring-destructive`, matching the 3 other destructive-action rings already in the app.
  - `ui/scroll-area.tsx` was reclassified from the control treatment to the scroll-region treatment, which is what it actually is.
  - `focus-visible:ring-inset` (5 sites) and `focus-visible:ring-offset-2` (6 sites) are retained as documented, technically-required variants rather than drift.
- **Files/contracts to update:** ~20 files across `src/app`; `ui/button.tsx`, `ui/select.tsx`, `ui/scroll-area.tsx`; contract documented in `docs/DESIGN_SYSTEM.md`.
- **Tests/evidence required:** Full `pnpm check` + `pnpm test:e2e` (keyboard-navigation and accessibility suites).
- **Supersedes:** None

---

## DEC-014 — Interim focus-ring contract for new Phase 03 shared components

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 analysis)
- **Related phase:** Phase 03
- **Context:** DEC-013 (focus-ring mechanism normalization) is unresolved, but new shared components in Phase 03 (`Card`, and later `Button`/`RadioCard`/`SwitchRow`) need _some_ focus-visible answer now.
- **Options considered:** Block new component work until DEC-013 resolves; adopt today's majority pattern (`focus-visible:ring-[3px] focus-visible:ring-ring`) as an explicit interim contract for anything new, revisited when DEC-013 lands.
- **Decision:** Adopt `ring-[3px] ring-ring` as the interim contract for all new Phase 03 components.
- **Why:** Already the majority pattern in the app (~40+ existing correct call sites); unblocks Phase 03 without prejudging DEC-013's outcome.
- **Consequences:** If DEC-013 later picks the outline-based mechanism instead, every new Phase 03 component gets revisited alongside the rest of the app in that follow-up — not a special case.
- **Files/contracts to update:** None beyond noting the contract here; enforced by convention until DEC-013 resolves.
- **Tests/evidence required:** None beyond normal component tests.
- **Supersedes:** None

---

## DEC-015 — Card primitive as the DEC-008 shadow-token migration vehicle

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 analysis)
- **Related phase:** Phase 03
- **Context:** The base card surface fragment (`rounded-3xl border border-border/40 bg-card ... shadow-lg/xl shadow-black/5 backdrop-blur-xl`) was duplicated 70 times across 22 files, with 3 different raw Tailwind shadow values standing in for the one documented "raised" elevation level. `backdrop-blur-xl` is additionally now dead weight on every one of these — Phase 02 made `bg-card` opaque, and blurring behind a fully opaque background has no visible effect.
- **Options considered:** Migrate all 22 files in one large diff; build the `Card` primitive and migrate a small representative usage first (per the phase's own Step 3 guidance), deferring the full rollout.
- **Decision:** Built `src/app/components/Card.tsx` (elevation: flat/raised/overlay, mapped to `--ds-shadow-raised`/`--ds-shadow-overlay`). Adopted it in `StatCard`/`CompactActionCard` (plain wrapper `<div>`s, a clean fit). `CategoryCard`'s root `<button>` was aligned to the same `shadow-raised`/`shadow-overlay` tokens and had `backdrop-blur-xl` dropped, without being wrapped in `Card` itself, since forcing an interactive element with many one-off props through a generic wrapper risked the "deeply configurable god component" the phase explicitly prohibits.
- **Why:** Matches the phase's explicit instruction to migrate a small representative usage before broad adoption; the remaining ~20 files are a separate, mechanical follow-up batch.
- **Consequences:** `StatCard`/`CompactActionCard`/`CategoryCard` shadows shift slightly from Tailwind's default `shadow-lg`/`shadow-xl` to the DEC-008 token value; `backdrop-blur-xl` removal has no visible effect (confirms it was already dead). While touching these files, also fixed raw Tailwind-palette colors (`amber-500`→`primary`) on `StatCard`'s icon badges and `CompactActionCard`'s action button, and added a missing focus-visible ring to that button.
- **Files/contracts to update:** `src/app/components/Card.tsx` (new), `StatCard.tsx`, `CategoryCard.tsx`.
- **Tests/evidence required:** `Card.test.tsx`, `StatCard.test.tsx`, `CategoryCard.test.tsx` (all new); full `pnpm check` + `pnpm test:e2e`.
- **Supersedes:** None

---

## DEC-016 — Home/Friday/Progress plain-div progress bars are correctly decorative, not a gap

- **Date:** 2026-08-07
- **Status:** Approved (finding, not a code change)
- **Owner:** Product owner (via Phase 03 analysis correction)
- **Related phase:** Phase 03
- **Context:** The Phase 03 analysis flagged `HomeScreen.tsx`, `FridayModeScreen.tsx`, and `ProgressViews.tsx`'s week view as having "non-accessible" plain-div progress bars needing `role="progressbar"` via the shared `ProgressBar` component. Direct inspection found all of these bars sit immediately next to visible text already stating the same value (e.g. "4 of 10", "6 of 7"), and `FridayModeScreen.tsx`'s bars are already explicitly `aria-hidden="true"` for exactly this reason.
- **Options considered:** Adopt `ProgressBar` everywhere as originally proposed; leave these as-is since they're decorative reinforcement of already-announced text.
- **Decision:** Leave these three locations unchanged. Adding `role="progressbar"` here would create a redundant second announcement of the same number for screen-reader users, which is worse, not better.
- **Why:** The original analysis pattern-matched on "plain div with width%" without checking for adjacent equivalent text; verifying directly avoided introducing a real regression under the banner of an accessibility fix.
- **Consequences:** None — no code changed at these three locations.
- **Files/contracts to update:** None.
- **Tests/evidence required:** None.
- **Supersedes:** None

---

## DEC-017 — Delete dead `PalmTreeReward`, keep `HomeScreen`'s header as canonical

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 2, supersedes an earlier stated intent)
- **Related phase:** Phase 03
- **Context:** The Phase 03 analysis characterized `RoutineGarden.tsx`'s `PalmTreeReward` and `HomeScreen.tsx`'s hand-rolled streak/palm header as a byte-for-byte duplicate. Direct inspection found only the aria-label i18n string template matches; the actual visual markup differs (one shared bordered bar vs. two separate bordered pills). More importantly, `PalmTreeReward` hardcodes `maxLeaves = 3` ("3 core categories: morning/evening/sleep"), while `HomeScreen` correctly uses `MAIN_CATEGORY_IDS.length`, which is now 4 after the after-prayer tracking feature landed. `PalmTreeReward` was stale, not just unused (confirmed zero import sites anywhere in `src`).
- **Options considered:** Merge by having `HomeScreen` adopt `PalmTreeReward` as originally planned; fix `PalmTreeReward`'s stale category count and then merge; delete `PalmTreeReward` outright since it's dead and its logic no longer matches current domain rules.
- **Decision:** Deleted `PalmTreeReward` from `RoutineGarden.tsx`. `HomeScreen.tsx`'s implementation remains as-is (unchanged, already correct).
- **Why:** Forcing a merge onto stale, unused code would have meant fixing/redesigning dead code rather than a safe dedup; deleting it removes the actual duplication risk (a second, drifted implementation of the same feature) with zero behavior change to any real screen.
- **Consequences:** `GoldenLeafMark`/`PalmTreeMark`/`Zap` (used elsewhere in `RoutineGarden.tsx`) were kept; only the `PalmTreeReward` wrapper function was removed.
- **Files/contracts to update:** `src/app/components/RoutineGarden.tsx`.
- **Tests/evidence required:** `pnpm check` (lint confirms no orphaned imports).
- **Supersedes:** The Phase 03 kickoff message's stated plan to have `HomeScreen` adopt `PalmTreeReward`.

---

## DEC-018 — `StatePanel` gains an `empty-saved` kind, adopted in `AzkarLibraryScreen`

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 2)
- **Related phase:** Phase 03
- **Context:** `AzkarLibraryScreen.tsx`'s "no saved azkar yet" block matched `StatePanel`'s anatomy closely (dashed-border card, centered icon, heading, body, action button) but `StatePanel`'s `AppStateKind` union had no kind for "nothing saved yet," and no `Bookmark` icon mapping.
- **Options considered:** Leave `AzkarLibraryScreen`'s block as its own one-off; add a new `empty-saved` kind to `StatePanel` and adopt it.
- **Decision:** Added `empty-saved` to `AppStateKind` (with a `Bookmark` icon and baseline English copy, both overridden in practice by `AzkarLibraryScreen`'s localized `title`/`description`/`actionLabel` props) and adopted `StatePanel` in place of the hand-rolled block.
- **Consequences:** The circular icon badge background `AzkarLibraryScreen` previously had behind its bookmark icon is gone — `StatePanel` renders a bare icon. Accepted as a minor, low-risk simplification rather than adding a new icon-badge variant to `StatePanel` (which would have needed to stay opt-in to avoid silently changing the existing `SearchScreen.tsx` `StatePanel` usage's appearance too).
- **Files/contracts to update:** `src/app/components/StatePanel.tsx`, `src/app/screens/AzkarLibraryScreen.tsx`.
- **Tests/evidence required:** `pnpm check`, `pnpm test:e2e` (no test referenced the old markup/ids).
- **Supersedes:** None

---

## DEC-019 — `SettingsSection` wrapper, adopted across all 7 sections in `SettingsRootPanel`

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 2)
- **Related phase:** Phase 03
- **Context:** `SettingsRootPanel.tsx` hand-rolled the same `SectionLabel` + card-wrapper pair 7 times, in two slight variants: a padded wrapper for arbitrary content (theme section) and an `overflow-hidden`, unpadded wrapper for a list of `SettingsRowItem` rows (6 sections). Card's `padding` prop didn't support a zero-padding option needed for the row-list variant.
- **Decision:** Added `padding="none"` to `Card`. Added `SettingsSection` to `SettingsPrimitives.tsx` (optional `label` renders `SectionLabel` above; `variant: "rows" | "content"` selects unpadded+clipped vs. padded). Migrated all 7 sections in `SettingsRootPanel.tsx` onto it.
- **Why:** Continues the DEC-008 shadow-token migration (all 7 now use `shadow-raised` instead of `shadow-lg`) and drops the same dead `backdrop-blur-xl` found in Batch 1, while removing the two-line label+wrapper boilerplate from every section.
- **Consequences:** None visible — same `SectionLabel` component, same `SettingsRowItem` children, same shadow-token-driven visual as Batch 1's other migrations.
- **Files/contracts to update:** `src/app/components/Card.tsx`, `src/app/screens/settings/SettingsPrimitives.tsx`, `src/app/screens/settings/SettingsRootPanel.tsx`.
- **Tests/evidence required:** `SettingsSection.test.tsx` (new), extended `Card.test.tsx`, full `pnpm check` + `pnpm test:e2e`.
- **Supersedes:** None

---

## DEC-020 — `InformationCard` gains an action slot; `Card` gains prop forwarding; adopted where the shape genuinely matches

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 3)
- **Related phase:** Phase 03
- **Context:** `HelpPanel.tsx`, `DownloadsPanel.tsx`, `AccountDataPanel.tsx`, `NotificationsPanel.tsx`, and `SourcesPanel.tsx` all had hand-rolled `rounded-3xl border bg-card ... shadow-lg` sections. On inspection, only some were genuine icon+title+body(+one action) matches for `InformationCard`; several others (`DownloadsPanel`'s status/audio sections, `AccountDataPanel`'s account-status block) have multiple paragraphs, `<dl>` tables, or multiple buttons — too rich for `InformationCard`'s simple shape. `Card` also didn't forward arbitrary props, so `aria-labelledby` (used throughout these sections) would have been silently dropped if used as a drop-in.
- **Options considered:** Force every flagged block through `InformationCard` regardless of shape (matches the original Phase 03 analysis literally); classify each block individually and only adopt `InformationCard` where the anatomy genuinely matches, using the generic `Card` wrapper (content untouched) elsewhere.
- **Decision:** Extended `CardProps` to spread arbitrary HTML attributes (fixes the `aria-labelledby` gap). Added `actionLabel`/`actionIcon`/`onAction` to `InformationCard`, built on `Card`. Adopted `InformationCard` for genuine matches: `HelpPanel`'s intro + "still need help" blocks, `SourcesPanel`'s correction block, `DownloadsPanel`'s bundled-content block, `NotificationsPanel`'s availability block. Wrapped the richer blocks (`DownloadsPanel`'s status/audio sections, `AccountDataPanel`'s account-status and data-summary sections) in plain `Card` only, keeping their custom content as-is. Left `AccountDataPanel`'s local `DataAction` component unmerged — it has a real `destructive` tone variant (different icon-badge color and an outline vs. filled button) plus an existing quirk where `destructive` mode silently ignores the passed `icon` prop in favor of a hardcoded `LogOut`; merging would have meant fixing or replicating that quirk rather than a safe dedup.
- **Why:** Matches the phase's own instruction to classify each pattern individually rather than force a uniform merge; avoids either data-loss (dropped `aria-labelledby`) or an over-configured `InformationCard` trying to cover every shape.
- **Consequences:** `NotificationsPanel.tsx` still has several more `shadow-lg` sections (`ReminderScheduleRow`, prayer-location, permission blocks) not touched in this batch — explicitly deferred to the separate, later "wider Card rollout" step rather than partially converting one large file inconsistently.
- **Files/contracts to update:** `src/app/components/Card.tsx`, `src/app/screens/settings/InformationCard.tsx`, `HelpPanel.tsx`, `SourcesPanel.tsx`, `DownloadsPanel.tsx`, `AccountDataPanel.tsx`, `NotificationsPanel.tsx`.
- **Tests/evidence required:** `InformationCard.test.tsx` (new), full `pnpm check` + `pnpm test:e2e`.
- **Supersedes:** None

---

## DEC-021 — Complete the DEC-008 shadow-token rollout; remove dead `backdrop-blur-xl`

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 4)
- **Related phase:** Phase 03
- **Context:** DEC-008 deferred the bulk `shadow-lg`/`shadow-xl` → token migration to Phase 03 as "a wide, low-risk find/replace". At the start of this batch, 53 call sites across 16 files still used `shadow-lg shadow-black/5` or `shadow-xl shadow-black/5` for what the design system defines as a single "raised" elevation level, and 30 elements still carried `backdrop-blur-xl`.
- **Options considered:** Convert every card call site to the `Card` component (large structural churn across 16 files); do the mechanical class-level migration only, leaving markup structure untouched.
- **Decision:** Mechanical class-level migration only. All `backdrop-blur-xl shadow-lg shadow-black/5`, `shadow-lg shadow-black/5`, and `shadow-xl shadow-black/5` combinations collapsed to the single `shadow-raised` token (53 sites, 16 files). `backdrop-blur-xl` removed only from elements whose background is fully opaque (`bg-card` with no alpha), where it has no visible effect since DEC-007 made cards opaque — 26 sites.
- **Why:** Matches DEC-008's own stated intent (find/replace, not restructure) and keeps the diff reviewable as pure 1:1 line swaps with zero logic changes. Wrapping every one of these in `Card` would have been a much larger, riskier diff for no additional token-consistency benefit.
- **Consequences:** Card shadows across the app shift from Tailwind's `shadow-lg`/`shadow-xl` defaults to the single DEC-008 token value — an intentional, pre-approved consolidation, but a real visual change on ~53 surfaces. `backdrop-blur-xl` was deliberately **kept** on the 5 elements with genuinely translucent backgrounds (`bg-emerald-500/10`, `bg-muted/40`, `bg-card/65`, and `AccessibilityPanel`'s color-blind swatches), where the blur still does something. `shadow-2xl` (11 sites) was left untouched — it is consistently used for overlay-level surfaces (dialogs, sheets, modals, app shell), which is a different elevation level and will be handled with the dialog/`ResponsiveSheet` work.
- **Files/contracts to update:** 16 files across `src/app/components` and `src/app/screens` (mechanical; no structural changes).
- **Tests/evidence required:** Full `pnpm check` (222 unit tests) + `pnpm test:e2e` (142 tests) — both passed with no assertion changes needed.
- **Supersedes:** None (completes the migration DEC-008 deferred)

---

## DEC-022 — `SegmentedControl`: radio-group semantics for mutually exclusive mode choices

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 5)
- **Related phase:** Phase 03
- **Context:** The app had six independent "choose one of N" implementations spanning three different ARIA patterns. Two of them — `HomeScreen.tsx`'s routine-mode toggle and `CategoryScreen.tsx`'s routine-mode toggle — used `role="group"` + `aria-pressed`, which directly violates `docs/agent/ACCESSIBILITY_REQUIREMENTS.md` §9 ("Mutually exclusive appearance/mode choices use radio-group semantics"). Two more (`SettingsRootPanel.tsx` language, `LanguageScreen.tsx` onboarding language) had correct roles but were hand-rolled, so they had no roving tabindex and no arrow-key focus movement.
- **Options considered:** Merge all six onto a single richly-configurable component (matches the Phase 03 analysis literally, but risks the "deeply configurable god component" the phase prohibits); build a semantics-only primitive that callers style themselves, and migrate the cases that share a visual pattern.
- **Decision:** Added `src/app/components/SegmentedControl.tsx` — a Radix `RadioGroup`-backed primitive that owns **semantics and keyboard behavior only** (`role="radiogroup"`/`"radio"`, roving tabindex, RTL-aware arrow keys), with callers supplying their own `className`/`itemClassName`. Migrated the two ARIA violations (`HomeScreen`, `CategoryScreen`) plus `SettingsRootPanel`'s hand-rolled language picker. Converted `LanguageScreen.tsx` to Radix primitives directly (keeping its distinct full-width row visual) so it gains roving tabindex without being forced into a shared visual shape.
- **Why:** Fixes the actual conformance gap while respecting the phase's prohibition on god components — the shared thing is the accessibility contract, not the styling.
- **Consequences:**
  - **Real behavior change for assistive tech**: the two migrated toggles now announce as a radio group with checked state instead of a group of pressed buttons. Intentional, and the point of the fix.
  - **Broke an existing e2e selector**, caught by the suite: `e2e/audio.spec.ts` queried the CategoryScreen mode toggle via `getByRole("button", …)`, which no longer matches now that it is `role="radio"`. Updated to `getByRole("radio", …)`; the accessible name is unchanged. This is the selector-drift risk the Phase 03 analysis flagged, and it failed loudly rather than silently.
  - **Selection does not follow focus on arrow keys** in the pinned Radix version (1.2.3). Radix intends this (there is an `isArrowKeyPressedRef` + `onFocus` → `click()` path) but it is defeated by a listener-ordering race: the group's keydown handler moves focus before the `document`-level keydown listener sets the ref. Verified by probe that the **pre-existing, untouched** `ThemeModeSelector` behaves identically, so this is app-wide upstream behavior, not a regression introduced here. Arrow keys move focus; Space/Enter activates. Flagged for a separate decision (Radix upgrade or a local `onKeyDown` shim) rather than silently asserted as working.
  - The card-style grid pickers (`ThemeModeSelector`, `AccessibilityPanel`'s text-size and calendar groups, `ProgressPanel`'s weekly goal) were **left as-is** — they are already correct Radix radio groups with distinct visual anatomies; merging them would have required icon/sample/check-indicator slots and grid configuration, i.e. exactly the god component the phase prohibits.
- **Files/contracts to update:** `src/app/components/SegmentedControl.tsx` (new), `HomeScreen.tsx`, `CategoryScreen.tsx`, `SettingsRootPanel.tsx`, `onboarding/LanguageScreen.tsx`, `e2e/audio.spec.ts`, `e2e/settings-experience.spec.ts`.
- **Tests/evidence required:** `SegmentedControl.test.tsx` (new, 6 tests) for roles/checked state/click/caller classes; real-browser keyboard assertions added to `e2e/settings-experience.spec.ts` (roving tabindex and arrow-key focus movement cannot be verified in jsdom — Radix leaves both items at `tabindex="-1"` without real layout, confirmed by probe). Full `pnpm check` + `pnpm test:e2e` (145 passing).
- **Supersedes:** None

---

## DEC-023 — `TabList` primitive: complete tabs semantics and keyboard support

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 6)
- **Related phase:** Phase 03
- **Context:** Two independent `role="tablist"` implementations existed. Neither had `aria-controls`, a roving tabindex, or any keyboard navigation, so both violated `docs/agent/ACCESSIBILITY_REQUIREMENTS.md` §9 ("tabs expose `tablist`, `tab`, `tabpanel`, selected state and keyboard behavior"). `RoutineGarden.tsx`'s day/week/month/year switcher additionally had **no `role="tabpanel"` at all** — its four view components rendered as bare siblings, so the tabs pointed at nothing.
- **Options considered:** Add `@radix-ui/react-tabs` (consistent with the Radix primitives already used elsewhere); hand-roll a small semantics primitive.
- **Decision:** Hand-rolled `src/app/components/Tabs.tsx`, exporting `TabList` plus `tabPanelProps`/`tabId`/`tabPanelId` helpers. Migrated both call sites; `RoutineGarden.tsx`'s four conditional views are now wrapped in a real `tabpanel`.
- **Why:** AGENTS.md requires that new runtime dependencies only be added when existing platform utilities cannot solve the problem. The APG tabs pattern needs no portal, focus trap, or positioning — it is roving tabindex, four key handlers, and id wiring (~110 lines). A hand-rolled version also let both call sites keep their existing DOM: in `AzkarLibraryScreen.tsx` the tab list sits in a `<header>` with the panel as a scrolling sibling, and in `RoutineGarden.tsx` a date-navigation bar sits between list and panel — neither fits Radix's `Root > List + Content` composition without restructuring.
- **Consequences:**
  - Both tab groups are now a single tab stop (roving tabindex) with Arrow/Home/End navigation and RTL-aware arrow direction — behavior that did not previously exist.
  - `RoutineGarden.tsx` gains a `tabpanel` wrapper `<div>` around its four views. This is a new DOM element in the Progress tree; verified it does not disturb layout (no flex/grid parent depends on those children being direct siblings) and the full e2e suite passes unchanged.
  - Existing e2e selectors (`getByRole("tab", { name: /Saved/ })` in `navigation.spec.ts`, `getByRole("tab", { name: "Month" })` in `quiet-garden.spec.ts`) continue to work — roles and accessible names are preserved, so unlike DEC-022 there was no selector drift here.
  - `RoutineGarden.tsx`'s active-tab pill also moved off the raw `bg-amber-500 text-slate-950` palette onto `bg-primary text-primary-foreground`, continuing the DEC-009/DEC-021 token direction.
- **Files/contracts to update:** `src/app/components/Tabs.tsx` (new), `src/app/components/RoutineGarden.tsx`, `src/app/screens/AzkarLibraryScreen.tsx`.
- **Tests/evidence required:** `Tabs.test.tsx` (new, 9 tests) covering roles, `aria-controls` wiring, roving tabindex, click activation, LTR/RTL arrow direction, wrap-around, and Home/End. Full `pnpm check` + `pnpm test:e2e` (145 passing).
- **Supersedes:** None

---

## DEC-024 — Align `Button` to the app's conventions, then adopt it

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 8)
- **Related phase:** Phase 03
- **Context:** A complete, accessible `Button` primitive existed but was imported in exactly **one** file, while ~39 sites hand-rolled button classes. The Phase 03 analysis framed this purely as an adoption problem. Measuring the actual call sites showed the blocker was the component itself: the app's established convention is `min-h-11 rounded-xl bg-primary px-4 font-semibold`, while `Button` shipped shadcn's defaults of `font-medium` and — more importantly — a **fixed** `h-11`/`h-12` in its size variants.
- **Options considered:** Migrate call sites onto `Button` as-is (restyles every migrated button to a lighter weight and a fixed height); pass `className` overrides at every site (no real consolidation); align `Button` to the documented conventions first, then migrate.
- **Decision:** Aligned `Button` first — `font-medium` → `font-semibold`, and all size variants from fixed `h-*` to `min-h-*` — then migrated the standalone action buttons.
- **Why:** The fixed height was a latent defect, not just a style mismatch. Arabic labels run longer than their English equivalents and `docs/QUALITY_CHECKLIST.md` still has a pending 200%-text-scaling row; a fixed-height button clips wrapped labels in exactly those cases. Every hand-rolled button in the app had independently used `min-h-11` — the convention was already right, and `Button` was the outlier.
- **Consequences:**
  - `Button` adoption went from 1 file to 10. Migrated: `StatePanel`, `InformationCard`, `PwaNotice`, `NotificationsPanel` (3 buttons), `AccountDataPanel` (2), `DownloadsPanel` (3), `SettingsRootPanel`.
  - The `lg` size now resolves to `min-h-12` alone (tailwind-merge dedupes the base `min-h-11`), where it previously produced `min-h-11` + fixed `h-12`. Still ≥ the 44px target and now able to grow.
  - This broke `ZikrShareButton.test.tsx`, which asserted the literal class `min-h-11`. Rather than swap in the new literal, the assertion was rewritten to test the actual contract: the button carries a `min-h-*` of at least 44px **and** no fixed `h-*` that could clip. That is a stronger test than the one it replaces.
  - **`AppErrorBoundary.tsx` was deliberately left hand-rolled.** It renders only after the app has crashed; importing `Button` would pull Radix `Slot` and `cva` into the crash-recovery path, so a failure inside those libraries would break the very screen meant to recover from failures.
  - Selected-state styling inside `SegmentedControl`, `Tabs`, and picker components was left alone — those are radio/tab items, not buttons, and are already covered by DEC-022/DEC-023.
  - Buttons needing a primary-tinted outline (`border-primary text-primary`) use `variant="outline"` plus a colour override rather than a new variant, keeping the variant set small.
- **Files/contracts to update:** `src/app/components/ui/button.tsx` and the 9 adopting files listed above.
- **Tests/evidence required:** Strengthened `ZikrShareButton.test.tsx`; full `pnpm check` (237 unit tests) + `pnpm test:e2e` (145 passing).
- **Supersedes:** None

---

## DEC-025 — `Modal`/`ResponsiveSheet`: real focus containment for all dialogs

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Product owner (via Phase 03 batch 9)
- **Related phase:** Phase 03
- **Context:** Six hand-rolled `role="dialog"` overlays existed with no focus containment, no focus restore, and (in three cases) no Escape handling — violating `docs/agent/ACCESSIBILITY_REQUIREMENTS.md` §9 ("dialogs have focus containment and reliable dismissal"). Three of them duplicated the same compact-vs-desktop branching logic.
- **Options considered:** Hand-roll a focus trap; adopt `@radix-ui/react-dialog`.
- **Decision:** Adopted `@radix-ui/react-dialog`, promoting it from a transitive to a direct dependency. Added `src/app/components/ResponsiveSheet.tsx` exporting `Modal` (centered Radix Dialog) and `ResponsiveSheet` (Vaul drawer on compact, `Modal` on medium+). Migrated all six overlays.
- **Why (dependency justification per AGENTS.md):** `@radix-ui/react-dialog@1.1.6` was **already in the production bundle** — `@radix-ui/react-alert-dialog` (used by `ConfirmDialog`, mounted in `App.tsx`) depends on it. Promoting it to a direct dependency therefore costs **zero bundle bytes** and removes the fragility of importing through a transitive path. Focus trapping is also notoriously error-prone to hand-roll (containment, restore, scroll lock, `aria-hidden` on background, portal ordering), and the app already standardises on Radix elsewhere.
- **Consequences / two real defects found while verifying:**
  1. **Escape closed the reader underneath the dialog.** `ReaderScreen` treats Escape as "leave the reading session" and its guard only suppresses that while its own sheet state is open. With the dialog portaled, the same keypress reached both. Fixed by having `Modal` consume Escape (`onEscapeKeyDown` → `stopPropagation`) — correct behaviour for a modal regardless.
  2. **Focus was not restored on close** (it fell to `<body>`). Radix and Vaul both restore focus, but only while their root stays mounted; every call site conditionally renders (`if (!open) return null`), tearing the root down in the same commit. Fixed with a `useRestoreFocusOnClose` effect-cleanup hook inside `ResponsiveSheet.tsx`, which runs after React commits the removal and so works for both mount patterns.
     Neither defect would have been caught by the existing suite — both were found by writing a real-browser focus-trap test first.
  - `ShareableCardModal`'s hardcoded `bg-green-500`/`amber-500` accents and `CustomCounterScreen`'s success badge were moved onto `bg-success`/`text-success` while in the file, continuing DEC-006/DEC-021.
- **Files/contracts to update:** `package.json`; `src/app/components/ResponsiveSheet.tsx` (new); `QuranWordMeaningSheet.tsx`, `ReaderReferenceSheet.tsx`, `AuthenticZikrLibrarySheet.tsx`, `CounterTargetPicker.tsx`, `ShareableCardModal.tsx`, `CustomCounterScreen.tsx`.
- **Tests/evidence required:** New `reader-microinteractions.spec.ts` test asserting focus containment across 12 Tab presses, Escape dismissal with the reader still mounted, and focus restore to the trigger. Full `pnpm check` (237 unit) + `pnpm test:e2e` (148 passing).
- **Supersedes:** None

---

## DEC-026 — Decorative background imagery is Home-only

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (requested directly)
- **Related phase:** Phase 03 (user-directed; anticipates Phase 05/06/07 screen work)
- **Context:** `TimeOfDayBackground` (a full-bleed time-of-day photographic hero with a theme-aware gradient scrim) was rendered on nine screens: Home, Library, Category, Completion, Custom Counter, Friday Mode, Friday Salawat, Progress, and Settings.
- **Options considered:** Keep decorative imagery everywhere; restrict it to Home.
- **Decision:** `TimeOfDayBackground` is now rendered only by `HomeScreen`. Removed from the other eight screens.
- **Why:** Consistent with `AGENTS.md`'s UX principles — "use decorative photography only where contrast is controlled" and "functional content should use stable surfaces" — and with DEC-003's direction for functional content. Home is the time-aware dashboard where the imagery carries meaning; on the functional screens it was decoration competing with content.
- **Consequences:**
  - Verified before removing that no affected screen relied on the image for text contrast. The only `text-white`/`bg-black/` usages on those screens (`CategoryScreen:313`, `FridayModeScreen:63,221`) are white text on solid coloured button fills, not text floating over the hero — so no contrast regression.
  - The eight screens now render on the plain themed `--background`. Their existing `relative z-10` content wrappers were left in place; they are harmless without a sibling background layer.
  - `AzkarHeroBackground` and the background asset set remain in use by Home across all five time-of-day variants, so PWA precaching of those assets is still warranted.
  - This anticipates screen-level work formally scheduled for Phases 05–07. Recorded here because it was user-directed during Phase 03 rather than deferred.
- **Files/contracts to update:** `AzkarLibraryScreen`, `CategoryScreen`, `CompletionScreen`, `CustomCounterScreen`, `FridayModeScreen`, `FridaySalawatScreen`, `ProgressScreen`, `settings/SettingsScreen`.
- **Tests/evidence required:** Full `pnpm check` + `pnpm test:e2e` (148 passing). Visual confirmation across Light/Dark/Midnight still owed with the rest of the Phase 02–03 screenshot debt.
- **Supersedes:** None

---

## DEC-027 — Phase 04 shell and navigation defect fixes

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (three choices made directly; remainder delegated)
- **Related phase:** Phase 04
- **Context:** The Phase 04 analysis found the DEC-001 hybrid shell already ~80% implemented — typed `View` state, real History API, the four-tier CSS grid, three nav variants, `aria-current` throughout, the settings two-pane, and a DEC-004-compliant reader column all worked. What remained was a set of concrete defects rather than a build-out.
- **Decisions and rationale:**
  - **BottomNav active state was colour-only** (icon and label differed only by colour; both weights `font-semibold`; the sole non-colour cue was a 220 ms entrance animation that `prefers-reduced-motion` disables). Added a persistent 3 px `--primary` indicator bar plus `font-extrabold` on the active label. This failed an explicit Phase 04 acceptance criterion and WCAG "colour alone", on the variant most users see.
  - **Navigation dead zone at ≥900 px wide × <500 px tall.** The rail's media query carried `and (min-height: 31.25rem)` while `useLayoutMode` is width-only, so JS chose `expanded` (dropping BottomNav) while CSS hid the rail — **no navigation at all**. Dropped the height term so CSS matches the hook's contract. User chose this over teaching the hook a height term, which would have shifted sheet-vs-dialog behaviour for `useLayoutMode`'s six consumers.
  - **431–599 px rendered a letterboxed 390 px phone card** belonging to no documented tier. User chose extending full-bleed to 599 px, aligning CSS with `useLayoutMode`'s own 600 px compact boundary.
  - **Focus never moved on view change.** `useScreenFocus` guarded on a per-instance `isFirstMount` ref, but screens are lazily mounted fresh on every navigation, so the guard was always true and it always returned early. Split into `useScreenFocus` (title only) and a new app-level `useViewFocus(view)` in `App.tsx`, where view identity actually persists.
  - **Two `main` landmarks** — `App.tsx` rendered `#main-content` and `ScreenContainer` nested another inside it. `ScreenContainer` is now a `div`; `App.tsx` owns the single landmark.
  - **All three navs announced as "Bottom Navigation".** Added `common.primaryNavigation` ("Main Navigation" / "التنقل الرئيسي") for the rail and sidebar.
  - **Rail/sidebar rendered during splash, onboarding and auth.** All three variants now share the existing `showBottomNav` view whitelist.
  - **Sidebar theme toggle was binary dark↔light in a three-theme app**, stranding Midnight users in Light. User chose to keep the sidebar controls (rather than remove them per Step 3 item 4) and fix the toggle, which now cycles midnight → dark → light with a matching icon and an `aria-label` naming the current theme.
  - **`window.history.length > 1` back-guard** counted the whole browser tab's session, so arriving from another site made Back navigate _out of the app_. Replaced with an in-app depth counter, decremented in the `popstate` handler only (not in `pop()`, since `history.back()` fires `popstate` — decrementing in both would double-count). User scoped this to the narrow fix; the mixed `push`/`replaceState`/bare-`setView` pattern across onboarding is recorded but untouched.
- **Consequences:** Renaming the rail/sidebar labels broke the shared `enterEnglishGuestMode` helpers in three specs, which waited on `getByRole("navigation", { name: "Bottom Navigation" })` — on desktop that had been resolving against the _sidebar_. Helpers are now tier-agnostic. This is the same selector-drift class as DEC-022 and again failed loudly rather than silently.
- **Files/contracts to update:** `LayoutShells.tsx`, `App.tsx`, `hooks/useScreenFocus.ts`, `ScreenContainer.tsx`, `i18n/en.ts`, `i18n/ar.ts`, `styles/theme.css`, `docs/DESIGN_SYSTEM.md`, `docs/ARCHITECTURE.md`, four e2e specs.
- **Tests/evidence required:** Seven new e2e tests (tier matrix, dead-zone regression, full-bleed band, onboarding nav suppression, `aria-current` + non-colour cue, single-`main` + focus-on-navigation). Dead-zone test verified to fail against the pre-fix CSS. Full `pnpm check` + `pnpm test:e2e` (166 passing).
- **Supersedes:** None

---

## DEC-028 — Phase 05 Home redesign against the supplied Figma

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (supplied the Figma node and delegated execution)
- **Related phase:** Phase 05
- **Context:** User supplied Figma node `940-26629` as the target Home design and asked for the screen to be updated to match, working autonomously.
- **Changes made to match the design:**
  - **Top utility bar.** Replaced the floating translucent header (badges on the start edge, date/prayer on the end edge, over the hero image) with an opaque bar on `bg-card`: quick actions on the start edge, next-prayer countdown and Hijri date as centred pills, lifetime palms and daily streak as end-edge badges. Moving off the image also removes the text-over-photo contrast risk the Phase 02 analysis flagged as unverifiable.
  - **Three stat cards, not four.** Ordered This Week / Streak / Total Azkar per the design. The fourth "Resume Reading" `CompactActionCard` was dropped — it duplicated the hero's primary CTA, which already resumes the same collection, and the design does not show it. `CompactActionCard` remains exported for other callers.
  - **Labelled section divider** (`SectionDivider`) introducing the Friday section, matching the centred rule-and-label treatment.
- **Two deviations from the Figma, both deliberate:**
  1. **No settings gear in the top bar.** The design shows a gear beside the bell, but Settings is already a top-level nav destination, and `PHASE_04_SHELL_NAVIGATION.md` explicitly prohibits duplicated top-level destinations. It also produced a real defect: two controls with the accessible name "Settings" broke nine e2e tests with strict-mode violations, and would be genuinely ambiguous for assistive tech. The bell is kept — notification settings is a sub-screen, not a nav destination.
  2. **The "وردك اليوم" card is the existing `TodayRoutineGarden`, not a new component.** A bespoke `TodayWirdCard` was written first, and a screenshot showed the result rendered _two_ cards both headed "وردك اليوم" with overlapping routine navigation. `TodayRoutineGarden` with `hideTabs` already is this card, and carries existing test coverage, so the duplicate was removed and the garden restored to the hero-adjacent slot with its `quietProgressEnabled` gate intact.
- **Consequences:** Home no longer shows the hero background image behind the header area in the same way, since the header is now opaque; `TimeOfDayBackground` still renders behind the scrollable content per DEC-026. The `hijri-date` and `next-prayer` test ids are preserved.
- **Files/contracts to update:** `src/app/screens/HomeScreen.tsx`, `src/app/App.tsx`.
- **Tests/evidence required:** Full `pnpm check` + `pnpm test:e2e` (166 passing). Visual verification captured at 1280×900 in Arabic during development; before/after screenshots across Light/Dark/Midnight remain outstanding with the rest of the Phase 02–05 screenshot debt.
- **Supersedes:** None

---

## DEC-029 — Phase 05 Home rebuilt against the Figma node itself

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User
- **Related phase:** Phase 05
- **Context:** DEC-028's Home pass was inferred from a screenshot and got the page structure wrong. With direct Figma access to node `940:26629`, the design was read rather than guessed. Instruction was to follow it thoroughly while keeping the existing design-system foundation, and specifically to keep the scene image inside the main card.
- **What the node actually specifies, and what changed:**
  - **`hero-banner` is `1136×373`, inset 32px inside `hero-container`.** The image belongs to the hero card, not the page. `TimeOfDayBackground` gained a `variant="card"` that swaps the fade-to-page gradients (correct behind a full screen, wrong inside a rounded card, where a fade-to-page edge reads as a rendering bug) for a flat direction-agnostic scrim. Home no longer washes the scene across the whole screen.
  - **The hero is one card containing both zones** — the zikr content at the start edge and the "وردك اليوم" card overlaid at the end edge. Previously these were sibling grid cells with the image floating behind everything.
  - **`left-controls` (settings gear _and_ bell) is `hidden="true"` in the node.** Both are removed. This confirms DEC-028's gear call and extends it: the bell went too, so `onOpenNotifications` is gone from `HomeScreen` and `App.tsx`.
  - **`friday-detail-card`** rebuilt to the node's three zones — artwork at the start, the Kahf message and its CTA in the middle, virtues list at the end — with the node's actual copy, replacing invented strings. The CTA now uses the `primary` token instead of hard-coded `#e2a84a`/`#ebd074` hexes.
  - `home-grid-full` (`grid-column: 1 / -1`) usages were dropped: the container is a flex column now, so they described a grid that no longer exists.
- **Two defects found while verifying, unrelated to layout:**
  1. **`StatCard` mis-aligned its value in Arabic.** `dir="auto"` on a digits-only string resolves to **LTR**, so the number left-aligned against its own right-aligned subtitle. Removed so it inherits container direction.
  2. **Two `<main>` landmarks survived Phase 04.** `HomeScreen` and `CustomCounterScreen` still nested one inside `App.tsx`'s `#main-content`. DEC-027's test passed _vacuously_: `toHaveCount(1)` polls and matched the shell's lone landmark before the lazy screen mounted. The test now waits for screen content first and checks a second screen; verified to report `Received: 2` against the unfixed code.
- **Consequences:** DEC-028's claim that the design's "وردك اليوم" card could not be `TodayRoutineGarden` was wrong in emphasis — the card is the garden (its heading already matches), it simply belongs _inside_ the hero card. The garden keeps its `quietProgressEnabled` gate and its four e2e tests. The design draws three routine rows where the app has four (it includes أذكار ما بعد الصلاة); the fourth is kept, since dropping a routine is a product change, not a layout fix.
- **Files/contracts to update:** `HomeScreen.tsx`, `CustomCounterScreen.tsx`, `TimeOfDayBackground.tsx`, `StatCard.tsx`, `App.tsx`, `e2e/responsive.spec.ts`.
- **Tests/evidence required:** Full `pnpm check` + `pnpm test:e2e` (166 passing). Landmark regression verified by reverting the fix. Visual verification at 1440×900 in Arabic/Midnight.
- **Supersedes:** Structural portions of DEC-028.

---

## DEC-030 — Home's wird card lists three routines, not four

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User
- **Related phase:** Phase 05
- **Context:** DEC-029 kept the fourth routine (أذكار ما بعد الصلاة) in Home's "وردك اليوم" card even though Figma node `940:26629` draws three rows, on the grounds that dropping a routine is a product change rather than a layout fix. User confirmed the design is intentional: after-prayer azkar are getting their own dedicated card later.
- **Decision:** Home's wird card lists only the three time-of-day routines. Implemented as an opt-in `visibleCategoryIds` prop on `ProgressDayView`, threaded through `TodayRoutineGarden`, rather than by overloading the existing `hideTabs` flag — `hideTabs` means "this is the compact Home rendering", and conflating it with "show fewer routines" would silently couple two unrelated concerns for the next caller.
- **Scope guard:** The change is display-only, and deliberately narrow:
  - `ProgressScreen` passes no `visibleCategoryIds`, so it still lists all four and after-prayer azkar stay reachable.
  - Leaf and palm arithmetic is untouched: a palm still requires all four main collections, and the header still announces "Today's leaves: N of 4". Filtering the rendered list must not quietly redefine what completing a day means.
- **Consequences:** Until the dedicated after-prayer card ships, that routine is not reachable from Home directly — only via Progress or the Azkar library. This is a known, accepted interim gap, not an oversight.
- **Files/contracts to update:** `ProgressViews.tsx`, `RoutineGarden.tsx`, `HomeScreen.tsx`, `e2e/quiet-garden.spec.ts`.
- **Tests/evidence required:** Existing all-complete test updated from 4 to 3 rendered rows, with the all-complete message left as the real assertion that palm maths is unchanged. New test asserts Home omits after-prayer while Progress still shows it. Full `pnpm check` + `pnpm test:e2e` (169 passing).
- **Supersedes:** The four-row decision recorded in DEC-029.

---

## DEC-031 — Phase 04/05 cleanup: status grid area, dead CSS, screen titles

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Claude (delegated — user asked for the outstanding items to be closed out)
- **Related phase:** Phase 04 (carry-over)
- **Context:** Closing the tracked Phase 04 items that were deferred when the phase shipped.
- **Decisions:**
  - **`NetworkStatus`/`SyncStatus` now share one `.app-status` grid area** spanning the full shell width at the top of every tier. They had been unplaced grid children, so auto-placement put them in an implicit row _inside the rail column_ on the expanded and large tiers — a full-width offline banner rendering underneath the navigation rail. Both are wrapped in a single element so they stack rather than fighting over one named area.
  - **Removed the dead context pane** (`.app-context`, `.app-shell[data-context-open]`, and the 90 rem grid template). `data-context-open` is never set anywhere in `src/`, so the entire third-column feature was unreachable CSS.
  - **Removed `active-sidebar-link`** from `NavSidebar`. The class had no definition anywhere; the sidebar's active state is carried by `.nav-sidebar-item[aria-current="page"]`, which was verified before deletion.
  - **`screenName` added to the six screens that omitted it**, but with a correction: the task had been recorded as "pass the prop", and doing so surfaced that `ScreenContainer` also rendered an **sr-only live region** with the same text as each screen's visible `Header` title. That duplicated the announcement — and, since Phase 04's `useViewFocus` moves focus to `#main-content` on every view change, made it a third redundancy. The live region was removed; `screenName` was kept for `document.title`, which genuinely was missing on those screens. A unit test caught this ("Found multiple elements with the text").
  - **Added `useLayoutMode.test.ts`** covering every tier boundary (599/600/899/900/1199/1200), width-only behaviour, `matchMedia` subscribe/unsubscribe, and the no-`matchMedia` fallback. This hook's contract mismatch with `theme.css` caused the DEC-027 navigation dead zone, so its boundaries now have direct coverage.
- **Consequences:** The offline banner's e2e test could not drive real offline state — `lazyWithRetry` reloads the page when a chunk fails, destroying the execution context. The test asserts the `.app-status` wrapper's computed grid area and geometry instead, which is deterministic and still catches the regression.
- **Tests/evidence required:** Both CSS fixes verified by reverting them and confirming the new tests fail; the `useLayoutMode` suite verified by introducing an off-by-one at 900 px. Full `pnpm check` + `pnpm test:e2e` (249 unit, 172 e2e).
- **Supersedes:** None

---

## DEC-032 — Phase 06: Arabic search normalization, category card states, roadmap copy

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Claude (delegated — user asked to proceed through phases autonomously)
- **Related phase:** Phase 06
- **Context:** Phase 06 Step 1 analysis of the Library index, category cards and search.
- **Primary finding — Arabic search was effectively broken.** `SearchScreen` matched Arabic with a raw `arabicText.includes(query)`. Verified against the corpus: **100% of sampled azkar carry diacritics** and 56% use hamza-alef variants. Confirmed live in a browser — searching `باسمك اللهم`, text that _is_ in the corpus as `بِاسْمِكَ اللَّهُمَّ`, returned "لم يتم العثور على أذكار". In an Arabic-first app, the primary search path returned nothing for ordinary typing.
  - **Fix:** new `content/searchNormalization.ts` building a comparison key — strips tashkeel/tatweel, folds alef variants, taa marbuta, alef maqsura and hamza carriers, lowercases Latin, collapses whitespace.
  - **Acceptance criterion "content text is not altered by normalization" is honoured structurally:** normalization produces a _match key only_ and is never applied to rendered strings. Verified in the browser — results still display `بِاسْمِكَ اللَّهُمَّ` with diacritics intact, and an e2e test asserts this.
  - **Folding is deliberately conservative.** Only variants routinely dropped when typing are folded, and a unit test asserts distinct roots (`كتب`/`كسب`, `نور`/`نار`) do **not** collapse. Aggressive stemming would create false matches in devotional content, which is worse than a missed match.
  - **Performance:** normalized keys are cached per zikr id rather than recomputed per keystroke; the corpus is static.
- **Secondary findings fixed:**
  - **Internal roadmap messaging in production UI** — the Library footer read "New collections will appear after their content review is complete." Removed with its i18n keys (Step 3 item 6). The separate `legal.reviewNotice` in Settings is left alone; it belongs to Phase 09.
  - **Category cards marked completion by colour alone** — a finished collection differed from an in-progress one only by the chevron's hue. Added a check glyph beside the progress text. Same defect class as DEC-027's `BottomNav` finding.
- **Already correct, no change needed:** `CategoryCard` already suppressed the progress bar for not-started collections (an explicit acceptance criterion), and the Library tabs already used the APG `TabList` from Phase 03 with proper `aria-label` and panel wiring.
- **Tests/evidence required:** 10 unit tests for the normalizer, a `CategoryCard` test asserting the completion cue is non-colour, and four e2e tests (undiacritized matching, content-not-altered, live-region count, empty state). The search defect was proven in a real browser _before_ the fix and re-verified after. Full `pnpm check` + `pnpm test:e2e` (260 unit, 184 e2e).
- **Not done / deferred:** taxonomy grouping (Step 1 item 4) is presentation-only per the phase's own prohibition on ID migration, and is left for a follow-up since it needs product input on group names. No search dependency was added, per the phase's prohibited list.
- **Supersedes:** None

---

## DEC-033 — Phase 07: reader counter render waste and announcement urgency

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Claude (delegated — user asked to proceed through phases autonomously)
- **Related phase:** Phase 07
- **Context:** Step 1 analysis of the reader, count interaction, session state and announcements.
- **Most of the phase's acceptance criteria were already met**, and are recorded as verified rather than changed: the tap-ignore list is thorough and also guards text selection and full surahs; `ZikrCounterSurface` is a real `<button>` so keyboard counting already worked; and every autoplay path originates in an explicit user gesture.
- **Decisions:**
  - **Removed dead `pulse` state from `useZikrCounter`.** `setPulse` fired on every tap and on reset but nothing consumed it — `CustomCounterScreen` maintains its own separate `pulse` for `PulseRings`. Each count was forcing an extra render on the app's hottest path for no observable effect.
  - **Reader announcement region changed from `aria-live="assertive"` to `polite`.** The region carries counting progress and completion, none of which is urgent enough to interrupt a screen reader mid-sentence — and in a reader, that sentence is usually the zikr. `ZikrShareButton` already established the right precedent by reserving assertive for errors, so the reader was the inconsistent case. Trade-off accepted: polite announcements can be queued behind other speech, which is preferable to cutting off devotional content.
- **Flagged, deliberately not fixed:** `handleReset` clears local counter state but does not undo the recorded completion — `onComplete` has already fired and `isDone` restores it on remount. This is Step 1 item 8, but resolving it means changing session state, which the phase's prohibited list excludes without separate approval. Recorded rather than silently changed.
- **Tests/evidence required:** New `useZikrCounter.test.ts` (9 tests) covering counting, completion, the surface-tap guards, surah behaviour, reset and haptics gating — the hook had no direct coverage despite being the hottest logic in the app. Two new e2e tests for keyboard completion and the polite region. The announcement fix was verified by reverting it and confirming the test fails. Full `pnpm check` + `pnpm test:e2e` (268 unit, 190 e2e).
- **Supersedes:** None

---

## DEC-034 — Accidental completions are recoverable from the reader

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (explicitly approved the session-state change Phase 07 had deferred)
- **Related phase:** Phase 07 (follow-up)
- **Context:** DEC-033 flagged that "Reset counter" cleared the local counter but left the recorded completion, so an accidental tap on the reader canvas was permanent. Phase 07's prohibited list required separate approval before touching session state.
- **Decision:** "Reset counter" now also clears that zikr's recorded completion. Chosen over a separate "Mark as not completed" action to avoid adding a second, near-identical destructive control.
- **Implementation is deliberately not new state logic.** `toggleZikrCompletion` already existed, was already wired to the collection list, and already handled un-completing safely. The reader now calls that same path via a new optional `onUncomplete` prop. Reusing it means the ledger semantics are unchanged and already covered by existing behaviour — notably that un-completing a zikr **does not revoke a palm that was already earned**, which is the conservative and correct choice for a devotional tracker.
- **Behavioural note discovered while verifying:** completing a zikr auto-advances to the next one, so reset pressed immediately after a completion acts on the _next_ zikr, not the one just completed. Recovery therefore means stepping back to the affected zikr and resetting it there. This is a real constraint on the feature and is asserted directly in the test rather than glossed over.
- **Tests/evidence required:** New e2e test completes a zikr, confirms it reaches stored progress, steps back, resets, and asserts the entry is gone from `localStorage`. Verified by removing the fix and confirming the test fails. Full `pnpm check` + `pnpm test:e2e` (268 unit, 214 e2e).
- **Process note:** the first version of this test was wrong and passed against unfixed code — it asserted on `completed.morning` while the fixture opens `waking_up`, so it was checking a permanently empty array. It was caught by the revert check, not by it passing. A test that has never been seen to fail is not evidence.
- **Supersedes:** The "flagged, not fixed" entry in DEC-033.

---

## DEC-035 — Automate the machine-checkable manual-checklist rows; fix Light-theme hero contrast

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User
- **Related phase:** Cross-cutting (feeds Phases 11–12)
- **Context:** All 11 rows of the Manual release record in `docs/QUALITY_CHECKLIST.md` read `Pending`. The table conflated work that genuinely needs a human with work a machine can prove.
- **Decision:** Added `e2e/manual-checklist.spec.ts` covering the five rows that do not need a person — contrast across all five modes, responsive reflow at 320/390/tablet/desktop, largest text setting and 200% zoom, prayer-time timezone/offset including offline, and keyboard tab order with visible focus and no traps. Those rows are now dated as automated evidence and run in CI on every push.
- **Six rows deliberately remain `Pending`,** with the reason recorded next to them: screen reader (needs a real VoiceOver/NVDA/TalkBack session), safe areas (needs notch/cutout hardware), performance (needs a representative device), media alternatives (needs human review), RTL and poor connectivity (partially covered elsewhere but not to the row's full bar). The keyboard row is explicitly marked **partial** — automation proves focus moves and is visible, not that the flow makes sense.
- **The automation immediately found a real defect,** which is the point of writing it: **Light theme failed contrast on Home.** The hero's hardcoded `text-white` measured **1.98:1** against a required 4.5:1, because the page scrim fades to _white_ in Light while the text assumed a dark backing. Two further failures at 3.91:1 and 4.46:1 on the routine selector and estimate row.
- **Fix and its consequence:** a dark scrim now sits behind the hero column in every theme. That surfaced a fourth failure the first three had masked — the gold heading used `text-primary`, which is a **dark** gold (`#835806`) in Light and dropped to 1.07:1 once the backing darkened. Rather than hardcode a hex, added `--on-media` / `--on-media-muted` / `--on-media-accent` tokens: content over photography sits on a dark scrim in every theme, so it needs light-on-dark values that deliberately do **not** follow `--primary`.
- **Tests/evidence required:** 13 tests in the new spec. Contrast is asserted per mode with a named failure message so a regression identifies the mode. Full `pnpm check` + `pnpm test:e2e` (268 unit, 253 e2e).
- **Supersedes:** None

---

## DEC-036 — Library taxonomy grouping

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (approved the proposed groups and names before implementation)
- **Related phase:** Phase 06 (deferred item)
- **Context:** Phase 06 Step 1 item 4 called for user-facing grouping without changing source content. It was deferred because group names are a religious-content decision, not a layout one. The grouping was proposed for review and approved as drafted.
- **Decision:** Five presentation-only groups in `CATEGORY_GROUPS` — Daily Azkar (5), Place & Travel (3), Everyday Life (3), Hardship & Healing (2), More Azkar & Du'as (4). Built on the routine/occasional split the data already encodes rather than inventing a parallel taxonomy.
- **Explicitly unchanged:** category IDs, ordering within groups, and all content. The phase prohibits ID migration and this respects that — `CATEGORY_GROUPS` references existing IDs and nothing else moves. `friday_kahf` stays ungrouped because the Library already filters it out; it is reached through the Friday screen.
- **A corrupted-Arabic near-miss, worth recording.** The Arabic group names shipped to the working tree as mojibake (`Ø£Ø°ÙØ§Ø± Ø§ÙÙÙÙ`) because the script that wrote them round-tripped UTF-8 through `unicode_escape`. **Every test passed** — unit, e2e and axe — because none of them asserted on Arabic copy. It was caught only by looking at a rendered screenshot. Added `src/app/i18n/encoding.test.ts`, which scans the whole Arabic bundle for Latin-1 mojibake sequences and reports the offending key path; verified by reintroducing the corruption and confirming it fails. This protects all Arabic copy, not just these five strings.
- **Tests/evidence required:** `categoryGroups.test.ts` asserts every Library category appears in exactly one group, no group is empty, ids are unique, and `friday_kahf` is absent — so a future category cannot be silently dropped from the index. Browser check confirmed all 17 cards render across the five headings. Full `pnpm check` + `pnpm test:e2e` (274 unit, 253 e2e).
- **Supersedes:** The "not done / deferred" taxonomy note in DEC-032.

---

## DEC-037 — Phase 08: the week grid was invisible to screen readers

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Claude (delegated — user asked to proceed through remaining phases autonomously)
- **Related phase:** Phase 08
- **Primary finding:** the Progress week grid rendered completion as **shape alone with no text**. A completed cell held an icon `<div>`; an incomplete cell held an empty bordered `<div>`. Neither carried a label. A screen reader therefore announced all 21 cells as blank, so the entire week view conveyed **nothing** — a direct failure of the phase's "charts are understandable without color or vision" criterion.
- **Fix:** extracted `WeekStatusCell`, which renders an `sr-only` "Morning: Completed" / "Not completed" string and marks the visual shape `aria-hidden`. Added `scope="col"` to the header cells so column association is explicit during grid navigation.
- **Verified already correct, deliberately unchanged:** the month calendar is well built — every day is a `<button>` with a descriptive `aria-label` covering complete / partial / unstarted. Streak copy is already gentle ("You kept up with {category} today"); no punitive language exists, so the phase's criterion on that is met without edits.
- **A repeat mistake, and the systemic fix.** The Arabic strings in the new cell shipped as mojibake, exactly as in DEC-036, because the same script pattern round-tripped UTF-8 through `unicode_escape`. The DEC-036 guard did not catch it: that guard only scanned `ar.ts`, and this Arabic was inline in a component. The guard now scans **every** `src/**/*.{ts,tsx}` file and reports `file:line`; verified by reintroducing the corruption in `ProgressViews.tsx` and confirming it fails. Two occurrences of the same defect class in one session is a process signal, not bad luck — the check now covers the whole surface rather than the one file that failed first.
- **Tests/evidence required:** e2e asserts 21 labelled cells, that the table text contains "Morning: Completed/Not completed", and that column headers are scoped. Browser check confirmed the rendered table text. Full `pnpm check` + `pnpm test:e2e` (275 unit, 256 e2e).
- **Deferred, not done:** splitting `ProgressViews.tsx` (905 lines) and `RoutineGarden.tsx` (781 lines, **2.45% coverage**) is still outstanding. Refactoring a file that large with almost no coverage is how regressions get introduced silently; characterization tests should land before the split, and that is a larger piece of work than this fix.
- **Supersedes:** None

---

## DEC-038 — Characterization tests before splitting RoutineGarden

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** User (chose "characterization tests first" over splitting immediately)
- **Related phase:** Phase 08
- **Context:** `RoutineGarden.tsx` is 781 lines at **2.45% statement coverage** — the lowest in the codebase — and is scheduled to be split. Splitting it in that state would mean no test could tell a behaviour-preserving refactor from a regression.
- **Decision:** land characterization tests first. Coverage moved **2.45% → 61.47% statements** (2.75% → 59.63% lines) with 13 tests.
- **Written deliberately against observable output, not implementation**, so they survive the refactor they exist to protect: date-label shape per tab/language/calendar, filled-vs-unfilled marks being visually distinguishable, `GrowthEventStatus` remaining a polite live region with a distinct message per event kind, Arabic copy not silently falling back to English, and the summary components surviving an empty summary.
- **A note on what "passing" proved.** `vitest` passed these tests while `tsc` rejected them — `GrowthEvent` requires `dayKey` and `leafCount`, which the fixtures omitted. Runtime green is not the same as correct; the type gate caught it.
- **Tests/evidence required:** 13 tests in `RoutineGarden.characterization.test.tsx`. Full `pnpm check` + `pnpm test:e2e` (288 unit, 256 e2e).
- **Still open:** the split itself. The safety net now exists, so it can proceed as a separate reviewable change — which is the point of doing this first.
- **Supersedes:** The deferral recorded in DEC-037.

---

## DEC-039 — CI Node mismatch, and verifying i18n completeness properly

- **Date:** 2026-08-07
- **Status:** Approved
- **Owner:** Claude (delegated)
- **Related phase:** Cross-cutting / Phase 09
- **Deployment defect found and fixed.** The Arabic mojibake guard from DEC-037 used `fs.globSync`, which only exists from **Node 22**. Local Node is 24, so it passed here; CI pins **Node 20**, where it threw `globSync is not a function` and failed the quality gate. A guard written to protect the build became the thing breaking it, and two subsequent pushes failed for the same reason before it was caught. Replaced with a recursive `readdirSync` walk (Node 10+) and `String.replaceAll` (Node 15+). Verified CI green and the live site serving current `HEAD`.
- **Lesson recorded rather than glossed:** passing locally is not evidence of passing where the code runs. The pre-push hook runs the same commands but on the _local_ toolchain, so it cannot catch a runtime-version gap by construction.
- **Phase 09 criterion "Arabic/English copy is complete" — verified, not assumed.** A first attempt used a regex over the i18n source files and reported **36 keys missing in Arabic and 15 in English**. All were **false positives**: the parser did not handle single-quoted strings, and spot-checking three of them found each present in both bundles. Reporting that as a defect would have been wrong.
- **Decision:** replaced the throwaway regex with `src/app/i18n/parity.test.ts`, which imports both bundles and compares real key paths. Result: **full parity, no empty strings**. The criterion is genuinely met. The test also guards against empty-string values, which parity alone would miss, and was verified by removing a key and confirming it names `library.saved`.
- **Tests/evidence required:** 3 parity tests; CI run green; live `deployment-meta.json` matching `HEAD`. Full `pnpm check` (291 unit).
- **Supersedes:** None

---

## DEC-040 — RoutineGarden split, behind the characterization tests

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User (approved "characterization tests first", which this completes)
- **Related phase:** Phase 08
- **Context:** `RoutineGarden.tsx` was 672 lines and the largest remaining technical debt. DEC-038 raised its coverage from 2.45% to 61.47% specifically so this split could be verified rather than hoped.
- **Decision:** cut the two seams with no data dependencies:
  - `GardenMarks.tsx` (176 lines) — the eight pure SVG leaf/palm marks.
  - `gardenDateLabel.ts` (110 lines) — Hijri/Gregorian parsing and `getGardenDateLabel`. Pure functions with no React import, so `.ts` rather than `.tsx` and testable without rendering.
  - `RoutineGarden.tsx` drops **672 → 418 lines**.
- **Every extracted symbol is re-exported from `RoutineGarden.tsx`**, so no call site changed. The split is invisible to consumers, which keeps the blast radius at zero and makes the diff reviewable as pure movement.
- **Evidence it was behaviour-preserving, not just green:** the 13 characterization tests pass **unchanged**, and overall coverage is byte-identical before and after — **2478/3836 statements, 2314/3517 lines**. Identical totals are the strongest available signal that code moved without changing what executes. Full e2e also unchanged at 256.
- **Deliberately not extracted:** `TodayRoutineGarden` itself, which is the remaining bulk of the file. It owns tab state, offset navigation and summary recomputation, so cutting it is a behavioural refactor rather than a move, and it deserves its own change with its own tests.
- **Coverage note that looks alarming but is not:** `RoutineGarden.tsx` now reads 29% rather than 61%. The well-tested marks and date helpers moved out, leaving the untested `TodayRoutineGarden` as a larger share of a smaller file. Nothing lost coverage; overall totals are unchanged.
- **Tests/evidence required:** 291 unit, 256 e2e, bundle budget passed.
- **Supersedes:** The "still open: the split itself" note in DEC-038.

---

## DEC-041 — Preserve user-controlled PWA updates

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User (approved the stabilization sequence before Phase 09)
- **Related phase:** Phase 13 / release hardening
- **Context:** The app already implements an update-available notice through `registerSW({ onNeedRefresh })`, lets the user choose Refresh or Later, and documents understandable update behavior. Changing VitePWA to `registerType: "autoUpdate"` bypassed that product contract and could reload an active reading or settings flow without the user's choice.
- **Decision:** Restore `registerType: "prompt"` and retain the existing `onNeedRefresh` event bridge and update notice. Add a regression test that keeps the build strategy aligned with the application UI.
- **Tests/evidence required:** Targeted PWA configuration test, mandatory local release gate, successful GitHub Quality and Pages workflows, and production smoke verification.
- **Supersedes:** Commit `1d2b8de`'s automatic-update policy; the deployment itself remains current through the normal prompt flow.

---

## DEC-042 — Phase 08 progress metrics must reflect only recorded main-routine data

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User (approved the stabilization sequence and Phase 08 integrity pass)
- **Related phase:** Phase 08
- **Context:** The period views displayed hard-coded fallback values whenever a real metric was zero, including invented streaks, active days, completion rates, monthly comparisons, and totals. The selectors also counted unrelated collections in four-routine totals, omitted after-prayer from several summaries, and let future calendar dates reset the current-year streak. This contradicted the Phase 08 prohibition on fabricated metrics and the four-main-routine contract in DEC-030.
- **Decision:** Every displayed metric now derives directly from `dailyCompletions`. Empty periods show recorded zeros and neutral guidance; best-routine/month selectors are nullable when no activity exists. Week, month, and year calculations count exactly `MAIN_CATEGORY_IDS`, include after-prayer consistently, ignore unrelated collection categories, and preserve a current-year streak through future calendar cells.
- **Accessibility consequence:** The weekly text-equivalent matrix expands from 21 to 28 labelled cells so the fourth routine is represented. Month day labels and visible fractions now use a four-routine denominator, and selected-day details include after-prayer.
- **No migration:** The completion ledger, persisted record shape, merge boundary, and remote sync contract are unchanged. This is a read-model and presentation correction only.
- **Tests/evidence required:** Selector and component regression tests for empty periods, unrelated-category exclusion, after-prayer dominance, and current-year streaks; relevant Playwright coverage; mobile and desktop browser evidence; mandatory local release gate; green GitHub Quality and Pages workflows; production smoke verification.
- **Supersedes:** DEC-037's incorrect verification claim that every displayed value already derived from stored data. DEC-040 remains authoritative for the completed `RoutineGarden` split.

---

## DEC-043 — P0 UI geometry fixes and evidence-based closure

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User (approved the sequential stabilization and P0 release)
- **Related scope:** `docs/agent/UI_FIX_BACKLOG.md` items 5.3, 5.4, and 4.4
- **Counter:** `ZikrCounterSurface` animated the circular form to 164px even though the Reader contract specifies 184 CSS px and its collision footprint already reserved 206px. Restored 184×184 with a 92px radius. Browser tests assert the circle fits a 320px viewport and remains 184px on desktop.
- **Bottom navigation:** The selected indicator and icon both began at the nav button's top edge. Making each button fill the nav row gives the centered icon 7px of clearance below the indicator while preserving `aria-current`, the bold label, and the persistent non-color cue.
- **Friday CTA:** No code change. Rendered SVG inspection confirmed the arrow already points right in LTR and left in RTL, matching the directional-icon contract. Changing correct behavior to satisfy a stale report would create a regression.
- **Browser warning:** React 18 warned about the camel-cased `fetchPriority` prop. The image now emits the standard lowercase `fetchpriority` attribute through a spread, preserving the `high` resource hint without the warning.
- **Tests/evidence required:** Component test for the resource hint and warning-free render; real-browser counter and nav geometry tests across configured projects; fresh-console browser check; mandatory release gate; green GitHub Quality and Pages workflows; production smoke verification.
- **Supersedes:** The open P0 entries for 5.3, 5.4, and 4.4 in the UI backlog.

---

## DEC-044 — Pre-Phase-09 UI fix-list closure contracts

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User
- **Related phase:** Cross-cutting closure of Phases 02, 05, 06, 07, and 08 before Phase 09
- **Context:** The user required every item in `docs/agent/UI_FIX_BACKLOG.md` to be resolved before Phase 09 and explicitly authorized implementation of the named Home-header and non-Home-surface changes despite conflicts with earlier design decisions. The same fix list adds Saved and Benefits access, a reviewed long-surah page structure, Friday contribution feedback, and optional counter sound. These choices need explicit boundaries so a visual fix cannot become a content, persistence, or accessibility regression.
- **Options considered:** Defer the conflicting items to their original phases; implement the entire list as unconstrained visual overrides; implement the named supersessions while preserving all unaffected content, state, offline, and accessibility contracts.
- **Decision:** Implement the named supersessions with the following limits:
  - **Home utility header:** compact Home uses at most two rows: date on the first row, current time and prayer context on the second, with streak above the palm status. This replaces only the prior Figma-derived utility-header structure; the contextual primary action, contained hero imagery, reviewed routines, and quiet-progress contracts remain unchanged.
  - **Non-Home surfaces:** decorative photography remains Home-only. Non-Home screen backgrounds may use one very low-opacity, tonal noise texture behind content. The texture is removed in high-contrast mode, reduced-transparency mode, and `prefers-reduced-transparency`; devotional and functional cards remain opaque. This is a page-background exception, not permission to restore glassmorphism or texture Quran/zikr reading surfaces.
  - **Library and Saved:** keep the Collections/Saved filter as a first-class tab group and place it beside search when desktop space permits. Home gains a saved-item preview and a route to the existing full Saved library; it does not replace or fork the Saved source of truth, IDs, persistence, merge, or sync behavior.
  - **Mushaf pagination:** page numbers and ayah ranges are reviewed structural metadata from an identified authoritative Madani Mushaf pagination source. They may split only the existing exact Quran string at existing ayah markers. Concatenating rendered page segments must reproduce `arabicText` byte-for-byte; this work authorizes no Quran wording, spelling, diacritic, verse-marker, translation, attribution, or repetition-count change. Multi-page metadata, not `isSurah` alone or text length, defines long-surah interaction.
  - **Friday dua contribution:** completing a comprehensive dua through the session opened from Friday Mode contributes its stable ID to a device-local set for the current ISO week. That Friday-origin flow reads the weekly presentation set in Category and Reader while the existing lifetime completed collection and synchronized snapshot remain separate. Ordinary Library comprehensive-dua sessions keep their existing completion semantics; no new AppState or remote-sync field is introduced.
  - **Counter click feedback:** Reader and custom counter share one restrained optional click generated with the platform Web Audio API. The enabled preference and easy on/off control are device-local; unsupported or blocked audio must fail silently and never block counting. No audio asset, remote call, runtime dependency, or synchronized preference is added.
  - **Benefits:** Home links to a dedicated Benefits screen assembled only from existing reviewed `benefit`, localized benefit, and source fields. WhatsApp sharing is an explicit per-item action. No new virtue, promise, religious interpretation, or uncited educational claim is introduced by this feature.
- **Why:** These boundaries satisfy the user-approved UI corrections while preserving the repository's Arabic-first, offline, content-integrity, accessibility, and data-normalization contracts.
- **Consequences:** The Home header and non-Home page background intentionally differ from the earlier Figma/plain-background result. Saved data and lifetime completion state retain their existing persistence and sync semantics. Weekly Friday contribution and counter-sound preference remain narrow, namespaced, device-local state. Long-surah behavior applies only to content with reviewed multi-page metadata.
- **Files/contracts to update:** `docs/CONTENT_AUTHORING.md`, `docs/agent/UI_FIX_BACKLOG.md`, pre-Phase-09 release evidence, Home/Library/Reader/Friday/Benefits/counter screens and tests, Friday progress utilities, Mushaf metadata/types, i18n, and semantic theme CSS.
- **Tests/evidence required:** Content invariance and page-boundary tests; Home two-row and Friday-background tests; Library search/label/RTL tests; long-vs-short-surah interaction tests; Saved and Benefits navigation tests; weekly Friday progress tests; sound persistence/fallback tests; contrast, keyboard, touch-target, responsive, full `pnpm check`, full `pnpm test:e2e`, Pages build, CI/deployment, and production smoke evidence.
- **Supersedes:** The utility-header structure in DEC-028/DEC-029 and DEC-026's consequence that non-Home screens render on a completely flat `--background`. DEC-026's Home-only photography rule remains authoritative. DEC-003/DEC-007 remain authoritative for opaque functional and devotional surfaces; this decision adds only the bounded page-background texture exception described above.

---

## DEC-045 — Benefits screen uses a dedicated evidence catalogue

- **Date:** 2026-08-08
- **Status:** Approved
- **Owner:** User (provided the conservative source review and explicitly requested removal of non-Qur’an/non-hadith cards)
- **Related scope:** Pre-Phase-09 Benefits content correction
- **Context:** DEC-044 assembled the Benefits screen by scraping every reviewed `benefit` field in the app. Those fields include contextual editorial summaries, so generic statements appeared as if they were standalone religious benefits. The user supplied a source-led review prioritizing the Qur’an, Sahih al-Bukhari, Sahih Muslim, and explicitly authenticated reports.
- **Decision:** The Benefits screen now uses a dedicated bilingual catalogue in this order: seven Qur’anic evidence entries, 21 authenticated hadith entries, and exactly 30 concise benefits directly mapped to their hadith evidence IDs. The UI groups the material with accessible tabs and subgroups, keeps sources visible and linked, and batches lists over 20 items. General collection `benefit` fields are no longer a Benefits-screen data source.
- **Content boundary:** A derived card may restate or separate promises explicitly contained in its linked hadith, but may not create a reward, count, timing, protection claim, or interpretation. Qur’anic excerpts remain source-linked and are not represented as full verses when excerpted.
- **Review evidence:** User-supplied research dated 2026-08-08; implementation cross-check against the linked Quran.com and Dorar al-Saniyyah records; invariant tests enforce group sizes, source domains, stable evidence links, and the removal of the reported generic cards.
- **Tests/evidence required:** Catalogue invariant tests; bilingual component tests; WhatsApp source-preservation test; desktop/mobile browser test; mandatory local release gate; green GitHub Quality and Pages workflows; production smoke verification.
- **Supersedes:** DEC-044’s Benefits data-source rule. DEC-044 remains authoritative for the route, Home entry, sharing action, and all unrelated pre-Phase-09 contracts.

---

## DEC-046 — Bilingual user-facing release highlights in the update notice

- **Date:** 2026-08-09
- **Status:** Approved
- **Owner:** User
- **Related scope:** Narrow update-notice improvement; Phase 10 system-state behavior without starting the full phase
- **Context:** The PWA update notice only said that improvements were available. Users could not tell what mattered to them before choosing whether to refresh. The notice is rendered by the older client while a newer service worker waits, so notes compiled into the React bundle would describe the wrong release.
- **Decision:** Every deployment maintains `public/release-notes.json` with the 3–5 most important user-facing changes in simple Arabic and English. The waiting-update flow fetches the deployed file without cache, validates both language lists, and renders the selected language as a semantic bullet list. Invalid or unavailable notes use the existing generic localized message. Refresh and Later remain explicit user choices.
- **Why:** A small same-origin manifest keeps the old client informed about the new deployment without a dependency, persisted state, polling, or automatic reload.
- **Consequences:** Release maintenance must update both language lists before each deployment. The first deployment of this mechanism cannot retrofit detailed notes into clients running code from before the mechanism existed; subsequent updates use the deployed manifest.
- **Files/contracts to update:** `public/release-notes.json`, `src/app/releaseNotes.ts`, `PwaNotice.tsx`, `App.tsx`, README maintenance workflow, and PWA architecture documentation.
- **Tests/evidence required:** Manifest validation tests, bilingual browser coverage, mandatory local release gate, green GitHub Quality and Pages workflows, and production smoke verification.
- **Supersedes:** None

---

## DEC-047 — Evidence-led Reader refinement for desktop and tablet

- **Date:** 2026-08-09
- **Status:** Approved
- **Owner:** User
- **Related scope:** Narrow Phase 07 follow-up before Phase 09
- **Context:** Two proposed Reader visuals showed useful ideas for reading focus, progress prominence, and control proximity, but also conflicted with established contracts through excessive empty canvas, detached edge navigation, duplicated progress, alternate icons, and a reduced counter treatment. The user explicitly requested selective adoption rather than literal implementation.
- **Decision:** Preserve the existing Untitled icons, every Reader action, the 184px counter, the 600px reading measure, the ≥1200px hero/card boundary, and all content/session behavior. Reposition the persistent keyboard guide from the bottom action area to the session-progress area: beneath progress inside the desktop hero and beneath progress above the tablet reading region. Keep narrow-screen actions below the counter and center the tablet action row. Product labels for the guide move into bilingual i18n.
- **Why:** Readers see the available keyboard controls before beginning, while the counter and primary actions retain a calmer, less crowded finish. The change takes the references' hierarchy benefit without importing their weaker spacing, duplicate status, or unapproved visual language.
- **Consequences:** Desktop hero height increases slightly; the reading card gains that space back by removing the old shortcut footer row. Tablet actions retain the same controls and semantics but align around the reading axis. Compact layouts remain unchanged because the keyboard guide stays hidden below the medium breakpoint.
- **Files/contracts to update:** `ReaderScreen.tsx`, Reader i18n, `docs/DESIGN_SYSTEM.md`, responsive Reader tests, and release highlights.
- **Tests/evidence required:** Desktop/tablet browser screenshots; geometry assertions for guide placement, tablet action centering, fixed counter size, full local release gate, green Quality and Pages workflows, and production smoke verification.
- **Supersedes:** Only the keyboard-guide position described by the earlier wide-desktop Reader implementation; all other Reader contracts remain authoritative.

---

## DEC-048 — Shared rectangular counter and simplified Reader card

- **Date:** 2026-08-09
- **Status:** Approved
- **Owner:** User
- **Related scope:** Narrow Phase 07 follow-up before Phase 09
- **Context:** The approved visual review found the circular counter, duplicate position strip, bottom navigation arrows, and hero-level shortcut guide unnecessarily consumed or fragmented the reading layout.
- **Decision:** Use one shared 220×76px rectangular counter with a bottom progress track in Reader and Custom Counter. Remove the desktop "Zikr {index} of {total}" strip. On tablet and desktop, place Previous/Next at the card's logical side edges and vertical midpoint. Place keyboard guidance below the counter with at least 20px clearance; compact layouts keep navigation beside the counter and hide keyboard guidance.
- **Why:** This keeps the zikr primary, uses less vertical space, and makes navigation spatially predictable without adding controls or changing content.
- **Consequences:** The Reader no longer measures content to switch between circular and compact counter variants. DEC-043's fixed circular geometry and DEC-047's shortcut placement are superseded; counting, completion, keyboard, accessibility, and session behavior remain unchanged.
- **Files/contracts to update:** Shared counter component/styles, Reader composition, Custom Counter, Reader tests, design-system contract, release notes, and phase evidence.
- **Tests/evidence required:** Focused Reader/Custom Counter unit and browser coverage, desktop/tablet visual review, and the normal release gate once before publication.
- **Supersedes:** DEC-043 counter geometry and DEC-047 keyboard-guide placement.

---

## DEC-049 — "Clear local data" sweeps every app-owned storage namespace

- **Date:** 2026-08-09
- **Status:** Approved (2026-08-10 — user approved clearing offline audio too, "if it's recommended by UX and code best practices").
- **Owner:** User (storage sweep raised by Claude; the offline-audio question answered directly).
- **Related scope:** Cross-cutting robustness pass before Phase 09
- **Context:** `clearStoredAppData` cleared a hand-maintained list of six named keys plus an `azkarapp.friday-` prefix sweep. The list had fallen behind the code: **search history (`azkarapp_recent_searches_*`), cached prayer times (`azkarapp.prayer_times_cache.*`), the cached timezone (`azkarapp.prayer_time_zone.*`), the last sync stamp, and audio preferences all survived it.** Search history and location-derived caches outliving a "delete my local data" action is the part that matters — the app ships an account-deletion page and this same function runs after account deletion.
- **Options considered:** Keep the named list and append the five missing keys; sweep by owned prefix so the function cannot fall behind again.
- **Decision:** Sweep by prefix over the three namespaces the app actually writes under — `azkarapp.`, `azkarapp_`, and `azkar.audio-preferences`. Unrelated origin storage is still untouched, which an existing assertion continues to guard.
- **One key is deliberately excluded, and this is the part worth review.** `azkar.audio-downloads.v1` is the **only** index of which URLs live in the `azkar-audio-v*` Cache API bucket. Deleting it without the cache entries would strand those bytes — potentially hundreds of MB — with nothing able to find or remove them. Clearing it properly means awaiting `removeDownloadedAudio()`, which would make this sync function async and change both call sites. That is a larger change than a robustness fix should make unreviewed, so the exclusion is documented in the code and recorded here as the open question.
- **Consequences:** "Clear local data" and post-account-deletion cleanup now also remove search history, prayer-time and timezone caches, the sync stamp, audio preferences, and — per the 2026-08-10 resolution below — downloaded offline audio. No persisted state shape, merge boundary, or remote-sync contract changes; this only widens what the destructive action removes.
- **Files/contracts to update:** `src/app/state.ts`, `src/app/state.test.ts`.
- **Tests/evidence required:** The existing clear-data test now asserts all 13 owned keys are removed, that unrelated origin storage survives, and that the audio-download registry is deliberately retained. Verified by narrowing the prefix list and confirming the test fails naming `azkarapp.state.v1`. Full `pnpm check` green.
- **Resolution of the open question (2026-08-10):** yes — downloaded offline audio is now cleared with local data, and it is the correct behaviour on both counts. **UX:** "Erase all local Azkar data on this device" that silently leaves hundreds of MB of cached audio behind does not match its own promise, and offline audio is the largest thing the app stores. **Code:** the two halves (Cache API bytes and the `azkar.audio-downloads.v1` index) must be removed together or not at all.
- **Implemented at the caller, not in `state.ts`.** A new `clearAllLocalData()` in `hooks/useSettingsHandlers.ts` awaits a dynamically-imported `removeDownloadedAudio()` — which removes cache entries and empties the registry together — and only then calls `clearStoredAppData()`. Both destructive paths use it: "Erase Local Data" and post-account-deletion cleanup.
- **Why the caller and not `state.ts`:** `state.ts` is the persistence and normalization boundary; importing the audio module there would pull the Cache API and the audio catalogue into it. `main.tsx` already reaches that module through a dynamic import, so this matches the established pattern and keeps it out of the settings bundle.
- **`azkar.audio-downloads.v1` stays out of `OWNED_STORAGE_PREFIXES`,** now for a stronger reason than before: the ordering guarantee. If the Cache API step ever fails, the registry must survive so the bytes remain findable. Sweeping it from `state.ts` as well would silently break that. The comment there says so.
- **The audio step cannot block the local clear.** It is wrapped so an unsupported or blocked Cache API still leaves the user able to erase everything else — asserted by a test, alongside one proving the audio removal is awaited _before_ storage is cleared.
- **Supersedes:** None

---

## DEC-050 — Phase 09 settings IA and control semantics

- **Date:** 2026-08-10
- **Status:** Approved
- **Owner:** User (approved each open question, delegating the specifics: "merge or separate depending on best UX practices you decide", "you can keep and do whatever necessary", "follow best practices on screen reader", "follow best practices").
- **Related phase:** Phase 09 (clears its Step 2 approval gate)
- **Context:** The Step 1 analysis in `docs/agent/evidence/phase-09/PHASE_09_STEP_1_ANALYSIS.md` found five open questions and three defects against the phase's own acceptance criteria.

### Decisions

- **(a) Merged the two rows that opened the same panel.** "Prayer Times & Location" and "Notifications" were two labels with two different values both calling `onNav("notifications")`. One row, one destination is the principle; two labels pointing at one screen is precisely the ambiguous-chevron problem AGENTS.md §7 names. The single row is "Prayer Times & Reminders", naming both concerns so either intent finds it by text, with the location pin as its icon since the value is a place.
- **(b) Kept the sidebar theme and language controls,** re-affirming DEC-027 rather than applying the phase's blanket prohibition. Fixed the contradiction inside the language control instead: it labelled itself with the **target** language ("English") beside a badge showing the **current** one ("AR") — two opposite mental models in one control. It is now label + current value, matching the theme button directly beneath it and every settings row in the app.
- **(c) Screen-reader support is help text, not a row.** It was already a non-interactive `<div>` (`SettingsRowItem` renders a plain div without `onPress`), so this was never a semantics bug — it was an affordance bug: identical anatomy to the working toggles above it. It now reads as a short note. Screen reader support is not something a user switches on, so it should not look switchable.
- **(d) Calendar system moved from Accessibility to Preferences, beside Language.** It is a locale preference, not an accessibility aid, and it sat under a "Visual" label inside the Accessibility panel. It now uses the same `SegmentedControl` as Language, which also gives it the radiogroup semantics and the DEC-013 focus ring its hand-rolled radio items lacked. **Presentation move only** — the persisted `calendarType` field, its normalization and its default are untouched.
- **(d, cont.) The prayer-times row shows a real unset state.** It rendered `locationSettings?.cityName || "Cairo"`, presenting a fallback as though the user had configured it. It now shows the configured city or an explicit "Not set".

### Also fixed, no approval needed

- **Colour-blind support had the wrong control semantics.** Four plain buttons carrying `aria-pressed` inside a bare `<div aria-label=…>`. `aria-pressed` models an independent toggle, so a screen reader announced four unrelated on/off controls rather than one single-choice group, and a label on a roleless div is ignored outright. Now a Radix `RadioGroup`, matching Text size in the same panel. Same defect class as the Home header fix earlier in this series.

### Consequences

- Two e2e specs referenced the old row label and were updated — the DEC-022/DEC-027 selector-drift class, which has now failed loudly rather than silently three times running. That is the pattern working.
- `AccessibilityPanel` loses its `calendarType`/`onCalendarTypeChange` props; `SettingsRootPanel` gains them.
- Inline bilingual strings in every touched file moved into the i18n bundle, so `parity.test.ts` now covers them.

- **Files/contracts to update:** `SettingsRootPanel.tsx`, `AccessibilityPanel.tsx`, `SettingsScreen.tsx`, `LayoutShells.tsx`, i18n bundles, `e2e/settings-experience.spec.ts`, `e2e/manual-checklist.spec.ts`.
- **Tests/evidence required:** New `AccessibilityPanel.test.tsx` (4 tests) covering the radio-group semantics, the calendar's absence, and the screen-reader note not being a control. Full `pnpm check` and `pnpm test:e2e`.
- **Not done:** language and RTL remain on separate screens (analysis §4.5). `forceRtl` is a reading-direction override rather than a locale choice, and moving it was not approved.
- **Supersedes:** Re-affirms DEC-027 on the sidebar controls; supersedes the calendar's placement in the Accessibility panel.

---

## DEC-051 — Home prayer, Friday, and Saved-card refinement

- **Date:** 2026-08-11
- **Status:** Approved
- **Owner:** User (approved all four open decisions and said “go ahead”).
- **Related phase:** Phase 05 Home follow-up
- **Context:** The Home audit found that the prayer line prioritised the device clock over the actionable prayer schedule, the Friday feature had the same visual weight all week, and Saved quick access lacked robust loading/error feedback and clear empty-state routing. The cards also used inconsistent surface anatomy and several nested decorative treatments.

### Decisions

- **Prayer card:** Show the actual next prayer, its scheduled local time, and the live countdown inside the primary routine card. Remove the unrelated device clock. Keep the existing prayer calculation and location contracts unchanged.
- **Friday card:** Show the expanded Friday experience from Thursday Maghrib until Friday Maghrib, using the existing calculated Maghrib time and user location. Outside that window, show a compact entry. A development-only preview control may expose the expanded state for QA; no test switch ships in production.
- **Saved order:** Preserve the existing stable catalogue order. Do not add reordering, a new persisted field, or a synchronization migration.
- **Friday content:** Surface one already-reviewed benefit first and place the remaining existing virtues behind progressive disclosure. Do not invent or reinterpret devotional claims or sources.

### Consequences

- The primary routine card receives clearer prayer hierarchy, wrapping at narrow widths, a concise mode explanation, and a CTA that communicates remaining work when resuming.
- Saved quick access uses the shared card surface, announces its count and asynchronous state, distinguishes item sources visually and in accessible names, and sends an empty library to Collections rather than an empty Saved tab.
- The Friday feature uses one responsive component with compact and expanded variants, semantic disclosure, a non-emoji repository icon, and state-aware entry copy without fabricating precise reading progress.
- Presentation is extracted into focused Home card components. No runtime dependency, prayer-domain change, reviewed-content edit, or persisted-state change is introduced.

- **Files/contracts to update:** Home composition/components, bilingual i18n, Home tests, responsive browser coverage, design-system documentation, and Phase 05 evidence.
- **Tests/evidence required:** Focused unit/render tests for prayer presentation, Friday boundary logic and variants, Saved accessibility/loading/error states; `pnpm check`; Home browser coverage including narrow layout and axe; screenshots at phone, tablet, and desktop sizes.
- **Supersedes:** Only the earlier always-expanded Friday-card presentation and the device-clock treatment within the Home prayer line.

---

## DEC-052 - Responsive Wird, post-prayer context, and companion depth

- **Date:** 2026-08-11
- **Status:** Approved
- **Owner:** User
- **Related scope:** Focused Phase 05 Home, Friday, and Custom Counter follow-up
- **Context:** The user identified a reversed Arabic Wird arrangement, mobile cards too narrow for reliable reading, a routine card returning after completion, a fixed dark after-prayer surface, and a narrow masbaha entry and screen on wide devices. The Friday Home and companion screens also concealed too much of their already-reviewed contextual information.
- **Decision:** Keep Morning, Evening, and Before Sleep in a stable source and DOM order; use direction-aware CSS placement rather than reversing arrays. Use full-width Wird rows on compact screens and three columns from tablet width. The post-prayer tracker owns next-prayer name, calculated time, and countdown, and uses semantic theme tokens with explicit active/completed icons. A completed featured collection shows the existing short completion acknowledgement and then keeps its routine card hidden. The Home masbaha entry fills the available content width; the dedicated Custom Counter expands only at tablet and desktop widths, leaving Reader geometry unchanged. Friday uses existing reviewed virtue and source copy only: brief disclosure on mobile and direct tablet/desktop presentation.
- **Why:** This improves recognition, reading space, visual continuity across themes, and wide-screen ergonomics without new state, new content claims, prayer-domain changes, or a new dependency.
- **Consequences:** Home and Counter responsive assertions change. The existing Custom Counter is no longer visually identical to the Reader at wide breakpoints, but both retain the same accessible button semantics, progress outline, keyboard support, and compact-screen geometry.
- **Files/contracts to update:** Home, Progress, Friday, Counter, semantic theme styles, responsive tests, and the design-system contract.
- **Tests/evidence required:** Focused Home, Friday, Counter, and Wird tests; narrow/tablet/desktop browser geometry; full local release gate; green GitHub Pages workflow and production SHA smoke verification.
- **Supersedes:** The shared wide-screen Custom Counter geometry in DEC-048 and the next-prayer placement decision in DEC-051. Reader geometry, prayer calculation, and reviewed content contracts remain unchanged.

---

## DEC-053 - Focal Home imagery, prayer-state anatomy, and shared counting feedback

- **Date:** 2026-08-11
- **Status:** Approved
- **Owner:** User
- **Related scope:** Focused Phase 05/07 Home, Reader, Custom Counter, and Friday Salawat follow-up
- **Context:** The user identified a responsive gap above the Home hero, subject loss under image cropping, crowded Wird labels, a detached prayer-time strip, inconsistent Masbaha inputs, a missing arbitrary Salawat target, and a useful ripple that was isolated to one counter flow.
- **Decision:** Home begins flush at the screen edge and uses category-specific compact/wide focal points. A finite decorative particle drift may appear over Home imagery, but never loops and is removed for reduced motion, reduced transparency, and high contrast. The post-prayer rail keeps each calculated time inside its prayer card and differentiates completed, current, next, earlier, and upcoming states through localized text plus repository icons. Counter targets use labelled form semantics and 44px controls; compact targets wrap instead of clipping. The authentic-zikr selector remains a dialog, adds a labelled benefit-aware search, and shows concise zikr-plus-reviewed-benefit choices. Remove Custom Counter Undo and keep Reset as its single secondary action. Friday Salawat defaults to 100, accepts any validated target from 1 to 100,000, and reuses the target picker. The one-shot counter ripple becomes shared across Reader, Custom Counter, and Salawat and is disabled by reduced motion.
- **Why:** These changes preserve devotional focus while improving subject visibility, state recognition, touch ergonomics, form predictability, and responsive use without a dependency or religious-content change.
- **Consequences:** Custom Counter is intentionally larger than Reader at wide breakpoints. Friday target persistence now accepts validated integers rather than three literal values. Existing out-of-range persisted values are clamped safely. Hero particles are decorative and never announced. Prayer calculations, reviewed benefits, zikr text, repetition data, and offline behavior are unchanged.
- **Files/contracts to update:** Home/background components, post-prayer cards, shared counter styles, Reader, Custom Counter and zikr library sheet, Friday Salawat and persistence, shared Select geometry, i18n, motion/design documentation, tests, and release highlights.
- **Tests/evidence required:** Focused component/persistence tests; 320px large-text, phone, tablet, and desktop live-browser checks; reduced-motion verification; full local release gate; green Quality and Pages workflows; production metadata and smoke verification.
- **Supersedes:** DEC-052's detached next-prayer presentation and its earlier Custom Counter desktop size. All prayer calculation, reviewed-content, Reader full-surah, and persistence-merge contracts remain authoritative.
