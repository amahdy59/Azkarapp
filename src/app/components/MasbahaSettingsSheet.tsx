import { useId, useState } from "react";
import type { AuthenticZikrItem } from "../content/authenticAzkar";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { Button } from "./ui/button";
import "./responsive-filters.css";

const GOAL_PRESETS = [10, 33, 100, 1000];

/** Draft-only controls: closing the sheet never changes a saved counter. */
export function MasbahaSettingsSheet({
  items,
  selected,
  target,
  savedItems,
  language,
  direction,
  onApply,
  onClose,
}: {
  items: readonly AuthenticZikrItem[];
  selected: AuthenticZikrItem;
  target: number;
  savedItems: Record<string, { target: number }>;
  language: AppLanguage;
  direction: "rtl" | "ltr";
  onApply: (item: AuthenticZikrItem, target: number) => void;
  onClose: () => void;
}) {
  const id = useId();
  const [chosen, setChosen] = useState(selected);
  const [draftTarget, setDraftTarget] = useState(String(target));
  const [custom, setCustom] = useState(!GOAL_PRESETS.includes(target));
  const name = (item: AuthenticZikrItem) => (language === "ar" ? item.shortNameAr : item.shortNameEn);
  return (
    <ResponsiveSheet
      open
      onClose={onClose}
      title={t(language, "counter.settings")}
      language={language}
      direction={direction}
      testId="masbaha-settings-sheet"
      focusOnOpen
      drawerClassName="filter-sheet"
      dialogClassName="filter-sheet"
    >
      <SheetHeader
        title={t(language, "counter.settings")}
        className="filter-sheet-header"
        onClose={onClose}
        language={language}
        direction={direction}
      />
      <form
        className="flex min-h-0 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const value = Number(draftTarget);
          if (Number.isInteger(value) && value >= 1 && value <= 100000) onApply(chosen, value);
        }}
      >
        <div className="min-h-0 overflow-y-auto p-4 space-y-5">
          <details className="rounded-2xl border border-border p-3">
            <summary className="min-h-11 cursor-pointer text-sm font-semibold focus-visible:ring-[3px] focus-visible:ring-ring">
              {t(language, "counter.chooseDhikr")} · {name(chosen)}
            </summary>
            <fieldset className="mt-3 min-w-0 space-y-2">
              <legend className="sr-only">{t(language, "counter.chooseDhikr")}</legend>
              {items.map((item) => (
                <label
                  key={item.id}
                  className="flex min-h-11 items-start gap-3 rounded-xl border border-border p-3 text-sm [overflow-wrap:anywhere]"
                >
                  <input
                    type="radio"
                    name={`${id}-dhikr`}
                    value={item.id}
                    checked={chosen.id === item.id}
                    className="mt-1 shrink-0 accent-primary"
                    onChange={(event) => {
                      setChosen(item);
                      const nextTarget =
                        item.id === selected.id ? target : savedItems[item.id]?.target || item.recommendedTarget;
                      setDraftTarget(String(nextTarget));
                      setCustom(!GOAL_PRESETS.includes(nextTarget));
                      const details = event.currentTarget.closest("details");
                      if (details) {
                        details.open = false;
                        details.querySelector("summary")?.focus();
                      }
                    }}
                  />
                  <span>
                    {/(?:\.{3}|…)$/u.test(name(item)) ? (language === "ar" ? item.textAr : item.textEn) : name(item)}
                  </span>
                </label>
              ))}
            </fieldset>
          </details>
          <fieldset className="min-w-0">
            <legend className="mb-3 text-sm font-bold">{t(language, "counter.targetLabel")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {GOAL_PRESETS.map((value) => (
                <label
                  key={value}
                  className="flex min-h-11 items-center gap-2 rounded-xl border border-border p-3 text-sm"
                >
                  <input
                    type="radio"
                    name={`${id}-target`}
                    checked={!custom && Number(draftTarget) === value}
                    className="accent-primary"
                    onChange={() => {
                      setCustom(false);
                      setDraftTarget(String(value));
                    }}
                  />
                  {formatNumerals(value, language)}
                </label>
              ))}
            </div>
            <label className="mt-2 flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${id}-target`}
                checked={custom}
                className="accent-primary"
                onChange={() => setCustom(true)}
              />
              {t(language, "counter.custom")}
            </label>
            {custom && (
              <label className="block text-sm" htmlFor={`${id}-custom`}>
                {t(language, "counter.setCustomTarget")}
                <input
                  id={`${id}-custom`}
                  type="number"
                  min={1}
                  max={100000}
                  step={1}
                  required
                  inputMode="numeric"
                  value={draftTarget}
                  onChange={(event) => setDraftTarget(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-border-control bg-background px-3 text-foreground"
                />
              </label>
            )}
          </fieldset>
        </div>
        <div className="flex shrink-0 gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onClose} className="min-w-0 flex-1">
            {t(language, "common.cancel")}
          </Button>
          <Button type="submit" className="min-w-0 flex-1">
            {t(language, "counter.applySettings")}
          </Button>
        </div>
      </form>
    </ResponsiveSheet>
  );
}
