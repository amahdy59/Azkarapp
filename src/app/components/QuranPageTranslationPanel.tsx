import { useEffect, useMemo, useState } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, TextSizeOption } from "../types";
import { loadPageEnglishTranslation, type QuranPageVerseTranslation } from "../content/quranTranslations";
import { QuranTranslationText } from "./QuranTranslationText";

export interface QuranPageTranslationPanelProps {
  pageNumber: number;
  surahName: string;
  verses: ReadonlyArray<{ k: string }>;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  className?: string;
  activeVerseKey?: string | null;
  follow?: boolean;
  textSize?: TextSizeOption;
  onManualBrowse?: () => void;
}

export function QuranPageTranslationPanel({
  pageNumber,
  surahName,
  verses,
  language,
  direction: _direction = "ltr",
  className = "",
  activeVerseKey = null,
  follow = false,
  textSize = "medium",
  onManualBrowse,
}: QuranPageTranslationPanelProps) {
  const [translations, setTranslations] = useState<QuranPageVerseTranslation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const translatedVerses = useMemo(
    () =>
      (translations ?? []).map((item) => ({
        verseKey: item.verseKey,
        text: item.text,
        marker: String(item.ayahNumber),
      })),
    [translations],
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setTranslations(null);

    void loadPageEnglishTranslation(verses)
      .then((data) => {
        if (!active) return;
        setTranslations(data);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setTranslations([]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pageNumber, verses]);

  return (
    <section
      aria-label={t(language, "quranListening.pageTranslation")}
      dir="ltr"
      lang="en"
      className={`quran-page-meaning ${className}`}
    >
      <header className="quran-meaning-header">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t(language, "quranListening.translation")}
          </span>
          <span className="text-xs text-muted-foreground">· {surahName}</span>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
        </span>
      </header>

      {loading ? (
        <div role="status" className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          {t(language, "common.loading")}…
        </div>
      ) : translations && translations.length > 0 ? (
        <QuranTranslationText
          verses={translatedVerses}
          activeVerseKey={activeVerseKey}
          follow={follow}
          pageNumber={pageNumber}
          textSize={textSize}
          label={t(language, "quranListening.translationForPage", { page: formatNumerals(pageNumber, language) })}
          onManualBrowse={onManualBrowse}
        />
      ) : (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {t(language, "quranListening.translationUnavailable")}
        </p>
      )}
      <p className="shrink-0 px-3 py-2 text-xs text-muted-foreground" lang="en" dir="ltr">
        Saheeh International
      </p>
    </section>
  );
}
