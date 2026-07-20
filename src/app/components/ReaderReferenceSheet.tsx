import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { ScrollArea } from "./ui/scroll-area";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";
import { Drawer, DrawerContent, DrawerTitle } from "./ui/drawer";

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
  const benefit = getLocalizedZikrBenefit(zikr, language);
  const sourceReference = getLocalizedSourceReference(zikr, language);

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

  const copyAction = (key: ReferenceCopyKey, value: string, label: string, contentDirection: "ltr" | "rtl") => (
    <div className="relative h-8 w-full" dir={contentDirection}>
      <button
        type="button"
        onClick={() => void copyReference(key, value)}
        aria-label={label}
        className="absolute -top-1.5 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        style={{ insetInlineStart: -6 }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors">
          {copiedReference === key ? <Check size={16} className="favorite-pop text-primary" /> : <Copy size={16} />}
        </span>
      </button>
    </div>
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
        className="reference-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-[390px] flex-col rounded-t-3xl bg-background outline-none focus-visible:outline-none max-h-[85vh] shadow-[0_-12px_32px_rgba(0,0,0,0.4)]"
        dir={direction}
      >
        <DrawerTitle className="sr-only" id="reader-benefit-sheet-title">
          {t(language, "reader.referencesButton")}
        </DrawerTitle>
        <div className="relative z-10 flex min-h-12 shrink-0 items-center justify-center bg-background px-16 pb-2 pt-2">
          <h2 className="text-center text-[1.0625rem] font-bold text-foreground">
            {t(language, "reader.referencesButton")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(language, "reader.closeReference")}
            className="absolute top-1 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            style={{ insetInlineEnd: 12 }}
          >
            <X size={18} />
          </button>
        </div>
        <ScrollArea className="reference-scroll min-h-0 flex-1 overscroll-contain" dir={direction}>
          <div className="reference-sheet-content flex flex-col gap-4 px-6 pb-6 pt-2">
            {isArabic ? (
              <div className="rounded-xl bg-muted px-4 py-4">
                <p className="zikr-text text-center text-[1.125rem] leading-8 text-foreground" dir="rtl" lang="ar">
                  {zikr.arabicText}
                </p>
              </div>
            ) : (
              <>
                <section className="flex flex-col gap-4">
                  <h3 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                    {t(language, "reader.translationLabel")}
                  </h3>
                  <p className="latin-ui text-left text-[1.125rem] leading-[1.5] text-foreground" lang="en" dir="ltr">
                    {zikr.translation}
                  </p>
                  {copyAction("translation", zikr.translation, t(language, "reader.copyTranslation"), "ltr")}
                </section>

                <div className="h-px w-full bg-foreground/10" aria-hidden="true" />

                <section className="flex flex-col gap-4">
                  <h3 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                    {t(language, "reader.transliterationLabel")}
                  </h3>
                  <p
                    className="latin-ui text-left text-[1.125rem] leading-[1.5] text-muted-foreground"
                    lang="en"
                    dir="ltr"
                  >
                    {zikr.transliteration}
                  </p>
                  {copyAction(
                    "transliteration",
                    zikr.transliteration,
                    t(language, "reader.copyTransliteration"),
                    "ltr",
                  )}
                </section>
              </>
            )}

            <div className="h-px w-full bg-foreground/10" aria-hidden="true" />

            <section className="flex flex-col gap-3">
              <h3 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                {t(language, "reader.benefitLabel")}
              </h3>
              <p
                className="text-start text-[1.0625rem] leading-7 text-foreground"
                lang={isArabic ? "ar" : "en"}
                dir={direction}
              >
                {benefit}
              </p>
              {copyAction("benefit", benefit, t(language, "reader.copyBenefit"), direction)}
            </section>

            {isArabic && zikr.hadithText && (
              <>
                <div className="h-px w-full bg-foreground/10" aria-hidden="true" />
                <section className="flex flex-col gap-3">
                  <h3 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                    {t(language, "reader.evidence")}
                  </h3>
                  <p className="zikr-text text-right text-[1.125rem] leading-[1.8] text-foreground" lang="ar" dir="rtl">
                    {zikr.hadithText}
                  </p>
                  {copyAction("hadith", zikr.hadithText, t(language, "reader.copyHadith"), "rtl")}
                </section>
              </>
            )}

            <div className="h-px w-full bg-foreground/10" aria-hidden="true" />

            <section className="flex flex-col gap-3">
              <h3 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                {t(language, "reader.sourceLabel")}
              </h3>
              <p
                className="max-w-full rounded-xl bg-muted px-3 py-2.5 text-start text-[0.8125rem] font-semibold leading-5 text-muted-foreground"
                lang={isArabic ? "ar" : "en"}
                dir={direction}
              >
                {sourceReference}
              </p>
              {copyAction("source", sourceReference, t(language, "reader.copySource"), direction)}
            </section>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
