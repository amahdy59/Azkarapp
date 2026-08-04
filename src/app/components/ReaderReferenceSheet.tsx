import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Copy, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { ScrollArea } from "./ui/scroll-area";
import {
  getLocalizedPreferredTiming,
  getLocalizedSourceReference,
  getLocalizedZikrBenefit,
} from "../content/localizedZikr";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { FormattedBenefit } from "./FormattedBenefit";

type ReferenceCopyKey = "translation" | "transliteration" | "benefit" | "hadith" | "source";

export function ReaderReferenceSheet({
  open,
  zikr,
  language,
  direction,
  onClose,
  onAnnouncement,
}: {
  open: boolean;
  zikr: Zikr;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  onAnnouncement: (message: string) => void;
}) {
  const [copiedReference, setCopiedReference] = useState<ReferenceCopyKey | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isArabic = language === "ar";
  const sourceReference = getLocalizedSourceReference(zikr, language);
  const benefit = getLocalizedZikrBenefit(zikr, language);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimer.current) {
        clearTimeout(copyFeedbackTimer.current);
      }
    };
  }, []);

  const copyReference = async (key: ReferenceCopyKey, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedReference(key);
      onAnnouncement(t(language, "reader.referenceCopied"));
      if (copyFeedbackTimer.current) {
        clearTimeout(copyFeedbackTimer.current);
      }
      copyFeedbackTimer.current = setTimeout(() => {
        setCopiedReference(null);
        onAnnouncement("");
      }, 1600);
    } catch {
      setCopiedReference(null);
    }
  };

  const renderCopyButton = (key: ReferenceCopyKey, value: string, label: string) => (
    <button
      type="button"
      onClick={() => void copyReference(key, value)}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {copiedReference === key ? <Check size={16} className="favorite-pop text-primary" /> : <Copy size={16} />}
    </button>
  );

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DrawerContent
        data-testid="reference-sheet"
        ref={sheetRef}
        aria-describedby={undefined}
        className="reference-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[390px] flex-col rounded-t-[1.75rem] bg-background outline-none focus-visible:outline-none max-h-[85vh] shadow-[0_-12px_36px_rgba(0,0,0,0.4)] border-t border-border/40"
        dir={direction}
      >
        <DrawerTitle className="sr-only" id="reader-benefit-sheet-title">
          {t(language, "reader.referencesButton")}
        </DrawerTitle>

        {/* Top Sheet Drag Handle Bar */}
        <div className="flex shrink-0 justify-center pt-2.5 pb-1">
          <div className="h-1.5 w-10 rounded-full bg-muted-foreground/25" aria-hidden="true" />
        </div>

        {/* Top Header */}
        <div className="relative flex min-h-12 shrink-0 items-center justify-between px-5 pb-2 pt-1 border-b border-border/40">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary shrink-0" aria-hidden="true" />
            <h2 className="text-[1.0625rem] font-bold text-foreground">{t(language, "reader.referencesButton")}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(language, "reader.closeReference")}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Main Content Area */}
        <ScrollArea className="reference-scroll min-h-0 flex-1 overscroll-contain" dir={direction}>
          <div className="reference-sheet-content flex flex-col gap-4 px-5 pb-6 pt-3">
            {/* Arabic Zikr Card Header */}
            {isArabic ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3.5 text-center">
                <p className="zikr-text text-[1.1875rem] font-bold leading-relaxed text-primary" dir="rtl" lang="ar">
                  {zikr.arabicText}
                </p>
              </div>
            ) : (
              <>
                {/* English Translation Section */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                      <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                        {t(language, "reader.translationLabel")}
                      </h3>
                    </div>
                    {renderCopyButton("translation", zikr.translation, t(language, "reader.copyTranslation"))}
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-muted/40 p-4 shadow-sm">
                    <p className="latin-ui text-left text-[1rem] leading-relaxed text-foreground" lang="en" dir="ltr">
                      {zikr.translation}
                    </p>
                  </div>
                </div>

                {/* Transliteration Section */}
                {zikr.transliteration && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                        <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                          {t(language, "reader.transliterationLabel")}
                        </h3>
                      </div>
                      {renderCopyButton(
                        "transliteration",
                        zikr.transliteration,
                        t(language, "reader.copyTransliteration"),
                      )}
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-muted/40 p-4 shadow-sm">
                      <p
                        className="latin-ui text-left text-[0.9375rem] leading-relaxed text-muted-foreground"
                        lang="en"
                        dir="ltr"
                      >
                        {zikr.transliteration}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Benefit Section */}
            {benefit && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                      {t(language, "reader.benefitLabel")}
                    </h3>
                  </div>
                  {renderCopyButton("benefit", benefit, t(language, "reader.copyBenefit"))}
                </div>
                <FormattedBenefit text={benefit} isArabic={isArabic} direction={direction} />
              </div>
            )}

            {/* Evidence / Hadith Section */}
            {zikr.hadithText && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                      {t(language, "reader.evidence")}
                    </h3>
                  </div>
                  {renderCopyButton("hadith", zikr.hadithText, t(language, "reader.copyHadith"))}
                </div>
                <div className="rounded-2xl border border-border/50 bg-card/80 dark:bg-muted/40 p-4 shadow-sm">
                  <p
                    className="zikr-text text-right text-[1rem] font-medium leading-8 text-foreground"
                    lang={isArabic ? "ar" : undefined}
                    dir={isArabic ? "rtl" : undefined}
                  >
                    {zikr.hadithText}
                  </p>
                </div>
              </div>
            )}

            {/* Recommended Timing & Guidance */}
            {getLocalizedPreferredTiming(zikr, language) && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-1 rounded-full bg-amber-500" aria-hidden="true" />
                  <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-amber-600 dark:text-amber-400">
                    {isArabic ? "وقت الاستحباب والهدى النبوي" : "Recommended Timing & Guidance"}
                  </h3>
                </div>
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p
                    className="text-start text-[0.875rem] font-semibold leading-relaxed text-amber-950 dark:text-amber-200"
                    lang={isArabic ? "ar" : "en"}
                    dir={direction}
                  >
                    {getLocalizedPreferredTiming(zikr, language)}
                  </p>
                </div>
              </div>
            )}

            {/* Source Reference Footer Card */}
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-1 rounded-full bg-primary" aria-hidden="true" />
                <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                  {t(language, "reader.sourceLabel")}
                </h3>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs">
                <div className="min-w-0 flex-1 text-start">
                  <span className="block text-[0.6875rem] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {t(language, "reader.sourceLabel")}
                  </span>
                  <span
                    className="mt-0.5 block text-[0.8125rem] font-semibold text-foreground leading-snug"
                    lang={isArabic ? "ar" : "en"}
                    dir={direction}
                  >
                    {sourceReference}
                  </span>
                </div>
                {renderCopyButton("source", sourceReference, t(language, "reader.copySource"))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
