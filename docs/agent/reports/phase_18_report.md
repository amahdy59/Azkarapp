# Phase Report — Build Weight and Repository Hygiene

## Objective

Stop shipping assets nothing references, make the budget gate able to see them, and remove
the repository conditions that let both happen. Findings F24–F27, F33 and F34 from
`docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Scope completed

Steps 1, 2, 3, 4 and 6 completed. **Step 5 (F27, the noise overlay) deliberately deferred**
— see Known limitations.

## Files changed

- `public/` — design sources moved out, dead assets removed (114 files → 39)
- `design-sources/` — new, not copied by Vite
- `.gitignore` — blanket `*.png` narrowed; `design-sources/` excluded
- `scripts/check-bundle-budget.mjs` — whole-tree total and single-file ceilings
- `vite.config.ts` — eleven dead `globIgnores` entries removed
- `src/app/components/HomeCards.tsx`, `src/app/screens/HomeScreen.tsx` — image hints
- Removed tracked working files: `stash.diff`, `full_msgs.txt`, `msgs.txt`,
  `tmp_counter.txt`, `fix_a11y.py`

## Components added or modified

No component behaviour changed. `HomeCards` and `HomeScreen` gained `loading`, `decoding`
and intrinsic `width`/`height` on three decorative images.

## User-visible changes

None intended. Deployment size falls from 36 MB to 6.2 MB, and below-the-fold imagery no
longer blocks alongside the hero. Every image the application actually displays, its focal
points, and the responsive source sets are unchanged.

## Accessibility work

None in scope. The three images carry `alt=""` and remain decorative; adding intrinsic
dimensions reduces layout shift, which is a CLS improvement rather than an a11y change.

## Tests added or updated

No new tests. Existing coverage was used as the verification path: `e2e/offline-core.spec.ts`
and `e2e/pwa-update.spec.ts` for the offline requirement, and the extended budget gate,
which was demonstrated failing on a reintroduced source tree.

## Commands run

| Command                                             | Result                           |
| --------------------------------------------------- | -------------------------------- |
| `pnpm check`                                        | Pass (exit 0)                    |
| `pnpm test:e2e`                                     | 420 passed, 0 failed, 4 skipped  |
| `pnpm exec playwright test offline-core pwa-update` | 7 passed, 2 skipped              |
| `node scripts/check-bundle-budget.mjs`              | Pass; fails on reintroduced tree |
| `node scripts/check-css-utilities.mjs`              | Pass                             |

## Visual/manual evidence

`docs/agent/evidence/phase-18/ASSET_REFERENCE_MAP.md` records the reference map and the two
corrections it needed, the content-hash deduplication, the SHA-256 proof that the deleted
duplicate directory survives in the moved tree, the before/after sizes, the budget-gate
regression demonstration, and the entry-by-entry precache validation.

## Documentation updated

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md` — status column added; F24–F26, F33, F34 marked
  resolved; F27 reassigned to Phase 20
- `DECISION_LOG.md` — DEC-066

## Decisions recorded

**DEC-066** — deploy-path cleanup, asset preservation, and a whole-output budget gate.

## Known limitations or remaining risks

- ~~F27 deferred, not done.~~ **Closed by DEC-073.** The obstacle was the inspection pane,
  not the project: Playwright composites. Measured at 4× CPU throttle, the overlay costs
  0.2 ms of median frame time — inside run-to-run noise, with the overlay-on run the fastest
  of three. It stays.
- ~~The master images are still untracked.~~ **Resolved by DEC-071:** `design-sources/` is
  now tracked. Before committing, the tree was deduplicated — the nested `public/` subtree
  was removed after all 28 generated files were proven byte-identical to the tracked copies,
  and three of four `Originals/*.png` after proving them identical to their masters. 17 MB
  became 13 MB, 21 files, eight PNGs with eight distinct hashes.
- ~~Two large PNGs now dominate the precache.~~ **Closed by DEC-072.** Both were encoded to
  AVIF and WebP at unchanged dimensions — about 4% of the source at ~40 dB PSNR — taking the
  precache from 5,977 KiB to 2,925 KiB and `dist` to 3.3 MB.
- **Deleted files are recoverable from git history, but the conversation dumps are too.**
  `msgs.txt` and `full_msgs.txt` were transcripts. They are gone from the working tree but
  remain in history; if they contain anything sensitive, that needs a history rewrite,
  which is out of scope here.

## Out-of-scope findings

- The audit's 24 MB estimate was low. Five root PNGs (~7 MB) had been misclassified as
  referenced because `vite.config.ts` named them inside `globIgnores` — a listing that
  exists to _exclude_ an asset. Actual reduction is 30 MB.
- `islamic-corner-pattern.svg` was unused and removed; it was not in the audit's list.
- `account-deletion.html` and `landing/index.html` are unreferenced from application code
  but are published URLs — an app-store-required account-deletion page and a redirect. Both
  kept. Any future "delete everything unreferenced" pass must preserve them.

## Recommended next step

Phase 16 (Elevation and Surface Integrity) — F11, F12, F15 and F22, now unblocked by
DEC-065. It is the last phase whose value is primarily visual, and I can supply a
side-by-side comparison artifact so the counter-radius and elevation changes are reviewable
before they ship.
