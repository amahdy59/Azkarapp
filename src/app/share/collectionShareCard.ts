/**
 * collectionShareCard.ts — Generates 1080x1920 (9:16) multi-page story cards
 * for WhatsApp Status, Instagram Stories, and messaging platforms.
 */

import type { AppLanguage, ThemeMode } from "../types";
import {
  DAYLIGHT_BOTANICAL_PALETTE,
  MIDNIGHT_BOTANICAL_PALETTE,
  drawCardCornerBotanicals,
  drawOrnateFlourish,
  drawPaginationDots,
  fillRoundedRect,
  strokeRoundedRect,
  type BotanicalThemePalette,
} from "./canvasBotanicals";
import { paginateCollection, type PaginatableItem } from "./collectionPaginator";
import { dataUrlToBlob, wrapCanvasText } from "./zikrShareCard";

export const COLLECTION_STORY_WIDTH = 1080;
export const COLLECTION_STORY_HEIGHT = 1920;

const ARABIC_ZIKR_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif';
const ARABIC_UI_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif';
const LATIN_UI_FONT = '"Noto Sans Arabic Variable", system-ui, sans-serif';

export interface StoryCardItem extends PaginatableItem {
  id: string;
  arabicText: string;
  benefitArabic?: string;
  repetitionCount?: number;
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
}

export interface GeneratedCollectionStoryCard {
  pageNumber: number;
  totalPages: number;
  file: File;
  blob: Blob;
  dataUrl: string;
  altText: string;
}

interface StoryPalette {
  backgroundStart: string;
  backgroundEnd: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  accentBar: string;
  textPrimary: string;
  titlePrimary: string;
  subtitle: string;
  badgeBg: string;
  badgeText: string;
  countBg: string;
  countText: string;
  footerCta: string;
  botanicals: BotanicalThemePalette;
}

const STORY_PALETTES: Record<"light" | "midnight" | "dark", StoryPalette> = {
  light: {
    backgroundStart: "#FAF7F2",
    backgroundEnd: "#F3EDE2",
    cardBg: "rgba(255, 255, 255, 0.96)",
    cardBorder: "rgba(212, 202, 188, 0.85)",
    cardShadow: "rgba(35, 45, 35, 0.08)",
    accentBar: "#2D5A43",
    textPrimary: "#1B2A1E",
    titlePrimary: "#1A281D",
    subtitle: "#556453",
    badgeBg: "rgba(45, 90, 67, 0.10)",
    badgeText: "#255038",
    countBg: "#2D5A43",
    countText: "#FFFFFF",
    footerCta: "#647060",
    botanicals: DAYLIGHT_BOTANICAL_PALETTE,
  },
  midnight: {
    backgroundStart: "#0A1224",
    backgroundEnd: "#050814",
    cardBg: "rgba(17, 27, 53, 0.94)",
    cardBorder: "rgba(55, 80, 125, 0.70)",
    cardShadow: "rgba(0, 0, 0, 0.40)",
    accentBar: "#E8B420",
    textPrimary: "#F5F0E8",
    titlePrimary: "#F5F0E8",
    subtitle: "#9EADC8",
    badgeBg: "rgba(232, 180, 32, 0.16)",
    badgeText: "#E8B420",
    countBg: "#E8B420",
    countText: "#0A1228",
    botanicals: MIDNIGHT_BOTANICAL_PALETTE,
    footerCta: "#8F9DB8",
  },
  dark: {
    backgroundStart: "#0D0D0D",
    backgroundEnd: "#050505",
    cardBg: "rgba(24, 24, 24, 0.95)",
    cardBorder: "rgba(70, 70, 70, 0.70)",
    cardShadow: "rgba(0, 0, 0, 0.45)",
    accentBar: "#E8B420",
    textPrimary: "#F5F0E8",
    titlePrimary: "#F5F0E8",
    subtitle: "#A3A3A3",
    badgeBg: "rgba(232, 180, 32, 0.16)",
    badgeText: "#E8B420",
    countBg: "#E8B420",
    countText: "#0D0D0D",
    botanicals: MIDNIGHT_BOTANICAL_PALETTE,
    footerCta: "#999999",
  },
};

/**
 * Extracts and cleans the essential benefit / title for concise badge display.
 */
export function cleanBenefitText(rawText: string, maxChars = 44): string {
  let cleaned = rawText.trim();
  if (cleaned.includes(": ")) {
    const parts = cleaned.split(": ");
    if (parts[1] && parts[1].length <= maxChars) {
      cleaned = parts[1].trim();
    } else if (parts[0] && parts[0].length <= maxChars) {
      cleaned = parts[0].trim();
    }
  }
  if (cleaned.length > maxChars) {
    cleaned = cleaned.slice(0, maxChars - 1).trim() + "…";
  }
  return cleaned;
}

