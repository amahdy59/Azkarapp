import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { getQcfFontFamily } from "../content/qcfMushaf";
import { matchAyahMushafWords } from "../share/ayahMushafRendering";
import { QuranGlyphSlice } from "./QuranVerseText";
import type { AppLanguage } from "../types";

export function AyahMushafText({
  text,
  verseKey,
  pageNumber,
  language,
}: {
  text: string;
  verseKey: string;
  pageNumber?: number;
  language: AppLanguage;
}) {
  const { result } = useListeningMushafPage(pageNumber ?? 0, 0, Boolean(pageNumber));
  const matched = result?.qcf ? matchAyahMushafWords(text, verseKey, result.lines.flat()) : null;
  return matched && pageNumber ? (
    <QuranGlyphSlice
      text={text}
      language={language}
      snippet={{ ...matched, fontFamily: getQcfFontFamily(pageNumber) }}
    />
  ) : (
    <>{text}</>
  );
}
