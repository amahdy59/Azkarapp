import type { AuthenticZikrItem } from "../content/authenticAzkar";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
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

export function AuthenticZikrPicker({
  items,
  selected,
  language,
  direction,
  savedItems,
  onSelect,
}: {
  items: readonly AuthenticZikrItem[];
  selected: AuthenticZikrItem;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  savedItems?: Record<string, { count: number; target: number; laps?: number }>;
  onSelect: (item: AuthenticZikrItem) => void;
}) {
  const isArabic = language === "ar";
  const selectedLabel = isArabic ? selected.shortNameAr : selected.shortNameEn;
  const selectedFullText = isArabic ? selected.textAr : selected.textEn;

  return (
    <fieldset className="w-full min-w-0" dir={direction}>
      <legend className="sr-only">{t(language, "counter.chooseDhikr")}</legend>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="counter-zikr-filter"
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
          className="w-[var(--radix-dropdown-menu-trigger-width)] max-w-[var(--radix-dropdown-menu-trigger-width)] max-h-[70vh] overflow-y-auto"
        >
          <DropdownMenuLabel className="px-3 py-2 text-xs font-black text-muted-foreground">
            {t(language, "counter.chooseDhikr")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={selected.id}
            onValueChange={(val) => {
              const item = items.find((it) => it.id === val);
              if (item) {
                onSelect(item);
              }
            }}
          >
            {items.map((item) => {
              const label = isArabic ? item.shortNameAr : item.shortNameEn;
              const fullText = isArabic ? item.textAr : item.textEn;
              const saved = savedItems?.[item.id];
              const hasProgress = Boolean(saved && saved.count > 0);

              return (
                <DropdownMenuRadioItem
                  key={item.id}
                  value={item.id}
                  className="font-bold min-w-0 cursor-pointer"
                  title={fullText}
                  data-testid={`zikr-option-${item.id}`}
                >
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="truncate min-w-0 font-bold leading-snug">{label}</span>
                    {hasProgress && (
                      <span className="text-[11px] font-semibold text-primary/80 leading-tight mt-0.5" dir="ltr">
                        {formatNumerals(saved!.count, language)} / {formatNumerals(saved!.target, language)}
                      </span>
                    )}
                  </span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </fieldset>
  );
}
