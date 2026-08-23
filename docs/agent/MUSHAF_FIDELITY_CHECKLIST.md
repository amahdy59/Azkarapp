# Mushaf reader — fidelity, performance and gate-speed checklist

Scope: the Khatmah/Mushaf reading surface (`src/app/screens/KhatmahReaderScreen.tsx`,
`src/app/components/MushafPageViewer.tsx`) plus the repository quality gates.

Raised from the reader review of 2026-08-23 against `9b68fdc`.

## 0. Reference decision (stick to one)

- [x] **DEC-089 — the reference is the King Fahd Complex Madani Mushaf, 15 lines per page,
      604 pages, rendered with the official QCF v2 per-page glyph fonts.**
      Every page's line breaks, surah-header slots, bismillah slots and ayah markers come from
      the per-word `line_number` map already stored in `public/data/mushaf/<page>.json`, which is
      that same layout. No other layout source is consulted, and the Unicode fallback must
      reproduce the _same geometry_ (same 15 slots, same line breaks) rather than reflowing.

## 1. Full-bleed page

- [x] 1.1 Reader screen renders edge to edge: drop `ScreenContainer`'s top/bottom padding for
      this screen and move safe-area insets onto the page chrome instead.
- [x] 1.2 Drop the `max-w-[500px] / sm:max-w-[580px] / md:max-w-[640px]` cap and the
      `sm:p-3` gutter so the page occupies the full viewport at every width.
- [x] 1.3 Drop the page card's `sm:rounded-2xl sm:border sm:shadow-raised sm:ring-1` and the
      `bg-muted/15` letterbox behind it.
- [x] 1.4 Toolbar is unchanged: same header row (back · surah · options), same footer row
      (prev · record · page · next), same heights, labels and icons.
- [x] 1.5 No horizontal document overflow at 320 px; page height still fills the viewport.

## 2. Real-Mushaf page geometry

- [x] 2.1 The 15 line slots are equal-height and always present, so page turns never reflow. The
      reference's two opening pages (Al-Fatihah and the start of Al-Baqarah) keep their own
      larger display setting over fewer lines, as in print.
- [x] 2.2 The page's type is scaled until the longest line lands on the margin, then each line is
      justified edge to edge like the printed Mushaf. A line far short of the measure — the last
      line of a surah — is centred instead of spread. The vertical guard is font-aware: QCF v2 may
      claim 94% of its slot, the Amiri fallback only 70%, because its marks paint well outside the
      box the browser reports.
- [x] 2.3 Lines that are naturally wider than the page are scaled down to fit instead of being
      clipped (the defect visible in the 599 screenshot).
- [x] 2.4 Surah header occupies exactly one line slot, drawn as a thin ornamented band —
      not the oversized rounded box that currently eats a third of the page.
- [x] 2.5 Bismillah occupies exactly one line slot.
- [x] 2.6 Ayah markers keep their inline metrics so they never push a line taller.

## 3. Legibility

- [x] 3.1 Mushaf text is rendered slightly bolder for clarity, via a hairline text stroke rather
      than synthetic bold (QCF is a single-weight face; faux-bold destroys the glyph shapes).
- [x] 3.2 The stroke is tuned per theme — thinner on the dark and OLED themes, where light ink on
      a black ground already blooms.

## 4. Difficult-words switch

- [x] 4.1 Add a real switch control (`role="switch"`, `aria-checked`) for difficult words,
      visible on the page toolbar — not buried as a menu checkbox.
- [x] 4.2 Turning it on reveals the reviewed word meanings; turning it off hides them.
- [x] 4.3 Toggling it never changes line geometry (existing e2e assertion must keep passing).
- [x] 4.4 Remove the now-duplicated options-menu entry.

## 5. Page navigation

- [x] 5.1 **Direction fix** — the control on the _right_ advances to the next page and the one on
      the _left_ goes back, in both Arabic and English. `ArrowRight` = next, `ArrowLeft` =
      previous. (Previously inverted in Arabic.)
- [x] 5.2 Swipe follows the carousel convention: dragging the page leftwards brings in the next
      page, matching the arrow that points the way you are travelling.
- [x] 5.3 Buttons stay responsive while a page is loading — the current page is never blanked to
      a spinner mid-turn.
- [x] 5.4 Rapid repeated presses coalesce instead of queueing one network round trip each.

## 6. Page-turn performance

- [x] 6.1 Bake the QCF `code_v2` glyph codes into `public/data/mushaf/<page>.json` so a page turn
      needs **zero** calls to `api.quran.com`. (Was: one API request + a 1800 ms abort timer per
      turn.)
- [x] 6.2 Persist the per-page QCF `woff2` in Cache Storage so the second visit and every offline
      read are instant.
