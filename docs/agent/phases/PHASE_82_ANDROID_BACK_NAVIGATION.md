# Phase 82 — Android hardware Back navigation

## Objective

Make Android device Back follow Azkarapp's existing navigation history and exit the app from Home.

## Scope completed

- Connected Capacitor's Android `backButton` event to `useAppRouting`.
- Back pops an in-app history entry when one exists. A directly opened non-Home route returns to Home. Back from Home exits the app.
- Kept browser/PWA Back behavior unchanged.
- Added focused native-back routing regression coverage.

## Files changed

- `package.json`, `pnpm-lock.yaml`
- `src/app/hooks/useAppRouting.ts`
- `src/app/hooks/useAndroidBackNavigation.native.test.ts`
- `src/test/isolatedSuites.ts`
- `docs/ARCHITECTURE.md`
- `docs/agent/DECISION_LOG.md`

## Components added or modified

- Modified `useAppRouting` to own the Android Back listener and route it through app history.

## User-visible changes

- Android Back returns through screens opened inside the app. When at Home, Android Back closes the app. A directly opened secondary route first returns to Home.

## Accessibility work

- No new controls or focus behavior; the existing native system Back action is routed into existing navigation.

## Tests added or updated

- Added checks for Home exit, direct-route fallback to Home, and history pop for nested screens.
- Registered the mocked native suite for isolated module loading.

## Commands run

| Command | Result |
| ------- | ------ |
|         |        |

## Visual/manual evidence

- Pending Android device or emulator verification.

## Documentation updated

- Architecture, decision log and agent index.

## Decisions recorded

- DEC-221 records the Android Back contract and the Capacitor App plugin dependency.

## Known limitations or remaining risks

- Physical Android behavior and the full repository quality gates remain to be verified.

## Out-of-scope findings

- None.

## Recommended next step

- Run targeted tests and build the Android app; verify nested Back and Home exit on an Android device.
