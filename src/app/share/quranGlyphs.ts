import { MUSHAF_EXCERPTS, excerptWordMapping, selectMushafExcerpt } from "../content/mushafExcerpts";
import { getQcfFontFamily, loadMushafPage, loadQcfFont } from "../content/qcfMushaf";
import type { MushafWordToken } from "../components/MushafPageViewer";

export interface QuranGlyphRendering {
  text: string;
  fontFamily: string;
}

/** Image-only drawing data. The original text remains the export/copy payload. */
export async function prepareQuranGlyphs(
  text: string,
  canonicalKey?: string,
): Promise<QuranGlyphRendering | undefined> {
  const range = canonicalKey ? MUSHAF_EXCERPTS[canonicalKey] : undefined;
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
    const mapping = excerptWordMapping(selected, text);
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
    for (const word of mapping) {
      drawing += text.slice(cursor, word.startOffset).replace(/[ۖۗۘۙۚۛۜ]/gu, "") + word.word.qcfCode;
      cursor = word.endOffset;
    }
    drawing += text.slice(cursor).replace(/[ۖۗۘۙۚۛۜ]/gu, "");
    drawing = drawing.replace(/﴿([٠-٩0-9]+)﴾/gu, (marker, digits: string) => {
      const number = digits.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
      return selected.flat().find((word) => word.isEnd && word.verseKey.split(":")[1] === number)?.qcfCode ?? marker;
    });
    return { text: drawing, fontFamily: `"${getQcfFontFamily(range.page)}", "Amiri Quran", serif` };
  } catch {
    return undefined;
  }
}
