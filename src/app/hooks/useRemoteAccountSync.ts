import { useCallback, useEffect, useRef, useState } from "react";
import type { AppStateSnapshot } from "../types";
import { clearPrivateAppData } from "../state";
import {
  getCurrentSession,
  loadRemoteState,
  normalizePhoneNumber,
  profileFromSession,
  subscribeToAuthChanges,
  syncRemoteState,
} from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { t } from "../i18n";

export function useRemoteAccountSync({
  initialState,
  state,
  isGuest,
  currentStreak,
  longestStreak,
  remoteSyncReady,
  onRemoteState,
  onRemoteHydrationChange,
}: {
  initialState: AppStateSnapshot;
  state: AppStateSnapshot;
  isGuest: boolean;
  currentStreak: number;
  longestStreak: number;
  remoteSyncReady: boolean;
  onRemoteState: (state: AppStateSnapshot) => void;
  onRemoteHydrationChange: (ready: boolean) => void;
}) {
  const [authSessionLoaded, setAuthSessionLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [hydrationRetryToken, setHydrationRetryToken] = useState(0);
  const latestState = useRef(state);
  const guestMergeDecisions = useRef(new Map<string, boolean>());

  useEffect(() => {
    latestState.current = state;
  }, [state]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
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
          const privateGuestDataExists =
            initialState.sessions.length > 0 ||
            initialState.dailyCompletions.length > 0 ||
            initialState.savedZikrIds.length > 0 ||
            Object.values(initialState.completed).some((items) => items.length > 0);
          const legacyIdentityMatches =
            !initialState.profile.accountUserId &&
            !initialState.profile.isGuest &&
            Boolean(session.user.phone) &&
            normalizePhoneNumber(initialState.profile.lastPhoneNumber) ===
              normalizePhoneNumber(session.user.phone ?? "");
          const knownDifferentOwner =
            Boolean(initialState.profile.accountUserId) && initialState.profile.accountUserId !== session.user.id;
          const shouldMergeGuestProgress =
            !initialState.profile.accountUserId && initialState.profile.isGuest && privateGuestDataExists
              ? (guestMergeDecisions.current.get(session.user.id) ??
                (() => {
                  const decision = window.confirm(t(initialState.settings.language, "auth.mergeGuestProgress"));
                  guestMergeDecisions.current.set(session.user.id, decision);
                  return decision;
                })())
              : true;
          const mayUseLocalPrivateData =
            !knownDifferentOwner &&
            (initialState.profile.accountUserId === session.user.id ||
              legacyIdentityMatches ||
              (!initialState.profile.accountUserId && initialState.profile.isGuest && shouldMergeGuestProgress));
          const hydrationBase = mayUseLocalPrivateData
            ? {
                ...initialState,
                profile: { ...initialState.profile, accountUserId: session.user.id },
              }
            : {
                ...clearPrivateAppData(initialState),
                profile: profileFromSession(session, initialState.profile.lastPhoneNumber),
              };
          if (!mayUseLocalPrivateData) {
            // Never leave another account's private data visible while a remote restore is pending or has failed.
            onRemoteState(hydrationBase);
          }
          const mergedState = await loadRemoteState(session, hydrationBase);
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

    const unsubscribe = subscribeToAuthChanges((session) => {
      if (!active) {
        return;
      }

      if (!session) {
        if (!latestState.current.profile.isGuest || latestState.current.profile.accountUserId) {
          onRemoteState(clearPrivateAppData(latestState.current));
        }
        onRemoteHydrationChange(false);
        setAuthSessionLoaded(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [hydrationRetryToken, initialState, onRemoteHydrationChange, onRemoteState]);

  useEffect(() => {
    if (!isSupabaseConfigured || !authSessionLoaded || isGuest || !remoteSyncReady) {
      return;
    }

    let cancelled = false;

    const pushRemoteState = async () => {
      try {
        setIsSyncing(true);
        const session = await getCurrentSession();
        if (!session || cancelled) {
          return;
        }

        await syncRemoteState(session, state, { currentStreak, longestStreak });
        if (!cancelled) {
          setSyncError("");
        }
      } catch (error) {
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : t(state.settings.language, "syncStatus.pushError"));
        }
      } finally {
        if (!cancelled) {
          setIsSyncing(false);
        }
      }
    };

    const timer = window.setTimeout(() => void pushRemoteState(), 350);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authSessionLoaded, currentStreak, isGuest, longestStreak, remoteSyncReady, retryToken, state]);

  const retry = useCallback(() => {
    if (remoteSyncReady) {
      setRetryToken((value) => value + 1);
    } else {
      setHydrationRetryToken((value) => value + 1);
    }
  }, [remoteSyncReady]);

  return { isSyncing, retry, syncError };
}
