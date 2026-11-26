import type { BenefitEvidence } from "./content/zikrBenefits";
import { localizeBenefitText } from "./content/zikrBenefits";
import { formatNumerals } from "./formatting";
import type { AppLanguage } from "./types";

const QURAN_SURAH_NAMES: Readonly<Record<number, { ar: string; en: string }>> = {
  2: { ar: "البقرة", en: "Al-Baqarah" },
  3: { ar: "آل عمران", en: "Ali 'Imran" },
  8: { ar: "الأنفال", en: "Al-Anfal" },
  13: { ar: "الرعد", en: "Ar-Ra'd" },
  33: { ar: "الأحزاب", en: "Al-Ahzab" },
  62: { ar: "الجمعة", en: "Al-Jumu'ah" },
};

/** The same visible reference accompanies evidence in the index, completion and exports. */
export function benefitEvidenceCitation(item: BenefitEvidence, language: AppLanguage) {
  if (item.kind !== "quran") return localizeBenefitText(item.source, language);
  const [, surahValue, ayahValue] = item.id.split("-");
  const surah = Number(surahValue);
  const ayah = Number(ayahValue);
  const name = QURAN_SURAH_NAMES[surah]?.[language];
  if (!name || !Number.isFinite(ayah)) return localizeBenefitText(item.source, language);
  const reference = `${formatNumerals(surah, language)}:${formatNumerals(ayah, language)}`;
  return language === "ar" ? `سورة ${name} · ${reference}` : `Surah ${name} · ${reference}`;
}
