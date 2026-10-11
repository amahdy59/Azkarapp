import type { MushafWordToken } from "../components/MushafPageViewer";
import type { ListeningWordTiming } from "../audio/listeningTimings";

/** Explicit canonical identities; mixed supplications and partial verses are excluded. */
export const MUSHAF_EXCERPTS: Readonly<Record<string, { page: number; from: string; to: string }>> = {
  "quran-002-255": { page: 42, from: "2:255", to: "2:255" },
  "quran-002-285-286": { page: 49, from: "2:285", to: "2:286" },
  "quran-109": { page: 603, from: "109:1", to: "109:6" },
  "quran-112": { page: 604, from: "112:1", to: "112:4" },
  "quran-113": { page: 604, from: "113:1", to: "113:5" },
  "quran-114": { page: 604, from: "114:1", to: "114:6" },
};

/** Explicit existing evidence citations, located in the shipped QCF v2 page data. */
export const QURAN_EVIDENCE_EXCERPTS: typeof MUSHAF_EXCERPTS = {
  "quran-13-28": { page: 252, from: "13:28", to: "13:28" },
  "quran-2-152": { page: 23, from: "2:152", to: "2:152" },
  "quran-33-35": { page: 422, from: "33:35", to: "33:35" },
  "quran-62-10": { page: 554, from: "62:10", to: "62:10" },
  "quran-8-45": { page: 182, from: "8:45", to: "8:45" },
  "quran-3-191": { page: 75, from: "3:191", to: "3:191" },
  "quran-33-41": { page: 423, from: "33:41", to: "33:41" },
  "wird-quran-33-41": { page: 423, from: "33:41", to: "33:42" },
  "wird-quran-7-205": { page: 176, from: "7:205", to: "7:205" },
  "wird-quran-20-130": { page: 321, from: "20:130", to: "20:130" },
  "wird-quran-70-23": { page: 569, from: "70:22", to: "70:23" },
  "wird-quran-24-37": { page: 355, from: "24:37", to: "24:37" },
  "wird-quran-57-16": { page: 539, from: "57:16", to: "57:16" },
};

export function selectMushafExcerpt(lines: MushafWordToken[][], from: string, to: string) {
  const [surah, first] = from.split(":").map(Number);
  const last = Number(to.split(":")[1]);
  return lines
    .map((line) =>
      line.filter((word) => {
        const [s, ayah] = word.verseKey.split(":").map(Number);
        return s === surah && ayah! >= first! && ayah! <= last;
      }),
    )
    .filter((line) => line.length);
}

// Display mapping only: the timing hook still validates the exact original transcript hash.
// As in word-meaning lookup, canonical Uthmani and Unicode forms may differ in marks/wasla.
const letters = (text: string) =>
  text
    .replace(/[ئؤ]/g, "ء")
    .normalize("NFKD")
    .replace(/(?!ٰ)\p{M}/gu, "")
    .replace(/وٰ/g, "ا")
    .replace(/([^اى])ٰ/gu, "$1ا")
    .replace(/\p{M}|ـ|ء|[ۥۦ]/gu, "")
    .replace(/ٱ/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/^الليل$/, "اليل")
    .replace(/[^\p{L}\p{N}]/gu, "");
export function excerptWordMapping(lines: MushafWordToken[][], transcript: string, allowQuotation = false) {
  const words = lines.flat().filter((word) => !word.isEnd);
  const tokens = [...transcript.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)].filter((token) =>
    /\p{L}/u.test(token[0]),
  );
  if (!tokens.length) return null;
  // Uthmani joins the vocative يا أيها into one word glyph. Match consecutive
  // source tokens without changing their original offsets or semantic text.
  const matchAt = (start: number) => {
    const mapping: { startOffset: number; endOffset: number; word: MushafWordToken }[] = [];
    let tokenIndex = 0;
    let wordIndex = start;
    while (tokenIndex < tokens.length) {
      const word = words[wordIndex++];
      if (!word) return null;
      const target = letters(word.text);
      const first = tokens[tokenIndex]!;
      let normalized = "";
      let last: typeof first;
      do {
        last = tokens[tokenIndex++]!;
        normalized += letters(last[0]);
        if (!target.startsWith(normalized)) return null;
      } while (normalized !== target && tokenIndex < tokens.length);
      if (normalized !== target) return null;
      mapping.push({ startOffset: first.index, endOffset: last.index + last[0].length, word });
    }
    return !allowQuotation && wordIndex !== words.length ? null : mapping;
  };
  if (!allowQuotation) return matchAt(0);
  const matches = words.flatMap((_, start) => {
    const mapping = matchAt(start);
    return mapping ? [mapping] : [];
  });
  return matches.length === 1 ? matches[0]! : null;
}

export function excerptActiveWord(
  mapping: NonNullable<ReturnType<typeof excerptWordMapping>>,
  cue: ListeningWordTiming | null,
) {
  const word =
    cue && mapping.find((token) => token.startOffset === cue.startOffset && token.endOffset === cue.endOffset)?.word;
  return word ? { verseKey: word.verseKey, position: word.position } : null;
}
