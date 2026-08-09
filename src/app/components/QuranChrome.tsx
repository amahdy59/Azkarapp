import type { AppLanguage, Zikr } from "../types";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { t } from "../i18n";

export const SEEK_REFUGE_ARABIC = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ";
export const BASMALAH_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

export function QuranPrelude({ zikr, className = "" }: { zikr: Zikr; className?: string }) {
  return (
    <>
      {zikr.hasSeekRefuge && (
        <p
          className={`mb-3 text-center font-arabic text-[1.05rem] font-bold tracking-wide text-amber-900/90 dark:text-amber-200/90 ${className}`}
          dir="rtl"
          lang="ar"
        >
          {SEEK_REFUGE_ARABIC}
        </p>
      )}
      {(zikr.hasBasmalah || zikr.isSurah) && (
        <p
          className={`mb-4 text-center font-arabic text-[1.125rem] font-bold tracking-wide text-amber-900/90 dark:text-amber-200/90 ${className}`}
          dir="rtl"
          lang="ar"
        >
          {BASMALAH_ARABIC}
        </p>
      )}
    </>
  );
}

export function QuranSurahFooter({ zikr, language }: { zikr: Zikr; language: AppLanguage }) {
  if (!zikr.isSurah && !zikr.surahNameArabic) return null;

  const surahType = zikr.surahType
    ? language === "ar"
      ? zikr.surahType === "Medinan" || zikr.surahType === "مدنية"
        ? "مَدَنِيَّة"
        : "مَكِّيَّة"
      : zikr.surahType === "مدنية"
        ? "Medinan"
        : zikr.surahType === "مكية"
          ? "Meccan"
          : zikr.surahType
    : undefined;

  return (
    <div className="mb-2 mt-4 text-center pointer-events-none">
      <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-700/25 bg-amber-500/10 px-2.5 py-1 dark:border-amber-500/25 dark:bg-amber-950/30">
        {surahType && (
          <span className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80">{surahType}</span>
        )}
        <span className="font-arabic text-[0.875rem] font-bold text-amber-950 dark:text-amber-100" dir="rtl" lang="ar">
          {zikr.isSurah && zikr.surahNameArabic
            ? `سُورَةُ ${zikr.surahNameArabic}`
            : (zikr.surahNameArabic ?? "الْقُرْآنُ الْكَرِيمُ")}
        </span>
        {zikr.verseCount && (
          <span
            className="text-[0.6875rem] font-semibold text-amber-900/80 dark:text-amber-200/80"
            style={{ fontFamily: numeralFontFamily(language) }}
          >
            {t(language, "reader.ayahs")} {formatNumerals(zikr.verseCount, language)}
          </span>
        )}
      </div>
    </div>
  );
}
