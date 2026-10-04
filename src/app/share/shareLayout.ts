import type { AppLanguage, ThemeMode, RoutineMode, PrayerName, Zikr } from "../types";
import { t } from "../i18n";
import { isLongSurah } from "../content/mushafPages";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { buildQuranTextSegments, getQuranWordMeanings, QURAN_WORD_MEANING_SOURCE } from "../content/quranWordMeanings";

export type ShareFormat = "story" | "square" | "portrait" | "tall";
export type ShareAppearance = "olive" | "gold" | "lavender";
export const SHARE_DIMENSIONS: Record<ShareFormat, { width: number; height: number }> = {
  story: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
  portrait: { width: 1080, height: 1350 },
  tall: { width: 1080, height: 2920 },
};
export const SHARE_ARABIC_FONT = '"IBM Plex Sans Arabic", "Noto Sans Arabic Variable", sans-serif';
export const SHARE_UI_FONT = '"Noto Sans Arabic Variable", system-ui, sans-serif';
/** Export pixels: protect the reading text's diacritics below the badge. */
export const SHARE_PILL = { top: 28, height: 50, gap: 16, textTop: 94, bottom: 36 } as const;
export const SHARE_SECTION_GAP = 28;

export interface ShareSection {
  key: "arabic" | "translation" | "wordMeanings" | "transliteration" | "benefit" | "source" | "reading";
  text: string;
  direction: "rtl" | "ltr";
}
export interface ShareItem {
  id: string;
  arabicText: string;
  title?: string;
  translation?: string;
  wordMeanings?: string;
  transliteration?: string;
  benefit?: string;
  sourceReference?: string;
  repetitionCount?: number;
  reminder?: boolean;
  readingUrl?: string;
  language?: AppLanguage;
}
export function getMushafShareUrl(page: number, baseUrl?: string): string {
  const url = new URL(baseUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).toString());
  url.hash = `/quran/${page}`;
  return url.toString();
}

/** Export policy is shared by images, accessible text and archives. Reviewed data stays untouched. */
export function toShareItem(zikr: Zikr, language: AppLanguage, baseUrl?: string): ShareItem {
  const reminder = isLongSurah(zikr);
  return {
    id: zikr.id,
    arabicText: reminder ? "" : zikr.arabicText,
    title: language === "ar" ? zikr.surahNameArabic : zikr.surahNameEnglish,
    translation: reminder ? undefined : zikr.translation,
    wordMeanings: !reminder && language === "ar" ? getReviewedShareWordMeanings(zikr) : undefined,
    transliteration: reminder ? undefined : zikr.transliteration,
    benefit: getLocalizedZikrBenefit(zikr, language),
    sourceReference: getLocalizedSourceReference(zikr, language),
    repetitionCount: zikr.repetitionCount,
    reminder,
    readingUrl: reminder ? getMushafShareUrl(zikr.mushafPages![0]!.page, baseUrl) : undefined,
    language,
  };
}

/** Only glossary entries actually anchored in the shared excerpt are eligible. */
function getReviewedShareWordMeanings(zikr: Zikr): string | undefined {
  const entries = buildQuranTextSegments(zikr.arabicText, getQuranWordMeanings(zikr)).flatMap(
    (segment) => segment.meanings ?? [],
  );
  const unique = [...new Map(entries.map((entry) => [entry.id, entry])).values()];
  return unique.length
    ? [
        ...unique.map((entry) => `${entry.word}: ${entry.explanationArabic}`),
        QURAN_WORD_MEANING_SOURCE.nameArabic,
      ].join("\n")
    : undefined;
}

export class ShareFitError extends RangeError {
  constructor(
    public readonly itemId: string,
    public readonly format: ShareFormat,
  ) {
    super("The complete item does not fit this image size.");
    this.name = "ShareFitError";
  }
}
export interface ShareContentOptions {
  meaning?: boolean;
  wordMeanings?: boolean;
  pronunciation?: boolean;
  benefit?: boolean;
  qr?: boolean;
}
export interface MeasuredSection extends ShareSection {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  height: number;
}
export interface ShareFragment {
  item: ShareItem;
  sections: MeasuredSection[];
  part: number;
  parts: number;
  height: number;
  citation?: MeasuredSection;
  heading?: Omit<MeasuredSection, "key">;
}
export interface ShareLayoutPage {
  fragments: ShareFragment[];
  pageNumber: number;
  totalPages: number;
}
export interface ShareGeometry {
  top: number;
  bottom: number;
  footer: number;
  titleY: number;
  titleSize: number;
  width: number;
  textWidth: number;
}

export function shareGeometry(format: ShareFormat, qr = false, single = false): ShareGeometry {
  const height = SHARE_DIMENSIONS[format].height;
  const story = format === "story" || format === "tall";
  return {
    top: story ? (single ? 210 : 270) : single ? 130 : 220,
    bottom: height - (story ? (qr ? 300 : single ? 170 : 200) : qr ? 260 : single ? 130 : 170),
    footer: height - (story ? 110 : 80),
    titleY: story ? 165 : 116,
    titleSize: story ? 54 : 46,
    width: 952,
    textWidth: 856,
  };
}

