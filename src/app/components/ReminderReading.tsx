import { useId, useLayoutEffect, useRef, useState } from "react";
import type { DailyEvidence } from "../dailyEvidence";
import type { AppLanguage } from "../types";
import { reminderText } from "../i18n/reminderReadings";
import { QURAN_TEXT_STYLE } from "../quranTypography";
import { QuranVerseText } from "./QuranVerseText";
import { ChevronDown } from "./icons";

/** Reading state belongs to one evidence identity; the parent keys this component. */
export function ReminderReading({
  evidence,
  language,
  onGlass,
  onReadingChange,
}: {
  evidence: DailyEvidence;
  language: AppLanguage;
  onGlass: boolean;
  onReadingChange?: (reading: boolean) => void;
}) {
  const textId = useId();
  const quotation = useRef<HTMLQuoteElement>(null);
  const meaning = useRef<HTMLDetailsElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ink = onGlass ? "text-on-media" : "text-foreground";
  const secondary = onGlass ? "text-on-media-muted" : "text-muted-foreground";
  const accent = onGlass ? "text-on-media-accent" : "text-primary";
  const focus = "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

  useLayoutEffect(() => {
    const node = quotation.current;
    if (!node || evidence.isQuran) return;
    let active = true;
    const measure = () => {
      if (!active || node.clientHeight === 0) return;
      const lineHeight = Number.parseFloat(getComputedStyle(node).lineHeight);
      // Harakat can extend the ink a few pixels without adding a fifth line.
      const long = Number.isFinite(lineHeight)
        ? node.scrollHeight > lineHeight * 4 + 6
        : node.scrollHeight > node.clientHeight + 6;
      setOverflows(long);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(node);
    window.addEventListener("resize", measure);
    document.fonts?.addEventListener("loadingdone", measure);
    void document.fonts?.ready.then(measure);
    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      document.fonts?.removeEventListener("loadingdone", measure);
    };
  }, [evidence.hadith, evidence.isQuran, expanded]);

  return (
    <>
      <div>
        {evidence.narrator && <p className={`mb-2 text-label leading-relaxed ${secondary}`}>{evidence.narrator}</p>}
        <blockquote
          ref={quotation}
          id={textId}
          className={`font-medium ${
            evidence.isQuran
              ? "text-xl sm:text-2xl font-normal leading-relaxed tracking-wide"
              : `text-title leading-[2] ${expanded ? "" : "line-clamp-4"}`
          } ${ink} ${evidence.hadithInArabic ? "zikr-text" : ""}`}
          style={evidence.isQuran ? QURAN_TEXT_STYLE : undefined}
          dir={evidence.hadithInArabic ? "rtl" : "ltr"}
          lang={evidence.hadithInArabic ? "ar" : "en"}
          data-testid="daily-evidence-hadith"
        >
          {evidence.isQuran ? (
            <QuranVerseText text={evidence.hadith} language={language} canonicalKey={evidence.canonicalKey} />
          ) : (
            evidence.hadith
          )}
        </blockquote>
        {!evidence.isQuran && (overflows || expanded) && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={textId}
            data-testid="daily-evidence-expand"
            className={`mt-1 inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-label font-semibold ${accent} ${focus}`}
            onClick={() => {
              const next = !expanded;
              setExpanded(next);
              onReadingChange?.(next || Boolean(meaning.current?.open));
            }}
          >
            {reminderText(language, expanded ? "home.collapseEvidence" : "home.expandEvidence")}
            <ChevronDown size={16} aria-hidden="true" className={expanded ? "rotate-180" : undefined} />
          </button>
        )}
      </div>

      {evidence.translation && (
        <p className={`text-label leading-relaxed ${secondary}`} dir="ltr" lang="en">
          <span className="font-semibold">{reminderText(language, "home.evidenceTranslation")}: </span>
          {evidence.translation}
        </p>
      )}

      <details
        ref={meaning}
        data-testid="daily-evidence-meaning"
        className={`group border-t pt-2 ${onGlass ? "border-white/20" : "border-border/40"}`}
        onToggle={(event) => onReadingChange?.(expanded || event.currentTarget.open)}
      >
        <summary
          className={`flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 text-label font-semibold [&::-webkit-details-marker]:hidden ${accent} ${focus}`}
        >
          {reminderText(language, "home.evidenceMeaning")}
          <ChevronDown size={18} aria-hidden="true" className="shrink-0 group-open:rotate-180" />
        </summary>
        <div className="pt-2">
          <p className={`text-label leading-relaxed ${secondary}`} dir="auto">
            {evidence.meaning ?? evidence.benefit}
          </p>
          {evidence.meaningSourceUrl && (
            <a
              href={evidence.meaningSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-1 inline-flex min-h-11 items-center rounded-lg text-xs underline underline-offset-4 ${secondary} ${focus}`}
            >
              {reminderText(
                language,
                evidence.meaningSourceName === "hadeethenc"
                  ? "home.meaningHadeethEnc"
                  : evidence.meaningSourceName === "dorar"
                    ? "home.meaningDorar"
                    : "home.meaningFromSource",
              )}
            </a>
          )}
        </div>
      </details>

      {evidence.takeaway && (
        <div className={`border-s-2 ps-3 ${onGlass ? "border-on-media-accent" : "border-primary"}`}>
          <h3 className={`text-label font-semibold ${accent}`}>{reminderText(language, "home.evidenceTakeaway")}</h3>
          <p className={`mt-1 text-label leading-relaxed ${secondary}`} dir="auto">
            {evidence.takeaway}
          </p>
        </div>
      )}
    </>
  );
}
