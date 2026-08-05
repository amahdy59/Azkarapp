import React from "react";
import { formatNumerals } from "../formatting";
import type { AppLanguage, CategoryId } from "../types";
import { type GardenSummary } from "../progress";
import { Zap, ChevronLeft, ChevronRight, Check } from "./icons";
import { PalmTreeMark } from "./RoutineGarden";

function isAr(language: AppLanguage) {
  return language === "ar";
}

// ----------------------------------------------------------------------------
// WEEK VIEW
// ----------------------------------------------------------------------------
export function ProgressWeekView({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const isArabic = isAr(language);
  const locale = isArabic ? "ar-EG" : "en-US";
  const columns = [
    { id: "morning", label: isArabic ? "الصباح" : "Morning" },
    { id: "evening", label: isArabic ? "المساء" : "Evening" },
    { id: "before_sleep", label: isArabic ? "النوم" : "Sleep" },
  ];

  return (
    <div className="w-full max-w-[44rem] mx-auto p-4 bg-card border border-border rounded-[1.5rem] shadow-sm fade-in">
      <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-x-2 gap-y-3 items-center" dir={isArabic ? "rtl" : "ltr"}>
        {/* Header Row */}
        <div className="text-[0.75rem] font-bold text-muted-foreground" />
        {columns.map((col) => (
          <div key={col.id} className="text-center text-[0.75rem] font-bold text-muted-foreground pb-2">
            {col.label}
          </div>
        ))}

        {/* Data Rows */}
        {summary.days.map((day) => {
          const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(day.date);
          const isToday = day.dayKey === summary.today.dayKey;

          return (
            <React.Fragment key={day.dayKey}>
              {/* Row Label */}
              <div
                className={`text-start text-[0.875rem] pr-2 ${isToday ? "font-black text-amber-500" : "font-bold text-foreground"}`}
              >
                {weekday}
              </div>

              {/* Checkboxes */}
              {columns.map((col) => {
                const isDone = day.completedCategories.includes(col.id as CategoryId);
                return (
                  <div key={`${day.dayKey}-${col.id}`} className="flex justify-center">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full border ${
                        isDone
                          ? "border-green-500 bg-green-50 text-green-500 dark:bg-green-950/30"
                          : "border-border/60 bg-muted/20"
                      }`}
                    >
                      {isDone && <Check size={14} strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function ProgressDayView({
  summary,
  language,
  dynamicSubtitle,
  onSelectCategory,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  dynamicSubtitle: string;
  onSelectCategory?: (categoryId: CategoryId) => void;
}) {
  const isArabic = isAr(language);

  return (
    <div className="flex flex-col gap-4 w-full max-w-[44rem] mx-auto fade-in">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Palm Growth Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border shadow-sm">
          <PalmTreeMark size={32} filled={summary.lifetimePalms > 0} className="text-amber-500 mb-2" />
          <span className="text-[0.875rem] font-bold text-foreground text-center">
            {isArabic ? "استمر في نمو نخلتك" : "Keep growing your palm"}
          </span>
        </div>

        {/* Current Streak Card */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-[0.75rem] font-bold text-muted-foreground mb-1">
            {isArabic ? "سلسلة حالية" : "Current streak"}
          </span>
          <div className="flex items-center gap-1.5">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-[1.125rem] font-black text-foreground">
              {formatNumerals(summary.currentUsageStreak ?? 0, language)} {isArabic ? "أيام" : "days"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Today's Wird Card */}
      <div className="w-full rounded-[1.5rem] bg-card border border-border p-5 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-[1.25rem] font-bold text-foreground mb-1">{isArabic ? "وردك اليوم" : "Today's Wird"}</h3>
          <p className="text-[0.875rem] font-semibold text-muted-foreground">{dynamicSubtitle}</p>
        </div>

        {/* Categories List */}
        <ul className="flex flex-col gap-3 w-full" dir={isArabic ? "rtl" : "ltr"}>
          {[
            { id: "morning" as const, name: isArabic ? "أذكار الصباح" : "Morning Azkar", icon: "🌅" },
            { id: "evening" as const, name: isArabic ? "أذكار المساء" : "Evening Azkar", icon: "🌆" },
            { id: "before_sleep" as const, name: isArabic ? "أذكار النوم" : "Before Sleep Azkar", icon: "🌙" },
          ].map((col) => {
            const isDone = summary.today.completedCategories.includes(col.id);
            return (
              <li key={col.id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory?.(col.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isDone
                      ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20 shadow-xs"
                      : "border-border bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full border ${isDone ? "border-green-500 text-green-500" : "border-muted-foreground/30 text-muted-foreground/30"}`}
                    >
                      {isDone && <Check size={16} strokeWidth={3} />}
                    </div>
                    <div className="flex flex-col text-start">
                      <span className={`text-[1rem] font-bold ${isDone ? "text-foreground" : "text-foreground"}`}>
                        {col.name}
                      </span>
                      <span
                        className={`text-[0.75rem] font-semibold ${isDone ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                      >
                        {isDone ? (isArabic ? "مكتملة" : "Completed") : isArabic ? "غير مكتملة" : "Not completed"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isDone && (
                      <span className="px-3 py-1 text-[0.75rem] font-bold bg-amber-500 text-black rounded-full">
                        {isArabic ? "ابدأ الآن" : "Start now"}
                      </span>
                    )}
                    {isArabic ? (
                      <ChevronLeft size={20} className="text-muted-foreground/50" />
                    ) : (
                      <ChevronRight size={20} className="text-muted-foreground/50" />
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MONTH VIEW
// ----------------------------------------------------------------------------
export function ProgressMonthView({
  monthDayRecords,
  language,
  targetYear,
  targetMonth,
}: {
  monthDayRecords: { dayKey: string; dayNum: number; isPalm: boolean; completedCount: number }[];
  language: AppLanguage;
  targetYear: number;
  targetMonth: number;
}) {
  const isArabic = isAr(language);

  const monthDate = new Date(targetYear, targetMonth, 1);
  const monthName = new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { month: "long", year: "numeric" }).format(
    monthDate,
  );
  const firstDayOffset = monthDate.getDay();
  // We use (firstDayOffset + 1) % 7 assuming the calendar week starts on Saturday.
  // Let's just use standard getDay() (Sunday=0) as in the app.
  const offset = isArabic ? (firstDayOffset + 1) % 7 : firstDayOffset;

  const weekdays = isArabic
    ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full max-w-[44rem] mx-auto p-4 bg-card border border-border rounded-[1.5rem] shadow-sm fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <h4 className="text-[1.125rem] font-bold text-foreground">{monthName}</h4>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center" dir={isArabic ? "rtl" : "ltr"}>
        {weekdays.map((day) => (
          <div key={day} className="text-[0.75rem] font-bold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2" dir={isArabic ? "rtl" : "ltr"}>
        {/* Offset */}
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`offset-${i}`} className="aspect-square bg-transparent" />
        ))}

        {/* Days */}
        {monthDayRecords.map((day) => {
          const isPalm = day.isPalm;
          const count = day.completedCount;
          const bgClass = isPalm
            ? "bg-amber-500/20 border-amber-400/80 text-amber-600 dark:bg-amber-500/25"
            : count > 0
              ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              : "bg-muted/30 border-transparent text-muted-foreground/40";

          return (
            <div
              key={day.dayKey}
              className={`flex flex-col items-center justify-center aspect-square rounded-[0.875rem] border ${bgClass}`}
            >
              <div className="flex h-5 items-center justify-center mb-0.5">
                {isPalm ? <PalmTreeMark size={16} filled /> : count > 0 ? <Zap className="w-3.5 h-3.5" /> : null}
              </div>
              <span className="text-[0.6875rem] font-bold">{formatNumerals(day.dayNum, language)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// YEAR VIEW
// ----------------------------------------------------------------------------
export function ProgressYearView({
  yearStats,
  language: _language,
}: {
  yearStats: { activeDays: number; totalPalms: number; totalCollections: number };
  language: AppLanguage;
}) {
  return (
    <div className="w-full max-w-[44rem] mx-auto text-center p-4 bg-card border rounded-[1.5rem] text-muted-foreground fade-in">
      {/* Yearly view can remain mostly similar to what we had in RoutineGarden, we will integrate it in the next step if needed */}
      <div className="text-[1.125rem] font-bold text-foreground mb-2">Year View Data</div>
      <p>Active Days: {yearStats.activeDays}</p>
      <p>Total Palms: {yearStats.totalPalms}</p>
    </div>
  );
}
