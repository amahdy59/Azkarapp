import { useState, useEffect, useMemo } from "react";
import { ProgressBar } from "../components/ProgressBar";
import { TodayRoutineGarden, PalmTreeReward } from "../components/RoutineGarden";
import { getCategoryTotal, getAzkarByCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatHijriDate, formatNumerals, numeralFontFamily } from "../formatting";
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

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar") {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 4 && hour < 15.5) {
    return {
      categoryId: "morning" as CategoryId,
      title: t(language, "home.morningTitle"),
      desc: t(language, "home.morningDesc"),
    };
  }
  if (hour >= 15.5 && hour < 20) {
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
  const reminderInfo = useMemo(() => getTimeOfDayZikr(now, language), [now, language]);
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

      {/* Combined Header Card — Badges & Date/Clock */}
      <header className="w-full shrink-0 px-0 pt-0 pb-2">
        <div
          className="flex w-full flex-col gap-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 shadow-xs dark:bg-amber-950/30 dark:border-amber-500/20"
          dir={direction}
        >
          {/* Badges section */}
          <PalmTreeReward summary={gardenSummary} language={language} bare />

          {/* Light line separator */}
          <div className="h-px w-full bg-amber-500/20 dark:bg-amber-500/20" />

          {/* Islamic Date & Live Clock section */}
          <div className="flex w-full items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span aria-hidden="true" className="shrink-0 text-[1.05rem]">
                🌙
              </span>
              <span
                className="truncate text-[0.84375rem] font-black text-amber-950 dark:text-amber-100"
                data-testid="hijri-date"
                dir="auto"
              >
                {formatHijriDate(now, language)}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/20 px-2.5 py-1 dark:bg-amber-900/40">
              <span aria-hidden="true" className="text-[0.75rem]">
                🕒
              </span>
              <span
                className="text-[0.8125rem] font-black text-amber-950 dark:text-amber-100"
                dir="auto"
                style={{ fontFamily: numeralFontFamily(language), fontVariantNumeric: "tabular-nums lining-nums" }}
              >
                {now.toLocaleTimeString(isArabic ? "ar-SA" : "en-US", { hour: "numeric", minute: "numeric" })}
              </span>
            </div>
          </div>
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
                  <h3 className="text-[0.9375rem] font-black text-foreground">{t(language, "friday.title")}</h3>
                  <p className="text-[0.75rem] font-semibold text-muted-foreground">
                    {t(language, "friday.homeSubtitle")}
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
                  {reminderInfo.title}
                </h2>
                <p className="mt-1 text-[0.8125rem] font-semibold leading-relaxed text-muted-foreground">
                  {reminderInfo.desc}
                </p>

                {doneCount > 0 && (
                  <div className="mt-3">
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
