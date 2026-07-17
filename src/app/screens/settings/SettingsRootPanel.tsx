import {
  Bell,
  BarChart3,
  BookOpen,
  Database,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Menu,
  Moon,
  User,
} from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, TextSizeOption, ThemeMode } from "../../types";
import { RowChevron, RowValue, SectionLabel, SettingsRowItem } from "./SettingsPrimitives";

export type SettingsSubScreen =
  | "root"
  | "appearance"
  | "language"
  | "accessibility"
  | "downloads"
  | "notifications"
  | "progress"
  | "account-data"
  | "help"
  | "legal"
  | "sources"
  | "about";

function formatTextSize(value: TextSizeOption, language: AppLanguage) {
  return t(
    language,
    value === "small" ? "settings.textSmall" : value === "large" ? "settings.textLarge" : "settings.medium",
  );
}

function formatThemeMode(value: ThemeMode, language: AppLanguage) {
  return t(language, `settings.theme${value.charAt(0).toUpperCase()}${value.slice(1)}`);
}

const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";

export function SettingsRootPanel({
  onNav,
  language,
  themeMode,
  languageLabel,
  textSize,
  isGuest,
  isSyncing,
  syncError,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  themeMode: ThemeMode;
  languageLabel: string;
  textSize: TextSizeOption;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <SectionLabel label={t(language, "settings.preferences")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Moon size={20} className="text-primary" />}
          label={t(language, "settings.displayTheme")}
          right={<RowValue value={formatThemeMode(themeMode, language)} />}
          onPress={() => onNav("appearance")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Globe size={20} className="text-primary" />}
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Menu size={20} className="text-primary" />}
          label={t(language, "settings.textSize")}
          right={<RowValue value={formatTextSize(textSize, language)} />}
          onPress={() => onNav("accessibility")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
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
          iconBg={iconBackground}
          icon={<Download size={20} className="text-primary" />}
          label={t(language, "settings.offlineAccess")}
          right={<RowValue value={t(language, "settings.included")} />}
          onPress={() => onNav("downloads")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<BookOpen size={20} className="text-primary" />}
          label={t(language, "settings.contentSources")}
          right={<RowChevron />}
          onPress={() => onNav("sources")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.accessibilitySection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg={iconBackground}
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
          iconBg={iconBackground}
          icon={<BarChart3 size={20} className="text-primary" />}
          label={t(language, "settings.myProgress")}
          right={<RowChevron />}
          onPress={() => onNav("progress")}
          hasDivider={false}
        />
      </div>

      <SectionLabel label={t(language, "settings.accountSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
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
        />
      </div>

      <SectionLabel label={t(language, "settings.supportSection")} />
      <div className="mx-4 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<HelpCircle size={20} className="text-primary" />}
          label={t(language, "settings.helpFaq")}
          right={<RowChevron />}
          onPress={() => onNav("help")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<FileText size={20} className="text-primary" />}
          label={t(language, "settings.privacyTerms")}
          right={<RowChevron />}
          onPress={() => onNav("legal")}
        />
        <SettingsRowItem
          iconBg={iconBackground}
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
