import { useState } from "react";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import { SlidersHorizontal } from "./icons";

export type TargetPreset = 10 | 33 | 100 | 1000 | 0 | "custom";

export function CounterTargetPicker({
  activeTarget,
  onTargetChange,
  language,
  direction,
}: {
  activeTarget: number; // 0 means open/unlimited
  onTargetChange: (newTarget: number) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(activeTarget > 0 ? activeTarget : 50);

  const presets: { value: number; label: string }[] = [
    { value: 10, label: formatNumerals(10, language) },
    { value: 33, label: formatNumerals(33, language) },
    { value: 100, label: formatNumerals(100, language) },
    { value: 1000, label: formatNumerals(1000, language) },
    { value: 0, label: isArabic ? "مفتوح" : "Open" },
  ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInputValue > 0) {
      onTargetChange(customInputValue);
    }
    setShowCustomModal(false);
  };

  return (
    <div className="w-full" dir={direction}>
      {/* Preset Pill Buttons Row */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
        <span className="shrink-0 text-[0.75rem] font-bold text-muted-foreground">
          {isArabic ? "الهدف:" : "Target:"}
        </span>
        {presets.map((preset) => {
          const isSelected = activeTarget === preset.value;
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => onTargetChange(preset.value)}
              className={`interactive-elem h-9 shrink-0 rounded-full px-3.5 text-[0.8125rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
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
          className={`interactive-elem flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            ![10, 33, 100, 1000, 0].includes(activeTarget)
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border/40 bg-card/80 backdrop-blur-md text-muted-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>
            {![10, 33, 100, 1000, 0].includes(activeTarget)
              ? formatNumerals(activeTarget, language)
              : isArabic
                ? "مخصص"
                : "Custom"}
          </span>
        </button>
      </div>

      {/* Custom Target Dialog */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label={isArabic ? "إغلاق" : "Close"}
            className="absolute inset-0 h-full w-full cursor-default border-none bg-transparent p-0"
            onClick={() => setShowCustomModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border/40 bg-card p-6 shadow-2xl">
            <h3 className="mb-3 text-[1.125rem] font-bold text-foreground">
              {isArabic ? "تحديد هدف مخصص" : "Set Custom Target"}
            </h3>
            <p className="mb-4 text-[0.8125rem] text-muted-foreground">
              {isArabic
                ? "أدخل العدد المستهدف الذي تريد الوصول إليه (مثلاً 50، 500، 70):"
                : "Enter your preferred target count (e.g., 50, 500, 70):"}
            </p>

            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <input
                type="number"
                min={1}
                max={100000}
                value={customInputValue}
                onChange={(e) => setCustomInputValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-12 w-full rounded-xl border border-border bg-background px-4 text-[1.25rem] font-extrabold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />

              <div className="grid grid-cols-4 gap-2">
                {[50, 70, 300, 500].map((quickVal) => (
                  <button
                    key={quickVal}
                    type="button"
                    onClick={() => setCustomInputValue(quickVal)}
                    className="h-9 rounded-lg border border-border bg-muted/40 text-[0.8125rem] font-bold text-foreground hover:bg-muted"
                  >
                    {formatNumerals(quickVal, language)}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="h-11 flex-1 rounded-xl border border-border bg-background text-[0.875rem] font-bold text-foreground hover:bg-muted"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="h-11 flex-1 rounded-xl bg-primary text-[0.875rem] font-bold text-primary-foreground hover:bg-primary/90"
                >
                  {isArabic ? "تطبيق الهدف" : "Apply Target"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
