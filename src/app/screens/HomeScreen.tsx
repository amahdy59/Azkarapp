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

  const bgPath =
    reminderInfo.categoryId === "morning"
      ? "/morning_sky.webp"
      : reminderInfo.categoryId === "evening"
        ? "/evening_sky.webp"
        : "/sleep_sky.webp";

  return (
    <ScreenContainer dir={direction} className="px-0 relative overflow-hidden">
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Atmospheric Background Sky Image & Backdrop Overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <img
          src={bgPath}
          alt=""
          className="absolute inset-0 size-full object-cover object-center transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/60 via-[#080c14]/40 to-[#080c14]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-page pt-2 pb-6">
        {/* Header & Gamification Bar */}
        <header className="flex w-full shrink-0 flex-col gap-3 pt-1 pb-3" dir={direction}>
          <PalmTreeReward summary={gardenSummary} language={language} bare />

          {/* Time & Date Info Pill */}
          <div
            className="flex h-[42px] w-full items-center justify-between rounded-[20px] border border-[#1f293d] bg-black/40 px-4 text-xs font-semibold backdrop-blur-md shadow-xs"
            data-testid="prayer-header-card"
          >
            <div
              className="flex min-w-0 items-center gap-1.5 text-slate-100"
              data-testid="next-prayer"
              dir="auto"
              title={
                isArabic ? `الصلاة القادمة: ${nextPrayerInfo.nameArabic}` : `Next Prayer: ${nextPrayerInfo.nameEnglish}`
              }
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <span className="truncate font-sans font-bold" style={{ fontVariantNumeric: "tabular-nums lining-nums" }}>
                {isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish} •{" "}
                {nextPrayerInfo.formattedCountdown}
              </span>
            </div>

            <span className="h-4 w-px bg-white/20" aria-hidden="true" />

            <div className="flex min-w-0 items-center gap-1.5 text-slate-100" data-testid="hijri-date" dir="auto">
              <span className="truncate font-sans font-bold">{formatDisplayDate(now, language, calendarType)}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FBBF24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
        </header>

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
              <div className="flex flex-col gap-1 px-1 pt-2">
                <p className="text-[1.25rem] font-medium text-slate-200" dir="auto">
                  {isArabic ? "حان وقت" : "Time for"}
                </p>
                <h2
                  id="current-zikr-heading"
                  className="text-[2.25rem] font-black text-[#fbbf24] tracking-wide"
                  dir="auto"
                >
                  {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                </h2>
                <p className="text-[0.8125rem] font-normal text-[#9ca3af]" dir="auto">
                  {reminderInfo.desc}
                </p>
              </div>

              {/* Routine Mode Selector Pill */}
              <div className="flex h-[40px] w-full items-center rounded-[20px] border border-[#1f293d] bg-[#080c14]/80 p-1 shadow-inner backdrop-blur-md">
                <div
                  className={`flex flex-1 items-center justify-center rounded-[16px] h-full transition-all text-xs font-semibold ${
                    reminderMode === "complete" ? "bg-white/10 text-[#fbbf24]" : "text-gray-400"
                  }`}
                >
                  {isArabic ? "الكاملة" : "Complete"}
                </div>
                <div
                  className={`flex flex-1 items-center justify-center rounded-[16px] h-full transition-all text-xs font-semibold ${
                    reminderMode === "core" ? "bg-white/10 text-[#fbbf24]" : "text-gray-400 opacity-60"
                  }`}
                >
                  {isArabic ? "المختصرة" : "Abbreviated"}
                </div>
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

                <span className="size-1 rounded-full bg-gray-500" aria-hidden="true" />

                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <span>{routineSummary}</span>
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
                className="interactive-elem group flex h-[50px] w-full items-center justify-between rounded-[25px] bg-[#fbbf24] px-5 text-[1rem] font-bold text-[#080c14] shadow-lg hover:bg-amber-400 active:scale-[0.99] transition-all"
              >
                <div className="flex size-[20px] items-center justify-center shrink-0">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className={direction === "rtl" ? "" : "rotate-180"}
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </div>
                <span className="font-sans tracking-wide">{ctaLabel}</span>
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
      </div>
    </ScreenContainer>
  );
}
