/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Copy, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import {
  getLocalizedPreferredTiming,
  getLocalizedSourceReference,
  getLocalizedZikrBenefit,
} from "../content/localizedZikr";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";
import { FormattedBenefit } from "./FormattedBenefit";
import { useLayoutMode } from "../hooks/useLayoutMode";

type ReferenceCopyKey = "translation" | "transliteration" | "benefit" | "hadith" | "source";

function ReferenceContent({
  zikr,
  language,
  direction,
  onClose,
  onAnnouncement,
  variant,
}: {
  zikr: Zikr;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  onAnnouncement: (message: string) => void;
  variant: "sheet" | "dialog";
}) {
  const [copiedReference, setCopiedReference] = useState<ReferenceCopyKey | null>(null);
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
      className="flex h-[48px] w-[48px] min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      {copiedReference === key ? <Check size={16} className="favorite-pop text-primary" /> : <Copy size={16} />}
    </button>
  );

  return (
    <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
      {/* Top Drag Handle (sheet only) */}
      {variant === "sheet" && (
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        </div>
      )}

      {/* Top Header */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-[1.125rem] font-extrabold text-foreground leading-snug">
              {t(language, "reader.referencesButton")}
            </h2>
            <p className="text-[0.75rem] font-medium text-muted-foreground">
              {isArabic ? "الأدلة والفوائد والتخريج" : "Evidence, Benefits & Sources"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "reader.closeReference")}
          className="flex h-[48px] w-[48px] min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Main Content Area */}
      <div
        role="region"
        aria-label={t(language, "reader.referencesButton")}
        className="reference-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        tabIndex={0}
        dir={direction}
      >
        <div className="reference-sheet-content flex flex-col gap-4 pb-4">
          {/* Arabic Zikr Card Header */}
          {isArabic ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-center shadow-xs">
              <p className="zikr-text text-[1.25rem] font-bold leading-relaxed text-primary" dir="rtl" lang="ar">
                {zikr.arabicText}
              </p>
            </div>
          ) : (
            <>
              {/* English Translation Section */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                    <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                      {t(language, "reader.translationLabel")}
                    </h3>
                  </div>
                  {renderCopyButton("translation", zikr.translation, t(language, "reader.copyTranslation"))}
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
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
                      <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
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
                  <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
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
                  <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
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
                  <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
                  <h3 className="text-[0.8125rem] font-bold tracking-wide uppercase text-muted-foreground">
                    {t(language, "reader.evidence")}
                  </h3>
                </div>
                {renderCopyButton("hadith", zikr.hadithText, t(language, "reader.copyHadith"))}
              </div>
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-xs">
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
                <span className="h-4 w-1 rounded-full bg-amber-500" aria-hidden="true" />
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
              <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
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
      </div>
    </div>
  );
}

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
  const layoutMode = useLayoutMode();
  const useDialog = layoutMode !== "compact";

  // Close on Escape when dialog is open
  useEffect(() => {
    if (!open || !useDialog) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, useDialog, onClose]);

  if (!open || !zikr) return null;

  // Medium+ → Desktop / Tablet Modal Dialog
  if (useDialog) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label={t(language, "reader.referencesButton")}
        dir={direction}
        data-testid="reference-sheet"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="fixed inset-0 border-none bg-black/60 backdrop-blur-md cursor-default animate-in fade-in-0 duration-200"
          onClick={onClose}
        />
        <div className="relative z-10 flex flex-col w-full max-w-2xl max-h-[85vh] rounded-3xl border border-border/60 bg-card shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
          <ReferenceContent
            zikr={zikr}
            language={language}
            direction={direction}
            onClose={onClose}
            onAnnouncement={onAnnouncement}
            variant="dialog"
          />
        </div>
      </div>
    );
  }

  // Compact → Mobile Bottom Sheet (Vaul Drawer)
  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DrawerContent
        data-testid="reference-sheet"
        aria-describedby={undefined}
        className="reference-sheet fixed inset-x-0 bottom-0 z-[100] mx-auto flex w-full max-w-lg flex-col rounded-t-[1.75rem] bg-background outline-none focus-visible:outline-none max-h-[88vh] shadow-2xl border-t border-border/40 pb-safe"
        dir={direction}
      >
        <DrawerTitle className="sr-only">{t(language, "reader.referencesButton")}</DrawerTitle>
        <ReferenceContent
          zikr={zikr}
          language={language}
          direction={direction}
          onClose={onClose}
          onAnnouncement={onAnnouncement}
          variant="sheet"
        />
      </DrawerContent>
    </Drawer>
  );
}
