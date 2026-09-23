import { useEffect, useRef, useState } from "react";
import type { AppStateSnapshot } from "../types";
import { mergeAppStates } from "../state";
import {
  CLOUDFLARE_DEVICE_EVENT,
  CLOUDFLARE_DEVICE_SECRET_KEY,
  hasCloudflareDevice,
  loadCloudflareSnapshot,
  saveCloudflareSnapshot,
} from "../../lib/cloudflareSync";

export function useCloudflareDeviceSync(state: AppStateSnapshot, onRemoteState: (state: AppStateSnapshot) => void) {
  const [generation, setGeneration] = useState(0);
  const latest = useRef(state);
  const scheduleRef = useRef<() => void>(() => {});
  latest.current = state;

  useEffect(() => {
    const refresh = () => setGeneration((value) => value + 1);
    const storage = (event: StorageEvent) => {
      if (event.key === null || event.key === CLOUDFLARE_DEVICE_SECRET_KEY) refresh();
    };
    window.addEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
    window.addEventListener("storage", storage);
    window.addEventListener("online", refresh);
    return () => {
      window.removeEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
      window.removeEventListener("storage", storage);
      window.removeEventListener("online", refresh);
    };
  }, []);

  useEffect(() => {
    let active = true;
    let hydrated = false;
    let revision = 0;
    let busy = false;
    let queued = false;
    let failures = 0;
    let timer: number | undefined;

    const schedule = () => {
      queued = true;
      window.clearTimeout(timer);
      if (active && !busy) timer = window.setTimeout(() => void flush(), 750);
    };
    const flush = async () => {
      if (!active || busy || !hasCloudflareDevice() || !navigator.onLine) return;
      busy = true;
      queued = false;
      try {
        if (!hydrated) {
          const remote = await loadCloudflareSnapshot();
          if (!active) return;
          revision = remote.revision ?? 0;
          if (remote.snapshot) {
            const merged = mergeAppStates(latest.current, remote.snapshot);
            latest.current = merged;
            onRemoteState(merged);
          }
          hydrated = true;
        }
        const result = await saveCloudflareSnapshot(latest.current, revision);
        if (!active) return;
        revision = result.revision;
        failures = 0;
      } catch {
        if (!active) return;
        // Re-read before retrying: a competing device may have advanced the revision.
        // Bound retries so an unavailable service cannot create a background loop.
        hydrated = false;
        failures += 1;
        queued = failures <= 2;
      } finally {
        busy = false;
        if (active && queued) schedule();
      }
    };
    scheduleRef.current = schedule;
    void flush();
    return () => {
      active = false;
      window.clearTimeout(timer);
      scheduleRef.current = () => {};
    };
  }, [generation, onRemoteState]);

  useEffect(() => {
    scheduleRef.current();
  }, [state]);
}
