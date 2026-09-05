/**
 * The release this bundle was built from.
 *
 * `vite.config.ts` stamps it in from `public/release-notes.json`, so the app
 * knows which version it *is* rather than only which version is deployed. The
 * two are routinely different: `release-notes.json` is fetched from the network
 * while the app itself is served from the service-worker precache, and the
 * worker deliberately waits for the reader before it takes over.
 *
 * Empty in a unit test, where the define is not applied — callers treat that as
 * "unknown", which suppresses both the recap and the update prompt rather than
 * guessing.
 */
declare const __APP_RELEASE__: string | undefined;

export const APP_RELEASE: string = typeof __APP_RELEASE__ === "string" ? __APP_RELEASE__ : "";
