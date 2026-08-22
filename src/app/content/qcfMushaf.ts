export type MushafWordTuple = [
  position: number,
  lineNumber: number,
  isEnd: number,
  semanticText: string,
  qcfCode?: string,
];

export interface MushafVerseData {
  k: string;
  w: MushafWordTuple[];
}

interface QcfWord {
  position?: unknown;
  line_number?: unknown;
  char_type_name?: unknown;
  text_qpc_hafs?: unknown;
  text_uthmani_simple?: unknown;
  code_v2?: unknown;
}

interface QcfVerse {
  verse_key?: unknown;
  words?: unknown;
}

const QCF_API_ROOT = "https://api.quran.com/api/v4";
const QCF_FONT_ROOT = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2";

export function getQcfPageUrl(page: number) {
  return `${QCF_API_ROOT}/verses/by_page/${page}?words=true&word_fields=code_v2,text_qpc_hafs,text_uthmani_simple&per_page=50`;
}

export function getQcfFontUrl(page: number) {
  return `${QCF_FONT_ROOT}/p${page}.woff2`;
}

export function getQcfFontFamily(page: number) {
  return `qcf-v2-page-${page}`;
}

export function parseQcfPageResponse(value: unknown): MushafVerseData[] | null {
  if (!value || typeof value !== "object") return null;
  const verses = (value as { verses?: unknown }).verses;
  if (!Array.isArray(verses) || verses.length === 0) return null;

  const parsed: MushafVerseData[] = [];
  for (const rawVerse of verses as QcfVerse[]) {
    if (typeof rawVerse.verse_key !== "string" || !Array.isArray(rawVerse.words)) return null;
    const words: MushafWordTuple[] = [];

    for (const rawWord of rawVerse.words as QcfWord[]) {
      const semanticText =
        typeof rawWord.text_qpc_hafs === "string"
          ? rawWord.text_qpc_hafs
          : typeof rawWord.text_uthmani_simple === "string"
            ? rawWord.text_uthmani_simple
            : "";
      if (
        typeof rawWord.position !== "number" ||
        typeof rawWord.line_number !== "number" ||
        !semanticText ||
        typeof rawWord.code_v2 !== "string"
      ) {
        return null;
      }

      words.push([
        rawWord.position,
        rawWord.line_number,
        rawWord.char_type_name === "end" ? 1 : 0,
        semanticText,
        rawWord.code_v2,
      ]);
    }

    parsed.push({ k: rawVerse.verse_key, w: words });
  }

  return parsed;
}

export function mergeQcfPage(localPage: MushafVerseData[], qcfPage: MushafVerseData[]): MushafVerseData[] {
  const qcfWords = new Map<string, MushafWordTuple>();
  for (const verse of qcfPage) {
    for (const word of verse.w) qcfWords.set(`${verse.k}:${word[0]}`, word);
  }

  return localPage.map((verse) => ({
    k: verse.k,
    w: verse.w.map((word) => {
      const qcfWord = qcfWords.get(`${verse.k}:${word[0]}`);
      if (!qcfWord?.[4]) return word;
      return [word[0], qcfWord[1], word[2], word[3], qcfWord[4]];
    }),
  }));
}

export async function fetchQcfPage(page: number, signal: AbortSignal) {
  const response = await fetch(getQcfPageUrl(page), { signal });
  if (!response.ok) throw new Error(`QCF page request failed with HTTP ${response.status}`);
  const parsed = parseQcfPageResponse(await response.json());
  if (!parsed) throw new Error("QCF page response did not match the expected schema");
  return parsed;
}
