# Design consistency audit — 2026-08-15

Audited commit: `54b2b14` (main).

Method: source audit plus live computed-style probing of the running dev server at
1280×720 and 320×700 in Light, Midnight and Dark themes. Findings marked **Verified live**
were reproduced against rendered output, not inferred from source.

Scope requested: consistency of padding, border radius, color, effects, animation, and
dropdown styling/position; plus maintainability, accessibility, visual appeal,
responsiveness and performance.

## Severity definitions

| Severity     | Meaning                                                                              |
| ------------ | ------------------------------------------------------------------------------------ |
| **Critical** | A documented contract does not reach the browser; user-visible defect on a core flow |
| **High**     | Systemic inconsistency or a token that does not do its job in a shipping theme       |
| **Medium**   | Localized drift, dead code, or a gap in enforcement                                  |
| **Passing**  | Checked and found correct; recorded so it is not "fixed" by mistake                  |

## Status

✅ resolved · ⏸ deferred (with recorded reason)

Phase 15 (DEC-064/065) closed F01–F05 and F32. Phase 18 (DEC-066) closed F24–F26, F33 and
F34, and deferred F27 to Phase 20 because this environment cannot composite frames and the
brief requires a measurement rather than an assumption.

## Root cause

F01 is upstream of F02–F05 and contributes to F06 and F08. Fix it first; several findings
will change shape or close outright once the design-system primitives actually compile.

## Findings register

| ID  | Severity | Area            | Finding                                                                     | Phase |
| --- | -------- | --------------- | --------------------------------------------------------------------------- | ----- |
| F01 | Critical | Build           | Tailwind never compiles utilities used only in `components/ui/`             | 15 ✅ |
| F02 | Critical | Overlays        | Destructive-confirmation dialog is unpositioned and unscrimmed              | 15 ✅ |
| F03 | Critical | Overlays        | Every modal and drawer scrim is transparent                                 | 15 ✅ |
| F04 | Critical | Menus           | Menu items lose padding, indicator sizing and height clamp                  | 15 ✅ |
| F05 | Critical | Auth            | OTP field in the auth flow is unstyled                                      | 15 ✅ |
| F06 | High     | Menus           | Three incompatible dropdown recipes ship side by side                       | 17 ✅ |
| F07 | High     | Menus           | Select and DropdownMenu are two different design languages                  | 17 ✅ |
| F08 | High     | Menus           | Checkbox/radio/sub-trigger items below the 44px target                      | 17 ✅ |
| F09 | Medium   | Menus / RTL     | RTL menu alignment handled two contradictory ways                           | 17 ✅ |
| F10 | Medium   | Menus           | No collision padding on any menu                                            | 17 ✅ |
| F11 | High     | Elevation       | Raised elevation is invisible in Midnight and Dark                          | 16 ✅ |
| F12 | High     | Surfaces        | `.adaptive-counter-surface` defined twice with conflicting values           | 16 ✅ |
| F13 | Medium   | Radius          | Seven distinct corner radii on Home alone                                   | 19    |
| F14 | Medium   | Spacing         | Padding drifts off the documented 4px grid                                  | 19    |
| F15 | Medium   | Counter         | Shipped counter geometry contradicts its own contract — resolved by DEC-065 | 16 ✅ |
| F16 | Passing  | Color           | Contrast passes AA with headroom in all three themes                        | —     |
| F17 | High     | Color           | 251 raw palette classes bypass the token layer across 17 files              | 19    |
| F18 | High     | Motion          | `favorite-pop` keyframes undefined; save microinteraction is a no-op        | 20    |
| F19 | Medium   | Motion          | Motion duration/easing tokens exist but nothing consumes them               | 20    |
| F20 | Medium   | Motion          | Entrance animations exceed the documented 240–300ms band                    | 20    |
| F21 | Medium   | Motion          | `slide-up` animates opacity only; the name is misleading                    | 20    |
| F22 | Medium   | CSS structure   | Duplicated keyframes and rules across two stylesheets                       | 16 ✅ |
| F23 | Medium   | Motion          | `transition-all` in 19 files animates layout properties                     | 20    |
| F24 | High     | Performance     | 24MB of unreferenced imagery deployed on every release                      | 18 ✅ |
| F25 | High     | Build gate      | Bundle budget cannot see static `public/` assets                            | 18 ✅ |
| F26 | Medium   | Performance     | 3 of 4 `<img>` lack loading/decoding hints and intrinsic size               | 18 ✅ |
| F27 | Medium   | Performance     | Full-viewport blended noise layer paints on every screen                    | 20 ⏸  |
| F28 | Medium   | Performance     | No memoisation, on top of several very large components                     | 20    |
| F29 | Passing  | Responsive      | No overflow at 320px; no sub-44px targets; tier boundaries agree            | —     |
| F30 | Medium   | Responsive      | Two undocumented breakpoints alongside the four-tier contract               | 20    |
| F31 | Medium   | Accessibility   | Sidebar language control named inconsistently with its sibling              | 17 ✅ |
| F32 | Medium   | Test coverage   | Automated a11y gate cannot see geometry defects                             | 15 ✅ |
| F33 | Medium   | Hygiene         | Working files committed to the repository                                   | 18 ✅ |
| F34 | Medium   | Hygiene         | Blanket `*.png` ignore silently drops new image assets                      | 18 ✅ |
| F35 | Medium   | Maintainability | `theme.css` is a 1,296-line monolith                                        | 20    |
| F36 | Medium   | Documentation   | Documentation drift and scaffolding leftovers                               | 20    |
| F37 | High     | Test coverage   | Touch-target test measures the Category screen before it is laid out        | ✅    |

