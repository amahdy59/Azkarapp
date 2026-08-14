import { useState } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ChevronDown, SlidersHorizontal } from "./icons";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export type TargetPreset = 10 | 33 | 100 | 1000 | 0 | "custom";

export function CounterTargetPicker({
  activeTarget,
  onTargetChange,
  language,
  direction,
  allowOpen = true,
}: {
  activeTarget: number; // 0 means open/unlimited
  onTargetChange: (newTarget: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  allowOpen?: boolean;
}) {
  const isArabic = language === "ar";
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(activeTarget > 0 ? activeTarget : 50);

  const presets: { value: number; label: string }[] = [
    { value: 10, label: formatNumerals(10, language) },
    { value: 33, label: formatNumerals(33, language) },
    { value: 100, label: formatNumerals(100, language) },
    { value: 1000, label: formatNumerals(1000, language) },
    ...(allowOpen ? [{ value: 0, label: t(language, "counter.targetOpen") }] : []),
  ];
  const isCustomTarget = !presets.some((preset) => preset.value === activeTarget);
  const activeLabel = activeTarget === 0 ? t(language, "counter.targetOpen") : formatNumerals(activeTarget, language);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputValue > 0) {
      onTargetChange(customInputValue);
    }
    setShowCustomModal(false);
  };

  return (
    <fieldset className="w-full" dir={direction}>
      <legend className="sr-only">{t(language, "counter.targetLabel")}</legend>
      <DropdownMenu dir={direction}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            data-testid="counter-target-filter"
            className="interactive-elem inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-btn border border-border-control bg-card px-3.5 text-[0.8125rem] font-extrabold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            aria-label={`${t(language, "counter.targetLabel")} ${activeLabel}`}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="truncate">
              {t(language, "counter.targetLabel")} {activeLabel}
            </span>
            <ChevronDown size={15} className="shrink-0" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[13rem] rounded-2xl p-1.5">
          <DropdownMenuLabel className="px-3 py-2 text-[0.75rem] font-black text-muted-foreground">
            {t(language, "counter.targetLabel")}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={isCustomTarget ? "custom" : String(activeTarget)}
            onValueChange={(value) => {
              if (value !== "custom") onTargetChange(Number(value));
            }}
          >
            {presets.map((preset) => (
              <DropdownMenuRadioItem
                key={preset.value}
                value={String(preset.value)}
                className="min-h-11 rounded-xl font-bold"
              >
                {preset.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator className="my-1 h-px bg-border" />
          <DropdownMenuItem
            onSelect={() => setShowCustomModal(true)}
            className="min-h-11 cursor-pointer gap-2 rounded-xl px-3 font-bold"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span>
              {isCustomTarget ? `${t(language, "counter.custom")} · ${activeLabel}` : t(language, "counter.custom")}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Target Dialog */}
      {showCustomModal && (
        <Modal
          open
          onClose={() => setShowCustomModal(false)}
          title={t(language, "counter.setCustomTarget")}
          direction={isArabic ? "rtl" : "ltr"}
          maxWidthClassName="max-w-sm"
          className="p-6"
        >
          <div>
            <h3 className="mb-3 text-[1.125rem] font-bold text-foreground">{t(language, "counter.setCustomTarget")}</h3>
            <p className="mb-4 text-[0.8125rem] text-muted-foreground">{t(language, "counter.customTargetHint")}</p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <label htmlFor="custom-counter-target" className="block text-[0.8125rem] font-bold text-foreground">
                {t(language, "counter.targetLabel")}
              </label>
              <input
                type="number"
                id="custom-counter-target"
                name="custom-counter-target"
                min={1}
                max={100000}
                value={customInputValue}
                onChange={(e) => setCustomInputValue(Math.max(1, parseInt(e.target.value) || 1))}
                inputMode="numeric"
                className="h-12 w-full rounded-[var(--ds-radius-control)] border border-border-control bg-background px-4 text-[1.25rem] font-extrabold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />

              <div className="grid grid-cols-4 gap-2">
                {[50, 70, 300, 500].map((quickVal) => (
                  <Button
                    key={quickVal}
                    type="button"
                    variant={customInputValue === quickVal ? "secondary" : "outline"}
                    onClick={() => setCustomInputValue(quickVal)}
                    className="min-w-0 px-2"
                  >
                    {formatNumerals(quickVal, language)}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowCustomModal(false)} className="flex-1">
                  {t(language, "common.cancel")}
                </Button>
                <Button type="submit" className="flex-1">
                  {t(language, "counter.applyTarget")}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </fieldset>
  );
}
