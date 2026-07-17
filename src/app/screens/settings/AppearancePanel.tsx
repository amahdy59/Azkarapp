import { Check, Contrast, Moon, Sun } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ThemeMode } from "../../types";
import { SectionLabel, SubHeader } from "./SettingsPrimitives";

const THEMES: Array<{
  mode: ThemeMode;
  icon: typeof Moon;
  colors: [string, string, string];
  descriptionKey: string;
}> = [
  {
    mode: "midnight",
    icon: Moon,
    colors: ["#0A1228", "#111B35", "#D4A020"],
    descriptionKey: "appearance.midnightDescription",
  },
  {
    mode: "light",
    icon: Sun,
    colors: ["#F8F5F0", "#FFFFFF", "#835806"],
    descriptionKey: "appearance.lightDescription",
  },
  {
    mode: "dark",
    icon: Contrast,
    colors: ["#0D0D0D", "#171717", "#D4A020"],
    descriptionKey: "appearance.darkDescription",
  },
];

function themeName(mode: ThemeMode, language: AppLanguage) {
  return t(language, `settings.theme${mode.charAt(0).toUpperCase()}${mode.slice(1)}`);
}

export function AppearancePanel({
  language,
  themeMode,
  highContrast,
  onThemeModeChange,
  onDisableHighContrast,
  onBack,
}: {
  language: AppLanguage;
  themeMode: ThemeMode;
  highContrast: boolean;
  onThemeModeChange: (value: ThemeMode) => void;
  onDisableHighContrast: () => void;
  onBack: () => void;
}) {
  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background" dir={language === "ar" ? "rtl" : "ltr"}>
      <SubHeader title={t(language, "appearance.title")} onBack={onBack} language={language} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <SectionLabel label={t(language, "appearance.chooseTheme")} />
        <p className="mb-4 text-[14px] leading-6 text-muted-foreground">{t(language, "appearance.intro")}</p>

        {highContrast && (
          <aside className="mb-4 rounded-2xl border border-primary/50 bg-primary/10 p-4" aria-live="polite">
            <div className="flex items-start gap-3">
              <Contrast size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h2 className="text-[15px] font-semibold text-foreground">
                  {t(language, "appearance.highContrastTitle")}
                </h2>
                <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
                  {t(language, "appearance.highContrastBody")}
                </p>
                <button
                  type="button"
                  onClick={onDisableHighContrast}
                  className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[13px] font-semibold text-primary-foreground"
                >
                  {t(language, "appearance.disableHighContrast")}
                </button>
              </div>
            </div>
          </aside>
        )}

        <div className="flex flex-col gap-3" role="radiogroup" aria-label={t(language, "appearance.chooseTheme")}>
          {THEMES.map(({ mode, icon: Icon, colors, descriptionKey }) => {
            const selected = mode === themeMode;
            const name = themeName(mode, language);
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                data-testid={`theme-option-${mode}`}
                key={mode}
                onClick={() => onThemeModeChange(mode)}
                className={`min-h-[104px] rounded-2xl border bg-card p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  selected ? "border-primary" : "border-border hover:border-primary/60"
                }`}
              >
                <span className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[16px] font-semibold text-foreground">{name}</span>
                      {selected && (
                        <span className="flex items-center gap-1 text-[12px] font-semibold text-primary">
                          <Check size={16} aria-hidden="true" />
                          {t(language, "appearance.selected")}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[13px] leading-5 text-muted-foreground">
                      {t(language, descriptionKey)}
                    </span>
                    <span
                      className="mt-3 flex items-center gap-2"
                      aria-label={`${t(language, "appearance.previewLabel")}: ${name}`}
                    >
                      {colors.map((color, index) => (
                        <span
                          aria-hidden="true"
                          className="h-5 flex-1 rounded-md border border-black/15"
                          key={`${mode}-${color}`}
                          style={{ background: color, maxWidth: index === 2 ? 38 : undefined }}
                        />
                      ))}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