---

## Detail

### F09 correction — the audit named the wrong culprit

The audit inferred that because no `DirectionProvider` was mounted, Radix defaulted to LTR,
making `CustomCounterScreen`'s manual flip the correct site and the other six wrong. That
inference was wrong. Every `DropdownMenu` root already passes `dir={direction}`, so logical
alignment resolved correctly everywhere and the manual flip was a **double flip** — the only
incorrect site. The finding itself stands: two contradictory patterns existed and one was
wrong. Only the identification was inverted. Corrected under DEC-068 and now covered by an
LTR/RTL mirroring test rather than inspection.

### F37 — Touch-target test measures before layout · High · Reproduced and fixed

Found during the Phase 15–18 programme rather than in the original review, and recorded
here so the register stays the single source of truth.

`e2e/accessibility.spec.ts` failed intermittently with 116 controls reported at 0x0 on the
Category screen. That is not a touch-target regression — it is the whole screen measured
before it was laid out. Two causes, both in the test:

1. Every step in that test waits for a landmark before measuring, **except** the Category
   step, which measured immediately after `category-card-morning.click()`.
2. `expectVisibleInteractiveTargetsAtLeast44px` queries and measures in a single pass with
   no polling, so a screen mid-mount is indistinguishable from a real violation.

Reproduced deterministically with `--repeat-each=12` across the three Chromium projects:

```
before fix:  3 failed / 36  — all three on "Category"
after fix:  36 passed / 36  — zero Category failures
```

The fix adds the missing landmark wait and wraps the measurement in `expect.toPass()`,
matching the Phase 14 precedent in `reader-microinteractions.spec.ts`. Polling does not
mask a real regression: a genuinely undersized control keeps failing until the timeout.

**Not a product defect.** No application code changed.

### Two other flaky runs, and what they actually were

`responsive.spec.ts` and `reader-microinteractions.spec.ts` also failed during this
programme. Neither reproduced: `--repeat-each=8` over the affected responsive tests passed
96/96, and `reader-microinteractions` passed 16/16 standalone. Their failures correlated
with a self-inflicted condition rather than a repository defect — `CI=true` was being set
locally to work around a pnpm TTY prompt, and `playwright.config.ts` couples worker count
to that same variable (`workers: process.env.CI ? 3 : 2`), silently raising local
parallelism to 3 during the heavy pre-push gate. The pnpm workaround stopped being
necessary once `node_modules` was reinstalled under the pinned pnpm 11. With it removed,
the full suite runs 420/420 on two workers.

**Latent risk, not fixed:** the suite has 68 geometry measurements and only 2 are guarded
by `expect.toPass()`. The other 66 are the same shape as F37 and could fail the same way
under load. They are not rewritten here because none of them has been observed failing, and
speculatively rewriting working tests carries its own risk. Worth a dedicated pass if the
flakiness recurs.

### F01 — Tailwind never compiles utilities used only in `components/ui/` · Critical

