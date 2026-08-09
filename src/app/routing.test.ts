import { describe, expect, it } from "vitest";
import { parseHash, parseLocation, routeToHash } from "./routing";

describe("routeToHash", () => {
  it("maps the primary destinations to stable paths", () => {
    expect(routeToHash({ view: "home" })).toBe("#/home");
    expect(routeToHash({ view: "library" })).toBe("#/azkar");
    expect(routeToHash({ view: "progress" })).toBe("#/progress");
    expect(routeToHash({ view: "settings" })).toBe("#/settings");
    expect(routeToHash({ view: "friday_salawat" })).toBe("#/friday/salawat");
    expect(routeToHash({ view: "custom_counter" })).toBe("#/counter");
  });

  it("includes the collection and a one-based zikr position", () => {
    expect(routeToHash({ view: "category", categoryId: "morning" })).toBe("#/azkar/morning");
    expect(routeToHash({ view: "reader", categoryId: "before_sleep", index: 4 })).toBe("#/azkar/before-sleep/5");
  });

  it("encodes the search query so Arabic survives a round trip", () => {
    const hash = routeToHash({ view: "search", query: "الله" });
    expect(parseHash(hash!)).toEqual({ view: "search", query: "الله" });
    expect(routeToHash({ view: "search" })).toBe("#/search");
  });

  it("keeps onboarding and auth steps out of the URL", () => {
    expect(routeToHash({ view: "splash" })).toBeNull();
    expect(routeToHash({ view: "otp" })).toBeNull();
    expect(routeToHash({ view: "auth-callback" })).toBeNull();
  });
});

describe("parseHash", () => {
  it("round-trips every linkable view", () => {
    for (const route of [
      { view: "home" },
      { view: "library" },
      { view: "progress" },
      { view: "settings" },
      { view: "benefits" },
      { view: "friday" },
      { view: "friday_salawat" },
      { view: "custom_counter" },
    ] as const) {
      expect(parseHash(routeToHash(route)!)).toEqual(route);
    }
  });

  it("reads a reader position back as a zero-based index", () => {
    expect(parseHash("#/azkar/morning/5")).toEqual({ view: "reader", categoryId: "morning", index: 4 });
  });

  it("rejects unknown collections and nonsense positions", () => {
    expect(parseHash("#/azkar/not-a-collection")).toBeNull();
    expect(parseHash("#/azkar/morning/0")).toBeNull();
    expect(parseHash("#/azkar/morning/abc")).toBeNull();
    expect(parseHash("#/hometae")).toBeNull();
    expect(parseHash("")).toBeNull();
  });
});

describe("parseLocation", () => {
  it("routes the OAuth return before anything else", () => {
    expect(parseLocation("?view=auth-callback", "#/home")).toEqual({ view: "auth-callback" });
  });

  it("prefers the hash over a legacy query parameter", () => {
    expect(parseLocation("?view=friday", "#/progress")).toEqual({ view: "progress" });
  });

  it("still honours legacy ?view= links", () => {
    expect(parseLocation("?view=custom_counter", "")).toEqual({ view: "custom_counter" });
    expect(parseLocation("?view=progress", "")).toEqual({ view: "progress" });
  });

  it("returns null for an invalid view so the app can fall back", () => {
    expect(parseLocation("?view=hometae", "")).toBeNull();
    expect(parseLocation("", "")).toBeNull();
  });
});
