import { useState, useEffect, useMemo } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { TodayRoutineGarden, PalmTreeReward } from "../components/RoutineGarden";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { getAzkarByCategory, getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { getEstimatedPrayerTimes, getNextPrayerCountdown, timeToMinutes } from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatHijriDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { getFirstIncompleteZikrIndex, getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, LocationSettings } from "../types";

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
): HomeAction {
  const suggestedId = suggestedCategoryId(now, location);
  const categoryIds = [suggestedId, ...CATEGORIES.map((category) => category.id)].filter(
    (id, index, values) => values.indexOf(id) === index,
  ) as CategoryId[];

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getFirstIncompleteZikrIndex(getAzkarByCategory(categoryId), completed[categoryId]) ?? 0,
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
  locationSettings,
  onResume,
  onRepeat,
  onOpenFridayMode,
  onOpenShareModal: _onOpenShareModal,
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
  onOpenShareModal?: () => void;
}) {
  const isArabic = language === "ar";
  const [now, setNow] = useState(() => new Date());
  const [, setPrayerTimesRevision] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
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

  const totalCount = getCategoryTotal(reminderInfo.categoryId);
  const doneCount = doneSet.size;
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
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      <header className="flex w-full shrink-0 flex-col gap-2.5 px-1 pt-1 pb-3" dir={direction}>
        <PalmTreeReward summary={gardenSummary} language={language} bare />

        <div
          className="grid w-full grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-stretch rounded-2xl border border-amber-500/25 bg-amber-500/10 px-1.5 py-1.5 text-center shadow-2xs backdrop-blur-md dark:border-amber-500/30 dark:bg-amber-950/30"
          data-testid="prayer-header-card"
        >
          <div className="flex min-w-0 items-center justify-center px-1" data-testid="hijri-date" dir="auto">
            <span className="font-sans text-[0.6875rem] leading-4 font-extrabold text-amber-950 min-[390px]:text-[0.75rem] dark:text-amber-100">
              {formatHijriDate(now, language)}
            </span>
          </div>

          <span className="h-5 w-px self-center bg-amber-700/25 dark:bg-amber-200/25" aria-hidden="true" />

          <div
            className="flex min-w-0 items-center justify-center px-1"
            data-testid="next-prayer"
            dir="auto"
            title={
              isArabic ? `الصلاة القادمة: ${nextPrayerInfo.nameArabic}` : `Next Prayer: ${nextPrayerInfo.nameEnglish}`
            }
          >
            <span
              className="whitespace-nowrap font-sans text-[0.6875rem] font-extrabold text-amber-950 min-[390px]:text-[0.75rem] dark:text-amber-100"
              style={{ fontVariantNumeric: "tabular-nums lining-nums" }}
            >
              {isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish} • {nextPrayerInfo.formattedCountdown}
            </span>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-1 pb-4">
        {isFriday && onOpenFridayMode && (
          <section className="mb-4">
            <button
              type="button"
              onClick={onOpenFridayMode}
              className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-start shadow-md hover:bg-amber-500/15 transition-all dark:bg-amber-500/15"
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

        {/* Hero Zikr Section: Tranquility Card if complete, active card if incomplete */}
        {isComplete ? (
          <TranquilityCompletionCard
            categoryId={reminderInfo.categoryId}
            language={language}
            direction={direction}
            onReview={onRepeat}
          />
        ) : (
          <section aria-labelledby="current-zikr-heading" className="mb-4">
            <div
              className={`relative overflow-hidden rounded-3xl border p-4 transition-all shadow-md ${
                reminderInfo.categoryId === "morning"
                  ? "border-amber-300/80 bg-gradient-to-br from-amber-100/90 via-amber-50 to-orange-100/80 dark:border-amber-500/30 dark:from-[#2c1c0a] dark:via-[#1e1408] dark:to-[#140e05]"
                  : reminderInfo.categoryId === "evening"
                    ? "border-orange-300/80 bg-gradient-to-br from-orange-100/90 via-amber-50 to-rose-100/80 dark:border-orange-500/30 dark:from-[#2e160a] dark:via-[#1f1008] dark:to-[#140a05]"
                    : "border-sky-300/80 bg-gradient-to-br from-sky-100/90 via-indigo-50 to-blue-100/80 dark:border-sky-500/30 dark:from-[#0c1c38] dark:via-[#081226] dark:to-[#050c19]"
              }`}
            >
              {/* Card Content Overlay */}
              <div className="flex flex-col justify-between text-start">
                <div>
                  <h2 id="current-zikr-heading" className="text-[1.25rem] font-black tracking-wide text-foreground">
                    {reminderInfo.title}
                  </h2>
                  <p className="mt-1 text-[0.8125rem] font-semibold leading-relaxed text-muted-foreground">
                    {reminderInfo.desc}
                  </p>

                  {doneCount > 0 && (
                    <div className="mt-3.5">
                      <ProgressBar
                        value={doneCount}
                        max={totalCount}
                        height={6}
                        trackColor="var(--muted)"
                        direction={direction}
                        aria-label={t(language, "home.progressOf", {
                          done: formatNumerals(doneCount, language),
                          total: formatNumerals(totalCount, language),
                        })}
                      />
                      <span className="mt-1.5 block text-[0.75rem] font-extrabold text-foreground dark:text-slate-200">
                        {t(language, "home.progressOf", {
                          done: formatNumerals(doneCount, language),
                          total: formatNumerals(totalCount, language),
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-start">
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
                    aria-label={`${ctaLabel}. ${formatNumerals(doneCount, language)} ${isArabic ? "من" : "of"} ${formatNumerals(totalCount, language)}`}
                    className="interactive-elem group inline-flex w-full min-h-[48px] items-center justify-center gap-2.5 rounded-2xl px-6 py-3 text-[0.9375rem] font-black text-slate-950 bg-amber-500 hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all shadow-md"
                  >
                    <span>{ctaLabel}</span>
                    <span className="text-[1.125rem] leading-none transition-transform" aria-hidden="true">
                      {direction === "rtl" ? "←" : "→"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

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
