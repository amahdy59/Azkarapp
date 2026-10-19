import {
  MUSHAF_EXCERPTS,
  QURAN_EVIDENCE_EXCERPTS,
  excerptWordMapping,
  selectMushafExcerpt,
} from "../content/mushafExcerpts";
import { getQcfFontFamily, loadMushafPage, loadQcfFont } from "../content/qcfMushaf";
import type { MushafWordToken } from "../components/MushafPageViewer";

export interface QuranGlyphRendering {
  text: string;
  fontFamily: string;
  sourceOffsets?: number[];
}

/** Image-only drawing data. The original text remains the export/copy payload. */
export async function prepareQuranGlyphs(
  text: string,
  canonicalKey?: string,
): Promise<QuranGlyphRendering | undefined> {
  const range = canonicalKey ? (MUSHAF_EXCERPTS[canonicalKey] ?? QURAN_EVIDENCE_EXCERPTS[canonicalKey]) : undefined;
  // A single canvas font cannot paint glyph codes from two different pages.
  // Keep the complete, readable Unicode export until multi-font drawing is supported.
  if (!range || range.endPage || typeof FontFace === "undefined") return undefined;
  try {
    const data = await loadMushafPage(range.page);
    const lines: MushafWordToken[][] = Array.from({ length: 15 }, () => []);
    for (const verse of data)
      for (const [position, line, isEnd, word, qcfCode] of verse.w)
        lines[line - 1]!.push({ verseKey: verse.k, position, isEnd, text: word, qcfCode });
    const selected = selectMushafExcerpt(lines, range.from, range.to);
    const mapping = excerptWordMapping(selected, text, Boolean(canonicalKey && QURAN_EVIDENCE_EXCERPTS[canonicalKey]));
    if (!mapping || selected.flat().some((word) => !word.qcfCode)) return undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const ready = await Promise.race([
      loadQcfFont(range.page),
      new Promise<boolean>((resolve) => {
        timeout = setTimeout(() => resolve(false), 1800);
      }),
    ]).finally(() => clearTimeout(timeout));
    if (!ready) return undefined;
    let cursor = 0;
    let drawing = "";
    const sourceOffsets = [0];
    const append = (value: string, start: number, end: number) => {
      drawing += value;
      for (let index = 1; index <= value.length; index++) sourceOffsets.push(index === value.length ? end : start);
    };
    const appendSource = (start: number, end: number) => {
      for (let index = start; index < end; index++) {
        if (!/[ۖۗۘۙۚۛۜ]/u.test(text[index]!)) append(text[index]!, index, index + 1);
        else sourceOffsets[sourceOffsets.length - 1] = index + 1;
      }
    };
    for (const word of mapping) {
      appendSource(cursor, word.startOffset);
      append(word.word.qcfCode!, word.startOffset, word.endOffset);
      cursor = word.endOffset;
    }
    appendSource(cursor, text.length);
    // Replace verse markers from the end so the source offsets remain exact.
    for (const match of [...drawing.matchAll(/﴿([٠-٩0-9]+)﴾/gu)].reverse()) {
      const marker = match[0];
      const digits = match[1]!;
      const number = digits.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
      const code = selected.flat().find((word) => word.isEnd && word.verseKey.split(":")[1] === number)?.qcfCode;
      if (!code) continue;
      const start = match.index;
      const end = start + marker.length;
      drawing = drawing.slice(0, start) + code + drawing.slice(end);
      sourceOffsets.splice(
        start + 1,
        marker.length,
        ...Array.from({ length: code.length }, (_, i) => sourceOffsets[i === code.length - 1 ? end : start]!),
      );
    }
    return { text: drawing, fontFamily: `"${getQcfFontFamily(range.page)}", "Amiri Quran", serif`, sourceOffsets };
  } catch {
    return undefined;
  }
}
