import { describe, expect, it } from "vitest";
import { findStaleness, validateManifest } from "./check-release-notes.mjs";

const valid = {
  release: "2026-08-19",
  ar: ["الأول", "الثاني", "الثالث"],
  en: ["First", "Second", "Third"],
};

describe("validateManifest", () => {
  it("accepts a bilingual manifest carrying a release stamp", () => {
    expect(validateManifest(valid)).toEqual([]);
  });

  it("rejects a manifest without a release stamp", () => {
    expect(validateManifest({ ar: valid.ar, en: valid.en })).toHaveLength(1);
  });

  it.each([2, 5])("rejects %i notes so the prompt stays a summary", (count) => {
    const notes = Array.from({ length: count }, (_, index) => `Note ${index}`);
    expect(validateManifest({ ...valid, en: notes, ar: notes })).not.toEqual([]);
  });

  it("rejects languages that disagree on how many notes there are", () => {
    expect(validateManifest({ ...valid, en: [...valid.en, "Fourth"] })).toEqual([
      expect.stringContaining("both languages must match"),
    ]);
  });

  it("rejects an empty note", () => {
    expect(validateManifest({ ...valid, en: ["First", "  ", "Third"] })).toHaveLength(1);
  });

  it("rejects anything that is not an object", () => {
    expect(validateManifest(null)).toHaveLength(1);
    expect(validateManifest([valid])).toHaveLength(1);
  });
});

describe("findStaleness", () => {
  const previous = { ...valid, release: "2026-07-01", en: ["Old", "Older", "Oldest"] };

  it("passes when nothing user-facing has landed since the notes changed", () => {
    expect(findStaleness({ commits: [], current: valid, previous })).toEqual([]);
  });

  it("names the commits that would ship unannounced", () => {
    const commits = ["abc1234 feat(reader): page long surahs", "def5678 fix(progress): theme the wird card"];
    const problems = findStaleness({ commits, current: valid, previous });

    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("2 user-facing commit(s)");
    expect(problems[0]).toContain("feat(reader): page long surahs");
  });

  it("rejects rewritten notes that reuse the previous release stamp", () => {
    const current = { ...valid, release: previous.release };
    expect(findStaleness({ commits: [], current, previous })).toEqual([
      expect.stringContaining("Bump it so the app can tell"),
    ]);
  });

  it("allows an unchanged stamp when the notes themselves did not change", () => {
    expect(findStaleness({ commits: [], current: previous, previous })).toEqual([]);
  });

  it("tolerates a first release with no previous manifest", () => {
    expect(findStaleness({ commits: [], current: valid, previous: null })).toEqual([]);
  });
});
