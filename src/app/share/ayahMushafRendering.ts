import { getQcfFontFamily, loadMushafPage, loadQcfFont } from "../content/qcfMushaf";
import { excerptWordMapping } from "../content/mushafExcerpts";
import type { MushafWordToken } from "../components/MushafPageViewer";

export function matchAyahMushafWords(text: string, verseKey: string, words: MushafWordToken[]) {
  const ordered = words.filter((word) => word.verseKey === verseKey).sort((a, b) => a.position - b.position);
  if (!ordered.length || ordered[0]!.position !== 1 || !ordered.at(-1)!.isEnd || ordered.some((word) => !word.qcfCode))
    return null;
  const mapping = excerptWordMapping([ordered], text);
  return mapping ? { lines: [ordered], mapping } : null;
}

/** Use the same verified page font as the Mushaf; never substitute a partial ayah. */
export async function prepareAyahMushafRendering(text: string, verseKey: string, pageNumber?: number) {
  if (!pageNumber || typeof FontFace === "undefined") return undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const page = await loadMushafPage(pageNumber);
    const words = page.flatMap((verse) =>
      verse.w.map(([position, , isEnd, word, qcfCode]) => ({
        verseKey: verse.k,
        position,
        isEnd,
        text: word,
        qcfCode,
      })),
    );
    const matched = matchAyahMushafWords(text, verseKey, words);
    if (!matched) return undefined;
    const ready = await Promise.race([
      loadQcfFont(pageNumber),
      new Promise<boolean>((resolve) => {
        timer = setTimeout(() => resolve(false), 1800);
      }),
    ]);
    if (!ready) return undefined;
    return {
      text: matched.lines[0]!.map((word) => word.qcfCode).join(" "),
      fontFamily: `"${getQcfFontFamily(pageNumber)}", "Amiri Quran", serif`,
    };
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}
