import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COLLECTION_STORY_HEIGHT,
  COLLECTION_STORY_WIDTH,
  generateAllCollectionStoryPages,
  generateCollectionStoryPage,
  renderCollectionStoryPage,
  type CollectionStoryPageInput,
} from "./collectionShareCard";

const SAMPLE_PAGE: CollectionStoryPageInput = {
  collectionTitle: "أذكار الصباح",
  collectionSubtitle: "ابدأ يومك بذكر الله",
  pageNumber: 1,
  totalPages: 5,
  themeMode: "light",
  language: "ar",
  items: [
    {
      id: "item-1",
      arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
      benefitArabic: "سؤال خير اليوم",
      repetitionCount: 1,
    },
    {
      id: "item-2",
      arabicText: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا",
      benefitArabic: "تفويض الأمر لله",
      repetitionCount: 1,
    },
  ],
};

function createMockCanvas() {
  const gradient = { addColorStop: vi.fn() };
  const context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    bezierCurveTo: vi.fn(),
    closePath: vi.fn(),
    createLinearGradient: vi.fn(() => gradient),
    createRadialGradient: vi.fn(() => gradient),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    measureText: vi.fn((text: string) => ({ width: Array.from(text).length * 14 })),
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    restore: vi.fn(),
    rotate: vi.fn(),
    roundRect: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => context),
    toDataURL: vi.fn(() => "data:image/png;base64,aGVsbG8="),
  } as unknown as HTMLCanvasElement;

  return { canvas, context };
}

afterEach(() => {
  vi.restoreAllMocks();
});
beforeEach(() => {
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:preview");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

describe("collectionShareCard", () => {
  for (const qr of [false, true]) {
    it(`puts the single zikr title inside its panel and keeps the website centered (QR ${qr})`, () => {
      const { canvas, context } = createMockCanvas();
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
        tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);
      renderCollectionStoryPage({
        ...SAMPLE_PAGE,
        collectionTitle: "عنوان الذكر",
        single: true,
        qr,
        items: [{ id: "short", title: "عنوان الذكر", arabicText: "سبحان الله" }],
      });
      const panel = vi.mocked(context.roundRect).mock.calls.find((call) => call[2] === 952)!;
      const heading = vi.mocked(context.fillText).mock.calls.filter((call) => call[0] === "عنوان الذكر");
      expect(heading).toHaveLength(1);
      expect(heading[0]![1]).toBe(540);
      expect(heading[0]![2]).toBeGreaterThan(panel[1] + 28);
      expect(heading[0]![2]).toBeLessThan(panel[1] + 110);
      expect(vi.mocked(context.fillText).mock.calls.find((call) => call[0] === "wa-zaker.com")![1]).toBe(540);
    });
  }
  it("always embeds the exact Mushaf QR in a long-surah reminder", async () => {
    const { canvas, context } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);
    const { default: qrcode } = await import("qrcode-generator");
    const expected = qrcode(0, "M");
    expected.addData("https://example.com/#/quran/562");
    expected.make();
    await generateCollectionStoryPage({
      ...SAMPLE_PAGE,
      qr: false,
      items: [
        {
          id: "surah",
          arabicText: "",
          title: "Al-Mulk",
          reminder: true,
          readingUrl: "https://example.com/#/quran/562",
          language: "en",
          benefit: "Reviewed benefit",
          sourceReference: "Reviewed source",
        },
      ],
    });
    const fills = vi.mocked(context.fillRect).mock.calls;
    const moduleFills = fills.filter((call) => call[2] === 3 && call[3] === 3);
    expect(moduleFills).toHaveLength(
      Array.from({ length: expected.getModuleCount() }, (_, row) =>
        Array.from({ length: expected.getModuleCount() }, (_, col) => Number(expected.isDark(row, col))).reduce(
          (sum, bit) => sum + bit,
          0,
        ),
      ).reduce((sum, count) => sum + count, 0),
    );
    expect(moduleFills.every((call) => call[1] >= 1510)).toBe(true);
  });
  it("releases progressive preview URLs when generation is cancelled", async () => {
    const { canvas } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);
    const controller = new AbortController();
    await expect(
      generateAllCollectionStoryPages({
        collectionTitle: "أذكار الصباح",
        allItems: Array.from({ length: 25 }, (_, i) => ({ id: `item-${i}`, arabicText: "اللَّهُمَّ اغفر لنا" })),
        signal: controller.signal,
        onPage: () => controller.abort(),
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("rejects oversized devotional text instead of silently cutting it off", () => {
    const { canvas } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);
    expect(() =>
      renderCollectionStoryPage({ ...SAMPLE_PAGE, items: [{ id: "long", arabicText: "اللهم اغفر لنا ".repeat(300) }] }),
    ).toThrow(RangeError);
  });
  it("uses standard 9:16 mobile story dimensions (1080x1920)", () => {
    expect(COLLECTION_STORY_WIDTH).toBe(1080);
    expect(COLLECTION_STORY_HEIGHT).toBe(1920);
  });

  it("renders a 1080 by 1920 canvas for a collection story page", () => {
    const { canvas, context } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    const rendered = renderCollectionStoryPage(SAMPLE_PAGE);

    expect(rendered.width).toBe(1080);
    expect(rendered.height).toBe(1920);
    expect(context.fillText).toHaveBeenCalled();
  });

  it("generates a complete story card PNG file asynchronously", async () => {
    const { canvas } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    // Mock global fetch for dataUrl conversion
    const mockBlob = new Blob(["mock"], { type: "image/png" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    } as unknown as Response);

    const result = await generateCollectionStoryPage(SAMPLE_PAGE);

    expect(result.pageNumber).toBe(1);
    expect(result.totalPages).toBe(5);
    expect(result.file).toBeInstanceOf(File);
    expect(result.file.type).toBe("image/png");
    expect(result.file.name).toContain("001-of-5");
  });

  it("measures complete text rather than forcing it into a requested five pages", async () => {
    const { canvas } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    const mockBlob = new Blob(["mock"], { type: "image/png" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    } as unknown as Response);

    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i}`,
      arabicText: `الذكر رقم ${i + 1}`,
      benefitArabic: "فائدة مباركة",
      repetitionCount: 1,
    }));

    const pages = await generateAllCollectionStoryPages({
      collectionTitle: "أذكار الصباح",
      allItems: items,
      targetPages: 5,
    });

    expect(pages).toHaveLength(7);
    expect(pages.map((p) => p.pageNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pages.every((p) => p.totalPages === 7)).toBe(true);
    expect(pages.flatMap((page) => page.layout.fragments.map((fragment) => fragment.item.id))).toEqual(
      items.map((item) => item.id),
    );
  });

  it("uses no more than four short readable cards per slide", async () => {
    const { canvas } = createMockCanvas();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    const mockBlob = new Blob(["mock"], { type: "image/png" });
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    } as unknown as Response);

    const items = Array.from({ length: 25 }, (_, i) => ({
      id: `item-${i}`,
      arabicText: `الذكر رقم ${i + 1}`,
      benefitArabic: "من هدي النبي صلى الله عليه وسلم في صباحه: إقرار بأن الملك لله",
      repetitionCount: 1,
    }));

    const pages = await generateAllCollectionStoryPages({
      collectionTitle: "أذكار الصباح",
      allItems: items,
    });

    expect(pages).toHaveLength(7);
    expect(pages.map((p) => p.pageNumber)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(pages.every((p) => p.totalPages === 7)).toBe(true);
    expect(pages.every((page) => page.layout.fragments.length <= 4)).toBe(true);
  });
});
