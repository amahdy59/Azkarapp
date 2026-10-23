import { Calendar, Globe, Moon, Eye, Droplets, SwitchHorizontal, Smartphone } from "../../components/icons";
import { Button } from "../../components/ui/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { LANGUAGES_LIST } from "../../languageOptions";
import { formatNumerals } from "../../formatting";
import { t } from "../../i18n";
import type { AppLanguage, ThemeMode } from "../../types";
import { SettingsSection, SettingsToggleRow, SubHeader } from "./SettingsPrimitives";
import { ThemeModeSelector } from "./ThemeModeSelector";
import { useMediaQuery } from "../../hooks/useMediaQuery";
const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";
export interface AppearancePanelProps {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  highContrast: boolean;
  homeWirdImages?: boolean;
  appMaterial?: "system" | "glass" | "solid";
  onAppMaterialChange?: (value: "system" | "glass" | "solid") => void;
  homeMaterial?: "inherit" | "system" | "glass" | "solid";
  onHomeMaterialChange?: (value: "inherit" | "system" | "glass" | "solid") => void;
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
  appMaterial = "solid",
  onAppMaterialChange,
  homeMaterial = "inherit",
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
  const systemReduced = useMediaQuery("(prefers-reduced-transparency: reduce)");
  const displayedMaterial = (value: "system" | "glass" | "solid") =>
    value === "glass" || (value === "system" && !reduceTransparency && !systemReduced) ? "glass" : "solid";
  const applyMaterial = (value: "glass" | "solid") => {
    onAppMaterialChange?.(value);
  };
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
        {(onAppMaterialChange || onHomeMaterialChange || onHomeWirdImagesChange) && (
          <SettingsSection label={t(language, "settings.appMaterial")} className="mt-3">
            {/* 1. Entire app appearance */}
            {onAppMaterialChange && (
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2.5">
                  <span
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-primary"
                    style={{ background: iconBackground }}
                    aria-hidden="true"
                  >
                    <Smartphone size={16} />
                  </span>
                  <p className="text-sm font-bold text-foreground">{t(language, "settings.entireAppAppearance")}</p>
                </div>
                <p className="mb-3 text-xs leading-5 text-muted-foreground">
                  {t(language, "settings.appMaterialHint")}
                </p>
                <SegmentedControl
                  value={displayedMaterial(appMaterial)}
                  onChange={applyMaterial}
                  onReselect={applyMaterial}
                  direction={direction}
                  aria-label={t(language, "settings.appMaterial")}
                  className="flex bg-muted/80 p-1 rounded-xl"
                  itemClassName={(selected) =>
                    `min-h-11 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      selected
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-muted-foreground hover:text-foreground font-semibold"
                    }`
                  }
                  options={(["solid", "glass"] as const).map((value) => ({
                    value,
                    label: t(language, `settings.homeMaterial_${value}`),
                  }))}
                />
              </div>
            )}

            {onAppMaterialChange && onHomeMaterialChange && <div className="h-px bg-border/40 mx-4" />}

            {/* 2. Home page cards appearance */}
            {onHomeMaterialChange && (
              <>
                <SettingsToggleRow
                  icon={<SwitchHorizontal size={20} className="text-primary" />}
                  iconBg={iconBackground}
                  label={t(language, "settings.homeMaterial_inherit")}
                  description={
                    homeMaterial === "inherit"
                      ? `${t(language, "settings.homeMaterialFollowsApp")} (${t(language, `settings.homeMaterial_${displayedMaterial(appMaterial)}`)})`
                      : t(language, "settings.homeMaterialCustomDesc")
                  }
                  checked={homeMaterial === "inherit"}
                  onChange={() =>
                    onHomeMaterialChange(homeMaterial === "inherit" ? displayedMaterial(appMaterial) : "inherit")
                  }
                />
                <div className="px-4 pb-3 pt-1">
                  <div className="rounded-2xl bg-muted/40 p-3 border border-border/40">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>{t(language, "settings.homeMaterial")}</span>
                      <span className="text-micro font-medium">
                        {homeMaterial === "inherit"
                          ? t(language, "settings.autoTag")
                          : t(language, "settings.customTag")}
                      </span>
                    </div>
                    <SegmentedControl
                      value={displayedMaterial(homeMaterial === "inherit" ? appMaterial : homeMaterial)}
                      onChange={onHomeMaterialChange}
                      onReselect={onHomeMaterialChange}
                      direction={direction}
                      aria-label={t(language, "settings.homeMaterial")}
                      className="flex bg-card/80 p-1 rounded-xl border border-border/40"
                      itemClassName={(selected) =>
                        `min-h-11 flex-1 rounded-lg py-2.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                          selected
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-muted-foreground hover:text-foreground font-semibold"
                        }`
                      }
                      options={(["solid", "glass"] as const).map((value) => ({
                        value,
                        label: t(language, `settings.homeMaterial_${value}`),
                      }))}
                    />
                  </div>
                </div>
              </>
            )}

            {(onHomeMaterialChange || onAppMaterialChange) &&
              (onHomeWirdImagesChange || onReduceTransparencyChange) && <div className="h-px bg-border/40 mx-4" />}

            {/* 3. Daily-wird card look / images */}
            {onHomeWirdImagesChange && (
              <SettingsToggleRow
                icon={<Eye size={20} className="text-primary" />}
                iconBg={iconBackground}
                label={t(language, "settings.homeWirdImages")}
                description={t(language, "settings.homeWirdImagesHint")}
                checked={homeWirdImages}
                onChange={() => onHomeWirdImagesChange(!homeWirdImages)}
              />
            )}
            {!onHomeMaterialChange && onReduceTransparencyChange && (
              <SettingsToggleRow
                icon={<Droplets size={20} className="text-primary" />}
                iconBg={iconBackground}
                label={t(language, "settings.homeTransparency")}
                description={t(language, "settings.homeTransparencyHint")}
                checked={!reduceTransparency}
                onChange={() => onReduceTransparencyChange(!reduceTransparency)}
              />
            )}
          </SettingsSection>
        )}
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
