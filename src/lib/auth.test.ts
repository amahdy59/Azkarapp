import type { Session } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  buildRemoteSettingsJson,
  getSessionsForRemoteSync,
  normalizePhoneNumber,
  profileFromSession,
  REMOTE_SESSION_PAGE_SIZE,
} from "./auth";
import { DEFAULT_APP_STATE } from "../app/state";

describe("normalizePhoneNumber", () => {
  it.each([
    ["", ""],
    ["  ", ""],
    ["+966 50 123 4567", "+966501234567"],
    ["00966 50 123 4567", "+966501234567"],
    ["966501234567", "+966501234567"],
    ["0501234567", "+966501234567"],
    ["501234567", "+966501234567"],
  ])("normalizes %j to %j", (input, expected) => {
    expect(normalizePhoneNumber(input)).toBe(expected);
  });
});

describe("profileFromSession", () => {
  it("prefers a trimmed display name and the authenticated phone number", () => {
    const session = {
      user: {
        id: "user-123",
        phone: "+966501234567",
        user_metadata: { display_name: "  Ahmed  " },
      },
    } as unknown as Session;

    expect(profileFromSession(session, "+966500000000")).toEqual({
      displayName: "Ahmed",
      lastPhoneNumber: "+966501234567",
      isGuest: false,
      accountUserId: "user-123",
    });
  });

  it("uses the final four phone digits when no display name is available", () => {
    const session = {
      user: {
        phone: "+966501234567",
        user_metadata: {},
      },
    } as unknown as Session;

    expect(profileFromSession(session, "").displayName).toBe("User 4567");
  });

  it("returns the guest profile and preserves the entered phone before authentication", () => {
    expect(profileFromSession(null, "+966500000000")).toEqual({
      displayName: "Guest",
      lastPhoneNumber: "+966500000000",
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
  it("includes prayer location and calculation preferences in account sync", () => {
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
      }).location,
    ).toEqual(location);
  });
});
