import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Contrast, Moon, Sun } from "../../components/icons";
import { ChoiceRadioItem } from "../../components/ChoiceRadioItem";
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
          <ChoiceRadioItem
            key={mode}
            value={mode}
            data-testid={`theme-option-${mode}`}
            className="min-h-[84px] flex-col gap-2 px-2 py-3"
          >
            <Icon size={20} className={selected ? "text-primary" : "text-muted-foreground"} aria-hidden="true" />
            <span className="text-xs font-semibold leading-4">{t(language, labelKey)}</span>
          </ChoiceRadioItem>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
