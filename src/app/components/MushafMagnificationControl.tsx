import { useId } from "react";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
export function MushafMagnificationControl({
  language,
  value,
  onChange,
}: {
  language: AppLanguage;
  value: number;
  onChange: (value: number) => void;
}) {
  const controlId = useId();
  const hintId = useId();
  return (
    <section className="flex flex-col gap-2.5">
      <label htmlFor={controlId} className="text-sm font-semibold">
        {t(language, "mushaf.magnification")}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={controlId}
          type="range"
          min={100}
          max={200}
          step={25}
          value={value}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          aria-describedby={hintId}
          aria-valuetext={`${formatNumerals(value, language)}%`}
          className="h-11 min-w-0 flex-1 accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        />
        <output htmlFor={controlId} className="text-sm tabular-nums" dir="ltr">
          {formatNumerals(value, language)}%
        </output>
      </div>
      <button
        type="button"
        onClick={() => onChange(100)}
        className="min-h-11 rounded-lg border border-border px-3 text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {t(language, "mushaf.magnificationReset")}
      </button>
      <p id={hintId} className="text-xs text-muted-foreground">
        {t(language, "mushaf.magnificationHint")}
      </p>
    </section>
  );
}
