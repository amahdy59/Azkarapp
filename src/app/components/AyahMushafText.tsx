import { useListeningMushafPage } from "../hooks/useListeningMushafPage";
import { getQcfFontFamily } from "../content/qcfMushaf";
import { matchAyahMushafWords } from "../share/ayahMushafRendering";
import { QuranGlyphSlice } from "./QuranVerseText";
import type { AppLanguage } from "../types";
import { t } from "../i18n";

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
  const { result, error } = useListeningMushafPage(pageNumber ?? 0, 0, Boolean(pageNumber));
  if (pageNumber && !result && !error)
    return (
      <span role="status" aria-busy="true">
        {t(language, "common.loading")}
      </span>
    );
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
