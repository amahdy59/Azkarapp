import { QURAN_TEXT_STYLE } from "../quranTypography";
import type { AppLanguage, Zikr } from "../types";
import { formatNumerals, numeralFontFamily } from "../formatting";
import { t } from "../i18n";
import { MushafBismillahArt } from "./MushafBismillahArt";
import { MushafSurahHeaderArt } from "./MushafSurahHeaderArt";

export const SEEK_REFUGE_ARABIC = "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ";
export const BASMALAH_ARABIC = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";

export function QuranPrelude({ zikr, className = "" }: { zikr: Zikr; className?: string }) {
  return (
    <>
      {zikr.hasSeekRefuge && (
        <p
          className={`zikr-text mb-3 text-center text-title font-bold tracking-wide text-primary/90 ${className}`}
          style={QURAN_TEXT_STYLE}
          dir="rtl"
          lang="ar"
        >
          {SEEK_REFUGE_ARABIC}
        </p>
      )}
      {(zikr.hasBasmalah || zikr.isSurah) && (
        <div
          className={`mx-auto mb-5 mt-3 flex w-full justify-center text-foreground ${className}`}
          dir="rtl"
          lang="ar"
        >
          <span aria-hidden="true">
            <MushafBismillahArt className="h-auto w-[13rem] max-w-full" />
          </span>
          <span className="sr-only">{BASMALAH_ARABIC}</span>
        </div>
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

  const surahName =
    zikr.isSurah && zikr.surahNameArabic
      ? `سُورَةُ ${zikr.surahNameArabic}`
      : (zikr.surahNameArabic ?? "الْقُرْآنُ الْكَرِيمُ");

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
    <div
      className={`my-3 w-full max-w-[30rem] mx-auto text-center ${
        sticky ? "sticky top-3 z-20 pointer-events-none" : "pointer-events-none"
      }`}
      dir="rtl"
      data-testid="quran-surah-header"
    >
      <div className="relative flex items-center justify-center px-2">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-9" aria-hidden="true">
          <MushafSurahHeaderArt className="h-full w-full" />
        </div>

        {/* Surah Title */}
        <div className="flex flex-col items-center px-1">
          <h2
            className="arabic-ui relative flex min-h-9 items-center text-base font-bold text-foreground whitespace-nowrap select-none"
            data-testid="quran-surah-title"
          >
            {surahName}
          </h2>
          {(surahType || zikr.verseCount) && (
            <div className="mt-0.5 flex items-center gap-1.5 text-micro font-medium text-muted-foreground/80">
              {surahType && <span>{surahType}</span>}
              {surahType && zikr.verseCount && <span>·</span>}
              {zikr.verseCount && (
                <span style={{ fontFamily: numeralFontFamily(language) }}>
                  {t(language, "reader.ayahs")} {formatNumerals(zikr.verseCount, language)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
