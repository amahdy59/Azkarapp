/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Copy, X } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, Zikr } from "../types";
import { getLocalizedSourceReference } from "../content/localizedZikr";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { HadithWeakChainBadge } from "./ZikrComponents";

/**
 * The hadith is the only copyable value here. Everything else in this sheet is
 * either a name, a one-line summary, or a citation the reader can read at a
 * glance — a copy affordance beside each of those was five buttons competing
 * for attention with the text they belonged to.
 */
type ReferenceCopyKey = "hadith";

function ReferenceContent({
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
  const copyFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isArabic = language === "ar";
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
      onAnnouncement(t(language, "reader.copyError"));
    }
  };

  const renderCopyButton = (key: ReferenceCopyKey, value: string, label: string) => (
    <button
      type="button"
      onClick={() => void copyReference(key, value)}
      aria-label={label}
      className="flex h-[48px] w-[48px] min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
    >
      {copiedReference === key ? <Check size={16} className="favorite-pop text-primary" /> : <Copy size={16} />}
    </button>
  );

  return (
    <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/40 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div aria-hidden="true" className="text-lg font-extrabold leading-snug text-foreground">
            {t(language, "reader.referencesButton")}
          </div>
          <p id="reader-reference-description" className="sr-only">
            {t(language, "reader.referenceTitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "reader.closeReference")}
          className="flex h-[48px] w-[48px] min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div
        role="region"
        aria-label={t(language, "reader.referencesButton")}
        className="reference-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        tabIndex={0}
        dir={direction}
      >
        <div className="reference-sheet-content flex flex-col pb-4">
          {zikr.hadithText && (
            <section aria-labelledby="reference-evidence-heading">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3
                  id="reference-evidence-heading"
                  className="flex items-center gap-2 text-subtitle font-extrabold text-primary"
                >
                  {t(language, "reader.hadithLabel")}
                  {zikr.authenticityLevel === "weak" && <HadithWeakChainBadge language={language} />}
                </h3>
                {renderCopyButton("hadith", zikr.hadithText, t(language, "reader.copyHadith"))}
              </div>
              {/* The hadith is Arabic in both interface languages — it is the
                  narration itself, not supporting copy — so it is always marked
                  `lang="ar"` and laid out right-to-left. Leaving it unmarked in
                  English had screen readers pronouncing Arabic with an English
                  voice. */}
              <p
                data-testid="reference-hadith"
                className="zikr-text text-start text-base font-medium leading-8 text-foreground"
                lang="ar"
                dir="rtl"
              >
                {zikr.hadithText}
              </p>
            </section>
          )}
          <section className="mt-4 border-t border-border/50 pt-3" aria-labelledby="reference-source-heading">
            <h3 id="reference-source-heading" className="mb-2 text-subtitle font-extrabold text-primary">
              {t(language, "reader.sourceLabel")}
            </h3>
            <p
              data-testid="reference-source"
              className="text-start text-sm font-semibold leading-relaxed text-muted-foreground"
              lang={isArabic ? "ar" : "en"}
              dir={direction}
            >
              {sourceReference}
            </p>
          </section>
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
  if (!open || !zikr) return null;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "reader.referencesButton")}
      direction={direction}
      testId="reference-sheet"
      describedById="reader-reference-description"
      // `.reference-sheet` carries the sheet height rules in ReaderScreen.css.
      drawerClassName="reference-sheet"
    >
      <ReferenceContent
        zikr={zikr}
        language={language}
        direction={direction}
        onClose={onClose}
        onAnnouncement={onAnnouncement}
      />
    </ResponsiveSheet>
  );
}
