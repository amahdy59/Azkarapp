import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateZikrShareCard,
  getZikrShareCardFileName,
  getZikrShareCardSections,
  getZikrShareFallbackText,
  wrapCanvasText,
  ZIKR_SHARE_CARD_HEIGHT,
  ZIKR_SHARE_CARD_WIDTH,
  type ZikrShareCardInput,
} from "./zikrShareCard";

const ENGLISH_CARD: ZikrShareCardInput = {
  id: "morning-01",
  language: "en",
  arabicText: "سُبْحَانَ اللَّهِ",
  translation: "Glory be to Allah.",
  transliteration: "Subhan Allah.",
  benefit: "A reviewed benefit.",
  sourceReference: "Sahih Muslim 1/2.",
  categoryLabel: "Morning Azkar",
  repetitionCount: 3,
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("zikr share-card content", () => {
  it("uses the exact requested WhatsApp card dimensions", () => {
    expect(ZIKR_SHARE_CARD_WIDTH).toBe(1080);
    expect(ZIKR_SHARE_CARD_HEIGHT).toBe(2920);
  });

  it("keeps English meaning and pronunciation off Arabic cards", () => {
    const sections = getZikrShareCardSections({
      ...ENGLISH_CARD,
      language: "ar",
      benefit: "An English benefit that must not leak.",
      sourceReference: "Sahih Muslim 1/2.",
    });

    expect(sections.map((section) => section.key)).toEqual(["arabic"]);
    expect(getZikrShareFallbackText({ ...ENGLISH_CARD, language: "ar" })).not.toContain("Glory be");
  });

  it("accepts localized Arabic benefit and source text", () => {
    const sections = getZikrShareCardSections({
      ...ENGLISH_CARD,
      language: "ar",
      benefit: "فائدة موثقة لهذا الذكر.",
      sourceReference: "رواه مسلم، رقم ١٢.",
    });

    expect(sections.map((section) => section.key)).toEqual(["arabic", "benefit", "source"]);
    expect(sections.slice(1).every((section) => section.direction === "rtl")).toBe(true);
  });

  it("includes the requested supporting content on English cards", () => {
    expect(getZikrShareCardSections(ENGLISH_CARD).map((section) => section.key)).toEqual([
      "arabic",
      "translation",
      "transliteration",
      "benefit",
      "source",
    ]);
  });

  it("resolves built-in vocabulary for Sayyid al-Istighfar and accepts explicit word meanings", () => {
    const sayyidSections = getZikrShareCardSections({
      id: "sayyid",
      language: "ar",
      arabicText: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
      benefit: "سيد الاستغفار أعظم ما يستغفر به العبد.",
    });

    const keys = sayyidSections.map((s) => s.key);
    expect(keys).toContain("wordMeanings");
    const meaningSection = sayyidSections.find((s) => s.key === "wordMeanings");
    expect(meaningSection?.text).toContain("أَبُوءُ");
    expect(meaningSection?.label).toBe("معاني المفردات");

    const customSections = getZikrShareCardSections({
      id: "custom",
      language: "ar",
      arabicText: "سُبْحَانَ اللَّهِ",
      wordMeanings: [{ word: "سُبْحَانَ", meaning: "تنزيه الله وتقديسه عن كل نقص" }],
    });
    expect(customSections.map((s) => s.key)).toContain("wordMeanings");
    expect(customSections.find((s) => s.key === "wordMeanings")?.text).toContain("سُبْحَانَ");
  });

  it("creates safe, stable PNG names", () => {
    expect(getZikrShareCardFileName(ENGLISH_CARD)).toBe("azkar-morning-01.png");
    expect(getZikrShareCardFileName({ ...ENGLISH_CARD, fileName: "My shared zikr.png" })).toBe("My-shared-zikr.png");
  });
});

describe("share-card wrapping", () => {
  const measure = (text: string) => text.length * 10;

  it("wraps ordinary words without exceeding the safe width", () => {
    const result = wrapCanvasText("one two three four", measure, 90);
    expect(result.truncated).toBe(false);
    expect(result.lines).toEqual(["one two", "three", "four"]);
    expect(result.lines.every((line) => measure(line) <= 90)).toBe(true);
  });

  it("breaks oversized tokens and marks constrained content with an ellipsis", () => {
    const result = wrapCanvasText("abcdefghij klmnopqrst uvwxyz", measure, 50, 2);
    expect(result.truncated).toBe(true);
    expect(result.lines).toHaveLength(2);
    expect(result.lines[1]).toMatch(/…$/u);
    expect(result.lines.every((line) => measure(line) <= 50)).toBe(true);
  });
});

describe("share-card PNG generation", () => {
  it("creates a PNG File from a 1080 by 2920 canvas", () => {
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
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    const generated = generateZikrShareCard(ENGLISH_CARD);

    expect(canvas.width).toBe(1080);
    expect(canvas.height).toBe(2920);
    expect(generated.width).toBe(1080);
    expect(generated.height).toBe(2920);
    expect(generated.file).toBeInstanceOf(File);
    expect(generated.file.name).toBe("azkar-morning-01.png");
    expect(generated.file.type).toBe("image/png");
  });

  it("supports 9:16 story (1080x1920) and 1:1 square (1080x1080) formats", () => {
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
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) =>
      tagName === "canvas" ? canvas : originalCreateElement(tagName)) as typeof document.createElement);

    const storyCard = generateZikrShareCard({ ...ENGLISH_CARD, format: "story" });
    expect(storyCard.width).toBe(1080);
    expect(storyCard.height).toBe(1920);

    const squareCard = generateZikrShareCard({ ...ENGLISH_CARD, format: "square" });
    expect(squareCard.width).toBe(1080);
    expect(squareCard.height).toBe(1080);
  });
});
