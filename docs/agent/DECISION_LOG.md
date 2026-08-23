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

---

## DEC-054 — Phase 10 system-state recovery and transient connectivity feedback

- **Date:** 2026-08-12
- **Status:** Approved
- **Owner:** User (approved both open decisions: “A and A”).
- **Related phase:** Phase 10
- **Context:** The Phase 10 inventory found silent lazy-content failures, automatic reload recovery, persistent offline clutter, raw remote errors, incomplete permission guidance, and async actions without consistent busy, success, cancellation, or failure feedback.
- **Decision A — connectivity:** Announce and show the complete offline explanation when connectivity changes, then collapse it after five seconds to a compact, user-expandable indicator. Briefly confirm reconnection. Core reading and progress remain available, and account-sync failures can be retried or dismissed without clearing their underlying Settings state.
- **Decision A — content loading:** Never reload automatically after a screen or collection chunk fails. Show a focused recovery state with **Try again** and **Go to Azkar** while preserving local progress. Offer **Refresh app** only after the explicit retry also fails.
- **Supporting decisions:** Static empty states are not live regions. Blocking failures move focus to their recovery heading; non-blocking action outcomes use narrowly scoped polite status or assertive alert messages. Backend error text is never presented directly. PWA updates remain user-controlled, permission denial includes browser-settings guidance, and duplicate async actions are disabled while pending.
- **Consequences:** No persistence schema, sync merge rule, religious content, router, or runtime dependency changes. The hand-written `AppErrorBoundary` remains the last resort for true application crashes; recoverable chunk failures no longer depend on it.
- **Tests/evidence required:** Focused state/retry/permission tests, `pnpm check`, full Playwright, offline/reconnect and denied-permission manual checks, Pages workflow success, and production SHA smoke verification.
- **Supersedes:** The automatic one-time lazy-route reload behavior only. Existing offline-first, update-consent, and local-state ownership contracts remain authoritative.

---

## DEC-055 — Phase 11 responsive/i18n matrix and deterministic browser gate

- **Date:** 2026-08-12
- **Status:** Approved
- **Owner:** User (approved the recommended next decision and instructed the agent to complete Phase 11).
- **Related phase:** Phase 11
- **Context:** The pre-change responsive run passed all 13 desktop assertions, then the Vite HMR server exited and 26 mobile/tablet checks failed with `ERR_CONNECTION_REFUSED`. Static review also found desktop Progress capped at 44rem, new inline Arabic/English JSX copy, repeated `aria-label` use on roleless containers, and routine evidence capture rewriting tracked screenshots during ordinary test runs.
- **Decision:** Run Playwright against one built Vite preview on an isolated strict port, with no hidden CI retries and failure traces retained. Ordinary evidence tests write under Playwright output; committed screenshots change only when `EVIDENCE_DIR` is explicit. Enforce local ESLint rules against inline bilingual conditional copy and roleless `aria-label`, while preserving the documented crash-boundary exception. Complete the current i18n cleanup and widen Progress views at desktop widths without reducing compact text size, reversing semantic order, or changing reviewed content.
- **Responsive contract:** Validate Arabic and English across 320px, 390px, tablet, desktop, 200% zoom equivalence, large app text, short landscape, and both directions. Preserve logical navigation order, mixed-direction isolation, safe-area shell padding, and one reachable navigation variant.
- **Consequences:** E2E startup includes one production build but removes HMR/on-demand-transform contention. A real application failure is no longer silently retried in CI. Progress uses available desktop space while compact and Home-specific reading measures remain bounded. No persistence, prayer calculation, reviewed content, runtime dependency, or route contract changes.
- **Tests/evidence required:** Unit tests for both lint rules; targeted responsive and i18n tests; full `pnpm check`; full retry-free Playwright matrix; Pages build; deliberate compact/tablet/desktop evidence refresh; green Pages workflow and production SHA smoke verification.
- **Supersedes:** The dev-server and implicit-current-screenshot defaults in the test harness only.

---

## DEC-056 — Pre-Phase-12 reproducible toolchain and dependency quarantine

- **Date:** 2026-08-13
- **Status:** Approved
- **Owner:** User (approved all recommended tooling-hardening actions before Phase 12).
- **Related scope:** Pre-Phase-12 release and supply-chain reliability
- **Context:** A fresh local gate was blocked before tests because `@testing-library/user-event@14.6.4` entered the lockfile one day after publication while the repository requires a seven-day package quarantine. The repository also declared pnpm 9.15.0, the Codex runtime used pnpm 11.19.0, and the existing pre-push hook did not run the frozen install, browser suite, or Pages build required by `AGENTS.md`.
- **Decision:** Pin pnpm 11.19.0 in one package metadata source and make local verification and GitHub Actions enforce it. Preserve Node 24 as the supported local major and `.nvmrc` as CI's exact patch source. Pin `@testing-library/user-event` to eligible 14.6.3, preserve the seven-day quarantine with no exception, and require frozen install, quality, full browser, and Pages gates before push. The frozen install activates the tracked hook through `core.hooksPath`. Quality runs on pull requests and direct `main` pushes and additionally runs the production dependency audit. Local and CI Playwright projects use the same pinned browser revisions instead of requiring a separate local Chrome channel. Local runs use two workers to avoid page crashes under sustained Windows desktop load; CI retains three workers. Retries remain disabled everywhere.
- **Consequences:** Dependency adoption can intentionally lag a newly published release by seven days. Local pushes take longer but now match the documented release gate. No runtime dependency, application behavior, persistence, religious content, or deployment topology changes.
- **Tests/evidence required:** Toolchain-verifier unit tests; pinned-toolchain check; frozen install; `pnpm check`; `pnpm test:e2e`; `pnpm build:pages`; `pnpm audit:prod`; green Quality and Pages workflows; production SHA smoke verification.

---

## DEC-057 — Phase 12 semantic remediation and one-line mobile headings

- **Date:** 2026-08-13
- **Status:** Approved
- **Owner:** User (approved the Phase 12 plan and explicitly required phone headings to remain visible, contained, and on one line).
- **Related phase:** Phase 12
- **Context:** The audit found skipped Progress heading levels, an unannounced in-place Library filter, duplicate same-name Benefit headings, mismatched Reader counter instructions, and ambiguous two-pane Settings headings. The user identified the OnePlus Nord 4 as the representative physical Android device and required that semantic remediation must not produce oversized or two-line phone headings.
- **Decision:** Correct semantic heading levels without increasing visual typography. Keep primary phone headings on one line, at or below 20 CSS px in the asserted phone profiles, with truncation only as a last-resort overflow safeguard. Validate 320px, 390px, and a 412×924 representative OnePlus Nord 4 CSS viewport; include Arabic at the OnePlus size. Add polite localized collection-filter announcements, one authoritative Benefit dialog heading, consistent Reader instructions, and a uniquely named Accessibility detail heading. Preserve all other Settings accessible names.
- **Manual evidence:** Automated emulation does not certify TalkBack speech or physical cutout behavior. Those rows remain pending until tested on the real OnePlus Nord 4.
- **Consequences:** Progress visual styling stays materially unchanged except the Week view uses 16 CSS px at the narrowest phone width to keep the complete English label visible. No content, persistence, prayer, route, dependency, or synchronization contract changes.
- **Tests/evidence required:** Focused unit tests, heading/live-region/dialog/Reader browser regressions, one-line English and Arabic viewport checks, `pnpm check`, retry-free full Playwright, Pages build, green workflows, production SHA verification, and dated real TalkBack/cutout evidence before Phase 12 is declared complete.

---

## DEC-058 — Bounded desktop pre-app and zikr-overview measures

- **Date:** 2026-08-13
- **Status:** Approved
- **Owner:** User (explicitly requested implementation and release)
- **Related scope:** Focused Phase 11 responsive follow-up before Phase 13
- **Context:** Desktop onboarding and authentication rendered controls across the entire main area and used flexible spacers to pin primary actions to the viewport bottom. Because the navigation element was hidden without collapsing its grid column, pre-app content was also offset from the viewport center. Zikr collection overviews had no desktop content measure.
- **Decision:** Collapse the rail/sidebar grid column whenever app navigation is absent. Use the existing `--content-form` 40rem measure for all pre-app interactive flows and the complete zikr overview. Preserve compact-phone bottom action placement where it supports reachability, but from the expanded desktop tier group actions with their related controls. Center short pre-app compositions only when viewport height is sufficient; otherwise top-align and scroll. Keep welcome artwork height-responsive rather than fixed.
- **Consequences:** Language, welcome, sign-in, email verification, profile completion, and category overview screens no longer stretch across wide desktops. Mobile remains fluid. No route, persistence, authentication, religious content, dependency, or reader-measure contract changes.
- **Tests/evidence required:** Desktop 40rem cap and centering assertions, short-height Continue visibility and spacing assertions, mobile category-fluidity and overflow checks, full responsive browser matrix, required local release gates, green GitHub workflows, and production SHA verification.

---

## DEC-059 — Apparent Home imagery and prayer-specific post-prayer flows

- **Date:** 2026-08-14
- **Status:** Approved
- **Owner:** User (explicit implementation request)
- **Related scope:** Home responsive follow-up, category controls, and reviewed after-prayer content model
- **Context:** Home imagery was obscured by stacked image-wide scrims, the utility header read as a colored bar, desktop Wird cards did not clearly consume their available grid width, and the shared after-prayer collection mixed universal and timing-specific items even though Home already presented five independent prayer trackers.
- **Decision:** Remove the Home header fill/border/shadow and increase the palm mark stroke. Display Home, Benefits, and Friday images without full-card color or gradient overlays, while placing functional copy on localized contrast surfaces. Keep the three Home Wird cards fluid: full-width rows on compact screens and three equal columns at larger breakpoints. Replace the category overview's full-width routine-mode segment with a compact radio dropdown in the action row. Build five post-prayer flows from one reviewed shared sequence plus source-established additions: Fajr adds the tenfold tahlil and beneficial-knowledge supplication; Maghrib adds the tenfold tahlil; Dhuhr, Asr, and Isha use the shared sequence. Add the three protecting surahs once after every prescribed prayer. Continue excluding the disputed seven-times protection card under the repository's conservative al-Albani-based review rule. Store completion with the existing prayer prefix so Home and Progress update independently.
- **Content corrections:** Use the exact `Allahumma a'inni...` wording in Abu Dawud 1522; record Tirmidhi 3233 as Hasan (Darussalam); preserve exact reviewed Qur'an text through canonical `QURAN_PASSAGES` records.
- **Consequences:** Fajr has 16 complete-mode items, Maghrib 15, and Dhuhr/Asr/Isha 14. The generic Library collection remains a complete reference view; prayer cards are the prescribed timing-aware entry points. No persistence migration or runtime dependency is introduced.
- **Tests/evidence required:** Content invariants for all five flows, isolated prayer-ledger completion, compact dropdown interaction, Home prayer routing, English OnePlus-class mobile and 1440px desktop visual checks, full local release gates, green Quality and Pages workflows, and production smoke verification.

---

## DEC-060 — Text-free Home artwork, unobstructed time scenes, and compact prayer carousel

- **Date:** 2026-08-14
- **Status:** Approved
- **Owner:** User (explicit implementation and release request)
- **Related scope:** Home imagery and compact-screen content order
- **Context:** Removing the hero scrim was insufficient because the time-of-day photograph still spanned the complete tall hero; its horizon and mosque remained behind opaque routine cards while compact users saw mostly empty sky. The Benefits and Friday raster assets also contained baked-in text, and five vertically stacked post-prayer cards delayed access to the Masbaha.
- **Decision:** Give the time-of-day photograph a dedicated responsive scene band before the routine cards. Render it at full opacity with no gradient, tint, particle, or decorative layer above it. Replace the two text-bearing feature images with text-free artwork and keep all visible copy in semantic HTML. Present the five post-prayer cards as a horizontal snap carousel below 640px, retain the grid from 640px upward, and place the Masbaha immediately after the post-prayer group in DOM and visual order.
- **Consequences:** Compact users see the image subject directly, can scan prayer states without a long vertical stack, and reach the Masbaha sooner. The carousel preserves button semantics and prayer-specific routing. The source JPGs containing embedded text are removed; the new PNG artwork remains recoverable from repository history after release. No reviewed content, persistence, prayer calculation, route, dependency, or synchronization contract changes.
- **Tests/evidence required:** Component assertions for the absence of overlay layers and the carousel/order contract; OnePlus-class visual checks for the visible image band, next-card cue, no horizontal page overflow, and Masbaha order; asset-load checks; complete local release gates; green Quality and Pages workflows; and production SHA verification.

---

## DEC-061 — Calendar-safe progress and integrated devotional surfaces

