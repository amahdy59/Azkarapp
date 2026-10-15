import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "../state";
import { parseHash } from "../routing";
import { buildWidgetSnapshot } from "./widgetSnapshot";

describe("widget projection", () => {
  it("projects exactly four local cards with working routes and bounded prayer validity", () => {
    const state = structuredClone(DEFAULT_APP_STATE);
    state.quranReadingPosition = { page: 123 };
    state.masbahaState = { count: 17, target: 33, laps: 0 };
    const now = new Date(2026, 9, 15, 12);
    const snapshot = buildWidgetSnapshot(state, now);
    expect(snapshot.version).toBe(1);
    expect(snapshot.cards).toHaveLength(4);
    expect(snapshot.validUntil).toBeGreaterThan(now.getTime());
    expect(snapshot.validUntil - now.getTime()).toBeLessThanOrEqual(24 * 60 * 60_000);
    expect(snapshot.cards[2].route).toBe("#/quran/123");
    for (const card of snapshot.cards) expect(parseHash(card.route)).not.toBeNull();
    expect(JSON.stringify(snapshot)).not.toMatch(/latitude|longitude|profile|email|credential|savedZikrIds/);
  });
});
