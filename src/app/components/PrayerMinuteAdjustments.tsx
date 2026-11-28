import { useId } from "react";
import { t } from "../i18n";
import type { AppLanguage, LocationSettings } from "../types";
import { Minus, Plus } from "./icons";
import { Button } from "./ui/button";

type Adjustments = NonNullable<LocationSettings["adjustments"]>;

/** Selection-only fine tuning; the screen owns applying and saving changes. */
export function PrayerMinuteAdjustments({
  language,
  value,
  onChange,
  onReset,
}: {
  language: AppLanguage;
  value: Adjustments;
  onChange: (prayer: keyof Adjustments, minutes: number) => void;
  onReset: () => void;
}) {
  const id = useId();
  const number = new Intl.NumberFormat(language, { signDisplay: "exceptZero" });
  const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
  return (
    <fieldset className="min-w-0 space-y-3 border-t border-border/40 pt-4">
      <legend className="text-label font-bold text-foreground">{t(language, "prayerLocation.adjustmentsTitle")}</legend>
      <p className="text-xs leading-relaxed text-muted-foreground">{t(language, "prayerLocation.adjustmentHint")}</p>
      {prayers.map((prayer) => {
        const label = t(language, `notifications.${prayer}`);
        const minutes = value[prayer] ?? 0;
        return (
          <div key={prayer} className="prayer-adjustment-row" role="group" aria-labelledby={`${id}-${prayer}-label`}>
            <span id={`${id}-${prayer}-label`} className="text-label font-semibold">
              {label}
            </span>
            <div className="flex items-center gap-[8px]" dir="ltr">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-[44px] min-h-[44px] min-w-[44px]"
                disabled={minutes <= -120}
                aria-label={t(language, "prayerLocation.earlier", { prayer: label })}
                aria-describedby={`${id}-${prayer}-value`}
                onClick={() => onChange(prayer, minutes - 1)}
              >
                <Minus size={18} aria-hidden="true" />
              </Button>
              <span
                id={`${id}-${prayer}-value`}
                className="min-w-0 flex-1 whitespace-nowrap text-center text-label tabular-nums"
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <bdi>{t(language, "prayerLocation.minutes", { count: number.format(minutes) })}</bdi>
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-[44px] min-h-[44px] min-w-[44px]"
                disabled={minutes >= 120}
                aria-label={t(language, "prayerLocation.later", { prayer: label })}
                aria-describedby={`${id}-${prayer}-value`}
                onClick={() => onChange(prayer, minutes + 1)}
              >
                <Plus size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={!prayers.some((prayer) => value[prayer])}
        onClick={onReset}
      >
        {t(language, "prayerLocation.resetAdjustments")}
      </Button>
    </fieldset>
  );
}
