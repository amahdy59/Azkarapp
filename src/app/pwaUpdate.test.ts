import { describe, expect, it, vi } from "vitest";
import { applyServiceWorkerUpdate } from "./pwaUpdate";

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
    // The updater reloads once the new worker takes over; reloading here too
    // would race it.
    expect(reload).not.toHaveBeenCalled();
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
