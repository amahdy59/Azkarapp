import { describe, expect, it, vi } from "vitest";
import { applyServiceWorkerUpdate, escapeStaleServiceWorker } from "./pwaUpdate";

/** A worker whose state can be driven, as the browser drives a real one. */
function fakeWorker(state: ServiceWorker["state"]) {
  const listeners: (() => void)[] = [];
  return {
    worker: {
      state,
      addEventListener: (_: string, handler: () => void) => listeners.push(handler),
    } as unknown as ServiceWorker,
    finish(next: ServiceWorker["state"]) {
      (this.worker as { state: ServiceWorker["state"] }).state = next;
      for (const handler of listeners) handler();
    },
  };
}

function deps(registration: Partial<ServiceWorkerRegistration> | undefined) {
  const updateServiceWorker = vi.fn(async () => {});
  const reload = vi.fn();
  return {
    updateServiceWorker,
    reload,
    args: {
      getRegistration: async () => registration as ServiceWorkerRegistration | undefined,
      updateServiceWorker,
      reload,
    },
  };
}

describe("applying a service worker update", () => {
  it("hands over to a worker that is already waiting", async () => {
    const { args, updateServiceWorker, reload } = deps({
      update: vi.fn(async () => undefined),
      waiting: {} as ServiceWorker,
    });

    await applyServiceWorkerUpdate(args);

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
    /* This used to assert the opposite, on the reasoning that the updater
       reloads once the new worker takes over and a reload here would race it.
       An end-to-end test of a real deployment showed the controller changing
       while the page stayed put, which is the worst of the three outcomes: the
       new worker drops the old precache, and the document still on screen can
       no longer load its own lazy chunks. */
    expect(reload).toHaveBeenCalled();
  });

  it("reloads when the handover is asked for but never happens", async () => {
    /* The bug an end-to-end test finally caught: `updateServiceWorker(true)`
       resolves whether or not the new worker takes control, so a handover that
       silently did nothing looked exactly like success. Nothing reloaded and
       nothing threw, and the reader sat on "Applying the update…" with both
       buttons disabled until they gave up. */
    const { args, updateServiceWorker, reload } = deps({
      update: vi.fn(async () => undefined),
      waiting: {} as ServiceWorker,
    });

    await applyServiceWorkerUpdate({ ...args, awaitHandover: async () => false });

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
    expect(reload).toHaveBeenCalled();
  });

  it("waits for the handover before reloading, so the reload lands on the new worker", async () => {
    const order: string[] = [];
    const { args, reload } = deps({
      update: vi.fn(async () => undefined),
      waiting: {} as ServiceWorker,
    });
    reload.mockImplementation(() => order.push("reload"));

    await applyServiceWorkerUpdate({
      ...args,
      awaitHandover: async () => {
        order.push("handover");
        return true;
      },
    });

    expect(order).toEqual(["handover", "reload"]);
  });

  it("waits for an installing worker instead of returning without doing anything", async () => {
    /* The bug this exists for: an installing worker has nothing waiting to
       receive SKIP_WAITING, so the updater did nothing, the function returned
       before the reload, and the button appeared dead. */
    const installing = fakeWorker("installing");
    const registration: Partial<ServiceWorkerRegistration> = {
      update: vi.fn(async () => undefined),
      installing: installing.worker,
      waiting: null,
    };
    const { args, updateServiceWorker, reload } = deps(registration);

    const applied = applyServiceWorkerUpdate(args);
    // Nothing has happened yet: it is waiting for the install to finish.
    await Promise.resolve();
    expect(updateServiceWorker).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();

    (registration as { waiting: ServiceWorker | null }).waiting = {} as ServiceWorker;
    installing.finish("installed");
    await applied;

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it("reloads when an install ends without leaving a worker waiting", async () => {
    const installing = fakeWorker("installing");
    const { args, updateServiceWorker, reload } = deps({
      update: vi.fn(async () => undefined),
      installing: installing.worker,
      waiting: null,
    });

    const applied = applyServiceWorkerUpdate(args);
    installing.finish("redundant");
    await applied;

    expect(updateServiceWorker).not.toHaveBeenCalled();
    // A failed install still ends in the reload the reader asked for.
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads when the update check throws", async () => {
    const { args, reload } = deps({
      update: vi.fn(async () => {
        throw new Error("offline");
      }),
      waiting: null,
    });

    await applyServiceWorkerUpdate(args);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads when there is no registration at all", async () => {
    const { args, reload } = deps(undefined);

    await applyServiceWorkerUpdate(args);

    expect(reload).toHaveBeenCalledTimes(1);
  });
});

describe("escaping a worker that would not replace itself", () => {
  const KEY = "azkarapp.update-attempted-for";

  function harness(attempted: string | null) {
    window.sessionStorage.clear();
    if (attempted) window.sessionStorage.setItem(KEY, attempted);
    const unregister = vi.fn(async () => true);
    const reload = vi.fn();
    return {
      unregister,
      reload,
      args: {
        deployedRelease: "2026-09-05.6",
        runningRelease: "2026-09-05.5",
        getRegistration: async () => ({ unregister }) as unknown as ServiceWorkerRegistration,
        reload,
      },
    };
  }

  it("does nothing when no update was asked for", async () => {
    const { args, unregister, reload } = harness(null);
    expect(await escapeStaleServiceWorker(args)).toBe(false);
    expect(unregister).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it("does nothing when the running build is already the deployed one", async () => {
    const { args, unregister } = harness("2026-09-05.6");
    expect(await escapeStaleServiceWorker({ ...args, runningRelease: "2026-09-05.6" })).toBe(false);
    expect(unregister).not.toHaveBeenCalled();
  });

  it("discards the worker when an update was asked for and did not take", async () => {
    const { args, unregister, reload } = harness("2026-09-05.6");
    expect(await escapeStaleServiceWorker(args)).toBe(true);
    expect(unregister).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("escalates only once, so a stuck client cannot reload forever", async () => {
    const { args, reload } = harness("2026-09-05.6");
    expect(await escapeStaleServiceWorker(args)).toBe(true);
    // The marker is cleared before the reload, so the load it causes is quiet.
    expect(await escapeStaleServiceWorker(args)).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("still reloads when the worker refuses to unregister", async () => {
    const { args, reload } = harness("2026-09-05.6");
    const failing = {
      ...args,
      getRegistration: async () =>
        ({
          unregister: async () => {
            throw new Error("denied");
          },
        }) as unknown as ServiceWorkerRegistration,
    };
    expect(await escapeStaleServiceWorker(failing)).toBe(true);
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
