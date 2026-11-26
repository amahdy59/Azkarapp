export interface QuranReadingWord {
  id: string;
  text: string;
  verseKey?: string;
  endAyah?: string;
  glyph?: string;
  fontFamily?: string;
}

/** Half-open ranges preserve every reviewed word exactly once, including markers. */
export function paginateQuranWords(
  boxes: readonly { top: number; bottom: number }[],
  height: number,
): [number, number][] {
  if (!boxes.length) return [];
  const portions: [number, number][] = [];
  let start = 0;
  for (let index = 1; index < boxes.length; index += 1) {
    if (boxes[index]!.bottom - boxes[start]!.top > height && boxes[index]!.top > boxes[index - 1]!.top + 1) {
      portions.push([start, index]);
      start = index;
    }
  }
  portions.push([start, boxes.length]);
  return portions;
}

export function portionForWord(portions: readonly [number, number][], word: number): number {
  return Math.max(
    0,
    portions.findIndex(([start, end]) => word >= start && word < end),
  );
}

/** Whitespace stays with its word; joining these tokens reconstructs the source. */
export function readingWordsFromText(text: string): QuranReadingWord[] {
  return [...text.matchAll(/\s*\S+\s*/gu)].map((match) => ({ id: String(match.index), text: match[0] }));
}

export function readingWordsFromMushaf(
  words: readonly {
    verseKey: string;
    position: number;
    text: string;
    isEnd: number;
    qcfCode?: string;
    pageNumber?: number;
  }[],
  page: number,
  glyphs: boolean,
): QuranReadingWord[] {
  return words.map((word) => ({
    id: `${word.verseKey}:${word.position}`,
    text: word.text,
    verseKey: word.verseKey,
    endAyah: word.isEnd ? word.verseKey.split(":")[1] : undefined,
    glyph: glyphs ? word.qcfCode : undefined,
    fontFamily: `qcf-v2-page-${word.pageNumber ?? page}`,
  }));
}
