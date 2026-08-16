# Design sources

Uncompressed masters and design references for the app's background imagery. **Not
deployed** — Vite copies `public/`, not this directory — and **not optional**: this is the
only copy of the artwork the shipped responsive set was generated from.

## Why it is tracked

Until DEC-071 these files were ignored by git. They had been sitting inside `public/`,
where a blanket `*.png` rule in `.gitignore` hid them, so 15 files were being deployed on
every release while existing in exactly one copy each, on one machine. Phase 18 moved them
out of the deploy path; this directory now versions them too.

Committing roughly 13 MB to the repository is a deliberate trade. The alternative was a
single point of failure for artwork that cannot be regenerated.

## Layout

```
azkar-responsive-assets/
  source-assets/backgrounds/    the masters — regenerate the responsive set from these
    morning-master.png          evening-master.png
    sleep-master.png            friday-master.png
    friday-original.png         earlier friday crop, distinct from friday-master
  references/                   desktop design references (png + webp previews)
  tools/export_backgrounds.py   generates the responsive set
  backgrounds-manifest.json     widths and formats the generator emits
  ASSET-SIZES.md                recorded output sizes
  examples/, src/               reference implementation of the <picture> markup
```

## What is deliberately absent

The generated output — `assets/backgrounds/<time>/<name>-{768,1280,1600}.{avif,webp}` — is
not duplicated here. All 28 files were verified byte-identical to the tracked copies under
`public/assets/backgrounds/`, so keeping a second set would have doubled their weight for
nothing. Regenerate them with `tools/export_backgrounds.py` rather than copying them back.

Three of the four `Originals/*.png` were likewise byte-identical to their `*-master.png`
counterparts and were dropped. `friday` was the exception — its original and its master are
different images, so both are kept.

## If you add artwork

Put the master here, generate the responsive set into `public/assets/backgrounds/`, and
commit both. Do not put masters in `public/`: everything there ships to every user, and the
bundle budget now fails the build if the output tree grows past 8 MB.
