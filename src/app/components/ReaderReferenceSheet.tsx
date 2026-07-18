import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { ScrollArea } from "./ui/scroll-area";

type ReferenceCopyKey = "translation" | "transliteration" | "hadith";

export function ReaderReferenceSheet({
  zikr,
  language,
  direction,
  onClose,
  onAnnouncement,
}: {
  zikr: Zikr;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  onAnnouncement: (message: string) => void;
}) {
  const [copiedReference, setCopiedReference] = useState<ReferenceCopyKey | null>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = sheetRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusableElements?.length) {
        return;
      }

      const first = focusableElements.item(0);
      const last = focusableElements.item(focusableElements.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      if (copyFeedbackTimer.current) {
        clearTimeout(copyFeedbackTimer.current);
      }
      previouslyFocused?.focus();
    };
  }, [onClose]);

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
        className="absolute -top-1.5 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ insetInlineStart: -6 }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors">
          {copiedReference === key ? <Check size={16} /> : <Copy size={16} />}
        </span>
      </button>
    </div>
  );

  return (
    <div className="scrim-in fixed inset-0 z-50 flex items-end justify-center bg-black/45">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label={t(language, "reader.closeReference")}
      />
      <section
        ref={sheetRef}
        role="dialog"
        data-testid="reference-sheet"
        aria-modal="true"
        aria-label={t(language, "reader.referencesButton")}
        className="reference-sheet sheet-enter relative flex w-full max-w-[390px] flex-col overflow-hidden rounded-t-[20px] bg-background shadow-[0_-12px_32px_rgba(0,0,0,0.4)]"
        dir={direction}
      >
        <div className="relative z-10 flex h-16 shrink-0 items-end justify-center bg-background px-6 pb-3">
          <span className="h-1 w-8 rounded-full bg-muted-foreground" aria-hidden="true" />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(language, "reader.closeReference")}
            className="absolute top-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ insetInlineEnd: 12 }}
          >
            <X size={18} />
          </button>
        </div>
        <ScrollArea className="reference-scroll min-h-0 flex-1 overscroll-contain" dir={direction}>
          <div className="reference-sheet-content flex flex-col gap-4 px-6">
            <div className="rounded-xl bg-muted px-2 py-4">
              <p className="zikr-text text-center text-[1.125rem] leading-7 text-muted-foreground" dir="rtl" lang="ar">
                {zikr.arabicText}
              </p>
            </div>

            <section className="flex flex-col gap-4">
              <h2 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                {t(language, "reader.translationLabel")}
              </h2>
              <p className="latin-ui text-left text-[1.125rem] leading-[1.5] text-foreground" lang="en" dir="ltr">
                {zikr.translation}
              </p>
              {copyAction("translation", zikr.translation, t(language, "reader.copyTranslation"), "ltr")}
            </section>

            <div className="h-px w-full bg-foreground/10" aria-hidden="true" />

            <section className="flex flex-col gap-4">
              <h2 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                {t(language, "reader.transliterationLabel")}
              </h2>
              <p className="latin-ui text-left text-[1.125rem] leading-[1.5] text-muted-foreground" lang="en" dir="ltr">
                {zikr.transliteration}
              </p>
              {copyAction("transliteration", zikr.transliteration, t(language, "reader.copyTransliteration"), "ltr")}
            </section>

            {zikr.hadithText && (
              <>
                <div className="h-px w-full bg-foreground/10" aria-hidden="true" />
                <section className="flex flex-col gap-3">
                  <h2 className="text-start text-[0.875rem] font-semibold tracking-[0.02em] text-muted-foreground">
                    {t(language, "reader.hadithLabel")}
                  </h2>
                  <p
                    className="zikr-text text-right text-[1.125rem] leading-[1.6] text-muted-foreground"
                    lang="ar"
                    dir="rtl"
                  >
                    {zikr.hadithText}
                  </p>
                  {copyAction("hadith", zikr.hadithText, t(language, "reader.copyHadith"), "rtl")}
                </section>
              </>
            )}

            <div className="flex justify-end">
              <span
                className="latin-ui max-w-full rounded-full bg-muted px-2.5 py-1.5 text-right text-[0.6875rem] font-semibold leading-4 text-muted-foreground"
                lang="en"
                dir="ltr"
                title={zikr.sourceReference}
              >
                {zikr.sourceReference}
              </span>
            </div>
          </div>
        </ScrollArea>
      </section>
    </div>
  );
}
