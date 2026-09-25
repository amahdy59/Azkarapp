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
  const [overflows, setOverflows] = useState(() => content.length > 140);

  useLayoutEffect(() => {
    const summary = summaryRef.current;
    if (!summary || expanded) return;

    let active = true;
    const measure = () => {
      if (!active || summary.clientHeight === 0) return;
      // In CSS, line-clamp-2 with leading-[1.85] and Arabic diacritics (harakat) can have
      // scrollHeight 1-3px larger than clientHeight without any line being clamped.
      // A third line adds >= 20px. We use a threshold of 6px to prevent false positives.
      setOverflows(summary.scrollHeight > summary.clientHeight + 6);
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
    </>
  );

  return (
    <div
      id={`zikr-card-${index}`}
      ref={isActive ? activeRef : undefined}
      aria-current={isActive ? "step" : undefined}
      className={`group relative flex w-full flex-col rounded-2xl border transition-[background-color,border-color,box-shadow,opacity] duration-200 ${
        isActive
          ? "border-primary bg-primary/10 shadow-xs"
          : isCardCompleted
            ? "border-success/30 bg-card/75 hover:border-success/50 hover:bg-card"
            : "border-border/60 bg-card/75 hover:border-primary/40 hover:bg-card"
      }`}
    >
      <div className="flex w-full items-center justify-between gap-2 px-3.5 pt-2.5" dir={direction}>
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`flex h-6 min-w-6 shrink-0 items-center justify-center rounded-md px-1.5 text-xs font-bold transition-colors ${
              isActive
                ? "border border-primary/40 bg-primary/15 text-primary shadow-xs"
                : isCardCompleted
                  ? "border border-success/30 bg-success/15 text-success"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {formatNumerals(index + 1, language)}
          </span>

          <span className="truncate text-xs font-semibold text-muted-foreground">
            {targetCount === 1
              ? t(language, "category.repetitionInstructionOnce")
              : t(language, "category.repetitionInstruction", { count: formatNumerals(targetCount, language) })}
          </span>
        </div>

        {onToggleZikr ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleZikr(index);
            }}
            className="group relative -my-1.5 -me-1.5 flex size-11 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={
              isCardCompleted
                ? t(language, "category.completedToggle", { defaultValue: "Completed — tap to uncheck" })
                : t(language, "category.remainingToggle", { defaultValue: "Not completed — tap to check" })
            }
          >
            {isCardCompleted ? (
              <span className="flex size-5 items-center justify-center rounded-full bg-success text-white shadow-xs dark:text-primary-foreground">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
            ) : (
              <span className="size-5 rounded-full border-2 border-border-control transition-colors group-hover:border-primary" />
            )}
          </button>
        ) : isCardCompleted ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-bold text-success shadow-xs dark:text-success">
            <Check size={12} strokeWidth={3} aria-hidden="true" />
            <span>{t(language, "category.completed")}</span>
          </span>
        ) : null}
      </div>

      <div id={detailsId} data-zikr-content className="px-3.5 pb-2 pt-1.5" dir={direction}>
        {onClickText ? (
          <button
            type="button"
            data-zikr-select
            aria-current={isActive ? "step" : undefined}
            aria-label={
              ariaLabelOverride ??
              `${formatNumerals(index + 1, language)}. ${isArabic ? z.arabicText : z.translation} — ${
                targetCount === 1
                  ? t(language, "category.repetitionInstructionOnce")
                  : t(language, "category.repetitionInstruction", { count: formatNumerals(targetCount, language) })
              }${isCardCompleted ? ` (${t(language, "category.completed")})` : ""}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onClickText(index);
            }}
            className="block min-h-11 w-full rounded-lg text-start outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring"
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

      {showDisclosure && (
        <div className="flex w-full items-center justify-end px-3.5 pb-2 pt-0" dir={direction}>
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
            className="group relative -my-1 -me-1 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring motion-reduce:transition-none"
          >
            <ChevronDown
              size={17}
              aria-hidden="true"
              className={`transition-transform duration-200 motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      )}

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
