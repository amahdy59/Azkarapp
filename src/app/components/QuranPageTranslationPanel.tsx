import { useEffect, useMemo, useState } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, TextSizeOption } from "../types";
import { loadPageEnglishTranslation, type QuranPageVerseTranslation } from "../content/quranTranslations";
import { QuranTranslationText } from "./QuranTranslationText";
import { getJuzNumberForPage } from "../content/surahInfo";

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
  const [retry, setRetry] = useState(0);
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
  }, [pageNumber, verses, retry]);

  return (
    <section
      aria-label={t(language, "quranListening.pageTranslation")}
      dir="ltr"
      className={`quran-page-meaning ${className}`}
    >
      <header className="mushaf-page-furniture quran-meaning-header" dir="ltr">
        <div className="quran-meaning-heading" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
          <h2
            className="text-base font-semibold text-foreground"
            lang={language}
            dir={language === "ar" ? "rtl" : "ltr"}
          >
            {surahName}
          </h2>
          <p className="quran-meaning-metadata text-sm text-muted-foreground">
            <span>
              {t(language, "mushaf.juzLabel", { juz: formatNumerals(getJuzNumberForPage(pageNumber), language) })}
            </span>
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
        <div
          role="status"
          className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center text-sm text-muted-foreground"
        >
          <p>{t(language, "quranListening.translationUnavailable")}</p>
          <button
            type="button"
            onClick={() => setRetry((value) => value + 1)}
            className="min-h-11 rounded-lg px-4 text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language, "mushaf.retry")}
          </button>
        </div>
      )}

      <footer className="mushaf-page-furniture mushaf-page-furniture--foot quran-meaning-footer" dir="ltr">
        <span className="text-sm text-muted-foreground font-medium" lang="en" dir="ltr">
          <bdi lang="en">Saheeh International</bdi>
        </span>
        <span
          className="quran-meaning-page text-sm text-muted-foreground"
          lang={language}
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
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
