import { ExternalLink, Info, BookOpen, X } from "./icons";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { ScrollArea } from "./ui/scroll-area";

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
        className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[390px] flex-col rounded-t-[1.75rem] bg-background outline-none focus-visible:outline-none max-h-[85vh] shadow-[0_-12px_36px_rgba(0,0,0,0.4)] border-t border-border/40"
        dir={direction}
      >
        <DrawerTitle className="sr-only">{t(language, "reader.wordMeaningTitle")}</DrawerTitle>

        {/* Top Sheet Drag Handle Bar */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25" aria-hidden="true" />
        </div>

        {/* Top Header */}
        <div className="relative flex min-h-12 shrink-0 items-center justify-between px-5 pb-2 pt-1 border-b border-border/40">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary shrink-0" aria-hidden="true" />
            <h2 className="text-[1.0625rem] font-bold text-foreground">{t(language, "reader.wordMeaningTitle")}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "reader.closeWordMeaning")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Main Content Area */}
        <ScrollArea className="min-h-0 flex-1 overscroll-contain" dir={direction}>
          {meanings && meanings.length > 0 && (
            <div className="flex flex-col gap-4 px-5 pb-6 pt-3">
              {meanings.map((meaning) => (
                <div key={meaning.id} className="flex flex-col gap-3">
                  {/* Featured Word & Ayah Header Card */}
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3.5 text-center">
                    <p className="zikr-text text-[1.25rem] font-bold leading-relaxed text-primary" lang="ar" dir="rtl">
                      {meaning.word}
                    </p>
                    <p className="mt-1 text-[0.75rem] font-semibold text-muted-foreground">
                      {t(language, "reader.ayahLabel", {
                        ayah: formatNumerals(meaning.ayahNumber, language),
                      })}
                    </p>
                  </div>

                  {/* Section Title with Accent Bar */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                      {t(language, "reader.wordMeaningLabel")}
                    </h3>
                  </div>

                  {/* Explanation Card */}
                  <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-muted/40 p-4 shadow-sm">
                    <p className="text-right text-[1rem] font-medium leading-8 text-foreground" lang="ar" dir="rtl">
                      {meaning.explanationArabic}
                    </p>
                  </div>
                </div>
              ))}

              {/* Reviewed Source Note */}
              <div className="flex items-start gap-2.5 px-1 py-1 text-[0.75rem] leading-5 text-muted-foreground">
                <Info size={15} className="mt-0.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
                <span id="quran-word-meaning-description">{t(language, "reader.wordMeaningArabicNote")}</span>
              </div>

              {/* Source Card Footer */}
              <a
                href={QURAN_WORD_MEANING_SOURCE.url}
                target="_blank"
                rel="noreferrer"
                className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs transition-all hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="min-w-0 flex-1 text-start">
                  <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {t(language, "reader.sourceLabel")}
                  </span>
                  <span className="mt-0.5 block truncate text-[0.8125rem] font-semibold text-foreground leading-snug">
                    {sourceName}
                  </span>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <ExternalLink size={16} aria-hidden="true" />
                </div>
              </a>
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
