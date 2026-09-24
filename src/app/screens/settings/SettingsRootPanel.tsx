import { useState, type ReactNode } from "react";
import {
  Calendar,
  BookOpen,
  Database,
  Download,
  FileText,
  Globe,
  Headphones,
  HelpCircle,
  Info,
  MapPin,
  Moon,
  Search,
  Sparkles,
  TypeIcon,
  User,
  X,
} from "../../components/icons";
import { t } from "../../i18n";
import { LANGUAGES_LIST } from "../../languageOptions";
import type { AppLanguage, LocationSettings, TextSizeOption, ThemeMode, ZikrFontOption } from "../../types";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Button } from "../../components/ui/button";
import { formatNumerals } from "../../formatting";
import { RowChevron, RowValue, SettingsRowItem, SettingsSection } from "./SettingsPrimitives";

import { ThemeModeSelector } from "./ThemeModeSelector";
import type { SettingsRoutePanel } from "../../routing";

export type SettingsSubScreen = SettingsRoutePanel;

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
  quietProgressEnabled,
  locationSettings,
  calendarType = "hijri",
  onCalendarTypeChange,
  hijriDateOffset = 0,
  onHijriDateOffsetChange,
  textSize,
  zikrFont,
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
  hijriDateOffset?: number;
  onHijriDateOffsetChange?: (offset: number) => void;
  textSize?: TextSizeOption;
  zikrFont?: ZikrFontOption;
  /** When set, highlights the matching row (two-pane layout). */
  activeSub?: SettingsSubScreen;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const itemProps = (screen: SettingsSubScreen) => ({
    current: activeSub === screen,
    testId: `settings-sub-${screen}`,
  });

  const searchableItems: Array<{
    id: SettingsSubScreen;
    icon: ReactNode;
    title: string;
    description: string;
    keywords: string[];
  }> = [
    {
      id: "notifications",
      icon: <MapPin size={20} className="text-primary" />,
      title: t(language, "settings.prayerTimesAndReminders"),
      description: locationSettings?.cityName || t(language, "settings.locationNotSet"),
      keywords: [
        "prayer",
        "times",
        "reminders",
        "adhan",
        "athan",
        "fajr",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
        "مواقيت",
        "صلاة",
        "تذكير",
        "أذان",
        "الفجر",
        "الظهر",
        "العصر",
        "المغرب",
        "العشاء",
        "تنبيهات",
      ],
    },
    {
      id: "reading",
      icon: <TypeIcon size={20} className="text-primary" />,
      title: t(language, "settings.readingAndTypography"),
      description: t(language, "settings.readingAndTypographyDesc"),
      keywords: [
        "font",
        "text size",
        "typography",
        "translation",
        "transliteration",
        "arabic",
        "naskh",
        "humanist",
        "خط",
        "حجم",
        "تكبير",
        "تصغير",
        "الرقعة",
        "النسخ",
        "ترجمة",
        "نطق",
        "قراءة",
      ],
    },
    {
      id: "audio",
      icon: <Headphones size={20} className="text-primary" />,
      title: t(language, "settings.audioRecitations"),
      description: t(language, "settings.audioRecitationsDesc"),
      keywords: ["audio", "reciter", "speed", "playback", "صوت", "قارئ", "سرعة", "تشغيل", "تلاوة"],
    },
    {
      id: "progress",
      icon: <Sparkles size={20} className="text-primary" />,
      title: t(language, "settings.myProgress"),
      description: quietProgressEnabled ? t(language, "settings.gardenActive") : t(language, "settings.gardenHidden"),
      keywords: [
        "progress",
        "garden",
        "streak",
        "palms",
        "leaves",
        "habits",
        "goal",
        "تقدم",
        "حديقة",
        "أشجار",
        "عادات",
        "هدف",
        "إنجاز",
      ],
    },
    {
      id: "accessibility",
      icon: <User size={20} className="text-primary" />,
      title: t(language, "settings.accessibility"),
      description: t(language, "settings.accessibilitySection"),
      keywords: [
        "accessibility",
        "contrast",
        "motion",
        "transparency",
        "haptic",
        "vibration",
        "colorblind",
        "rtl",
        "سهولة الاستخدام",
        "تباين",
        "حركة",
        "شفافية",
        "اهتزاز",
        "عمى الألوان",
        "يمين",
      ],
    },
    {
      id: "downloads",
      icon: <Download size={20} className="text-primary" />,
      title: t(language, "settings.offlineAccess"),
      description: t(language, "settings.included"),
      keywords: [
        "offline",
        "download",
        "storage",
        "mushaf",
        "audio",
        "pack",
        "تنزيل",
        "غير متصل",
        "دون اتصال",
        "مصحف",
        "صوت",
        "حزمة",
      ],
    },
    {
      id: "account-data",
      icon: <Database size={20} className="text-primary" />,
      title: t(language, "settings.accountData"),
      description: isGuest ? t(language, "settings.activateAccount") : t(language, "settings.accountUpToDate"),
      keywords: [
        "account",
        "sync",
        "qr",
        "cloud",
        "backup",
        "export",
        "login",
        "حساب",
        "مزامنة",
        "باركود",
        "سحابي",
        "نسخ احتياطي",
        "تصدير",
        "تسجيل",
      ],
    },
    {
      id: "sources",
      icon: <BookOpen size={20} className="text-primary" />,
      title: t(language, "settings.contentSources"),
      description: t(language, "settings.contentSources"),
      keywords: [
        "sources",
        "hadith",
        "sunnah",
        "references",
        "bukhari",
        "muslim",
        "مصادر",
        "حديث",
        "سنة",
        "مراجع",
        "بخاري",
        "مسلم",
        "أسانيد",
      ],
    },
    {
      id: "help",
      icon: <HelpCircle size={20} className="text-primary" />,
      title: t(language, "settings.helpFaq"),
      description: t(language, "settings.helpFaq"),
      keywords: ["help", "faq", "questions", "support", "مساعدة", "أسئلة", "شائعة", "دعم"],
    },
    {
      id: "legal",
      icon: <FileText size={20} className="text-primary" />,
      title: t(language, "settings.privacyTerms"),
      description: t(language, "settings.privacyTerms"),
      keywords: ["privacy", "terms", "legal", "policy", "خصوصية", "شروط", "سياسة"],
    },
    {
      id: "about",
      icon: <Info size={20} className="text-primary" />,
      title: t(language, "settings.aboutHelp"),
      description: t(language, "settings.aboutHelp"),
      keywords: ["about", "version", "developer", "حول", "إصدار", "تطبيق"],
    },
  ];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = trimmedQuery
    ? searchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmedQuery) ||
          item.description.toLowerCase().includes(trimmedQuery) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(trimmedQuery)),
      )
    : [];

  return (
    <div className="flex-1 overflow-y-auto pb-8">
      {/* ── Client-side Instant Search Bar ── */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <label htmlFor="settings-search-input" className="sr-only">
            {t(language, "settings.searchPlaceholder")}
          </label>
          <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={18} aria-hidden="true" />
          </span>
          <input
            id="settings-search-input"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t(language, "settings.searchPlaceholder")}
            aria-label={t(language, "settings.searchPlaceholder")}
            className="w-full rounded-2xl border border-border/50 bg-card py-2.5 ps-10 pe-10 text-sm font-medium text-foreground placeholder:text-muted-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t(language, "settings.clearSearch")}
              className="absolute end-2 top-1/2 -translate-y-1/2 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {trimmedQuery ? (
        /* ── Search Results ── */
        <div className="mt-3">
          {filteredItems.length > 0 ? (
            <SettingsSection label={t(language, "common.searchResults")}>
              {filteredItems.map((item, idx) => (
                <SettingsRowItem
                  key={item.id}
                  iconBg={iconBackground}
                  icon={item.icon}
                  label={item.title}
                  right={<RowChevron />}
                  onPress={() => onNav(item.id)}
                  hasDivider={idx < filteredItems.length - 1}
                  {...itemProps(item.id)}
                />
              ))}
            </SettingsSection>
          ) : (
            <div className="mx-4 mt-6 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs">
              <Search size={28} className="mx-auto mb-2 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm font-semibold text-foreground">{t(language, "settings.noSearchResults")}</p>
            </div>
          )}
        </div>
      ) : (
        /* ── Default Settings Hierarchy ── */
        <>
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
            <ThemeModeSelector
              language={language}
              direction={direction}
              value={themeMode}
              onChange={onThemeModeChange}
            />
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
                      selected ? "bg-background text-foreground shadow-sm" : "text-foreground hover:bg-muted/40"
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
                          selected ? "bg-background text-foreground shadow-sm" : "text-foreground hover:bg-muted/40"
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

          {/* ── 2. Devotional Routine: Prayer Times & Wird Progress ── */}
          <SettingsSection label={t(language, "settings.routineAndReminders")}>
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<MapPin size={20} className="text-primary" />}
              label={t(language, "settings.prayerTimesAndReminders")}
              right={<RowValue value={locationSettings?.cityName || t(language, "settings.locationNotSet")} />}
              onPress={() => onNav("notifications")}
              hasDivider={true}
              {...itemProps("notifications")}
            />
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<Sparkles size={20} className="text-primary" />}
              label={t(language, "settings.myProgress")}
              right={
                <RowValue
                  value={
                    quietProgressEnabled ? t(language, "settings.gardenActive") : t(language, "settings.gardenHidden")
                  }
                />
              }
              onPress={() => onNav("progress")}
              hasDivider={false}
              {...itemProps("progress")}
            />
          </SettingsSection>

          {/* ── 3. Reading & Typography ── */}
          <SettingsSection label={t(language, "settings.readingAndTypography")}>
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<TypeIcon size={20} className="text-primary" />}
              label={t(language, "settings.readingAndTypography")}
              right={
                <RowValue
                  value={
                    textSize
                      ? `${t(
                          language,
                          textSize === "small"
                            ? "settings.textSmall"
                            : textSize === "large"
                              ? "settings.textLarge"
                              : "settings.medium",
                        )} · ${t(
                          language,
                          zikrFont === "clear"
                            ? "settings.zikrFontClear"
                            : zikrFont === "naskh"
                              ? "settings.zikrFontNaskh"
                              : "settings.zikrFontHumanist",
                        )}`
                      : t(language, "common.settings")
                  }
                />
              }
              onPress={() => onNav("reading")}
              hasDivider={true}
              {...itemProps("reading")}
            />
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<Headphones size={20} className="text-primary" />}
              label={t(language, "settings.audioRecitations")}
              right={<RowChevron />}
              onPress={() => onNav("audio")}
              hasDivider={false}
              {...itemProps("audio")}
            />
          </SettingsSection>

          {/* ── 4. Accessibility & Offline Access ── */}
          <SettingsSection label={t(language, "settings.accessibilitySection")}>
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<User size={20} className="text-primary" />}
              label={t(language, "settings.accessibility")}
              right={<RowChevron />}
              onPress={() => onNav("accessibility")}
              hasDivider={true}
              {...itemProps("accessibility")}
            />
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<Download size={20} className="text-primary" />}
              label={t(language, "settings.offlineAccess")}
              right={<RowValue value={t(language, "settings.included")} />}
              onPress={() => onNav("downloads")}
              hasDivider={false}
              {...itemProps("downloads")}
            />
          </SettingsSection>

          {/* ── 5. Account & Synchronization ── */}
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

          {/* ── 6. About & Support ── */}
          <SettingsSection label={t(language, "settings.supportSection")}>
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<BookOpen size={20} className="text-primary" />}
              label={t(language, "settings.contentSources")}
              right={<RowChevron />}
              onPress={() => onNav("sources")}
              hasDivider={true}
              {...itemProps("sources")}
            />
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<HelpCircle size={20} className="text-primary" />}
              label={t(language, "settings.helpFaq")}
              right={<RowChevron />}
              onPress={() => onNav("help")}
              hasDivider={true}
              {...itemProps("help")}
            />
            <SettingsRowItem
              iconBg={iconBackground}
              icon={<FileText size={20} className="text-primary" />}
              label={t(language, "settings.privacyTerms")}
              right={<RowChevron />}
              onPress={() => onNav("legal")}
              hasDivider={true}
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
        </>
      )}
    </div>
  );
}
