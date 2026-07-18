import type { Session } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import { normalizePhoneNumber, profileFromSession, REMOTE_SESSION_PAGE_SIZE } from "./auth";

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
});

describe("remote history bounds", () => {
  it("keeps the initial remote history page deliberately bounded", () => {
    expect(REMOTE_SESSION_PAGE_SIZE).toBe(100);
  });
});