/**
 * Computes an optimal font size according to zikr length and card density.
 */
function getItemFontSize(charCount: number, itemCount: number): number {
  if (itemCount <= 2) {
    if (charCount <= 90) return 38;
    if (charCount <= 220) return 34;
    return 30;
  }
  if (itemCount === 3) {
    if (charCount <= 90) return 35;
    if (charCount <= 220) return 31;
    return 28;
  }
  // 4 items
  if (charCount <= 90) return 31;
  if (charCount <= 220) return 27;
  return 24;
}

/**
 * Renders a single 1080x1920 collection story page on an HTML5 canvas.
 */
export function renderCollectionStoryPage(input: CollectionStoryPageInput): HTMLCanvasElement {
  if (typeof document === "undefined") {
    throw new Error("Story card rendering requires a browser Canvas environment.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = COLLECTION_STORY_WIDTH;
  canvas.height = COLLECTION_STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not acquire 2D canvas context.");
  }

  const mode = input.themeMode === "light" ? "light" : input.themeMode === "dark" ? "dark" : "midnight";
  const palette = STORY_PALETTES[mode];
  const isArabic = input.language !== "en";
  const uiFont = isArabic ? ARABIC_UI_FONT : LATIN_UI_FONT;

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, COLLECTION_STORY_HEIGHT);
  bgGrad.addColorStop(0, palette.backgroundStart);
  bgGrad.addColorStop(1, palette.backgroundEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, COLLECTION_STORY_WIDTH, COLLECTION_STORY_HEIGHT);

  // 2. Corner Botanicals
  drawCardCornerBotanicals(ctx, COLLECTION_STORY_WIDTH, COLLECTION_STORY_HEIGHT, palette.botanicals);

  // 3. Header Section (Ample top safe area padding to clear story progress bars and account icons)
  ctx.direction = isArabic ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Main Collection Title
  ctx.font = `700 50px ${uiFont}`;
  ctx.fillStyle = palette.titlePrimary;
  ctx.fillText(input.collectionTitle, COLLECTION_STORY_WIDTH / 2, 172);

  // Subtitle
  const subtitle = input.collectionSubtitle ?? (isArabic ? "ابدأ يومك بذكر الله" : "Begin your day remembering Allah");
  ctx.font = `500 24px ${uiFont}`;
  ctx.fillStyle = palette.subtitle;
  ctx.fillText(subtitle, COLLECTION_STORY_WIDTH / 2, 238);

  // Ornate Divider Flourish
  drawOrnateFlourish(ctx, COLLECTION_STORY_WIDTH / 2, 290, 130, palette.botanicals.flourishColor);

  // 4. Card Layout Area (Safe area: y = 345 to y = 1715)
  const items = input.items;
  const itemCount = Math.max(1, items.length);
  const areaTop = 345;
  const areaBottom = 1715;
  const availableHeight = areaBottom - areaTop; // 1370 px
  const cardMarginX = 64;
  const cardWidth = COLLECTION_STORY_WIDTH - cardMarginX * 2; // 952 px

  const cardPaddingX = itemCount <= 3 ? 40 : 36;
  const cardPaddingY = itemCount <= 3 ? 28 : 22;
  const innerTextWidth = cardWidth - cardPaddingX * 2;

  const headerRowHeight = 36;
  const gapBetweenHeaderAndBody = 16;
  const lineRatio = itemCount <= 3 ? 1.68 : 1.64;

  // Measure each item with dynamic font sizing
  const itemLineInfos = items.map((item) => {
    const charCount = item.arabicText?.length ?? 0;
    const fontSize = getItemFontSize(charCount, itemCount);
    const lineHeight = Math.round(fontSize * lineRatio);
    ctx.font = `500 ${fontSize}px ${ARABIC_ZIKR_FONT}`;

    const wrapped = wrapCanvasText(item.arabicText, (text) => ctx.measureText(text).width, innerTextWidth);
    const maxAllowedLines = itemCount <= 3 ? 10 : 8;
    const visibleLines = wrapped.lines;
    if (visibleLines.length > maxAllowedLines) throw new RangeError("Story text needs an additional page.");
    const bodyHeight = visibleLines.length * lineHeight;
    const neededHeight = cardPaddingY + headerRowHeight + gapBetweenHeaderAndBody + bodyHeight + cardPaddingY;

    return {
      fontSize,
      lineHeight,
      lines: visibleLines,
      neededHeight,
    };
  });

  const totalNeededHeight = itemLineInfos.reduce((acc, cur) => acc + cur.neededHeight, 0);
  const baseGap = itemCount <= 2 ? 44 : itemCount === 3 ? 36 : 24;
  const totalBaseGaps = (itemCount - 1) * baseGap;
  const extraVerticalSpace = availableHeight - (totalNeededHeight + totalBaseGaps);

  // Allocate extra vertical space: expand inter-card gaps and card padding so canvas is fully utilized
  let computedGap = baseGap;
  const expandedCardHeights: number[] = [];

  if (extraVerticalSpace > 0) {
    const maxGap = itemCount <= 3 ? 48 : 34;
    const gapExpansion = Math.min(
      maxGap - baseGap,
      Math.floor((extraVerticalSpace * 0.22) / Math.max(1, itemCount - 1)),
    );
    computedGap = baseGap + gapExpansion;
    const spaceForCards = extraVerticalSpace - gapExpansion * (itemCount - 1);

    itemLineInfos.forEach((info) => {
      const addedHeight = Math.floor(spaceForCards * (info.neededHeight / Math.max(1, totalNeededHeight)));
      expandedCardHeights.push(info.neededHeight + addedHeight);
    });
  } else {
    throw new RangeError("Story text needs an additional page.");
  }

  // Calculate top coordinate to vertically balance content in available area
  const totalRenderedHeight = expandedCardHeights.reduce((acc, h) => acc + h, 0) + (itemCount - 1) * computedGap;
  let currentY = areaTop + Math.max(0, Math.floor((availableHeight - totalRenderedHeight) / 2));

  items.forEach((item, idx) => {
    const info = itemLineInfos[idx];
    const cardHeight = expandedCardHeights[idx] ?? 120;
    if (!info) return;

    // Card Surface with layered shadow
    ctx.save();
    ctx.shadowColor = palette.cardShadow;
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    fillRoundedRect(ctx, cardMarginX, currentY, cardWidth, cardHeight, 26, palette.cardBg);
    ctx.restore();

    strokeRoundedRect(ctx, cardMarginX, currentY, cardWidth, cardHeight, 26, palette.cardBorder, 1.5);

    // Decorative top accent indicator along top curve of card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardMarginX + 2, currentY + 1.5, cardWidth - 4, 3.5, [24, 24, 0, 0]);
    ctx.fillStyle = palette.accentBar;
    ctx.fill();
    ctx.restore();

    // Repetition Badge (Logical End: Left in Arabic RTL)
    const repetition = item.repetitionCount ?? 1;
    const formattedCount = isArabic ? new Intl.NumberFormat("ar-EG").format(repetition) : String(repetition);
    const pillText = `${formattedCount}×`;

    ctx.font = `700 17px ${uiFont}`;
    const pillTextWidth = ctx.measureText(pillText).width;
    const pillWidth = Math.max(54, pillTextWidth + 24);
    const pillHeight = 30;
    const pillX = isArabic ? cardMarginX + cardPaddingX : cardMarginX + cardWidth - cardPaddingX - pillWidth;
    const pillY = currentY + cardPaddingY + 4;

    fillRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, 15, palette.countBg);
    ctx.fillStyle = palette.countText;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pillText, pillX + pillWidth / 2, pillY + pillHeight / 2 + 1);

    // Benefit / Surah Badge (Logical Start: Right in Arabic RTL)
    const benefit = item.benefitArabic?.trim();
    const rawBadge = benefit && benefit.length <= 42 ? benefit : item.surahNameArabic?.trim();
    if (rawBadge) {
      const badgeText = rawBadge;
      ctx.font = `600 17px ${uiFont}`;
      const badgeTextWidth = ctx.measureText(badgeText).width;
      const bPaddingX = 14;
      const maxAllowedBadgeWidth = cardWidth * 0.58;
      const bWidth = Math.min(maxAllowedBadgeWidth, badgeTextWidth + bPaddingX * 2);
      const bHeight = 30;
      const bX = isArabic ? cardMarginX + cardWidth - bWidth - cardPaddingX : cardMarginX + cardPaddingX;
      const bY = currentY + cardPaddingY + 4;

      fillRoundedRect(ctx, bX, bY, bWidth, bHeight, 15, palette.badgeBg);
      ctx.fillStyle = palette.badgeText;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(badgeText, bX + bWidth / 2, bY + bHeight / 2 + 1, bWidth - bPaddingX);
    }

    // Zikr Arabic Body Text (Vertically centered within remaining card height)
    const availableForText = cardHeight - (cardPaddingY + headerRowHeight + gapBetweenHeaderAndBody + cardPaddingY);
    const textOffsetY = Math.max(0, Math.floor((availableForText - info.lines.length * info.lineHeight) / 2));
    const textStartY = currentY + cardPaddingY + headerRowHeight + gapBetweenHeaderAndBody + textOffsetY;

    ctx.font = `500 ${info.fontSize}px ${ARABIC_ZIKR_FONT}`;
    ctx.fillStyle = palette.textPrimary;
    ctx.textAlign = isArabic ? "right" : "left";
    ctx.textBaseline = "top";

    const textX = isArabic ? cardMarginX + cardWidth - cardPaddingX : cardMarginX + cardPaddingX;
    info.lines.forEach((line, lineIdx) => {
      ctx.fillText(line, textX, textStartY + lineIdx * info.lineHeight);
    });

    currentY += cardHeight + computedGap;
  });

  // 5. Footer Section (y: 1735 - 1880)
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Encouragement CTA
  const footerCta =
    input.ctaText ?? (isArabic ? "احفظ الصورة وشاركها مع من تحب" : "Save and share with those you love");
  ctx.font = `600 21px ${uiFont}`;
  ctx.fillStyle = palette.footerCta;
  ctx.fillText(footerCta, COLLECTION_STORY_WIDTH / 2, 1738);

  // Pagination Dots
  drawPaginationDots(ctx, COLLECTION_STORY_WIDTH / 2, 1792, input.totalPages, input.pageNumber - 1, palette.botanicals);

  // App Watermark / Link
  const brand = input.brandName ?? (isArabic ? "وَذَكِّرْ" : "Wa-Zaker");
  ctx.font = `600 20px ${uiFont}`;
  ctx.fillStyle = palette.subtitle;
  ctx.fillText(brand, COLLECTION_STORY_WIDTH / 2, 1836);

  return canvas;
}

