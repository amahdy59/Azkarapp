import { useEffect, useRef, useState } from "react";
import type { AppStateSnapshot } from "../types";
import { mergeAppStates } from "../state";
import {
  CLOUDFLARE_DEVICE_EVENT,
  hasCloudflareDevice,
  loadCloudflareSnapshot,
  saveCloudflareSnapshot,
} from "../../lib/cloudflareSync";

export function useCloudflareDeviceSync(state: AppStateSnapshot, onRemoteState: (state: AppStateSnapshot) => void) {
  const [generation, setGeneration] = useState(0);
  const hydrated = useRef(false);
  const revision = useRef(0);
  const latest = useRef(state);
  latest.current = state;

  useEffect(() => {
    const refresh = () => {
      hydrated.current = false;
      setGeneration((value) => value + 1);
    };
    window.addEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CLOUDFLARE_DEVICE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (!hasCloudflareDevice()) return;
    let active = true;
    void loadCloudflareSnapshot()
      .then(({ snapshot, revision: remoteRevision }) => {
        if (!active) return;
        revision.current = remoteRevision ?? 0;
        if (snapshot) onRemoteState(mergeAppStates(latest.current, snapshot));
        hydrated.current = true;
      })
      .catch(() => {
        hydrated.current = false;
      });
    return () => {
      active = false;
    };
  }, [generation, onRemoteState]);

  useEffect(() => {
    if (!hydrated.current || !hasCloudflareDevice() || !navigator.onLine) return;
    const timer = window.setTimeout(() => {
      void saveCloudflareSnapshot(state, revision.current).catch(async (error) => {
        if (!(error instanceof Error) || !error.message.includes("409")) return;
        try {
          const remote = await loadCloudflareSnapshot();
          revision.current = remote.revision ?? revision.current;
          if (remote.snapshot) onRemoteState(mergeAppStates(latest.current, remote.snapshot));
        } catch {
          // Local reading remains authoritative when the remote is unavailable.
        }
      });
    }, 750);
    return () => window.clearTimeout(timer);
  }, [onRemoteState, state]);
}
