import type { Session } from "@supabase/supabase-js";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_APP_STATE } from "../state";

const authMocks = vi.hoisted(() => ({
  signOutSupabase: vi.fn(),
}));

vi.mock("../../lib/auth", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../lib/auth")>();
  return { ...original, signOutSupabase: authMocks.signOutSupabase };
});

vi.mock("../../lib/supabase", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../lib/supabase")>();
  return { ...original, isSupabaseConfigured: true };
});

import { getSafeAuthErrorMessage, prepareAuthenticatedState, useAuthHandlers } from "./useAuthHandlers";

function session(userId = "account-a") {
  return {
    user: {
      id: userId,
      email: "ahmed@example.com",
      user_metadata: { full_name: "Ahmed" },
    },
  } as unknown as Session;
}

const guestWithProgress = {
  ...DEFAULT_APP_STATE,
  completed: { ...DEFAULT_APP_STATE.completed, morning: ["m-hm-77m"] },
  sessions: [
    {
      id: "guest-session",
      category: "morning" as const,
      completedAt: "2026-07-30T05:00:00.000Z",
      completedCount: 1,
      totalCount: 2,
      durationSeconds: 30,
      isComplete: false,
    },
  ],
  savedZikrIds: ["m-hm-77m"],
};

describe("prepareAuthenticatedState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("keeps guest progress for the merge choice and assigns the authenticated owner", async () => {
    const result = await prepareAuthenticatedState(session(), guestWithProgress, async () => "merge");

    expect(result?.completed.morning).toEqual(["m-hm-77m"]);
    expect(result?.sessions).toHaveLength(1);
    expect(result?.savedZikrIds).toEqual(["m-hm-77m"]);
    expect(result?.profile).toMatchObject({
      displayName: "Ahmed",
      email: "ahmed@example.com",
      accountUserId: "account-a",
      isGuest: false,
    });
  });

  it("clears guest private data for the discard choice", async () => {
    const result = await prepareAuthenticatedState(session(), guestWithProgress, async () => "discard");

    expect(result?.completed.morning).toEqual([]);
    expect(result?.sessions).toEqual([]);
    expect(result?.dailyCompletions).toEqual([]);
    expect(result?.savedZikrIds).toEqual([]);
  });

  it("signs out and remains a guest for the cancel choice", async () => {
    const result = await prepareAuthenticatedState(session(), guestWithProgress, async () => "cancel");

    expect(result).toBeNull();
    expect(authMocks.signOutSupabase).toHaveBeenCalledOnce();
  });

  it("never exposes a previous authenticated account's private cache", async () => {
    const accountAState = {
      ...guestWithProgress,
      profile: {
        displayName: "Account A",
        email: "a@example.com",
        phone: "",
        avatarUrl: "",
        accountUserId: "account-a",
        isGuest: false,
      },
    };
    const decision = vi.fn();

    const result = await prepareAuthenticatedState(session("account-b"), accountAState, decision);

    expect(decision).not.toHaveBeenCalled();
    expect(result?.completed.morning).toEqual([]);
    expect(result?.sessions).toEqual([]);
    expect(result?.profile.accountUserId).toBe("account-b");
  });
});

describe("getSafeAuthErrorMessage", () => {
  it("maps stable Supabase codes without exposing backend messages", () => {
    const error = { code: "over_request_rate_limit", message: "internal provider detail", status: 429 };
    expect(getSafeAuthErrorMessage(error, "en", "auth.verifyCodeError")).toBe(
      "Too many attempts. Wait a few minutes, then try again.",
    );
  });

  it("uses a localized fallback for unknown failures", () => {
    expect(getSafeAuthErrorMessage(new Error("private backend text"), "ar", "auth.signOutError")).toBe(
      "تعذر تسجيل الخروج.",
    );
  });
});

describe("account sign-out boundary", () => {
  it("removes private local caches but preserves device preferences and downloads", async () => {
    window.localStorage.setItem("azkarapp_recent_searches_ar", '["private"]');
    window.localStorage.setItem("azkarapp.prayer_times_cache.2026-08-09.30.0.31.2.5", "{}");
    window.localStorage.setItem("azkar.audio-preferences.v1", '{"voice":"reader"}');
    window.localStorage.setItem("azkar.audio-downloads.v1", "{}");
    let confirm: (() => void | Promise<void>) | undefined;
    const applyStateSnapshot = vi.fn();
    const showConfirm = vi.fn((...args: unknown[]) => {
      confirm = args[4] as () => void | Promise<void>;
    });

    const { result } = renderHook(() =>
      useAuthHandlers({
        selectedLang: "en",
        email: "",
        setEmail: vi.fn(),
        setRemoteSyncReady: vi.fn(),
        appStateSnapshot: DEFAULT_APP_STATE,
        applyStateSnapshot,
        markOnboardingComplete: vi.fn(),
        requestGuestMigrationDecision: async () => "merge",
        showConfirm,
        setView: vi.fn(),
        setActiveTab: vi.fn(),
      }),
    );

    act(() => result.current.handleSignOut());
    await act(async () => confirm?.());

    expect(authMocks.signOutSupabase).toHaveBeenCalledOnce();
    expect(applyStateSnapshot).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("azkarapp_recent_searches_ar")).toBeNull();
    expect(window.localStorage.getItem("azkarapp.prayer_times_cache.2026-08-09.30.0.31.2.5")).toBeNull();
    expect(window.localStorage.getItem("azkar.audio-preferences.v1")).not.toBeNull();
    expect(window.localStorage.getItem("azkar.audio-downloads.v1")).toBe("{}");
  });
});
