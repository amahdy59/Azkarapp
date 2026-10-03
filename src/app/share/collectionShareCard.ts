import type { AppLanguage, ThemeMode } from "../types";
import { t } from "../i18n";
import {
  DAYLIGHT_BOTANICAL_PALETTE,
  MIDNIGHT_BOTANICAL_PALETTE,
  drawCardCornerBotanicals,
  drawOrnateFlourish,
  fillRoundedRect,
  strokeRoundedRect,
} from "./canvasBotanicals";
import { dataUrlToBlob } from "./zikrShareCard";
import {
  SHARE_ARABIC_FONT,
  SHARE_UI_FONT,
  SHARE_DIMENSIONS,
  defaultShareAppearance,
  layoutSharePages,
  shareGeometry,
  wrapShareText,
  type ShareAppearance,
  type ShareContentOptions,
  type ShareFormat,
  type ShareItem,
  type ShareLayoutPage,
} from "./shareLayout";

export const COLLECTION_STORY_WIDTH = 1080;
export const COLLECTION_STORY_HEIGHT = 1920;
export interface StoryCardItem extends ShareItem {
  benefitArabic?: string;
  surahNameArabic?: string;
}
export interface CollectionStoryPageInput {
  collectionTitle: string;
  collectionSubtitle?: string;
  pageNumber: number;
  totalPages: number;
  themeMode?: ThemeMode;
  language?: AppLanguage;
  items: StoryCardItem[];
  ctaText?: string;
  brandName?: string;
  appearance?: ShareAppearance;
  format?: ShareFormat;
  content?: ShareContentOptions;
  single?: boolean;
  url?: string;
  qr?: boolean;
  layout?: ShareLayoutPage;
}
export interface GeneratedCollectionStoryCard {
  pageNumber: number;
  totalPages: number;
  file: File;
  blob: Blob;
  /** Object URL in browsers; released by the preview owner. */
  dataUrl: string;
  altText: string;
  layout: ShareLayoutPage;
  width: number;
  height: number;
}
export const SHARE_PALETTES = {
  olive: {
    background: "#f6f1e7",
    surface: "#ffffff",
    text: "#182e24",
    accent: "#315b42",
    secondary: "#4b5d50",
    border: "#d6dacd",
  },
  gold: {
    background: "#091426",
    surface: "#152339",
    text: "#f8f5ed",
    accent: "#efd18a",
    secondary: "#c4d0de",
    border: "#35475d",
  },
  lavender: {
    background: "#111527",
    surface: "#20263b",
    text: "#f7f5ff",
    accent: "#d5c5f4",
    secondary: "#c8cce0",
    border: "#444b67",
  },
} as const;

export function cleanBenefitText(rawText: string): string {
  return rawText.trim();
}

function createCanvas() {
  if (typeof document === "undefined") throw new Error("Share cards require a browser.");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  return { canvas, ctx };
}