- **Date:** 2026-08-14
- **Status:** Approved
- **Owner:** User (explicit implementation and release request)
- **Related scope:** Pre-Phase-13 UX, accessibility, imagery, Reader, Benefits, and Progress correction
- **Context:** The Progress navigator displayed Hijri labels while month and year statistics still used Gregorian indexes, allowing activity to appear under the wrong Hijri month. Home's previous dedicated image band separated the routine cards from the scene against the user's intended composition. Benefits exposed hadith evidence and its derived summaries as separate filters. Reader progress, title, navigation, counter geometry, overflow menu, and reference sheet needed a consistent compact hierarchy.
- **Decision:** Keep completion storage on stable local Gregorian day keys, but construct actual Umm al-Qura month/year date ranges before filtering or presenting Hijri statistics. Every Progress view shares the same normalized completion index and configured devotional-day boundary; Progress surfaces are opaque and the duplicate Settings entry is removed. Home returns the routine and Today’s Wird cards to a responsive overlay over the full-opacity scene without a global scrim. Benefits exposes only Qur’an and Hadith filters; the 30 reviewed derived summaries remain traceably nested under their authenticated hadith without changing their wording or evidence links. Reader shows localized percentage, completed/total, and a concise per-zikr title; navigation aligns to the reading viewport; the counter uses a clipped internal fill; visible actions are excluded from overflow; and long reference text uses explicit progressive disclosure. Replace the hand and framed-mosque artwork with text-free edits.
- **Accessibility:** Maintain 44px minimum targets, visible focus, logical RTL positioning, Arabic numerals, non-color status text, named progress semantics, opaque contrast surfaces, keyboard navigation, focus-managed dialogs, and reduced-motion behavior. One-line titles use visual truncation only while retaining the full accessible value. The quiet-garden visibility control lives on the canonical Progress page, preserving preference access without restoring the removed Settings duplicate.
- **Consequences:** DEC-060's dedicated scene band is superseded by the integrated overlay composition. The earlier Reader rule prohibiting compact numeric session labels is superseded. Reviewed Qur’an, hadith, zikr wording, repetition counts, evidence relationships, completion storage schema, prayer calculations, offline behavior, and synchronization ownership remain unchanged.
- **Tests/evidence required:** Hijri range and cross-month leakage regressions; Benefits grouping tests; Reader/menu/counter/reference tests; OnePlus-class and 1440px browser inspection; complete local release gates; green Quality and Pages workflows; and production SHA verification.

---

## DEC-062 — Stable reading controls and quieter devotional hierarchy

- **Date:** 2026-08-14
- **Status:** Approved
- **Owner:** User (explicit implementation and release request; Mushaf-mode implementation remains pending a separate approval)
- **Related scope:** Home hero, Reader long-form behavior, Benefits index, collection controls, Masbaha, and Friday Salawat
- **Context:** Home's transparent utility header still occupied a separate strip instead of sitting on the scene, desktop hero cards were visually uneven, and compact hero edges were too sharp. In long Surahs the navigation moved with the text and the counter was deferred to the end, while focusing the reading region could expose a clipped horizontal outline. Benefits repeated category labels and foregrounded every derived hadith benefit at once. Target presets competed as many buttons, and the dedicated counters did not share the Reader's hierarchy or canvas-counting behavior.
- **Decision:** Make the Home utility header a transparent sticky overlay, stretch the two desktop hero surfaces to equal height, increase their internal rhythm, remove the redundant routine-mode hint, and use the shared large compact radius. In Reader, keep the logical-side navigation centered against the reading viewport and keep the existing counter visible in its established footer position from the first Mushaf page; only Quran content scrolls. Suppress the reading-region outline without suppressing interactive focus. Keep only Qur'an and Hadith as Benefits filters, use concise source footers, collapse derived benefits under one counted disclosure, and never invent missing narrator metadata. Put the collection mode filter between Continue and Reset. Replace inline counter-target presets with one accessible radio dropdown plus a custom-target dialog. Masbaha and Friday Salawat place evidence first and allow non-interactive canvas space to count while protecting controls.
- **Mushaf boundary:** A true Madinah-Mushaf presentation is feasible only as a separately approved, source-attributed reading mode using authoritative page layout/font data and an accessible semantic-text alternative. This decision does not change Quran text, page metadata, or content sources.
- **Consequences:** The long-Surah floating page/counter shortcut and end-only counter behavior are removed. Existing counter appearance, side-arrow appearance, completion semantics, canonical Quran bytes, persistence keys, prayer calculations, and synchronization ownership remain unchanged. Hadith narrator labels remain absent until independently reviewed source data exists.
- **Tests/evidence required:** Focused component tests, stable long-Surah control-position browser regression, OnePlus-class and desktop visual inspection, `pnpm check`, retry-free full Playwright, Pages build, green Quality and Pages workflows, and production SHA verification.

---

## DEC-063 — Compact discovery controls and one counter-session language

- **Date:** 2026-08-14
- **Status:** Approved
- **Owner:** User (explicit implementation and release request)
- **Related scope:** Library, Home, Progress, Benefits, Surah Reader, Masbaha, and Friday Salawat
- **Context:** Library scope tabs consumed a second mobile row; radio menus used a physical-left dot that collided with RTL copy; the Progress visibility banner duplicated a removed Settings concern; the current Wird used fixed midnight colors; Home retained excessive header clearance and unequal desktop columns; Benefits repeated derived disclosures and separators; Surah metadata duplicated the Reader title; and dedicated counters still used separate visual hierarchies.
- **Decision:** Put Collections/Saved in one radio menu beside Search. Use logical positioning, a checkmark, and semantic primary selected state for every radio menu. Remove the Progress visibility banner and always expose the canonical Progress views; legacy visibility values no longer hide Home's current Wird. Theme the current Wird and its states entirely through semantic tokens. Constrain the Home hero to the dashboard measure, use equal two-column cards with stretch height, and reduce top clearance at every responsive tier. Remove derived-benefit disclosures and footer separators from the Benefits index while preserving reviewed source data. Remove the redundant Surah-name pill. Give Masbaha and Friday Salawat the Reader's header-action, progress, centered-text, shared-counter, and compact-control hierarchy; move evidence to a focus-managed header modal.
- **Supersedes:** DEC-061's canonical Progress-page visibility control and DEC-062's collapsed derived-benefit disclosure. The underlying reviewed derived-benefit records and legacy persisted visibility field remain readable for compatibility but do not drive these surfaces.
- **Accessibility:** Menus expose radio roles and checked state; selected state is visible without relying on color; controls retain 44px targets; logical positioning supports RTL; progress bars have names and values; modals are focus managed; whole-canvas counting excludes all interactive descendants; narrow layouts reflow without horizontal page scrolling.
- **Consequences:** No religious wording, evidence record, completion key, prayer calculation, synchronization owner, or runtime dependency changes. Friday Salawat persistence keeps its existing key. The Home current Wird is consistently available even for installations carrying an old disabled visibility preference.
- **Tests/evidence required:** Focused component tests; updated Library/Progress/Benefits/counter Playwright flows; 320px, OnePlus-class 412×924, and 1440px browser inspection in light and midnight themes; `pnpm check`; retry-free Playwright; Pages build; dependency audit; green workflows; and production SHA verification.

## DEC-064 — Design-consistency audit and the Phase 15–20 remediation program

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** User (explicit request to document the audit and work through phases)
- **Related scope:** CSS build configuration, overlay primitives, menus, elevation tokens, counter surface, colour/radius/spacing tokens, motion system, build weight, repository hygiene
- **Context:** A consistency review of padding, radius, colour, effects, animation and dropdown styling/position at commit `54b2b14` produced 36 findings, recorded in `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`. The review combined source analysis with live computed-style probing of the running application in Light, Midnight and Dark. Its central result is that `src/styles/tailwind.css` excludes `src/app/components/ui/**` from the Tailwind source scan and then attempts an inert re-include, so 41 utility classes used only inside the design-system primitives are never compiled. This is verified both in `dist/assets/*.css` and against the live stylesheet. The user-visible consequences include a destructive-action confirmation dialog that renders at the shell's top-left at full width with a fully transparent scrim, transparent modal and drawer scrims throughout, menu items without padding or indicator gutters, and an unstyled OTP field on the sign-in path. Separately, `--ds-shadow-raised` carries a light-theme value in every theme and is imperceptible on the dark grounds; `.adaptive-counter-surface` is defined twice with conflicting values, shipping an orphaned `backdrop-filter` over an opaque surface; five dropdown call sites each restyle the menu surface differently; 251 raw palette classes bypass the token layer and therefore bypass the colour-blind and high-contrast modes; the `favorite-pop` keyframes the motion contract depends on do not exist; and roughly 24MB of unreferenced imagery is deployed on every release, outside the reach of the bundle-budget gate.
- **Decision:** Record the audit as a durable findings register and split remediation into six scoped phases rather than one change: Phase 15 repairs CSS delivery and adds the geometry regression coverage that automated accessibility scanning cannot provide; Phase 16 moves the elevation tokens into each theme block and gives every shared surface exactly one definition; Phase 17 unifies the menu surface, item anatomy and direction handling behind a Radix `DirectionProvider`; Phase 18 removes unreferenced assets from the deploy path and extends the budget gate to the whole output tree; Phase 19 migrates colour, radius and spacing back onto the documented scales and lands ESLint rules enforcing them in the same change; Phase 20 makes the motion contract real and splits `theme.css`. Phase 15 runs first because its root cause produces several findings the later phases address; measurements are retaken after it lands rather than carried forward from the audit. Phase 18 is independent and may run in parallel.
- **Open decision:** F15 — the counter's shipped radius (38px in Reader, 44/52/72px on Masbaha) contradicts the 24px stated in `DESIGN_SYSTEM.md`. Phase 16 is blocked on choosing whether the document or the implementation is authoritative. Either is defensible; the change-control rule requires the document and its regression coverage to be updated in the same change as the code.
- **Explicitly not changed:** The colour token values are correct and measured to pass AA with headroom in all three themes (foreground/background 16.38–17.13, control boundaries 3.57–4.39); they are not to be rebalanced. Reviewed azkar, Qur'anic text, benefits, references, translations, transliterations, repetition counts and attribution are untouched throughout. Completion storage keys, prayer calculations, offline behaviour, synchronization ownership and the audio manifest version are unchanged. The 500ms completion acknowledgement keeps its exact timing including under reduced motion. `docs/agent/evidence/screenshots/**` remains committed evidence.
- **Consequences:** Two user-visible behaviour changes are accepted. `SelectItem` moves its check indicator to logical start, matching the documented contract and `DropdownMenuRadioItem`; in RTL these controls currently place it on opposite sides. Entrance animations shorten from 500ms/400ms to the documented 240–300ms band, most noticeably on the four Progress views. Restoring the missing utilities may reveal focus outlines that were always intended but never rendered; these are to be kept, not suppressed.
- **Tests/evidence required:** A build check failing when primitive-only utilities stop compiling; Playwright assertions on dialog centring, scrim opacity and menu viewport bounds; RTL menu alignment and item target-size tests; a counter `backdrop-filter` assertion; re-measured contrast tables after the colour migration; lint rules demonstrated failing on deliberate violations; a `public/` reference map before any deletion; offline PWA verification after the asset cleanup; a built-CSS diff proving the `theme.css` split changed nothing; and a counter-session profile before any memoisation. Per phase: `pnpm check`, `pnpm test:e2e`, and `pnpm build:pages` where the build output changes.

## DEC-065 — CSS budget recalibration and the counter radius contract

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** User (explicit decision during Phase 15)
- **Related scope:** `scripts/check-bundle-budget.mjs`, `docs/DESIGN_SYSTEM.md` counter geometry, Phase 15 and Phase 16
- **Context:** Two decisions arose during Phase 15 that the agent is not permitted to take alone. First, repairing the Tailwind source scan (DEC-064 / F01) restored 126 CSS rules that the design-system primitives require, growing `index.css` from 125.08 kB to 140.78 kB raw and 21.84 kB to 23.98 kB gzip, against limits of 134 kB and 23 kB. Removing the unused `scroll-area` component recovered only 0.47 kB, so the overage is the genuine cost of the missing rules rather than waste. The JavaScript budgets and the 200 kB initial-route gzip budget continued to pass. `AGENTS.md` forbids increasing bundle budgets to obtain a passing result, so the change required an explicit decision. Second, F15 recorded that `DESIGN_SYSTEM.md` specifies the counter fill is clipped to a 24px radius while the application ships 38px in Reader and 44/52/72px across the Masbaha breakpoints, leaving the document, the two stylesheets and the screen in disagreement and blocking Phase 16.
- **Decision:** Raise the CSS budget limits to 150 kB raw and 26 kB gzip. The previous numbers were calibrated against a build that was silently omitting required CSS and were therefore never a valid ceiling on a correct build; the new numbers preserve roughly the same proportional headroom over the corrected build. They are not to be raised again to make a build pass — the CSS is to be reduced instead. For F15, the document is authoritative: the counter becomes a 24px rounded rectangle at every breakpoint, restoring DEC-003's stable-surface intent.
- **Consequences:** The counter, the app's most-used control, changes shape from a pill to a rounded rectangle at every size in Reader, Masbaha and Friday Salawat. Phase 16 implements this by keeping the `ZikrComponents.css` definition, deleting the conflicting `theme.css` copy along with its orphaned `backdrop-filter`, and replacing the 38/44/52/72px literals so radius follows the geometry scale while the documented dimensions are unchanged. `DESIGN_SYSTEM.md` needs no counter-radius edit because the implementation is moving to match it; its responsive size table and the Reader contract are re-verified against the result in the same change. Phase 16 is unblocked.
- **Tests/evidence required:** Bundle budget passing at the new limits with the corrected build; `scripts/check-css-utilities.mjs` proving the restored utilities are present; counter radius assertions at compact, tablet and desktop widths; counter `backdrop-filter` asserted as `none`; and before/after counter captures in Light, Midnight and Dark.

