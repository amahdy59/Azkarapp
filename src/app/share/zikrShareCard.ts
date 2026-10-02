import type { AppLanguage, ThemeMode } from "../types";
import { DAYLIGHT_BOTANICAL_PALETTE, MIDNIGHT_BOTANICAL_PALETTE, drawCardCornerBotanicals } from "./canvasBotanicals";

export const ZIKR_SHARE_CARD_WIDTH = 1080;
export const ZIKR_SHARE_CARD_HEIGHT = 2920;

const CARD_MIME_TYPE = "image/png";
const CARD_MARGIN = 72;
const CONTENT_CARD_TOP = 348;
const CONTENT_CARD_BOTTOM = 2632;
const CONTENT_PADDING_X = 64;
const CONTENT_PADDING_Y = 58;

export type ZikrShareCardStatus =
  | "generating"
  | "openingShareSheet"
  | "shared"
  | "copying"
  | "copied"
  | "downloading"
  | "downloaded"
  | "cancelled"
  | "error";

export type ZikrShareMethod = "shared" | "copied" | "downloaded" | "cancelled";

export interface WordMeaningItem {
  word: string;
  meaning: string;
}

export interface ZikrShareCardLabels {
  brandName?: string;
  benefit?: string;
  translation?: string;
  transliteration?: string;
  source?: string;
  wordMeanings?: string;
  repetitions?: (count: number) => string;
  footer?: string;
}

export type ZikrShareCardFormat = "story" | "square" | "tall";

export interface ZikrShareCardInput {
  /** Stable content ID, used only to make a safe download filename. */
  id?: string;
  /** Explicit title rendered at the top inside the card, e.g. "دعاء سيد الاستغفار" */
  title?: string;
  language: AppLanguage;
  themeMode?: ThemeMode;
  format?: ZikrShareCardFormat;
  arabicText: string;
  /** Rendered only on the English card. */
  translation?: string;
  /** Rendered only on the English card. */
  transliteration?: string;
  /** Must already be localized to `language`. Non-Arabic text is rejected on Arabic cards. */
  benefit?: string;
  /** Must already be localized to `language`. Non-Arabic text is rejected on Arabic cards. */
  sourceReference?: string;
  categoryLabel?: string;
  repetitionCount?: number;
  appUrl?: string;
  fileName?: string;
  labels?: ZikrShareCardLabels;
  /** Optional word meanings / vocabulary displayed when card space permits. */
  wordMeanings?: string | WordMeaningItem[];
}

export interface GeneratedZikrShareCard {
  blob: Blob;
  file: File;
  dataUrl?: string;
  width: number;
  height: number;
  altText: string;
  fallbackText: string;
}

export interface ZikrShareResult extends GeneratedZikrShareCard {
  method: ZikrShareMethod;
}

export interface ShareZikrCardOptions {
  onStatus?: (status: ZikrShareCardStatus) => void;
  /** Defaults to image clipboard first, then a PNG download. */
  fallback?: "copyThenDownload" | "download";
}

export interface ShareCardSection {
  key: "arabic" | "translation" | "transliteration" | "benefit" | "source" | "wordMeanings";
  label: string;
  text: string;
  direction: "ltr" | "rtl";
}

interface CardPalette {
  background: string;
  backgroundEnd: string;
  surface: string;
  surfaceRaised: string;
  foreground: string;
  secondary: string;
  muted: string;
  border: string;
  primary: string;
  primaryForeground: string;
  teal: string;
}

interface TextSectionStyle {
  key: ShareCardSection["key"];
  label: string;
  text: string;
  direction: "ltr" | "rtl";
  textAlign: CanvasTextAlign;
  maxFontSize: number;
  minFontSize: number;
  lineHeightRatio: number;
  maxLines: number;
  fontFamily: string;
  fontWeight: number;
  textColor: string;
}

interface LaidOutSection extends TextSectionStyle {
  fontSize: number;
  lineHeight: number;
  lines: string[];
  height: number;
  truncated: boolean;
}

