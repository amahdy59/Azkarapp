import { Bell, BarChart3, Download, Globe, LogOut, Menu, Moon, User, Wifi } from "../../components/icons";
import { motion } from "motion/react";
import { t } from "../../i18n";
import type { AppLanguage, TextSizeOption, ThemeMode } from "../../types";
import { RowChevron, RowValue, SectionLabel, SettingsRowItem } from "./SettingsPrimitives";

export type SettingsSubScreen =
  "root" | "language" | "accessibility" | "downloads" | "notifications" | "progress" | "about";

function formatTextSize(value: TextSizeOption) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
    <motion.div
      className="flex-1 overflow-y-auto pb-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
      transition={{
        opacity: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" },
        y: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" },
      }}
    >
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
          right={
            <RowValue value={themeMode === "dark" ? "Dark Mode" : themeMode === "light" ? "Light Mode" : "Midnight"} />
          }
          onPress={() => onThemeModeChange(getNextThemeMode(themeMode))}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Menu size={20} className="text-primary" />}
          label={t(language, "settings.textSize") || "Text Size"}
          right={<RowValue value={formatTextSize(textSize)} />}
          onPress={() => onNav("accessibility")}
        />
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Bell size={20} className="text-primary" />}
          label="Notifications"
          right={<RowValue value="Setup" />}
          onPress={() => onNav("notifications")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Content" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<Download size={20} className="text-primary" />}
          label="Offline Access"
          right={<RowValue value="Included" />}
          onPress={() => onNav("downloads")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Accessibility" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
          icon={<User size={20} className="text-primary" />}
          label="Accessibility"
          right={<RowChevron />}
          onPress={() => onNav("accessibility")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label="Account" />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        {!isGuest && (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Wifi size={20} className="text-primary" />}
            label="Account Sync"
            right={
              <RowValue
                value={syncError ? "Needs attention" : isSyncing ? "Syncing…" : "Up to date"}
                withChevron={false}
              />
            }
          />
        )}
        {isGuest ? (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<Wifi size={20} className="text-primary" />}
            label={t(language, "settings.activateAccount")}
            right={<RowChevron />}
            onPress={onActivateAccount}
          />
        ) : (
          <SettingsRowItem
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            icon={<BarChart3 size={20} className="text-primary" />}
            label="My Progress"
            right={<RowChevron />}
            onPress={() => onNav("progress")}
          />
        )}
        <SettingsRowItem
          iconBg="color-mix(in srgb, var(--destructive) 15%, transparent)"
          icon={<LogOut size={20} className="text-destructive" />}
          label={t(language, "common.signOut") || "Sign Out"}
          labelColor="text-destructive"
          right={!isGuest ? <RowChevron /> : undefined}
          onPress={onSignOut}
          hasDivider={false}
        />
      </div>
    </motion.div>
  );
}
