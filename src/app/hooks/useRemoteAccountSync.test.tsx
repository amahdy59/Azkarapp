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

import { createSerializedTaskQueue, useRemoteAccountSync } from "./useRemoteAccountSync";

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
    completed: {
      ...DEFAULT_APP_STATE.completed,
      morning: ["m-hm-77m", "m-hm-75"],
    },
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
  const requestGuestMigrationDecision = vi.fn().mockResolvedValue("discard");

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
      requestGuestMigrationDecision,
    });

    return { ...sync, remoteSyncReady };
  });

  return { ...hook, onRemoteState, onRemoteHydrationChange, requestGuestMigrationDecision };
}

function expectSanitizedBoundaryState(state: AppStateSnapshot, expectedAccountId: string) {
  expect(state.settings.themeMode).toBe("light");
  expect(state.profile).toEqual({
    displayName: "Remote owner",
    email: "",
    phone: "+201000000002",
    avatarUrl: "",
    isGuest: false,
    accountUserId: expectedAccountId,
  });
  expect(state.completed).toEqual(DEFAULT_APP_STATE.completed);
  expect(state.sessions).toEqual([]);
  expect(state.dailyCompletions).toEqual([]);
  expect(state.savedZikrIds).toEqual([]);
}

describe("useRemoteAccountSync account boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.subscribeToAuthChanges.mockResolvedValue(vi.fn());
    authMocks.syncRemoteState.mockResolvedValue(undefined);
  });

  it("sanitizes another account's private data before remote hydration resolves", async () => {
    const session = accountSession("account-b");
    const remoteHydration = deferred<AppStateSnapshot>();
    const initialState = privateState({
      displayName: "Account A",
      email: "",
      phone: "+201000000001",
      avatarUrl: "",
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
      completed: {
        ...DEFAULT_APP_STATE.completed,
        evening: ["e-hm-75a"],
      },
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
      email: "",
      phone: "",
      avatarUrl: "",
      isGuest: true,
      accountUserId: "",
    });
    authMocks.getCurrentSession.mockResolvedValue(session);
    authMocks.loadRemoteState.mockReturnValue(remoteHydration.promise);
    const { result, onRemoteState, onRemoteHydrationChange, requestGuestMigrationDecision } =
      renderRemoteSync(initialState);

    await waitFor(() => expect(authMocks.loadRemoteState).toHaveBeenCalledOnce());
    expect(requestGuestMigrationDecision).toHaveBeenCalledOnce();
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

describe("serialized sync queue", () => {
  it("never overlaps remote uploads and continues after a failure", async () => {
    const queue = createSerializedTaskQueue();
    const first = deferred<void>();
    const order: string[] = [];
    let active = 0;
    let maximumActive = 0;

    const firstTask = queue.enqueue(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      order.push("first:start");
      await first.promise;
      active -= 1;
      order.push("first:end");
      throw new Error("recoverable");
    });
    const secondTask = queue.enqueue(async () => {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      order.push("second:start");
      active -= 1;
      order.push("second:end");
    });

    await waitFor(() => expect(order).toEqual(["first:start"]));
    first.resolve();
    await expect(firstTask).rejects.toThrow("recoverable");
    await secondTask;

    expect(maximumActive).toBe(1);
    expect(order).toEqual(["first:start", "first:end", "second:start", "second:end"]);
  });
});
