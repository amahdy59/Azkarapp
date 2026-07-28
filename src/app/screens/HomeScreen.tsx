import { useState, useEffect, useMemo } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { TodayRoutineGarden, PalmTreeReward } from "../components/RoutineGarden";
import { getCategoryTotal, getAzkarByCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatHijriDateWithTime, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date): CategoryId {
  const hour = date.getHours();
  if (hour >= 20 || hour < 4) {
    return "before_sleep";
  }
  return hour >= 15 ? "evening" : "morning";
}

function getNextIndex(completed: Set<number>, totalCount: number) {
  return Array.from({ length: totalCount }, (_, index) => index).find((index) => !completed.has(index)) ?? 0;
}

export function getTimeOfDayZikr(now: Date = new Date()) {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 4 && hour < 15.5) {
    return {
      categoryId: "morning" as CategoryId,
      titleArabic: "حان وقت أذكار الصباح",
      titleEnglish: "Time for Morning Azkar",
      descArabic: "أذكار الصباح تُقرأ بعد صلاة الفجر حتى طلوع الشمس",
      descEnglish: "Morning Azkar are read after Fajr prayer until sunrise",
    };
  }
  if (hour >= 15.5 && hour < 20) {
    return {
      categoryId: "evening" as CategoryId,
      titleArabic: "حان وقت أذكار المساء",
      titleEnglish: "Time for Evening Azkar",
      descArabic: "أذكار المساء تُقرأ بعد صلاة العصر حتى المغرب",
      descEnglish: "Evening Azkar are read after Asr prayer until Maghrib",
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    titleArabic: "حان وقت أذكار النوم",
    titleEnglish: "Time for Before Sleep Azkar",
    descArabic: "أذكار النوم تُقرأ بعد صلاة العشاء وقبل النوم",
    descEnglish: "Before Sleep Azkar are read after Isha prayer and before sleep",
  };
}

/** Chooses one calm, useful next action without blocking access to any collection. */
export function getHomeAction(completed: Record<CategoryId, Set<number>>, now: Date = new Date()): HomeAction {
  const suggestedId = suggestedCategoryId(now);
  const categoryIds = [suggestedId, ...CATEGORIES.map((category) => category.id)].filter(
    (id, index, values) => values.indexOf(id) === index,
  ) as CategoryId[];

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getNextIndex(completed[categoryId], totalCount),
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = getCategoryTotal(suggestedId);
  return { categoryId: suggestedId, index: 0, completedCount: totalCount, totalCount, kind: "again" };
}

