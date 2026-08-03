import { useMemo, useState } from "react";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { createDailyCompletionIndex, getMonthGardenDays, getYearGardenStats } from "../gardenViews";
import {
  getGardenSummary,
  MAIN_CATEGORY_IDS,
  type GardenMilestoneId,
  type GardenSummary,
  type GrowthEvent,
} from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";
import { Flame, Heart } from "./icons";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

// ─── SVG Leaf & Palm Marks ───────────────────────────────────────────────────

/** Golden Leaf Mark — earned for completing core daily protection azkar (morning, evening, before sleep). */
export function GoldenLeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill="#F59E0B"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="#D97706"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="#92400E"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green Leaf Mark — earned for completing any non-core azkar group (after prayer, food, travel, etc.). */
export function GreenLeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill="#10B981"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="#059669"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="#064E3B"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function LeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return <GoldenLeafMark filled={filled} className={className} size={size} />;
}

export function PaleLeafMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  return <GreenLeafMark filled className={className} size={size} />;
}

export function BudMark({ className = "", size = 14 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 13 C7 9.5 4.5 7 4.5 5 C4.5 3.3 5.6 2 7 2 C8.4 2 9.5 3.3 9.5 5 C9.5 7 7 9.5 7 13Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Single unified Palm Tree vector matching public/palm-tree.svg across the app. */
export function PalmTreeMark({
  filled = true,
  className = "",
  size = 32,
  color,
  strokeWidth = 3.5,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${!filled && !color ? "opacity-40" : ""}`}
      aria-hidden="true"
      focusable="false"
    >
      {/* Left lower frond */}
      <path d="M48 38 C32 30 15 32 8 46 C15 48 20 44 26 39 C22 47 20 54 28 58 C32 50 40 43 48 38 Z" />
      {/* Left upper frond */}
      <path d="M48 35 C38 18 25 10 10 14 C12 21 17 24 24 22 C18 28 16 34 24 38 C32 34 40 35 48 35 Z" />
      {/* Right frond */}
      <path d="M50 35 C62 18 78 18 88 28 C80 32 74 28 68 33 C76 36 78 44 68 45 C60 41 55 38 50 35 Z" />
      {/* Trunk */}
      <path d="M43 38 C34 48 32 62 38 82 C38 88 45 88 56 88 C59 88 60 82 59 78 C53 78 48 76 45 74 C43 60 45 48 51 38" />
    </svg>
  );
}

/** Golden Palm Tree Mark — matching golden amber (#E4A84A). */
export function GoldenPalmMark({
  className = "",
  size = 28,
  color = "#E4A84A",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return <PalmTreeMark size={size} color={color} className={className} />;
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}

// ─── PalmTreeReward Header Widget ───────────────────────────────────────────

export function PalmTreeReward({
  summary,
  language,
  bare = false,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  onOpenShareModal?: () => void;
  bare?: boolean;
}) {
  const streak = summary.currentUsageStreak ?? summary.activeDaysLast7 ?? 0;
  const isArabic = language === "ar";
  // Today's golden leaves = how many of the 3 core categories (morning/evening/sleep) completed today
  const todayLeaves = summary.today.goldenLeafCount;
  const maxLeaves = 3;

  // Bare mode: compact 2-column row matching Figma gamification header
  // (streak on start side, palms on end side — leaves shown only in the Wird card)
  if (bare) {
    return (
      <div
        className="flex w-full items-center justify-between py-1"
        aria-label={
          isArabic
            ? `أشجار النخيل: ${formatNumerals(summary.lifetimePalms, language)}، أوراق اليوم: ${formatNumerals(todayLeaves, language)} من ${formatNumerals(maxLeaves, language)}، السلسلة اليومية: ${formatNumerals(streak, language)} أيام`
            : `Palms: ${summary.lifetimePalms}, Today's leaves: ${todayLeaves} of ${maxLeaves}, Daily streak: ${streak} days`
        }
      >
        {/* Streak — start side */}
        <div className="flex items-center gap-1" title={isArabic ? "السلسلة اليومية" : "Daily Streak"}>
          <span className="whitespace-nowrap text-[0.875rem] font-black leading-tight text-[#fbbf24] font-sans">
            {formatNumerals(streak, language)} {isArabic ? "أيام" : "days"}
          </span>
          <Flame className="h-[1rem] w-[1rem] text-[#fbbf24]" strokeWidth={2.5} />
        </div>

        {/* Palms — end side */}
        <div className="flex items-center gap-1" title={isArabic ? "أشجار النخيل" : "Palms"}>
          <PalmTreeMark size={18} />
          <span className="whitespace-nowrap text-[0.875rem] font-black leading-tight text-[#fbbf24] font-sans">
            {formatNumerals(summary.lifetimePalms, language)} {isArabic ? "نخلة" : "palms"}
          </span>
        </div>
      </div>
    );
  }

  const content = (
    <div
      className="grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 py-1"
      aria-label={
        isArabic
          ? `أشجار النخيل: ${formatNumerals(summary.lifetimePalms, language)}، أوراق اليوم: ${formatNumerals(todayLeaves, language)} من ${formatNumerals(maxLeaves, language)}، السلسلة اليومية: ${formatNumerals(streak, language)} أيام`
          : `Palms: ${summary.lifetimePalms}, Today's leaves: ${todayLeaves} of ${maxLeaves}, Daily streak: ${streak} days`
      }
    >
      <div className="flex min-w-0 items-center justify-center gap-1" title={isArabic ? "أشجار النخيل" : "Palms"}>
        <PalmTreeMark size={20} />
        <span className="whitespace-nowrap text-[0.75rem] font-black leading-tight text-amber-500 min-[360px]:text-[0.875rem] font-sans">
          {formatNumerals(summary.lifetimePalms, language)} {isArabic ? "نخلة" : "palms"}
        </span>
      </div>
      <span className="h-4 w-px bg-border/40" />
      <div
        className="flex min-w-0 items-center justify-center gap-0.5"
        title={isArabic ? "أوراق اليوم" : "Today's Leaves"}
      >
        {Array.from({ length: maxLeaves }).map((_, i) => (
          <GoldenLeafMark key={i} size={19} filled={i < todayLeaves} />
        ))}
      </div>
      <span className="h-4 w-px bg-border/40" />
      <div
        className="flex min-w-0 items-center justify-center gap-1"
        title={isArabic ? "السلسلة اليومية" : "Daily Streak"}
      >
        <Flame className="h-[1.125rem] w-[1.125rem] text-[#F59E0B]" strokeWidth={2.5} />
        <span className="whitespace-nowrap text-[0.75rem] font-black leading-tight text-amber-500 min-[360px]:text-[0.875rem] font-sans">
          {formatNumerals(streak, language)} {isArabic ? "أيام" : "days"}
        </span>
      </div>
    </div>
  );

  return (
    <div className="flex w-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 shadow-xs dark:bg-amber-500/15">
      {content}
    </div>
  );
}

