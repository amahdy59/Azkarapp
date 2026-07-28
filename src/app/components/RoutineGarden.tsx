import { useState } from "react";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import {
  getGardenSummary,
  MAIN_CATEGORY_IDS,
  type GardenMilestoneId,
  type GardenSummary,
  type GrowthEvent,
} from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

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

/** PalmTreeMark — detailed date palm tree SVG. */
export function PalmTreeMark({
  filled = true,
  className = "",
  size = 32,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={`${className} ${filled ? "opacity-100" : "opacity-45"}`}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="32" cy="62" rx="10" ry="2.2" fill="currentColor" fillOpacity="0.12" />
      <path d="M27.5 61.5 L32 58.5 L36.5 61.5 L35.5 53.5 L32 51 L28.5 53.5 Z" fill="#78350F" fillOpacity="0.9" />
      <path d="M28.5 53.5 L32 51 L35.5 53.5 L34.5 45.5 L32 43.5 L29.5 45.5 Z" fill="#92400E" fillOpacity="0.95" />
      <path d="M29.5 45.5 L32 43.5 L34.5 45.5 L33.8 37.5 L32 35.5 L30.2 37.5 Z" fill="#B45309" />
      <path d="M30.2 37.5 L32 35.5 L33.8 37.5 L33.2 29.5 L32 27 L30.8 29.5 Z" fill="#D97706" />

      {/* Date clusters */}
      <circle cx="28" cy="29" r="2.2" fill="#F59E0B" />
      <circle cx="26.5" cy="31.2" r="1.8" fill="#D97706" />
      <circle cx="36" cy="29" r="2.2" fill="#F59E0B" />
      <circle cx="37.5" cy="31.2" r="1.8" fill="#D97706" />

      {/* Canopy */}
      <path d="M32 26 C30.8 16.5 31.2 8.5 32 3 C32.8 8.5 33.2 16.5 32 26 Z" fill="#10B981" />
      <path d="M32 26 C26 15.5 17.5 8.5 11 6.5 C17.5 13.5 25 20 32 26 Z" fill="#059669" />
      <path d="M32 26 C38 15.5 46.5 8.5 53 6.5 C46.5 13.5 39 20 32 26 Z" fill="#10B981" />
      <path d="M32 26 C22.5 18 11.5 14 3.5 15 C11.5 20.2 22 24 32 26 Z" fill="#047857" />
      <path d="M32 26 C41.5 18 52.5 14 60.5 15 C52.5 20.2 42 24 32 26 Z" fill="#059669" />
      <path d="M32 26 C21.5 21.5 10.5 22.5 2.5 27.5 C11 28.5 22 27.2 32 26 Z" fill="#065F46" />
      <path d="M32 26 C42.5 21.5 53.5 22.5 61.5 27.5 C53 28.5 42 27.2 32 26 Z" fill="#047857" />
      <path d="M32 26 C22 24.5 13.5 30 6.5 40 C14 36.5 23 31.5 32 26 Z" fill="#047857" />
      <path d="M32 26 C42 24.5 50.5 30 57.5 40 C50 36.5 41 31.5 32 26 Z" fill="#065F46" />
    </svg>
  );
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}

// ─── PalmTreeReward Header Widget ───────────────────────────────────────────

