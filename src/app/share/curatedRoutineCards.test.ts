import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  CURATED_ROUTINE_PACKS,
  getCuratedRoutinePack,
  resolveCuratedImageUrl,
  fetchCuratedCardFile,
  fetchAllCuratedCardFiles,
  copyCuratedCardImage,
} from "./curatedRoutineCards";

describe("curatedRoutineCards", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("returns configured pack for morning and evening, and null for others", () => {
    const morning = getCuratedRoutinePack("morning");
    expect(morning).not.toBeNull();
    expect(morning?.cards).toHaveLength(3);
    expect(morning?.title.ar).toBe("أذكار الصباح");

    const evening = getCuratedRoutinePack("evening");
    expect(evening).not.toBeNull();
    expect(evening?.cards).toHaveLength(2);
    expect(evening?.title.ar).toBe("أذكار المساء");

    expect(getCuratedRoutinePack("before_sleep")?.cards.map((card) => card.pageNumber)).toEqual([1, 2]);
    expect(getCuratedRoutinePack("before_sleep")?.title.ar).toBe("أذكار النوم");
    expect(getCuratedRoutinePack(undefined)).toBeNull();
    expect(getCuratedRoutinePack("unknown")).toBeNull();
  });

  it("resolves image URLs using provided base or default BASE_URL", () => {
    expect(resolveCuratedImageUrl("assets/cards/routine-morning-1.webp", "/app/")).toBe(
      "/app/assets/cards/routine-morning-1.webp",
    );
    expect(resolveCuratedImageUrl("/assets/cards/routine-morning-1.webp", "/app")).toBe(
      "/app/assets/cards/routine-morning-1.webp",
    );
  });

  it("fetches and creates File objects for curated cards", async () => {
    const fakeBlob = new Blob(["fake-image-bytes"], { type: "image/webp" });
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: async () => fakeBlob,
    });
    vi.stubGlobal("fetch", mockFetch);

    const pack = CURATED_ROUTINE_PACKS.morning!;
    const file = await fetchCuratedCardFile(pack.cards[0]!, pack.title.en, "en");
    expect(file).toBeInstanceOf(File);
    expect(file.name).toBe("morning-remembrance-1.webp");
    expect(file.type).toBe("image/webp");

    const allFiles = await fetchAllCuratedCardFiles(pack, "ar");
    expect(allFiles).toHaveLength(3);
    expect(allFiles[0]!.name).toBe("morning-1.webp");
  });

  it("copies curated card image using copyImageToClipboard", async () => {
    const shareDispatcher = await import("./shareDispatcher");
    vi.spyOn(shareDispatcher, "canCopyImage").mockReturnValue(true);
    const copySpy = vi.spyOn(shareDispatcher, "copyImageToClipboard").mockResolvedValue(true);

    const fakeBlob = new Blob(["png-bytes"], { type: "image/png" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => fakeBlob,
      }),
    );

    const pack = CURATED_ROUTINE_PACKS.morning!;
    const result = await copyCuratedCardImage(pack.cards[0]!);
    expect(result).toBe(true);
    expect(copySpy).toHaveBeenCalled();
  });

  it("rejects missing images and HTML fallback responses instead of exporting fake files", async () => {
    const pack = CURATED_ROUTINE_PACKS.morning!;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    await expect(fetchCuratedCardFile(pack.cards[0]!, pack.title.en, "en")).rejects.toThrow("HTTP 404");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["<html>"], { type: "text/html" }) }),
    );
    await expect(fetchAllCuratedCardFiles(pack, "en")).rejects.toThrow("Unavailable card image");
  });
});
