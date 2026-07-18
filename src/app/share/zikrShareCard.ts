import type { AppLanguage, ThemeMode } from "../types";

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

export interface ZikrShareCardLabels {
  brandName?: string;
  benefit?: string;
  translation?: string;
  transliteration?: string;
  source?: string;
  repetitions?: (count: number) => string;
  footer?: string;
}

export interface ZikrShareCardInput {
  /** Stable content ID, used only to make a safe download filename. */
  id?: string;
  language: AppLanguage;
  themeMode?: ThemeMode;
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
}

export interface GeneratedZikrShareCard {
  blob: Blob;
  file: File;
  width: typeof ZIKR_SHARE_CARD_WIDTH;
  height: typeof ZIKR_SHARE_CARD_HEIGHT;
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
  key: "arabic" | "translation" | "transliteration" | "benefit" | "source";
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

const ARABIC_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic", Tahoma, Arial, sans-serif';
const LATIN_FONT = 'Inter, "Atkinson Hyperlegible", Arial, sans-serif';

type ResolvedZikrShareCardLabels = Required<Omit<ZikrShareCardLabels, "repetitions">> & {
  repetitions: (count: number) => string;
};

const DEFAULT_LABELS: Record<AppLanguage, ResolvedZikrShareCardLabels> = {
  ar: {
    brandName: "أذكار",
    benefit: "فائدة",
    translation: "المعنى",
    transliteration: "النطق",
    source: "المصدر",
    repetitions: (count) => `عدد التكرار: ${new Intl.NumberFormat("ar-EG").format(count)}`,
    footer: "لحظة ذكر، أينما كنت",
  },
  en: {
    brandName: "Azkar",
    benefit: "Benefit",
    translation: "Meaning",
    transliteration: "Pronunciation",
    source: "Source",
    repetitions: (count) => `Repeat ${new Intl.NumberFormat("en").format(count)}×`,
    footer: "A quiet moment of remembrance",
  },
};

export class ZikrShareCardError extends Error {
  constructor(
    public readonly code: "canvasUnavailable" | "encodingFailed" | "clipboardUnavailable",
    message: string,
  ) {
    super(message);
    this.name = "ZikrShareCardError";
  }
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

function drawChip(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  palette: CardPalette,
  direction: "ltr" | "rtl",
) {
  ctx.font = `700 25px ${direction === "rtl" ? ARABIC_FONT : LATIN_FONT}`;
  const width = Math.min(430, Math.max(128, ctx.measureText(text).width + 58));
  fillRoundedRect(ctx, centerX - width / 2, y, width, 52, 26, palette.surfaceRaised);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 1.5;
  strokeRoundedRect(ctx, centerX - width / 2, y, width, 52, 26, palette.border);
  ctx.direction = direction;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = palette.secondary;
  ctx.fillText(text, centerX, y + 27, width - 24);
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
        textAlign: "center",
        maxFontSize: 62,
        minFontSize: 34,
        lineHeightRatio: 1.62,
        maxLines: 21,
        fontFamily: ARABIC_FONT,
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
        fontFamily: LATIN_FONT,
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
        fontFamily: LATIN_FONT,
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
        fontFamily: section.direction === "rtl" ? ARABIC_FONT : LATIN_FONT,
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
        fontFamily: section.direction === "rtl" ? ARABIC_FONT : LATIN_FONT,
        fontWeight: 500,
        textColor: palette.muted,
      };
  }
}

