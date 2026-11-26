import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const directory = "docs/audio/opendua-pilot";
const pilot = JSON.parse(readFileSync(`${directory}/pilot.json`, "utf8"));
const measurements = JSON.parse(readFileSync(`${directory}/measurements.json`, "utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
describe("pinned OpenDua review inputs", () => {
  it("retains matching licence evidence and exact original file hashes", () => {
    expect(hash(readFileSync(`${directory}/catalogue.json`))).toBe(pilot.catalogueSha256);
    expect(hash(readFileSync(`${directory}/audio-licence.html`))).toBe(pilot.licenceSha256);
    expect(pilot.licence).toBe("CC-BY-4.0");
    expect(pilot.candidates).toHaveLength(3);
    for (const candidate of pilot.candidates) {
      const bytes = readFileSync(`${directory}/media/${candidate.file}`);
      expect(bytes.length).toBe(candidate.byteSize);
      expect(hash(bytes)).toBe(candidate.sha256);
      expect(candidate.sourceUrl).toBe(`https://audio.opendua.org/hisn/v0.0.2/${candidate.file}`);
      expect(candidate.relativePath).toBe(`dua/opendua/muhammad-jumah/v0.0.2/${candidate.file}`);
      expect(candidate.reviewStatus).toBe("pending");
    }
  });
  it("keeps technical playback evidence bound to pending original recordings", () => {
    expect(measurements.candidates).toHaveLength(pilot.candidates.length);
    for (const candidate of pilot.candidates) {
      const measured = measurements.candidates.find((entry) => entry.sha256 === candidate.sha256);
      expect(measured).toMatchObject({
        assetId: candidate.assetId,
        file: candidate.file,
        reviewStatus: "pending",
        sourceDeclaredDurationMs: candidate.sourceDeclaredDurationMs,
        playbackAdvanced: true,
      });
      expect(measured.measuredDurationMs).toBeGreaterThan(0);
    }
  });
});
