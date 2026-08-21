import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadReleaseNotes, markReleaseSeen, notesFor, parseReleaseNotes, readSeenRelease } from "./releaseNotes";

const { reportError } = vi.hoisted(() => ({ reportError: vi.fn() }));
vi.mock("../lib/observability", () => ({ reportError }));

const validNotes = {
  release: "2026-08-19",
  ar: ["الأول", "الثاني", "الثالث"],
  en: ["First", "Second", "Third"],
};

beforeEach(() => {
  window.localStorage.clear();
  reportError.mockReset();
});

describe("release notes", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("keeps the deployed manifest bilingual, stamped, and within the 3–4 item limit", () => {
    const deployedNotes = JSON.parse(readFileSync("public/release-notes.json", "utf8"));
    const parsed = parseReleaseNotes(deployedNotes);

    expect(parsed).toEqual(deployedNotes);
    expect(parsed?.ar).toHaveLength(parsed?.en.length ?? 0);
    expect(parsed?.release).toBeTruthy();
    for (const arNote of parsed?.ar ?? []) {
      expect(arNote).toMatch(/[\u0600-\u06FF]/);
      expect(arNote).not.toMatch(/\?{3,}/);
    }
  });

  it("accepts and trims three to four bilingual notes", () => {
    const four = {
      ...validNotes,
      ar: [...validNotes.ar, "الرابع"],
      en: [" First ", "Second", "Third", "Fourth"],
    };

    expect(parseReleaseNotes(four)).toEqual({ ...four, en: ["First", "Second", "Third", "Fourth"] });
  });

  it("rejects a fifth note so the prompt stays a summary", () => {
    expect(parseReleaseNotes({ ...validNotes, en: ["1", "2", "3", "4", "5"] })).toBeNull();
  });

  it("rejects languages that disagree on how many notes there are", () => {
    expect(parseReleaseNotes({ ...validNotes, en: [...validNotes.en, "Fourth"] })).toBeNull();
  });

  it("keeps the notes when the release stamp is missing", () => {
    const { release: _release, ...unstamped } = validNotes;
    expect(parseReleaseNotes(unstamped)).toEqual({ ...unstamped, release: "" });
  });

  it("returns the notes for the selected language", () => {
    expect(notesFor(validNotes, "ar")).toEqual(validNotes.ar);
    expect(notesFor(validNotes, "en")).toEqual(validNotes.en);
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
    expect(reportError).not.toHaveBeenCalled();
  });

  it("reports a served manifest that is malformed, which readers would never notice", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ en: [] }) }));

    await expect(loadReleaseNotes()).resolves.toBeNull();
    expect(reportError).toHaveBeenCalledWith(expect.any(Error), "release-notes");
  });

  it("remembers the release whose notes were shown", () => {
    expect(readSeenRelease()).toBeNull();
    markReleaseSeen("2026-08-19");
    expect(readSeenRelease()).toBe("2026-08-19");
  });
});