function layoutSections(
  ctx: CanvasRenderingContext2D,
  sections: ShareCardSection[],
  palette: CardPalette,
  maxWidth: number,
  maxHeight: number,
) {
  const styles = sections.map((section) => sectionStyle(section, palette));
  const sectionGap = 44;

  for (let scale = 1; scale >= 0.54; scale -= 0.025) {
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
      return { layouts, totalHeight, sectionGap };
    }

    if (scale <= 0.55) {
      let fittedHeight = totalHeight;
      const trimPriority: ShareCardSection["key"][] = ["transliteration", "translation", "source", "benefit", "arabic"];
      const minimumLines: Record<ShareCardSection["key"], number> = {
        arabic: 3,
        translation: 2,
        transliteration: 2,
        benefit: 1,
        source: 1,
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

      return { layouts, totalHeight: fittedHeight, sectionGap };
    }
  }

  return { layouts: [] as LaidOutSection[], totalHeight: 0, sectionGap };
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
    ctx.fillStyle = section.key === "benefit" ? palette.teal : palette.primary;
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

  const canvas = document.createElement("canvas");
  canvas.width = ZIKR_SHARE_CARD_WIDTH;
  canvas.height = ZIKR_SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new ZikrShareCardError("canvasUnavailable", "The browser could not create the share-card canvas.");
  }

  const palette = PALETTES[input.themeMode ?? "midnight"];
  const labels = resolvedLabels(input);
  const direction = input.language === "ar" ? "rtl" : "ltr";

  const background = ctx.createLinearGradient(0, 0, ZIKR_SHARE_CARD_WIDTH, ZIKR_SHARE_CARD_HEIGHT);
  background.addColorStop(0, palette.background);
  background.addColorStop(1, palette.backgroundEnd);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, ZIKR_SHARE_CARD_WIDTH, ZIKR_SHARE_CARD_HEIGHT);

  const glow = ctx.createRadialGradient(880, 190, 20, 880, 190, 610);
  glow.addColorStop(0, `${palette.primary}32`);
  glow.addColorStop(1, `${palette.primary}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, ZIKR_SHARE_CARD_WIDTH, 900);

  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = palette.primary;
  for (let index = 0; index < 18; index += 1) {
    const x = 52 + ((index * 137) % 980);
    const y = 34 + ((index * 211) % 470);
    const radius = index % 4 === 0 ? 3.5 : 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  drawCrescent(ctx, ZIKR_SHARE_CARD_WIDTH / 2, 102, palette);
  ctx.direction = direction;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.foreground;
  ctx.font = `700 46px ${direction === "rtl" ? ARABIC_FONT : LATIN_FONT}`;
  ctx.fillText(labels.brandName, ZIKR_SHARE_CARD_WIDTH / 2, 176);

  const chips: string[] = [];
  if (input.categoryLabel?.trim()) chips.push(input.categoryLabel.trim());
  if (typeof input.repetitionCount === "number" && input.repetitionCount > 0) {
    chips.push(labels.repetitions(input.repetitionCount));
  }
  if (chips.length) {
    drawChip(ctx, chips.join("  •  "), ZIKR_SHARE_CARD_WIDTH / 2, 250, palette, direction);
  }

  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 18;
  fillRoundedRect(
    ctx,
    CARD_MARGIN,
    CONTENT_CARD_TOP,
    ZIKR_SHARE_CARD_WIDTH - CARD_MARGIN * 2,
    CONTENT_CARD_BOTTOM - CONTENT_CARD_TOP,
    46,
    palette.surface,
  );
  ctx.restore();
  ctx.lineWidth = 2;
  strokeRoundedRect(
    ctx,
    CARD_MARGIN,
    CONTENT_CARD_TOP,
    ZIKR_SHARE_CARD_WIDTH - CARD_MARGIN * 2,
    CONTENT_CARD_BOTTOM - CONTENT_CARD_TOP,
    46,
    palette.border,
  );
  fillRoundedRect(
    ctx,
    CARD_MARGIN + 24,
    CONTENT_CARD_TOP + 22,
    ZIKR_SHARE_CARD_WIDTH - CARD_MARGIN * 2 - 48,
    8,
    4,
    palette.primary,
  );

  const contentX = CARD_MARGIN + CONTENT_PADDING_X;
  const contentWidth = ZIKR_SHARE_CARD_WIDTH - 2 * (CARD_MARGIN + CONTENT_PADDING_X);
  const contentTop = CONTENT_CARD_TOP + CONTENT_PADDING_Y + 20;
  const contentBottom = CONTENT_CARD_BOTTOM - CONTENT_PADDING_Y;
  const sections = getZikrShareCardSections(input);
  const sectionLayout = layoutSections(ctx, sections, palette, contentWidth, contentBottom - contentTop);
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

  ctx.direction = direction;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = palette.secondary;
  ctx.font = `600 28px ${direction === "rtl" ? ARABIC_FONT : LATIN_FONT}`;
  ctx.fillText(labels.footer, ZIKR_SHARE_CARD_WIDTH / 2, 2720, 850);

  if (input.appUrl?.trim()) {
    ctx.direction = "ltr";
    ctx.fillStyle = palette.muted;
    ctx.font = `500 22px ${LATIN_FONT}`;
    ctx.fillText(input.appUrl.trim(), ZIKR_SHARE_CARD_WIDTH / 2, 2782, 850);
  }

  ctx.fillStyle = palette.primary;
  fillRoundedRect(ctx, ZIKR_SHARE_CARD_WIDTH / 2 - 34, 2852, 68, 6, 3, palette.primary);
  return canvas;
}

function dataUrlToBlob(dataUrl: string) {
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
    width: ZIKR_SHARE_CARD_WIDTH,
    height: ZIKR_SHARE_CARD_HEIGHT,
    altText: getZikrShareFallbackText(input),
    fallbackText: getZikrShareFallbackText(input),
  };
}

/** Optional warm-up for pointer hover/focus. Generation remains synchronous for mobile sharing. */
export async function prepareZikrShareCardFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  await Promise.allSettled([
    document.fonts.load(`600 62px ${ARABIC_FONT}`, "اللَّهُمَّ"),
    document.fonts.load(`700 46px ${LATIN_FONT}`, "Azkar"),
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
