import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseMushafPage, type MushafVerseData } from "./qcfMushaf";

/**
 * Invariants of the shipped 604-page layout.
 *
 * These would have caught DEC-090 at the desk. The generator had taken the line
 * numbers and glyphs from the QCF v2 reference but left the verse-to-page
 * assignment from another edition, so page 121 printed verse 5:77 *after* 5:83
 * — in page 120's glyphs, which page 121's font cannot draw. Every check here
 * is local: no network, no font, just the ordering and completeness that a
 * printed Mushaf cannot violate.
 */

const PAGE_COUNT = 604;
const PAGE_DIRECTORY = path.resolve("public/data/mushaf");

function verseOrder(verseKey: string) {
  const [surah, ayah] = verseKey.split(":").map(Number);
  return (surah ?? 0) * 1000 + (ayah ?? 0);
}

const pages: MushafVerseData[][] = [];
for (let page = 1; page <= PAGE_COUNT; page += 1) {
  const raw = readFileSync(path.join(PAGE_DIRECTORY, `${page}.json`), "utf8");
  const parsed = parseMushafPage(JSON.parse(raw));
  if (!parsed) throw new Error(`page ${page} does not match the shipped page shape`);
  pages.push(parsed);
}

describe("shipped Mushaf page data", () => {
  it("parses every page against the runtime's own reader", () => {
    expect(pages).toHaveLength(PAGE_COUNT);
  });

  it("gives every word a line on the fifteen-line grid and a glyph to draw it", () => {
    const offGrid: string[] = [];
    const glyphless: string[] = [];

    pages.forEach((verses, index) => {
      for (const verse of verses) {
        for (const word of verse.w) {
          if (word[1] < 1 || word[1] > 15) offGrid.push(`page ${index + 1} ${verse.k}:${word[0]} line ${word[1]}`);
          if (!word[4]) glyphless.push(`page ${index + 1} ${verse.k}:${word[0]}`);
          expect(word[3].length).toBeGreaterThan(0);
        }
      }
    });

    expect(offGrid).toEqual([]);
    expect(glyphless).toEqual([]);
  });

  it("reads forwards — verses and words never go backwards on a page", () => {
    const backwards: string[] = [];

    pages.forEach((verses, index) => {
      for (let v = 1; v < verses.length; v += 1) {
        if (verseOrder(verses[v]!.k) <= verseOrder(verses[v - 1]!.k)) {
          backwards.push(`page ${index + 1}: ${verses[v - 1]!.k} then ${verses[v]!.k}`);
        }
      }
      for (const verse of verses) {
        for (let w = 1; w < verse.w.length; w += 1) {
          if (verse.w[w]![0] <= verse.w[w - 1]![0]) {
            backwards.push(`page ${index + 1} ${verse.k}: position ${verse.w[w - 1]![0]} then ${verse.w[w]![0]}`);
          }
        }
      }
    });

    expect(backwards).toEqual([]);
  });

  /**
   * The check that would have caught DEC-090. Walking a page in reading order —
   * verses ascending, words ascending within each — the line number may never
   * step backwards. The old data broke this 1714 times: page 121 put verse 5:77
   * on lines 13-15 and verses 5:78-5:83 on lines 1-12, so the reader printed
   * 5:77 after 5:83. Verse order in the file was perfectly fine, which is why a
   * weaker ordering check missed it entirely.
   */
  it("never steps back up the page while reading down it", () => {
    const backwards: string[] = [];

    pages.forEach((verses, index) => {
      let line = 0;
      let previous = "";
      for (const verse of verses) {
        for (const word of verse.w) {
          if (word[1] < line) {
            backwards.push(
              `page ${index + 1}: ${previous} on line ${line}, then ${verse.k}:${word[0]} on line ${word[1]}`,
            );
          }
          line = Math.max(line, word[1]);
          previous = `${verse.k}:${word[0]}`;
        }
      }
    });

    expect(backwards).toEqual([]);
  });

  it("reads forwards across page turns", () => {
    const backwards: string[] = [];

    for (let index = 1; index < pages.length; index += 1) {
      const previous = pages[index - 1]!.at(-1);
      const next = pages[index]![0];
      if (previous && next && verseOrder(next.k) < verseOrder(previous.k)) {
        backwards.push(`page ${index} ends at ${previous.k} but page ${index + 1} opens at ${next.k}`);
      }
    }

    expect(backwards).toEqual([]);
  });

  it("places every word exactly once, and leaves no gap inside a verse", () => {
    const positionsByVerse = new Map<string, Set<number>>();
    const duplicated: string[] = [];
    let words = 0;

    pages.forEach((verses, index) => {
      for (const verse of verses) {
        const seen = positionsByVerse.get(verse.k) ?? new Set<number>();
        for (const word of verse.w) {
          words += 1;
          if (seen.has(word[0])) duplicated.push(`${verse.k}:${word[0]} appears again on page ${index + 1}`);
          seen.add(word[0]);
        }
        positionsByVerse.set(verse.k, seen);
      }
    });

    // A verse split across a page turn keeps its positions whole between the
    // two pages: 1..n with nothing missing and nothing repeated.
    const broken: string[] = [];
    for (const [verseKey, positions] of positionsByVerse) {
      for (let position = 1; position <= positions.size; position += 1) {
        if (!positions.has(position)) broken.push(`${verseKey} is missing word ${position}`);
      }
    }

    expect(duplicated).toEqual([]);
    expect(broken).toEqual([]);
    expect(words).toBe(83665);
  });
});