`src/styles/tailwind.css` excludes the primitives directory, then attempts to re-include
seven files. In Tailwind v4 the negative pattern takes precedence, so the re-include is
inert. Any utility used **only** inside those primitives is absent from the compiled CSS.

```
@source not '../app/components/ui/**/*.{js,ts,jsx,tsx}'
@source '../app/components/ui/{alert-dialog,button,drawer,dropdown-menu,input-otp,scroll-area,select}.tsx'
```

Verified live (dev server, Midnight): `.rounded-sm` → `0px`, `--radius-sm` → empty.
Verified in build: `grep '\.rounded-sm{' dist/assets/*.css` → 0 matches.

41 classes affected:

```
Layout/position  top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
                 max-w-[calc(100%-2rem)]  min-w-[8rem]  w-[100px]  h-auto
Menu internals   rounded-sm  ps-8  pe-2  py-1.5  gap-1.5  size-4  size-3.5
                 start-2  ml-auto  -mx-1  outline-hidden  cursor-default
Radix bindings   max-h-(--radix-dropdown-menu-content-available-height)
                 origin-(--radix-dropdown-menu-content-transform-origin)
Surfaces         bg-black/50  bg-input-background  border-input
                 rounded-[inherit]  p-px  touch-none  border-l  border-r
                 border-l-transparent  border-t-transparent
Misc             animate-caret-blink  tracking-widest  duration-1000
                 transition-[color,box-shadow]
```

### F02 — Destructive-confirmation dialog is unpositioned and unscrimmed · Critical · Verified live

Consequence of F01. Settings → Account & data → **Erase local data** at 1280×720:

```
dialog   position: absolute   top: 0px   left: 0px   transform: none
         rendered at (0, 0), 1280 × 198 px — pinned to the shell's top-left
overlay  background-color: rgba(0, 0, 0, 0)   ← fully transparent scrim
```

This is the dialog that erases saved zikr and progress. Axe passes it: roles, labels and
contrast are correct, only the geometry is wrong.

### F03 — Every modal and drawer scrim is transparent · Critical

`bg-black/50` is used by `ui/alert-dialog.tsx` and `ui/drawer.tsx` and nowhere else, so it
is never generated. `DESIGN_SYSTEM.md` defines a Scrim color role that nothing renders.
`ResponsiveSheet` escapes this only because its `bg-black/60` lives outside the excluded
directory.

### F04 — Menu items lose padding, indicator sizing and height clamp · Critical · Verified live

`ps-8`, `pe-2`, `py-1.5`, `size-4`, `size-3.5` and `start-2` are primitive-only. The
hand-written `[data-slot="dropdown-menu-radio-item"]` rules in `theme.css` re-adding
`padding-inline-start: 2rem` are a workaround for this. Radio and checkbox items are
patched; plain `DropdownMenuItem` and `SelectItem` are not.

Missing `max-h-(--radix-…-available-height)` means menus cannot clamp to available space,
so a long menu on a short viewport overflows instead of scrolling internally. Missing
`origin-(--radix-…-transform-origin)` makes the open/close zoom animate from the element
centre rather than the trigger.

### F05 — OTP field in the auth flow is unstyled · Critical

`ui/input-otp.tsx` depends on `border-l`, `border-r`, `border-l-transparent`,
`border-t-transparent`, `w-[100px]`, `p-px`, `bg-input-background`, `border-input` and
`animate-caret-blink` — all primitive-only, all missing. Slot separators, field background
and the blinking caret do not render. No e2e coverage.

### F06 — Three incompatible dropdown recipes · High · Verified live

```
                     radius   padding   item radius   min-w    offset   shadow
Library scope         20px     6px       14px          208px    4px      md
Masbaha "More"         8px     4px        0px          auto     4px      md
Reader menu           20px     6px       14px          210px    8px      xl
Counter target        20px     6px       14px          208px    4px      md
Sub-menus              8px     4px        0px          auto     —        lg
```

Item radius `0px` is F01 showing through. The elevation values break the documented
three-level contract: `shadow-md`, `shadow-lg` and `shadow-xl` are all in play alongside
the `shadow-overlay` token created for this purpose.

Call sites: `CounterTargetPicker.tsx:76`, `AzkarLibraryScreen.tsx:156`,
`CategoryScreen.tsx:219`, `CustomCounterScreen.tsx:166`, `CustomCounterScreen.tsx:202`,
`FridaySalawatScreen.tsx:167`, `ReaderScreen.tsx:794`, `ReaderScreen.tsx:985`.

