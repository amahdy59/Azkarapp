import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../app/state";
import type { AppStateSnapshot, StoredSession } from "../app/types";
import { assertNoForbiddenSyncFields, buildRemoteSyncSnapshot, FORBIDDEN_SYNC_KEYS } from "./remoteSyncSnapshot";

describe("remoteSyncSnapshot privacy boundary", () => {
  it("preserves prayer attendance without allowing device coordinates", () => {
    const snapshot = buildRemoteSyncSnapshot({
      ...DEFAULT_APP_STATE,
      prayerTracking: [{ dayKey: "2026-09-23", prayer: "fajr", mosque: false, adhkar: false, location: "home" }],
    });
    expect(snapshot.prayerTracking[0]?.location).toBe("home");
    expect(() => assertNoForbiddenSyncFields({ settings: { location: {} } })).toThrow();
  });
  const mockAppState: AppStateSnapshot = {
    ...DEFAULT_APP_STATE,
    settings: {
      ...DEFAULT_APP_STATE.settings,
      location: {
        latitude: 30.0444,
        longitude: 31.2357,
        cityName: "Cairo",
        calculationMethod: 5,
        autoDetect: true,
        timeZone: "Africa/Cairo",
        adjustments: { fajr: 2, dhuhr: 0, asr: -1, maghrib: 3, isha: 0 },
      },
    },
    profile: {
      displayName: "Devoted Reader",
      email: "private.user@example.com",
      phone: "+201234567890",
      avatarUrl: "https://example.com/avatar.jpg",
      isGuest: false,
      accountUserId: "user-uuid-9876",
    },
    sessions: Array.from({ length: 150 }, (_, i) => ({
      id: `session-${i}`,
      category: "morning",
      completedAt: new Date(2026, 0, 1, 0, i).toISOString(),
      completedCount: 10,
      totalCount: 10,
      durationSeconds: 120,
      isComplete: true,
    })) as StoredSession[],
  };

  it("excludes precise coordinates and city name from remote sync snapshot", () => {
    const sanitized = buildRemoteSyncSnapshot(mockAppState);

    expect((sanitized.settings as Record<string, unknown>).location).toBeUndefined();
    expect((sanitized as Record<string, unknown>).latitude).toBeUndefined();
    expect((sanitized as Record<string, unknown>).longitude).toBeUndefined();
    expect((sanitized as Record<string, unknown>).cityName).toBeUndefined();

    const serialized = JSON.stringify(sanitized);
    expect(serialized).not.toContain("30.0444");
    expect(serialized).not.toContain("31.2357");
    expect(serialized).not.toContain("Cairo");
  });

  it("excludes sensitive profile contact information while preserving display name", () => {
    const sanitized = buildRemoteSyncSnapshot(mockAppState);

    expect(sanitized.profile?.displayName).toBe("Devoted Reader");
    expect((sanitized.profile as Record<string, unknown>)?.email).toBeUndefined();
    expect((sanitized.profile as Record<string, unknown>)?.phone).toBeUndefined();
    expect((sanitized.profile as Record<string, unknown>)?.avatarUrl).toBeUndefined();
    expect((sanitized.profile as Record<string, unknown>)?.accountUserId).toBeUndefined();

    const serialized = JSON.stringify(sanitized);
    expect(serialized).not.toContain("private.user@example.com");
    expect(serialized).not.toContain("+201234567890");
    expect(serialized).not.toContain("user-uuid-9876");
  });

  it("bounds session history to at most 100 newest sessions", () => {
    const sanitized = buildRemoteSyncSnapshot(mockAppState);
    expect(sanitized.sessions.length).toBe(100);
    // Newest session should be session-149
    expect(sanitized.sessions[0]?.id).toBe("session-149");
  });

  it("passes assertNoForbiddenSyncFields for sanitized snapshot", () => {
    const sanitized = buildRemoteSyncSnapshot(mockAppState);
    expect(() => assertNoForbiddenSyncFields(sanitized)).not.toThrow();
  });

  it("fails assertNoForbiddenSyncFields if any forbidden key is present anywhere in tree", () => {
    for (const forbiddenKey of FORBIDDEN_SYNC_KEYS) {
      const contaminatedObject = {
        safeField: 123,
        nested: {
          [forbiddenKey]: "leak",
        },
      };
      expect(() => assertNoForbiddenSyncFields(contaminatedObject)).toThrowError(
        new RegExp(`Forbidden sync field detected: nested\\.${forbiddenKey}`),
      );
    }
  });
});
