import React, { useState } from "react";
import { Check } from "./icons";
import { formatNumerals, numeralFontFamily } from "../formatting";
import type { AppLanguage, Zikr } from "../types";
import { getLocalizedSourceReference, getLocalizedZikrBenefit } from "../content/localizedZikr";

export interface MushafZikrCardProps {
  zikr: Zikr;
  index: number;
  isCompleted: boolean;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onToggle: (index: number) => void;
  onSelect?: (index: number) => void;
  /** Repetition count left or current count label */
  countLabel?: string;
  className?: string;
}

export function MushafZikrCard({
  zikr,
  index,
  isCompleted,
  language,
  direction,
  onToggle,
  onSelect,
  countLabel,
  className = "",
}: MushafZikrCardProps) {
  const isArabic = language === "ar";
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  const formattedCount = countLabel ?? formatNumerals(zikr.repetitionCount, language);

  // Split text by ayah end symbols ﴿١﴾, ﴿٢﴾ etc. if present
  // Regex matches ﴿\d+﴾ or ﴿[٠-٩]+﴾
  const ayahSegments = zikr.arabicText.split(/(﴿[0-9٠-٩]+﴾)/g);

  return (
    <div
      className={`relative w-full rounded-2xl border transition-all overflow-hidden ${
        isCompleted
          ? "border-emerald-500/40 bg-emerald-950/10 dark:bg-emerald-950/20 shadow-xs"
          : "border-amber-700/30 bg-[#FFFDF8] dark:bg-stone-900/90 dark:border-amber-600/30 shadow-md"
      } ${className}`}
      dir={direction}
    >
      {/* Decorative Mushaf Gold/Emerald Outer Border Frame */}
      <div className="absolute inset-0 pointer-events-none border-2 border-amber-600/20 dark:border-amber-500/20 rounded-2xl m-1" />

      {/* Mushaf Header Frame */}
      <div className="relative border-b border-amber-700/20 dark:border-amber-600/20 bg-amber-500/10 dark:bg-amber-950/40 px-4 py-3 flex items-center justify-between">
        {/* Check/Toggle button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(index);
          }}
          aria-label={
            isArabic
              ? `${zikr.surahNameArabic ?? zikr.arabicText.slice(0, 25)}. ${
                  isCompleted ? "مكتمل، انقر لإلغاء التحديد" : "غير مكتمل، انقر لتحديد المكتمل"
                }`
              : `${zikr.surahNameEnglish ?? zikr.translation.slice(0, 25)}. ${
                  isCompleted ? "Completed, tap to uncheck" : "Incomplete, tap to complete"
                }`
          }
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {isCompleted ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black shadow-sm">
              <Check size={18} strokeWidth={3} />
            </span>
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-700/50 dark:border-amber-400/50 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors" />
          )}
        </button>

        {/* Surah / Ayah Title Banner */}
        <div className="text-center flex-1 px-2">
          {(zikr.isSurah || zikr.surahNameArabic) && (
            <div className="inline-flex items-center gap-1.5 border border-amber-700/25 dark:border-amber-500/25 rounded-lg px-2.5 py-1 bg-amber-100/50 dark:bg-amber-900/30">
              {zikr.surahType && (
                <span className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80">
                  {zikr.surahType}
                </span>
              )}
              <span className="text-[0.875rem] font-bold font-arabic text-amber-950 dark:text-amber-100 leading-tight">
                {zikr.isSurah && zikr.surahNameArabic
                  ? `سُورَةُ ${zikr.surahNameArabic}`
                  : (zikr.surahNameArabic ?? "القرآن الكريم")}
              </span>
              {zikr.verseCount && (
                <span
                  className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80"
                  style={{ fontFamily: numeralFontFamily(language) }}
                >
                  آيَاتُهَا {formatNumerals(zikr.verseCount, language)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Counter Badge */}
        <div className="flex shrink-0 items-center justify-center rounded-xl bg-amber-500/20 px-3 py-1.5 shadow-xs border border-amber-500/30">
          <span
            className="text-[0.875rem] font-extrabold text-amber-900 dark:text-amber-200"
            style={{ fontFamily: numeralFontFamily(language) }}
          >
            x{formattedCount}
          </span>
        </div>
      </div>

      {/* Main Mushaf Content Body */}
      <button
        type="button"
        className="w-full text-start p-5 sm:p-6 cursor-pointer hover:bg-amber-500/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() => onSelect && onSelect(index)}
      >
        {/* Seek Refuge Header if applicable */}
        {zikr.hasSeekRefuge && (
          <div className="mb-3 text-center">
            <p className="font-arabic text-[1.05rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
              أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ
            </p>
          </div>
        )}

        {/* Basmalah Header if applicable */}
        {(zikr.hasBasmalah || zikr.isSurah) && (
          <div className="mb-4 text-center">
            <p className="font-arabic text-[1.125rem] font-bold text-amber-900/90 dark:text-amber-200/90 tracking-wide">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>
        )}

        {/* Arabic Text rendered Mushaf style */}
        <div
          className="zikr-text font-arabic text-center text-[1.2rem] sm:text-[1.35rem] font-bold leading-[2.2] text-foreground tracking-wide whitespace-pre-line select-text"
          dir="rtl"
          lang="ar"
        >
          {ayahSegments.map((segment, segIdx) => {
            const isAyahMarker = /^﴿[0-9٠-٩]+﴾$/.test(segment.trim());

            if (isAyahMarker) {
              const ayahNum = parseInt(segment.replace(/[^0-9]/g, ""), 10) || segIdx;
              const isSelected = highlightedAyah === ayahNum;

              return (
                <button
                  type="button"
                  key={segIdx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setHighlightedAyah(isSelected ? null : ayahNum);
                  }}
                  title={`آية ${formatNumerals(ayahNum, language)}`}
                  className={`inline-flex items-center justify-center px-1.5 py-0.5 mx-1 rounded-md text-[0.95rem] font-semibold transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelected
                      ? "bg-amber-500 text-amber-950 font-black scale-110 shadow-sm"
                      : "text-amber-800 dark:text-amber-300 hover:bg-amber-500/20"
                  }`}
                >
                  {segment}
                </button>
              );
            }

            return <span key={segIdx}>{segment}</span>;
          })}
        </div>

        {/* Hadith / Source Reference Footer */}
        {zikr.sourceReference && (
          <div className="mt-4 pt-3 border-t border-amber-700/15 dark:border-amber-600/15 flex items-center justify-between text-[0.75rem] font-medium text-muted-foreground">
            <span className="truncate">{getLocalizedSourceReference(zikr, language)}</span>
            {zikr.benefit && (
              <span className="italic text-amber-800 dark:text-amber-300 truncate max-w-[60%]">
                {getLocalizedZikrBenefit(zikr, language)}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}
