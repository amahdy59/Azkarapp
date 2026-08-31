/**
 * Suites that must run with their own module registry.
 *
 * The rest of the suite runs on worker threads that share one registry, which
 * is what took the full run from 3 m 34 s to under a minute. A shared registry
 * cannot serve two files that mock the same module differently, and it cannot
 * serve a file that asserts on the *first* use of a module-level cache — so
 * every suite that calls `vi.mock`, plus `releaseNotes.test.ts`, runs isolated.
 *
 * `isolatedSuites.test.ts` keeps this list honest: add a mock to a suite and it
 * fails until the suite is listed here.
 */
export const ISOLATED_SUITES = [
  "src/app/App.composition.test.tsx",
  "src/app/components/AppErrorBoundary.test.tsx",
  "src/app/content/qcfMushaf.test.ts",
  "src/app/hooks/useAuthHandlers.test.ts",
  "src/app/hooks/usePwaLifecycle.test.ts",
  "src/app/hooks/useRemoteAccountSync.test.tsx",
  "src/app/hooks/useSettingsHandlers.test.ts",
  "src/app/releaseNotes.test.ts",
  "src/app/screens/settings/DownloadsPanel.test.tsx",
  "src/app/screens/settings/WhatsNewPanel.test.tsx",
  "src/lib/auth.test.ts",
];