## DEC-066 — Deploy-path cleanup, asset preservation, and a whole-output budget gate

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed with Phase 18)
- **Related scope:** `public/`, new `design-sources/`, `.gitignore`, `scripts/check-bundle-budget.mjs`, `vite.config.ts` precache configuration, and the four `<img>` call sites
- **Context:** F24 recorded roughly 24 MB of imagery deployed on every release with no code path referencing it, and F25 recorded that `scripts/check-bundle-budget.mjs` iterates `dist/assets` only, so everything copied verbatim from `public/` escaped the gate entirely. A file-by-file reference map over all 114 files in `public/` confirmed this and corrected two errors in the original audit's reasoning. First, five root PNGs (`Morning.png`, `Evening.png`, `Before Sleep.png`, and the two palm-tree images, about 7 MB) initially appeared referenced because `vite.config.ts` named them — but only inside `globIgnores`, where an asset is listed precisely to keep it out of the precache. That is the opposite of a reference. Second, `512.png` initially appeared unreferenced because the whole of `vite.config.ts` had been excluded from the search, when its `manifest.icons` block is a genuine consumer. The corrected map found 47 unreferenced files totalling 30.8 MB. It also surfaced a hazard the audit had only predicted in the abstract: the 15 files that were **not** tracked by git — because F34's blanket `*.png` ignore rule hid them — were exactly the uncompressed master images and design references, meaning they existed in one copy each and deleting them would have been unrecoverable. Content hashing showed those 15 files deduplicate to 8 unique images, and that `friday.png` and `friday-master.png` are different images rather than duplicates.
- **Decision:** Separate preservation from deployment. Move `azkar-responsive-assets/` and the four background masters out of `public/` into a new `design-sources/` directory that Vite does not copy, after proving by SHA-256 that every hash in `public/assets/backgrounds/Originals/` also exists inside the moved tree, so removing the duplicate directory loses nothing. Delete only files that are both unreferenced and tracked in git, and therefore recoverable: the five root PNGs, the superseded `mosque_prophet.jpg`, the nine-file `webp/` generation, the three `*_sky.webp` images, and the unused `islamic-corner-pattern.svg`. Keep `account-deletion.html` and `landing/index.html` despite both being unreferenced from application code — the first is the account-deletion page required by app-store policy and the second is a published redirect, and both are externally linked URLs rather than dead assets. Narrow `.gitignore`'s blanket `*.png` to the directories that actually produce disposable screenshots, so product imagery is committed normally in future. Extend the bundle budget with a whole-tree total ceiling of 8 MB and a 2 MB single-file ceiling, both walking all of `dist/` rather than `dist/assets`. Remove the eleven now-dead `globIgnores` entries. Add `loading="lazy"`, `decoding="async"` and true 1254×1254 intrinsic dimensions to the three lazy `<img>` elements, leaving the LCP hero eager with `fetchpriority="high"`.
- **Deferred:** F27, the full-viewport `mix-blend-mode: overlay` noise layer, is **not** changed. The phase brief requires a measurement rather than an assumption, and this environment cannot produce one: the browser pane does not composite, with `requestAnimationFrame` delivering zero frames in four seconds, so any paint or scroll-cost figure would be fabricated. It carries forward to Phase 20, which already owns the remaining motion and structural work.
- **Preservation risk to resolve:** `design-sources/` is gitignored, so the 8 unique master images remain untracked and exist only on this machine. That is no worse than before — they were untracked inside `public/` too — but it is now a deliberate, recorded state rather than an accident. They are the source from which the deployed AVIF/WebP responsive set was generated. Committing them would add roughly 12 MB to every clone permanently and is difficult to reverse, so the choice is left open rather than taken silently.
- **Consequences:** `dist/` falls from 36 MB to 6.2 MB, a 30 MB reduction, larger than the 24 MB the audit projected because the audit had not yet accounted for the five root PNGs. No application behaviour, reviewed content, image the app actually displays, focal point, responsive source set, audio caching strategy, or persistence key changes. The precache is unchanged in composition at 129 entries, every one of which resolves to a real file on disk. The two remaining large assets, `images/mosque_prophet.png` and `images/benefits_zikr.png` at about 1.6 MB each, are genuinely referenced and now dominate the precache at 3.3 MB of 5.8 MB; re-encoding them is the next available win but touches reviewed artwork and is not taken here.
- **Tests/evidence required:** The reference map itself, retained as phase evidence; SHA-256 proof that the deleted duplicate directory's content survives the move; the bundle gate demonstrated failing when a source tree is dropped back into `dist/`; precache manifest validated entry-by-entry against disk; `e2e/offline-core.spec.ts` and `e2e/pwa-update.spec.ts` passing; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-067 — Per-theme elevation and single ownership of the counter surface

- **Date:** 2026-08-15
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed through the phase programme; counter radius previously decided in DEC-065)
- **Related scope:** `src/styles/theme.css`, `src/app/components/ZikrComponents.css`, `src/app/components/ZikrComponents.tsx`, and fourteen ad-hoc shadow call sites
- **Context:** F11 recorded that `--ds-shadow-raised` was a single value shared by every theme — `rgba(0,0,0,0.05)` and `rgba(0,0,0,0.03)` — carried over from the light-mode glass card. A 5% black shadow is imperceptible on the Midnight ground (`#0a1228`), so all 66 `shadow-raised` surfaces rendered flat and relied entirely on `--border-subtle`, which measures 1.88–2.40:1 against the card. That is the likely reason fourteen hand-written `shadow-xl`/`2xl`/`lg` usages had accumulated: people compensating for a token that did nothing on their screen. F12 recorded that `.adaptive-counter-surface` was declared in two stylesheets with conflicting values — 38px translucent glass in `theme.css`, 24px opaque in `ZikrComponents.css` — with the winner depending on bundler CSS ordering. The shipped result was a hybrid: the opaque background from one file with the other file's `backdrop-filter: blur(24px)` leaking through, i.e. a 24px GPU blur behind a fully opaque surface, costing paint time for no visual effect and creating an unexpected stacking context and containing block.
- **Decision:** Define `--ds-shadow-raised` and `--ds-shadow-overlay` per theme. The dark palettes take several times the alpha of the light one because a shadow is read against its own ground: dark and Midnight move to `0.4`/`0.55`, high contrast to `0.75`/`0.9`, and light to `0.05`/`0.12` — raised from the old value but deliberately restrained, since the alpha that reads as depth on a dark ground reads as soot on `#f8f5f0`. Give `ZikrComponents.css` sole ownership of the counter surface, its states, the tap ripple, the ripple keyframes, the pulse ring and the ripple's reduced-motion rule; delete every counterpart from `theme.css`. Apply DEC-065's 24px radius to the counter at all four size steps, and to Previous/Next, which the Reader contract requires to share the counter's radius and which would otherwise be left at 20px against a 24px counter. Move the pulse ring's duration and easing out of an inline style in `ZikrComponents.tsx` and into the `.pulse-ring` class, carrying the values over unchanged because Phase 20 owns motion timings. Retire the fourteen ad-hoc shadows onto the two tokens, mapping dialogs, sheets, menus, floating surfaces and the device frame to overlay, and cards, rows and buttons to raised.
- **Consequences:** Cards visibly separate from the ground in Midnight and Dark for the first time; the change is an 11× increase in shadow alpha there and is intended to be noticeable. The counter changes shape from a pill to a 24px rounded rectangle at every breakpoint, as does Previous/Next; dimensions are unchanged. `.glass-card`/`.wird-card` now consume the raised token instead of duplicating per-theme literals, so they cannot drift from other cards again. One retired shadow, `shadow-2xl` on `.app-shell`, turned out never to have rendered: `theme.css` sets `box-shadow: none` on that element both at ≤599px and at ≥600px, so it was dead at every viewport width and was removed rather than remapped. `.counter-ring-stage` was found to be unreferenced and went with the deleted block. The `!important` on the pulse ring's breakpoint width/height is retained and documented: `ZikrComponents.tsx` sets those two properties inline from the measured counter size, and inline styles outrank a class. No colour token, counter dimension, motion timing, reviewed content or persistence key changes.
- **Tests/evidence required:** Counter asserted at 24px radius with `backdrop-filter: none`; a single `.adaptive-counter-surface` definition across the codebase; resolved shadow alpha measured per theme; no `shadow-xl`/`2xl`/`lg` remaining outside a documented exception; reduced-motion behaviour unchanged; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-068 — One menu surface, one item anatomy, logical alignment

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed through the phase programme)
- **Related scope:** `src/app/components/ui/dropdown-menu.tsx`, `src/app/components/ui/select.tsx`, six menu call sites, and `src/app/components/LayoutShells.tsx`
- **Context:** F06 recorded that every `DropdownMenuContent` call site restyled the surface — radius 20px against 8px, padding 6px against 4px, three different elevations, offsets of 4 and 8 — so the same control looked different on each screen. F07 recorded that `Select` and `DropdownMenu` were two design languages for one interaction pattern, disagreeing on radius, border, elevation, item radius, and, most sharply, the side the selected checkmark sits on: `DESIGN_SYSTEM.md` requires a logical-start checkmark and `DropdownMenuRadioItem` complied, while `SelectItem` placed it at the logical end, putting the two controls' checkmarks on opposite sides of an Arabic screen. F08 recorded that only `DropdownMenuItem` carried `min-h-11`, so checkbox, radio and sub-trigger items met the 44px target only where a call site happened to add its own padding. F09 recorded two contradictory RTL alignment patterns. F10 recorded that no menu set collision padding.
- **Correction to the audit's F09 reasoning:** the audit inferred that because no `DirectionProvider` was mounted, Radix defaulted to LTR and the manual flip in `CustomCounterScreen` was the correct one. That inference was wrong. Every `DropdownMenu` root already passes `dir={direction}`, so Radix resolved logical alignment correctly everywhere, which made the manual flip a **double flip** and the only incorrect site. The finding stands — two contradictory patterns, one of them wrong — but the culprit was the opposite of the one named. Verified by test rather than inspection: at desktop width the library scope menu now pins its logical-end edge to the trigger's right in English and to the trigger's left in Arabic.
- **Decision:** Put the correct values in `DropdownMenuContent` once — overlay radius, `p-1.5`, `border-border-control`, `shadow-overlay`, `sideOffset={8}`, `collisionPadding={8}` — and extract them as a shared `menuSurface` string that `DropdownMenuSubContent` and `SelectContent` also use, so the three cannot drift apart again. Strip the geometry overrides from all six call sites and the three item call sites, leaving only `align`, `min-w` where a menu needs a wider measure, and genuine typography. Move `SelectItem`'s indicator to the logical start and give it the same item radius. Add `min-h-11` to the checkbox, radio and sub-trigger items. Remove the double flip in `CustomCounterScreen`. Convert the remaining physical utilities in the primitive — `data-[inset]:pl-8`, `ml-auto` on the shortcut and sub-trigger chevron — to their logical equivalents, and mirror the sub-trigger chevron with `data-rtl-flip` like every other directional icon. Give the sidebar language control the localized `aria-label` and focus ring its theme sibling already had (F31).
- **Consequences:** One user-visible change beyond consistency: in `Select`, the checkmark moves from the trailing edge to the leading edge, which is what the design system always specified. Menu radius grows from 20px to 24px on the four menus that had been overriding it and from 8px to 24px on the two that had not. No menu contents, options, ordering, roles or checked state change. DOM and tab order are unchanged in both languages.
- **Tests/evidence required:** An RTL/LTR mirroring assertion at desktop width where collision shifting cannot confound the measurement; a surface assertion pinning radius, padding and elevation; a 44px assertion across every item in a menu; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-069 — Token discipline, named exceptions, and a documented compact spacing sub-scale

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed through the phase programme)
- **Related scope:** All of `src/app`, `src/styles/theme.css`, `scripts/eslint-rules.mjs`, `eslint.config.js`, and the geometry contract in `docs/DESIGN_SYSTEM.md`
- **Context:** F17 recorded 252 raw Tailwind palette classes across 17 files plus raw hex in four components. The consistency argument was the lesser one: `high-contrast`, `deuteranopia`, `protanopia` and `tritanopia` all work by redefining `--primary`, `--accent` and `--ring`, so every hardcoded `amber-500` was a place those modes could not reach. F13 recorded arbitrary radii drifting off the documented scale. F14 recorded 175 spacing utilities on 2 px half-steps that the documented set omits.
- **Decision — colour:** Map `amber-*` to `primary` (158), `emerald-*` to `success` (66), and the remaining 27 to the token that carries their meaning — `info` for the informational marker, `success`/`warning` for the counter ring states, `muted-foreground` for inactive marks, `primary-foreground` for text on gold. Many amber usages were hand-rolled light/dark pairs such as `text-amber-900 dark:text-amber-200`; that is exactly what a theme-aware token does on its own, so 40 now-redundant `dark:` variants collapse away. Add three tokens rather than inventing colours at call sites: `--evening` (decorative, pairing with the `--sleep` token that already existed but had never been wired to Tailwind, which is why the code reached for raw indigo), `--on-media-surface` for panels sitting on the hero photography, and `--brand-hero` for the theme-independent navy band that `DESIGN_SYSTEM.md` already defines. Move the Reader's eight per-category accent pairs out of an inline `switch` of 32 hex literals in `ReaderScreen.tsx` into CSS keyed by `[data-reader-category]`, so the palette lives with the rest of the palette. Give the garden artwork seven named decorative tokens rather than forcing illustrations onto `--primary`, which would make the garden monochrome. Hold the confetti ramps as two comma-separated decorative tokens read at call time; the only hex remaining in components are the fallbacks those reads take when the stylesheet is unavailable, which is what a fallback is.
- **Decision — radius:** Map 17 arbitrary values onto the scale. Where a value legitimately sits outside it, name it rather than disabling the rule: `--ds-radius-micro` (2 px) for heat-map day cells, which are about 10 px square and would be nearly circular at the 8 px small radius, and `--ds-radius-device` (2.5 rem) for the phone-canvas bezel, now shared with `.app-shell`, which is device chrome rather than a product surface. No `eslint-disable` comments were needed anywhere.
- **Decision — spacing (F14):** **Amend the contract rather than the code.** The 175 half-step usages are coherent and deliberate — `gap-1.5` between an icon and its label, `py-2.5` in a compact row — and at the scale of a 20 px badge the next full step is a 100% jump. Rewriting 175 paddings would risk the 320 px no-overflow guarantee and the 44 px target rule for changes nobody can see. `DESIGN_SYSTEM.md` now documents a compact sub-scale (2, 6, 10, 14, 18 px) for spacing _inside_ a component, while page gutters, section rhythm and gaps between cards stay on the full 4 px set. This closes F14 by fixing the disagreement in the direction the evidence points.
- **Decision — enforcement:** Add `azkar/no-raw-palette-color` and `azkar/no-arbitrary-radius` to the existing rule plugin, both reading class strings through template literals, conditionals, logical expressions, arrays and `cn()` calls. `rounded-[var(--token)]` and `rounded-[inherit]` are the supported escape hatches. Seventeen unit tests cover the patterns, and both rules were demonstrated failing on a deliberately introduced violation and passing after revert.
- **Consequences:** The accessibility modes now reach every migrated surface — measured on an element that was `bg-amber-500`, the background is gold by default, `rgb(43,127,255)` under protanopia and `rgb(255,215,94)` under high contrast. Contrast against the card was re-measured in all three themes with a floor of 4.77 (primary 6.24–7.55, success 7.01–8.63, info 6.44–7.10, warning 4.77–5.92, sleep 5.23–7.10, evening 5.18–7.92). The two lint rules immediately caught three violations the migration itself had missed, including an `accent-amber-500` that the migration regex omitted because its utility list lacked `accent`. No reviewed content, copy, layout, dimension or persistence key changes.
- **Tests/evidence required:** Contrast re-measured per theme; a live demonstration that a migrated element responds to the colour-blind and high-contrast modes; unit tests for both lint patterns; the rules shown failing on a deliberate violation; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-070 — Motion system repair, and what was deliberately left undone

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed through the phase programme)
- **Related scope:** `src/styles/theme.css`, 12 component files, `vite.config.ts`, `docs/DESIGN_SYSTEM.md`, and the removal of `src/app/components/ui/scroll-area.tsx`
- **Context:** F18 recorded that `@keyframes favorite-pop` did not exist anywhere, so the motion contract's "save heart pops once" did nothing in three components. F19 recorded that the motion tokens were defined but never exposed to Tailwind, so components used raw `duration-*` utilities. F20 and F21 recorded entrance animations outside the documented 240–300ms band on the wrong easing, and a `slide-up` that only animated opacity. F23 recorded `transition-all` in 19 files. F30 recorded two undocumented breakpoints. F36 recorded documentation drift.
- **Decision — motion:** Define the missing `favorite-pop` keyframes at the timing table's small state-change band, restrained scale only, and resolve both `.favorite-pop` and `.element-pop` to it so the two names cannot diverge. Give `slide-up` the translate its name promises. Add `--motion-duration-entrance: 260ms` and move `.fade-in` and `.slide-up` onto it with the enter easing; `.fade-in` is on all four Progress views, so this was the slowest entrance in the app on the most repeatedly opened screen. Expose the motion scale to Tailwind as `--transition-duration-*` and `--ease-*`, then migrate 17 raw `duration-150/200/300` utilities onto `duration-fast` and `duration-standard`.
- **Decision — what is NOT changed, and why:** `duration-500`, `duration-700` and `duration-1000` stay as they are. They are progress fills, a chart grow and a caret blink that belong in the contract's 440–600ms emphasis band, and `--motion-duration-emphasis` is currently 360ms — below that band. Mapping them onto the token would visibly speed up progress bars to fix a naming problem. **The token/contract mismatch is itself a finding** and is recorded rather than papered over.
- **Decision — breakpoints (F30):** Document rather than move. The four tiers govern the shell — which navigation mounts, how the page grid is laid out. Components may additionally step at 768px and 1024px, as the counter, Home grid and scrollbar treatment do; a control can outgrow its size before the whole shell changes shape. Moving them to tier boundaries would change when the counter grows, which is a visual change made to satisfy a rule rather than a need. `DESIGN_SYSTEM.md` now states the distinction.
- **Decision — dead code (F36):** `ui/scroll-area.tsx` was imported by nothing; it and its four `[data-slot="scroll-area-*"]` rules are removed, and the Tailwind source allow-list no longer names it. The `vite.config.ts` comment claiming Tailwind "is not being actively used" — a Figma Make scaffold leftover — is corrected.
- **Deferred, with reasons:**
  - **F27 (noise overlay).** Still unmeasurable here: `requestAnimationFrame` delivers zero frames in three seconds because the browser pane does not composite. The brief requires a measurement rather than an assumption, so the overlay is untouched for a second phase running. It needs a profile on real hardware.
  - **F28 (memoisation).** Same obstacle. The brief explicitly forbids speculative memoisation and requires a profile of a counting session first; a profile is not possible without a compositing browser.
  - **F23 (transition-all), partially.** 7 of 33 sites narrowed to explicit property lists. The remaining 26 each need their animated properties verified individually, and a blind rewrite risks breaking hover and press behaviour for no measurable gain.
  - **F35 (theme.css split).** Not attempted. It is a pure file move whose only risk is cascade order, and mixing a 1,400-line reorganisation into the same commit as behavioural motion changes would make both unreviewable. It deserves its own change, verified by diffing the built CSS before and after.
