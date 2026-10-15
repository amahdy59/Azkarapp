import type { Session } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildRemoteSettingsJson,
  getCurrentSession,
  getSessionsForRemoteSync,
  profileFromSession,
  REMOTE_SESSION_PAGE_SIZE,
  requestEmailOtp,
  signInWithOAuthProvider,
  signOutSupabase,
  subscribeToAuthChanges,
  verifyEmailOtp,
  loadRemoteState,
  syncRemoteState,
} from "./auth";
import { DEFAULT_APP_STATE } from "../app/state";

const authMocks = vi.hoisted(() => ({
  from: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithOtp: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("./supabase", () => ({
  getAuthCallbackUrl: () => "https://example.com/?view=auth-callback",
  getSupabaseClient: async () => ({ auth: authMocks, from: authMocks.from }),
  isSupabaseConfigured: true,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("provider-neutral auth requests", () => {
  it("normalizes an email and sends a six-digit OTP request", async () => {
    authMocks.signInWithOtp.mockResolvedValue({ error: null });

    await expect(requestEmailOtp("  AHMED@example.com ")).resolves.toBe("ahmed@example.com");
    expect(authMocks.signInWithOtp).toHaveBeenCalledWith({
      email: "ahmed@example.com",
      options: { shouldCreateUser: true },
    });
  });

  it("surfaces email request and verification failures", async () => {
    const requestError = new Error("email unavailable");
    authMocks.signInWithOtp.mockResolvedValue({ error: requestError });
    await expect(requestEmailOtp("a@example.com")).rejects.toBe(requestError);

    const verifyError = new Error("invalid code");
    authMocks.verifyOtp.mockResolvedValue({ data: { session: null }, error: verifyError });
    await expect(verifyEmailOtp("a@example.com", "123456")).rejects.toBe(verifyError);
  });

  it("returns the verified email session", async () => {
    const session = { user: { id: "user-123" } } as unknown as Session;
    authMocks.verifyOtp.mockResolvedValue({ data: { session }, error: null });

    await expect(verifyEmailOtp(" A@example.com ", "123456")).resolves.toBe(session);
    expect(authMocks.verifyOtp).toHaveBeenCalledWith({
      email: "a@example.com",
      token: "123456",
      type: "email",
    });
  });

  it("starts OAuth with the configured callback and surfaces provider errors", async () => {
    authMocks.signInWithOAuth.mockResolvedValueOnce({ data: { provider: "google" }, error: null });
    await expect(signInWithOAuthProvider("google")).resolves.toEqual({ provider: "google" });
    expect(authMocks.signInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: { redirectTo: "https://example.com/?view=auth-callback" },
    });

    const providerError = new Error("provider disabled");
    authMocks.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: providerError });
    await expect(signInWithOAuthProvider("apple")).rejects.toBe(providerError);
  });

  it("restores sessions, signs out, and unsubscribes auth listeners", async () => {
    const session = { user: { id: "user-123" } } as unknown as Session;
    authMocks.getSession.mockResolvedValue({ data: { session }, error: null });
    authMocks.signOut.mockResolvedValue({ error: null });
    const unsubscribe = vi.fn();
    authMocks.onAuthStateChange.mockImplementation((callback) => {
      callback("SIGNED_IN", session);
      return { data: { subscription: { unsubscribe } } };
    });
    const callback = vi.fn();

    await expect(getCurrentSession()).resolves.toBe(session);
    await expect(signOutSupabase()).resolves.toBeUndefined();
    const stop = await subscribeToAuthChanges(callback);
    expect(callback).toHaveBeenCalledWith(session);
    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

describe("profileFromSession", () => {
  it("normalizes provider-neutral identity fields", () => {
    const session = {
      user: {
        id: "user-123",
        email: "ahmed@example.com",
        phone: "+966501234567",
        user_metadata: { full_name: "  Ahmed  ", picture: "https://example.com/avatar.png" },
      },
    } as unknown as Session;

    expect(profileFromSession(session)).toEqual({
      displayName: "Ahmed",
      email: "ahmed@example.com",
      phone: "+966501234567",
      avatarUrl: "https://example.com/avatar.png",
      isGuest: false,
      accountUserId: "user-123",
    });
  });

  it("uses the email prefix when a provider supplies no name", () => {
    const session = {
      user: {
        email: "private-relay@example.com",
        user_metadata: {},
      },
    } as unknown as Session;

    expect(profileFromSession(session).displayName).toBe("private-relay");
  });

  it("returns the guest profile without inventing provider data", () => {
    expect(profileFromSession(null)).toEqual({
      displayName: "Guest",
      email: "",
      phone: "",
      avatarUrl: "",
      isGuest: true,
      accountUserId: "",
    });
  });
});

describe("remote history bounds", () => {
  it("keeps the initial remote history page deliberately bounded", () => {
    expect(REMOTE_SESSION_PAGE_SIZE).toBe(100);
  });

  it("syncs only the newest bounded session page", () => {
    const sessions = Array.from({ length: REMOTE_SESSION_PAGE_SIZE + 5 }, (_, index) => ({
      id: `session-${index}`,
      category: "morning" as const,
      completedAt: new Date(2026, 0, index + 1).toISOString(),
      completedCount: 1,
      totalCount: 1,
      durationSeconds: 1,
      isComplete: true,
    }));

    const selected = getSessionsForRemoteSync(sessions);
    expect(selected).toHaveLength(REMOTE_SESSION_PAGE_SIZE);
    expect(selected[0]?.id).toBe("session-104");
    expect(selected.at(-1)?.id).toBe("session-5");
  });
});

describe("remote settings", () => {
  it("keeps precise prayer location and calculation preferences device-local", () => {
    const location = {
      latitude: 21.4225,
      longitude: 39.8262,
      cityName: "Makkah",
      calculationMethod: 4,
      autoDetect: true,
      timeZone: "Asia/Riyadh",
      adjustments: { fajr: -2, dhuhr: 0, asr: 1, maghrib: 0, isha: 3 },
    };

    expect(
      buildRemoteSettingsJson({
        ...DEFAULT_APP_STATE,
        settings: { ...DEFAULT_APP_STATE.settings, location },
      }),
    ).not.toHaveProperty("location");
  });

  it("tags synced partial progress with the current midnight-based day", () => {
    expect(buildRemoteSettingsJson(DEFAULT_APP_STATE).lastActiveDayKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

type QueryResult = { data: unknown; error: { code?: string; message: string } | null };
function queryFor(result: QueryResult) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    returns: vi.fn().mockResolvedValue(result),
    upsert: vi.fn().mockResolvedValue(result),
    in: vi.fn().mockResolvedValue(result),
  };
}
function database(responses: Record<string, QueryResult[]> = {}) {
  const calls: Array<{ table: string; query: ReturnType<typeof queryFor> }> = [];
  authMocks.from.mockImplementation((table: string) => {
    const response = responses[table]?.shift() ?? {
      data: ["profiles", "user_settings", "user_progress"].includes(table) ? null : [],
      error: null,
    };
    const query = queryFor(response);
    calls.push({ table, query });
    return query;
  });
  return calls;
}
const sessionFor = (id: string) => ({ user: { id, email: "reader@example.test" } }) as unknown as Session;

describe("remote synchronization boundaries", () => {
  it("keeps local coordinates and reading progress when remote rows are absent", async () => {
    const calls = database();
    const local = structuredClone(DEFAULT_APP_STATE);
    local.khatmahPage = 123;
    const loaded = await loadRemoteState(sessionFor("empty-remote"), local);
    expect(loaded.settings.location).toEqual(local.settings.location);
    expect(loaded.khatmahPage).toBe(123);
    expect(loaded.profile.accountUserId).toBe("empty-remote");
    for (const { table, query } of calls)
      expect(query.eq).toHaveBeenCalledWith(table === "profiles" ? "id" : "user_id", "empty-remote");
  });

  it("continues keyset pagination past the first 500 daily completions", async () => {
    const rows = Array.from({ length: 500 }, (_, index) => ({
      day_key: new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
      category: "morning",
      time_zone: "Africa/Cairo",
    }));
    const calls = database({
      daily_collection_completions: [
        { data: rows, error: null },
        { data: [{ day_key: "2025-06-01", category: "evening", time_zone: "Africa/Cairo" }], error: null },
      ],
    });
    const loaded = await loadRemoteState(sessionFor("paginated-history"), DEFAULT_APP_STATE);
    expect(loaded.dailyCompletions).toHaveLength(501);
    expect(loaded.dailyCompletions).toContainEqual(
      expect.objectContaining({ dayKey: "2025-06-01", category: "evening" }),
    );
    const pages = calls.filter(({ table }) => table === "daily_collection_completions");
    expect(pages).toHaveLength(2);
    expect(pages[1].query.or).toHaveBeenCalledWith(
      `day_key.gt.${rows[499].day_key},and(day_key.eq.${rows[499].day_key},category.gt.morning)`,
    );
  });

  it("uses the legacy settings fallback only for missing tables, and propagates other errors", async () => {
    const missing = { code: "PGRST205", message: "missing table" };
    const local = structuredClone(DEFAULT_APP_STATE);
    local.savedZikrIds = ["m-hm-75"];
    database({
      saved_zikr: [{ data: null, error: missing }],
      daily_collection_completions: [{ data: null, error: missing }],
    });
    expect((await loadRemoteState(sessionFor("legacy-tables"), local)).savedZikrIds).toEqual(local.savedZikrIds);
    const error = { code: "42501", message: "access denied" };
    database({ saved_zikr: [{ data: null, error }] });
    await expect(loadRemoteState(sessionFor("denied-table"), local)).rejects.toBe(error);
    expect(local.savedZikrIds).toEqual(["m-hm-75"]);
  });

  it("writes owner-scoped progress and omits coordinates from remote settings", async () => {
    const calls = database();
    await syncRemoteState(sessionFor("write-owner"), DEFAULT_APP_STATE, { currentStreak: 1, longestStreak: 2 });
    const settings = calls.find(({ table }) => table === "user_settings")!.query.upsert.mock.calls[0][0];
    expect(settings.user_id).toBe("write-owner");
    expect(settings.settings_json).not.toHaveProperty("location");
    expect(calls.find(({ table }) => table === "user_progress")!.query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: "write-owner", current_streak: 1 }),
    );
  });

  it("stops after a failed profile write rather than claiming synchronized progress", async () => {
    const error = { code: "42501", message: "profile denied" };
    const calls = database({ profiles: [{ data: null, error }] });
    await expect(
      syncRemoteState(sessionFor("write-denied"), DEFAULT_APP_STATE, { currentStreak: 0, longestStreak: 0 }),
    ).rejects.toBe(error);
    expect(calls.map(({ table }) => table)).toEqual(["profiles"]);
  });
});
