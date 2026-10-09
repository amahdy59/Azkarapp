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
    .normalize("NFKD")
    .replace(/\p{M}|ـ/gu, "")
    .replace(/ٱ/g, "ا")
    .trim();
export function excerptWordMapping(lines: MushafWordToken[][], transcript: string) {
  const words = lines.flat().filter((word) => !word.isEnd);
  const tokens = [...transcript.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)].filter((token) =>
    /\p{L}/u.test(token[0]),
  );
  if (tokens.length !== words.length || tokens.some((token, i) => letters(token[0]) !== letters(words[i]!.text)))
    return null;
  return tokens.map((token, i) => ({
    startOffset: token.index,
    endOffset: token.index + token[0].length,
    word: words[i]!,
  }));
}

export function excerptActiveWord(
  mapping: NonNullable<ReturnType<typeof excerptWordMapping>>,
  cue: ListeningWordTiming | null,
) {
  const word =
    cue && mapping.find((token) => token.startOffset === cue.startOffset && token.endOffset === cue.endOffset)?.word;
  return word ? { verseKey: word.verseKey, position: word.position } : null;
}