### F07 — Select and DropdownMenu are two different design languages · High

```
                    SelectContent                DropdownMenuContent
radius              var(--ds-radius-control)     rounded-md
border              border-border-control        border (default)
elevation           shadow-overlay               shadow-md
item radius         rounded-xl                   rounded-sm
check indicator     logical END  (pe-8)          logical START (ps-8)
```

`DESIGN_SYSTEM.md` states a selected menu item uses a logical-start checkmark.
`SelectItem` places it at logical end. In RTL these controls put the checkmark on opposite
sides of the screen.

### F08 — Checkbox/radio/sub-trigger items below the 44px target · High

`DropdownMenuItem` carries `min-h-11`. `DropdownMenuCheckboxItem`,
`DropdownMenuRadioItem` and `DropdownMenuSubTrigger` do not — they rely on `py-1.5`, which
is also missing per F01. Radio items measured 44px in the library scope menu only because
that call site adds its own padding.

### F09 — RTL menu alignment handled two contradictory ways · Medium

`CustomCounterScreen.tsx:203` flips manually with `align={direction === "rtl" ? "end" : "start"}`,
while `CounterTargetPicker`, `CategoryScreen` and `AzkarLibraryScreen` pass a plain
logical `align`. Radix resolves `start`/`end` against its direction context, and the app
never mounts a `DirectionProvider`, so one of these two patterns is wrong in Arabic.

### F10 — No collision padding on any menu · Medium

None of the call sites set `collisionPadding`. Combined with the missing available-height
clamp (F04), a menu opened near a viewport edge on a small device can sit flush against it
or overflow.

### F11 — Raised elevation invisible in Midnight and Dark · High · Verified live

`--ds-shadow-raised` is one value shared by all themes: `rgba(0,0,0,0.05)` and
`rgba(0,0,0,0.03)`, derived from the light-theme glass card. On the Midnight ground
(`#0a1228`) a 5% black shadow is imperceptible, so all 66 usages render flat with only a
border defining the edge — and that border is `--border-subtle`, measuring 1.88–2.40:1
against the card.

This is the likely cause of the ad-hoc `shadow-2xl` / `shadow-xl` / `shadow-lg` usages.

### F12 — `.adaptive-counter-surface` defined twice · High · Verified live

Two full rule sets: `theme.css` (translucent, `backdrop-filter: blur(24px)`, 38px radius)
and `ZikrComponents.css` (opaque `var(--card)`, `--border-control`, 24px radius). The
shipped result is a hybrid.

```
Masbaha counter, live, 1280px:
  background-color: rgb(17, 27, 53)     ← opaque (ZikrComponents.css)
  backdrop-filter:  blur(24px)          ← orphaned (theme.css)
  border-radius:    72px                ← neither; a later media query
```

A 24px backdrop blur behind an opaque surface is GPU cost with no visual result, and
creates an unexpected stacking context and containing block. The translucent variant also
contradicts DEC-003, which reserves glass for decorative surfaces.

### F13 — Seven distinct corner radii on Home alone · Medium · Verified live

Documented roles: 8 / 12–14 / 16–20 / 24 / full. Measured on Home at 1280px: `20px`,
`24px`, `22px`, `28px`, `14px`, `30px`, full.

```
rounded-[28px]  HomeCards:68  ProgressViews:222  TranquilityCompletionCard:29
rounded-[22px]  HomeScreen:642  FridaySalawatScreen:52
rounded-[30px]  HomeScreen:574
rounded-[40px]  MarketingLanding:56
rounded-[24px]  BenefitsScreen:71  CustomCounterScreen:234  FridaySalawat:188
                ProgressViews:65        ← rounded-3xl already resolves to 24px
```

### F14 — Padding off the 4px grid · Medium · Verified live

Contract: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. In use: `p-4.5` (18px), `p-3.5` (14px),
`p-2.5` (10px), `px-1.5` (6px), `py-0.5` (2px). Live probe of Home returned paddings of
`18px`, `2px 10px`, `6px 12px`, `4px 12px`. The half-steps cluster in chips and badges,
suggesting one missing compact-chip spacing role rather than many independent mistakes.

### F15 — Counter geometry contradicts its own contract · Medium · Resolved by DEC-065

