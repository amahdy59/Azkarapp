import { useState, useEffect, useMemo } from "react";
import { TodayRoutineGarden, PalmTreeReward } from "../components/RoutineGarden";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { getAzkarForMode, getRoutineProgress, isRoutineCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { getEstimatedPrayerTimes, getNextPrayerCountdown, timeToMinutes } from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary } from "../progress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  RoutineCategoryId,
  RoutineMode,
} from "../types";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date, location?: LocationSettings): CategoryId {
  return getTimeOfDayZikr(date, "en", location).categoryId;
}

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar", location?: LocationSettings) {
  const prayerTimes = getEstimatedPrayerTimes(now, location);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const fajrMinutes = timeToMinutes(prayerTimes.fajr);
  const asrMinutes = timeToMinutes(prayerTimes.asr);
  const ishaMinutes = timeToMinutes(prayerTimes.isha);

  if (currentMinutes >= fajrMinutes && currentMinutes < asrMinutes) {
    return {
      categoryId: "morning" as CategoryId,
      title: t(language, "home.morningTitle"),
      desc: t(language, "home.morningDesc"),
    };
  }
  if (currentMinutes >= asrMinutes && currentMinutes < ishaMinutes) {
    return {
      categoryId: "evening" as CategoryId,
      title: t(language, "home.eveningTitle"),
      desc: t(language, "home.eveningDesc"),
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    title: t(language, "home.beforeSleepTitle"),
    desc: t(language, "home.beforeSleepDesc"),
  };
}