- **Consequences:** The save microinteraction animates for the first time. Entrance animations shorten from 500ms and 400ms to 260ms, most noticeably on the four Progress views. Reduced motion continues to collapse all of it — verified live, where the environment's forced reduced-motion setting resolved these animations to 0.01ms. The 500ms completion acknowledgement is untouched.
- **Tests/evidence required:** Animation names resolving where they previously did not; token values resolving; reduced motion still collapsing; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-071 — Emphasis timing follows the contract, and the design masters are versioned

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit decision on both open questions raised in the Phase 20 report)
- **Related scope:** `src/styles/theme.css`, `src/app/components/ZikrComponents.css`, four component files, `.gitignore`, and `design-sources/`
- **Context:** Two questions were left open rather than decided unilaterally. First, `--motion-duration-emphasis` was 360ms while `DESIGN_SYSTEM.md` documents an emphasis band of 440–600ms; because the token disagreed with the contract, the `duration-500` and `duration-700` sites that belong in that band had been left off the token rather than sped up to match a value that was itself wrong. Second, the eight uncompressed masters moved out of `public/` in DEC-066 were gitignored, so they existed in exactly one copy each, on one machine, and are the source from which the deployed AVIF/WebP set was generated.
- **Decision — timing:** The document is authoritative. `--motion-duration-emphasis` moves from 360ms to **500ms**, inside the documented band. 500 is chosen deliberately over the band's midpoint: the three existing `duration-500` sites — two progress-bar fills and the completion card — keep their exact current timing while moving onto the token, so the only site whose feel changes is the one that was genuinely out of band at 700ms. `counter-complete-pop` is wired to the same token, which preserves the protected 500ms completion acknowledgement exactly rather than restating it as a literal. The one remaining `duration-[360ms]`, a time-of-day background crossfade, belonged to no band at all and moves to `duration-entrance` (260ms). `duration-1000` stays raw: it is the OTP caret's blink cycle, an animation period rather than a transition, and the motion bands do not govern it. The 600ms counter readiness pulse and the 560ms tap ripple are left alone — both already sit inside the band, and the contract names the 600ms pulse explicitly.
- **Decision — masters:** Track `design-sources/`. Before committing, the tree was deduplicated so the repository does not carry redundant bytes: the entire nested `public/` subtree was removed after all 28 generated AVIF/WebP files were verified byte-identical to the tracked copies under `public/assets/backgrounds/`, and three of the four `Originals/*.png` were dropped after proving them byte-identical to their `*-master.png` counterparts. `friday` was the exception — its original and its master are different images, so both are kept, the original renamed `friday-original.png` to say so. The result is 17 MB reduced to 13 MB, 21 files, eight PNGs with eight distinct hashes. A `design-sources/README.md` records the layout, why the generated output is deliberately absent, and where new artwork goes.
- **Consequences:** One visible timing change: the Progress bar-chart grow shortens from 700ms to 500ms. Everything else keeps its current feel. The repository grows by roughly 13 MB permanently, which is the accepted cost of the artwork no longer having a single point of failure. `design-sources/` remains outside the deploy path, so the bundle budget and the shipped output are unaffected — verified by rebuilding after the change.
- **Tests/evidence required:** Byte-comparison proof for every file removed during deduplication; the emphasis token resolving to 500ms in the built CSS and `duration-emphasis` generating as a utility; the bundle budget unchanged; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-072 — Product illustrations move to AVIF/WebP, halving the precache

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to implement the remaining recommendation)
- **Related scope:** `public/images/`, `src/app/components/ProductImage.tsx`, `HomeCards.tsx`, `HomeScreen.tsx`, `design-sources/`, `e2e/product-images.spec.ts`
- **Context:** After DEC-066 removed the unreferenced assets, the two remaining large files dominated what was left: `images/mosque_prophet.png` and `images/benefits_zikr.png`, 1254×1254 PNGs at roughly 1.7 MB each, together 3.3 MB of a 5.8 MB precache. Both are genuinely referenced, and both are decorative illustrations that render at a few hundred CSS pixels — a 64 px avatar in the compact Friday card, a ~200 px panel in the expanded one, and a card background on Home. The earlier phase reports flagged re-encoding as the largest remaining win but did not attempt it, on the grounds that it touches reviewed artwork.
- **Decision:** Encode both to AVIF and WebP at the **same 1254×1254 dimensions** — no resize, no recrop, so the artwork itself is untouched and only the codec changes. Serve them through a small shared `ProductImage` component using `<picture>` with an AVIF source, a WebP source, and a WebP `img` element. **Deliberately no PNG fallback:** every browser that can run this app supports WebP, and retaining a PNG would have left the 3.3 MB sitting in the precache, which is the entire cost being removed. The PNGs move to `design-sources/azkar-responsive-assets/source-assets/images/` beside the background masters, so the originals stay versioned under DEC-071 while leaving the deploy path. A repeatable `tools/export_product_images.py` sits beside the existing background generator and uses the same PIL toolchain, so this is reproducible rather than a one-off.
- **Fidelity, measured rather than assumed:** at AVIF quality 62 and WebP quality 82, both images encode to about 4–5% of the source PNG at unchanged dimensions, with RMSE 2.31–2.74 and PSNR 39.4–40.8 dB. That is comfortably inside the range normally called visually lossless for photographic content, and the check was run against the source rather than eyeballed.
- **Consequences:** The precache falls from 5,977 KiB to 2,925 KiB, and `dist` from 6.2 MB to 3.3 MB. Combined with DEC-066 the deployed output is now 3.3 MB against the original 36 MB. The largest file in the build is JavaScript rather than an image for the first time. No layout, focal point, dimension or alt text changes; all three images keep `loading="lazy"`, `decoding="async"` and their intrinsic 1254×1254 attributes from DEC-066.
- **Tests/evidence required:** `e2e/product-images.spec.ts` asserts each `<picture>` image actually decodes — `complete` with a non-zero `naturalWidth`, which is the signature that distinguishes a rendered image from a broken source — that no `currentSrc` resolves to a PNG, and that the retired PNGs are no longer served as images while both encoded formats are. The assertion checks content type rather than a 404 because the preview server rewrites unknown paths to `index.html` with a 200 for client-side routing.

