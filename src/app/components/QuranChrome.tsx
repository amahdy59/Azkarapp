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
          className={`zikr-text mb-3 text-center text-[1.05rem] font-bold tracking-wide text-primary/90 ${className}`}
          dir="rtl"
          lang="ar"
        >
          {SEEK_REFUGE_ARABIC}
        </p>
      )}
      {(zikr.hasBasmalah || zikr.isSurah) && (
        <p
          className={`zikr-text mb-4 text-center text-[1.125rem] font-bold tracking-wide text-primary/90 ${className}`}
          dir="rtl"
          lang="ar"
        >
          {BASMALAH_ARABIC}
        </p>
      )}
    </>
  );
}

export function QuranSurahHeader({
  zikr,
  language,
  sticky = false,
}: {
  zikr: Zikr;
  language: AppLanguage;
  sticky?: boolean;
}) {
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
    <div className={`mb-4 text-center ${sticky ? "sticky top-3 z-20 pointer-events-none" : "pointer-events-none"}`}>
      <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-md px-3 py-1.5 shadow-sm">
        {surahType && <span className="text-[0.6875rem] font-semibold text-primary/80">{surahType}</span>}
        <span className="zikr-text text-[0.875rem] font-bold text-primary" dir="rtl" lang="ar">
          {zikr.isSurah && zikr.surahNameArabic
            ? `سُورَةُ ${zikr.surahNameArabic}`
            : (zikr.surahNameArabic ?? "الْقُرْآنُ الْكَرِيمُ")}
        </span>
        {zikr.verseCount && (
          <span
            className="text-[0.6875rem] font-semibold text-primary/80"
            style={{ fontFamily: numeralFontFamily(language) }}
          >
            {t(language, "reader.ayahs")} {formatNumerals(zikr.verseCount, language)}
          </span>
        )}
      </div>
    </div>
  );
}