export function defaultShareAppearance(category?: string, theme?: ThemeMode): ShareAppearance {
  if (category === "morning") return "olive";
  if (category === "before_sleep") return "lavender";
  if (category === "evening") return "gold";
  return theme === "midnight" || theme === "dark" ? "gold" : "olive";
}

export function getShareSections(item: ShareItem, options: ShareContentOptions = {}): ShareSection[] {
  const sections: ShareSection[] = item.reminder ? [] : [{ key: "arabic", text: item.arabicText, direction: "rtl" }];
  if (options.meaning && item.translation?.trim())
    sections.push({ key: "translation", text: item.translation, direction: "ltr" });
  if (options.wordMeanings && item.language === "ar" && item.wordMeanings?.trim())
    sections.push({ key: "wordMeanings", text: item.wordMeanings, direction: "rtl" });
  if (options.pronunciation && item.transliteration?.trim())
    sections.push({ key: "transliteration", text: item.transliteration, direction: "ltr" });
  if ((options.benefit || item.reminder) && item.benefit?.trim())
    sections.push({
      key: "benefit",
      text: item.benefit,
      direction: /[\u0600-\u06ff]/u.test(item.benefit) ? "rtl" : "ltr",
    });
  if (item.sourceReference?.trim())
    sections.push({
      key: "source",
      text: item.sourceReference,
      direction: /[\u0600-\u06ff]/u.test(item.sourceReference) ? "rtl" : "ltr",
    });
  if (item.reminder)
    sections.push({
      key: "reading",
      text: t(item.language ?? "ar", "shareStudio.readMushaf"),
      direction: item.language === "en" ? "ltr" : "rtl",
    });
  return sections;
}

export function getShareRepetitionLabel(count: number, language: AppLanguage): string {
  return t(
    language,
    count === 1
      ? "shareStudio.repeatOnce"
      : count === 2
        ? "shareStudio.repeatTwice"
        : count > 10
          ? "shareStudio.repeatMany"
          : "shareStudio.repetitions",
    {
      count: new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en").format(count),
    },
  );
}

/** Each raw run includes its whitespace; joining runs exactly reproduces the input.
 * Grapheme boundaries keep Arabic marks attached when an unusually long token wraps. */
