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
} from "./auth";
import { DEFAULT_APP_STATE } from "../app/state";

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithOtp: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
}));

vi.mock("./supabase", () => ({
  getAuthCallbackUrl: () => "https://example.com/?view=auth-callback",
  getSupabaseClient: async () => ({ auth: authMocks }),
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
});