/** Draw a measured page without shortening text or obscuring Arabic with decoration. */
export function renderCollectionStoryPage(input: CollectionStoryPageInput): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas();
  const format = input.format ?? "story";
  canvas.width = SHARE_DIMENSIONS[format].width;
  canvas.height = SHARE_DIMENSIONS[format].height;
  const language = input.language ?? "ar";
  const appearance = input.appearance ?? defaultShareAppearance(undefined, input.themeMode);
  const palette = SHARE_PALETTES[appearance];
  const botanicals = appearance === "olive" ? DAYLIGHT_BOTANICAL_PALETTE : MIDNIGHT_BOTANICAL_PALETTE;
  const geometry = shareGeometry(format);
  const items = input.items.map((item) => ({
    ...item,
    benefit: item.benefit ?? item.benefitArabic,
    title: item.title ?? item.surahNameArabic,
  }));
  const layout = input.layout ?? layoutSharePages(ctx, items, format, input.content, input.single)[0];
  if (!layout || (!input.layout && layout.totalPages > 1)) throw new RangeError("Text requires continuation cards.");
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawCardCornerBotanicals(ctx, canvas.width, canvas.height, botanicals);
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.direction = language === "ar" ? "rtl" : "ltr";
  let titleSize = geometry.titleSize;
  do {
    ctx.font = `700 ${titleSize}px ${SHARE_ARABIC_FONT}`;
    if (ctx.measureText(input.collectionTitle).width <= 940) break;
    titleSize -= 2;
  } while (titleSize > 32);
  ctx.fillStyle = palette.text;
  ctx.fillText(input.collectionTitle, 540, geometry.titleY);
  ctx.font = `500 32px ${SHARE_ARABIC_FONT}`;
  ctx.fillStyle = palette.secondary;
  if (input.collectionSubtitle) ctx.fillText(input.collectionSubtitle, 540, geometry.titleY + titleSize + 14);
  drawOrnateFlourish(ctx, 540, geometry.top - 30, 112, palette.accent);
  const totalHeight =
    layout.fragments.reduce((sum, fragment) => sum + fragment.height, 0) + (layout.fragments.length - 1) * 28;
  let y =
    geometry.top +
    Math.min(input.single ? Infinity : 48, Math.max(0, (geometry.bottom - geometry.top - totalHeight) / 2));
  for (const fragment of layout.fragments) {
    const x = 64;
    fillRoundedRect(ctx, x, y, geometry.width, fragment.height, 28, palette.surface);
    strokeRoundedRect(ctx, x, y, geometry.width, fragment.height, 28, palette.border, 2);
    const count = new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en").format(fragment.item.repetitionCount ?? 1);
    const repetition = t(language, "shareStudio.repetitions", { count });
    ctx.font = `600 30px ${SHARE_ARABIC_FONT}`;
    const pillWidth = ctx.measureText(repetition).width + 32;
    fillRoundedRect(
      ctx,
      language === "ar" ? x + 48 : x + geometry.width - 48 - pillWidth,
      y + 28,
      pillWidth,
      50,
      25,
      palette.accent,
    );
    ctx.fillStyle = palette.background;
    ctx.textAlign = "center";
    ctx.direction = language === "ar" ? "rtl" : "ltr";
    ctx.fillText(
      repetition,
      language === "ar" ? x + 48 + pillWidth / 2 : x + geometry.width - 48 - pillWidth / 2,
      y + 34,
    );
    if (fragment.parts > 1) {
      ctx.fillStyle = palette.secondary;
      ctx.textAlign = language === "ar" ? "right" : "left";
      ctx.fillText(
        t(language, "shareStudio.continuation", {
          current: new Intl.NumberFormat(language).format(fragment.part),
          total: new Intl.NumberFormat(language).format(fragment.parts),
        }),
        language === "ar" ? 968 : 112,
        y + 34,
      );
    } else if (fragment.item.title) {
      ctx.direction = /[\u0600-\u06ff]/u.test(fragment.item.title) ? "rtl" : "ltr";
      ctx.textAlign = language === "ar" ? "right" : "left";
      ctx.fillStyle = palette.accent;
      let headingSize = 32;
      do {
        ctx.font = `600 ${headingSize}px ${SHARE_ARABIC_FONT}`;
        if (ctx.measureText(fragment.item.title).width <= geometry.textWidth - pillWidth - 24) break;
        headingSize -= 2;
      } while (headingSize > 24);
      if (ctx.measureText(fragment.item.title).width <= geometry.textWidth - pillWidth - 24)
        ctx.fillText(fragment.item.title, language === "ar" ? 968 : 112, y + 34);
    }
    let sectionY = y + 104;
    [...fragment.sections, ...(fragment.citation ? [fragment.citation] : [])].forEach((section, sectionIndex) => {
      if (sectionIndex > 0) sectionY += 20;
      ctx.direction = section.direction;
      ctx.textAlign = section.direction === "rtl" ? "right" : "left";
      const textX = section.direction === "rtl" ? 968 : 112;
      if (section.key !== "arabic") {
        ctx.font = `600 28px ${SHARE_ARABIC_FONT}`;
        ctx.fillStyle = palette.accent;
        ctx.fillText(t(language, `shareStudio.${section.key}`), textX, sectionY);
        sectionY += 44;
      }
      ctx.font = `${section.key === "arabic" ? 500 : 400} ${section.fontSize}px ${section.direction === "rtl" ? SHARE_ARABIC_FONT : SHARE_UI_FONT}`;
      ctx.fillStyle = section.key === "source" ? palette.secondary : palette.text;
      for (const line of section.lines) {
        ctx.fillText(line.trim(), textX, sectionY);
        sectionY += section.lineHeight;
      }
    });
    y += fragment.height + 28;
  }
  ctx.direction = language === "ar" ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.font = `600 30px ${SHARE_ARABIC_FONT}`;
  ctx.fillStyle = palette.accent;
  ctx.fillText(
    t(language, "shareStoryPack.pageCount", {
      current: new Intl.NumberFormat(language).format(input.pageNumber),
      total: new Intl.NumberFormat(language).format(input.totalPages),
    }),
    540,
    geometry.footer,
  );
  ctx.font = `500 28px ${SHARE_ARABIC_FONT}`;
  ctx.fillStyle = palette.secondary;
  ctx.fillText(input.brandName ?? (language === "ar" ? "وَذَكِّرْ" : "Wa-Zaker"), 540, geometry.footer + 44);
  if (input.url) {
    ctx.direction = "ltr";
    ctx.font = `400 24px ${SHARE_UI_FONT}`;
    const lines = wrapShareText(
      input.url.replace(/^https?:\/\//u, ""),
      (value) => ctx.measureText(value).width,
      input.qr ? 700 : 940,
    );
    if (lines.length <= 2)
      lines.forEach((line, index) => ctx.fillText(line.trim(), 540, geometry.footer + 84 + index * 30));
  }
  return canvas;
}

