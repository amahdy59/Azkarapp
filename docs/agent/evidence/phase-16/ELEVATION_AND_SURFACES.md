# Phase 16 evidence — elevation and surface integrity

Date: 2026-08-15. Baseline commit `b4cd97e`. Measured by computed-style probing of the
running application.

## F11 — raised elevation, resolved alpha per theme

`--ds-shadow-raised` was one value for every theme. Measured on a real `shadow-raised` card:

| Theme         | Before (max alpha) | After (max alpha) | Change |
| ------------- | ------------------ | ----------------- | ------ |
| Light         | 0.05               | 0.12              | 2.4x   |
| Midnight      | 0.05               | 0.55              | 11x    |
| Dark          | 0.05               | 0.55              | 11x    |
| High contrast | 0.05               | 0.75              | 15x    |

Resolved values after the change:

```
theme-light     0 1px 2px rgba(0,0,0,.05), 0 8px 24px -8px rgba(0,0,0,.12)
theme-midnight  0 1px 2px rgba(0,0,0,.4),  0 10px 28px -8px rgba(0,0,0,.55)
theme-dark      0 1px 2px rgba(0,0,0,.4),  0 10px 28px -8px rgba(0,0,0,.55)
high-contrast   0 2px 4px rgba(0,0,0,.75)
```

Light is deliberately the restrained one: the alpha that reads as depth on a dark ground
reads as soot on `#f8f5f0`.

The tokens are defined in the second `:root` block (the dark default) and overridden by
`.theme-light` and `.high-contrast` **after** it, because `:root` and a class both carry
specificity (0,1,0) and the later rule wins on a tie.

## F12 — counter surface, measured after the fix

```
border-radius:    24px          (was 38px; DEC-065)
backdrop-filter:  none          (was blur(24px), orphaned over an opaque surface)
background-color: rgb(17,27,53) = var(--card), opaque per DEC-003
border-color:     rgb(102,120,157) = var(--border-control)
```

Definition count across the codebase:

```
src/styles/theme.css                     0
src/app/components/ZikrComponents.css    1
```

## DEC-065 — radius collapsed to 24px

| Surface                   | Before  | After |
| ------------------------- | ------- | ----- |
| Reader counter            | 38px    | 24px  |
| Masbaha / Salawat compact | 44px    | 24px  |
| Masbaha tablet            | 48–52px | 24px  |
| Masbaha desktop           | 72px    | 24px  |
| Previous / Next           | 20px    | 24px  |

Dimensions are unchanged throughout. Previous/Next moved because the Reader contract
requires them to share the counter's radius.

## F11 — ad-hoc shadows retired

Fourteen call sites collapsed onto the two tokens:

```
overlay  AppErrorBoundary, ConfirmDialog, FloatingAudioPlayer, ui/alert-dialog,
         ui/dropdown-menu (sub-content), MarketingLanding, ReaderScreen (x2)
raised   HomeCards (x2), ProgressViews, PwaNotice, HomeScreen
removed  App.tsx .app-shell — dead, see below
```

`shadow-2xl` on `.app-shell` never rendered: `theme.css` sets `box-shadow: none` on that
element both at `max-width: 599px` and at `min-width: 37.5rem`, which covers every viewport
width. It was removed rather than remapped.

`.glass-card` / `.wird-card` now consume `var(--ds-shadow-raised)` instead of duplicating
per-theme literals.

## F22 — duplicate rules removed from theme.css

`.adaptive-counter-surface` and its four state rules, `.tap-ripple`,
`@keyframes tap-ripple-expand`, `.pulse-ring`, and the `.tap-ripple` reduced-motion rule
were all declared in both stylesheets. `ZikrComponents.css` keeps them; `theme.css` keeps a
comment explaining why they must not come back.

`.counter-ring-stage` was found to be referenced by nothing and removed with the block.

`.pulse-ring` now carries its own `animation-duration`, `animation-timing-function` and
`animation-fill-mode` instead of relying on an inline style in `ZikrComponents.tsx`. The
values are carried over unchanged — Phase 20 owns motion timings. The `!important` on the
breakpoint width/height is retained and documented: the component sets those two properties
inline from the measured counter size, and inline styles outrank a class.

## Known remaining drift

`shadow-sm` (17), `shadow-xs` (17), `shadow-2xs` (10) and `shadow-md` (13) are still in use.
The phase brief scoped this step to `xl`/`2xl`/`lg`, and these smaller values are a
different question — whether the contract needs a fourth, subtle role or whether they should
collapse onto raised. Recorded rather than changed.
