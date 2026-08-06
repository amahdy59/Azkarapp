# Design System Delta — Phase 02

This document records the token-level delta adopted in Phase 02 (Design and
Accessibility Foundations), and why. It supplements `docs/DESIGN_SYSTEM.md`
rather than replacing it. Written after the Phase 02 Step 1 analysis and
Step 3 implementation; see `docs/agent/evidence/phase-02/PHASE_02_REPORT.md`
for the full phase report and `docs/agent/DECISION_LOG.md` for the decisions
this delta implements (DEC-006 through DEC-011).

## What changed

### 1. Status tokens became theme-aware (DEC-006)

`--success`, `--warning` existed as a single global pair (`src/styles/theme.css`)
that was never adopted by any component and would have failed AA contrast
(~3.3:1 and ~1.9:1) if ever used as text on the light theme. `--info` did not
exist at all, despite being promised in `docs/DESIGN_SYSTEM.md`.

All three are now defined per theme (base, dark, light, midnight,
high-contrast), each with a paired `-foreground` token (mirroring the existing
`--destructive`/`--destructive-foreground` pattern), and mapped into the
`@theme inline` block as `--color-success`, `--color-warning`, `--color-info`
(+ foregrounds), making `bg-success`, `text-warning`, etc. available as
Tailwind utilities.

Light-theme values were deliberately darkened for text/badge-safe contrast
(e.g. `--success: #14663d` rather than the dark-theme `#5ec88a`) — computed
by hand against the WCAG relative-luminance formula, not verified with an
automated contrast tool. **Treat these hex values as provisional** and verify
with a real contrast checker before/soon after this change ships, consistent
with this project's existing practice of not claiming contrast compliance
from calculation or automated scans alone.

### 2. Elevation now has tokens (DEC-008)

No shadow token existed; components picked from Tailwind's raw default
shadow scale ad hoc (`shadow-sm`/`-lg`/`-xl`/`-2xl` all appeared on
nominally-equivalent card surfaces), conflicting with the "three levels
only" rule already in `docs/DESIGN_SYSTEM.md`.

Added exactly two new shadow tokens (`--ds-shadow-raised`, `--ds-shadow-overlay`)
mapped to `shadow-raised`/`shadow-overlay` Tailwind utilities. Values were
not invented — they're the pre-existing `.glass-card` and (now-removed)
`.word-meaning-dialog` shadow values, so no surface's actual shadow changes
as a result of this delta. Migrating existing `shadow-lg`/`shadow-xl`/etc.
call sites onto the new tokens is deferred — that's a mass, low-risk-but-wide
find-and-replace better scoped to Phase 03 (Shared Components), not bundled
into this token-definition change.

### 3. `bg-card` is opaque by default (reconciles DEC-003)

`.bg-card, .glass-card, .wird-card { backdrop-filter: blur(16px); ... }`
made the blurred glass look the default for essentially every card in the
app (`bg-card` is the Tailwind utility nearly every card uses), which
conflicted with DEC-003 ("stable opaque surfaces … for functional/devotional
content") and with `docs/DESIGN_SYSTEM.md`'s own "Opaque, high-contrast
cards and reading areas" line.

`.bg-card` no longer carries `backdrop-filter`. The glass/blur treatment is
now scoped to `.glass-card`/`.wird-card` only — an explicit opt-in for
decorative, non-functional surfaces. This was a user-approved call (the
alternative was narrowing DEC-003 to apply only to Reader/counter surfaces);
opaque-by-default was chosen as the lower-risk, doc-compliant default.

### 4. Focus-ring token bypasses fixed, not the full mechanism (DEC-007, partial)

Four card/button surfaces (`HomeScreen.tsx`'s reminder toggle and primary
CTA, `TasbeehCounterButton.tsx`, `ProgressViews.tsx`, `RoutineGarden.tsx`)
used a raw hex (`#fbbf24`) or raw Tailwind palette color (`amber-500`) for
their focus ring instead of the `--ring` token. Beyond inconsistency, this
meant a user in colorblind-support mode (`data-color-blind-support`, which
remaps `--ring` per deuteranopia/protanopia/tritanopia) got **no benefit at
all** on these specific controls — the single most consequential conflict
found in the Phase 02 analysis. All four are fixed to `ring-ring`.

The broader inconsistency — focus rings implemented with 5+ different
widths (`ring-1`/`ring-2`/`ring-[2px]`/`ring-[3px]`) and varying opacity
(`ring-ring`, `ring-ring/40`, `ring-ring/50`) across ~30 files — is **not**
resolved by this delta. It's flagged in the Phase 02 analysis as the
highest-blast-radius item and left for its own tightly-scoped follow-up
change (DEC-007 remains open on the width/opacity question specifically).
Added `--ds-focus-offset: 2px` as a token now so that follow-up has
something to converge on.

### 5. Dead/orphaned code removed

- `src/app/theme.ts`'s `T` object — a second, hand-maintained hex palette
  duplicating `theme.css`, 24 of its 26 properties unused. Only the 2 values
  feeding the `theme-color` meta tag were live; those are now inlined with a
  comment pointing back to `theme.css` as the source of truth.
- `.word-meaning-dialog` / `.word-meaning-dialog-positioner` CSS
  (`theme.css`) — unreferenced by any component, and its `640px` width would
  have violated DEC-004's 600px reader/modal cap had it ever been wired up.
- `tailwind.css`'s `--radius-card`/`--radius-sheet` — unused anywhere in
  `src` (`rounded-card`/`rounded-sheet` had zero call sites); `--ds-radius-card`/
  `--ds-radius-overlay` already cover those roles via `rounded-2xl`/`rounded-3xl`.
- `tailwind.css`'s `--radius-btn: 0.75rem` (12px) — a fourth, unmatched radius
  value used only in `CategoryScreen.tsx` (5 buttons). Now aliases
  `--ds-radius-control` (14px) so those buttons match every other control's
  radius instead of introducing their own scale.

### 6. DEC-004 (reader/modal width cap) — implementation gap closed

`QuranWordMeaningSheet.tsx` and `ReaderReferenceSheet.tsx`'s desktop dialog
variants used `max-w-2xl` (672px), exceeding DEC-004's approved ~430–600px
cap. Both now use `max-w-[var(--content-reading)]` (600px) — reusing the
same token `.reader-column` already uses, rather than a new magic number.

### 7. Border-token aliasing — documented, not collapsed

`--border`/`--border-subtle` and `--input`/`--border-control` are identical
per theme today (four names expressing two visual weights). Rather than
collapsing the names (a wider rename across every consumer) or leaving it
silently ambiguous, `theme.css` now carries a comment explaining the
aliasing is intentional, so a future contributor doesn't "fix" it as a bug.

## What this delta deliberately does not touch

Per Phase 02's scope boundaries (no screen-specific redesign, no new icon
library, no CSS framework replacement, no silent shell change):

- The 131 raw Tailwind-palette color occurrences and 564 arbitrary-bracket
  values across the wider codebase are not migrated. The tokens now exist
  for new code to use; retroactive migration is Phase 03/03B work,
  concentrated in `ProgressViews.tsx`/`RoutineGarden.tsx`, which are already
  flagged for structural splitting.
- Full focus-ring width/opacity normalization (see §4 above).
- Typography scale (the informal 13/15/17px one-offs) — treated as
  documentation debt, not a token gap, since it's mostly 1-2px drift from
  Tailwind defaults rather than a structural inconsistency.
- The hybrid responsive shell (DEC-001/DEC-004) itself was found already
  substantially implemented, not a gap — see the Phase 02 report.