`DESIGN_SYSTEM.md` specifies the counter fill is "clipped to the same 24px radius as the
control." Shipped: Reader 38px; Masbaha 44 / 52 / 72px across breakpoints.

**Decision (DEC-065): the document is authoritative.** The counter becomes a 24px rounded
rectangle at every breakpoint, restoring DEC-003's stable-surface intent. Phase 16
implements it by keeping the `ZikrComponents.css` definition and replacing the four radius
literals; the documented dimensions do not change.

### F16 — Contrast passes AA with headroom · Passing · Verified live

```
                        Light    Midnight   Dark      Required
foreground / bg         16.49    16.38      17.13     4.5
muted-fg  / bg           8.13    12.52       9.08     4.5
muted-fg  / card         8.84    11.48       8.38     4.5
primary   / card         6.24     7.18       7.55     4.5
primary-fg/ primary      6.24     7.83       8.19     4.5
border-control / card    4.39     3.85       3.57     3.0
```

Do not "rebalance" these values.

### F17 — 251 raw palette classes bypass the token layer · High

```
bg-amber-500      35     text-emerald-500   16     text-slate-950   6
border-amber-500  26     text-emerald-600   12     bg-slate-950     4
text-amber-500    19     text-emerald-400   12     text-indigo-400  3
…plus amber-100/200/300/400/600/700/900/950, blue-500, zinc-800
```

Across 17 files. These do not follow the theme and, critically, do not follow the
accessibility modes: `high-contrast`, `deuteranopia`, `protanopia` and `tritanopia` all
work by redefining `--primary`, `--accent` and `--ring`. A user enabling protanopia
support gets a blue primary everywhere except the ~80 places hardcoded to amber.

Raw hex also appears in `ReaderScreen.tsx`, `CompletionScreen.tsx`, `GardenMarks.tsx` and
`TranquilityCompletionCard.tsx`.

### F18 — `favorite-pop` keyframes undefined · High

The motion contract requires "save heart pops once." No `@keyframes favorite-pop` and no
`.favorite-pop` rule exist anywhere in the codebase.

```
ReaderScreen.tsx:663, :826       className="favorite-pop …"
ReaderReferenceSheet.tsx:79      className="favorite-pop text-primary"
ThemeModeSelector.tsx:51         className="… element-pop"
theme.css:875                    animation: favorite-pop …   ← undefined
```

### F19 — Motion tokens exist but nothing consumes them · Medium

`--motion-duration-press/fast/standard/emphasis` and the three easing tokens are defined
but not exposed to Tailwind, so components use raw `duration-150/200/300/500/700/1000`.
CSS files use 18 distinct hardcoded durations.

### F20 — Entrance animations exceed the documented band · Medium

Contract: 240–300ms with `cubic-bezier(0.22, 1, 0.36, 1)`. `.fade-in` runs 500ms and
`.slide-up` 400ms, both with `cubic-bezier(0.4, 0, 0.2, 1)`. `.fade-in` is on all four
Progress views.

### F21 — `slide-up` animates opacity only · Medium

Its keyframes contain no translate. It is a duplicate of `fade-in` with a misleading name.

### F22 — Duplicated keyframes and rules across two stylesheets · Medium

`@keyframes tap-ripple-expand`, `.tap-ripple`, `.pulse-ring` and
`.adaptive-counter-surface` are each declared in both `theme.css` and
`ZikrComponents.css`. Which wins depends on bundler CSS ordering, which changes with
code-splitting — that is how F12 arose. `.pulse-ring` additionally sets only
`animation-name`, and its sizing overrides use `!important`.

### F23 — `transition-all` in 19 files · Medium

Animates layout-affecting properties. The motion contract requires opacity and transform
wherever possible. `.interactive-elem` and `SelectTrigger` already do this correctly.

### F24 — 24MB of unreferenced imagery deployed · High · Verified against dist/

```
dist/azkar-responsive-assets/   16,972 KB   0 references in src/ or index.html
dist/colored palm tree.png       1,944 KB   0 references
dist/dimmed palm tree.png        1,796 KB   0 references
dist/Before Sleep.png            1,540 KB   0 references
dist/Evening.png                 1,424 KB   0 references
dist/Morning.png                 1,404 KB   0 references
dist/assets/backgrounds/Originals/…         uncompressed masters, ~5 MB
dist/mosque_prophet.jpg            540 KB   superseded by images/*.png
```