const PALETTES: Record<ThemeMode, CardPalette> = {
  midnight: {
    background: "#0a1228",
    backgroundEnd: "#070d1e",
    surface: "#111b35",
    surfaceRaised: "#182540",
    foreground: "#f5f0e8",
    secondary: "#d4d0e0",
    muted: "#cbd5e1",
    border: "#334a75",
    primary: "#e8b420",
    primaryForeground: "#0a1228",
    teal: "#49b9a2",
  },
  dark: {
    background: "#0d0d0d",
    backgroundEnd: "#050505",
    surface: "#171717",
    surfaceRaised: "#222222",
    foreground: "#f5f0e8",
    secondary: "#d4d0e0",
    muted: "#c3c0d2",
    border: "#555555",
    primary: "#e8b420",
    primaryForeground: "#0d0d0d",
    teal: "#62c7b2",
  },
  light: {
    background: "#f8f5f0",
    backgroundEnd: "#eee8df",
    surface: "#ffffff",
    surfaceRaised: "#f2eee9",
    foreground: "#171717",
    secondary: "#4a4570",
    muted: "#555168",
    border: "#c4bcb0",
    primary: "#835806",
    primaryForeground: "#ffffff",
    teal: "#1a7060",
  },
};

const ARABIC_ZIKR_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif';
const ARABIC_UI_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif';
const LATIN_UI_FONT = '"Noto Sans Arabic Variable", system-ui, sans-serif';

type ResolvedZikrShareCardLabels = Required<Omit<ZikrShareCardLabels, "repetitions">> & {
  repetitions: (count: number) => string;
};

const DEFAULT_LABELS: Record<AppLanguage, ResolvedZikrShareCardLabels> = {
  ar: {
    brandName: "وَذَكِّرْ",
    benefit: "فائدة",
    translation: "المعنى",
    transliteration: "النطق",
    source: "المصدر",
    wordMeanings: "معاني المفردات",
    repetitions: (count) =>
      count === 1 ? "مرة واحدة" : `عدد التكرار: ${new Intl.NumberFormat("ar-EG").format(count)}`,
    footer: "",
  },
  en: {
    brandName: "Wa-Zaker",
    benefit: "Benefit",
    translation: "Meaning",
    transliteration: "Pronunciation",
    source: "Source",
    wordMeanings: "Vocabulary",
    repetitions: (count) => (count === 1 ? "1 time" : `Repeat ${new Intl.NumberFormat("en").format(count)}×`),
    footer: "",
  },
};

export const COMMON_ZIKR_VOCABULARY: Record<string, { ar: WordMeaningItem[]; en: WordMeaningItem[] }> = {
  // Sayyid al-Istighfar key phrase
  "أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي": {
    ar: [
      { word: "أَبُوءُ", meaning: "أُقِرُّ وَأَعْتَرِفُ" },
      { word: "عَهْدِكَ", meaning: "الالتزام بالإيمان والتوحيد والطاعة" },
      { word: "مَا اسْتَطَعْتُ", meaning: "بحسب طاقتي ووُسعي البشري" },
    ],
    en: [
      { word: "Abū'u", meaning: "I acknowledge and confess" },
      { word: "'Ahdika", meaning: "My covenant of faith and obedience" },
      { word: "Mastata'tu", meaning: "To the best of my human capability" },
    ],
  },
  // Ayat al-Kursi key phrase
  "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ": {
    ar: [
      { word: "الْقَيُّومُ", meaning: "القائم بنفسه المقيم لكل ما سواه" },
      { word: "سِنَةٌ", meaning: "نُعاس وغفوة خفيفة تسبق النوم" },
      { word: "يَئُودُهُ", meaning: "يُثقله أو يشقّ عليه حفظهما" },
    ],
    en: [
      { word: "Al-Qayyūm", meaning: "The Self-Sustaining, Sustainer of all existence" },
      { word: "Sinah", meaning: "Drowsiness or slumber" },
      { word: "Ya'ūduh", meaning: "Burdens or tires Him" },
    ],
  },
};

export class ZikrShareCardError extends Error {
  constructor(
    public readonly code: "canvasUnavailable" | "encodingFailed" | "clipboardUnavailable" | "textTooLong",
    message: string,
  ) {
    super(message);
    this.name = "ZikrShareCardError";
  }
}

export function getCleanCardTitle(input: ZikrShareCardInput): string | undefined {
  if (input.title?.trim()) {
    return cleanRawTitle(input.title.trim(), input.language);
  }

  // Detect Ayat al-Kursi
  if (input.arabicText.includes("اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ")) {
    return input.language === "ar" ? "آية الكرسي" : "Ayat al-Kursi";
  }

  // Detect Sayyid al-Istighfar
  if (input.arabicText.includes("أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي")) {
    return input.language === "ar" ? "دعاء سيد الاستغفار" : "Sayyid al-Istighfar";
  }

  if (input.categoryLabel?.trim()) {
    return cleanRawTitle(input.categoryLabel.trim(), input.language);
  }

  return undefined;
}

