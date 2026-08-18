import { Fragment, type CSSProperties } from "react";
import type { QuranWordMeaning, WordMeaningSelection } from "../content/quranWordMeanings";
import { splitMushafPages } from "../content/mushafPages";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { QuranWordText } from "./QuranWordText";
import { QuranPrelude } from "./QuranChrome";

export function MushafPageReader({
  zikr,
  arabicText,
  meanings,
  language,
  textStyle,
  onSelectMeanings,
  flat = false,
}: {
  zikr: Zikr;
  arabicText: string;
  meanings: readonly QuranWordMeaning[];
  language: AppLanguage;
  textStyle: CSSProperties;
  onSelectMeanings: (selection: WordMeaningSelection) => void;
  /**
   * When the reader already wraps the whole reading column in its own card
   * (the wide-desktop reader), each page's own border/shadow/radius nests a
   * card inside a card. `flat` drops that per-page surface in favor of a
   * plain divider, letting the outer card carry all the elevation. Mobile
   * has no outer card, so it keeps the default per-page surface.
   */
  flat?: boolean;
}) {
  const pages = splitMushafPages(arabicText, zikr.mushafPages ?? []);
  if (pages.length === 0) return null;

  return (
    <div className={flat ? "max-w-2xl mx-auto" : "max-w-2xl mx-auto space-y-5"} data-testid="mushaf-pages">
      {pages.map((page, index) => {
        const headingId = `mushaf-page-${zikr.id}-${page.page}`;
        const pageNumber = formatNumerals(page.page, language);
        const startAyah = formatNumerals(page.startAyah, language);
        const endAyah = formatNumerals(page.endAyah, language);

        return (
          <Fragment key={page.page}>
            <section
              aria-labelledby={headingId}
              className={
                flat
                  ? "px-1 py-3"
                  : "rounded-3xl border border-border/60 bg-card px-4 py-5 shadow-raised sm:px-6 sm:py-6"
              }
              data-testid="mushaf-page"
              data-mushaf-page={page.page}
            >
              <header
                className={`flex items-center justify-between gap-3 pb-3 ${flat ? "mb-3" : "mb-4 border-b border-border/50"}`}
              >
                <h2 id={headingId} className="text-[0.8125rem] font-extrabold text-foreground">
                  {t(language, "reader.mushafPage", { page: pageNumber })}
                </h2>
                <span className="text-[0.75rem] font-bold text-muted-foreground">
                  {t(language, "reader.mushafPageRange", { start: startAyah, end: endAyah })}
                </span>
              </header>

              {index === 0 && <QuranPrelude zikr={zikr} className="pointer-events-none mb-6" />}

              <QuranWordText
                text={page.text}
                meanings={meanings}
                language={language}
                style={{ ...textStyle, textAlign: "justify", textAlignLast: "center" }}
                onSelectMeanings={onSelectMeanings}
              />
            </section>

            {index < pages.length - 1 && (
              <div
                role="separator"
                aria-label={t(language, "reader.mushafPageEnd", { page: pageNumber })}
                className="flex items-center gap-3 px-2 text-muted-foreground"
                data-testid="mushaf-page-separator"
              >
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
                <span className="text-[0.6875rem] font-bold" aria-hidden="true">
                  {pageNumber}
                </span>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
