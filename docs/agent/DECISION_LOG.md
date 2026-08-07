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
