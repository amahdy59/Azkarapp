import { QURAN_TEXT_STYLE } from "../quranTypography";
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
          className={`zikr-text mb-3 text-center text-title font-bold tracking-wide text-primary/90 ${className}`}
          style={QURAN_TEXT_STYLE}
          dir="rtl"
          lang="ar"
        >
          {SEEK_REFUGE_ARABIC}
        </p>
      )}
      {(zikr.hasBasmalah || zikr.isSurah) && (
        <p
          className={`zikr-text mb-4 text-center font-bold tracking-wide text-foreground/90 ${className}`}
          style={{
            ...QURAN_TEXT_STYLE,
            fontSize: "clamp(1.15rem, 4vw, 1.35rem)",
            lineHeight: 2,
          }}
          dir="rtl"
          lang="ar"
        >
          {BASMALAH_ARABIC}
        </p>
      )}
    </>
  );
}

function SurahFlourishRule({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="120"
      height="14"
      viewBox="0 0 120 14"
      fill="none"
      className={`shrink select-none opacity-80 ${flip ? "-scale-x-100" : ""}`}
      aria-hidden="true"
    >
      <polygon points="4,7 7,4 10,7 7,10" fill="var(--mushaf-rule-ink, var(--accent, #c6a772))" />
      <line x1="12" y1="7" x2="108" y2="7" stroke="var(--mushaf-rule-ink, var(--accent, #c6a772))" strokeWidth="1.2" />
      <circle cx="114" cy="7" r="2.5" stroke="var(--mushaf-rule-ink, var(--accent, #c6a772))" strokeWidth="1" />
    </svg>
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
      <div className="flex items-center justify-center gap-2.5 sm:gap-4 px-2">
        <SurahFlourishRule />

        {/* Surah Title */}
        <div className="flex flex-col items-center px-1">
          <h2
            className="text-base sm:text-lg font-bold tracking-wide text-foreground whitespace-nowrap select-none"
            style={{ fontFamily: "var(--font-mushaf)" }}
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

        <SurahFlourishRule flip />
      </div>
    </div>
  );
}
