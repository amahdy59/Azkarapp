import { useLayoutEffect, useRef, useState } from "react";
import { BookOpen, Check, ChevronDown } from "./icons";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import { hasSpecificRecommendedTiming, getLocalizedPreferredTiming } from "../content/localizedZikr";
import { isLongSurah } from "../content/mushafPages";
import type { Zikr } from "../types";

export interface AzkarListItemProps {
  z: Zikr;
  index: number;
  isCardCompleted: boolean;
  language: "ar" | "en";
  isArabic: boolean;
  direction: "ltr" | "rtl";
  isActive?: boolean;
  activeRef?: React.RefObject<HTMLDivElement>;
  onToggleZikr?: (i: number) => void;
  onClickText?: (i: number) => void;
  expandedOverride?: boolean;
  onToggleExpand?: () => void;
  ariaLabelOverride?: string;
}

function useClampedTextOverflow(expanded: boolean, content: string) {
  const summaryRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(true);

  useLayoutEffect(() => {
    const summary = summaryRef.current;
    if (!summary || expanded) return;

    let active = true;
    const measure = () => {
      if (!active || summary.clientHeight === 0) return;
      setOverflows(summary.scrollHeight > summary.clientHeight + 1);
    };

    measure();
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    observer?.observe(summary);
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);

    return () => {
      active = false;
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [content, expanded]);

  return { summaryRef, overflows };
}

export function AzkarListItem({
  z,
  index,
  isCardCompleted,
  language,
  isArabic,
  direction,
  isActive = false,
  activeRef,
  onToggleZikr,
  onClickText,
  expandedOverride,
  onToggleExpand,
  ariaLabelOverride,
}: AzkarListItemProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isControlled = expandedOverride !== undefined;
  const expanded = isControlled ? expandedOverride : localExpanded;

  const targetCount = z.repetitionCount;
  const showTiming = hasSpecificRecommendedTiming(z);
  const timingText = getLocalizedPreferredTiming(z, language);
  const longSurah = isLongSurah(z);
  const visibleText = isArabic ? z.arabicText : z.translation;
  const { summaryRef, overflows } = useClampedTextOverflow(expanded, visibleText);
  const hasExpandedOnlyContent =
    (isArabic && (z.hasSeekRefuge || z.hasBasmalah || z.isSurah)) || Boolean(showTiming && timingText) || longSurah;
  const showDisclosure = expanded || overflows || hasExpandedOnlyContent;
  const detailsId = `zikr-details-${index}`;

  const toggleExpanded = () => {
    if (isControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded((current) => !current);
    }
  };

  const readingContent = (
    <>
      {expanded && isArabic && z.hasSeekRefuge && (
        <span className="zikr-text mb-1 block text-label font-bold text-primary/90">
          أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
        </span>
      )}
      {expanded && isArabic && (z.hasBasmalah || z.isSurah) && (
        <span className="zikr-text mb-1 block text-subtitle font-bold text-primary/90">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
      )}
      <span
        ref={summaryRef}
        data-testid={`zikr-summary-${index}`}
        className={`${isArabic ? "zikr-text" : "font-sans"} text-title font-bold leading-[1.85] text-foreground whitespace-pre-line ${
          expanded ? `block ${longSurah ? "max-h-64 overflow-y-auto pe-1" : ""}` : "line-clamp-2"
        }`}
        lang={isArabic ? "ar" : "en"}
        dir={isArabic ? "rtl" : "ltr"}
      >
        {visibleText}
      </span>
      {longSurah && expanded && (
        <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
          <BookOpen size={14} aria-hidden="true" />
          {t(language, "reader.readFullSurahInMushaf")}
        </span>
      )}
      <span className="mt-1 block text-xs font-semibold text-muted-foreground">
        {targetCount === 1
          ? t(language, "category.repetitionInstructionOnce")
          : t(language, "category.repetitionInstruction", { count: formatNumerals(targetCount, language) })}
      </span>
    </>
  );

  return (
    <div
      id={`zikr-card-${index}`}
      ref={isActive ? activeRef : undefined}
      aria-current={isActive ? "step" : undefined}
      className={`relative flex w-full flex-col rounded-2xl border transition-all ${
        isActive
          ? "border-primary bg-primary/10 shadow-xs"
          : isCardCompleted
            ? "border-border/40 bg-card/60 opacity-60 grayscale hover:bg-card"
            : "border-border/40 bg-card/60 hover:bg-card hover:border-primary/35"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-3 px-3 pt-3" dir={direction}>
        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-extrabold ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-primary/80 bg-primary/90 text-primary-foreground shadow-xs"
            }`}
          >
            {formatNumerals(index + 1, language)}
          </span>

          {onToggleZikr ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleZikr(index);
              }}
              className="flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={
                isCardCompleted
                  ? t(language, "category.completedToggle", { defaultValue: "Completed — tap to uncheck" })
                  : t(language, "category.remainingToggle", { defaultValue: "Not completed — tap to check" })
              }
            >
              {isCardCompleted ? (
                <span className="flex size-7 items-center justify-center rounded-full bg-success text-white shadow-xs dark:text-primary-foreground">
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                </span>
              ) : (
                <span className="size-6 rounded-full border-2 border-muted-foreground/50 transition-colors hover:border-primary" />
              )}
            </button>
          ) : (
            <span className="flex size-11 shrink-0 items-center justify-center" aria-hidden="true">
              <span
                className={`flex size-6 items-center justify-center rounded-full border ${
                  isCardCompleted
                    ? "border-success bg-success text-white shadow-xs dark:text-primary-foreground"
                    : "border-muted-foreground/40 text-transparent"
                }`}
              >
                <Check size={13} strokeWidth={3} />
              </span>
            </span>
          )}
        </div>

        {showDisclosure && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={detailsId}
            aria-label={
              expanded
                ? t(language, "reader.collapseZikr", { defaultValue: "Collapse" })
                : t(language, "reader.expandZikr", { defaultValue: "Expand" })
            }
            onClick={(event) => {
              event.stopPropagation();
              toggleExpanded();
            }}
            className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border/70 bg-transparent text-muted-foreground transition-[color,background-color,border-color,transform] hover:border-border-control hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring motion-reduce:transition-none"
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      <div id={detailsId} data-zikr-content className="px-3 pb-3 pt-2" dir={direction}>
        {onClickText ? (
          <button
            type="button"
            data-zikr-select
            aria-current={isActive ? "step" : undefined}
            aria-label={ariaLabelOverride}
            onClick={(event) => {
              event.stopPropagation();
              onClickText(index);
            }}
            className="block w-full rounded-lg text-start outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            dir={direction}
          >
            {readingContent}
          </button>
        ) : (
          <div className="min-w-0 text-start" dir={direction}>
            {readingContent}
          </div>
        )}
      </div>

      {expanded && showTiming && timingText && (
        <div className="flex flex-col items-start gap-3 border-t border-border/20 bg-muted/10 px-4 pb-4 pt-3">
          <div
            className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-label font-extrabold text-primary"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <span aria-hidden="true" className="shrink-0">
              💡
            </span>
            <span className="leading-snug">{timingText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
