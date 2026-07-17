import { Bell, BarChart3, Download, Globe, Info, LogOut, Menu, Moon, User, Wifi } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, TextSizeOption, ThemeMode } from "../../types";
import { RowChevron, RowValue, SectionLabel, SettingsRowItem } from "./SettingsPrimitives";

export type SettingsSubScreen =
  "root" | "language" | "accessibility" | "downloads" | "notifications" | "progress" | "about";

function formatTextSize(value: TextSizeOption, language: AppLanguage) {
  return t(
    language,
    value === "small" ? "settings.textSmall" : value === "large" ? "settings.textLarge" : "settings.medium",
  );
}

function formatThemeMode(value: ThemeMode, language: AppLanguage) {
  return t(language, `settings.theme${value.charAt(0).toUpperCase()}${value.slice(1)}`);
}

export function getNextThemeMode(themeMode: ThemeMode): ThemeMode {
  const modes: ThemeMode[] = ["midnight", "light", "dark"];
  return modes[(modes.indexOf(themeMode) + 1) % modes.length] ?? "midnight";
}

export function SettingsRootPanel({
  onNav,
  language,
  themeMode,
  languageLabel,
  textSize,
  isGuest,
  isSyncing,
  syncError,
  onThemeModeChange,
  onActivateAccount,
  onSignOut,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  themeMode: ThemeMode;
  languageLabel: string;
  textSize: TextSizeOption;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  onThemeModeChange: (value: ThemeMode) => void;
  onActivateAccount: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <SectionLabel label={t(language, "settings.preferences") || "Preferences"} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Globe size={20} className="text-primary" />}
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Moon size={20} className="text-primary" />}
          label={t(language, "settings.displayTheme")}
          right={<RowValue value={formatThemeMode(themeMode, language)} />}
          onPress={() => onThemeModeChange(getNextThemeMode(themeMode))}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Menu size={20} className="text-primary" />}
          label={t(language, "settings.textSize")}
          right={<RowValue value={formatTextSize(textSize, language)} />}
          onPress={() => onNav("accessibility")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Bell size={20} className="text-primary" />}
          label={t(language, "settings.notifications")}
          right={<RowValue value={t(language, "settings.notificationsSetup")} />}
          onPress={() => onNav("notifications")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.contentSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Download size={20} className="text-primary" />}
          label={t(language, "settings.offlineAccess")}
          right={<RowValue value={t(language, "settings.included")} />}
          onPress={() => onNav("downloads")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.accessibilitySection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<User size={20} className="text-primary" />}
          label={t(language, "settings.accessibility")}
          right={<RowChevron />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.progressSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<BarChart3 size={20} className="text-primary" />}
          label={t(language, "settings.myProgress")}
          right={<RowChevron />}
          onPress={() => onNav("progress")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.accountSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        {!isGuest && (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Wifi size={20} className="text-primary" />}
            label={t(language, "settings.accountSync")}
            right={
              <RowValue
                value={
                  syncError
                    ? t(language, "settings.accountNeedsAttention")
                    : isSyncing
                      ? t(language, "common.syncing")
                      : t(language, "settings.accountUpToDate")
                }
                withChevron={false}
              />
            }
          />
        )}
        {isGuest && (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Wifi size={20} className="text-primary" />}
            label={t(language, "settings.activateAccount")}
            right={<RowChevron />}
            onPress={onActivateAccount}
            hasDivider={false}
          />
        )}
        {!isGuest && (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--destructive) 15%, transparent)"
            icon={<LogOut size={20} className="text-destructive" />}
            label={t(language, "common.signOut")}
            labelColor="text-destructive"
            right={<RowChevron />}
            onPress={onSignOut}
            hasDivider={false}
          />
        )}
      </div>

      <SectionLabel label={t(language, "settings.supportSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Info size={20} className="text-primary" />}
          label={t(language, "settings.aboutHelp")}
          right={<RowChevron />}
          onPress={() => onNav("about")}
          hasDivider={false}
        />
      </div>
    </div>
  );
}
