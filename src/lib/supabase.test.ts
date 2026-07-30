import { describe, expect, it } from "vitest";
import { hasValidSupabaseConfig, isEnabledFeatureFlag } from "./supabase";

describe("Supabase configuration", () => {
  it.each([
    ["true", true],
    [" TRUE ", true],
    ["false", false],
    ["1", false],
    [undefined, false],
  ])("parses provider flag %j", (value, expected) => {
    expect(isEnabledFeatureFlag(value)).toBe(expected);
  });

  it("requires both a real project URL and a public browser key", () => {
    expect(hasValidSupabaseConfig("https://project.supabase.co", "sb_publishable_key")).toBe(true);
    expect(hasValidSupabaseConfig("https://your-project-ref.supabase.co", "sb_publishable_key")).toBe(false);
    expect(hasValidSupabaseConfig("https://project.supabase.co", "")).toBe(false);
  });
});
