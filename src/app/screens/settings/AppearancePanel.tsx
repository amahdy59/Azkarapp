import { Calendar, Globe, Moon, Eye, Droplets } from "../../components/icons";
import { Button } from "../../components/ui/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { LANGUAGES_LIST } from "../../languageOptions";
import { formatNumerals } from "../../formatting";
import { t } from "../../i18n";
import type { AppLanguage, ThemeMode } from "../../types";
import { SettingsSection, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";
import { ThemeModeSelector } from "./ThemeModeSelector";
const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";
export interface AppearancePanelProps {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  highContrast: boolean;
  homeWirdImages?: boolean;
  homeMaterial?: "system" | "glass" | "solid";
  onHomeMaterialChange?: (value: "system" | "glass" | "solid") => void;
  onHomeWirdImagesChange?: (value: boolean) => void;
  reduceTransparency?: boolean;
  onReduceTransparencyChange?: (value: boolean) => void;
  onThemeModeChange: (value: ThemeMode) => void;
  onDisableHighContrast: () => void;
  onLanguageChange: (value: AppLanguage) => void;
  calendarType?: "hijri" | "gregorian";
  onCalendarTypeChange?: (value: "hijri" | "gregorian") => void;
  hijriDateOffset?: number;
  onHijriDateOffsetChange?: (offset: number) => void;
  onBack: () => void;
}
export function AppearancePanel({
  language,
  direction,
  themeMode,
  highContrast,
  homeWirdImages = false,
  homeMaterial = "system",
  onHomeMaterialChange,
  onHomeWirdImagesChange,
  reduceTransparency = false,
  onReduceTransparencyChange,
  onThemeModeChange,
  onDisableHighContrast,
  onLanguageChange,
  calendarType = "hijri",
  onCalendarTypeChange,
  hijriDateOffset = 0,
  onHijriDateOffsetChange,
  onBack,
}: AppearancePanelProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <SubHeader title={t(language, "settings.appearanceLanguage")} language={language} onBack={onBack} />
      <div className="flex-1 overflow-y-auto pb-8">
        {" "}
        {/* ── 1. Preferences: Appearance & Regional Locale ── */}
        <SettingsSection label={t(language, "settings.preferences")} variant="content">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: iconBackground }}
              aria-hidden="true"
            >
              <Moon size={20} className="text-primary" />
            </span>
            <h3 className="text-base font-semibold text-foreground">{t(language, "settings.displayTheme")}</h3>
          </div>
          <ThemeModeSelector language={language} direction={direction} value={themeMode} onChange={onThemeModeChange} />
          {highContrast && (
            <aside className="mt-3 rounded-2xl border border-primary/40 bg-primary/10 p-3" aria-live="polite">
              <h4 className="text-sm font-semibold text-foreground">{t(language, "appearance.highContrastTitle")}</h4>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t(language, "appearance.highContrastBody")}
              </p>
              <Button type="button" size="sm" onClick={onDisableHighContrast} className="mt-2 text-xs">
                {t(language, "appearance.disableHighContrast")}
              </Button>
            </aside>
          )}
        </SettingsSection>
        <SettingsSection label={t(language, "settings.homeCards")} className="mt-3">
          {onHomeMaterialChange && (
            <div className="space-y-3 p-4">
              <h3 className="text-base font-semibold">{t(language, "settings.homeMaterial")}</h3>
              <p className="text-sm text-muted-foreground">{t(language, "settings.homeMaterialHint")}</p>
              <SegmentedControl
                value={homeMaterial}
                onChange={onHomeMaterialChange}
                direction={direction}
                aria-label={t(language, "settings.homeMaterial")}
                className="flex flex-wrap gap-2"
                itemClassName={(selected) =>
                  `min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`
                }
                options={(["system", "glass", "solid"] as const).map((value) => ({
                  value,
                  label: t(language, `settings.homeMaterial_${value}`),
                }))}
              />
            </div>
          )}
          {onHomeWirdImagesChange && (
            <SettingsToggleRow
              icon={<Eye size={20} />}
              iconBg={iconBackground}
              label={t(language, "settings.homeWirdImages")}
              description={t(language, "settings.homeWirdImagesHint")}
              checked={homeWirdImages}
              onChange={() => onHomeWirdImagesChange(!homeWirdImages)}
            />
          )}
          {!onHomeMaterialChange && onReduceTransparencyChange && (
            <SettingsToggleRow
              icon={<Droplets size={20} />}
              iconBg={iconBackground}
              label={t(language, "settings.homeTransparency")}
              description={t(language, "settings.homeTransparencyHint")}
              checked={!reduceTransparency}
              onChange={() => onReduceTransparencyChange(!reduceTransparency)}
            />
          )}
        </SettingsSection>
        <SettingsSection className="mt-3">
          <div className="p-4 border-b border-border/50">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: iconBackground }}
                aria-hidden="true"
              >
                <Globe size={20} className="text-primary" />
              </span>
              <h3 className="text-base font-semibold text-foreground">{t(language, "settings.language")}</h3>
            </div>
            <SegmentedControl
              value={language}
              onChange={onLanguageChange}
              direction={direction}
              aria-label={t(language, "settings.language")}
              className="flex bg-muted/80 p-1 rounded-xl"
              itemClassName={(selected) =>
                `min-h-11 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  selected
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground font-semibold"
                }`
              }
              options={LANGUAGES_LIST.map((opt) => ({
                value: opt.code as AppLanguage,
                label: opt.native,
                testId: `settings-language-${opt.code}`,
              }))}
            />
          </div>

          {onCalendarTypeChange && (
            <div className="p-4">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: iconBackground }}
                  aria-hidden="true"
                >
                  <Calendar size={20} className="text-primary" />
                </span>
                <h3 className="text-base font-semibold text-foreground">{t(language, "settings.calendarSystem")}</h3>
              </div>
              <SegmentedControl
                value={calendarType}
                onChange={onCalendarTypeChange}
                direction={direction}
                aria-label={t(language, "settings.calendarSystem")}
                className="flex bg-muted/80 p-1 rounded-xl"
                itemClassName={(selected) =>
                  `min-h-11 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    selected
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground font-semibold"
                  }`
                }
                options={[
                  {
                    value: "hijri" as const,
                    label: t(language, "settings.calendarHijri"),
                    testId: "calendar-hijri",
                  },
                  {
                    value: "gregorian" as const,
                    label: t(language, "settings.calendarGregorian"),
                    testId: "calendar-gregorian",
                  },
                ]}
              />

              {/* Regional Hijri Calendar offset */}
              {calendarType === "hijri" && onHijriDateOffsetChange && (
                <div className="mt-3.5 pt-3.5 border-t border-border/40">
                  <div className="mb-2">
                    <h4 className="text-xs font-semibold text-foreground">
                      {t(language, "settings.hijriOffsetTitle")}
                    </h4>
                    <p className="text-micro leading-snug text-muted-foreground">
                      {t(language, "settings.hijriOffsetHint")}
                    </p>
                  </div>
                  <SegmentedControl
                    value={String(hijriDateOffset ?? 0)}
                    onChange={(val) => onHijriDateOffsetChange(Number(val))}
                    direction={direction}
                    aria-label={t(language, "settings.hijriOffsetTitle")}
                    className="flex bg-muted/80 p-1 rounded-xl"
                    itemClassName={(selected) =>
                      `min-h-11 flex-1 rounded-lg py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                        selected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-muted-foreground hover:text-foreground font-semibold"
                      }`
                    }
                    options={[
                      { value: "-2", label: formatNumerals("-2", language), testId: "offset-minus-2" },
                      { value: "-1", label: formatNumerals("-1", language), testId: "offset-minus-1" },
                      { value: "0", label: formatNumerals("0", language), testId: "offset-0" },
                      { value: "1", label: formatNumerals("+1", language), testId: "offset-plus-1" },
                      { value: "2", label: formatNumerals("+2", language), testId: "offset-plus-2" },
                    ]}
                  />
                </div>
              )}
            </div>
          )}
        </SettingsSection>
      </div>
    </div>
  );
}
