import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadReleaseNotes, parseReleaseNotes } from "./releaseNotes";

const validNotes = {
  ar: ["الأول", "الثاني", "الثالث"],
  en: ["First", "Second", "Third"],
};

describe("release notes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the deployed manifest bilingual and within the 3–5 item limit", () => {
    const deployedNotes = JSON.parse(readFileSync("public/release-notes.json", "utf8"));
    const parsed = parseReleaseNotes(deployedNotes);

    expect(parsed).toEqual(deployedNotes);
    expect(parsed?.ar).toHaveLength(parsed?.en.length ?? 0);
  });

  it("accepts and trims three to five bilingual notes", () => {
    expect(parseReleaseNotes({ ...validNotes, en: [" First ", "Second", "Third", "Fourth", "Fifth"] })).toEqual({
      ...validNotes,
      en: ["First", "Second", "Third", "Fourth", "Fifth"],
    });
  });

  it.each([
    { ar: ["الأول", "الثاني"], en: validNotes.en },
    { ar: validNotes.ar, en: ["1", "2", "3", "4", "5", "6"] },
    { ar: validNotes.ar, en: ["First", "", "Third"] },
    { ar: validNotes.ar },
  ])("rejects incomplete or invalid bilingual notes", (notes) => {
    expect(parseReleaseNotes(notes)).toBeNull();
  });

  it("fetches the latest deployed manifest without using a cached response", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(validNotes) });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadReleaseNotes()).resolves.toEqual(validNotes);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/release-notes\.json\?update=\d+$/), {
      cache: "no-store",
    });
  });

  it("falls back safely when the manifest cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(loadReleaseNotes()).resolves.toBeNull();
  });
});
