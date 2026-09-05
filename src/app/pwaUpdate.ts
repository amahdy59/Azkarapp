/**
 * Applying an update has to work from a cold prompt, not only from one the
 * service worker itself raised.
 *
 * `updateServiceWorker(true)` skips the waiting worker and reloads when the new
 * controller takes over — but if no worker is waiting yet it resolves having
 * done nothing, and the reader who just pressed "update" is left on the version
 * they pressed it to leave. That is the common case now that the prompt can
 * also come from the deployed release notes disagreeing with this bundle's own
 * stamp: the app knows an update exists before the worker has looked for it.
 *
 * So: ask the registration to look first, wait out an install that is still
 * running, hand over if something is waiting, and otherwise reload — by then
 * the caches hold the new build either way.
 *
 * It lives here rather than in main.tsx so it can be tested against a fake
 * registration. Two bugs have now hidden in these few lines, both of which a
 * test would have caught and neither of which a reading of the diff did.
 */
export interface UpdateDeps {
  /** Resolves the active registration, or undefined where there is none. */
  getRegistration: () => Promise<ServiceWorkerRegistration | undefined>;
  /** vite-plugin-pwa's updater: messages the waiting worker and reloads. */
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  reload: () => void;
}

/**
 * Settles when an installing worker stops installing, however it ends.
 *
 * `redundant` counts as settled: the install failed, and a reload is still the
 * honest answer to someone who asked for the new version. Nothing here rejects
 * — every path has to end in either a handover or a reload, because a button
 * that reports success and changes nothing is worse than one that reloads to
 * the same place.
 */
function waitForInstall(worker: ServiceWorker): Promise<void> {
  return new Promise((resolve) => {
    if (worker.state !== "installing") {
      resolve();
      return;
    }
    worker.addEventListener("statechange", () => {
      if (worker.state !== "installing") resolve();
    });
  });
}

export async function applyServiceWorkerUpdate({
  getRegistration,
  updateServiceWorker,
  reload,
}: UpdateDeps): Promise<void> {
  const registration = await getRegistration();

  if (registration) {
    await registration.update?.().catch(() => {
      // A failed check is not a failed update: fall through to the reload,
      // which is what the reader asked for.
    });

    /* A worker that is still installing cannot be told to stand aside: there is
       nothing waiting yet, and `updateServiceWorker(true)` returns having done
       nothing at all. Treating "installing" as good enough is what left the
       button dead — the spinner ended, this returned before the reload, and the
       reader stayed on the build they pressed it to leave. Precaching 4 MB
       takes long enough for that to be the common case, not the rare one. */
    if (registration.installing) {
      await waitForInstall(registration.installing);
    }

    if (registration.waiting) {
      await updateServiceWorker(true);
      return;
    }
  }

  reload();
}
