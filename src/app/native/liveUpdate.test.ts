import { describe, expect, it } from "vitest";
import { parseLiveUpdateManifest } from "./liveUpdate";

describe("native live update manifest", () => {
  it("accepts a checksum-verified zip bundle", () => {
    expect(
      parseLiveUpdateManifest({
        bundleId: "2026-10-23.1",
        url: "https://example.com/live-update.zip",
        checksum: "a".repeat(64),
        minVersionCode: "1",
      }),
    ).toEqual({
      bundleId: "2026-10-23.1",
      url: "https://example.com/live-update.zip",
      checksum: "a".repeat(64),
      minVersionCode: "1",
    });
  });

  it("rejects malformed or unverifiable manifests", () => {
    expect(parseLiveUpdateManifest(null)).toBeNull();
    expect(parseLiveUpdateManifest({ bundleId: "", url: "https://example.com/a.zip" })).toBeNull();
    expect(parseLiveUpdateManifest({ bundleId: "1", url: "http://example.com/a.zip" })).toBeNull();
    expect(
      parseLiveUpdateManifest({ bundleId: "1", url: "https://example.com/a.zip", checksum: "not-a-hash" }),
    ).toBeNull();
    expect(
      parseLiveUpdateManifest({ bundleId: "1", url: "https://example.com/a.zip", minVersionCode: "not-a-number" }),
    ).toBeNull();
  });
});
