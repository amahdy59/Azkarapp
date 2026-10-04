import { useId, useState } from "react";
import type { AuthenticZikrItem } from "../content/authenticAzkar";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { Check, ChevronDown } from "./icons";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { Button } from "./ui/button";

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
  const radioName = useId();
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<AuthenticZikrItem>(selected);

  const handleOpen = () => {
    setTempSelected(selected);
    setOpen(true);
  };

  const handleConfirm = () => {
    onSelect(tempSelected);
    setOpen(false);
  };

  const selectedText = language === "ar" ? selected.textAr : selected.textEn;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-haspopup="dialog"
        className="interactive-elem flex min-h-11 w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-border-control bg-card px-3 text-label font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-within:ring-[3px] focus-within:ring-ring sm:px-4 sm:text-sm"
      >
        <span className="min-w-0 flex-1 truncate text-start" dir="auto">
          {selectedText}
        </span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <ResponsiveSheet
          open={open}
          onClose={() => setOpen(false)}
          title={t(language, "counter.chooseDhikr")}
          direction={direction}
          language={language}
          testId="authentic-zikr-sheet"
          maxWidthClassName="max-w-md"
          showCloseButton={true}
          drawerClassName="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          dialogClassName="p-6"
        >
          <div className="flex flex-col h-full max-h-[82vh] overflow-hidden text-start">
            <div className="pe-12 pb-3 shrink-0">
              <h2 className="text-xl font-black text-foreground">{t(language, "counter.chooseDhikr")}</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
                {t(language, "counter.chooseDhikrHint")}
              </p>
            </div>

            <div
              role="radiogroup"
              aria-label={t(language, "counter.chooseDhikr")}
              className="flex-1 overflow-y-auto space-y-2.5 py-2 pe-1"
            >
              {items.map((item) => {
                const isSelected = item.id === tempSelected.id;
                const text = language === "ar" ? item.textAr : item.textEn;
                const saved = savedItems?.[item.id];
                const hasProgress = Boolean(saved && saved.count > 0);

                return (
                  <label
                    key={item.id}
                    className={`w-full flex items-center justify-between gap-3 p-4 rounded-2xl text-start transition-all cursor-pointer outline-none focus-within:ring-[3px] focus-within:ring-ring ${
                      isSelected
                        ? "border-2 border-primary bg-primary/10 shadow-xs"
                        : "border border-border/70 bg-card/80 hover:bg-muted/60 hover:border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      name={radioName}
                      checked={isSelected}
                      onChange={() => setTempSelected(item)}
                      className="sr-only"
                    />
                    <div className="min-w-0 flex-1">
                      <span
                        className={`block text-base sm:text-lg font-bold leading-relaxed ${
                          isSelected ? "text-foreground" : "text-foreground/90"
                        }`}
                        dir="auto"
                      >
                        {text}
                      </span>
                      {hasProgress && (
                        <span className="mt-1 inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                          {formatNumerals(saved!.count, language)} / {formatNumerals(saved!.target, language)}
                        </span>
                      )}
                    </div>

                    <div
                      className={`size-6 rounded-full shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-border-control/70 bg-transparent text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-4 mt-2 border-t border-border/40 shrink-0">
              <Button
                type="button"
                onClick={handleConfirm}
                size="lg"
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-sm hover:bg-primary/90 focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "counter.selectAction")}
              </Button>
            </div>
          </div>
        </ResponsiveSheet>
      )}
    </>
  );
}