function cleanRawTitle(raw: string, language: AppLanguage): string {
  // Strip group numbering like (1/25), 1/25, #1, (١ من ٢٥)
  const cleaned = raw
    .replace(/\(?[\d\u0660-\u0669]+[/／][\d\u0660-\u0669]+\)?/g, "")
    .replace(/\(?[\d\u0660-\u0669]+\s*(?:من|of)\s*[\d\u0660-\u0669]+\)?/gi, "")
    .replace(/#[\d\u0660-\u0669]+/g, "")
    .trim();

  // Split on separators like - or – or — or • or :
  const parts = cleaned.split(/[-–—•:؛]/);
  let primary = parts[0]?.trim() || cleaned;

  if (language === "ar" && primary === "سيد الاستغفار") {
    primary = "دعاء سيد الاستغفار";
  }
  return primary;
}

function resolvedLabels(input: ZikrShareCardInput) {
  const defaults = DEFAULT_LABELS[input.language];
  return {
    ...defaults,
    ...input.labels,
    repetitions: input.labels?.repetitions ?? defaults.repetitions,
  };
}

function containsArabicScript(value: string) {
  return /[\u0600-\u06ff\ufb50-\ufdff\ufe70-\ufeff]/u.test(value);
}

export function getResolvedWordMeanings(input: ZikrShareCardInput): string | undefined {
  if (input.wordMeanings) {
    if (typeof input.wordMeanings === "string") {
      return input.wordMeanings.trim() || undefined;
    }
    if (Array.isArray(input.wordMeanings) && input.wordMeanings.length > 0) {
      return input.wordMeanings
        .map((item) => (input.language === "ar" ? `«${item.word}»: ${item.meaning}` : `${item.word}: ${item.meaning}`))
        .join("   •   ");
    }
  }

  for (const [needle, vocab] of Object.entries(COMMON_ZIKR_VOCABULARY)) {
    if (input.arabicText.includes(needle)) {
      const items = input.language === "ar" ? vocab.ar : vocab.en;
      return items
        .map((item) => (input.language === "ar" ? `«${item.word}»: ${item.meaning}` : `${item.word}: ${item.meaning}`))
        .join("   •   ");
    }
  }

  return undefined;
}

/** Returns only sections that are appropriate for the selected app language. */
export function getZikrShareCardSections(input: ZikrShareCardInput): ShareCardSection[] {
  const labels = resolvedLabels(input);
  const sections: ShareCardSection[] = [{ key: "arabic", label: "", text: input.arabicText.trim(), direction: "rtl" }];

  if (input.language === "en") {
    if (input.translation?.trim()) {
      sections.push({
        key: "translation",
        label: labels.translation,
        text: input.translation.trim(),
        direction: "ltr",
      });
    }
    if (input.transliteration?.trim()) {
      sections.push({
        key: "transliteration",
        label: labels.transliteration,
        text: input.transliteration.trim(),
        direction: "ltr",
      });
    }
  }

  const benefit = input.benefit?.trim();
  if (benefit && (input.language === "en" || containsArabicScript(benefit))) {
    sections.push({
      key: "benefit",
      label: labels.benefit,
      text: benefit,
      direction: input.language === "ar" ? "rtl" : "ltr",
    });
  }

  const source = input.sourceReference?.trim();
  if (source && (input.language === "en" || containsArabicScript(source))) {
    sections.push({
      key: "source",
      label: labels.source,
      text: source,
      direction: input.language === "ar" ? "rtl" : "ltr",
    });
  }

  const meanings = getResolvedWordMeanings(input);
  if (meanings && (input.language === "en" || containsArabicScript(meanings))) {
    sections.push({
      key: "wordMeanings",
      label: labels.wordMeanings,
      text: meanings,
      direction: input.language === "ar" ? "rtl" : "ltr",
    });
  }

  return sections;
}

function splitLongToken(token: string, measure: (text: string) => number, maxWidth: number) {
  const graphemes = Array.from(token);
  const chunks: string[] = [];
  let current = "";

  for (const grapheme of graphemes) {
    const candidate = current + grapheme;
    if (current && measure(candidate) > maxWidth) {
      chunks.push(current);
      current = grapheme;
    } else {
      current = candidate;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

function ellipsizeLine(line: string, measure: (text: string) => number, maxWidth: number) {
  const ellipsis = "…";
  let result = line.trimEnd();
  while (result && measure(`${result}${ellipsis}`) > maxWidth) {
    result = Array.from(result).slice(0, -1).join("").trimEnd();
  }
  return `${result}${ellipsis}`;
}

/** Pure, reusable line wrapping for Canvas previews and regression tests. */
export function wrapCanvasText(
  value: string,
  measure: (text: string) => number,
  maxWidth: number,
  maxLines = Number.POSITIVE_INFINITY,
) {
  const lines: string[] = [];
  const paragraphs = value.replace(/\r/g, "").split("\n");

  for (const paragraphValue of paragraphs) {
    const paragraph = paragraphValue.trim();
    if (!paragraph) {
      if (lines.length > 0) lines.push("");
      continue;
    }

    const words = paragraph.split(/\s+/u);
    let current = "";

    for (const word of words) {
      const pieces = measure(word) > maxWidth ? splitLongToken(word, measure, maxWidth) : [word];
      for (const piece of pieces) {
        const candidate = current ? `${current} ${piece}` : piece;
        if (current && measure(candidate) > maxWidth) {
          lines.push(current);
          current = piece;
        } else {
          current = candidate;
        }
      }
    }

    if (current) lines.push(current);
  }

  if (lines.length <= maxLines) {
    return { lines, truncated: false };
  }

  const visibleLines = lines.slice(0, Math.max(1, maxLines));
  const lastIndex = visibleLines.length - 1;
  visibleLines[lastIndex] = ellipsizeLine(visibleLines[lastIndex] ?? "", measure, maxWidth);
  return { lines: visibleLines, truncated: true };
}

function safeFileStem(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return normalized || "zikr";
}

export function getZikrShareCardFileName(input: ZikrShareCardInput) {
  if (input.fileName?.trim()) {
    const requested = input.fileName.trim().replace(/\.png$/i, "");
    return `${safeFileStem(requested)}.png`;
  }
  return `azkar-${safeFileStem(input.id || input.categoryLabel || "zikr")}.png`;
}

export function getZikrShareFallbackText(input: ZikrShareCardInput) {
  const sections = getZikrShareCardSections(input);
  const labels = resolvedLabels(input);
  const body = sections
    .map((section) => (section.label ? `${section.label}\n${section.text}` : section.text))
    .join("\n\n");
  const footer = input.appUrl?.trim() || labels.brandName;
  return `${body}\n\n${footer}`;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string | CanvasGradient,
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  stroke: string,
) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function drawCrescent(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, palette: CardPalette) {
  fillRoundedRect(ctx, centerX - 47, centerY - 47, 94, 94, 28, palette.surfaceRaised);
  ctx.beginPath();
  ctx.arc(centerX - 4, centerY, 27, 0, Math.PI * 2);
  ctx.fillStyle = palette.primary;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(centerX + 9, centerY - 8, 25, 0, Math.PI * 2);
  ctx.fillStyle = palette.surfaceRaised;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + 28, centerY - 22, 5, 0, Math.PI * 2);
  ctx.fillStyle = palette.primary;
  ctx.fill();
}

function sectionStyle(section: ShareCardSection, palette: CardPalette): TextSectionStyle {
  const common = {
    key: section.key,
    label: section.label,
    text: section.text,
    direction: section.direction,
  };

  switch (section.key) {
    case "arabic":
      return {
        ...common,
        textAlign: "right",
        maxFontSize: 62,
        minFontSize: 34,
        lineHeightRatio: 1.62,
        maxLines: 21,
        fontFamily: ARABIC_ZIKR_FONT,
        fontWeight: 600,
        textColor: palette.foreground,
      };
    case "translation":
      return {
        ...common,
        textAlign: "left",
        maxFontSize: 37,
        minFontSize: 25,
        lineHeightRatio: 1.5,
        maxLines: 9,
        fontFamily: LATIN_UI_FONT,
        fontWeight: 500,
        textColor: palette.foreground,
      };
    case "transliteration":
      return {
        ...common,
        textAlign: "left",
        maxFontSize: 31,
        minFontSize: 23,
        lineHeightRatio: 1.5,
        maxLines: 7,
        fontFamily: LATIN_UI_FONT,
        fontWeight: 400,
        textColor: palette.secondary,
      };
    case "benefit":
      return {
        ...common,
        textAlign: section.direction === "rtl" ? "right" : "left",
        maxFontSize: 33,
        minFontSize: 24,
        lineHeightRatio: 1.5,
        maxLines: 5,
        fontFamily: section.direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT,
        fontWeight: 500,
        textColor: palette.foreground,
      };
    case "source":
      return {
        ...common,
        textAlign: section.direction === "rtl" ? "right" : "left",
        maxFontSize: 25,
        minFontSize: 20,
        lineHeightRatio: 1.45,
        maxLines: 4,
        fontFamily: section.direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT,
        fontWeight: 500,
        textColor: palette.muted,
      };
    case "wordMeanings":
      return {
        ...common,
        textAlign: section.direction === "rtl" ? "right" : "left",
        maxFontSize: 24,
        minFontSize: 18,
        lineHeightRatio: 1.55,
        maxLines: 4,
        fontFamily: section.direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT,
        fontWeight: 500,
        textColor: palette.secondary,
      };
  }
}

interface LayoutGroupResult {
  layouts: LaidOutSection[];
  totalHeight: number;
  sectionGap: number;
  scale: number;
}

function layoutSectionGroup(
  ctx: CanvasRenderingContext2D,
  sections: ShareCardSection[],
  palette: CardPalette,
  maxWidth: number,
  maxHeight: number,
  minAllowedScale = 0.54,
): LayoutGroupResult {
  const styles = sections.map((section) => sectionStyle(section, palette));
  const sectionGap = 44;

  for (let scale = 1; scale >= minAllowedScale; scale -= 0.025) {
    const layouts: LaidOutSection[] = styles.map((style) => {
      const fontSize = Math.max(style.minFontSize, Math.round(style.maxFontSize * scale));
      const lineHeight = Math.round(fontSize * style.lineHeightRatio);
      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      const wrapped = wrapCanvasText(style.text, (text) => ctx.measureText(text).width, maxWidth, style.maxLines);
      const labelHeight = style.label ? 48 : 0;
      return {
        ...style,
        fontSize,
        lineHeight,
        lines: wrapped.lines,
        truncated: wrapped.truncated,
        height: labelHeight + wrapped.lines.length * lineHeight,
      };
    });
    const totalHeight =
      layouts.reduce((sum, layout) => sum + layout.height, 0) + Math.max(0, layouts.length - 1) * sectionGap;
    if (totalHeight <= maxHeight) {
      return { layouts, totalHeight, sectionGap, scale };
    }

    if (scale <= 0.55 && minAllowedScale <= 0.55) {
      let fittedHeight = totalHeight;
      const trimPriority: ShareCardSection["key"][] = [
        "wordMeanings",
        "transliteration",
        "translation",
        "source",
        "benefit",
        "arabic",
      ];
      const minimumLines: Record<ShareCardSection["key"], number> = {
        arabic: 3,
        translation: 2,
        transliteration: 2,
        benefit: 1,
        source: 1,
        wordMeanings: 1,
      };

      while (fittedHeight > maxHeight) {
        const candidate = trimPriority
          .map((key) => layouts.find((layout) => layout.key === key))
          .find((layout): layout is LaidOutSection =>
            Boolean(layout && layout.lines.length > minimumLines[layout.key]),
          );
        if (!candidate) break;

        candidate.lines.pop();
        ctx.font = `${candidate.fontWeight} ${candidate.fontSize}px ${candidate.fontFamily}`;
        const lastIndex = candidate.lines.length - 1;
        candidate.lines[lastIndex] = ellipsizeLine(
          candidate.lines[lastIndex] ?? "",
          (text) => ctx.measureText(text).width,
          maxWidth,
        );
        candidate.truncated = true;
        candidate.height -= candidate.lineHeight;
        fittedHeight -= candidate.lineHeight;
      }

      return { layouts, totalHeight: fittedHeight, sectionGap, scale };
    }
  }

  return { layouts: [] as LaidOutSection[], totalHeight: Number.POSITIVE_INFINITY, sectionGap, scale: minAllowedScale };
}

function layoutSections(
  ctx: CanvasRenderingContext2D,
  sections: ShareCardSection[],
  palette: CardPalette,
  maxWidth: number,
  maxHeight: number,
) {
  const wordMeaningsSection = sections.find((s) => s.key === "wordMeanings");
  const coreSections = sections.filter((s) => s.key !== "wordMeanings");

  // Step 1: Layout core sections first to check baseline font scaling and remaining space
  const coreResult = layoutSectionGroup(ctx, coreSections, palette, maxWidth, maxHeight);

  // If there's no wordMeanings section to consider, return core layout directly
  if (!wordMeaningsSection) {
    return coreResult;
  }

  // CRITICAL USER CONSTRAINT:
  // "this is only if space allows it. I like the font sizing of the zikr."
  // Only include word meanings if:
  // 1) The core sections already scale comfortably (scale >= 0.85)
  // 2) There is at least 150px of spare height left in the card
  const spareHeight = maxHeight - coreResult.totalHeight;
  if (coreResult.scale < 0.85 || spareHeight < 150) {
    // Space is too constrained (e.g. square card or very long zikr)
    // Omit word meanings so the zikr font size stays large and uncompromised!
    return coreResult;
  }

  // Step 2: Try layout with word meanings, enforcing that scale cannot drop below 0.85
  const fullResult = layoutSectionGroup(ctx, sections, palette, maxWidth, maxHeight, 0.85);
  if (fullResult.totalHeight > 0 && fullResult.totalHeight <= maxHeight) {
    return fullResult;
  }

  // Fall back to core layout if adding word meanings would force font shrinkage
  return coreResult;
}

function drawSection(
  ctx: CanvasRenderingContext2D,
  section: LaidOutSection,
  x: number,
  y: number,
  width: number,
  palette: CardPalette,
) {
  let cursorY = y;
  if (section.label) {
    ctx.direction = section.direction;
    ctx.textAlign = section.direction === "rtl" ? "right" : "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = section.key === "benefit" || section.key === "wordMeanings" ? palette.teal : palette.primary;
    ctx.font = `700 24px ${section.fontFamily}`;
    ctx.fillText(section.label, section.direction === "rtl" ? x + width : x, cursorY, width);
    cursorY += 48;
  }

  ctx.direction = section.direction;
  ctx.textAlign = section.textAlign;
  ctx.textBaseline = "top";
  ctx.fillStyle = section.textColor;
  ctx.font = `${section.fontWeight} ${section.fontSize}px ${section.fontFamily}`;
  const textX = section.textAlign === "center" ? x + width / 2 : section.textAlign === "right" ? x + width : x;

  for (const line of section.lines) {
    ctx.fillText(line, textX, cursorY, width);
    cursorY += section.lineHeight;
  }
}

/**
 * Draws the complete card synchronously, so a following `navigator.share()` call
 * retains the click's transient user activation on mobile browsers.
 */
export function renderZikrShareCard(input: ZikrShareCardInput) {
  if (typeof document === "undefined") {
    throw new ZikrShareCardError("canvasUnavailable", "Share cards require a browser Canvas implementation.");
  }

  const format = input.format ?? "tall";
  const cardWidth = ZIKR_SHARE_CARD_WIDTH;
  const cardHeight = format === "story" ? 1920 : format === "square" ? 1080 : ZIKR_SHARE_CARD_HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = cardWidth;
  canvas.height = cardHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ZikrShareCardError("canvasUnavailable", "The browser could not create the share-card canvas.");
  }

  const palette = PALETTES[input.themeMode ?? "midnight"];
  const labels = resolvedLabels(input);
  const direction = input.language === "ar" ? "rtl" : "ltr";

  const background = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
  background.addColorStop(0, palette.background);
  background.addColorStop(1, palette.backgroundEnd);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, cardWidth, cardHeight);

  // Decorative corner foliage
  const botanicalPalette = input.themeMode === "light" ? DAYLIGHT_BOTANICAL_PALETTE : MIDNIGHT_BOTANICAL_PALETTE;
  drawCardCornerBotanicals(ctx, cardWidth, cardHeight, botanicalPalette);

  const glow = ctx.createRadialGradient(880, 190, 20, 880, 190, 610);
  glow.addColorStop(0, `${palette.primary}32`);
  glow.addColorStop(1, `${palette.primary}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, cardWidth, Math.min(900, cardHeight));

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = palette.primary;
  for (let index = 0; index < 18; index += 1) {
    const x = 52 + ((index * 137) % 980);
    const y = 34 + ((index * 211) % (cardHeight * 0.25));
    const radius = index % 4 === 0 ? 3.5 : 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const crescentY = format === "square" ? 44 : 80;
  drawCrescent(ctx, cardWidth / 2, crescentY, palette);
  ctx.direction = direction;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.foreground;
  const brandFontSize = format === "square" ? 38 : 46;
  ctx.font = `700 ${brandFontSize}px ${direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT}`;
  const brandY = format === "square" ? 88 : 142;
  ctx.fillText(labels.brandName, cardWidth / 2, brandY);

  const contentCardTop = format === "square" ? 152 : format === "story" ? 228 : CONTENT_CARD_TOP;
  const contentCardBottom = format === "square" ? 984 : format === "story" ? 1800 : CONTENT_CARD_BOTTOM;
  const contentCardHeight = contentCardBottom - contentCardTop;

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  fillRoundedRect(
    ctx,
    CARD_MARGIN,
    contentCardTop,
    cardWidth - CARD_MARGIN * 2,
    contentCardHeight,
    46,
    palette.surface,
  );
  ctx.restore();
  ctx.lineWidth = 2;
  strokeRoundedRect(
    ctx,
    CARD_MARGIN,
    contentCardTop,
    cardWidth - CARD_MARGIN * 2,
    contentCardHeight,
    46,
    palette.border,
  );

  const contentX = CARD_MARGIN + CONTENT_PADDING_X;
  const contentWidth = cardWidth - 2 * (CARD_MARGIN + CONTENT_PADDING_X);
  const contentBottom = contentCardBottom - CONTENT_PADDING_Y;

  // Integrated Card Header: Clean Zikr Title inside the card
  const cleanTitle = getCleanCardTitle(input);
  let contentTop = contentCardTop + CONTENT_PADDING_Y + 10;

  if (cleanTitle) {
    const titleY =
      format === "square" ? contentCardTop + 68 : format === "story" ? contentCardTop + 84 : contentCardTop + 96;
    const titleFontSize = format === "square" ? 28 : format === "story" ? 34 : 36;
    ctx.direction = direction;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = palette.primary;
    ctx.font = `700 ${titleFontSize}px ${direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT}`;
    ctx.fillText(cleanTitle, cardWidth / 2, titleY);

    const hasReps = typeof input.repetitionCount === "number" && input.repetitionCount >= 1;
    let dividerY = titleY + titleFontSize + (format === "square" ? 18 : 22);

    if (hasReps) {
      const repY = titleY + titleFontSize + 12;
      ctx.fillStyle = palette.muted;
      ctx.font = `600 18px ${direction === "rtl" ? ARABIC_UI_FONT : LATIN_UI_FONT}`;
      ctx.fillText(labels.repetitions(input.repetitionCount!), cardWidth / 2, repY);
      dividerY = repY + 30;
    }

    // Elegant divider under the integrated title
    const divider = ctx.createLinearGradient(contentX, dividerY, contentX + contentWidth, dividerY);
    divider.addColorStop(0, `${palette.border}00`);
    divider.addColorStop(0.2, palette.border);
    divider.addColorStop(0.8, palette.border);
    divider.addColorStop(1, `${palette.border}00`);
    ctx.fillStyle = divider;
    ctx.fillRect(contentX, dividerY, contentWidth, 1.5);

    contentTop = dividerY + (format === "square" ? 24 : 32);
  }

  const sections = getZikrShareCardSections(input);
  const sectionLayout = layoutSections(ctx, sections, palette, contentWidth, contentBottom - contentTop);
  if (
    sectionLayout.layouts.some((section) => section.truncated) ||
    sectionLayout.totalHeight > contentBottom - contentTop
  ) {
    throw new ZikrShareCardError("textTooLong", "Complete text requires continuation cards.");
  }
  let cursorY = contentTop + Math.max(0, (contentBottom - contentTop - sectionLayout.totalHeight) / 2);

  sectionLayout.layouts.forEach((section, index) => {
    if (index > 0) {
      const dividerY = cursorY - sectionLayout.sectionGap / 2;
      const divider = ctx.createLinearGradient(contentX, dividerY, contentX + contentWidth, dividerY);
      divider.addColorStop(0, `${palette.border}00`);
      divider.addColorStop(0.18, palette.border);
      divider.addColorStop(0.82, palette.border);
      divider.addColorStop(1, `${palette.border}00`);
      ctx.fillStyle = divider;
      ctx.fillRect(contentX, dividerY, contentWidth, 1.5);
    }
    drawSection(ctx, section, contentX, cursorY, contentWidth, palette);
    cursorY += section.height + sectionLayout.sectionGap;
  });

  // Footer: Clean website link below the card (replacing tagline as requested)
  const rawUrl = input.appUrl?.trim() || "wazaker.app";
  const displayUrl = rawUrl.replace(/^https?:\/\//i, "").replace(/\/$/, "");

  const footerUrlY = format === "square" ? 1014 : format === "story" ? 1836 : 2780;
  const accentBarY = format === "square" ? 1050 : format === "story" ? 1874 : 2830;

  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.muted;
  const urlFontSize = format === "square" ? 19 : 22;
  ctx.font = `600 ${urlFontSize}px ${LATIN_UI_FONT}`;
  ctx.fillText(displayUrl, cardWidth / 2, footerUrlY);

  ctx.fillStyle = palette.primary;
  fillRoundedRect(ctx, cardWidth / 2 - 32, accentBarY, 64, 5, 2.5, palette.primary);
  return canvas;
}

export function dataUrlToBlob(dataUrl: string) {
  const separatorIndex = dataUrl.indexOf(",");
  if (separatorIndex < 0 || !dataUrl.startsWith("data:image/png;base64,")) {
    throw new ZikrShareCardError("encodingFailed", "The share card could not be encoded as a PNG.");
  }
  const binary = atob(dataUrl.slice(separatorIndex + 1));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: CARD_MIME_TYPE });
}

/** Generates a PNG `File` without yielding before Web Share is invoked. */
export function generateZikrShareCard(input: ZikrShareCardInput): GeneratedZikrShareCard {
  const canvas = renderZikrShareCard(input);
  let dataUrl: string;
  try {
    dataUrl = canvas.toDataURL(CARD_MIME_TYPE);
  } catch {
    throw new ZikrShareCardError("encodingFailed", "The share card could not be encoded as a PNG.");
  }
  const blob = dataUrlToBlob(dataUrl);
  const file = new File([blob], getZikrShareCardFileName(input), { type: CARD_MIME_TYPE });
  return {
    blob,
    file,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    altText: getZikrShareFallbackText(input),
    fallbackText: getZikrShareFallbackText(input),
  };
}

/** Optional warm-up for pointer hover/focus. Generation remains synchronous for mobile sharing. */
export async function prepareZikrShareCardFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.allSettled([
    document.fonts.load(`600 62px ${ARABIC_ZIKR_FONT}`, "اللَّهُمَّ أَنْتَ رَبِّي"),
    document.fonts.load(`700 46px ${ARABIC_UI_FONT}`, "وَذَكِّرْ"),
    document.fonts.load(`700 46px ${LATIN_UI_FONT}`, "Wa-Zaker"),
    document.fonts.ready,
  ]);
}

function canShareFile(navigatorValue: Navigator, file: File) {
  if (typeof navigatorValue.share !== "function" || typeof navigatorValue.canShare !== "function") return false;
  try {
    return navigatorValue.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function copyZikrShareCardFile(file: File) {
  if (typeof navigator === "undefined" || typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new ZikrShareCardError("clipboardUnavailable", "This browser does not support copying PNG images.");
  }
  await navigator.clipboard.write([new ClipboardItem({ [CARD_MIME_TYPE]: file })]);
}

export function downloadZikrShareCardFile(file: File) {
  if (typeof document === "undefined") {
    throw new ZikrShareCardError("canvasUnavailable", "Downloads require a browser document.");
  }
  const objectUrl = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = file.name;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

/**
 * Shares a generated image file when Web Share Level 2 is available. On desktop,
 * it copies the PNG to the clipboard and finally falls back to downloading it.
 */
export async function shareZikrCard(input: ZikrShareCardInput, options: ShareZikrCardOptions = {}) {
  const notify = options.onStatus;
  try {
    notify?.("generating");
    await prepareZikrShareCardFonts();
    const generated = generateZikrShareCard(input);

    if (typeof navigator !== "undefined" && canShareFile(navigator, generated.file)) {
      notify?.("openingShareSheet");
      try {
        await navigator.share({
          title: resolvedLabels(input).brandName,
          text: input.categoryLabel?.trim() || undefined,
          files: [generated.file],
        });
        notify?.("shared");
        return { ...generated, method: "shared" } satisfies ZikrShareResult;
      } catch (error) {
        if (isAbortError(error)) {
          notify?.("cancelled");
          return { ...generated, method: "cancelled" } satisfies ZikrShareResult;
        }
      }
    }

    if (options.fallback !== "download") {
      try {
        notify?.("copying");
        await copyZikrShareCardFile(generated.file);
        notify?.("copied");
        return { ...generated, method: "copied" } satisfies ZikrShareResult;
      } catch {
        // A direct PNG download remains available when image Clipboard is unsupported or denied.
      }
    }

    notify?.("downloading");
    downloadZikrShareCardFile(generated.file);
    notify?.("downloaded");
    return { ...generated, method: "downloaded" } satisfies ZikrShareResult;
  } catch (error) {
    notify?.("error");
    throw error;
  }
}
