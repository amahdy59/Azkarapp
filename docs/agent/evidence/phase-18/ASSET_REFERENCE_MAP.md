# Phase 18 evidence — asset reference map and deploy-path cleanup

Date: 2026-08-15. Baseline commit `d0c4a97`.

## Method

Every file under `public/` was checked against the set of real consumers: `src/`,
`index.html`, `.github/`, the standalone HTML pages in `public/`, and `vite.config.ts`.

Two corrections were needed before the map could be trusted:

1. **`globIgnores` is not a reference.** `vite.config.ts` named five root PNGs, but only
   inside `workbox.globIgnores`, where an asset is listed precisely to keep it _out_ of the
   precache. Counting that as a reference made ~7 MB of dead imagery look used.
2. **`manifest.icons` is a reference.** Excluding the whole of `vite.config.ts` to fix (1)
   then made `512.png` — a PWA icon — look unreferenced.

The final map counts `vite.config.ts` as a consumer with its `globIgnores` array stripped.

Asset paths in `src/app/components/azkar-backgrounds.ts` are static string literals, not
constructed at runtime, so basename matching is sound for this codebase.

## Result

```
REFERENCED    67 files    4.0 MB
UNREFERENCED  47 files   30.8 MB
```

## The preservation hazard

Of the 114 files in `public/`, 99 were tracked by git and 15 were not. The 15 untracked
files were **exactly** the uncompressed masters and design references — hidden from git by
the blanket `*.png` rule in F34. Deleting them would have been unrecoverable.

Content hashing showed the 15 files hold only 8 unique images:

| Hash (16) | Size    | Copies | Note                                         |
| --------- | ------- | ------ | -------------------------------------------- |
| ffff49d5  | 1552 KB | 3      | evening master                               |
| 62977c6c  | 1376 KB | 3      | morning master                               |
| 297f043b  | 1319 KB | 3      | sleep master                                 |
| caf2b9cf  | 1707 KB | 2      | friday                                       |
| f03c5b5b  | 1633 KB | 1      | friday-master — **different image** to above |
| 75d2a710  | 1463 KB | 1      | desktop reference variation 1                |
| 7e6f0022  | 1443 KB | 1      | desktop reference variation 2                |
| 6a47fabc  | 1507 KB | 1      | desktop reference variation 3                |

`friday.png` and `friday-master.png` are not duplicates of each other, so both were kept.

Before deleting `public/assets/backgrounds/Originals/`, every hash in it was proven to
exist inside the tree being moved:

```
PRESERVED  297f043bc2882a4a  sleep.png
PRESERVED  62977c6c12acd0df  morning.png
PRESERVED  caf2b9cf81d98a5d  friday.png
PRESERVED  ffff49d5b65e613e  evening.png
```

## Disposition

**Moved to `design-sources/` (out of the deploy path, content preserved on disk):**

- `public/azkar-responsive-assets/` — 17 MB, including a nested duplicate of `public/`
  itself, Figma reference renders, source masters, and example code
- `public/assets/backgrounds/Originals/` — 5.9 MB, deleted rather than moved because every
  hash was proven present in the moved tree

**Deleted (unreferenced _and_ tracked in git, so recoverable):**

| File                                                     | Size    |
| -------------------------------------------------------- | ------- |
| `colored palm tree.png`                                  | 1942 KB |
| `dimmed palm tree.png`                                   | 1793 KB |
| `Before Sleep.png`                                       | 1540 KB |
| `Evening.png`                                            | 1423 KB |
| `Morning.png`                                            | 1400 KB |
| `mosque_prophet.jpg` (superseded by `images/*.png`)      | 538 KB  |
| `webp/` (9 files, superseded generation)                 | ~250 KB |
| `evening_sky.webp`, `morning_sky.webp`, `sleep_sky.webp` | ~186 KB |
| `islamic-corner-pattern.svg` (unused)                    | 5 KB    |

**Kept despite being unreferenced from application code:**

- `account-deletion.html` — the account-deletion page required by app-store policy, served
  at a published URL
- `landing/index.html` — a published redirect to `../?view=landing`

Both are externally linked URLs, which is the case the phase brief warned about.

## Outcome

```
public/   35 MB -> 3.8 MB   (114 files -> 39)
dist/     36 MB -> 6.2 MB
```

30 MB removed per deployment — larger than the audit's 24 MB projection, because the audit
had not yet identified the five root PNGs as dead.

## Budget gate

`scripts/check-bundle-budget.mjs` now walks the whole of `dist/`, not just `dist/assets`:
an 8 MB total ceiling and a 2 MB single-file ceiling. Demonstrated to catch a regression by
copying the design-source tree back into `dist/`:

```
Bundle budget exceeded:
dist total: 23456375 bytes exceeds 8388608 bytes
exit=1
```

The eleven now-dead `globIgnores` entries were removed; only `**/FridayModeScreen-*.js`
remains, which is a real exclusion.

## Precache integrity

Every precached URL was validated against disk after the cleanup:

```
precache entries: 129
missing on disk:   0
stale/removed assets precached: 0
```

(Two apparent matches for a stale-asset pattern were `palm tree.svg`, a real referenced
file distinct from the deleted `colored palm tree.png` / `dimmed palm tree.png`.)

The two largest precached entries are now `images/mosque_prophet.png` (1683 KB) and
`images/benefits_zikr.png` (1663 KB). Both are genuinely referenced and both are
photographs stored as PNG at 1254×1254. Re-encoding them to WebP/AVIF is the single largest
remaining win — roughly 3 MB of the 5.8 MB precache — but it touches reviewed artwork and
was not attempted here.

## Images

`loading="lazy"`, `decoding="async"` and true 1254×1254 intrinsic dimensions were added to
the three lazy `<img>` elements in `HomeCards.tsx` (two) and `HomeScreen.tsx` (one). The
LCP hero in `AzkarHeroBackground.tsx` already had the correct treatment and keeps
`loading="eager"` with `fetchpriority="high"`.

## F27 deferred, with reason

The full-viewport `mix-blend-mode: overlay` noise layer was **not** changed. The phase brief
requires a measurement rather than an assumption, and this environment cannot produce one:

```
requestAnimationFrame delivered 0 frames in 4000 ms
```

The browser pane does not composite, so any paint or scroll-cost figure would be invented.
Removing the overlay on a guess would violate the brief's own instruction. F27 carries
forward to Phase 20.

## Gate results

| Command                                   | Result                           |
| ----------------------------------------- | -------------------------------- |
| `pnpm check`                              | Pass (exit 0)                    |
| `pnpm test:e2e`                           | 420 passed, 0 failed, 4 skipped  |
| `e2e/offline-core.spec.ts` + `pwa-update` | 7 passed, 2 skipped              |
| `node scripts/check-bundle-budget.mjs`    | Pass; fails on reintroduced tree |
| `node scripts/check-css-utilities.mjs`    | Pass                             |