export function PalmTreeReward({
  summary,
  language,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  onOpenShareModal?: () => void;
}) {
  const { today } = summary;
  const goldenCount = today.goldenLeafCount ?? today.leafCount;
  const streak = summary.currentUsageStreak ?? summary.activeDaysLast7 ?? 0;
  const isArabic = language === "ar";

  return (
    <div className="flex w-full items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 shadow-sm dark:bg-amber-500/15">
      <div
        className="flex w-full items-center justify-around"
        aria-label={
          isArabic
            ? `السلسلة اليومية: ${formatNumerals(streak, language)} أيام، أوراق ذهبية: ${formatNumerals(goldenCount, language)} من ٣، النخيل: ${formatNumerals(summary.lifetimePalms, language)}`
            : `Daily streak: ${streak} days, Golden leaves: ${goldenCount}/3, Palms: ${summary.lifetimePalms}`
        }
      >
        <div className="flex items-center gap-1.5" title={isArabic ? "سلسلة الأيام" : "Daily Streak"}>
          <span className="text-[1.25rem]" role="img" aria-label="Streak flame">
            🔥
          </span>
          <span className="text-[1rem] font-black text-amber-600 dark:text-amber-400">
            {formatNumerals(streak, language)}
          </span>
        </div>
        <span className="h-4 w-px bg-amber-500/30" />
        <div className="flex items-center gap-1.5" title={isArabic ? "الأوراق الذهبية اليومية" : "Daily Golden Leaves"}>
          <GoldenLeafMark size={22} filled />
          <span className="text-[1rem] font-black text-amber-600 dark:text-amber-400">
            {formatNumerals(goldenCount, language)} / {formatNumerals(3, language)}
          </span>
        </div>
        <span className="h-4 w-px bg-amber-500/30" />
        <div className="flex items-center gap-1.5" title={isArabic ? "أشجار النخيل" : "Palms"}>
          <PalmTreeMark size={26} filled={summary.lifetimePalms > 0} />
          <span className="text-[1.0625rem] font-black text-amber-500">
            {formatNumerals(summary.lifetimePalms, language)}
          </span>
        </div>
      </div>
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
}: {
  summary: GardenSummary;
  language: AppLanguage;
  hideTabs?: boolean;
  onOpenShareModal?: () => void;
  calendarType?: "hijri" | "gregorian";
  dailyCompletions?: DailyCollectionCompletion[];
}) {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [offset, setOffset] = useState(0);

  const isArabic = language === "ar";

  const displayDate = new Date();
  if (offset !== 0) {
    if (activeTab === "day") {
      displayDate.setDate(displayDate.getDate() + offset);
    } else if (activeTab === "week") {
      displayDate.setDate(displayDate.getDate() + offset * 7);
    } else if (activeTab === "month") {
      displayDate.setMonth(displayDate.getMonth() + offset);
    } else if (activeTab === "year") {
      displayDate.setFullYear(displayDate.getFullYear() + offset);
    }
  }

  const summary =
    offset === 0 && activeTab === "day" ? initialSummary : getGardenSummary(dailyCompletions, displayDate);

  const { today } = summary;
  const goldenCount = today.goldenLeafCount ?? today.leafCount;
  const totalPalms = summary.lifetimePalms;
  const greenCount = today.greenLeafCount ?? today.extraLeafCount;

  const dateLabel = getGardenDateLabel(displayDate, activeTab, offset, language, calendarType);

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    setActiveTab(tab);
    setOffset(0);
  };

  const targetYear = displayDate.getFullYear();
  const targetMonth = displayDate.getMonth();
  const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  const completionsByDayKey = new Map<string, Set<CategoryId>>();
  for (const record of dailyCompletions) {
    const set = completionsByDayKey.get(record.dayKey) ?? new Set<CategoryId>();
    set.add(record.category);
    completionsByDayKey.set(record.dayKey, set);
  }

  const monthDayRecords: {
    dayKey: string;
    dayNum: number;
    goldenCount: number;
    greenCount: number;
    leafCount: number;
    isPalm: boolean;
  }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayKey = `${targetYear}-${padZero(targetMonth + 1)}-${padZero(d)}`;
    const cats = completionsByDayKey.get(dayKey) ?? new Set<CategoryId>();
    const golden = MAIN_CATEGORY_IDS.filter((c) => cats.has(c)).length;
    const green = Array.from(cats).filter((c) => !MAIN_CATEGORY_IDS.includes(c)).length;
    const isPalm = golden === 3;
    monthDayRecords.push({
      dayKey,
      dayNum: d,
      goldenCount: golden,
      greenCount: green,
      leafCount: golden + green,
      isPalm,
    });
  }

  const activeMonthDays = monthDayRecords.filter((d) => d.leafCount > 0).length;
  const monthPalms = monthDayRecords.filter((d) => d.isPalm).length;
  const monthAdherenceRate = Math.round((activeMonthDays / daysInMonth) * 100);

  let maxStreakInMonth = 0;
  let currentStreakInMonth = 0;
  for (const d of monthDayRecords) {
    if (d.leafCount > 0) {
      currentStreakInMonth++;
      if (currentStreakInMonth > maxStreakInMonth) maxStreakInMonth = currentStreakInMonth;
    } else {
      currentStreakInMonth = 0;
    }
  }

  const yearCompletions = dailyCompletions.filter((r) => r.dayKey.startsWith(`${targetYear}-`));
  const yearCompletionsByDay = new Map<string, Set<CategoryId>>();
  for (const r of yearCompletions) {
    const set = yearCompletionsByDay.get(r.dayKey) ?? new Set<CategoryId>();
    set.add(r.category);
    yearCompletionsByDay.set(r.dayKey, set);
  }
  let yearTotalPalms = 0;
  let yearTotalLeaves = 0;
  for (const cats of yearCompletionsByDay.values()) {
    const golden = MAIN_CATEGORY_IDS.filter((c) => cats.has(c)).length;
    if (golden === 3) yearTotalPalms++;
    yearTotalLeaves += cats.size;
  }

  const monthNames = isArabic
    ? calendarType === "hijri"
      ? HIJRI_MONTH_NAMES_AR
      : GREGORIAN_MONTH_NAMES_AR
    : calendarType === "hijri"
      ? HIJRI_MONTH_NAMES_EN
      : GREGORIAN_MONTH_NAMES_EN;

  const monthHeaders = isArabic
    ? ["سبت", "أحد", "إثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"]
    : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <section
      data-testid="today-garden-card"
      aria-label={t(language, "garden.todayTitle")}
      className="mb-6 rounded-3xl border border-border/80 bg-card p-5 shadow-xl transition-all dark:border-white/10 dark:bg-[#18181B]"
    >
      <div className="mb-4 flex items-center justify-between gap-3 text-start">
        <div>
          <h2 className="text-[1.25rem] font-extrabold text-foreground dark:text-white">
            {t(language, "garden.todayTitle")}
          </h2>
          <p className="mt-0.5 text-[0.8125rem] font-medium text-muted-foreground">
            {activeTab === "month"
              ? t(language, "garden.oasisFor", { date: dateLabel })
              : activeTab === "year"
                ? t(language, "garden.growthYear")
                : t(language, "garden.nurtureGarden")}
          </p>
        </div>

        {onOpenShareModal && (
          <button
            type="button"
            onClick={onOpenShareModal}
            className="flex h-[44px] min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-3.5 text-[0.875rem] font-bold text-slate-950 shadow-sm hover:bg-amber-400 active:scale-95 transition-all shrink-0 dark:bg-amber-400 dark:text-slate-950"
            aria-label={t(language, "garden.shareAchievementAria")}
            title={t(language, "garden.shareAchievementAria")}
          >
            <span>🌴</span>
            <span>{t(language, "garden.shareAchievement")}</span>
          </button>
        )}
      </div>

      {!hideTabs && (
        <>
          <div
            role="tablist"
            aria-label={t(language, "garden.viewMode")}
            className="mb-5 flex rounded-2xl bg-muted/60 p-1"
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
                  className={`flex flex-1 min-h-[44px] items-center justify-center rounded-xl py-2 text-[0.875rem] font-extrabold transition-all ${
                    isActive ? "bg-amber-500 text-slate-950 shadow-md" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t(language, keyMap[tab])}
                </button>
              );
            })}
          </div>

          <div className="mb-5 flex items-center justify-between rounded-2xl border border-border/80 bg-background/90 px-3 py-2.5 shadow-sm [direction:ltr]">
            <button
              type="button"
              onClick={() => setOffset((prev) => prev - 1)}
              aria-label={t(language, "garden.prevPeriod")}
              title={t(language, "garden.prevPeriod")}
              className="flex size-10 items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors active:scale-95 shrink-0"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span
              className="px-2 text-center text-[0.9375rem] font-black tracking-wide text-foreground"
              data-testid="garden-view-date"
              dir="auto"
            >
              {dateLabel}
            </span>

            <button
              type="button"
              onClick={() => setOffset((prev) => Math.min(0, prev + 1))}
              disabled={offset >= 0}
              aria-label={t(language, "garden.nextPeriod")}
              title={t(language, "garden.nextPeriod")}
              className="flex size-10 items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </>
      )}

      {!hideTabs && (activeTab === "day" || activeTab === "week") && (
        <div className="mb-6 flex items-center justify-around rounded-2xl border border-amber-500/30 bg-amber-500/5 py-3 px-4 dark:bg-amber-500/10">
          <div className="flex items-center gap-2" title={t(language, "garden.palmsCount", { count: "" }).trim()}>
            <PalmTreeMark size={26} />
            <span className="text-[1.125rem] font-black text-amber-500">{formatNumerals(totalPalms, language)}</span>
          </div>
          <span className="h-6 w-px bg-amber-500/30" />
          <div className="flex items-center gap-2" title={t(language, "garden.goldenLeaves")}>
            <GoldenLeafMark size={22} filled />
            <span className="text-[1.125rem] font-black text-amber-600 dark:text-amber-400">
              {formatNumerals(goldenCount, language)}
            </span>
          </div>
          <span className="h-6 w-px bg-amber-500/30" />
          <div className="flex items-center gap-2" title={t(language, "garden.greenLeaves")}>
            <GreenLeafMark size={22} filled />
            <span className="text-[1.125rem] font-black text-emerald-600 dark:text-emerald-400">
              {formatNumerals(greenCount, language)}
            </span>
          </div>
        </div>
      )}

      {activeTab === "day" && (
        <div className="flex flex-col items-center py-2 text-center">
          <div className="relative mb-6 flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 border-amber-500/80 bg-amber-500/5 shadow-inner dark:bg-amber-500/10">
            <PalmTreeMark size={60} className="transition-transform duration-500 hover:scale-105" />

            <div className="mt-1 flex items-center justify-center gap-2">
              {[0, 1, 2].map((idx) => (
                <GoldenLeafMark
                  key={idx}
                  size={24}
                  filled={goldenCount > idx}
                  className="transition-all duration-300"
                />
              ))}
            </div>

            <div
              data-testid="today-leaf-count"
              className="absolute -bottom-3 rounded-full bg-amber-950 px-3.5 py-1 text-[0.75rem] font-extrabold text-amber-400 border border-amber-500/50 shadow-md dark:bg-black dark:text-amber-300"
            >
              {t(language, "garden.goldenLeavesCount", { count: formatNumerals(goldenCount, language) })}
            </div>
          </div>

          <h3 className="mt-2 text-[1.125rem] font-black text-foreground dark:text-white">
            {t(language, "garden.dailyProtection")}
          </h3>
          <p className="mt-1 text-[0.875rem] font-medium text-muted-foreground">
            {t(language, "garden.mayAllahProtect")}
          </p>

          {goldenCount >= 3 && <p className="sr-only">A palm has grown!</p>}

          <ul
            aria-label={isArabic ? "تقدم المجموعات اليومية" : "Today's collection progress"}
            className="mt-4 flex w-full justify-center gap-3"
          >
            {[
              {
                id: "morning",
                name: isArabic ? "أذكار الصباح" : "Morning Azkar",
                state: goldenCount > 0 ? "complete" : "pending",
                label: isArabic
                  ? goldenCount > 0
                    ? "أذكار الصباح. مكتمل"
                    : "أذكار الصباح. غير مكتمل"
                  : goldenCount > 0
                    ? "Morning Azkar. Complete"
                    : "Morning Azkar. Not yet",
              },
              {
                id: "evening",
                name: isArabic ? "أذكار المساء" : "Evening Azkar",
                state: goldenCount > 1 ? "complete" : "pending",
                label: isArabic
                  ? goldenCount > 1
                    ? "أذكار المساء. مكتمل"
                    : "أذكار المساء. غير مكتمل"
                  : goldenCount > 1
                    ? "Evening Azkar. Complete"
                    : "Evening Azkar. Not yet",
              },
              {
                id: "before_sleep",
                name: isArabic ? "أذكار النوم" : "Before Sleep Azkar",
                state: goldenCount > 2 ? "complete" : "pending",
                label: isArabic
                  ? goldenCount > 2
                    ? "أذكار النوم. مكتمل"
                    : "أذكار النوم. غير مكتمل"
                  : goldenCount > 2
                    ? "Before Sleep Azkar. Complete"
                    : "Before Sleep Azkar. Not yet",
              },
            ].map((col) => (
              <li
                key={col.id}
                data-testid={`garden-category-${col.id}`}
                data-state={col.state}
                aria-label={col.label}
                title={col.label}
                className="flex items-center gap-1 text-[0.75rem] font-bold text-muted-foreground"
              >
                {col.state === "complete" ? (
                  <>
                    <GoldenLeafMark size={14} filled />
                    <GoldenLeafMark size={14} filled />
                  </>
                ) : (
                  <GoldenLeafMark size={14} filled={false} />
                )}
                <span className="sr-only">
                  {col.name}: {col.state}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "week" && (
        <div className="space-y-2.5">
          <SevenDayGarden summary={summary} language={language} />
        </div>
      )}

      {activeTab === "month" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border/80 bg-background/80 p-4 text-center shadow-sm">
            <div>
              <span className="block text-[1.25rem] font-black text-foreground">
                {formatNumerals(maxStreakInMonth, language)} {isArabic ? "يوم" : "days"}
              </span>
              <span className="mt-0.5 block text-[0.75rem] font-bold text-muted-foreground">
                {t(language, "garden.longestStreak")}
              </span>
            </div>
            <div className="border-x border-border/60 px-1">
              <span className="block text-[1.25rem] font-black text-emerald-600 dark:text-emerald-400">
                {formatNumerals(monthAdherenceRate, language)}%
              </span>
              <span className="mt-0.5 block text-[0.75rem] font-bold text-muted-foreground">
                {t(language, "garden.adherence")}
              </span>
            </div>
            <div>
              <span className="block text-[1.25rem] font-black text-amber-500">
                {formatNumerals(monthPalms, language)}
              </span>
              <span className="mt-0.5 block text-[0.75rem] font-bold text-muted-foreground">
                {t(language, "garden.fullPalms")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
            <div className="mb-3 grid grid-cols-7 gap-2 text-center">
              {monthHeaders.map((header) => (
                <span key={header} className="text-[0.75rem] font-bold text-muted-foreground">
                  {header}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {monthDayRecords.map((day) => {
                const isPalm = day.isPalm;
                const leafCount = day.leafCount;
                const tileBg = isPalm
                  ? "bg-emerald-500 text-white dark:bg-emerald-500 dark:text-black shadow-sm"
                  : leafCount >= 2
                    ? "bg-emerald-600/80 text-white"
                    : leafCount === 1
                      ? "bg-emerald-700/50 text-white"
                      : "bg-muted/40 text-muted-foreground/30";

                const tileTitle = isArabic
                  ? `${day.dayKey}: ${formatNumerals(leafCount, language)} أوراق`
                  : `${day.dayKey}: ${leafCount} leaves`;

                return (
                  <div
                    key={day.dayKey}
                    title={tileTitle}
                    aria-label={tileTitle}
                    className={`flex aspect-square flex-col items-center justify-center rounded-xl text-[0.75rem] font-black transition-all ${tileBg}`}
                  >
                    <span>{isPalm ? "🌴" : leafCount > 0 ? "🌿" : ""}</span>
                    <span className="text-[0.625rem] opacity-75">{formatNumerals(day.dayNum, language)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "year" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 shadow-sm dark:bg-amber-500/15">
            <div>
              <span className="block text-[1.25rem] font-black text-amber-500">
                {formatNumerals(yearTotalPalms, language)} {t(language, "garden.fullPalms")}
              </span>
              <span className="mt-1 block text-[0.75rem] font-semibold text-muted-foreground">
                {t(language, "garden.totalLeavesEarned", { count: formatNumerals(yearTotalLeaves, language) })}
              </span>
            </div>
            <PalmTreeMark size={40} />
          </div>

          <div className="rounded-2xl border border-border/80 bg-background/70 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[0.9375rem] font-black text-foreground">{t(language, "garden.yearlyOasisMap")}</h3>
            </div>

            <div className="space-y-2.5">
              {monthNames.map((monthName, mIdx) => {
                const TILES_PER_MONTH = 15;

                const monthStr = padZero(mIdx + 1);
                const prefix = `${targetYear}-${monthStr}-`;

                const monthCompletions = dailyCompletions.filter((r) => r.dayKey.startsWith(prefix));
                const dayLeavesMap = new Map<number, number>();
                for (const rec of monthCompletions) {
                  const dayNum = parseInt(rec.dayKey.slice(8), 10);
                  if (!isNaN(dayNum)) {
                    dayLeavesMap.set(dayNum, (dayLeavesMap.get(dayNum) ?? 0) + 1);
                  }
                }

                return (
                  <div key={monthName} className="flex items-center gap-2.5 text-[0.75rem]">
                    <span className="w-24 shrink-0 font-extrabold text-foreground text-start">{monthName}</span>
                    <div className="flex flex-1 items-center gap-1">
                      {Array.from({ length: TILES_PER_MONTH }, (_, tIdx) => {
                        const day1 = tIdx * 2 + 1;
                        const day2 = tIdx * 2 + 2;
                        const tileLeaves = (dayLeavesMap.get(day1) ?? 0) + (dayLeavesMap.get(day2) ?? 0);
                        // Determine if any day in this tile was a palm (all 3 main cats done)
                        // Cap at meaningful levels: 0=missed, 1=partial, 2=good, 3=palm
                        const level = tileLeaves === 0 ? 0 : tileLeaves === 1 ? 1 : tileLeaves === 2 ? 2 : 3;
                        const tileBg =
                          level === 3
                            ? "bg-emerald-500"
                            : level === 2
                              ? "bg-emerald-600/80"
                              : level === 1
                                ? "bg-emerald-700/50"
                                : "bg-muted/40";
                        return <div key={tIdx} className={`h-3.5 flex-1 rounded-sm transition-colors ${tileBg}`} />;
                      })}
                    </div>
                  </div>
                );
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
        const golden = day.goldenLeafCount ?? day.leafCount;
        const palm = day.isPalm ? 1 : 0;

        return (
          <div
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-2.5"
          >
            <span className="text-[0.875rem] font-bold text-foreground">{weekday}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[0.75rem] font-extrabold text-amber-500">
                <PalmTreeMark size={16} filled={day.isPalm} />
                <span>{formatNumerals(palm, language)}</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[0.75rem] font-extrabold text-amber-600 dark:text-amber-400">
                <GoldenLeafMark size={14} filled={golden > 0} />
                <span>
                  {formatNumerals(golden, language)} / {formatNumerals(3, language)}
                </span>
              </div>
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
            total: formatNumerals(CATEGORIES.length, language),
          })}
        </span>
      </span>
    </div>
  );
}
