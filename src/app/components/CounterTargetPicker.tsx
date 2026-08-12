import { useState } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { SlidersHorizontal } from "./icons";
import { Modal } from "./ResponsiveSheet";
import { Button } from "./ui/button";

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

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputValue > 0) {
      onTargetChange(customInputValue);
    }
    setShowCustomModal(false);
  };

  return (
    <fieldset className="w-full" dir={direction}>
      <legend className="mb-2 text-[0.8125rem] font-bold text-foreground">{t(language, "counter.targetLabel")}</legend>
      {/* Preset Pill Buttons Row */}
      <div className="grid grid-cols-3 gap-2 py-1 sm:flex sm:items-center sm:overflow-x-auto">
        {presets.map((preset) => {
          const isSelected = activeTarget === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onTargetChange(preset.value)}
              className={`interactive-elem min-h-11 w-full rounded-full px-3 text-[0.8125rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-auto sm:shrink-0 sm:px-4 ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border/40 bg-card/80 backdrop-blur-md text-muted-foreground hover:bg-muted"
              }`}
            >
              {preset.label}
            </button>
          );
        })}

        {/* Custom Target Button */}
        <button
          type="button"
          onClick={() => setShowCustomModal(true)}
          className={`interactive-elem flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-auto sm:shrink-0 sm:px-4 ${
            isCustomTarget
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border/40 bg-card/80 backdrop-blur-md text-muted-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>{isCustomTarget ? formatNumerals(activeTarget, language) : t(language, "counter.custom")}</span>
        </button>
      </div>

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
