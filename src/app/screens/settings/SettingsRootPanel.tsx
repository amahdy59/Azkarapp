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
  Moon,
  User,
} from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage, ThemeMode } from "../../types";
import { RowChevron, RowValue, SectionLabel, SettingsRowItem } from "./SettingsPrimitives";
import { ThemeModeSelector } from "./ThemeModeSelector";

export type SettingsSubScreen =
  | "root"
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

const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";

export function SettingsRootPanel({
  onNav,
  language,
  direction,
  themeMode,
  highContrast,
  onThemeModeChange,
  onDisableHighContrast,
  languageLabel,
  isGuest,
  isSyncing,
  syncError,
  quietProgressEnabled,
}: {
  onNav: (screen: SettingsSubScreen) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  themeMode: ThemeMode;
  highContrast: boolean;
  onThemeModeChange: (value: ThemeMode) => void;
  onDisableHighContrast: () => void;
  languageLabel: string;
  isGuest: boolean;
  isSyncing: boolean;
  syncError: string;
  quietProgressEnabled: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto pb-8">
      <SectionLabel label={t(language, "settings.preferences")} />
      <div className="mx-4 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: iconBackground }}
            aria-hidden="true"
          >
            <Moon size={20} className="text-primary" />
          </span>
          <h3 className="text-[1rem] font-semibold text-foreground">{t(language, "settings.displayTheme")}</h3>
        </div>
        <ThemeModeSelector language={language} direction={direction} value={themeMode} onChange={onThemeModeChange} />
        {highContrast && (
          <aside className="mt-3 rounded-xl border border-primary/40 bg-primary/10 p-3" aria-live="polite">
            <h4 className="text-[0.875rem] font-semibold text-foreground">
              {t(language, "appearance.highContrastTitle")}
            </h4>
            <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
              {t(language, "appearance.highContrastBody")}
            </p>
            <button
              type="button"
              onClick={onDisableHighContrast}
              className="mt-2 min-h-11 rounded-xl bg-primary px-3 text-[0.75rem] font-semibold text-primary-foreground"
            >
              {t(language, "appearance.disableHighContrast")}
            </button>
          </aside>
        )}
      </div>

      <div className="mx-4 mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <SettingsRowItem
          iconBg={iconBackground}
          icon={<Globe size={20} className="text-primary" />}
          label={t(language, "settings.language")}
          right={<RowValue value={languageLabel} />}
          onPress={() => onNav("language")}
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
          right={<RowValue value={t(language, quietProgressEnabled ? "garden.shown" : "garden.hidden")} />}
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
