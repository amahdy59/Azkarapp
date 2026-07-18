import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Check, Contrast, Moon, Sun } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ThemeMode } from "../../types";

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  icon: typeof Moon;
  labelKey: "settings.themeMidnight" | "settings.themeLight" | "settings.themeDark";
}> = [
  { mode: "midnight", icon: Moon, labelKey: "settings.themeMidnight" },
  { mode: "light", icon: Sun, labelKey: "settings.themeLight" },
  { mode: "dark", icon: Contrast, labelKey: "settings.themeDark" },
];

export function ThemeModeSelector({
  language,
  direction,
  value,
  onChange,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  value: ThemeMode;
  onChange: (value: ThemeMode) => void;
}) {
  return (
    <RadioGroupPrimitive.Root
      dir={direction}
      value={value}
      onValueChange={(nextValue) => onChange(nextValue as ThemeMode)}
      className="grid grid-cols-3 gap-2"
      aria-label={t(language, "appearance.chooseTheme")}
    >
      {THEME_OPTIONS.map(({ mode, icon: Icon, labelKey }) => {
        const selected = value === mode;
        return (
          <RadioGroupPrimitive.Item
            key={mode}
            value={mode}
            data-testid={`theme-option-${mode}`}
            className={`relative flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              selected
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary/60"
            }`}
          >
            <Icon size={20} className={selected ? "text-primary" : "text-muted-foreground"} aria-hidden="true" />
            <span className="text-[12px] font-semibold leading-4">{t(language, labelKey)}</span>
            {selected && (
              <span className="absolute end-1.5 top-1.5 text-primary" aria-hidden="true">
                <Check size={14} strokeWidth={2.5} />
              </span>
            )}
          </RadioGroupPrimitive.Item>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