- [x] 6.3 Prefetch the next _and_ previous page (data + font) on idle.
- [x] 6.4 Keep an LRU of parsed pages in memory and render from it synchronously.
- [x] 6.5 Memoise the per-word difficult-word lookup per page instead of re-querying ~150 times
      per render.
- [x] 6.6 Memoise the line renderer so toggling controls does not re-render the text canvas.
- [x] 6.7 Replace the drag/animation implementation with pointer handlers driving a single
      transform, so dragging does not re-render React on every frame.

## 7. Page-turn animation

- [x] 7.1 Remove the 300 px spring slide (sluggish, and it fights the drag).
- [x] 7.2 Replace with a short, simple cross-fade (≤180 ms, ease-out) that respects
      `prefers-reduced-motion` and the in-app reduced-motion setting.
- [x] 7.3 Motion-rules gate (`scripts/check-motion-rules.mjs`) still passes.

## 8. Quality-gate speed

- [x] 8.1 Baseline recorded: `pnpm test:run` = **3 m 34 s** (104 files / 551 tests) on this
      machine.
- [x] 8.2 Switch Vitest to the threads pool and share the module registry between files in a
      worker; keep every test passing and coverage thresholds unchanged.
- [x] 8.3 `pnpm check` runs its independent gates concurrently instead of strictly serially.
- [x] 8.4 Playwright: raise local workers off `2`, but cap at 4. Eight workers loaded the
      machine enough that six load-sensitive reader/navigation specs timed out; all six pass
      in isolation. A gate that fails at random is worth less than the minutes it saves.
- [x] 8.5 Playwright: stop running all 25 device-agnostic specs three times over. The two
      non-desktop Chromium projects now run only the nine specs whose assertions depend on the
      device, named in `playwright.config.ts`; `E2E_FULL_MATRIX=1` restores the full matrix for
      release evidence.
- [x] 8.6 Playwright: **rejected** — reusing a running preview server locally saves ~13 s and
      costs correctness. A leftover preview from an interrupted run serves whatever
      `.playwright-dist` happened to contain; a half-written one with no `sw.js` failed the
      offline spec and read exactly like a code regression. `reuseExistingServer` stays `false`.
- [x] 8.7 After numbers recorded below.

### Gate timings (this machine, 16 cores, no other load)

| Gate                            | Before   | After    |
| ------------------------------- | -------- | -------- |
| `pnpm test:run`                 | 3 m 34 s | 0 m 31 s |
| `pnpm check` (whole merge gate) | ~6 min   | 1 m 02 s |
| `pnpm test:e2e` test-runs       | 514      | 312      |
| `pnpm test:e2e` wall clock      | —        | 7 m 05 s |
| Playwright local workers        | 2        | 4        |

Where the test-run win came from: the stock `forks` pool stood up a process and a jsdom for each
of the 105 files — 918 s of accumulated worker time on environment setup against 306 s actually
running tests. Worker threads cut that to 1 m 49 s; sharing one module registry between the files
in a worker cut it to 31 s. The suites that cannot share a registry are listed in
`src/test/isolatedSuites.ts`, and `isolatedSuites.test.ts` fails if a new suite starts mocking a
module without being added — that is the fix for an order-dependent failure, never a weakened
assertion.

The `pnpm check` "before" is an estimate: the old serial chain ran the same eight stages
one after another with the 3 m 34 s test run inside it. `pnpm check:serial` still runs that chain
if you want to compare directly.

## 9. Verification

- [x] 9.1 Unit tests updated for the new switch, the new navigation mapping and the line-fit
      behaviour.
- [x] 9.2 `e2e/khatmah-reader.spec.ts` updated for the new mapping and switch.
- [x] 9.3 `pnpm check` green — every stage PASS in 1 m 02 s.
- [x] 9.4 `pnpm test:e2e` green — 312 passed, 0 failed, 7 m 05 s.
- [x] 9.5 Screenshots in `docs/agent/evidence/screenshots/current/`: `compact-` (320×700, page
      128), `phone-` (390×844, page 599 — the page from the report), `tablet-` (834×1112) and
      `desktop-` (1440×900, page 2, the larger opening setting).

## 10. Raised while doing the work — needs your call

- [ ] **[needs you]** The immersive Mushaf reader (`MushafImmersiveReader`, opened from the azkar
      reader for multi-page surahs) still uses the _old_ Arabic convention that DEC-086 approved:
      `ArrowLeft` advances, and the footer's start-side button is Previous. The standalone Mushaf
      now does the opposite (item 5.1). Two opposite page-turn conventions in one app is worse
      than either one — say the word and I will flip the immersive reader to match, along with
      its own spec and the DEC-086 note.
