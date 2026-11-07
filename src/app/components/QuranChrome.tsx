import { QURAN_TEXT_STYLE } from "../quranTypography";
import type { Zikr } from "../types";
import { MushafBismillahArt } from "./MushafBismillahArt";

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
          className={`mx-auto mb-2 mt-2 flex w-full justify-center text-foreground ${className}`}
          dir="rtl"
          lang="ar"
          data-testid="quran-basmalah"
        >
          <span aria-hidden="true">
            <MushafBismillahArt className="h-auto w-44 max-w-full" />
          </span>
          <span className="sr-only">{BASMALAH_ARABIC}</span>
        </div>
      )}
    </>
  );
}
