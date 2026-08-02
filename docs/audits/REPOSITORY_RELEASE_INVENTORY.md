# Repository Release Inventory

## Core Web / PWA Assets

- **PWA manifest**: Implemented (Generated via `vite-plugin-pwa`, `dist/manifest.webmanifest` verified).
- **Icons and splash assets**: Partially implemented (Basic `192.png`, `512.png`, `azkar-icon.svg` exist in `public/`). Needs review for complete splash screen sizing.
- **Browser metadata**: Implemented (Configured in `index.html` / `vite.config.ts`).
- **GitHub Pages base path**: Implemented (Build script uses `--mode github-pages`).

## Legal and Compliance

- **Privacy policy**: Implemented (`public/privacy.html`). Needs manual review of owner details.
- **Terms**: Implemented (`public/terms.html`). Needs manual review.
- **Account deletion**: Implemented (`public/account-deletion.html`).
- **Authentication providers**: Implemented (Supabase OTP/Magic links, handled in `src/lib/auth.ts`).

## Features and Integrations

- **Offline behavior**: Partially implemented (`sw.js` is generated via Workbox, but offline reliability requires testing in Batch 03).
- **Notifications**: Missing (Local scheduling or push not yet fully mapped to native equivalents).
- **Share behavior**: Implemented (Share screen / card generation in `src/app/share/zikrShareCard.ts` and `ZikrShareButton.tsx`).
- **Haptics**: Missing / Requires manual verification (Native device feedback).
- **Safe-area handling**: Partially implemented (CSS env variables may be present but require real-device testing).

## Versioning and Native Packaging

- **App version**: Implemented (`0.0.1` in `package.json`).
- **Build number strategy**: Missing.
- **Native projects**: Missing (No `android` or `ios` directories; currently web-only).
- **Store listing assets**: Missing.
- **Store privacy declarations**: Missing.

## Summary

The web/PWA surface has the foundational assets (manifest, legal pages, service worker generation) required for a web release. However, native store preparation (Android/iOS packaging, store assets, notifications, safe areas) is missing or requires owner input.
