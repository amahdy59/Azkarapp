import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { ChevronDown } from "./icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export interface SalawatFormula {
  id: string;
  nameAr: string;
  nameEn: string;
  textAr: string;
  transliterationEn: string;
}

export const SALAWAT_FORMULAS: SalawatFormula[] = [
  {
    id: "salawat_short",
    nameAr: "الصيغة المختصرة",
    nameEn: "Concise Formula",
    textAr: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliterationEn: "Allahumma salli wa sallim ‘ala Nabiyyina Muhammad",
  },
  {
    id: "salawat_ibrahimiyyah",
    nameAr: "الصلاة الإبراهيمية",
    nameEn: "As-Salat Al-Ibrahimiyyah",
    textAr:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliterationEn:
      "Allahumma salli ‘ala Muhammadin wa ‘ala ali Muhammad, kama sallayta ‘ala Ibrahima wa ‘ala ali Ibrahim, innaka Hamidun Majid. Allahumma barik ‘ala Muhammadin wa ‘ala ali Muhammad, kama barakta ‘ala Ibrahima wa ‘ala ali Ibrahim, innaka Hamidun Majid",
  },
  {
    id: "salawat_tashahhud",
    nameAr: "صيغة موجزة",
    nameEn: "Short Formula",
    textAr: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    transliterationEn: "Allahumma salli ‘ala Muhammadin wa ‘ala ali Muhammad",
  },
];

export function SalawatFormulaPicker({
  formulas,
  selected,
  language,
  direction,
  onSelect,
}: {
  formulas: readonly SalawatFormula[];
  selected: SalawatFormula;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onSelect: (formula: SalawatFormula) => void;
}) {
  const isArabic = language === "ar";
  const selectedLabel = isArabic ? selected.nameAr : selected.nameEn;
  const selectedFullText = isArabic ? selected.textAr : selected.transliterationEn;

  return (
    <fieldset className="w-full min-w-0" dir={direction}>
      <legend className="sr-only">{t(language, "fridaySalawat.title")}</legend>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="salawat-formula-filter"
            className="interactive-elem flex min-h-[44px] w-full items-center justify-between gap-2 sm:gap-3 rounded-2xl border border-border-control bg-card px-3 sm:px-4 text-label sm:text-sm font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            title={selectedFullText}
          >
            <span className="min-w-0 flex-1 truncate text-start" dir="auto">
              {selectedLabel}
            </span>
            <ChevronDown size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          collisionPadding={16}
          className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 max-h-[70vh] overflow-y-auto"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-muted-foreground">
            {t(language, "fridaySalawat.chooseFormula")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selected.id}
            onValueChange={(id) => {
              const match = formulas.find((item) => item.id === id);
              if (match) onSelect(match);
            }}
          >
            {formulas.map((formula) => (
              <DropdownMenuRadioItem
                key={formula.id}
                value={formula.id}
                className="flex flex-col items-start gap-1 py-2.5"
                data-testid={`salawat-formula-option-${formula.id}`}
              >
                <span className="font-bold text-foreground" dir="auto">
                  {isArabic ? formula.nameAr : formula.nameEn}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-2" dir="auto">
                  {isArabic ? formula.textAr : formula.transliterationEn}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </fieldset>
  );
}
