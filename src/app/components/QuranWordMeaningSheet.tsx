/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { ExternalLink, Info, BookOpen, X } from "./icons";
import { QURAN_WORD_MEANING_SOURCE, type QuranWordMeaning } from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { useLayoutMode } from "../hooks/useLayoutMode";
import { useEffect } from "react";

// ─── Shared content ───────────────────────────────────────────────────────────

function WordMeaningContent({
  meanings,
  language,
  direction,
  onClose,
  variant,
}: {
  meanings: QuranWordMeaning[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  variant: "sheet" | "dialog";
}) {
  const sourceName = language === "ar" ? QURAN_WORD_MEANING_SOURCE.nameArabic : QURAN_WORD_MEANING_SOURCE.nameEnglish;

  return (
    <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
      {/* Drag handle (sheet only) */}
      {variant === "sheet" && (
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[1.125rem] font-extrabold text-foreground leading-snug">
              {t(language, "reader.wordMeaningTitle")}
            </h2>
            <p className="text-[0.75rem] font-medium text-muted-foreground">
              {language === "ar" ? "معاني كلمات القرآن الكريمة" : "Quranic Word Meanings & Exegesis"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "reader.closeWordMeaning")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable main content */}
      <div
        role="region"
        aria-label={t(language, "reader.wordMeaningTitle")}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        tabIndex={0}
        dir={direction}
      >
        <div className="flex flex-col gap-5 pb-4">
          {meanings.map((meaning) => (
            <div key={meaning.id} className="flex flex-col gap-3">
              {/* Featured Word & Ayah Header Card */}
              <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center shadow-xs">
                <p
                  className="zikr-text text-[1.375rem] font-extrabold leading-relaxed text-primary"
                  lang="ar"
                  dir="rtl"
                >
                  {meaning.word}
                </p>
                <p className="mt-1 text-[0.8125rem] font-bold text-muted-foreground">
                  {t(language, "reader.ayahLabel", {
                    ayah: formatNumerals(meaning.ayahNumber, language),
                  })}
                </p>
              </div>

              {/* Exegesis & Meaning Card */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                  <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                    {t(language, "reader.wordMeaningTitle")}
                  </h3>
                </div>
                <p className="text-[1rem] leading-7 font-medium text-foreground" lang="ar" dir="rtl">
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
      </div>
    </div>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

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
  const layoutMode = useLayoutMode();
  const isOpen = Boolean(meanings?.length);
  const useDialog = layoutMode !== "compact";

  // Close on Escape when dialog is open
  useEffect(() => {
    if (!isOpen || !useDialog) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, useDialog, onClose]);

  if (!isOpen || !meanings) return null;

  // Medium+ → Desktop / Tablet Modal Dialog
  if (useDialog) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={t(language, "reader.wordMeaningTitle")}
        aria-describedby="quran-word-meaning-description"
        dir={direction}
        data-testid="quran-word-meaning-sheet"
        data-prevent-count="true"
      >
        {/* Backdrop button */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 border-none bg-black/60 backdrop-blur-md cursor-default animate-in fade-in-0 duration-200"
          onClick={onClose}
        />
        {/* Dialog card */}
        <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-border/60 bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <WordMeaningContent
            meanings={meanings}
            language={language}
            direction={direction}
            onClose={onClose}
            variant="dialog"
          />
        </div>
      </div>
    );
  }

  // Compact → Mobile Bottom Sheet (Vaul Drawer)
  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent
        data-testid="quran-word-meaning-sheet"
        data-prevent-count="true"
        aria-describedby="quran-word-meaning-description"
        className="fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-lg flex-col rounded-t-[1.75rem] bg-background outline-none focus-visible:outline-none max-h-[88vh] shadow-[0_-12px_36px_rgba(0,0,0,0.4)] border-t border-border/40 pb-safe"
        dir={direction}
      >
        <DrawerTitle className="sr-only">{t(language, "reader.wordMeaningTitle")}</DrawerTitle>
        <WordMeaningContent
          meanings={meanings}
          language={language}
          direction={direction}
          onClose={onClose}
          variant="sheet"
        />
      </DrawerContent>
    </Drawer>
  );
}