// ─── Date Label Helper & Parsers ──────────────────────────────────────────────

function parseCleanNumber(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  const str = String(val ?? "");
  const western = str.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const parsed = parseInt(western.replace(/\D/g, ""), 10);
  return isNaN(parsed) ? 1 : parsed;
}

function getHijriDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear.replace(/AH|AD/gi, "").trim();
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

function getGregorianDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-EG" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear;
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

const HIJRI_MONTH_NAMES_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
];

const HIJRI_MONTH_NAMES_EN = [
  "Muharram",
  "Safar",
  "Rabi' I",
  "Rabi' II",
  "Jumada I",
  "Jumada II",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

const GREGORIAN_MONTH_NAMES_AR = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const GREGORIAN_MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function padZero(val: number) {
  return String(val).padStart(2, "0");
}

const ARABIC_WEEK_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

export function getGardenDateLabel(
  displayDate: Date,
  tab: "day" | "week" | "month" | "year",
  offset: number,
  language: AppLanguage,
  calendarType: "hijri" | "gregorian" = "hijri",
): string {
  const isArabic = language === "ar";
  const isHijri = calendarType === "hijri";
  const { weekday, day, month, year } = isHijri
    ? getHijriDetails(displayDate, language)
    : getGregorianDetails(displayDate, language);

  const eraSuffix = isHijri ? (isArabic ? "هـ" : "AH") : isArabic ? "م" : "AD";

  if (tab === "day") {
    if (offset === 0) {
      return isArabic
        ? `اليوم ${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
        : `Today, ${weekday} ${day} ${month} ${year} ${eraSuffix}`;
    }
    return isArabic
      ? `${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
      : `${weekday}, ${day} ${month} ${year} ${eraSuffix}`;
  }

  if (tab === "week") {
    const weekIndex = Math.min(4, Math.max(0, Math.floor((day - 1) / 7)));
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min((weekIndex + 1) * 7, 30);
    const weekOrdinal = isArabic ? (ARABIC_WEEK_ORDINALS[weekIndex] ?? "الأول") : `Week ${weekIndex + 1}`;

    if (isArabic) {
      return `الأسبوع ${weekOrdinal} (${formatNumerals(startDay, language)} - ${formatNumerals(endDay, language)} ${month} ${year} ${eraSuffix})`;
    }
    return `${weekOrdinal} (${startDay} - ${endDay} ${month} ${year} ${eraSuffix})`;
  }

  if (tab === "month") {
    return isArabic ? `${month} ${year} ${eraSuffix}` : `${month} ${year} ${eraSuffix}`;
  }

  return isArabic ? `${year} ${eraSuffix}` : `${year} ${eraSuffix}`;
}

export function TodayRoutineGarden({
  summary: initialSummary,
  language,
  hideTabs = false,
  onOpenShareModal,
  calendarType = "hijri",
  dailyCompletions = [],
  onSelectCategory,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  hideTabs?: boolean;
  onOpenShareModal?: () => void;
  calendarType?: "hijri" | "gregorian";
  dailyCompletions?: DailyCollectionCompletion[];
  onSelectCategory?: (categoryId: CategoryId) => void;
}) {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [offset, setOffset] = useState(0);

  const isArabic = language === "ar";

  const displayDate = useMemo(() => {
    const d = new Date();
    if (offset !== 0) {
      if (activeTab === "day") {
        d.setDate(d.getDate() + offset);
      } else if (activeTab === "week") {
        d.setDate(d.getDate() + offset * 7);
      } else if (activeTab === "month") {
        d.setMonth(d.getMonth() + offset);
      } else if (activeTab === "year") {
        d.setFullYear(d.getFullYear() + offset);
      }
    }
    return d;
  }, [activeTab, offset]);

  const summary = useMemo(
    () => (offset === 0 && activeTab === "day" ? initialSummary : getGardenSummary(dailyCompletions, displayDate)),
    [initialSummary, dailyCompletions, displayDate, offset, activeTab],
  );

  const totalPalms = summary.lifetimePalms;
  const streak = summary.currentPalmRhythm ?? summary.currentUsageStreak ?? 0;

  const dateLabel = getGardenDateLabel(displayDate, activeTab, offset, language, calendarType);

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    setActiveTab(tab);
    setOffset(0);
  };

  const currentHour = new Date().getHours();
  const activeTimeRoutineId =
    currentHour >= 4 && currentHour < 12
      ? "morning"
      : currentHour >= 12 && currentHour < 20
        ? "evening"
        : "before_sleep";

  const targetYear = displayDate.getFullYear();
  const targetMonth = displayDate.getMonth();
  const completionsByDayKey = useMemo(() => createDailyCompletionIndex(dailyCompletions), [dailyCompletions]);
  const monthDayRecords = useMemo(
    () => getMonthGardenDays(completionsByDayKey, targetYear, targetMonth),
    [completionsByDayKey, targetMonth, targetYear],
  );
  const yearStats = useMemo(
    () => getYearGardenStats(completionsByDayKey, targetYear),
    [completionsByDayKey, targetYear],
  );

  const monthNames = isArabic
    ? calendarType === "hijri"
      ? HIJRI_MONTH_NAMES_AR
      : GREGORIAN_MONTH_NAMES_AR
    : calendarType === "hijri"
      ? HIJRI_MONTH_NAMES_EN
      : GREGORIAN_MONTH_NAMES_EN;

  const completedCount = summary.today.completedCategories.length;
  const dynamicSubtitle =
    completedCount === 0
      ? isArabic
        ? "أكمل أوراد اليوم لتنمو نخلتك"
        : "Complete today's routines to grow your palm"
      : completedCount === 1
        ? isArabic
          ? "بداية ممتازة! أكمل وردين آخرين لنخلة كاملة 🌴"
          : "Great start! Complete 2 more routines for a full palm 🌴"
        : completedCount === 2
          ? isArabic
            ? "أوشكت على الانتهاء! متبقي ورد واحد فقط 🌴"
            : "Almost there! 1 more routine for a full palm 🌴"
          : isArabic
            ? "ماشاء الله! اكتملت جميع أوراد اليوم 🌴"
            : "Masha'Allah! All today's routines completed! 🌴";

  return (
    <section
      data-testid="today-garden-card"
      aria-label={t(language, "garden.todayTitle")}
      className="mb-5 w-full transition-all"
    >
      {!hideTabs && (
        <div className="mb-3 flex items-center justify-between gap-3 text-start">
          <div>
            <h2 className="text-[1.25rem] font-extrabold text-foreground dark:text-white">
              {t(language, "garden.todayTitle")}
            </h2>
            <p className="mt-0.5 text-[0.8125rem] font-semibold text-slate-600 dark:text-amber-300">
              {activeTab === "month"
                ? t(language, "garden.oasisFor", { date: dateLabel })
                : activeTab === "year"
                  ? t(language, "garden.growthYear")
                  : dynamicSubtitle}
            </p>
          </div>

          {onOpenShareModal && (
            <button
              type="button"
              onClick={onOpenShareModal}
              className="flex h-[44px] min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-[0.875rem] font-bold text-slate-950 shadow-sm hover:bg-amber-400 transition-all shrink-0 dark:bg-amber-400 dark:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              aria-label={t(language, "garden.shareAchievementAria")}
              title={t(language, "garden.shareAchievementAria")}
            >
              <PalmTreeMark size={18} filled />
              <span>{t(language, "garden.shareAchievement")}</span>
            </button>
          )}
        </div>
      )}

      {!hideTabs && (
        <>
          <div
            role="tablist"
            aria-label={t(language, "garden.viewMode")}
            className="mb-4 flex rounded-2xl bg-muted/60 p-1 dark:bg-muted/30"
          >
            {(["day", "week", "month", "year"] as const).map((tab) => {
              const isActive = activeTab === tab;
              const keyMap = {
                day: "garden.tabDay",
                week: "garden.tabWeek",
                month: "garden.tabMonth",
                year: "garden.tabYear",
              } as const;

              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleTabChange(tab)}
                  className={`flex flex-1 min-h-[44px] items-center justify-center rounded-xl py-2 text-[0.875rem] font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                    isActive ? "bg-amber-500 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(language, keyMap[tab])}
                </button>
              );
            })}
          </div>

          <div className="mb-4 flex items-center justify-between rounded-2xl border border-border/80 bg-card px-3 py-2 shadow-sm dark:border-white/10">
            <button
              type="button"
              onClick={() => setOffset((prev) => prev - 1)}
              aria-label={t(language, "garden.prevPeriod")}
              title={t(language, "garden.prevPeriod")}
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points={isArabic ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
              </svg>
            </button>

            <span
              className="px-2 text-center text-[0.9375rem] font-black tracking-wide text-foreground"
              data-testid="garden-view-date"
              dir="auto"
              aria-live="polite"
              aria-atomic="true"
            >
              {dateLabel}
            </span>

            <button
              type="button"
              onClick={() => setOffset((prev) => Math.min(0, prev + 1))}
              disabled={offset >= 0}
              aria-label={t(language, "garden.nextPeriod")}
              title={t(language, "garden.nextPeriod")}
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points={isArabic ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
              </svg>
            </button>
          </div>
        </>
      )}

      {!hideTabs && (
        <div className="mb-4 flex items-center justify-around rounded-2xl border border-amber-500/30 bg-amber-500/10 py-2.5 px-3 shadow-xs dark:bg-amber-500/15">
          <div className="flex items-center gap-1.5" title={isArabic ? "السلسلة اليومية" : "Daily Streak"}>
            <span className="text-[1.25rem]" role="img" aria-label={t(language, "garden.streakFlame")}>
              🔥
            </span>
            <span className="text-[1rem] font-black text-amber-700 dark:text-amber-300">
              {formatNumerals(streak, language)} {isArabic ? "أيام" : "days"}
            </span>
          </div>
          <span className="h-4 w-px bg-amber-500/30" />
          <div className="flex items-center gap-1.5" title={isArabic ? "أشجار النخيل" : "Palms"}>
            <PalmTreeMark size={24} filled={totalPalms > 0} />
            <span className="text-[1rem] font-black text-amber-600 dark:text-amber-400">
              {formatNumerals(totalPalms, language)} {isArabic ? "نخلة" : "palms"}
            </span>
          </div>
        </div>
      )}

      {activeTab === "day" && (
        <div className="relative flex w-full flex-col items-center gap-5 overflow-hidden rounded-[24px] p-5 text-start border border-[#e5e7eb] dark:border-[rgba(182,135,70,0.14)] bg-white dark:bg-[rgba(14,18,27,0.85)] shadow-[0px_6px_18px_0px_rgba(0,0,0,0.08)] dark:shadow-sm">
          {/* Header Section */}
          <div className="relative z-10 flex flex-col items-center justify-center gap-1 w-full text-center">
            <h3 className="text-[1.125rem] font-bold text-[#111827] dark:text-[#f0ece6]">
              {isArabic ? "وردك اليوم" : "Today's Wird"}
            </h3>
            <p className="text-[0.8125rem] font-medium text-[#6b7280] dark:text-[#d4a020]">{dynamicSubtitle}</p>
          </div>

          {/* Main Split Row */}
          <div
            className="relative z-10 grid w-full grid-cols-1 items-center gap-4 min-[360px]:grid-cols-[minmax(0,1fr)_120px]"
            data-testid="today-palm-layout"
          >
            {/* Right Column: Zikr Routine List */}
            <ul
              aria-label={isArabic ? "تقدم المجموعات اليومية" : "Today's collection progress"}
              className="flex flex-1 flex-col gap-2.5 min-w-0"
              dir={isArabic ? "rtl" : "ltr"}
            >
              {[
                {
                  id: "morning" as const,
                  name: isArabic ? "أذكار الصباح" : "Morning Azkar",
                  state: summary.today.completedCategories.includes("morning") ? "complete" : "pending",
                },
                {
                  id: "evening" as const,
                  name: isArabic ? "أذكار المساء" : "Evening Azkar",
                  state: summary.today.completedCategories.includes("evening") ? "complete" : "pending",
                },
                {
                  id: "before_sleep" as const,
                  name: isArabic ? "أذكار النوم" : "Before Sleep Azkar",
                  state: summary.today.completedCategories.includes("before_sleep") ? "complete" : "pending",
                },
              ].map((col) => {
                const isDone = col.state === "complete";
                const rowContent = (
                  <div className="flex w-full items-center justify-between gap-2.5">
                    <span
                      className={`text-[0.875rem] font-bold whitespace-nowrap ${
                        isDone ? "text-slate-900 dark:text-[#f0ece6]" : "text-slate-700 dark:text-[#f0ece6]"
                      }`}
                    >
                      {col.name}
                    </span>

                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      aria-hidden="true"
                      className={`shrink-0 ${isDone ? "text-[#F59E0B]" : "text-slate-400 dark:text-slate-500"}`}
                    >
                      <path
                        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
                        stroke="currentColor"
                        strokeOpacity={isDone ? 1 : 0.6}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
                        stroke="currentColor"
                        strokeOpacity={isDone ? 1 : 0.6}
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                );

                return (
                  <li
                    key={col.id}
                    data-testid={`garden-category-${col.id}`}
                    data-state={col.state}
                    aria-label={`${col.name}: ${isDone ? (isArabic ? "مكتمل" : "Complete") : isArabic ? "لم تبدأ بعد" : "Not started yet"}`}
                    className="w-full shrink-0"
                  >
                    {onSelectCategory ? (
                      <button
                        type="button"
                        onClick={() => onSelectCategory(col.id)}
                        className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[12px] px-[12px] py-[10px] text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                          isDone
                            ? "border border-[#fed7aa] bg-[#fff7ed] text-slate-900 hover:bg-[#fff3df] dark:border-[rgba(182,135,70,0.25)] dark:bg-[rgba(30,38,55,0.8)] dark:text-[#f0ece6] dark:hover:bg-[rgba(38,48,70,0.9)]"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-transparent dark:bg-[rgba(20,26,42,0.4)] dark:text-[#f0ece6] dark:hover:bg-[rgba(26,34,54,0.6)]"
                        }`}
                      >
                        {rowContent}
                      </button>
                    ) : (
                      <div
                        className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-[12px] px-[12px] py-[10px] transition-all ${
                          isDone
                            ? "border border-[#fed7aa] bg-[#fff7ed] text-slate-900 dark:border-[rgba(182,135,70,0.14)] dark:bg-[rgba(30,38,55,0.8)] dark:text-[#f0ece6]"
                            : "border border-slate-200 bg-white text-slate-700 dark:border-transparent dark:bg-[rgba(20,26,42,0.4)] dark:text-[#f0ece6]"
                        }`}
                      >
                        {rowContent}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Left Column: Interactive Palm Progress Display */}
            <div className="relative flex flex-col items-center justify-center p-2" data-testid="today-palm-emblem">
              <div className="relative flex size-[110px] items-center justify-center rounded-full bg-amber-500/5 dark:bg-amber-500/10">
                <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 110 110">
                  <circle
                    cx="55"
                    cy="55"
                    r="48"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-[#1e2635]"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="55"
                    cy="55"
                    r="48"
                    stroke="#F59E0B"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={301.6}
                    strokeDashoffset={301.6 - (301.6 * summary.today.goldenLeafCount) / 3}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="relative z-10">
                  <PalmTreeMark
                    size={48}
                    className={
                      summary.today.goldenLeafCount === 3
                        ? "text-[#F59E0B] drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                        : summary.today.goldenLeafCount > 0
                          ? "text-[#E4A84A]"
                          : "text-slate-400 dark:text-slate-500 opacity-40"
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Encouragement Banner */}
          <div
            className="relative z-10 flex items-center justify-center gap-2 rounded-[12px] px-3.5 py-2.5 text-center text-[0.875rem] font-medium w-full bg-[#f3f4f6] dark:bg-[rgba(20,26,42,0.6)] border border-[#e5e7eb] dark:border-[rgba(182,135,70,0.12)]"
            dir="rtl"
          >
            <Heart className="h-[0.875rem] w-[0.875rem] text-rose-500 dark:text-rose-400 shrink-0" strokeWidth={2} />
            <span className="flex-1 text-center font-sans text-slate-700 dark:text-slate-200 text-[12.5px] font-semibold leading-relaxed">
              {isArabic
                ? "القليل الدائم، خير من الكثير المنقطع"
                : "Constant small deeds are better than intermittent large ones"}
            </span>
          </div>
        </div>
      )}

      {activeTab === "week" && (
        <div className="space-y-2.5">
          <SevenDayGarden summary={summary} language={language} />
        </div>
      )}

      {activeTab === "month" && (
        <div>
          <div
            className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-xs"
            data-testid="garden-month-calendar"
          >
            <div className="mb-3 grid grid-cols-7 gap-2 text-center">
              {(isArabic
                ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
                : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
              ).map((header) => (
                <span key={header} className="text-[0.75rem] font-bold text-muted-foreground">
                  {header}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {/* Empty leading offset tiles for Month View */}
              {Array.from({ length: (new Date(targetYear, targetMonth, 1).getDay() + 1) % 7 }).map((_, oIdx) => (
                <div key={`month-offset-${oIdx}`} className="aspect-square w-full bg-transparent" />
              ))}

              {monthDayRecords.map((day) => {
                const isPalm = day.isPalm;
                const completedCount = day.completedCount;
                const tileBg = isPalm
                  ? "bg-amber-500/20 border border-amber-400/80 text-amber-500 font-black shadow-xs dark:bg-amber-500/25"
                  : completedCount > 0
                    ? "bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-semibold"
                    : "bg-muted/30 dark:bg-zinc-800/40 text-muted-foreground/40 border border-transparent";

                const tileTitle = isArabic
                  ? `${day.dayKey}: ${isPalm ? "نخلة مكتملة" : completedCount > 0 ? "نشط 🔥" : "غير نشط"}`
                  : `${day.dayKey}: ${isPalm ? "Palm Tree Completed" : completedCount > 0 ? "Active 🔥" : "Inactive"}`;

                return (
                  <button
                    key={day.dayKey}
                    type="button"
                    title={tileTitle}
                    aria-label={tileTitle}
                    tabIndex={0}
                    className={`interactive-elem flex aspect-square flex-col items-center justify-center rounded-xl text-[0.75rem] font-black transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${tileBg}`}
                  >
                    <span>{isPalm ? <PalmTreeMark size={14} filled /> : completedCount > 0 ? "🔥" : ""}</span>
                    <span className="text-[0.625rem] opacity-80">{formatNumerals(day.dayNum, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "year" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/80 bg-background/80 p-4 shadow-xs">
            {/* Year Map Header & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <h3 className="text-[0.9375rem] font-black text-foreground">{t(language, "garden.yearMapTitle")}</h3>
              <div className="flex items-center gap-2 text-[0.6875rem] font-bold text-muted-foreground">
                <span>{t(language, "garden.legendLess")}</span>
                <span className="h-4 w-4 rounded-[4px] bg-muted/40 dark:bg-zinc-800/60" title="Inactive" />
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-amber-500/30 bg-amber-500/10 text-[0.55rem]"
                  title="Streak Active (🔥)"
                >
                  🔥
                </span>
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-[4px] border border-amber-400 bg-amber-500/20 text-[0.55rem]"
                  title="Palm Tree"
                >
                  <PalmTreeMark size={10} filled />
                </span>
                <span>{t(language, "garden.legendMore")}</span>
              </div>
            </div>

            {/* Weekday Column Headers */}
            <div className="mt-3 flex items-center gap-2">
              <span className="w-20 shrink-0 text-[0.6875rem] font-bold text-transparent select-none">Month</span>
              <div className="grid flex-1 grid-cols-7 gap-1 text-center text-[0.625rem] font-extrabold text-muted-foreground">
                {(isArabic
                  ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
                  : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
                ).map((wd) => (
                  <span key={wd} className="truncate">
                    {wd}
                  </span>
                ))}
              </div>
            </div>

            {/* 12 Months Blocks grouped into 4 Quarters */}
            <div className="mt-3 space-y-3">
              {monthNames.map((monthName, mIdx) => {
                const quarterIndex = Math.floor(mIdx / 3);
                const isQuarterStart = mIdx % 3 === 0;
                const quarterKey = `garden.quarter${quarterIndex + 1}` as const;

                const daysInM = new Date(targetYear, mIdx + 1, 0).getDate();
                const firstDayDate = new Date(targetYear, mIdx, 1);
                const startOffset = (firstDayDate.getDay() + 1) % 7;

                const monthStr = padZero(mIdx + 1);

                return (
                  <div key={monthName} className="space-y-1">
                    {isQuarterStart && (
                      <div className="my-2.5 flex items-center gap-2">
                        <span className="h-px flex-1 bg-border/60" />
                        <span className="text-[0.6875rem] font-extrabold text-muted-foreground/80">
                          {t(language, quarterKey)}
                        </span>
                        <span className="h-px flex-1 bg-border/60" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-start text-[0.75rem] font-extrabold text-foreground">
                        {monthName}
                      </span>
                      <div className="grid flex-1 grid-cols-7 gap-1">
                        {/* Empty leading offset tiles */}
                        {Array.from({ length: startOffset }).map((_, oIdx) => (
                          <div key={`offset-${oIdx}`} className="h-4.5 w-full bg-transparent" />
                        ))}

                        {/* Actual days of month */}
                        {Array.from({ length: daysInM }, (_, dIdx) => {
                          const dNum = dIdx + 1;
                          const dayKey = `${targetYear}-${monthStr}-${padZero(dNum)}`;
                          const cats = completionsByDayKey.get(dayKey) ?? new Set<CategoryId>();
                          const isPalm = MAIN_CATEGORY_IDS.every((c) => cats.has(c));
                          const hasActivity = cats.size > 0;

                          const tileBg = isPalm
                            ? "bg-amber-500/25 border border-amber-400/80 text-amber-500 font-black shadow-2xs"
                            : hasActivity
                              ? "bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
                              : "bg-muted/30 dark:bg-zinc-800/40 border border-transparent";

                          const tileTitle = isArabic
                            ? `${monthName} ${formatNumerals(dNum, language)}: ${isPalm ? "نخلة مكتملة" : hasActivity ? "نشط 🔥" : "غير نشط"}`
                            : `${monthName} ${dNum}: ${isPalm ? "Palm Tree Completed" : hasActivity ? "Active 🔥" : "Inactive"}`;

                          return (
                            <button
                              key={dayKey}
                              type="button"
                              title={tileTitle}
                              aria-label={tileTitle}
                              tabIndex={0}
                              className={`interactive-elem flex h-4.5 w-full items-center justify-center rounded-[3px] text-[0.55rem] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${tileBg}`}
                            >
                              {isPalm ? <PalmTreeMark size={9} filled /> : hasActivity ? "🔥" : ""}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Summary Footer */}
            <div className="mt-4 border-t border-border/60 pt-3 text-center text-[0.75rem] font-extrabold text-muted-foreground">
              {t(language, "garden.yearSummaryFooter", {
                azkar: formatNumerals(yearStats.totalCollections, language),
                days: formatNumerals(yearStats.activeDays, language),
                palms: formatNumerals(yearStats.totalPalms, language),
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── SevenDayGarden ────────────────────────────────────────────────────────────

export function SevenDayGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const isArabic = language === "ar";
  const locale = isArabic ? "ar-EG" : "en-US";

  return (
    <div className="space-y-2" aria-label={t(language, "garden.weeklyRecord")}>
      {summary.days.map((day) => {
        const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(day.date);
        const azkarCount = day.completedCategories.length;

        return (
          <div
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-2.5"
          >
            <span className="text-[0.875rem] font-bold text-foreground">{weekday}</span>
            <div className="flex items-center gap-2">
              {day.isPalm ? (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-amber-400/80 bg-amber-500/20 text-amber-500 shadow-2xs dark:bg-amber-500/25"
                  title={isArabic ? "نخلة مكتملة" : "Palm Completed"}
                  aria-label={isArabic ? "نخلة مكتملة" : "Palm Completed"}
                >
                  <PalmTreeMark size={22} filled />
                </div>
              ) : azkarCount > 0 ? (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  title={isArabic ? "نشط" : "In Progress"}
                  aria-label={isArabic ? "نشط" : "In Progress"}
                >
                  <GoldenLeafMark size={20} filled />
                </div>
              ) : (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-transparent bg-muted/30 dark:bg-zinc-800/40 text-muted-foreground/30"
                  title={isArabic ? "غير نشط" : "Inactive"}
                  aria-label={isArabic ? "غير نشط" : "Inactive"}
                >
                  <GoldenLeafMark size={20} filled={false} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── GardenMilestones ─────────────────────────────────────────────────────────

const MILESTONE_KEYS: Record<GardenMilestoneId, { title: string; body: string }> = {
  first_leaf: { title: "garden.milestoneFirstLeaf", body: "garden.milestoneFirstLeafBody" },
  first_palm: { title: "garden.milestoneFirstPalm", body: "garden.milestoneFirstPalmBody" },
  seven_palms: { title: "garden.milestoneSevenPalms", body: "garden.milestoneSevenPalmsBody" },
  thirty_palms: { title: "garden.milestoneThirtyPalms", body: "garden.milestoneThirtyPalmsBody" },
};

export function GardenMilestones({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  return (
    <section aria-labelledby="garden-milestones-title">
      <h2 id="garden-milestones-title" className="mb-3 text-[0.9375rem] font-bold text-foreground">
        {t(language, "garden.milestonesTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {summary.milestones.map((milestone) => {
          const keys = MILESTONE_KEYS[milestone.id];
          return (
            <article
              key={milestone.id}
              data-testid={`garden-milestone-${milestone.id}`}
              data-state={milestone.complete ? "complete" : "in-progress"}
              className={`rounded-2xl border p-4 ${
                milestone.complete ? "border-primary/50 bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-xl ${milestone.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                aria-hidden="true"
              >
                {milestone.id === "first_leaf" ? (
                  <GoldenLeafMark size={22} filled={milestone.complete} />
                ) : (
                  <PalmTreeMark size={24} />
                )}
              </span>
              <h3 className="mt-3 text-[0.8125rem] font-bold leading-5 text-foreground">{t(language, keys.title)}</h3>
              <p className="mt-1 text-[0.6875rem] leading-4 text-muted-foreground">{t(language, keys.body)}</p>
              <p className="mt-3 text-[0.6875rem] font-bold text-foreground">
                {milestone.complete
                  ? t(language, "garden.milestoneComplete")
                  : t(language, "garden.milestoneProgress", {
                      current: formatNumerals(Math.min(milestone.current, milestone.target), language),
                      target: formatNumerals(milestone.target, language),
                    })}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── GrowthEventStatus ────────────────────────────────────────────────────────

export function GrowthEventStatus({ event, language }: { event: GrowthEvent; language: AppLanguage }) {
  const category = categoryName(event.category, language);

  const isCore = event.kind === "leaf" || event.kind === "palm";
  const isExtra = event.kind === "extra_leaf";

  const text =
    event.kind === "palm"
      ? t(language, "garden.eventPalm")
      : event.kind === "leaf"
        ? t(language, "garden.eventLeaf", { category })
        : event.kind === "extra_leaf"
          ? t(language, "garden.eventExtraLeaf", { category })
          : t(language, "garden.eventRepeat", { category });

  const containerClass = isCore
    ? "mt-5 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-start animate-leaf-float-core"
    : isExtra
      ? "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3.5 text-start animate-leaf-float-extra"
      : "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start";

  const iconClass = isCore
    ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
    : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

  return (
    <div className={containerClass} role="status" aria-live="polite" data-testid="garden-growth-event">
      <span className={iconClass} aria-hidden="true">
        {event.kind === "palm" ? (
          <PalmTreeMark size={isCore ? 28 : 22} />
        ) : isExtra ? (
          <GreenLeafMark size={20} />
        ) : (
          <GoldenLeafMark size={isCore ? 25 : 20} />
        )}
      </span>
      <span>
        <span className={`block font-bold text-foreground ${isCore ? "text-[0.875rem]" : "text-[0.8125rem]"}`}>
          {text}
        </span>
        <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">
          {t(language, "garden.eventHint", {
            count: formatNumerals(event.leafCount, language),
            total: formatNumerals(CATEGORIES.filter((category) => category.id !== "friday_kahf").length, language),
          })}
        </span>
      </span>
    </div>
  );
}