## DEC-073 — F27 and F28 measured and closed; F23 completed

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to implement the remaining findings)
- **Related scope:** 21 component and screen files; measurement harnesses for the noise overlay and the counting session
- **Context:** F27 and F28 had been deferred twice, both because their briefs require a measurement rather than an assumption and the browser pane used for inspection does not composite — `requestAnimationFrame` returns zero frames there. That obstacle was specific to the inspection pane, not to the project: Playwright renders normally. Running the measurements under Playwright with CPU throttling settles both.
- **F27 — measured, no action.** Scroll cost on a 412×915 profile at 4× CPU throttle, 150 frames per run, driving a real scroll so the compositor must re-blend each frame:

  | Run                | Median | p95    | Frames > 20 ms |
  | ------------------ | ------ | ------ | -------------- |
  | With the overlay   | 16.9ms | 19.2ms | 6              |
  | Overlay disabled   | 16.7ms | 19.1ms | 4              |
  | Overlay re-enabled | 16.7ms | 19.0ms | 2              |

  The third run exists precisely so a warm-up effect could not masquerade as the overlay's cost — and it was the fastest of the three while the overlay was on. The difference between conditions is 0.2 ms of median frame time, inside the run-to-run noise. **The overlay stays.** The audit's concern was reasonable but hypothetical, and the SVG turbulence rasterises once into a 150 px tile rather than per frame, which is consistent with the result. The measurement is vsync-bounded, so the honest claim is that the overlay does not push frames past budget, not that it costs literally zero GPU time — which is the question that was actually being asked.

- **F28 — profiled, no action.** Tap-to-paint latency across 25 taps of a real counting session, same throttled profile, measuring to the second animation frame after the click so the painted count is included: median **27.4 ms**, p95 **33.1 ms**, one sample of 218 ms, one of 25 over 50 ms. At 4× throttle that implies roughly 7–15 ms on unthrottled hardware, comfortably inside a frame budget. **No memoisation added.** The brief forbids speculative memoisation and requires a profile first; the profile shows nothing to fix, and adding `React.memo` here would have bought complexity and bug surface for no measurable gain. The single 218 ms outlier is the first tap, a cold path.
- **F23 — completed.** The remaining 21 `transition-all` sites are narrowed to explicit property lists, taking the finding from 12 of 33 to 33 of 33. Each list was derived from the modifiers the site's own class string carries — `scale`/`translate` implying transform, `opacity`, `shadow`/`ring` implying box-shadow, hover/active colour utilities implying the colour group — rather than applied uniformly. Two sites needed judgement the derivation could not supply: `CategoryScreen`'s completed-card wrapper animates `opacity` and `filter` through a conditional appended after its class string, and every site was checked for properties driven by inline style, which is how `ProgressBar`'s animated `width` was caught earlier. The build emits 21 distinct `transition-property` declarations and no `transition-property: all`.
- **Consequences:** No user-visible change from F23 — the same properties animate, now declared rather than implied, so the browser stops watching every animatable property on those elements. F27 and F28 leave the application untouched; their value is that two open questions are now answered with data instead of remaining permanently deferred. The temporary measurement harnesses were deleted after use rather than left in the suite, since they measure rather than assert.

## DEC-074 — Home hero cards: display-title scale and vertical rhythm

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (direct visual review of the Home hero, with annotated screenshot)
- **Related scope:** `src/app/components/HomeCards.tsx`, `src/app/components/ProgressViews.tsx`, the typography contract in `docs/DESIGN_SYSTEM.md`
- **Context:** Review of Home's two hero cards found the routine card reading as airy and unbalanced beside the wird card. Measured at 1100 px and 1440 px, the two cards are the same height — the grid stretches them — but the routine card's content needs only 332 px of a 432 px row. Its inner container used `justify-between` across four children, so roughly 100 px of slack was sprayed into all three gaps: below the description, below the mode control, and above the primary action. Each gap inflated to about 46 px, which reads as accidental rather than intentional. The heading compounded it at 48 px on desktop.
- **Decision — display title:** Reduce the routine card heading from `clamp(1.75rem,7vw,2.25rem)` with `md:text-5xl` to `clamp(1.5rem,4.5vw,1.875rem)` with `md:text-[2.25rem]` — 28→24 px compact, 48→36 px desktop — and record it in the typography contract as the display-title role, the ceiling for in-app headings, so the next card that leads with a short phrase inherits the same scale rather than inventing one. At 36 px against 14 px body copy the ratio is 2.6×, still unmistakably dominant. The heading truncates to a single line, so the smaller size also delays clipping of long Arabic category names; verified not truncating at 412 px or 1440 px.
- **Decision — rhythm:** Group the title, mode control and progress into one content block with an even 16 px rhythm, and anchor the call to action at the bottom. The slack then belongs to one place instead of three. Grouping alone left a single 119 px void above the button, which is not an improvement, so the group takes the free space and centres within it: the content sits optically centred, the action stays anchored, and the space reads as deliberate margin. Measured after the change, the card has no dead space at the top or bottom edge and a 20 px gap between content and action.
- **Decision — wird tiles:** Increase the gap between each collection name and its status pill from 8 px to 12 px, so the label and its state are not crowded together. Applies to the shared tile used by both Home and Progress.
- **Consequences:** No change to card heights, which were already matched by the grid; the change is to how each card uses its height. Nothing moves on the compact layout beyond the smaller heading and the tile spacing, and there is no horizontal overflow at 412 px. The marketing landing page keeps its own larger type scale, being a separate context.
- **Tests/evidence required:** Card heights equal at 1100 px and 1440 px; the routine card free of dead space at its top and bottom edges; the heading not truncating at 412 px or 1440 px; no horizontal overflow at 412 px; and full `pnpm check` plus `pnpm test:e2e`.

## DEC-075 — Time-of-day icons, one page measure, the tablet pinch band, and honest release notes

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (direct visual review at 1024 px and 2560 px, with annotated screenshots)
- **Related scope:** `src/app/components/ProgressViews.tsx`, `src/app/screens/HomeScreen.tsx`, `src/styles/theme.css`, `public/release-notes.json`, `src/app/releaseNotes.ts`
- **Icons — morning and evening were identical.** Both rendered `<Sun>`, distinguished only by colour, at **nine** sites across Progress and Home. Distinguishing two of the app's three core collections by hue alone also sits badly with the rule against communicating by colour alone, even though an adjacent label carried the meaning. Morning becomes `Sunrise`, evening `Sunset`, sleep `MoonStar` — the vocabulary the prayer row already uses. `Sun` and `Moon` remain imported for the "best routine" and "most missed" stat cards, where they are decorative and carry no time-of-day meaning.
- **One page measure.** Measured at 2000 px, the hero was 1280 px centred while every section beneath it ran 1734 px, so nothing lined up. Two causes: the sections wrapper had no maximum width, and `px-page` was a constant 16 px while the hero padded to 24 px and 32 px at larger tiers — meaning even a constrained wrapper would still have missed by 32 px. Constrain the wrapper to the hero's `max-w-[80rem]`, and make `--spacing-page` responsive (16 / 24 / 32 px). Because `px-page` compiles to `padding-inline: var(--spacing-page)`, every consumer follows in step rather than each section being patched. After the change the hero content and all five sections share identical edges at 269 px and 1485 px.
- **The tablet pinch band.** The three collection tiles switch to a 3-across grid at `sm` (640 px), but the card halves when the Home hero splits into two columns at `lg` (1024 px). Between 1024 px and 1279 px each tile was therefore 109 px wide: the name wrapped to two lines and the status pill to **three**. Tighten the compact variant across that band — smaller icon, tighter padding, one type step down, and `whitespace-nowrap` on the pill, which is two short words and should never break. Restoring the roomy treatment at `xl` was tried and reverted: the large tier mounts a sidebar, so tiles are still only 123 px at 1280 px and the names wrapped again. The label size now holds from `lg` upward; only icon size and padding relax at `xl`. Result: names and pills on one line each, tile height 226 px → 202 px, both cards still exactly equal.
- **Release notes.** The mechanism was already sound — a bilingual manifest, validated, fetched with `no-store` and rendered as bullets. The content was the problem: it still described the previous release (sticky header, long-surah navigation, benefits disclosure), none of which is what users are about to receive. Replaced with four accurate items covering the download-size reduction, accessibility modes reaching the whole app, unified menus and dialogs, and the icon and card-depth work. The validator's ceiling drops from five items to **four**: past four bullets an update prompt stops being a summary and becomes a changelog, and a test now asserts a fifth is rejected.
- **Consequences:** No behaviour changes beyond layout and iconography. The page-gutter change is systemic and affects every `px-page` consumer by design; it was verified by measuring hero and section edges rather than by inspection.

## DEC-076 — The hero sets the Home card height, and one page measure for every screen

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (follow-up visual review at desktop width)
- **Related scope:** `src/app/screens/HomeScreen.tsx`, `src/app/components/HomeCards.tsx`, `src/app/components/ProgressViews.tsx`, `src/app/screens/AzkarLibraryScreen.tsx`, `src/app/screens/settings/SettingsScreen.tsx`
- **Context — the real cause of the routine card's whitespace.** DEC-074 treated the symptom. Measuring at 2000 px showed the height was never set by either card: the hero carries `lg:min-h-[34rem]` (544 px), and 544 minus the hero's own padding is exactly the 432 px both cards rendered. The tile grid inside the wird card carries `flex-1`, so it stretched to fill too — which is why densifying the tiles changed nothing. The routine card needs 332 px, so roughly 100 px had to be disposed of no matter how its children were arranged. Centring it, as DEC-074 did, simply split that into ~50 px above the title and ~70 px before the button — the two gaps flagged in this review.
- **Decision:** Reduce the hero's desktop minimum from `34rem` to `30rem`, so the row is 368 px and the cards sit near their natural size, and pack the routine card's content from the top with an even 20 px rhythm and the action anchored at the bottom. Measured after: both cards 368 px and exactly equal, 1 px above the title, and the gap before the call to action down from 111 px to 47 px — which now reads as deliberate separation for a primary action rather than a void. Verified identical at 1024 px and 2000 px, with no horizontal overflow and the tablet labels still on one line.
- **Decision — one page measure.** Four screens used three different rules: Home at `80rem`, Progress at `44rem` widening to `72rem`, and Azkar and Settings unconstrained, running the full 1744 px of the shell at 2000 px. Every screen shell is now `max-w-[80rem]`, matching the hero and the Masbaha button. Progress keeps its tighter `44rem` measure below `xl`: dense statistics read better on a narrower column, and the responsive contract already endorses constrained measures for focused content — this change aligns the _outer shell_, not every inner column. Verified at 2000 px: all four screens report a 1280 px content measure.
- **Consequences:** The Home hero band is 64 px shorter on desktop; the photographic scene still dominates, and the cards no longer float in it. Nothing changes below `lg`, where the hero keeps `36rem`/`38rem` and the cards stack. Reader keeps its own reading measure, which is a separate contract.

## DEC-077 — theme.css split into sequential parts, byte-identical

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (explicit instruction to proceed with the recommended approach)
- **Related scope:** `src/styles/theme.css`, new `src/styles/theme/`, `src/styles/theme.tokens.test.ts`
- **Context:** F35, the last open finding. `theme.css` had grown to 1,422 lines — it gained per-theme elevation, the Reader category accents, the decorative token set and the responsive gutter during this programme, so it was longer at the end than the 1,296 the audit measured. It mixed theme tokens, the Tailwind bridge, keyframes, shell surfaces, navigation and the responsive grid in one file, which is why rules had ended up duplicated in `ZikrComponents.css`: nobody could hold the file in their head. It was deferred twice on the grounds that a split by concern reorders rules, and the failure mode — a silently shifted cascade — is exactly what no test in this repository would catch.
- **Decision:** Split **sequentially**, not by concern. Each part is a contiguous slice of the original and `theme.css` becomes a barrel importing them in the original order, so the concatenation is unchanged by construction. Boundaries were placed only where a top-level rule ends and the next begins, with leading comments kept beside the rule they describe. The names — `tokens`, `tailwind-bridge`, `motion`, `surfaces`, `layout` — describe what each slice mostly holds rather than a clean taxonomy; a few rules sit in whichever neighbour they were already next to. Preserving behaviour was worth more than a tidy separation, and each file says so in its header along with the warning that reordering the imports can change which declaration wins.
- **Verification:** The built stylesheet is **byte-identical before and after**, 139,697 bytes, confirmed with `cmp` — and again after Prettier reformatted the new files. That is the whole point of choosing the sequential approach: the cascade is not argued to be safe, it is proven unchanged.
- **Consequences:** 1,422 lines become five files of 510, 178, 125, 314 and 296 lines behind a 21-line barrel. `theme.tokens.test.ts` previously read `theme.css` directly and broke, since that file is now imports; it reads the parts **through the barrel's own import list** instead, so it stays correct if a rule moves between parts and fails loudly if a part stops being imported. No runtime behaviour changes.

