import type { AppLanguage, ThemeMode, RoutineMode, PrayerName } from "../types";
import { t } from "../i18n";

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

export interface ShareSection {
  key: "arabic" | "translation" | "transliteration" | "benefit" | "source";
  text: string;
  direction: "rtl" | "ltr";
}
export interface ShareItem {
  id: string;
  arabicText: string;
  title?: string;
  translation?: string;
  transliteration?: string;
  benefit?: string;
  sourceReference?: string;
  repetitionCount?: number;
}
export interface ShareContentOptions {
  meaning?: boolean;
  pronunciation?: boolean;
  benefit?: boolean;
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

export function shareGeometry(format: ShareFormat): ShareGeometry {
  const height = SHARE_DIMENSIONS[format].height;
  const story = format === "story" || format === "tall";
  return {
    top: story ? 344 : 230,
    bottom: height - (story ? 400 : 180),
    footer: height - (story ? 354 : 144),
    titleY: story ? 174 : 74,
    titleSize: story ? 60 : 52,
    width: 952,
    textWidth: 856,
  };
}

export function defaultShareAppearance(category?: string, theme?: ThemeMode): ShareAppearance {
  if (category === "before_sleep") return "lavender";
  if (category === "evening") return "gold";
  return theme === "midnight" || theme === "dark" ? "gold" : "olive";
}

export function getShareSections(item: ShareItem, options: ShareContentOptions = {}): ShareSection[] {
  const sections: ShareSection[] = [{ key: "arabic", text: item.arabicText, direction: "rtl" }];
  if (options.meaning && item.translation?.trim())
    sections.push({ key: "translation", text: item.translation, direction: "ltr" });
  if (options.pronunciation && item.transliteration?.trim())
    sections.push({ key: "transliteration", text: item.transliteration, direction: "ltr" });
  if (options.benefit && item.benefit?.trim())
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
  return sections;
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
): MeasuredSection {
  const fontSize = section.key === "arabic" ? (single ? 64 : 52) : section.key === "source" ? 32 : 36;
  const lineHeight = Math.ceil(fontSize * (section.key === "arabic" ? 1.65 : 1.5));
  ctx.font = `${section.key === "arabic" ? 500 : 400} ${fontSize}px ${section.direction === "rtl" ? SHARE_ARABIC_FONT : SHARE_UI_FONT}`;
  const lines = wrapShareText(section.text, (value) => ctx.measureText(value).width, width);
  const labelHeight = section.key === "arabic" ? 0 : 44;
  return { ...section, lines, fontSize, lineHeight, height: lines.length * lineHeight + labelHeight };
}

/** Fit actual font measurements at a fixed readable size. Never trim a selected section. */
export function layoutSharePages(
  ctx: CanvasRenderingContext2D,
  items: readonly ShareItem[],
  format: ShareFormat,
  content: ShareContentOptions = {},
  single = false,
): ShareLayoutPage[] {
  const geometry = shareGeometry(format);
  const capacity = geometry.bottom - geometry.top;
  const sectionGap = 20;
  const fragments: ShareFragment[] = [];
  for (const item of items) {
    const measured = getShareSections(item, content).map((section) =>
      measureShareSection(ctx, section, single, geometry.textWidth),
    );
    const source = measured.find((section) => section.key === "source");
    // Repeat concise exact attribution on every continuation. An exceptionally
    // long reviewed citation continues as ordinary text rather than being clipped.
    const citation = source && source.height <= capacity / 4 ? source : undefined;
    const sections = measured.filter((section) => section !== citation);
    const overhead = 152 + (citation ? citation.height + 20 : 0);
    const itemFragments: ShareFragment[] = [];
    let fragment: ShareFragment = { item, sections: [], part: 1, parts: 1, height: overhead, citation };
    const finish = () => {
      if (fragment.sections.length) itemFragments.push(fragment);
      fragment = { item, sections: [], part: 1, parts: 1, height: overhead, citation };
    };
    for (const section of sections) {
      let offset = 0;
      while (offset < section.lines.length) {
        const labelHeight = section.key === "arabic" ? 0 : 44;
        const gap = fragment.sections.length ? sectionGap : 0;
        const count = Math.min(
          section.lines.length - offset,
          Math.floor((capacity - fragment.height - gap - labelHeight) / section.lineHeight),
        );
        if (count <= 0) {
          finish();
          continue;
        }
        const lines = section.lines.slice(offset, offset + count);
        const height = lines.length * section.lineHeight + labelHeight;
        fragment.sections.push({ ...section, text: lines.join(""), lines, height });
        fragment.height += gap + height;
        offset += count;
        if (offset < section.lines.length) finish();
      }
    }
    finish();
    itemFragments.forEach((part, index) => {
      part.part = index + 1;
      part.parts = itemFragments.length;
      fragments.push(part);
    });
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
        group.length >= maxItems ||
        height + gap + fragment.height > capacity ||
        fragment.parts > 1 ||
        group[0]!.parts > 1)
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
        t(language, "shareStudio.repetitions", {
          count: new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en").format(item.repetitionCount ?? 1),
        }),
        ...getShareSections(item, content).map((section) =>
          section.key === "arabic" ? section.text : `${t(language, `shareStudio.${section.key}`)}\n${section.text}`,
        ),
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
