import { act, renderHook, waitFor } from "@testing-library/react";
import { useCallback, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import type { AppStateSnapshot } from "../types";

const authMocks = vi.hoisted(() => ({
  getCurrentSession: vi.fn(),
  loadRemoteState: vi.fn(),
  subscribeToAuthChanges: vi.fn(),
  syncRemoteState: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({ isSupabaseConfigured: true }));

vi.mock("../../lib/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../lib/auth")>();
  return {
    ...original,
    getCurrentSession: authMocks.getCurrentSession,
    loadRemoteState: authMocks.loadRemoteState,
    subscribeToAuthChanges: authMocks.subscribeToAuthChanges,
    syncRemoteState: authMocks.syncRemoteState,
  };
});

import { useRemoteAccountSync } from "./useRemoteAccountSync";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function privateState(profile: AppStateSnapshot["profile"]): AppStateSnapshot {
  return {
    ...DEFAULT_APP_STATE,
    settings: { ...DEFAULT_APP_STATE.settings, themeMode: "light" },
    profile,
    completed: { morning: [0, 1], evening: [], before_sleep: [] },
    sessions: [
      {
        id: "private-session",
        category: "morning",
        completedAt: "2026-07-18T06:00:00.000Z",
        completedCount: 2,
        totalCount: 10,
        durationSeconds: 45,
        isComplete: false,
      },
    ],
    dailyCompletions: [{ dayKey: "2026-07-18", category: "morning", timeZone: "Africa/Cairo" }],
    savedZikrIds: ["m-hm-75"],
  };
}

function accountSession(userId: string): Session {
  return {
    user: {
      id: userId,
      phone: "+201000000002",
      user_metadata: { display_name: "Remote owner" },
    },
  } as unknown as Session;
}

function renderRemoteSync(initialState: AppStateSnapshot) {
  const onRemoteState = vi.fn();
  const onRemoteHydrationChange = vi.fn();

  const hook = renderHook(() => {
    const [remoteSyncReady, setRemoteSyncReady] = useState(false);
    const handleHydrationChange = useCallback((ready: boolean) => {
      onRemoteHydrationChange(ready);
      setRemoteSyncReady(ready);
    }, []);
    const sync = useRemoteAccountSync({
      initialState,
      state: initialState,
      isGuest: initialState.profile.isGuest,
      currentStreak: 0,
      longestStreak: 0,
      remoteSyncReady,
      onRemoteState,
      onRemoteHydrationChange: handleHydrationChange,
    });

    return { ...sync, remoteSyncReady };
  });

  return { ...hook, onRemoteState, onRemoteHydrationChange };
}

function expectSanitizedBoundaryState(state: AppStateSnapshot, expectedAccountId: string) {
  expect(state.settings.themeMode).toBe("light");
  expect(state.profile).toEqual({
    displayName: "Remote owner",
    lastPhoneNumber: "+201000000002",
    isGuest: false,
    accountUserId: expectedAccountId,
  });
  expect(state.completed).toEqual({ morning: [], evening: [], before_sleep: [] });
  expect(state.sessions).toEqual([]);
  expect(state.dailyCompletions).toEqual([]);
  expect(state.savedZikrIds).toEqual([]);
}

describe("useRemoteAccountSync account boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.subscribeToAuthChanges.mockReturnValue(vi.fn());
    authMocks.syncRemoteState.mockResolvedValue(undefined);
  });

  it("sanitizes another account's private data before remote hydration resolves", async () => {
    const session = accountSession("account-b");
    const remoteHydration = deferred<AppStateSnapshot>();
    const initialState = privateState({
      displayName: "Account A",
      lastPhoneNumber: "+201000000001",
      isGuest: false,
      accountUserId: "account-a",
    });
    authMocks.getCurrentSession.mockResolvedValue(session);
    authMocks.loadRemoteState.mockReturnValue(remoteHydration.promise);

    const { result, onRemoteState, onRemoteHydrationChange } = renderRemoteSync(initialState);

    await waitFor(() => expect(authMocks.loadRemoteState).toHaveBeenCalledOnce());
    expect(onRemoteState).toHaveBeenCalledOnce();
    const sanitizedState = onRemoteState.mock.calls[0]?.[0] as AppStateSnapshot;
    expectSanitizedBoundaryState(sanitizedState, "account-b");
    expect(authMocks.loadRemoteState.mock.calls[0]?.[1]).toBe(sanitizedState);
    expect(onRemoteState.mock.invocationCallOrder[0]).toBeLessThan(
      authMocks.loadRemoteState.mock.invocationCallOrder[0]!,
    );
    expect(result.current.remoteSyncReady).toBe(false);

    const restoredState = {
      ...sanitizedState,
      completed: { morning: [], evening: [0], before_sleep: [] },
    };
    await act(async () => {
      remoteHydration.resolve(restoredState);
      await remoteHydration.promise;
    });

    await waitFor(() => expect(result.current.remoteSyncReady).toBe(true));
    expect(onRemoteState).toHaveBeenLastCalledWith(restoredState);
    expect(onRemoteHydrationChange).toHaveBeenLastCalledWith(true);
  });

  it("sanitizes declined guest data before a failed restore and keeps remote sync blocked", async () => {
    const session = accountSession("account-b");
    const remoteHydration = deferred<AppStateSnapshot>();
    const initialState = privateState({
      displayName: "Guest",
      lastPhoneNumber: "",
      isGuest: true,
      accountUserId: "",
    });
    authMocks.getCurrentSession.mockResolvedValue(session);
    authMocks.loadRemoteState.mockReturnValue(remoteHydration.promise);
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result, onRemoteState, onRemoteHydrationChange } = renderRemoteSync(initialState);

    await waitFor(() => expect(authMocks.loadRemoteState).toHaveBeenCalledOnce());
    expect(confirm).toHaveBeenCalledOnce();
    expect(onRemoteState).toHaveBeenCalledOnce();
    const sanitizedState = onRemoteState.mock.calls[0]?.[0] as AppStateSnapshot;
    expectSanitizedBoundaryState(sanitizedState, "account-b");
    expect(authMocks.loadRemoteState.mock.calls[0]?.[1]).toBe(sanitizedState);
    expect(onRemoteState.mock.invocationCallOrder[0]).toBeLessThan(
      authMocks.loadRemoteState.mock.invocationCallOrder[0]!,
    );

    await act(async () => {
      remoteHydration.reject(new Error("restore failed"));
      try {
        await remoteHydration.promise;
      } catch {
        // The hook converts this hydration failure into syncError state.
      }
    });

    await waitFor(() => expect(result.current.syncError).toBe("restore failed"));
    expect(result.current.remoteSyncReady).toBe(false);
    expect(onRemoteHydrationChange).not.toHaveBeenCalledWith(true);
    expect(onRemoteState).toHaveBeenCalledOnce();
  });
});
