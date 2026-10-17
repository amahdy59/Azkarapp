import { displayLocationName } from "../../content/prayerLocations";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  BookOpen,
  Database,
  Download,
  FileText,
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

import type { AppLanguage, LocationSettings, TextSizeOption, ThemeMode, ZikrFontOption } from "../../types";

import { RowChevron, SettingsRowItem, SettingsSection } from "./SettingsPrimitives";

import type { SettingsRoutePanel } from "../../routing";

export type SettingsSubScreen = SettingsRoutePanel;

const iconBackground = "color-mix(in srgb, var(--primary) 12%, transparent)";

export function SettingsRootPanel({
  onNav,
  language,
  direction,
  themeMode,
  isGuest,
  isSyncing,
  syncError,
  quietProgressEnabled,
  locationSettings,
  textSize,
  activeSub,
  focusOnMount,
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
  focusOnMount?: SettingsSubScreen;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusOnMount) return;
    const frame = requestAnimationFrame(() =>
      panelRef.current?.querySelector<HTMLElement>(`[data-testid="settings-sub-${focusOnMount}"]`)?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [focusOnMount]);

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
      icon: <Bell size={20} className="text-primary" />,
      title: t(language, "settings.notificationsAndReminders"),
      description: t(language, "notifications.scheduleHint"),
      keywords: [
        "notifications",
        "notification",
        "reminders",
        "reminder",
        "alerts",
        "alert",
        "prayer",
        "times",
        "adhan",
        "athan",
        "fajr",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
        "إشعارات",
        "إشعار",
        "تنبيهات",
        "تنبيه",
        "تذكيرات",
        "تذكير",
        "مواقيت",
        "صلاة",
        "أذان",
        "الفجر",
        "الظهر",
        "العصر",
        "المغرب",
        "العشاء",
      ],
    },
    {
      id: "location",
      icon: <MapPin size={20} className="text-primary" />,
      title: t(language, "settings.prayerTimesAndLocation"),
      description: displayLocationName(locationSettings, language) || t(language, "settings.locationNotSet"),
      keywords: [
        "location",
        "city",
        "gps",
        "calculation",
        "timezone",
        "prayer times",
        "موقع",
        "مدينة",
        "حساب",
        "مواقيت",
        "توقيت",
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
      title: t(language, "settings.progressPreferences"),
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

  const mainItems: Array<{ id: SettingsSubScreen; title: string; icon: ReactNode; value?: string }> = [
    {
      id: "appearance",
      title: t(language, "settings.appearanceLanguage"),
      icon: <Moon size={20} className="text-primary" />,
      value: t(
        language,
        themeMode === "light"
          ? "settings.themeLight"
          : themeMode === "dark"
            ? "settings.themeDark"
            : "settings.themeMidnight",
      ),
    },
    {
      id: "reading",
      title: t(language, "settings.readingAndTypography"),
      icon: <TypeIcon size={20} className="text-primary" />,
      value: textSize
        ? t(
            language,
            textSize === "small"
              ? "settings.textSmall"
              : textSize === "large"
                ? "settings.textLarge"
                : "settings.medium",
          )
        : undefined,
    },
    {
      id: "prayer",
      title: t(language, "settings.prayerReminders"),
      icon: <Bell size={20} className="text-primary" />,
      value: displayLocationName(locationSettings, language),
    },
    {
      id: "audio",
      title: t(language, "settings.audioDownloads"),
      icon: <Headphones size={20} className="text-primary" />,
    },
    {
      id: "progress",
      title: t(language, "settings.progressPreferences"),
      icon: <Sparkles size={20} className="text-primary" />,
      value: quietProgressEnabled ? t(language, "settings.gardenActive") : t(language, "settings.gardenHidden"),
    },
    {
      id: "accessibility",
      title: t(language, "settings.accessibility"),
      icon: <User size={20} className="text-primary" />,
    },
    {
      id: "account-data",
      title: t(language, "settings.accountData"),
      icon: <Database size={20} className="text-primary" />,
      value: isGuest
        ? t(language, "settings.activateAccount")
        : isSyncing
          ? t(language, "common.syncing")
          : syncError
            ? t(language, "accountData.needsAttention")
            : t(language, "settings.accountUpToDate"),
    },
  ];
  searchableItems.unshift({
    id: "appearance",
    title: t(language, "settings.appearanceLanguage"),
    description: t(language, "settings.language"),
    icon: <Moon size={20} className="text-primary" />,
    keywords: [
      "theme",
      "appearance",
      "language",
      "calendar",
      "hijri",
      "المظهر",
      "لغة",
      "تقويم",
      "هجري",
      "فاتح",
      "داكن",
    ],
  });
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = trimmedQuery
    ? searchableItems.filter(
        (item) =>
          item.title.toLowerCase().includes(trimmedQuery) ||
          item.description.toLowerCase().includes(trimmedQuery) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(trimmedQuery)),
      )
    : [];

  const [hasScrolled, setHasScrolled] = useState(false);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const next = e.currentTarget.scrollTop > 4;
    if (next !== hasScrolled) setHasScrolled(next);
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden" dir={direction}>
      {/* ── Client-side Instant Search Bar Pinned at Top (sticky with Header) ── */}
      <div
        data-scrolled={hasScrolled || undefined}
        className="settings-search-sticky shrink-0 border-b border-border/40 px-[var(--settings-gutter,1rem)] pt-1 pb-3 transition-colors duration-standard"
      >
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
            aria-label={t(language, "settings.searchPlaceholder")}
            className="w-full rounded-2xl border border-border/50 bg-card py-2.5 ps-10 pe-10 text-sm font-medium text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          />
          {!searchQuery && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-sm text-muted-foreground truncate"
              style={{ insetInlineStart: "2.5rem", insetInlineEnd: "2.5rem" }}
            >
              {t(language, "settings.searchPlaceholder")}
            </span>
          )}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label={t(language, "settings.clearSearch")}
              className="absolute end-1 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* ── Scrollable Settings Rows ── */}
      <div ref={panelRef} onScroll={handleScroll} className="settings-root-panel flex-1 overflow-y-auto pb-8 pt-3">
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
              <div className="mx-[var(--settings-gutter,1rem)] mt-6 rounded-2xl border border-border/50 bg-card p-6 text-center shadow-xs">
                <Search size={28} className="mx-auto mb-2 text-muted-foreground/60" aria-hidden="true" />
                <p className="text-sm font-semibold text-foreground">{t(language, "settings.noSearchResults")}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <SettingsSection className="mt-3">
              {mainItems.map((item, index) => (
                <SettingsRowItem
                  key={item.id}
                  iconBg={iconBackground}
                  icon={item.icon}
                  label={item.title}
                  description={item.value}
                  right={<RowChevron />}
                  onPress={() => onNav(item.id)}
                  hasDivider={index < mainItems.length - 1}
                  {...itemProps(item.id)}
                />
              ))}
            </SettingsSection>
            <SettingsSection label={t(language, "settings.supportSection")}>
              {searchableItems
                .filter((item) => ["help", "sources", "legal", "about"].includes(item.id))
                .map((item, index) => (
                  <SettingsRowItem
                    key={item.id}
                    iconBg={iconBackground}
                    icon={item.icon}
                    label={item.title}
                    right={<RowChevron />}
                    onPress={() => onNav(item.id)}
                    hasDivider={index < 3}
                    {...itemProps(item.id)}
                  />
                ))}
            </SettingsSection>
          </>
        )}
      </div>
    </div>
  );
}
