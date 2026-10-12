import { Fragment, type HTMLAttributes } from "react";
import { getQcfFontFamily } from "../content/qcfMushaf";
import type { AppLanguage } from "../types";
import { AyahMarker } from "./AyahMarker";
import { useQuranSnippet } from "../hooks/useQuranSnippet";

export type QuranSnippet = NonNullable<ReturnType<typeof useQuranSnippet>>;
export type QuranWordAttributes = (start: number, end: number) => HTMLAttributes<HTMLSpanElement>;

/** Replace only verified word offsets; semantic text and all intervening characters stay intact. */
export function QuranGlyphSlice({
  text,
  offset = 0,
  snippet,
  language,
  preserveLines = false,
  wordAttributes,
}: {
  text: string;
  offset?: number;
  snippet: QuranSnippet;
  language: AppLanguage;
  preserveLines?: boolean;
  wordAttributes?: QuranWordAttributes;
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
        const attributes = wordAttributes?.(entry.startOffset, entry.endOffset);
        return (
          <Fragment key={entry.startOffset}>
            <UnicodeVerseText text={before} language={language} snippet={snippet} />
            {preserveLines && lineStarts.has(entry.word) && <br />}
            <span
              {...attributes}
              data-quran-word=""
              style={{
                ...attributes?.style,
                fontFamily: entry.word.pageNumber ? getQcfFontFamily(entry.word.pageNumber) : snippet.fontFamily,
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
  wordAttributes,
}: {
  text: string;
  language: AppLanguage;
  canonicalKey?: string;
  preserveLines?: boolean;
  wordAttributes?: QuranWordAttributes;
}) {
  const snippet = useQuranSnippet(text, canonicalKey);
  return snippet ? (
    <QuranGlyphSlice
      text={text}
      snippet={snippet}
      language={language}
      preserveLines={preserveLines}
      wordAttributes={wordAttributes}
    />
  ) : (
    <UnicodeVerseText text={text} language={language} wordAttributes={wordAttributes} />
  );
}

/** Only explicit reviewed numeric verse markers become ornaments; text stays exact. */
function UnicodeVerseText({
  text,
  language,
  snippet,
  wordAttributes,
}: {
  text: string;
  language: AppLanguage;
  snippet?: QuranSnippet;
  wordAttributes?: QuranWordAttributes;
}) {
  // The verified QCF word already paints its Mushaf pause sign. Keep the
  // source sign semantic without painting it a second time between glyphs.
  const gap = (value: string, base = 0) =>
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
      : (() => {
          let cursor = base;
          return value.split(/(\S+)/u).map((part) => {
            const start = cursor;
            cursor += part.length;
            return /\S/u.test(part) ? (
              <span key={start} {...wordAttributes?.(start, cursor)} data-quran-word="">
                {part}
              </span>
            ) : (
              part
            );
          });
        })();
  const markers = [...text.matchAll(/﴿([٠-٩0-9]+)﴾/gu)];
  let offset = 0;
  return (
    <>
      {markers.map((marker) => {
        const beforeStart = offset;
        const before = text.slice(offset, marker.index);
        offset = marker.index + marker[0].length;
        const number = marker[1]!.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
        const glyph = snippet?.lines.flat().find((word) => word.isEnd && word.verseKey.split(":")[1] === number);
        return (
          <Fragment key={marker.index}>
            {gap(before, beforeStart)}
            <span aria-hidden="true" data-quran-ayah={number}>
              {glyph ? (
                <span
                  style={{ fontFamily: glyph.pageNumber ? getQcfFontFamily(glyph.pageNumber) : snippet!.fontFamily }}
                  className="select-none"
                >
                  {glyph.qcfCode}
                </span>
              ) : (
                <AyahMarker number={number} language={language} />
              )}
            </span>
            <span className="sr-only">{marker[0]}</span>
          </Fragment>
        );
      })}
      {gap(text.slice(offset), offset)}
    </>
  );
}