export async function canvasToPngFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<{ file: File; blob: Blob; dataUrl: string }> {
  const blob =
    typeof canvas.toBlob === "function"
      ? await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("PNG encoding failed."))), "image/png"),
        )
      : dataUrlToBlob(canvas.toDataURL("image/png"));
  const file = new File([blob], fileName, { type: "image/png" });
  return { file, blob, dataUrl: URL.createObjectURL(blob) };
}
export function releaseSharePages(pages: GeneratedCollectionStoryCard[]): void {
  pages.forEach((page) => {
    if (page.dataUrl.startsWith("blob:")) URL.revokeObjectURL(page.dataUrl);
  });
}

export async function generateCollectionStoryPage(
  input: CollectionStoryPageInput,
): Promise<GeneratedCollectionStoryCard> {
  const canvas = renderCollectionStoryPage(input);
  if (input.qr && input.url) {
    const { default: qrcode } = await import("qrcode-generator");
    const code = qrcode(0, "M");
    code.addData(input.url);
    code.make();
    const ctx = canvas.getContext("2d")!;
    const modules = code.getModuleCount();
    const unit = 3;
    const size = (modules + 8) * unit;
    const x = 64;
    const y = Math.min(
      shareGeometry(input.format ?? "story").footer - 4,
      canvas.height - (input.format === "story" ? 200 : 40) - size,
    );
    if (y + size <= canvas.height - 40) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = "#10241a";
      for (let row = 0; row < modules; row++)
        for (let col = 0; col < modules; col++)
          if (code.isDark(row, col)) ctx.fillRect(x + (col + 4) * unit, y + (row + 4) * unit, unit, unit);
    }
  }
  const safeName = `azkar-${input.format ?? "story"}-${String(input.pageNumber).padStart(3, "0")}-of-${input.totalPages}-${input.items[0]?.id.replace(/[^a-zA-Z0-9_-]/gu, "-") ?? "collection"}.png`;
  const encoded = await canvasToPngFile(canvas, safeName);
  const { ctx } = createCanvas();
  const layout =
    input.layout ?? layoutSharePages(ctx, input.items, input.format ?? "story", input.content, input.single)[0];
  if (!layout) {
    URL.revokeObjectURL(encoded.dataUrl);
    throw new Error("Empty share layout.");
  }
  const language = input.language ?? "ar";
  return {
    ...encoded,
    layout,
    pageNumber: input.pageNumber,
    totalPages: input.totalPages,
    width: canvas.width,
    height: canvas.height,
    altText: `${input.collectionTitle}. ${t(language, "shareStoryPack.pageCount", { current: input.pageNumber, total: input.totalPages })}`,
  };
}

export async function generateAllCollectionStoryPages(
  options: Omit<CollectionStoryPageInput, "items" | "pageNumber" | "totalPages"> & {
    allItems: StoryCardItem[];
    targetPages?: number;
    signal?: AbortSignal;
    onPage?: (page: GeneratedCollectionStoryCard) => void;
  },
): Promise<GeneratedCollectionStoryCard[]> {
  const pages: GeneratedCollectionStoryCard[] = [];
  try {
    if (typeof document !== "undefined" && document.fonts)
      await Promise.all([
        document.fonts.load(`500 52px ${SHARE_ARABIC_FONT}`, "اللَّهُمَّ"),
        document.fonts.load(`600 60px ${SHARE_ARABIC_FONT}`, "أذكار"),
        document.fonts.load(`700 60px ${SHARE_ARABIC_FONT}`, "أذكار"),
        document.fonts.load(`400 36px ${SHARE_UI_FONT}`, "Meaning and source"),
        document.fonts.ready,
      ]);
    const { ctx } = createCanvas();
    const items = options.allItems.map((item) => ({
      ...item,
      benefit: item.benefit ?? item.benefitArabic,
      title: item.title ?? item.surahNameArabic,
    }));
    const layouts = layoutSharePages(ctx, items, options.format ?? "story", options.content, options.single);
    for (const layout of layouts) {
      if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const page = await generateCollectionStoryPage({
        ...options,
        items: layout.fragments.map((fragment) => fragment.item),
        layout,
        pageNumber: layout.pageNumber,
        totalPages: layout.totalPages,
      });
      pages.push(page);
      if (options.signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      options.onPage?.(page);
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    return pages;
  } catch (error) {
    releaseSharePages(pages);
    throw error;
  }
}
