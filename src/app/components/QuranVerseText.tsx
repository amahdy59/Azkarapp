import { Fragment } from "react";
import type { AppLanguage } from "../types";
import { AyahMarker } from "./AyahMarker";
import { useQuranSnippet } from "../hooks/useQuranSnippet";

export type QuranSnippet = NonNullable<ReturnType<typeof useQuranSnippet>>;

/** Replace only verified word offsets; semantic text and all intervening characters stay intact. */
export function QuranGlyphSlice({
  text,
  offset = 0,
  snippet,
  language,
  preserveLines = false,
}: {
  text: string;
  offset?: number;
  snippet: QuranSnippet;
  language: AppLanguage;
  preserveLines?: boolean;
}) {
  let cursor = 0;
  const pieces = snippet.mapping.filter((word) => word.startOffset >= offset && word.endOffset <= offset + text.length);
  const lineStarts = new Set(
    snippet.lines
      .slice(1)
      .map((line) => line.find((word) => !word.isEnd))
      .filter(Boolean),
  );
  return (
    <>
      {pieces.map((entry) => {
        const start = entry.startOffset - offset;
        const end = entry.endOffset - offset;
        const before = text.slice(cursor, start);
        cursor = end;
        return (
          <Fragment key={entry.startOffset}>
            <UnicodeVerseText text={before} language={language} snippet={snippet} />
            {preserveLines && lineStarts.has(entry.word) && <br />}
            <span
              style={{
                fontFamily: snippet.fontFamily,
                display: "inline-block",
                position: "relative",
                whiteSpace: "nowrap",
              }}
              data-quran-glyph=""
            >
              <span aria-hidden="true" className="select-none">
                {entry.word.qcfCode}
              </span>
              <span className="sr-only">{text.slice(start, end)}</span>
            </span>
          </Fragment>
        );
      })}
      <UnicodeVerseText text={text.slice(cursor)} language={language} snippet={snippet} />
    </>
  );
}

export function QuranVerseText({
  text,
  language,
  canonicalKey,
  preserveLines = false,
}: {
  text: string;
  language: AppLanguage;
  canonicalKey?: string;
  preserveLines?: boolean;
}) {
  const snippet = useQuranSnippet(text, canonicalKey);
  return snippet ? (
    <QuranGlyphSlice text={text} snippet={snippet} language={language} preserveLines={preserveLines} />
  ) : (
    <UnicodeVerseText text={text} language={language} />
  );
}

/** Only explicit reviewed numeric verse markers become ornaments; text stays exact. */
function UnicodeVerseText({
  text,
  language,
  snippet,
}: {
  text: string;
  language: AppLanguage;
  snippet?: QuranSnippet;
}) {
  // The verified QCF word already paints its Mushaf pause sign. Keep the
  // source sign semantic without painting it a second time between glyphs.
  const gap = (value: string) =>
    snippet
      ? value.split(/([ۖۗۘۙۚۛۜ])/u).map((part, index) =>
          /^[ۖۗۘۙۚۛۜ]$/u.test(part) ? (
            <span className="sr-only" key={index}>
              {part}
            </span>
          ) : (
            part
          ),
        )
      : value;
  const markers = [...text.matchAll(/﴿([٠-٩0-9]+)﴾/gu)];
  let offset = 0;
  return (
    <>
      {markers.map((marker) => {
        const before = text.slice(offset, marker.index);
        offset = marker.index + marker[0].length;
        const number = marker[1]!.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
        const glyph = snippet?.lines
          .flat()
          .find((word) => word.isEnd && word.verseKey.split(":")[1] === number)?.qcfCode;
        return (
          <Fragment key={marker.index}>
            {gap(before)}
            <span aria-hidden="true">
              {glyph ? (
                <span style={{ fontFamily: snippet!.fontFamily }} className="select-none">
                  {glyph}
                </span>
              ) : (
                <AyahMarker number={number} language={language} />
              )}
            </span>
            <span className="sr-only">{marker[0]}</span>
          </Fragment>
        );
      })}
      {gap(text.slice(offset))}
    </>
  );
}
