# Phase 15 evidence — CSS delivery repair

Date: 2026-08-15. Baseline commit `54b2b14`. Measurements taken by computed-style probing
of the running application, and by comparing the built stylesheets before and after.

## Built CSS diff

Comparing `dist/assets/index-*.css` before and after removing the `@source not` exclusion:

```
before  128,082 bytes
after   144,160 bytes
delta   +16,078 bytes

selectors added    126
selectors removed    0
```

The one apparent removal, `.rounded-md`, was a false positive: Tailwind merged it with the
newly generated `.rounded-sm` into a single shared rule
(`.rounded-md,.rounded-sm{border-radius:var(--ds-radius-small)}`). Its declaration is
unchanged. Every real change is an addition, as Phase 15 Step 1 requires.

Notable additions beyond the 41 classes named in F01 — the menu open/close animations were
also never compiling:

```
data-[state=open]:animate-in        data-[state=closed]:animate-out
data-[state=open]:fade-in-0         data-[state=closed]:fade-out-0
data-[state=open]:zoom-in-95        data-[state=closed]:zoom-out-95
data-[side=bottom]:slide-in-from-top-2   (and the other three sides)
```

## Utility resolution, before and after

Probed against the live stylesheet in the Midnight theme:

| Utility                   | Before | After                |
| ------------------------- | ------ | -------------------- |
| `rounded-sm`              | `0px`  | `8px`                |
| `ps-8`                    | —      | `32px`               |
| `size-4`                  | —      | `16px × 16px`        |
| `min-w-[8rem]`            | —      | `128px`              |
| `bg-black/50`             | —      | `oklab(0 0 0 / 0.5)` |
| `max-w-[calc(100%-2rem)]` | —      | `calc(100% - 32px)`  |

`--radius-sm` resolved to an empty string before the fix, which is why `rounded-sm`
computed to `0px` rather than falling back to a default.

## F02 — destructive-action confirm dialog

Settings → Account & data → Erase local data, Midnight theme, 320 × 700 viewport.

Before:

```
dialog   position: absolute   top: 0px   left: 0px   transform: none
         rendered at (0, 0), 1280 × 198 px
overlay  background-color: rgba(0, 0, 0, 0)
```

After:

```
dialog   position: absolute   top: 350px   left: 160px   translate: -50% -50%
         rendered at (23, 221), 274 × 259 px
         centre offset from shell centre: dx 0, dy 0
         width 274 ≤ 320 − 32, so max-w-[calc(100%-2rem)] is honoured
overlay  background-color: oklab(0 0 0 / 0.5)
```

## F04 — menu item geometry

Masbaha → More options, 320 px viewport.

| Property                   | Before         | After                    |
| -------------------------- | -------------- | ------------------------ |
| item border radius         | `0px`          | `8px`                    |
| item height                | 44px\*         | `44px`                   |
| content `min-width`        | auto           | `128px`                  |
| content `max-height`       | `none`         | `640px`                  |
| content `transform-origin` | element centre | trigger (`191.24px 0px`) |
| item `outline-style`       | UA default     | `none`                   |

\* The pre-fix 44px came from the call site's own padding, not from the primitive.

The `max-height` value is the Radix available-height custom property, so a long menu on a
short viewport now clamps and scrolls internally instead of overflowing. The
`transform-origin` change means the open animation grows from the trigger.

A measurement note: with the Browser pane hidden the animation clock does not advance, so
menu content measures at its `zoom-in-95` start state (44 × 0.95 = 41.8px). Calling
`element.getAnimations().forEach(a => a.finish())` before measuring returns
`transform: none` and a true 44px. Playwright's `reducedMotion: "reduce"` avoids this in
the suite.

## Step 2 — workaround removal, verified equivalent

The `[data-slot="dropdown-menu-radio-item"]` padding and indicator-inset rules were removed
from `theme.css`. Measured after removal, with the geometry now coming from the compiled
`ps-8` / `pe-2` / `start-2` utilities:

| Direction | padding-inline-start | padding-inline-end | indicator inset from logical start | height |
| --------- | -------------------- | ------------------ | ---------------------------------- | ------ |
| LTR (en)  | `32px`               | `8px`              | `8px`                              | `44px` |
| RTL (ar)  | `32px`               | `8px`              | `8px`                              | `44px` |

Identical to what the removed rules produced. The `[data-state="checked"]` highlight was
kept — it is a deliberate theme decision, not a compensating patch.

## Regression coverage

`scripts/check-css-utilities.mjs` asserts 15 primitive-only canary classes are present in
the built CSS. Verified to fail on a deliberately reintroduced exclusion:

```
$ node scripts/check-css-utilities.mjs
Design-system utilities are missing from the built CSS.
Tailwind is not scanning src/app/components/ui — check the @source rules in
src/styles/tailwind.css. See DEC-064 / F01.

  .rounded-sm — menu and select item radius
  .ps-8 — menu item indicator gutter
  … 13 more
exit=1
```

`e2e/overlay-geometry.spec.ts` asserts dialog centring, scrim alpha, menu viewport bounds,
menu item radius and gutter, and the RTL indicator inset. These are the specific gap named
in F32: axe reports no violations on any of these surfaces in either state.

## Bundle budget

Restoring the CSS took `index.css` past the existing limits, which had been calibrated
against a build that was omitting it. Raised to 150 kB raw / 26 kB gzip under DEC-065.

```
index.css   raw  125.08 kB → 140.55 kB   (limit 134 → 150)
index.css   gzip  21.84 kB →  23.94 kB   (limit  23 →  26)
```

JavaScript budgets and the 200 kB initial-route gzip budget were unaffected and continued
to pass throughout. Removing the unused `scroll-area` component was measured as a possible
offset and recovered only 0.47 kB, so it was left for Phase 20.

## Environment note

The local `node_modules` had been installed by pnpm 9.15.0 while `package.json` pins
11.19.0, so `pnpm test:e2e` could not start its web server until
`pnpm install --frozen-lockfile` was run. Unrelated to this phase's changes.