## DEC-078 — observe the transient completion cue with a recorder, not a locator

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (standing instruction to eliminate gate flakiness)
- **Related scope:** `e2e/reader-microinteractions.spec.ts`
- **Context:** The pre-push gate rejected the DEC-077 push on a single mobile-chromium failure: `counter-completion-cue` "element(s) not found" after a 5 s wait, in a test that had passed 432/432 half an hour earlier and passed on desktop and tablet in the same run. The cue is transient by construction — `useZikrCounter` holds `justCompleted` for `COUNTER_ADVANCE_DELAY_MS` (500 ms), then swaps the element's test id and advances the zikr, so the cue never returns. Four assertions queried it _after_ an action, which races that window: if the machine stalls between the action returning and the locator query, a healthy app fails. The failing run took 21.1 s against 4.6 s and 5.0 s on the projects that passed, so the stall is visible in the timings. One site already carried an `.or(friday-mode-screen)` fallback, so this had bitten before and been worked around rather than fixed.
- **Decision:** Arm a `MutationObserver` recorder before the action and assert on what it caught. It reads the `MutationRecord`s rather than querying live DOM, because under a hard stall the appearance and the disappearance batch into one callback and a live query would see only the final, absent state; disappearance is detected from `attributeOldValue` and from removed subtrees, in a second pass so an appear-then-vanish batch records both in order. The cue's checkmark, its `Done` label and the absence of the retired `Complete!` copy are captured at sighting, so those assertions describe the cue as it actually appeared. The wall-clock `elapsed >= 450` check around the click is replaced by the in-page interval between the two mutations: it measures the same contract more directly, carries no Node/browser clock skew, and keeps only a lower bound, since a stall can stretch the observed window but never shorten it.
- **Verification:** A temporary harness reproduced the failure deterministically by delaying observation 1,500 ms past the window. The old locator-based check missed the cue; the recorder latched it at `seenAt 3491.6 / goneAt 3992.8` — a 501.2 ms window against the 500 ms constant, with the `Done` label intact. The harness was removed after the run. The full spec then passed 48/48 across all three projects.
- **Consequences:** The four cue assertions no longer depend on the harness observing a 500 ms window in time, and the test now measures the cue's real duration instead of a wall-clock proxy. This is a test-only change; no application behaviour is touched. The `.or(friday-mode-screen)` at the full-surah site keeps its either-outcome meaning — a full surah may legitimately hand back to Friday mode — but no longer masks a missed cue as a pass.

## DEC-079 — reader header pared to two actions; reading size raised behind a floor

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (seven numbered requests against annotated desktop and phone screenshots of the reader)
- **Related scope:** `src/app/screens/ReaderScreen.tsx`, new `src/app/screens/readingTypography.ts`, `src/app/components/LayoutShells.tsx`, `src/app/App.tsx`, three e2e specs
- **Context:** The reader's top row carried five icon buttons on wide screens (menu, benefit, save, share, sound) and three on phones. On a 320px phone that left 136px for the collection name, so everything but `أذكار الصباح` truncated to `أذكار ال…`. Below the progress bar sat an `h2` derived by `getReaderZikrTitle`, which fell back to the zikr's own first clause when the zikr had no surah name — for a short dhikr the heading was a verbatim copy of the text directly beneath it, the same words twice, and its other fallback repeated the header title. Reading size was scaled by text length, but the corpus is not what that table assumed: of 203 azkar the median is 108 characters and 65% run past 80, so the majority sat at the unscaled 18.5px.
- **Decision:**
  - **Two header actions, everywhere:** Benefit and the overflow menu. Save, share and sound moved into the menu on all tiers, which also ended the split where the menu's contents depended on viewport width. The share-card font prefetch moved from the share button's hover to the menu trigger's — one step earlier in the same gesture.
  - **The heading is earned, not derived.** `getReaderZikrTitle` returns null unless the zikr carries a real surah name, and both layouts render the `h2` conditionally. A surah name identifies a passage the text itself does not; a truncated first clause identifies nothing. Where it does render it keeps its size and clears the progress bar by 10px on phones and 14px on desktop, past the 4px asked for, because Arabic harakat sit well above the cap line.
  - **Size scales, not bases.** `scale` is fixed at 1 for long surahs, so raising the length steps (1.6 / 1.45 / 1.32 / 1.22, from 1.3 / 1.15 / 1.05 / 1.0) lifts every other card by 22–33% while reviewed Mushaf pages keep the exact size their line breaks were reviewed at.
  - **A legibility floor at 21.3px** — what the 31-character reference dhikr `سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.` rendered at before this change (18.5 × 1.15 = 21.27, rounded up). Fully vocalised Arabic loses its harakat first as size drops, so the floor is set by the smallest text that still has to be legible rather than a generic body minimum. It binds only on the two longest bands at the smallest setting; the three steps stay distinct everywhere, which is asserted rather than assumed.
  - **Reading size in the menu**, as a labelled radio group bound to the one app-wide `textSize` setting rather than a new reader-only preference. A second setting would have to be reconciled with Settings → Accessibility → Text size forever. The cost is that changing it in the reader also resizes app chrome; that is the existing behaviour of the existing setting, surfaced where people actually reach for it.
  - **The header title wraps instead of truncating.** Fitting `أذكار بعد الصلاة · المغرب` (220px) on one line in 136px needs a ~14px h1, too small to read as a title, so `line-clamp-2` plus an 18px step below 360px is the trade. Measured in the browser: every real collection name, Arabic and English, fits in two lines at 320px, and the 56px header minimum absorbs the second line without growing.
- **Verification:** Sizes confirmed live in the DOM, not just in the table — 22.57px for the ≥80 band at medium, 26.83px for the 30–59 band, 23.2px for that band at small, and 21.3px where the floor binds. Title-fit measured against an unclamped probe at the same width, after a first measurement using `scrollHeight` proved meaningless under `-webkit-box`. `readingTypography.test.ts` pins the increase, the floor, the monotonic curve, the long-surah exemption and the three steps staying distinct. Three e2e specs that encoded the old header contract were updated, and three new tests cover the two-action header, the absent duplicate heading and the menu control.
- **Consequences:** Save, share and sound cost one extra tap on desktop, where they were previously one-tap. That is the price of a two-action header and it applies equally on both tiers now. Long surahs are deliberately untouched by both the increase and the floor, so Kahf/Sajda/Mulk at the smallest setting still render at 16px — the one place reading text may sit below the floor, and it is the case the user excluded by name.

## DEC-080 — the reference sheet names the zikr, states one benefit, and copies only the hadith

- **Date:** 2026-08-16
- **Status:** Approved
- **Owner:** User (seven numbered requests against a screenshot of the live sheet and a proposed redesign)
- **Related scope:** `src/app/components/ReaderReferenceSheet.tsx`, `src/app/content/azkar.ts`, `docs/DESIGN_SYSTEM.md`, `e2e/reader-microinteractions.spec.ts`
- **Context:** The sheet opened with the zikr's full text — the words the reader had just been looking at — behind its own show-more control, which pushed the evidence the sheet exists to serve below the fold. Below that sat four headed, card-wrapped sections and five copy buttons. The source card printed the word "source" as its heading and again inside itself. The timing section was headed "recommended time and prophetic guidance", making the benefit the subject of two sections rather than one. An audit of the 144 azkar reachable in the app found something worse than layout: **16 showed an authoring note where the benefit should be.** "Use the evening wording in the evening row" is an instruction to whoever maintains the content table; it was rendering to worshippers as a spiritual benefit, in both languages, because the note had been copied into the `benefit` field and then translated into `ARABIC_BENEFITS`.
- **Decision:**
  - **Three sections, in order: benefit, evidence, source.** The zikr is named by a single-line pill — surah name with verse range, or the opening words elided on a word boundary — not reprinted. Translation and transliteration leave the sheet; the reader already shows them under the reading preferences, and the sheet is about evidence.
  - **Timing folds into the benefit.** Same thought, one heading, marked by a clock with a screen-reader-only label rather than a second section that named the benefit again.
  - **One copy button, on the hadith.** The other four sat beside a name, a one-line summary and a citation — values read at a glance, not copied.
  - **Rules instead of cards**, and the source is named once.
  - **The 16 authoring notes were replaced with real benefits**, each restating only what that record's own already-reviewed hadith says — al-Falaq's hadith reads `تَكْفِيكَ مِنْ كُلِّ شَيْءٍ`, so its benefit says sufficiency, and the 100× tahlil records state the ten-slaves/hundred-good-deeds/shield virtue the hadith spells out, verified against each record's own `repetitionCount` before claiming it. No virtue is asserted that its own record does not already carry.
  - **The hadith is always `lang="ar"` and RTL.** It is the narration, not supporting copy; leaving it unmarked in English mode had screen readers reading Arabic with an English voice. The English-mode language-leak test now allows exactly this one element and asserts it is the hadith.
- **Consequences:** English readers no longer get the translation and transliteration inside this sheet; both remain on the reading screen under their existing preferences, and the sheet's subject is the evidence. The benefit heading keeps its longer accessible name ("Benefit details") because the sheet's own accessible title is already "Benefit" — without it a heading list showed "Benefit" twice. `authenticityNote` exists for 144 records and is still unsurfaced: it is English-only prose, so a takhrij disclosure like the one in the proposed design would leak English into the Arabic sheet and needs Arabic copy first.

## DEC-081 — an evidence screen for keeping a wird, drafted for review

- **Date:** 2026-08-16
- **Status:** Approved, content pending scholarly review
- **Owner:** User (chose the "draft from well-known primary texts, marked for review" option and named the anchor hadith)
- **Related scope:** new `src/app/content/wirdBenefits.ts` and `src/app/screens/WirdBenefitsScreen.tsx`, `ProgressViews.tsx`, `RoutineGarden.tsx`, `HomeScreen.tsx`, `App.tsx`, both i18n tables
- **Context:** The Zikr benefits index answers "what does this dhikr earn?" but nothing answered "why keep to it every day?" — which is the question the Today's Wird card provokes when a row is unfinished. The content is the hard part: unlike DEC-080, where new benefit text could be grounded in a hadith already reviewed and present in the record, there was no in-repo source to summarise here. Selecting verses, narrations and scholarly sayings is authorship, so the choice was put to the user rather than made silently.
- **Decision:** Draft from well-known primary texts, each cited to its collection and number, and mark the whole file for review in its own header. Nineteen items across three sections. The anchor the user named — `إِذَا مَرِضَ الْعَبْدُ أَوْ سَافَرَ، كُتِبَ لَهُ مِثْلُ مَا كَانَ يَعْمَلُ مُقِيمًا صَحِيحًا` (al-Bukhari 2996) — leads the Sunnah section, because it is the strongest single argument for a fixed portion: the portion keeps earning when illness or travel stops it. It is joined by `أَحَبُّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ` and, most directly on point, Muslim 747 on making up a missed _ḥizb_ between Fajr and Dhuhr — the one narration that names the practice this screen is about.
  - **Companions and later scholars share one section** (`السلف والعلماء`) rather than the four the user listed. Two reasons: at 320px a four-tab row is cramped, and more honestly, there were not four well-cited companion sayings specific to a wird that could be included without weakening the standard the rest of the file meets. Classical works group آثار السلف the same way. The section splits cleanly later if more companion material is supplied.
  - **Qur'an is always rendered in Arabic**, with the English as a meaning beneath it and never as a replacement, matching the Zikr benefits card.
  - **The entry point is a button inside the Today's Wird card**, not a menu item, because the question arrives while looking at an unfinished row.
- **Consequences:** The content is drafted, not reviewed. `wirdBenefits.ts` says so in its header, and the citations are precise enough that a reviewer can check each item against dorar.net or sunnah.com without reading the code. The salaf sayings link to dorar.net searches rather than fixed pages, since those texts have no stable canonical URL; the Qur'an and hadith items link to quran.com and sunnah.com by reference. `BenefitEvidence` is reused via `Omit<…, "kind">` so the two indexes cannot drift apart in shape.

## DEC-082 — the release notes are enforced, stamped, and readable after the update

- **Date:** 2026-08-19
- **Status:** Approved
- **Owner:** User ("contain the recent updates not a repeat of old updates… write this as a rule", then "apply all recommendations")
- **Related scope:** new `scripts/check-release-notes.mjs` and `src/app/screens/settings/WhatsNewPanel.tsx`, `src/app/releaseNotes.ts`, `usePwaLifecycle.ts`, `PwaNotice.tsx`, `App.tsx`, `AboutPanel.tsx`, `SettingsScreen.tsx`, both i18n tables, `.githooks/pre-push`, `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`
- **Context:** `public/release-notes.json` had not changed in 37 user-facing commits. It still advertised a smaller bundle, high-contrast coverage and unified menus while the Reader had gained mushaf paging and word meanings, prayers had gained five independently tracked cards, and Settings had gained a reciter picker — none of which any reader was told about. DEC-063 already required the manifest to be maintained on every deployment, so the failure was not a missing rule but an unenforced one. `releaseNotes.test.ts` could not catch it: a file frozen for months still has a perfectly valid shape.
- **Decision:**
  - **The rule is enforced, not documented.** `check-release-notes.mjs` finds the last commit that touched the manifest, lists user-facing commits since (excluding tests, docs and tooling, which have nothing to announce), and fails when any exist. It runs first in `.githooks/pre-push` so it costs milliseconds and fails before the slow gates. `ALLOW_STALE_RELEASE_NOTES=1` covers a release with genuinely nothing to announce, and must be declared in the phase report.
  - **The manifest carries a `release` stamp**, and the check fails when the notes change without it. The stamp is what lets the app distinguish notes it has shown from notes it has not; without enforcement it would be the first field to rot.
  - **The notes outlive the update.** Applying an update reloads the app, so the notes were destroyed at the exact moment they became true — readable only in the seconds before, in a corner, beside a button most people tap immediately. The client now compares the deployed stamp against the last one shown and recaps after the fact. Applying from the prompt records the stamp at that moment, so someone who read the bullets and tapped Refresh is not shown the same four lines again three seconds later; a first run records silently, because a new reader should not be met with a changelog.
  - **Settings › About › What's new** reads the same manifest on demand — the only place these notes are readable at all once an update has been applied.
  - **A malformed served manifest reports to observability.** Both the parse failure and the fetch failure previously fell back to the generic message and vanished. A failed fetch is ordinary offline behaviour and stays silent; a manifest that was served and is invalid is a broken deployment nobody could otherwise discover.
  - **`parseReleaseNotes` now rejects mismatched language counts** rather than serving one language a different set of notes than the other.
