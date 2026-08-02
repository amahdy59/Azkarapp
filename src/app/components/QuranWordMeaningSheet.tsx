import { ExternalLink, X } from "./icons";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";

export function QuranWordMeaningSheet({
  meanings,
  language,
  direction,
  onClose,
}: {
  meanings: QuranWordMeaning[] | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
}) {
  const sourceName = language === "ar" ? QURAN_WORD_MEANING_SOURCE.nameArabic : QURAN_WORD_MEANING_SOURCE.nameEnglish;

  return (
    <Drawer
      open={Boolean(meanings?.length)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent
        data-testid="quran-word-meaning-sheet"
        data-prevent-count="true"
        aria-describedby="quran-word-meaning-description"
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[390px] flex-col rounded-t-3xl bg-background outline-none shadow-[0_-12px_32px_rgba(0,0,0,0.4)]"
        dir={direction}
      >
        <DrawerTitle className="sr-only">{t(language, "reader.wordMeaningTitle")}</DrawerTitle>
        <div className="relative flex min-h-14 shrink-0 items-center justify-center px-16 pb-2 pt-3">
          <h2 className="text-center text-[1.0625rem] font-bold text-foreground">
            {t(language, "reader.wordMeaningTitle")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "reader.closeWordMeaning")}
            className="absolute top-2 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            style={{ insetInlineEnd: 12 }}
          >
            <X size={18} />
          </button>
        </div>

        {meanings && meanings.length > 0 && (
          <div className="space-y-4 px-6 pb-7 pt-2">
            {meanings.map((meaning) => (
              <section key={meaning.id} className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-4">
                <div className="text-center">
                  <p className="zikr-text text-[1.75rem] font-bold leading-[1.8] text-primary" lang="ar" dir="rtl">
                    {meaning.word}
                  </p>
                  <p className="mt-1 text-[0.8125rem] font-semibold text-muted-foreground">
                    {t(language, "reader.ayahLabel", {
                      ayah: formatNumerals(meaning.ayahNumber, language),
                    })}
                  </p>
                </div>
                <h3 className="mt-4 text-start text-[0.8125rem] font-bold text-muted-foreground">
                  {t(language, "reader.wordMeaningLabel")}
                </h3>
                <p
                  className="mt-2 text-right text-[1.125rem] font-semibold leading-8 text-foreground"
                  lang="ar"
                  dir="rtl"
                >
                  {meaning.explanationArabic}
                </p>
              </section>
            ))}

            <p
              id="quran-word-meaning-description"
              className="text-start text-[0.75rem] leading-5 text-muted-foreground"
            >
              {t(language, "reader.wordMeaningArabicNote")}
            </p>

            <a
              href={QURAN_WORD_MEANING_SOURCE.url}
              target="_blank"
              rel="noreferrer"
              className="interactive-elem ui-control flex min-h-11 items-center justify-between gap-3 rounded-xl border border-border-control bg-card px-3.5 py-2.5 text-start text-[0.8125rem] font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span>
                <span className="block text-[0.6875rem] font-bold uppercase tracking-wide text-muted-foreground">
                  {t(language, "reader.sourceLabel")}
                </span>
                <span className="mt-0.5 block leading-5">{sourceName}</span>
              </span>
              <ExternalLink className="shrink-0 text-primary" size={18} aria-hidden="true" />
            </a>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
