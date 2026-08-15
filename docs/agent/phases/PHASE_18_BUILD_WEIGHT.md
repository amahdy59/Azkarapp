# Phase 18 — Build Weight and Repository Hygiene

## Objective

Stop shipping assets nothing references, make the budget gate able to see them, and remove
the repository conditions that let both happen.

## Scope

`public/`, `.gitignore`, `scripts/check-bundle-budget.mjs`, `vite.config.ts` PWA globs, and
the four `<img>` call sites.

No application behaviour changes. This phase is independent of Phases 15–17 and can run in
parallel.

## Findings addressed

F24, F25, F26, F27, F33, F34 — see `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`.

## Required reading

- `docs/audits/DESIGN_CONSISTENCY_AUDIT.md`
- `vite.config.ts` — `workbox.globPatterns` and `globIgnores`
- `scripts/check-bundle-budget.mjs`
- `README.md` deployment section

## Step 1 — Establish what is actually referenced

Before deleting anything, produce the reference map: for every file under `public/`, record
whether it is reached from `src/`, `index.html`, the PWA manifest, or a workflow. Commit
the list as phase evidence.

The audit found `azkar-responsive-assets/` (17MB) and five root PNGs (~7MB) with zero
references, and `assets/backgrounds/Originals/` holding uncompressed masters. Confirm this
independently — do not delete on the audit's word alone.

## Step 2 — Move source material out of the deploy path

Design sources, Figma reference renders, uncompressed masters and the nested duplicate
`public/` tree are inputs, not outputs. Move them to a directory that Vite does not copy,
or out of the repository if they are already preserved elsewhere.

Then remove the now-redundant `globIgnores` entries in `vite.config.ts` that exist only to
keep these files out of the precache — if they are no longer in `public/`, the ignores are
dead configuration.

Take the deployment history into account: if any of these paths were ever public URLs,
confirm nothing links to them before removing.

## Step 3 — Make the budget gate see the whole output

`check-bundle-budget.mjs` iterates `dist/assets` only, which is why 24MB accumulated
unremarked. Add:

- a total `dist/` size ceiling, set just above the post-cleanup size
- a largest-single-file check across the whole output tree

Set the ceiling tight enough that a regression of this kind fails the build.

## Step 4 — Image loading

`HomeCards` (two images) and `HomeScreen:791` lack `loading` and `decoding`; none of the
four `<img>` elements declare intrinsic dimensions. Add `loading="lazy" decoding="async"`
plus `width`/`height` or `aspect-ratio` everywhere except the LCP hero, which stays eager
with `fetchpriority="high"`.

## Step 5 — The noise overlay (F27)

`.app-shell::after` is a viewport-sized `mix-blend-mode: overlay` layer on every screen.
Measure its cost on a mid-range Android profile before deciding. If it is not earning its
place at 4% opacity, remove it; if it is, scope it to the hero rather than the shell, or
replace the live filter with a pre-rendered texture.

Record the measurement either way — this must be a decision, not an assumption.

## Step 6 — Repository hygiene

1. Delete the tracked working files: `stash.diff`, `full_msgs.txt`, `msgs.txt`,
   `tmp_counter.txt`, `fix_a11y.py`. Remove the untracked `tmp-reader-vite*.log`.
2. Narrow `.gitignore`'s blanket `*.png` rule to the directories that actually produce
   throwaway PNGs (Playwright output, coverage), so product assets are committed normally.
   The rule's own comment records that it already caused a baseline to be silently lost.
3. Confirm every PNG currently in `public/` is tracked after the change.

## Acceptance criteria

- Every file in `dist/` is reachable from the application, the manifest, or the service worker
- `dist/` total size is materially reduced and under an enforced ceiling
- The budget gate fails if a large unreferenced asset is reintroduced
- Dead `globIgnores` entries removed
- All images except the LCP hero are lazy, async-decoded, and reserve their space
- The noise overlay decision is measured and recorded
- No working files tracked; `.gitignore` no longer ignores product images
- The PWA installs and works offline exactly as before

## Required tests and evidence

```bash
pnpm check
pnpm test:e2e
pnpm build:pages
```

Offline verification is mandatory: install the PWA, go offline, and confirm reading,
counting, saved state, progress and settings still work. Evidence: the reference map from
Step 1, `dist/` size before and after, the noise-overlay measurement, and an offline
smoke-test record.

## Prohibited changes

- No deletion of any asset the reference map does not prove unreferenced
- No deletion of `docs/agent/evidence/screenshots/**` — it is deliberate phase evidence
- No raising of an existing budget limit to make a build pass
- No change to the audio caching strategy or the audio manifest version
- No change to image content, focal points, or the responsive source sets the app uses

## Completion output

Use `docs/agent/templates/PHASE_REPORT.md`.