- **Consequences:** A push whose range contains user-facing commits cannot land without rewritten notes, which is the intended cost. The startup recap adds one small no-store request per launch, skipped when offline. The pre-existing parser test asserted 4 English notes against 3 Arabic ones — legal before the equal-count rule — and was corrected rather than the rule relaxed. The recap can only fire for readers who already have a recorded stamp, so this release itself is recorded silently and the first recap anyone sees will be the next deployment's.

## DEC-083 — daily progress and prayer state share a fixed midnight rollover

- **Date:** 2026-08-20
- **Status:** Approved
- **Owner:** User (explicitly requested a 12:00 AM reset and current-day prayer timing)
- **Related scope:** `src/app/progress.ts`, `src/app/state.ts`, `src/app/App.tsx`, Progress settings, the shared clock, and prayer-date refreshes
- **Context:** Midnight was the default, but a stored 02:00/04:00/06:00 preference could still delay the practice day, and the live rollover cleared only fully completed collections while reload-time migration cleared partial daily progress too. This made a continuously open app disagree with a freshly opened app. Home and Progress already used a minute-aligned clock and date-keyed prayer refresh, so the prayer pipeline itself was current-day aware.
- **Decision:** Local 00:00 is the only practice-day boundary. Legacy alternative boundaries normalize to midnight and Settings presents the boundary as fixed. When the calendar date changes, partial and complete state is cleared for Morning, Evening, Before Sleep, Waking Up, and After Prayer. Immutable daily-completion history, streaks, session history, saved items, and situational collection progress remain intact. The same date transition advances prayer tracking and triggers Home/Progress to resolve the current day's prayer schedule.
- **Consequences:** A before-sleep routine continued after midnight belongs to the new displayed calendar day. This is preferred over showing one date while writing progress to another. Existing completion-history day keys are not rewritten; only the obsolete boundary preference and active daily routine state migrate.
- **Tests/evidence required:** State migration, persisted new-day reset, live daily-routine reset, minute-clock midnight crossing and visibility resynchronization, focused prayer-time tests, full local gates, green Quality and Pages workflows, and production verification.

## DEC-084 — Angle-based high-latitude fallback

- **Date:** 2026-08-22
- **Status:** Approved
- **Owner:** User (first reliability batch)
- **Related scope:** `prayerCalculation.ts`, `PRAYER_TIMES.md`, and offline calculation tests
- **Context:** The local fallback could place Fajr after Dhuhr or Isha before Maghrib when the selected twilight angle does not occur.
- **Decision:** Retain the selected calculation method and use its twilight angle as a fraction of the real night (`angle / 60 × night duration`) only when that angle is unavailable. The normal solar calculation remains unchanged.
- **Consequences:** This protects ordering for high-latitude summer twilight gaps. Polar day and polar night remain subject to the reader's local authority.
- **Tests/evidence required:** High-latitude ordering regression test and the normal prayer-time suite.

## DEC-085 — Offline city presets reuse the manual location boundary

- **Date:** 2026-08-22
- **Status:** Approved
- **Owner:** User (approved the next non-Mushaf improvement while Quran work ran separately)
- **Related scope:** `prayerLocations.ts`, `NotificationsPanel.tsx`, both i18n tables, and `PRAYER_TIMES.md`
- **Context:** Readers who decline or cannot use GPS previously had to know and enter a city-centre latitude, longitude, and IANA timezone manually. That path works offline but asks for specialist data most readers do not know.
- **Decision:** Ship a curated, bilingual, searchable catalogue of representative city-centre coordinates and IANA timezones in the application bundle. Selecting a city immediately persists through the existing manual `LocationSettings` boundary with `autoDetect: false`. Keep the existing raw fields as the fallback for any place outside the catalogue. Do not add a geocoding service, runtime dependency, or persistence migration.
- **Consequences:** City search and selection work without GPS or network access and do not disclose a reader's location. The catalogue is intentionally finite and uses representative city-centre coordinates; it is not an address-level geocoder.
- **Tests/evidence required:** English, Arabic, country, and alias search coverage; unique IDs; valid coordinate ranges and runtime-recognized IANA timezones; component selection/persistence coverage; narrow-width and RTL visual inspection; full local release gates; green Quality and Pages workflows; and production verification.

## DEC-086 — one semantic Mushaf page; Wird progress stays in the overview

