import type { MushafWordToken } from "../components/MushafPageViewer";
import type { ListeningWordTiming } from "../audio/listeningTimings";

/** Explicit canonical identities; mixed supplications and partial verses are excluded. */
export const MUSHAF_EXCERPTS: Readonly<Record<string, { page: number; endPage?: number; from: string; to: string }>> = {
  "quran-002-255": { page: 42, from: "2:255", to: "2:255" },
  "quran-002-285-286": { page: 49, from: "2:285", to: "2:286" },
  "quran-109": { page: 603, from: "109:1", to: "109:6" },
  "quran-112": { page: 604, from: "112:1", to: "112:4" },
  "quran-113": { page: 604, from: "113:1", to: "113:5" },
  "quran-114": { page: 604, from: "114:1", to: "114:6" },
  "quran-003-190-200": { page: 75, endPage: 76, from: "3:190", to: "3:200" },
};

/** Explicit existing evidence citations, located in the shipped QCF v2 page data. */
export const QURAN_EVIDENCE_EXCERPTS: typeof MUSHAF_EXCERPTS = {
  // Owner-approved display of the existing dhikr quotation, not the entire ayah.
  "quran-009-129-excerpt": { page: 207, from: "9:129", to: "9:129" },
  "home-quran-Q01": { page: 95, from: "4:103", to: "4:103" },
  "home-quran-Q02": { page: 401, from: "29:45", to: "29:45" },
  "home-quran-Q03": { page: 290, from: "17:78", to: "17:78" },
  "home-quran-Q04": { page: 423, from: "33:41", to: "33:42" },
  "home-quran-Q05": { page: 406, from: "30:17", to: "30:18" },
  "home-quran-Q06": { page: 23, from: "2:152", to: "2:152" },
  "home-quran-Q07": { page: 252, from: "13:28", to: "13:28" },
  "home-quran-Q08": { page: 39, from: "2:238", to: "2:238" },
  "home-quran-Q09": { page: 520, from: "50:39", to: "50:40" },
  "home-quran-Q10": { page: 321, from: "20:130", to: "20:130" },
  "home-quran-Q11": { page: 234, from: "11:114", to: "11:114" },
  "home-quran-Q12": { page: 290, from: "17:79", to: "17:79" },
  "home-quran-Q13": { page: 365, from: "25:64", to: "25:64" },
  "home-quran-Q14": { page: 575, from: "73:20", to: "73:20" },
  "home-quran-Q15": { page: 75, from: "3:190", to: "3:191" },
  "home-quran-Q16": { page: 42, from: "2:255", to: "2:255" },
  "home-quran-Q17": { page: 49, from: "2:285", to: "2:286" },
  "home-quran-Q18": { page: 554, from: "62:9", to: "62:10" },
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
    // Uthmani إِلَـٰه and the reviewed dhikr إِلَه share the same word.
    .replace(/^الاه$/, "اله")
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
