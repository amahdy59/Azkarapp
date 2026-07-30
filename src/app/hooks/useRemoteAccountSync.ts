import { useCallback, useEffect, useRef, useState } from "react";
import type { AppStateSnapshot } from "../types";
import { clearPrivateAppData } from "../state";
import { getCurrentSession, loadRemoteState, subscribeToAuthChanges, syncRemoteState } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { t } from "../i18n";
import { prepareAuthenticatedState, type GuestMigrationDecision } from "./useAuthHandlers";

const LAST_SYNC_STORAGE_KEY = "azkarapp.last-successful-sync.v1";

async function wait(milliseconds: number) {
  await new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

export function createSerializedTaskQueue() {
  let tail: Promise<void> = Promise.resolve();
  return {
    enqueue(task: () => Promise<void>) {
      tail = tail.catch(() => undefined).then(task);
      return tail;
    },
  };
}

export function useRemoteAccountSync({
  initialState,
  state,
  isGuest,
  currentStreak,
  longestStreak,
  remoteSyncReady,
  onRemoteState,
  onRemoteHydrationChange,
  requestGuestMigrationDecision,
  skipInitialHydration = false,
}: {
  initialState: AppStateSnapshot;
  state: AppStateSnapshot;
  isGuest: boolean;
  currentStreak: number;
  longestStreak: number;
  remoteSyncReady: boolean;
  onRemoteState: (state: AppStateSnapshot) => void;
  onRemoteHydrationChange: (ready: boolean) => void;
  requestGuestMigrationDecision: () => Promise<GuestMigrationDecision>;
  skipInitialHydration?: boolean;
}) {
  const [authSessionLoaded, setAuthSessionLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [hydrationRetryToken, setHydrationRetryToken] = useState(0);
  const [lastSuccessfulSyncAt, setLastSuccessfulSyncAt] = useState(() => {
    try {
      return window.localStorage.getItem(LAST_SYNC_STORAGE_KEY) ?? "";
    } catch {
      return "";
    }
  });
  const latestState = useRef(state);
  const guestMigrationDecisionRef = useRef(requestGuestMigrationDecision);
  const syncQueue = useRef(createSerializedTaskQueue());
  const mounted = useRef(true);

  useEffect(() => {
    latestState.current = state;
    guestMigrationDecisionRef.current = requestGuestMigrationDecision;
  }, [requestGuestMigrationDecision, state]);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  useEffect(() => {
    if (!isSupabaseConfigured || skipInitialHydration) {
      setAuthSessionLoaded(true);
      return;
    }

    let active = true;
    setAuthSessionLoaded(false);

    const hydrateSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!active) {
          return;
        }

        if (session) {
          const hydrationBase = await prepareAuthenticatedState(
            session,
            initialState,
            guestMigrationDecisionRef.current,
          );
          if (!hydrationBase) {
            onRemoteHydrationChange(false);
            return;
          }
          const localPrivateDataWasCleared = hydrationBase.sessions.length === 0 && initialState.sessions.length > 0;
          if (localPrivateDataWasCleared || initialState.profile.accountUserId !== session.user.id) {
            onRemoteState(hydrationBase);
          }
          const mergedState = await loadRemoteState(session, hydrationBase, {
            preserveLocalPreferences: initialState.profile.isGuest,
          });
          if (active) {
            setSyncError("");
            onRemoteState(mergedState);
            onRemoteHydrationChange(true);
          }
        }
      } catch (error) {
        if (active) {
          setSyncError(
            error instanceof Error ? error.message : t(initialState.settings.language, "syncStatus.restoreError"),
          );
        }
      } finally {
        if (active) {
          setAuthSessionLoaded(true);
        }
      }
    };

    void hydrateSession();

    let unsubscribe = () => {};
    void subscribeToAuthChanges((session) => {
      if (active && !session) {
        if (!latestState.current.profile.isGuest || latestState.current.profile.accountUserId) {
          onRemoteState(clearPrivateAppData(latestState.current));
        }
        onRemoteHydrationChange(false);
        setAuthSessionLoaded(true);
      }
    })
      .then((cleanup) => {
        if (active) {
          unsubscribe = cleanup;
        } else {
          cleanup();
        }
      })
      .catch((error) => {
        if (active) {
          setSyncError(
            error instanceof Error ? error.message : t(initialState.settings.language, "syncStatus.restoreError"),
          );
        }
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrationRetryToken, initialState, onRemoteHydrationChange, onRemoteState, skipInitialHydration]);

  useEffect(() => {
    if (!isSupabaseConfigured || !authSessionLoaded || isGuest || !remoteSyncReady) {
      return;
    }

    const enqueueRemoteState = () => {
      const snapshot = latestState.current;
      void syncQueue.current
        .enqueue(async () => {
          if (!mounted.current) return;
          if (!navigator.onLine) {
            setSyncError(t(snapshot.settings.language, "syncStatus.offlineNotice"));
            return;
          }
          setIsSyncing(true);
          let lastError: unknown;
          for (let attempt = 0; attempt < 3; attempt += 1) {
            try {
              const session = await getCurrentSession();
              if (!session) return;
              await syncRemoteState(session, snapshot, { currentStreak, longestStreak });
              if (mounted.current) {
                const syncedAt = new Date().toISOString();
                setLastSuccessfulSyncAt(syncedAt);
                setSyncError("");
                try {
                  window.localStorage.setItem(LAST_SYNC_STORAGE_KEY, syncedAt);
                } catch {
                  // Sync success is not invalidated by unavailable local storage.
                }
              }
              return;
            } catch (error) {
              lastError = error;
              if (!navigator.onLine || attempt === 2) break;
              await wait(500 * 2 ** attempt);
            }
          }
          if (mounted.current) {
            setSyncError(
              lastError instanceof Error ? lastError.message : t(snapshot.settings.language, "syncStatus.pushError"),
            );
          }
        })
        .finally(() => {
          if (mounted.current) setIsSyncing(false);
        });
    };

    const timer = window.setTimeout(enqueueRemoteState, 500);
    return () => window.clearTimeout(timer);
  }, [authSessionLoaded, currentStreak, isGuest, longestStreak, remoteSyncReady, retryToken, state]);

  useEffect(() => {
    const handleOnline = () => {
      if (!isGuest && remoteSyncReady) {
        setRetryToken((value) => value + 1);
      }
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isGuest, remoteSyncReady]);

  const retry = useCallback(() => {
    if (remoteSyncReady) {
      setRetryToken((value) => value + 1);
    } else {
      setHydrationRetryToken((value) => value + 1);
    }
  }, [remoteSyncReady]);

  const syncStatus: "offline" | "needs-attention" | "syncing" | "up-to-date" = !navigator.onLine
    ? "offline"
    : syncError
      ? "needs-attention"
      : isSyncing
        ? "syncing"
        : "up-to-date";

  return { isSyncing, lastSuccessfulSyncAt, retry, syncError, syncStatus };
}
