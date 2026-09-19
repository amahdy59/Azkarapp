import { useState } from "react";
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
  const isSpecialSurah =
    z.isSurah &&
    (z.id === "sajda" ||
      z.id === "tabark" ||
      z.surahNameEnglish?.toLowerCase() === "as-sajdah" ||
      z.surahNameEnglish?.toLowerCase() === "al-mulk");

  const toggleExpanded = () => {
    if (isControlled && onToggleExpand) {
      onToggleExpand();
    } else {
      setLocalExpanded((current) => !current);
    }
  };

  const handleTextClick = () => {
    if (onClickText) {
      onClickText(index);
      if (isActive) {
        toggleExpanded();
      }
    } else {
      toggleExpanded();
    }
  };

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
      <div className="flex w-full items-start gap-3 p-3" dir={direction}>
        {/* Start column: Number badge on top, checkmark button directly beneath it */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 pt-0.5 pointer-events-none">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-extrabold ${
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                : "border-primary/80 bg-primary/90 text-primary-foreground shadow-xs"
            }`}
          >
            {formatNumerals(index + 1, language)}
          </span>

          <div className="pointer-events-auto flex flex-col items-center">
            {onToggleZikr ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleZikr(index);
                }}
                className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={
                  isCardCompleted
                    ? t(language, "category.completedToggle", { defaultValue: "Completed — tap to uncheck" })
                    : t(language, "category.remainingToggle", { defaultValue: "Not completed — tap to check" })
                }
              >
                {isCardCompleted ? (
                  <span className="flex size-7 items-center justify-center rounded-full bg-success text-white dark:text-primary-foreground shadow-xs">
                    <Check size={16} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="size-6 rounded-full border-2 border-muted-foreground/50 hover:border-primary transition-colors" />
                )}
              </button>
            ) : (
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border mt-1.5 ${
                  isCardCompleted
                    ? "border-success bg-success text-white dark:text-primary-foreground shadow-xs"
                    : "border-muted-foreground/40 text-transparent"
                }`}
                aria-hidden="true"
              >
                <Check size={13} strokeWidth={3} />
              </span>
            )}
          </div>
        </div>

        {/* Center: Text area (clicks toggle expand/collapse or select item) */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-current={isActive ? "step" : undefined}
          aria-controls={`zikr-details-${index}`}
          aria-label={ariaLabelOverride}
          onClick={(e) => {
            e.stopPropagation();
            handleTextClick();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              handleTextClick();
            }
          }}
          className="min-w-0 flex-1 text-start cursor-pointer rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring pe-12"
          dir={direction}
        >
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
          <div
            data-testid={`zikr-summary-${index}`}
            className={`${isArabic ? "zikr-text" : "font-sans"} text-title font-bold leading-[1.85] text-foreground whitespace-pre-line ${
              expanded ? (longSurah ? "max-h-64 overflow-y-auto pe-1" : "") : "line-clamp-2"
            }`}
            lang={isArabic ? "ar" : "en"}
            dir={isArabic ? "rtl" : "ltr"}
          >
            {isArabic ? z.arabicText : z.translation}
          </div>
          {longSurah && expanded && (
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-primary">
              <BookOpen size={14} />
              {t(language, "reader.readFullSurahInMushaf")}
            </span>
          )}
          <span className="mt-1 block text-xs font-semibold text-muted-foreground">
            {t(language, "category.repetitionInstruction", { count: formatNumerals(targetCount, language) })}
          </span>
        </div>

        {/* Floating glassmorphic chevron button */}
        {!isSpecialSurah && (
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`zikr-details-${index}`}
            aria-label={
              expanded
                ? t(language, "reader.collapseZikr", { defaultValue: "Collapse" })
                : t(language, "reader.expandZikr", { defaultValue: "Expand" })
            }
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
            className="absolute top-2 end-2 z-10 flex size-11 items-center justify-center rounded-full border border-border-control bg-card/80 backdrop-blur-md text-muted-foreground shadow-xs transition-all hover:bg-card hover:text-foreground hover:border-primary active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
          >
            <ChevronDown size={18} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {expanded && showTiming && timingText && (
        <div
          id={`zikr-details-${index}`}
          className="flex flex-col items-start gap-3 border-t border-border/20 bg-muted/10 px-4 pb-4 pt-3"
        >
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
