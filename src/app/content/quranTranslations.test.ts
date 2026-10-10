import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetQuranTranslationsCacheForTesting,
  getAyahEnglishTranslation,
  loadAyahEnglishTranslation,
  loadPageEnglishTranslation,
  loadSurahEnglishTranslation,
} from "./quranTranslations";

describe("quranTranslations", () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    __resetQuranTranslationsCacheForTesting();
    vi.restoreAllMocks();
  });

  it("loads a surah translation and caches it", async () => {
    const mockData = { "1": "In the name of Allah...", "2": "All praise is due to Allah..." };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await loadSurahEnglishTranslation(1);
    expect(result).toEqual(mockData);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call should hit in-memory cache
    const cached = await loadSurahEnglishTranslation(1);
    expect(cached).toEqual(mockData);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    expect(getAyahEnglishTranslation("1:1")).toBe("In the name of Allah...");
    expect(getAyahEnglishTranslation("1:2")).toBe("All praise is due to Allah...");
    expect(getAyahEnglishTranslation("1:99")).toBeNull();
  });

  it("loads an ayah translation directly", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ "255": "Allah - there is no deity except Him..." }),
    } as Response);

    const text = await loadAyahEnglishTranslation("2:255");
    expect(text).toBe("Allah - there is no deity except Him...");
  });

  it("loads translations for all verses on a page", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("1.json")) {
        return {
          ok: true,
          json: async () => ({ "1": "Verse 1 text", "2": "Verse 2 text" }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    const pageVerses = [{ k: "1:1" }, { k: "1:2" }, { k: "1:1" }];
    const translations = await loadPageEnglishTranslation(pageVerses);
    expect(translations).toEqual([
      { verseKey: "1:1", ayahNumber: 1, text: "Verse 1 text" },
      { verseKey: "1:2", ayahNumber: 2, text: "Verse 2 text" },
    ]);
  });

  it("fails gracefully and returns empty on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("Network fail"));
    const result = await loadSurahEnglishTranslation(114);
    expect(result).toEqual({});
    expect(getAyahEnglishTranslation("114:1")).toBeNull();
  });

  it("rejects invalid identifiers without fetching and rejects malformed text", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response('{"1":{"text":"invalid"}}'));
    expect(await loadSurahEnglishTranslation("../1")).toEqual({});
    expect(await loadAyahEnglishTranslation("1:1:2")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(await loadSurahEnglishTranslation(1)).toEqual({});
    expect(getAyahEnglishTranslation("1:1")).toBeNull();
  });

  it("reads a previously cached surah while offline", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Offline"));
    const match = vi.fn().mockResolvedValue(new Response('{"1":"Reviewed verse"}'));
    const put = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue({ match, put }) });
    expect(await loadAyahEnglishTranslation("1:1")).toBe("Reviewed verse");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("caches a successful read without letting a storage denial interrupt it", async () => {
    const put = vi.fn().mockRejectedValue(new Error("Quota"));
    vi.stubGlobal("caches", { open: vi.fn().mockResolvedValue({ match: vi.fn().mockResolvedValue(undefined), put }) });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response('{"1":"Reviewed verse"}'));
    expect(await loadAyahEnglishTranslation("1:1")).toBe("Reviewed verse");
    expect(put).toHaveBeenCalledOnce();
  });
});