export function wrapShareText(text: string, measure: (value: string) => number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  const tokens = text.match(/\s+|[^\s]+/gu) ?? [];
  const add = (token: string) => {
    if (current && measure((current + token).trim()) > maxWidth) {
      lines.push(current);
      current = "";
    }
    current += token;
  };
  for (const token of tokens) {
    if (/^\s+$/u.test(token)) {
      for (const piece of token.split(/(\r\n|\n|\r)/u)) {
        current += piece;
        if (/^(\r\n|\n|\r)$/u.test(piece)) {
          lines.push(current);
          current = "";
        }
      }
    } else if (measure(token) > maxWidth) {
      for (const { segment } of new Intl.Segmenter("ar", { granularity: "grapheme" }).segment(token)) add(segment);
    } else add(token);
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

export function measureShareSection(
  ctx: CanvasRenderingContext2D,
  section: ShareSection,
  single: boolean,
  width: number,
  primary = false,
  compact = false,
): MeasuredSection {
  const fontSize =
    section.key === "arabic" ? (single ? (compact ? 52 : 64) : 52) : primary ? 52 : section.key === "source" ? 34 : 36;
  const lineHeight = Math.ceil(fontSize * (section.direction === "rtl" ? 1.65 : 1.5));
  ctx.font = `${section.key === "arabic" ? 500 : 400} ${fontSize}px ${section.direction === "rtl" ? SHARE_ARABIC_FONT : SHARE_UI_FONT}`;
  const lines = wrapShareText(section.text, (value) => ctx.measureText(value).width, width);
  // Keep the final reference together when it fits on the next line. The
  // joined reviewed payload stays identical, including its whitespace.
  if (section.key === "source" && lines.length > 1) {
    const previous = lines.at(-2)!;
    const boundary = Math.max(previous.lastIndexOf(";"), previous.lastIndexOf("؛")) + 1;
    const reference = previous.slice(boundary) + lines.at(-1)!;
    if (boundary > 0 && ctx.measureText(reference.trim()).width <= width) {
      lines[lines.length - 2] = previous.slice(0, boundary);
      lines[lines.length - 1] = reference;
    }
  }
  const labelHeight = section.key === "arabic" ? 0 : 44;
  return { ...section, lines, fontSize, lineHeight, height: lines.length * lineHeight + labelHeight };
}

/** Complete items are indivisible. Reject incompatible sizes before encoding any image. */
export function layoutSharePages(
  ctx: CanvasRenderingContext2D,
  items: readonly ShareItem[],
  format: ShareFormat,
  content: ShareContentOptions = {},
  single = false,
): ShareLayoutPage[] {
  const geometry = shareGeometry(format, content.qr, single);
  const capacity = geometry.bottom - geometry.top;
  const sectionGap = SHARE_SECTION_GAP;
  const fragments: ShareFragment[] = [];
  for (const item of items) {
    let heading: ShareFragment["heading"];
    if (item.title?.trim()) {
      const direction = /[\u0600-\u06ff]/u.test(item.title) ? "rtl" : "ltr";
      ctx.font = `600 40px ${direction === "rtl" ? SHARE_ARABIC_FONT : SHARE_UI_FONT}`;
      const lines = wrapShareText(item.title, (value) => ctx.measureText(value).width, geometry.textWidth);
      heading = { text: item.title, direction, lines, fontSize: 40, lineHeight: 66, height: lines.length * 66 + 16 };
    }
    let measured = getShareSections(item, content).map((section) =>
      measureShareSection(
        ctx,
        section,
        single,
        geometry.textWidth,
        Boolean(item.reminder && section.key === "benefit"),
      ),
    );
    let source = measured.find((section) => section.key === "source");
    let citation = source;
    let sections = measured.filter((section) => section !== citation);
    let height =
      SHARE_PILL.textTop +
      SHARE_PILL.bottom +
      (heading?.height ?? 0) +
      measured.reduce((sum, section) => sum + section.height, 0) +
      Math.max(0, measured.length - 1) * sectionGap;
    const itemCapacity = item.reminder ? shareGeometry(format, true).bottom - geometry.top : capacity;
    if (single && !item.reminder && height > itemCapacity) {
      const compactMeasured = getShareSections(item, content).map((section) =>
        measureShareSection(
          ctx,
          section,
          single,
          geometry.textWidth,
          Boolean(item.reminder && section.key === "benefit"),
          true,
        ),
      );
      const compactHeight =
        SHARE_PILL.textTop +
        SHARE_PILL.bottom +
        (heading?.height ?? 0) +
        compactMeasured.reduce((sum, section) => sum + section.height, 0) +
        Math.max(0, compactMeasured.length - 1) * sectionGap;
      if (compactHeight <= itemCapacity) {
        measured = compactMeasured;
        source = measured.find((section) => section.key === "source");
        citation = source;
        sections = measured.filter((section) => section !== citation);
        height = compactHeight;
      }
    }
    if (height > itemCapacity) throw new ShareFitError(item.id, format);
    fragments.push({ item, sections, part: 1, parts: 1, height, citation, heading });
  }
  const groups: ShareFragment[][] = [];
  let group: ShareFragment[] = [];
  let height = 0;
  for (const fragment of fragments) {
    const gap = group.length ? 28 : 0;
    const short = (part: ShareFragment) => part.height <= (capacity - 84) / 4;
    const maxItems = short(fragment) && group.every(short) ? 4 : 3;
    if (
      group.length &&
      (single ||
        fragment.item.reminder ||
        group.some((part) => part.item.reminder) ||
        group.length >= maxItems ||
        height + gap + fragment.height > capacity)
    ) {
      groups.push(group);
      group = [];
      height = 0;
    }
    height += (group.length ? 28 : 0) + fragment.height;
    group.push(fragment);
  }
  if (group.length) groups.push(group);
  return groups.map((fragments, index) => ({ fragments, pageNumber: index + 1, totalPages: groups.length }));
}

export function getShareText(
  items: readonly ShareItem[],
  language: AppLanguage,
  content: ShareContentOptions,
  title: string,
  url?: string,
): string {
  return [
    title,
    ...items.map((item) =>
      [
        item.title,
        item.reminder
          ? t(language, "shareStudio.reminder")
          : getShareRepetitionLabel(item.repetitionCount ?? 1, language),
        ...getShareSections(item, content).map((section) =>
          section.key === "arabic" ? section.text : `${t(language, `shareStudio.${section.key}`)}\n${section.text}`,
        ),
        item.readingUrl,
      ]
        .filter(Boolean)
        .join("\n\n"),
    ),
    url,
  ]
    .filter(Boolean)
    .join("\n\n────────\n\n");
}

export function getShareUrl(
  category: string,
  index?: number,
  baseUrl?: string,
  context?: { routineMode?: RoutineMode; prayer?: PrayerName },
): string {
  const base = baseUrl ?? new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const url = new URL(base);
  const params = new URLSearchParams();
  if (context?.routineMode) params.set("mode", context.routineMode);
  if (category === "after_prayer" && context?.prayer) params.set("prayer", context.prayer);
  url.hash = `/azkar/${encodeURIComponent(category.replace(/_/gu, "-"))}${index === undefined ? "" : `/${index + 1}`}${params.size ? `?${params}` : ""}`;
  return url.toString();
}