- **Date:** 2026-08-22
- **Status:** Approved
- **Owner:** User (explicit Mushaf and Today's Wird redesign request with four visual references)
- **Related scope:** `KhatmahReaderScreen.tsx`, `MushafPageViewer.tsx`, `QuranWirdScreen.tsx`, both i18n tables, tests, and the Reader contract
- **Context:** The reader repeated orientation through a page footer, a `page / 604` footer control, a Khatmah percentage, and a separate daily-Wird status strip. Difficult-word help existed but was hidden behind an unexplained “ع” switch. Page changes animated after buttons or arrow keys but the visible page could not be dragged. The overview used a rolling seven-day strip, offered a second place to record the last position as read, and rendered a large radial summary plus a separate reading-position card.
- **Decision:** Give the standalone reader one page surface and one visible page indicator. Remove Khatmah and daily-Wird progress from the page; keep one direction-aware linear bar in the dedicated overview. Keep recording explicit and page-local by removing the overview recorder. Always expose reviewed difficult words with colour plus dotted underline and accessible button names. Make the page horizontally draggable with persistent Previous/Next buttons and physical arrow keys as equivalent inputs. Flatten the phone page, preserve a bounded surface on wider screens, keep the reviewed 15-line Unicode data and offline Amiri Quran font, and do not describe that as an exact QCF facsimile. Collapse plan controls behind native disclosure and define the week as local Saturday through Friday.
- **Why:** One indicator answers “where am I” without competing status. The overview answers “how is today's Wird going”; the page answers “what am I reading”. Persistent button alternatives satisfy the same action without a precision drag, and the difficult-word underline prevents meaning from relying on colour alone.
- **Consequences:** Readers record a page only while that page is open. The overview is shorter and cannot accidentally record a stale last position. Exact Madinah print glyph placement remains a separate data/font integration using authoritative per-page QCF assets; the current source-aware semantic text remains selectable and assistive-technology readable.
- **Tests/evidence required:** Saturday-week unit coverage, RTL progress direction, permanent difficult-word button coverage, focused type/lint/unit tests, 320/390/tablet/desktop visual checks, swipe/button/keyboard interaction, full local gates, green Quality and Pages workflows, and production verification.

## DEC-087 — Quran Wird shell and page-specific QCF Mushaf enhancement

- **Date:** 2026-08-22
- **Status:** Approved
- **Owner:** User (explicit correction request with a Madani Mushaf reference)
- **Related scope:** `QuranWirdScreen.tsx`, `KhatmahReaderScreen.tsx`, `MushafPageViewer.tsx`, QCF content boundary, app navigation, i18n, PWA caching, tests, and the Reader contract
- **Context:** The Wird overview used a browser-native plan popup, a title that disagreed with Home, and no app navigation. The reader surrounded the Mushaf with separate application bars, permanently styled difficult words, and constructed verse-number medallions separately from the text. DEC-086 intentionally stopped short of exact QCF glyph integration and required permanently visible difficult-word affordances.
- **Decision:** Name the feature **ورد القرآن / Quran Wird** on Home and the overview; restore normal responsive navigation to the overview; and use the shared Radix Select primitive for its plan. Remove the reader's external bars and place orientation/actions in reserved header/footer space inside the Mushaf page, auto-hiding them after reading begins with an accessible reveal control. Replace permanent word marking with an explicit in-page meanings toggle. Preserve the reviewed local Unicode page as the immediate offline source, then merge official Quran Foundation QCF V2 glyph codes and line numbers by verse/word position without replacing local semantic Quran text. Load the official page-specific QCF V2 font at runtime and cache recently read page data/fonts; if either remote asset is unavailable, continue with local Unicode/Amiri rendering.
- **Why:** This makes sacred text visually dominant, removes redundant containers, gives the plan menu the same focus/shape/RTL behavior as the rest of the product, and aligns word help with user control. QCF's own verse-end glyphs resolve the separate-number alignment problem while semantic local text and offline fallback protect accessibility and reliability.
- **Consequences:** DEC-086's permanent difficult-word styling and fixed external navigation row are superseded. QCF fidelity applies after a page-specific font and glyph payload are available or cached; the app must not describe the Unicode fallback as pixel-identical. The feature adds no runtime dependency and changes no reviewed Quran wording, meaning, attribution, page count, progress shape, or persistence shape.
- **Tests/evidence required:** shared-select interaction, consistent naming, overview app navigation, meanings on/off behavior, QCF parsing/merge semantics, local fallback, one in-page page indicator, auto-hide/reveal, swipe/button/keyboard parity, responsive line-fit checks, full local gates, green Quality and Pages workflows, and production verification.

## DEC-088 — atomic Mushaf typography and labelled in-page controls

- **Date:** 2026-08-22
- **Status:** Approved
- **Owner:** User (explicitly requested the recent enlarged view only, 95% mobile fill, icon-plus-text options, difficult-word highlighting, perfect performance, and deployment)
- **Related scope:** `KhatmahReaderScreen.tsx`, `MushafPageViewer.tsx`, QCF loading/cache boundary, i18n, responsive browser coverage, and the Reader contract
- **Context:** DEC-087 rendered the reviewed local Unicode page immediately, then replaced its line data and font after the QCF payload and page-specific font arrived. That protected time-to-text but made readers watch a smaller fallback page resize into the intended Mushaf. The in-page header also exposed several icon-only actions at once, while difficult-word styling could inherit form-control metrics in the fallback renderer.
- **Decision:** Treat QCF page data and its page-specific font as one enhancement and mount a page only after the local and enhanced outcomes settle. Use the enhanced page once when both assets are ready; after a bounded 1.8-second wait, use the local Unicode/Amiri page once and do not replace it mid-read. Keep four resolved QCF pages in memory and preload the next page after the current enhanced page settles, except when the browser reports data-saving mode. Make the permanent header Back + surah/juz + Options and the footer Previous + Record page + Page number + Next; every target combines icon and visible text. Put bookmark, theme, and difficult-word help in the shared labelled Options menu. Preserve identical inline metrics when difficult-word help is toggled.
- **Why:** A short loading state is less disorienting than visible sacred-text reflow. Progressive disclosure leaves orientation and page turning immediately recognizable without crowding a 320px page. Bounded fallback keeps offline and poor-network reading reliable, while a small cache and adjacent preload speed the common forward-reading path without an unbounded download.
- **Consequences:** DEC-087's “immediate fallback, then enhance in place” sequence is superseded. Network failure never blocks beyond the bounded enhancement window; a page that falls back stays visually stable for that reading. The 320×700 page surface must occupy at least 95% of the viewport with zero horizontal overflow, visible reader targets must meet the 44px baseline, and the reveal action remains available after chrome auto-hide.
- **Tests/evidence required:** font-readiness unit coverage, difficult-word line-metric regression coverage, 320×700 page-fill and overflow assertions, labelled Options/menu/reveal checks, swipe/button/keyboard parity, full local gates, green Quality and Pages workflows, and production verification.

## DEC-089 — the Mushaf page is the whole screen, cut from one reference

- **Date:** 2026-08-23
- **Status:** Approved
- **Owner:** User (explicit request: fill the screen, keep the toolbar, bolder text, fix the reversed page turn, add a difficult-words switch, shrink the surah title, replace the sluggish animation, match the real Mushaf against one chosen reference, and cut gate time)
- **Related scope:** `KhatmahReaderScreen.tsx`, `MushafPageViewer.tsx`, `ScreenContainer.tsx`, `content/qcfMushaf.ts`, `public/data/mushaf/*`, `scripts/prepare-mushaf-pages.mjs`, PWA caching, `vitest.config.ts`, `playwright.config.ts`, `scripts/run-checks.mjs`
- **Context:** DEC-088 shipped a bounded page card inside screen padding, and treated QCF as a runtime enhancement fetched from api.quran.com with a page-specific font. Two renderings therefore existed — QCF and a Unicode fallback — and the shipped per-word line map did not always agree with the QCF layout. On page 599 the local map put ten words where the reference puts twelve and placed the surah-break slots four lines off, so the fallback lines ran past both paper edges and were clipped. The Arabic footer mapped its left control to "next", the difficult-word help lived inside the Options menu, the in-page surah heading was three line-heights tall, and each turn cost a spring slide plus a network round trip.
- **Decision:** Adopt the **King Fahd Complex Madani Mushaf, 15 lines per page, 604 pages, QCF v2** as the single reference and ship both halves of it. `scripts/prepare-mushaf-pages.mjs` rewrites `public/data/mushaf/<page>.json` with the reference line numbers and the `code_v2` glyph for every word, preserving each word's reviewed Uthmani text byte for byte; the runtime no longer calls api.quran.com at all, and the page font is stored in Cache Storage on first load. Render the page edge to edge at every width, with the existing header and footer chrome unchanged; on screens wider than the page's proportion the paper still fills the viewport while the fifteen-line column keeps the Mushaf's measure. Always lay out fifteen equal line slots, justify each line to both margins, and scale any overlong line down to fit rather than clipping it. Give the surah heading exactly one line slot. Add a hairline text stroke instead of synthetic bold. Map the forward-pointing control and `ArrowRight` to the next page in both directions. Expose difficult words through a `role="switch"` control on the page toolbar and drop the duplicate menu entry. Replace the spring slide and the motion-driven drag with a 150 ms cross-fade and pointer handlers that write one transform.
- **Why:** One reference is the only way "each page matches the Mushaf" can be verified; two half-agreeing layouts guaranteed the clipping. Shipping the glyph codes turns a page turn from a network round trip into a local cache hit, which is also what makes offline reading real rather than degraded. Faux-bold smears a single-weight glyph face, so weight has to come from a stroke.
- **Consequences:** DEC-088's bounded page card, its 1.8-second enhancement window, and its Options-menu difficult-word entry are superseded, as is DEC-086/DEC-087's Arabic-inverted page-turn mapping. `public/data/mushaf` grows by ~500 kB (2.31 MB → 2.80 MB); measured `dist/` stays near 6.1 MB against the 8 MB budget. Re-running the preparation script requires network access to api.quran.com but nothing at runtime does.
- **Also decided (gate speed):** Vitest moves to worker threads with a shared module registry, with the two suites that genuinely need a fresh registry named explicitly in `vitest.config.ts`; `pnpm check` runs its independent stages concurrently; and the two non-desktop Playwright device projects run only the specs whose assertions depend on the device, with `E2E_FULL_MATRIX=1` restoring the full matrix for release evidence. Playwright workers become 3 everywhere, the pool CI had already validated: the ceiling is the single `vite preview` process feeding every browser, not the cores, and above it the load-sensitive reader and navigation specs time out and the home hero's photograph is dropped often enough to fail the imagery spec. `retries` stays at 0. `reuseExistingServer` stays `false` — reuse saves ~13 s and lets a leftover preview serve a half-written `.playwright-dist`, which fails the offline spec in a way that reads exactly like a code regression.
- **Tests/evidence required:** fifteen-slot and justified-line coverage, no-bleed assertion at 320 px, page-fill assertion, switch semantics and geometry-stability coverage, next/previous and arrow-key mapping coverage in Arabic, page data parse/cache/prefetch coverage, full local gates, and before/after gate timings recorded in `docs/agent/MUSHAF_FIDELITY_CHECKLIST.md`.

## DEC-090 — one edition defines a page; the running heads stay on the paper

- **Date:** 2026-08-23
- **Status:** Approved
- **Owner:** User ("several issues still persist with the mushaf... and don't make the header or footer control disappear")
- **Related scope:** `scripts/prepare-mushaf-pages.mjs`, `public/data/mushaf/*`, `MushafPageViewer.tsx`, `KhatmahReaderScreen.tsx`, i18n, tests
- **Context:** DEC-089 named QCF v2 the reference but only took two of the three things that define a printed page from it — the line number and the glyph — leaving the verse-to-page assignment as it found it. The two disagree on 25 pages (361 words). On page 121 the reader printed verse 5:77 _after_ 5:83, drawn in page 120's glyphs, which page 121's font cannot render: the reader showed two lines of garbage. The trap that caused it is that `api.quran.com` answers a different question depending on the fields requested — `word_fields=page_number` returns the default script's pagination, `word_fields=code_v2,page_number` returns the v2 font's, and only the second matches the glyphs. Separately, a fixed `92cqh` measure left the widest line covering ~76% of the column on tablet and desktop, so every line fell below the justify threshold and the page rendered as a narrow ragged strip with wide margins; and the page chrome faded out after 3.5 s, taking the surah, juz, page number and all controls behind a small reveal button.
- **Decision:** All three page-defining facts — which words are on the page, which line each sits on, and which glyph draws it — come from the QCF v2 reference, placed by each word's **v2** `page_number`. The generator refuses to write unless every word in the Mushaf is accounted for exactly once, so a partial or reordered rebuild fails loudly rather than shipping. The reading measure is **derived** from the one fixed constraint (fifteen lines in the height of the paper) rather than chosen: the column is set to the width the vertically-limited type actually spans, so the widest line always lands on the margin. The page header and footer are **permanent** — no auto-hide, no reveal control. A page mounts once in its final typeface, with a bounded wait before settling for the Unicode fallback.
- **Why:** A page assembled from two editions is not a faithful page in the way that matters — it can print the Qur'an out of order. Deriving the measure makes the width and height constraints agree instead of competing, and costs nothing in type size (measured: 35.0 px at the old cap, 34.7 px at the derived one, with line fill going from 0.76 to 0.97). A printed Mushaf keeps its running heads on the paper; hiding them removed the reader's only answer to "where am I".
- **Consequences:** DEC-088's auto-hiding chrome and its reveal control are superseded, along with the `mushaf.pageControls` and `mushaf.showPageControls` copy. DEC-089's page assignment is superseded. 36 page files change; no Arabic character changes and the word count is unchanged at 83,665, verified by comparing every `verse:position` before and after. Re-running the generator needs network access to api.quran.com; nothing at run time does.
- **Also decided:** a word may never sit on an earlier line than the word before it in its own verse — that is an impossibility, not a layout choice. The reference carries exactly one such record (page 589 puts the ayah marker of 84:21 on line 13 while words 3-6 of that verse are on line 14, which would print the verse number mid-sentence a line above the words it closes). The generator pulls such a word down to its predecessor's line, the smallest correction that restores reading order, and reports how many it settled.
- **Tests/evidence required:** generator refusal on an incomplete rebuild, before/after word-identity comparison across all 604 pages, permanent-chrome assertion after the old 3.5 s hide window, line-fill and no-bleed assertions, full local gates, and screenshots at 390 px and 1085 px. `src/app/content/mushafPageData.test.ts` holds the offline invariants: the reading-order check it adds failed 1714 times on the pre-DEC-090 data and passes now.

## DEC-091 — the chrome belongs to the page, and steps aside while you read

- **Date:** 2026-08-23
- **Status:** Approved
- **Owner:** User ("the previous and next buttons are misplaced in desktop… the entire screen with the menu moves… the menu bars should hide after while… users should be able to see the progress for their wird")
- **Related scope:** `MushafPageViewer.tsx`, `KhatmahReaderScreen.tsx`, `quranWirdGoal.ts`, `QuranWirdScreen.tsx`, `App.tsx`, i18n, tests
- **Context:** DEC-090 made the chrome permanent at the owner's instruction, and left three things wrong. The header and footer spanned the full display, so on a 2000 px screen Previous sat in the far left corner and Next in the far right, a thousand pixels from the page they turn. A page drag transformed the whole viewer, chrome included, so the toolbars slid off with the paper. And permanent chrome, having been asked for, turned out not to be what reading wants.
- **Decision:** The chrome is part of the page, not the window: both rows are held to the page's own derived measure, so they sit under the paper at every width. A page turn drags **only** the paper. The controls step aside after 4.5 s and return on a tap anywhere on the paper or on the next page turn; the reserved band keeps its height either way, so hiding never resizes the reading canvas. A slim status line stays behind carrying the page number and today's wird. The wird bar reads against the goal chosen on the overview, via one shared `effectiveDailyGoal` used by both screens.
- **Why:** Controls that belong to a page should be measured against that page — spreading them to the screen edges made them read as application chrome that happened to be nearby. Hiding them is right for reading, but hiding _orientation_ is not, which is why the status line stays: "where am I" and "how is the wird going" are the two questions a reader asks mid-page, and neither is worth a tap.
- **Consequences:** DEC-090's permanent chrome is superseded; the auto-hide returns, but with a tap target that is the whole page rather than one small button, and with orientation preserved. Hidden controls use `visibility`, which removes them from the tab order — so **anyone driving by keyboard holds the controls open until they touch the page again**, or they would be stranded with no way to tab back. The reader now takes `quranWirdPlan`.
- **Tests/evidence required:** measured button placement at 320/390/1280/2000 px, proof that a drag moves the paper and not the header, zero focusable controls while hidden, keyboard-driven reading keeping the controls up past the idle window, wird progress against a chosen plan and its absence without one, and full local gates.

## DEC-092 — one page-turn rule for the whole app, and nothing dropped from a page

- **Date:** 2026-08-23
- **Status:** Approved
- **Owner:** User ("continue any missing items")
- **Related scope:** `MushafPageViewer.tsx`, `MushafImmersiveReader.tsx`, `content/qcfMushaf.ts`, `main.tsx`, tests
- **Context:** The review of 2026-08-23 left seven items open. Two were defects rather than polish. Nineteen surahs begin on the second line of their page, leaving one slot where both the heading and the basmalah belong; the inference put the basmalah there and dropped the surah name, and on At-Tawbah's page — which takes no basmalah — left the slot blank. Separately, the immersive reader still inverted the arrow keys under RTL while the Mushaf reader, since DEC-089, does not, so the same key turned the page two different ways depending on which reader you were in.
- **Decision:** When a surah opens with a single slot to spare, that slot carries a combined band with the surah name and the basmalah beneath it — nothing on a Qur'an page is dropped for want of room. The immersive reader adopts DEC-089's rule: `ArrowRight` advances and `ArrowLeft` goes back in both directions, and its footer is laid out left to right so Previous sits on the left and Next on the right, with physical rather than logical arrows.
- **Also decided:** QCF lines carry no inter-word gap — the glyph advances already hold the spacing the page was cut with, and adding our own widened it; the Unicode fallback keeps its gap because it has no such spacing built in. Ayah markers in the fallback are set in the page's own ink rather than the accent colour. A word popover is passed only to the line that holds it, instead of re-rendering all fifteen. The two caches DEC-089 orphaned are deleted at startup: Workbox tidies only its own precache, so every browser from before that release still carried page data we now ship and fonts we now store ourselves.
- **Consequences:** DEC-086's immersive-reader arrow convention is superseded. The 19 affected pages gain a heading they were missing; no Qur'anic text changes.
- **Tests/evidence required:** unit coverage for both opening-band cases including At-Tawbah, the immersive spec asserting the forward key advances under RTL, and full local gates.
- **Left open deliberately:** the two-page desktop spread. It changes the page model rather than its styling — one set of chrome across two canvases, navigation stepping by two, the fitter measuring two pages — and is worth its own change rather than being appended to this one.

## DEC-093 — ghareeb glosses for the whole Qur'an, and a quieter page

- **Date:** 2026-08-23
- **Status:** Approved
- **Owner:** User (Mushaf review: heading too heavy, glosses incomplete, line spacing tight, index unusable on a phone, duplicated page control, switch and menu out of keeping)
- **Related scope:** `scripts/generate-quran-word-meanings.mjs`, `content/quranWordMeanings.ts`, `public/data/word-meanings/*`, `MushafPageViewer.tsx`, `KhatmahReaderScreen.tsx`, `MushafNavigationModal.tsx`, i18n
- **Context:** Difficult-word help covered 8 surahs — 176 verses, 2.8% of the Qur'an — because the generator downloaded a vetted 114-surah source and then kept seven of them. The switch was therefore offered on every page of the Mushaf while doing nothing on 97% of them. Separately the surah heading was a filled, bordered gold box heavier than the Qur'anic text beside it; lines were tight; the index sheet was a short bottom sheet whose search field scrolled away with its own results on a phone; the footer's page button opened the same index as the header's surah name; and the options menu arrived in the app's popover colours on top of a parchment page.
- **Decision:** Ship the ghareeb glosses for all 114 surahs — 5,085 verses, 11,365 glosses — from the source the app already cites. They are **not** bundled: 1.03 MB to serve one page at a time would be paid by every visitor, so the Mushaf fetches a surah at a time and settles them with the page, while the azkar reader keeps its bundled subset for its synchronous offline path. Reviewed glosses win over sourced ones where both exist. The surah heading loses its box and its fill: hairline rules, a small ornament, and the name at 0.6em. Leading increases (slot ink allowance 0.94 → 0.88). The index is a full-height sheet on a phone with a sticky search row. The footer's page control becomes a readout, since the header already opens the index. The options menu wears the page's own surface. One progressbar carries wird progress — the hairline along the bottom edge — with the footer showing it as text.
- **Why:** A reading aid that is present but empty on 97% of pages is worse than absent, because the reader learns it does nothing. The heading was competing with the text it announces. Two controls opening one panel is two places to learn and one to forget.
- **Consequences:** `public/data/word-meanings/` adds ~1.03 MB to `dist`, taking it to 7.13 MB against the 8 MB budget — meaningfully less headroom, and worth watching before the next asset lands. DEC-092's gold heading band is superseded.
- **Also fixed:** the generator silently deleted Al-Baqarah's reviewed glosses on every run — they shipped in its output but were absent from its list, and their wording and orthography are hand-authored, not the source's. It now names everything it ships and carries reviewed surahs across untouched, so it can be re-run safely.
- **Tests/evidence required:** i18n key integrity for the new clear-search label, unit coverage unchanged, e2e gloss count relaxed from exactly three to at least three, and full local gates.
- **Left open:** the page-turn direction, which has now been specified two opposite ways; and the two-page desktop spread from DEC-092.
