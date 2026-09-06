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
  /**
   * Resolves true when the new worker actually took control, false if it did
   * not within a grace period.
   *
   * This exists because `updateServiceWorker(true)` resolves either way. It
   * reloads when `controllerchange` fires, and when that never fires it still
   * resolves normally — so the caller cannot tell a handover from nothing at
   * all. Nothing then reloaded, nothing threw, and the timeout guarding this
   * only ever guarded a rejection: the reader was left on "Applying the
   * update…" with both buttons disabled, indefinitely. That is the state an
   * end-to-end test finally reproduced, and it is the whole reason this
   * dependency exists.
   */
  awaitHandover?: () => Promise<boolean>;
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
  awaitHandover,
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

      /* Then reload — whether or not the handover reported success.
         `updateServiceWorker(true)` is documented as reloading once the new
         worker takes control, and an end-to-end test of an actual deployment
         showed the controller changing while the page stayed exactly where it
         was. That leaves the reader in the worst state of the three: the new
         worker has activated and dropped the old precache, so the document
         still on screen can no longer fetch its own lazily-loaded chunks —
         they 404, because publishing deleted them — and the spinner never
         ends.

         Waiting for the handover first is still worth doing: it means the
         reload lands on the new worker rather than racing it. But the reload
         itself is not conditional on it. A second reload, if the updater does
         perform one, costs nothing — the page is already navigating. */
      await awaitHandover?.();
      reload();
      return;
    }
  }

  reload();
}

/** Remembers, for this tab only, which release an update was asked for. */
const UPDATE_ATTEMPT_KEY = "azkarapp.update-attempted-for";

export function rememberUpdateAttempt(release: string) {
  try {
    window.sessionStorage.setItem(UPDATE_ATTEMPT_KEY, release);
  } catch {
    // A tab that cannot remember simply does not escalate. Not worth failing on.
  }
}

function readUpdateAttempt(): string | null {
  try {
    return window.sessionStorage.getItem(UPDATE_ATTEMPT_KEY);
  } catch {
    return null;
  }
}

function clearUpdateAttempt() {
  try {
    window.sessionStorage.removeItem(UPDATE_ATTEMPT_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

/**
 * The last resort: throw the worker away and reload.
 *
 * Handing over to a waiting worker is the ordinary path and it is the one that
 * should run. This exists for the state where that has already been asked for
 * and did not take — the reader pressed update, the page reloaded, and the
 * build they are running is still the one they pressed it to leave. Whatever
 * the cause, the worker serving that build cannot be trusted to replace itself,
 * so it is unregistered and its caches dropped: the next load comes from the
 * network.
 *
 * It runs at most once per tab per release, because it is keyed on the release
 * that was asked for and clears the key before reloading. Without that a stuck
 * client would reload forever, which is worse than the state it is escaping.
 *
 * Returns whether it escalated, so a caller can leave the notice up rather than
 * silently doing nothing.
 */
export async function escapeStaleServiceWorker({
  deployedRelease,
  runningRelease,
  getRegistration,
  reload,
}: {
  deployedRelease: string;
  runningRelease: string;
  getRegistration: () => Promise<ServiceWorkerRegistration | undefined>;
  reload: () => void;
}): Promise<boolean> {
  if (!runningRelease || runningRelease === deployedRelease) return false;
  if (readUpdateAttempt() !== deployedRelease) return false;

  // Cleared first: an escalation that fails partway must not run again on the
  // reload it triggers.
  clearUpdateAttempt();

  const registration = await getRegistration();
  await registration?.unregister().catch(() => {
    // Even a failed unregister is followed by the reload, which is the part the
    // reader actually asked for.
  });

  if (typeof caches !== "undefined") {
    await caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => {
        // The precache is the likely culprit, but a browser that refuses to
        // enumerate it still gets the reload.
      });
  }

  reload();
  return true;
}
