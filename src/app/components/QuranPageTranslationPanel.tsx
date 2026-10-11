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
  onResumeFollowing?: () => void;
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
  onResumeFollowing,
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
      className={`quran-page-meaning ${className}`}
    >
      <header className="mushaf-page-furniture quran-meaning-header" dir="ltr">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
            {t(language, "quranListening.translation")}
          </h2>
          <p className="text-xs text-muted-foreground" dir="auto">
            {surahName} · {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
            {translatedVerses.length > 0 &&
              ` · ${t(language, "quranListening.verseRange", { first: translatedVerses[0]!.marker, last: translatedVerses.at(-1)!.marker })}`}
          </p>
        </div>
      </header>

      {loading ? (
        <div role="status" className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
          {t(language, "common.loading")}…
        </div>
      ) : translations && translations.length > 0 ? (
        <QuranTranslationText
          verses={translatedVerses}
          activeVerseKey={activeVerseKey}
          follow={follow}
          pageNumber={pageNumber}
          textSize={textSize}
          variant="page"
          label={t(language, "quranListening.translationForPage", { page: formatNumerals(pageNumber, language) })}
          onManualBrowse={onManualBrowse}
        />
      ) : (
        <p className="flex flex-1 items-center justify-center py-8 text-center text-sm text-muted-foreground">
          {t(language, "quranListening.translationUnavailable")}
        </p>
      )}

      <footer className="mushaf-page-furniture mushaf-page-furniture--foot quran-meaning-footer" dir="ltr">
        <span className="text-xs text-muted-foreground font-medium" lang="en" dir="ltr">
          Saheeh International
        </span>
        {onResumeFollowing && !follow && (
          <button
            type="button"
            className="quran-meaning-resume"
            onClick={onResumeFollowing}
            lang={language}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {t(language, "quranListening.resumeFollowing")}
          </button>
        )}
      </footer>
    </section>
  );
}
