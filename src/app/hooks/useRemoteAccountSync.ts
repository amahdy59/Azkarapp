import { useCallback, useEffect, useRef, useState } from "react";
import type { AppStateSnapshot, UserProfileState } from "../types";
import {
  getCurrentSession,
  loadRemoteState,
  profileFromSession,
  subscribeToAuthChanges,
  syncRemoteState,
} from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";

export function useRemoteAccountSync({
  initialState,
  state,
  isGuest,
  currentStreak,
  longestStreak,
  onRemoteState,
  onAuthProfile,
}: {
  initialState: AppStateSnapshot;
  state: AppStateSnapshot;
  isGuest: boolean;
  currentStreak: number;
  longestStreak: number;
  onRemoteState: (state: AppStateSnapshot) => void;
  onAuthProfile: (profile: UserProfileState) => void;
}) {
  const [authSessionLoaded, setAuthSessionLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const latestPhoneNumber = useRef(state.profile.lastPhoneNumber);

  useEffect(() => {
    latestPhoneNumber.current = state.profile.lastPhoneNumber;
  }, [state.profile.lastPhoneNumber]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthSessionLoaded(true);
      return;
    }

    let active = true;

    const hydrateSession = async () => {
      try {
        const session = await getCurrentSession();
        if (!active) {
          return;
        }

        if (session) {
          const mergedState = await loadRemoteState(session, initialState);
          if (active) {
            setSyncError("");
            onRemoteState(mergedState);
          }
        }
      } catch (error) {
        if (active) {
          setSyncError(error instanceof Error ? error.message : "Could not restore your session.");
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

      onAuthProfile(profileFromSession(session, latestPhoneNumber.current));
      if (!session) {
        setAuthSessionLoaded(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [initialState, onAuthProfile, onRemoteState]);

  useEffect(() => {
    if (!isSupabaseConfigured || !authSessionLoaded || isGuest) {
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
          setSyncError(error instanceof Error ? error.message : "Could not sync your account.");
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
  }, [authSessionLoaded, currentStreak, isGuest, longestStreak, retryToken, state]);

  const retry = useCallback(() => setRetryToken((value) => value + 1), []);

  return { isSyncing, retry, syncError };
}