`dist/` totals 36MB. `azkar-responsive-assets/` contains a nested duplicate of `public/`
itself plus Figma reference renders. The optimised responsive set the app actually loads
is correct and well built; this is dead weight travelling alongside it.

### F25 — Bundle budget cannot see static assets · High

`scripts/check-bundle-budget.mjs` iterates `dist/assets` only. Everything copied from
`public/` sits outside that directory, so the 24MB in F24 passed the gate unremarked.

### F26 — Images lack loading and decoding hints · Medium

Only `AzkarHeroBackground` sets them. `HomeCards` (two images) and `HomeScreen:791` do not.
None of the four declare `width`/`height` or `aspect-ratio`.

### F27 — Full-viewport blended noise layer · Medium

`.app-shell::after` covers the viewport with repeating SVG turbulence under
`mix-blend-mode: overlay`, forcing the compositor to re-blend on scroll and during any
animation beneath it, on every screen. Correctly disabled for reduced-transparency and
high-contrast, but not for ordinary devices.

### F28 — No memoisation, on top of very large components · Medium

No `React.memo` in `src/app/components`. The counter path re-renders through `App.tsx`
(1,433 lines), `ReaderScreen.tsx` (1,078) and `ProgressViews.tsx` (1,212). Profile before
memoising.

### F29 — Responsive fundamentals hold up · Passing · Verified live

At 320×700, Home and Settings produced zero document-level horizontal overflow
(`scrollWidth` 320 = `innerWidth` 320) and zero interactive targets under 44px. The
post-prayer carousel's overflowing children are the intended snap-scroll cue. JS tier
boundaries in `useLayoutMode` (600/900/1200) agree exactly with the CSS media queries
(37.5/56.25/75rem).

### F30 — Two undocumented breakpoints · Medium

The scrollbar treatment, `.app-shell`'s desktop border, the Home grid and the counter size
steps key off 768px and 1024px, which belong to no documented tier. The counter grows at
768px while navigation changes at 900px; scrollbars appear mid-way through `medium`.

### F31 — Sidebar language control named inconsistently · Medium · Verified live

The theme control exposes `aria-label="Theme: Midnight"`. The language control beside it
has no label, so its accessible name is concatenated text content: `"LanguageEnglish"`.

### F32 — Automated a11y gate cannot see geometry defects · Medium

F02, F03 and F12 all pass axe cleanly. `AGENTS.md` already warns that automated scans are
necessary but not sufficient; this is a concrete instance.

### F33 — Working files committed · Medium

```
tracked in git:   stash.diff  full_msgs.txt  msgs.txt  tmp_counter.txt  fix_a11y.py
untracked:        tmp-reader-vite.log  tmp-reader-vite-error.log
```

### F34 — Blanket `*.png` ignore drops new image assets · Medium

`.gitignore` ignores all PNGs with one negation for phase evidence. Its own comment records
that this already caused the Phase 01 baseline to be silently never committed. Every
product PNG in `public/` is present only because it was force-added.

### F35 — `theme.css` is a 1,296-line monolith · Medium

Holds theme tokens, four accessibility mode overrides, the Tailwind theme bridge, base
resets, component classes, nine keyframe sets, the scrollbar treatment, dropdown item
patches, the app-shell responsive grid, nav rail and sidebar styling, the glass card system
and the noise overlay. This is why rules ended up duplicated in `ZikrComponents.css`.

### F36 — Documentation drift and scaffolding leftovers · Medium

- `DESIGN_SYSTEM.md` specifies three elevation levels; the `theme.css` comment above the
  tokens says "Two elevation levels only, per docs/DESIGN_SYSTEM.md."
- `vite.config.ts` still carries "The React and Tailwind plugins are both required for
  Make, even if Tailwind is not being actively used" — a Figma Make scaffold leftover that
  is now misleading.
- The `@source` allow-list in `tailwind.css` names `scroll-area`, which nothing imports.

## Assessment

Almost nothing here is a design failure. The tokens are well chosen, contrast is better
than most shipping apps, the responsive tiers are coherent, and the documentation is
unusually specific. What is missing is enforcement: the gap between what
`DESIGN_SYSTEM.md` says and what the browser renders is unmonitored, so drift accumulates
invisibly and a single build-config line can delete 41 utility classes without anything
turning red. The highest-value work is closing that gap, not restyling.
