/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Clock, Copy, X } from "./icons";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage, Zikr } from "../types";
import {
  getLocalizedPreferredTiming,
  getLocalizedSourceReference,
  getLocalizedZikrBenefit,
} from "../content/localizedZikr";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { FormattedBenefit } from "./FormattedBenefit";
import { useLayoutMode } from "../hooks/useLayoutMode";

/**
 * The hadith is the only copyable value here. Everything else in this sheet is
 * either a name, a one-line summary, or a citation the reader can read at a
 * glance — a copy affordance beside each of those was five buttons competing
 * for attention with the text they belonged to.
 */
type ReferenceCopyKey = "hadith";

/** Longest zikr opening shown in the identity pill before it is elided. */
const ZIKR_LABEL_MAX_CHARS = 42;

/**
 * Names the zikr instead of reprinting it.
 *
 * The sheet used to open with the zikr's full text — the same words the reader
 * had just been looking at, pushing the evidence it exists to serve below the
 * fold and needing its own show-more control. A surah keeps its name and verse
 * range; anything else is identified by its opening words, elided to a single
 * line.
 */
function getZikrLabel(zikr: Zikr, language: AppLanguage): string {
  const isArabic = language === "ar";
  const surahName = isArabic ? zikr.surahNameArabic : zikr.surahNameEnglish;
  if (surahName?.trim()) {
    // Ayat al-Kursi and friends carry a parenthetical in the name itself, so
    // "سورة" would double up; only prefix a bare surah name.
    const hasQualifier = surahName.includes("(");
    const name = hasQualifier ? surahName.trim() : isArabic ? `سورة ${surahName.trim()}` : `Surah ${surahName.trim()}`;
    // A range only says something when there is more than one verse — Ayat
    // al-Kursi carries verseCount 1 and would otherwise read "verses 1-1".
    if (!zikr.verseCount || zikr.verseCount < 2) return name;
    const verses = isArabic ? `الآيات ١-${formatNumerals(zikr.verseCount, language)}` : `verses 1-${zikr.verseCount}`;
    return `${name} • ${verses}`;
  }

  const source = (isArabic ? zikr.arabicText : zikr.translation).replace(/\s+/g, " ").trim();
  if (source.length <= ZIKR_LABEL_MAX_CHARS) return source;
  // Cut on a word boundary so the ellipsis never lands mid-word.
  const clipped = source.slice(0, ZIKR_LABEL_MAX_CHARS);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 16 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

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
  const preferredTiming = getLocalizedPreferredTiming(zikr, language);
  const zikrLabel = getZikrLabel(zikr, language);

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
            <div
              aria-hidden="true"
              className="block max-w-full truncate whitespace-nowrap text-[1.125rem] font-extrabold leading-snug text-foreground"
            >
              {t(language, "reader.referencesButton")}
            </div>
            <p id="reader-reference-description" className="text-[0.75rem] font-medium text-muted-foreground">
              {t(language, "reader.referenceTitle")}
            </p>
          </div>
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

      {/* Scrollable Main Content Area */}
      <div
        role="region"
        aria-label={t(language, "reader.referencesButton")}
        className="reference-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        tabIndex={0}
        dir={direction}
      >
        <div className="reference-sheet-content flex flex-col pb-4">
          {/* Identity, not a reprint. A surah keeps its name and verse range;
              anything else is named by its opening words on a single line. The
              sheet used to open with the zikr in full, which pushed the
              evidence it exists to serve below the fold. */}
          <div className="flex justify-center pb-1">
            <span
              data-testid="reference-zikr-label"
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/40 px-4 py-2 text-[0.875rem] font-bold text-primary"
              dir={direction}
              lang={isArabic ? "ar" : "en"}
              title={zikrLabel}
            >
              <BookOpen size={15} aria-hidden="true" className="shrink-0" />
              <span className="truncate">{zikrLabel}</span>
            </span>
          </div>

          {/* One benefit category, timing included.
              The timing used to be its own section headed "recommended time and
              prophetic guidance" — which named the benefit a second time. It is
              the same thought as the benefit and now sits inside it, marked by
              a clock rather than a second heading. */}
          {(benefit || preferredTiming) && (
            <section className="border-t border-border/50 pt-4" aria-labelledby="reference-benefit-heading">
              {/* The sheet's own accessible title is already "Benefit" (it is
                  named after the button that opens it), so this heading takes
                  the longer name to stay distinguishable in a heading list. */}
              <h3
                id="reference-benefit-heading"
                aria-label={t(language, "reader.benefitDetails")}
                className="mb-2 text-[0.9375rem] font-extrabold text-primary"
              >
                {t(language, "reader.benefitLabel")}
              </h3>
              {benefit && <FormattedBenefit text={benefit} isArabic={isArabic} direction={direction} />}
              {preferredTiming && (
                <p
                  data-testid="reference-timing"
                  className="mt-2.5 flex items-start gap-2 text-[0.875rem] font-medium leading-relaxed text-muted-foreground"
                  lang={isArabic ? "ar" : "en"}
                  dir={direction}
                >
                  <Clock size={15} aria-hidden="true" className="mt-1 shrink-0" />
                  <span>
                    <span className="sr-only">{t(language, "reader.recommendedTime")}: </span>
                    {preferredTiming}
                  </span>
                </p>
              )}
            </section>
          )}

          {/* The evidence, in full, and the sheet's only copy target. */}
          {zikr.hadithText && (
            <section className="mt-4 border-t border-border/50 pt-4" aria-labelledby="reference-evidence-heading">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 id="reference-evidence-heading" className="text-[0.9375rem] font-extrabold text-primary">
                  {t(language, "reader.evidence")}
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
                className="zikr-text text-start text-[1rem] font-medium leading-8 text-foreground"
                lang="ar"
                dir="rtl"
              >
                {zikr.hadithText}
              </p>
            </section>
          )}

          {/* Citation last, and named once. The old card repeated "source" as
              its own heading and again inside itself. */}
          <section className="mt-4 border-t border-border/50 pt-4" aria-labelledby="reference-source-heading">
            <h3 id="reference-source-heading" className="mb-2 text-[0.9375rem] font-extrabold text-primary">
              {t(language, "reader.sourceLabel")}
            </h3>
            <p
              data-testid="reference-source"
              className="text-start text-[0.875rem] font-semibold leading-relaxed text-muted-foreground"
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
  const layoutMode = useLayoutMode();

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
        variant={layoutMode === "compact" ? "sheet" : "dialog"}
      />
    </ResponsiveSheet>
  );
}
