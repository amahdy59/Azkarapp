/**
 * Suites that must run with their own module registry.
 *
 * The remaining application suites share one registry within each worker.
 * Tooling suites run separately in Node with isolation. A shared registry
 * cannot serve two files that mock the same module differently, and it cannot
 * serve a file that asserts on the *first* use of a module-level cache — so
 * every suite that calls `vi.mock`, plus `releaseNotes.test.ts`, runs isolated.
 *
 * `isolatedSuites.test.ts` keeps this list honest: add a mock to a suite and it
 * fails until the suite is listed here.
 */
export const ISOLATED_SUITES = [
  "src/app/audio/ownerTimingLoader.test.ts",
  "src/app/components/QuranListeningReader.test.tsx",
  "src/app/hooks/useAppStatePersistence.test.tsx",
  "src/app/App.composition.test.tsx",
  "src/app/audio/audioOfflineCache.resume.test.ts",
  "src/app/audio/travelPreparation.test.ts",
  "src/app/components/AppErrorBoundary.test.tsx",
  "src/app/components/CollectionShareModal.test.tsx",
  "src/app/components/ReadingScreenChrome.test.tsx",
  "src/app/content/qcfMushaf.test.ts",
  "src/app/hooks/useAuthHandlers.test.ts",
  "src/app/hooks/usePwaLifecycle.test.ts",
  "src/app/hooks/useRemoteAccountSync.test.tsx",
  "src/app/hooks/useSettingsHandlers.test.ts",
  "src/app/releaseNotes.test.ts",
  "src/app/startupMaintenance.test.ts",
  "src/app/screens/settings/DownloadsPanel.test.tsx",
  "src/app/screens/settings/WhatsNewPanel.test.tsx",
  "src/lib/auth.test.ts",
];
