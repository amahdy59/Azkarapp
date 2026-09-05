import {
  Calendar,
  BookOpen,
  Database,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Info,
  MapPin,
  Moon,
  User,
} from "../../components/icons";
import { t } from "../../i18n";
import { LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage, LocationSettings, ThemeMode } from "../../types";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Button } from "../../components/ui/button";
import { RowChevron, RowValue, SettingsRowItem, SettingsSection } from "./SettingsPrimitives";

import { ThemeModeSelector } from "./ThemeModeSelector";

export type SettingsSubScreen =
  | "root"
  | "accessibility"
  | "downloads"
  | "notifications"
  | "progress"
  | "account-data"
  | "help"
  | "legal"
  | "sources"
  | "whats-new"
  | "about";

const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";

export function SettingsRootPanel({
  onNav,
  language,
  direction,
  themeMode,
  highContrast,
  onThemeModeChange,
  onDisableHighContrast,
  onLanguageChange,
  isGuest,
  isSyncing,
  syncError,
  locationSettings,
  calendarType = "hijri",
  onCalendarTypeChange,
  activeSub,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  highContrast: boolean;
  onThemeModeChange: (value: ThemeMode) => void;
  onDisableHighContrast: () => void;
  onLanguageChange: (value: AppLanguage) => void;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  quietProgressEnabled: boolean;
  locationSettings?: LocationSettings;
  calendarType?: "hijri" | "gregorian";
  onCalendarTypeChange?: (value: "hijri" | "gregorian") => void;
  /** When set, highlights the matching row (two-pane layout). */
  activeSub?: SettingsSubScreen;
}) {
  const itemProps = (screen: SettingsSubScreen) => ({
    current: activeSub === screen,
    testId: `settings-sub-${screen}`,
  });

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <SettingsSection label={t(language, "settings.preferences")} variant="content">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
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
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{t(language, "appearance.highContrastBody")}</p>
            <Button type="button" size="sm" onClick={onDisableHighContrast} className="mt-2 text-xs">
              {t(language, "appearance.disableHighContrast")}
            </Button>
          </aside>
        )}
      </SettingsSection>

      <SettingsSection className="mt-3">
        <div className="p-4 border-b border-border/50">
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
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
                selected ? "bg-background text-foreground shadow-sm" : "text-foreground hover:bg-muted/40"
              }`
            }
            options={LANGUAGES_LIST.map((opt) => ({
              value: opt.code as AppLanguage,
              label: opt.native,
              testId: `settings-language-${opt.code}`,
            }))}
          />
        </div>

        {/* Calendar system sits beside Language, not under Accessibility where
            it used to live. It is a locale preference, not an accessibility
            aid, and Phase 09 calls for it in General. Same SegmentedControl as
            Language above, which also gives it the radiogroup semantics the
            hand-rolled radio items lacked. Presentation move only — the
            persisted calendarType field and its normalization are unchanged. */}
        {onCalendarTypeChange && (
          <div className="border-b border-border/50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
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
                  selected ? "bg-background text-foreground shadow-sm" : "text-foreground hover:bg-muted/40"
                }`
              }
              options={[
                { value: "hijri" as const, label: t(language, "settings.calendarHijri"), testId: "calendar-hijri" },
                {
                  value: "gregorian" as const,
                  label: t(language, "settings.calendarGregorian"),
                  testId: "calendar-gregorian",
                },
              ]}
            />
          </div>
        )}

        {/* One row, one destination. "Prayer Times & Location" and
            "Notifications" were two labels with two different values that both
            opened this same panel — the ambiguous-chevron problem in
            AGENTS.md §7. The panel owns both concerns, so the row names both.
            The value shows the configured city, or an explicit unset state:
            defaulting the label to "Cairo" presented a fallback as though the
            user had chosen it. */}

        <SettingsRowItem
          iconBg={iconBackground}
          icon={<MapPin size={20} className="text-primary" />}
          label={t(language, "settings.prayerTimesAndReminders")}
          right={<RowValue value={locationSettings?.cityName || t(language, "settings.locationNotSet")} />}
          onPress={() => onNav("notifications")}
          hasDivider={false}
          {...itemProps("notifications")}
        />
      </SettingsSection>

      <SettingsSection label={t(language, "settings.contentSection")}>
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Download size={20} className="text-primary" />}
          label={t(language, "settings.offlineAccess")}
          right={<RowValue value={t(language, "settings.included")} />}
          onPress={() => onNav("downloads")}
          {...itemProps("downloads")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<BookOpen size={20} className="text-primary" />}
          label={t(language, "settings.contentSources")}
          right={<RowChevron />}
          onPress={() => onNav("sources")}
          hasDivider={false}
          {...itemProps("sources")}
        />
      </SettingsSection>

      <SettingsSection label={t(language, "settings.accessibilitySection")}>
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<User size={20} className="text-primary" />}
          label={t(language, "settings.accessibility")}
          right={<RowChevron />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
          {...itemProps("accessibility")}
        />
      </SettingsSection>

      <SettingsSection label={t(language, "settings.accountSection")}>
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Database size={20} className="text-primary" />}
          label={t(language, "settings.accountData")}
          right={
            <RowValue
              value={
                isGuest
                  ? t(language, "settings.activateAccount")
                  : syncError
                    ? t(language, "settings.accountNeedsAttention")
                    : isSyncing
                      ? t(language, "common.syncing")
                      : t(language, "settings.accountUpToDate")
              }
            />
          }
          onPress={() => onNav("account-data")}
          hasDivider={false}
          {...itemProps("account-data")}
        />
      </SettingsSection>

      <SettingsSection label={t(language, "settings.supportSection")}>
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<HelpCircle size={20} className="text-primary" />}
          label={t(language, "settings.helpFaq")}
          right={<RowChevron />}
          onPress={() => onNav("help")}
          {...itemProps("help")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<FileText size={20} className="text-primary" />}
          label={t(language, "settings.privacyTerms")}
          right={<RowChevron />}
          onPress={() => onNav("legal")}
          {...itemProps("legal")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Info size={20} className="text-primary" />}
          label={t(language, "settings.aboutHelp")}
          right={<RowChevron />}
          onPress={() => onNav("about")}
          hasDivider={false}
          {...itemProps("about")}
        />
      </SettingsSection>
    </div>
  );
}
