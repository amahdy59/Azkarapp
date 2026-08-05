# Azkar responsive background asset pack

This package contains ready-to-use responsive backgrounds for **Morning**, **Evening**, **Before Sleep**, and **Friday** Azkar, plus three enlarged desktop dashboard references.

## Production formats

- AVIF: quality 50, primary source for web
- WebP: quality 75, fallback and future Flutter-friendly format
- Sizes: 768×432, 1280×720, and 1600×900
- Tiny 48×27 WebP placeholders for fast perceived loading
- PNG masters are stored under `source-assets/` and should not be shipped to production

## Integration

Copy `public/assets/backgrounds/` into your app's public directory. Copy the files in `src/` into the React project. The example component uses a `<picture>` element so the browser chooses AVIF/WebP and the appropriate responsive size.

Only the first visible hero should use `priority`; lower cards should remain lazy-loaded. Images are decorative, so they use `alt=""` and `aria-hidden="true"`. Keep meaningful card names and text in the HTML, not in the image.

## Text readability

The included CSS adds a direction-aware overlay. In RTL it darkens the right side where Arabic copy is normally placed; in LTR it flips to the left. Validate every final text/background combination to WCAG contrast requirements.

## Files

- `public/assets/backgrounds/`: production AVIF and WebP assets
- `source-assets/backgrounds/`: uncompressed PNG masters
- `src/`: React/TypeScript data and component
- `examples/`: React and plain HTML usage
- `references/`: expanded desktop screen references
- `backgrounds-manifest.json`: framework-neutral manifest, useful for a later Flutter implementation
- `ASSET-SIZES.md`: actual compressed file sizes

## Friday source note

The Friday background is a dedicated art-directed and color-graded variant generated from the evening master, with a mirrored composition and warmer gold treatment. It is a separate production asset and contains no text or UI.

## Flutter migration

For native Flutter builds, use the WebP 1280 or 1600 assets depending on the rendered size. Keep the same focal-point values from `backgrounds-manifest.json` and use `BoxFit.cover`. AVIF remains the preferred web format.