/** Chooses one calm, useful next action without blocking access to any collection. */
export function getHomeAction(
  completed: Record<CategoryId, Set<string>>,
  now: Date = new Date(),
  location?: LocationSettings,
  routineModes: Record<RoutineCategoryId, RoutineMode> = {
    morning: "core",
    evening: "core",
    before_sleep: "core",
  },
): HomeAction {
  const suggestedId = suggestedCategoryId(now, location);
  const categoryIds = [
    suggestedId,
    ...CATEGORIES.filter((category) => category.id !== "comprehensive_duas" && category.id !== "friday_kahf").map(
      (category) => category.id,
    ),
  ].filter((id, index, values) => values.indexOf(id) === index) as CategoryId[];

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getFirstIncompleteZikrIndex(visibleAzkar, completed[categoryId]) ?? 0,
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = isRoutineCategory(suggestedId)
    ? getRoutineProgress(suggestedId, routineModes[suggestedId], completed[suggestedId] ?? []).total
    : getAzkarForMode(suggestedId, "complete").length;
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
  locationSettings,
  onResume,
  onRepeat,
  onOpenFridayMode,
  routineModes,
  onSetRoutineMode,
}: {
  completed: Record<CategoryId, Set<string>>;
  dailyCompletions: DailyCollectionCompletion[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  locationSettings?: LocationSettings;
  onResume: (category: CategoryId) => void;
  onRepeat: (category: CategoryId) => void;
  onOpenFridayMode?: () => void;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onSetRoutineMode?: (categoryId: RoutineCategoryId, mode: RoutineMode) => void;
}) {
  const isArabic = language === "ar";
  const [now, setNow] = useState(() => new Date());
  const [, setPrayerTimesRevision] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const updateAtNextMinute = () => {
      setNow(new Date());
      timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    };
    timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    return () => clearTimeout(timer);
  }, []);

  const prayerDateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  useEffect(() => {
    let active = true;
    triggerBackgroundPrayerTimesRefresh(new Date(), locationSettings, () => {
      if (active) setPrayerTimesRevision((revision) => revision + 1);
    });
    return () => {
      active = false;
    };
  }, [locationSettings, prayerDateKey]);

  const gardenSummary = useMemo(
    () => getGardenSummary(dailyCompletions, now, progressDayStartHour),
    [dailyCompletions, now, progressDayStartHour],
  );

  const nextPrayerInfo = getNextPrayerCountdown(now, language, locationSettings);

  const reminderInfo = useMemo(
    () => getTimeOfDayZikr(now, language, locationSettings),
    [now, language, locationSettings],
  );
  const reminderCategory = CATEGORIES.find((c) => c.id === reminderInfo.categoryId)!;
  const doneSet = completed[reminderInfo.categoryId] ?? new Set<string>();

  const reminderMode = isRoutineCategory(reminderInfo.categoryId) ? routineModes[reminderInfo.categoryId] : "complete";
  const visibleReminderAzkar = getAzkarForMode(reminderInfo.categoryId, reminderMode);
  const reminderProgress = isRoutineCategory(reminderInfo.categoryId)
    ? getRoutineProgress(reminderInfo.categoryId, reminderMode, doneSet)
    : {
        done: visibleReminderAzkar.filter((zikr) => doneSet.has(zikr.id)).length,
        total: visibleReminderAzkar.length,
      };
  const totalCount = reminderProgress.total;
  const doneCount = reminderProgress.done;
  const routineSummary = t(language, `category.${reminderMode}Summary`, {
    count: formatNumerals(totalCount, language),
  });
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
    <ScreenContainer dir={direction} className="px-0 relative overflow-hidden flex flex-col" screenName={t(language, "home.title")}>
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Atmospheric Background Sky Image & Backdrop Overlay */}
      <TimeOfDayBackground categoryId={reminderInfo.categoryId} />

      {/* Fixed Header & Gamification Bar */}
      <div className="relative z-20 shrink-0 px-page pt-2 pb-1">
        <header className="flex w-full flex-col gap-2 pt-1 pb-1" dir={direction}>
          <PalmTreeReward summary={gardenSummary} language={language} bare />

          {/* Time & Date Info Pill */}
          <div
            className={`flex h-[42px] w-full items-center justify-between rounded-[20px] border border-[#1f293d] bg-black/40 px-4 text-xs font-semibold backdrop-blur-md shadow-xs ${
              isArabic ? "flex-row" : "flex-row-reverse"
            }`}
          >
            {/* Left side (in RTL): Prayer timing */}
            <div data-testid="next-prayer" className="flex items-center gap-2 text-white">
              <span className="text-[#fbbf24]">
                {isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish}
              </span>
              <span className="text-slate-300">{nextPrayerInfo.formattedCountdown}</span>
            </div>

            {/* Right side (in RTL): Date */}
            <div data-testid="hijri-date" className="text-slate-300 whitespace-nowrap">{formatDisplayDate(now, language, calendarType)}</div>
          </div>
        </header>
      </div>

      {/* Scrollable Content Area */}
      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-page pb-6">
        {isFriday && onOpenFridayMode && (
          <section className="mb-4">
            <button
              type="button"
              onClick={onOpenFridayMode}
              className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/40 bg-black/50 backdrop-blur-md p-3.5 text-start shadow-md hover:bg-black/60 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black text-[1.125rem] shadow-sm">
                  ✨
                </span>
                <div>
                  <h3 className="text-[0.9375rem] font-black text-foreground">{t(language, "friday.title")}</h3>
                  <p className="text-[0.75rem] font-semibold text-muted-foreground">
                    {t(language, "friday.homeSubtitle")}
                  </p>
                </div>
              </div>
              <span className="text-[1.125rem] font-bold text-amber-600 dark:text-amber-400 transition-transform">
                {direction === "rtl" ? "←" : "→"}
              </span>
            </button>
          </section>
        )}

        {/* Hero Zikr Banner */}
        {isComplete ? (
          <TranquilityCompletionCard
            categoryId={reminderInfo.categoryId}
            language={language}
            direction={direction}
            onReview={onRepeat}
          />
        ) : (
          <section aria-labelledby="current-zikr-heading" className="mb-5">
            <div className="flex flex-col gap-4 text-start">
              {/* Hero Text Block */}
              <div className="flex flex-col gap-1 px-1 pt-1">
                <p className="text-[1.125rem] font-medium text-[#e2e8f0]" dir="auto">
                  {isArabic ? "حان وقت" : "Time for"}
                </p>
                <h2
                  id="current-zikr-heading"
                  className="text-2xl font-black text-[#fbbf24] tracking-wide"
                  dir="auto"
                  style={{ lineHeight: "1.3" }}
                >
                  {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                </h2>
                <p className="text-[0.8125rem] font-normal text-[#9ca3af]" dir="auto">
                  {reminderInfo.desc}
                </p>
              </div>

              {/* Routine Mode Selector Pill */}
              <div 
                className="flex h-[44px] w-full items-center rounded-2xl bg-black/50 p-1 backdrop-blur-md shadow-sm border border-white/5"
                role="group"
                aria-label={t(language, "home.routineModeSelector", "Routine mode")}
              >
                <button
                  type="button"
                  aria-pressed={reminderMode === "complete"}
                  onClick={() => {
                    if (isRoutineCategory(reminderInfo.categoryId)) {
                      onSetRoutineMode?.(reminderInfo.categoryId, "complete");
                    }
                  }}
                  className={`flex flex-1 items-center justify-center rounded-xl h-full transition-all text-[0.8125rem] font-bold ${
                    reminderMode === "complete"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isArabic ? "الكاملة" : "Complete"}
                </button>
                <button
                  type="button"
                  aria-pressed={reminderMode === "core"}
                  onClick={() => {
                    if (isRoutineCategory(reminderInfo.categoryId)) {
                      onSetRoutineMode?.(reminderInfo.categoryId, "core");
                    }
                  }}
                  className={`flex flex-1 items-center justify-center rounded-xl h-full transition-all text-[0.8125rem] font-bold ${
                    reminderMode === "core"
                      ? "bg-amber-500 text-slate-950 shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isArabic ? "المختصرة" : "Abbreviated"}
                </button>
              </div>

              {/* Info Row: Duration & Count */}
              <div className="flex items-center justify-between px-3 text-xs text-[#9ca3af]" dir="auto">
                <div className="flex items-center gap-1.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{isArabic ? "٦ دقائق تقريباً" : "~6 mins"}</span>
                </div>

                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                  <span>{routineSummary}</span>
                </div>
              </div>

              {/* Primary CTA Button */}
              <button
                type="button"
                data-testid="home-primary-cta"
                onClick={() => {
                  if (actionKind === "again") {
                    onRepeat(reminderInfo.categoryId);
                  } else {
                    onResume(reminderInfo.categoryId);
                  }
                }}
                aria-label={`${ctaLabel}. ${routineSummary}. ${formatNumerals(doneCount, language)} ${isArabic ? "من" : "of"} ${formatNumerals(totalCount, language)}`}
                className="interactive-elem group relative flex h-[52px] w-full items-center justify-center rounded-[26px] bg-[#fbbf24] px-5 text-[1.0625rem] font-bold text-[#080c14] shadow-lg hover:bg-amber-400 active:scale-[0.99] transition-all"
              >
                <span className="font-sans">{ctaLabel}</span>
                <div
                  className={`absolute ${isArabic ? "start-5 rotate-180 group-hover:-translate-x-1" : "end-5 group-hover:translate-x-1"} flex items-center justify-center transition-transform`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </button>
            </div>
          </section>
        )}

        {/* Leaves & Progress Garden (Daily Progress Card) */}
        {quietProgressEnabled && (
          <TodayRoutineGarden
            summary={gardenSummary}
            language={language}
            hideTabs={true}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
          />
        )}
      </main>
    </ScreenContainer>
  );
}
