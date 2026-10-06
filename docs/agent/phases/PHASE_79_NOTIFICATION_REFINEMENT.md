# Phase Report — Notification and reminder refinement

## Objective

Make notification settings easier to find and configure while preserving local calculation, offline reading, and the existing reminder boundary.

## Scope completed

- Split notification controls from location and prayer-calculation controls with accessible tabs.
- Added a test notification action and deployment-aware notification identity.
- Added prayer lead choices at 0, 5, 10, 15, 20 and 30 minutes, plus per-prayer selection.
- Added deployment-aware notification identity and URL data for a future push boundary.
- Improved mobile Reader artwork stacking and reduced excess vertical spacing on compact screens.

## Files changed

- `src/app/types.ts`, `src/app/state.ts`, `src/app/hooks/useForegroundReminders.ts`
- `src/app/screens/settings/NotificationsPanel.tsx` and tests
- `src/app/i18n/ar.ts`, `src/app/i18n/en.ts`
- `src/app/components/LayoutShells.tsx`, `src/app/components/ReaderSceneArt.tsx`, `src/app/components/reader-scene-art.css`, `src/app/screens/ReaderScreen.tsx`
- `README.md`, `docs/ARCHITECTURE.md`, `public/release-notes.json`

## User-visible behavior

Users can switch between reminder controls and local prayer-time calculation, test permissioned notifications, select individual prayers, and choose a broader lead-time range.

## Accessibility

Native tab buttons, switch/checkbox semantics, keyboard focus rings, 44px tab targets, bilingual labels and status announcements are retained.

## Verification

- Targeted Vitest suites: 57 passed.
- `pnpm typecheck`: passed.
- `pnpm build:pages`: passed; the existing generated service worker and bundle budget passed.
- `pnpm run check:release-notes`: passed.

## Known limitations

Foreground timers remain subject to browser throttling. Push delivery and notification-click routing require a separately secured subscription and server scheduler.

## Recommended next phase

Design and implement authenticated, privacy-preserving Push API subscription and scheduling after reviewing browser/device support.