/**
 * Converts a Canvas into a PNG File and Blob asynchronously.
 */
export async function canvasToPngFile(
  canvas: HTMLCanvasElement,
  fileName: string,
): Promise<{ file: File; blob: Blob; dataUrl: string }> {
  const dataUrl = canvas.toDataURL("image/png");
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], fileName, { type: "image/png" });
  return { file, blob, dataUrl };
}

/**
 * Generates a complete collection story page as a high-res PNG file.
 */
export async function generateCollectionStoryPage(
  input: CollectionStoryPageInput,
): Promise<GeneratedCollectionStoryCard> {
  const canvas = renderCollectionStoryPage(input);
  const safeName = `azkar-${input.collectionTitle.replace(/\s+/g, "-")}-page-${input.pageNumber}-of-${input.totalPages}.png`;
  const { file, blob, dataUrl } = await canvasToPngFile(canvas, safeName);

  const altText = `${input.collectionTitle} - صفحة ${input.pageNumber} من ${input.totalPages}`;
  return {
    pageNumber: input.pageNumber,
    totalPages: input.totalPages,
    file,
    blob,
    dataUrl,
    altText,
  };
}

/**
 * Generates all story pages for a collection concurrently.
 */
export async function generateAllCollectionStoryPages(options: {
  collectionTitle: string;
  collectionSubtitle?: string;
  allItems: StoryCardItem[];
  themeMode?: ThemeMode;
  language?: AppLanguage;
  targetPages?: number;
  ctaText?: string;
  brandName?: string;
}): Promise<GeneratedCollectionStoryCard[]> {
  if (typeof document !== "undefined" && document.fonts) await document.fonts.ready;
  const partitioned = paginateCollection<StoryCardItem>(options.allItems, {
    targetPages: options.targetPages,
    maxItemsPerPage: 4,
    minItemsPerPage: 3,
  });

  const fittingPages: StoryCardItem[][] = [];
  const fit = (items: StoryCardItem[]) => {
    try {
      renderCollectionStoryPage({ ...options, items, pageNumber: 1, totalPages: 1 });
      fittingPages.push(items);
    } catch (error) {
      if (!(error instanceof RangeError) || items.length <= 1) throw error;
      const midpoint = Math.ceil(items.length / 2);
      fit(items.slice(0, midpoint));
      fit(items.slice(midpoint));
    }
  };
  partitioned.forEach((page) => fit(page.items));
  const tasks = fittingPages.map((items, index) =>
    generateCollectionStoryPage({
      collectionTitle: options.collectionTitle,
      collectionSubtitle: options.collectionSubtitle,
      pageNumber: index + 1,
      totalPages: fittingPages.length,
      items,
      themeMode: options.themeMode,
      language: options.language,
      ctaText: options.ctaText,
      brandName: options.brandName,
    }),
  );

  return Promise.all(tasks);
}
