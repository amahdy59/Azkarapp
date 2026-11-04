# Surah thumbnails · 2026-11-04

The owner supplied three images for the existing long-surah reading cards. Use the cave for Al-Kahf, prostration for As-Sajdah and the crescent for Al-Mulk. Keep the cards' dimensions, accessible names and controls. Serve decorative 384px and 768px WebP variants from versioned R2 object keys. Retain the existing packaged image as the offline or failed-request fallback.

Before publishing the code, verify the public URLs, MIME type and cache headers, then check the visible card crops and fallback. Keep this separate from the release already running through CI.

## Local verification

- Six optimized files are in `output/surah-thumbnails`. The 384px variants are 22,984–29,688 bytes and the 768px variants are 68,810–96,284 bytes.
- `pnpm exec vitest run src/app/screens/ReaderScreen.surah.test.tsx` passed all 15 tests, including the three responsive mappings and the bundled fallback.
- `pnpm build:pages` passed with the existing bundle and CSS limits.
- The initial project token returned HTTP 401. The existing Wrangler OAuth login succeeded when the stale project environment override was excluded. All six images are uploaded under `visuals/surah/2026-11-04/` in the existing R2 bucket. Public downloads match their local SHA-256 checksums, with image/webp and immutable cache headers.
- Live-image and failed-request fallback browser checks passed in Chromium, Firefox and WebKit, three cases in 41.4 seconds. Screenshots in `output/playwright/surah-artwork` show all three card crops.