export function HomeScreen({
  completed,
  dailyCompletions,
  quietProgressEnabled,
  progressDayStartHour,
  language,
  direction,
  calendarType = "hijri",
  onResume,
  onRepeat,
  onOpenFridayMode,
  onOpenShareModal: _onOpenShareModal,
}: {
  completed: Record<CategoryId, Set<number>>;
  dailyCompletions: DailyCollectionCompletion[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  onResume: (category: CategoryId, index: number) => void;
  onRepeat: (category: CategoryId) => void;
  onOpenFridayMode?: () => void;
  onOpenShareModal?: () => void;
}) {
  const isArabic = language === "ar";
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const gardenSummary = useMemo(
    () => getGardenSummary(dailyCompletions, now, progressDayStartHour),
    [dailyCompletions, now, progressDayStartHour],
  );

  // Determine which category to feature based on time of day
  const reminderInfo = useMemo(() => getTimeOfDayZikr(now), [now]);
  const reminderCategory = CATEGORIES.find((c) => c.id === reminderInfo.categoryId)!;
  const categoryAzkar = getAzkarByCategory(reminderInfo.categoryId);
  const doneSet = completed[reminderInfo.categoryId] ?? new Set<number>();

  const totalCount = getCategoryTotal(reminderInfo.categoryId);
  const doneCount = doneSet.size;
  const nextIdx = Array.from({ length: categoryAzkar.length }, (_, i) => i).find((i) => !doneSet.has(i)) ?? 0;
  const isComplete = doneCount >= totalCount && totalCount > 0;

  const actionKind: "start" | "continue" | "again" = doneCount === 0 ? "start" : isComplete ? "again" : "continue";

  const ctaLabel =
    actionKind === "start"
      ? t(language, "home.startGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
      : actionKind === "again"
        ? t(language, "home.readGroupAgain", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
        : t(language, "home.continueGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name });

  const isFriday = now.getDay() === 5;

  return (
    <ScreenContainer dir={direction} className="px-page">
      {/* Accessibility: visually-hidden page title for screen readers */}
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Top Header Bar — Enlarged Full-Width Streaks Bar */}
      <header className="flex w-full shrink-0 flex-col gap-2 px-0 pt-0 pb-2">
        {/* Full-width Palm Tree & Leaves Reward Widget */}
        <PalmTreeReward summary={gardenSummary} language={language} />

        {/* Date, Weekday & Live Time on its OWN SEPARATE LINE */}
        <div className="w-full text-center">
          <p className="text-[0.875rem] font-bold text-muted-foreground" data-testid="hijri-date" dir="auto">
            {formatHijriDateWithTime(now, language)}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-1 pb-4">
        {/* Friday Special Routine Banner — ONLY ON FRIDAYS */}
        {isFriday && onOpenFridayMode && (
          <section className="mb-4">
            <button
              type="button"
              onClick={onOpenFridayMode}
              className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-start shadow-md hover:bg-amber-500/15 active:scale-[0.98] transition-all dark:bg-amber-500/15"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-[1.125rem] shadow-sm">
                  ✨
                </span>
                <div>
                  <h3 className="text-[0.9375rem] font-black text-foreground">
                    {isArabic ? "فضائل يوم الجمعة" : "Friday Special Virtues"}
                  </h3>
                  <p className="text-[0.75rem] font-semibold text-muted-foreground">
                    {isArabic ? "الصلاة على النبي ﷺ • سورة الكهف" : "Salawat counter & Surah Al-Kahf"}
                  </p>
                </div>
              </div>
              <span className="text-[1.125rem] font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                {direction === "rtl" ? "←" : "→"}
              </span>
            </button>
          </section>
        )}

        {/* Clean Hero Zikr Reminder Card */}
        <section aria-labelledby="current-zikr-heading" className="mb-5">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-5 text-card-foreground shadow-lg transition-all dark:border-white/10 dark:bg-[#18181B]">
            {/* Card Content */}
            <div className="flex flex-col justify-between text-start">
              <div>
                <h2
                  id="current-zikr-heading"
                  className="text-[1.25rem] font-black tracking-wide text-foreground dark:text-white"
                >
                  {isArabic ? reminderInfo.titleArabic : reminderInfo.titleEnglish}
                </h2>
                <p className="mt-1 text-[0.8125rem] font-semibold leading-relaxed text-muted-foreground">
                  {isArabic ? reminderInfo.descArabic : reminderInfo.descEnglish}
                </p>

                {doneCount > 0 && (
                  <div className="mt-3">
                    <ProgressBar
                      value={doneCount}
                      max={totalCount}
                      height={6}
                      trackColor="var(--muted)"
                      direction={direction}
                      aria-label={
                        isArabic ? `تقدم ${reminderCategory.nameArabic}` : `${reminderCategory.name} progress`
                      }
                    />
                    <span className="mt-1.5 block text-[0.75rem] font-extrabold text-foreground dark:text-slate-200">
                      {formatNumerals(doneCount, language)} {isArabic ? "من" : "of"}{" "}
                      {formatNumerals(totalCount, language)} {t(language, "home.complete")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center justify-start">
                <button
                  type="button"
                  data-testid="home-primary-cta"
                  onClick={() => {
                    if (actionKind === "again") {
                      onRepeat(reminderInfo.categoryId);
                    } else {
                      onResume(reminderInfo.categoryId, nextIdx);
                    }
                  }}
                  aria-label={`${ctaLabel}. ${formatNumerals(doneCount, language)} ${isArabic ? "من" : "of"} ${formatNumerals(totalCount, language)}`}
                  className="interactive-elem group inline-flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-[0.9375rem] font-black text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all shadow-md"
                >
                  <span>{ctaLabel}</span>
                  <span
                    className="text-[1.125rem] leading-none transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  >
                    {direction === "rtl" ? "←" : "→"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Leaves & Progress Garden (Daily Progress) */}
        {quietProgressEnabled && (
          <TodayRoutineGarden
            summary={gardenSummary}
            language={language}
            hideTabs={true}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
          />
        )}
      </div>
    </ScreenContainer>
  );
}
