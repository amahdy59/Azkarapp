import { useState, useCallback, useMemo } from "react";
import { Header, IconButton } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getDailyPathStatus, wasPrayedAtMosque } from "../dailyPath";
import { getGardenSummary, getProgressDayKey } from "../progress";

import { TabList } from "../components/Tabs";
import { shiftCalendarDate } from "../calendarPeriods";
import { getGardenDateLabel } from "../components/gardenDateLabel";

import { PrayerTrackerCards, type PrayerTrackingField } from "../components/PrayerTrackerCards";
import { useNow } from "../hooks/useNow";
import { buildPrayerCardModels } from "../prayerCardModels";
import { FridayProgressCard } from "../components/FridayProgressCard";
import { PrayerTrackerStats } from "../components/PrayerTrackerStats";
import { FridayProgressStats } from "../components/FridayProgressStats";

import { getFridaySummary } from "../fridaySummary";
import { formatNumerals } from "../formatting";
import {
  calculateOasisLevel,
  deriveOasisRoutinesFromCompletions,
  OASIS_LEVEL_DETAILS,
  type GardenLevel,
  type OasisHabits,
} from "../oasis/oasisModel";
import { DropletMark, SeedlingMark, BranchMark, PalmTreeMark, OasisMark } from "../components/GardenMarks";
import { DailyCompanionsCard } from "../components/DailyCompanionsCard";
import { Share2, Sparkles, Zap } from "../components/icons";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  DailyHabitCompletion,
  DailyHabitId,
  LocationSettings,
  PrayerName,
  PrayerTrackingRecord,
  QuranWirdPlan,
} from "../types";

/** The wird is the three time-of-day routines. After-prayer adhkar are tracked
 *  per prayer in their own section below, the same split Home uses. */
const WIRD_CATEGORY_IDS = ["morning", "evening", "before_sleep"] as const satisfies readonly CategoryId[];

function renderTierMark(level: GardenLevel, size = 32) {
  switch (level) {
    case 1:
      return <DropletMark size={size} color="var(--primary)" />;
    case 2:
      return <SeedlingMark size={size} color="var(--success)" />;
    case 3:
      return <BranchMark size={size} />;
    case 4:
      return <PalmTreeMark size={size} />;
    case 5:
      return <OasisMark size={size} />;
    default:
      return (
        <div
          className="rounded-full border-2 border-dashed border-border"
          style={{ width: size * 0.7, height: size * 0.7 }}
          aria-hidden="true"
        />
      );
  }
}

export function ProgressScreen({
  dailyCompletions,
  progressDayStartHour,
  calendarType,
  language,
  direction,
  onOpenShareModal,
  onSelectCategory,
  locationSettings,
  prayerTracking = [],
  dailyHabits = [],
  wirdHistory,
  quranWirdPlan,
  quranWirdDailyGoals,
  mosquePrayerGoal,
  dailyPathStartDayKey,
  onTogglePrayerTracking,
  onToggleDailyHabit,
  onCycleMosqueHabit,
  onPrayerResume,
  onOpenFriday,
}: {
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  calendarType: "hijri" | "gregorian";
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpenShareModal: () => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
  locationSettings?: LocationSettings;
  prayerTracking?: readonly PrayerTrackingRecord[];
  dailyHabits?: readonly DailyHabitCompletion[];
  wirdHistory?: Record<string, number[]>;
  quranWirdPlan?: QuranWirdPlan;
  quranWirdDailyGoals?: Record<string, number>;
  mosquePrayerGoal?: number;
  dailyPathStartDayKey?: string;
  onTogglePrayerTracking?: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onToggleDailyHabit?: (dayKey: string, habit: DailyHabitId) => void;
  onCycleMosqueHabit?: (dayKey: string) => void;
  onPrayerResume?: (prayer: PrayerName) => void;
  onOpenFriday?: () => void;
}) {
  const now = useNow();

  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [offset, setOffset] = useState(0);

  const isArabic = language === "ar";
  const displayDate = shiftCalendarDate(now, activeTab, offset, calendarType);
  const dateLabel = getGardenDateLabel(displayDate, activeTab, offset, language, calendarType);

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    setActiveTab(tab);
    setOffset(0);
  };

  const prayerCardModels = buildPrayerCardModels(now, language, locationSettings);

  const judgeDay = useCallback(
    (dayKey: string) => {
      const status = getDailyPathStatus({
        dayKey,
        dailyCompletions,
        wirdHistory: wirdHistory ?? {},
        quranWirdPlan,
        quranWirdDailyGoals,
        prayerTracking,
        mosquePrayerGoal,
        dailyPathStartDayKey,
      });
      return { palm: status.palmEarned, qualifies: status.streakQualified };
    },
    [
      dailyCompletions,
      dailyPathStartDayKey,
      mosquePrayerGoal,
      prayerTracking,
      quranWirdDailyGoals,
      quranWirdPlan,
      wirdHistory,
    ],
  );

  const fridaySummary = getFridaySummary();

  const activeGardenSummary = useMemo(
    () =>
      activeTab === "day" && offset === 0
        ? getGardenSummary(dailyCompletions, now, progressDayStartHour, judgeDay)
        : getGardenSummary(dailyCompletions, displayDate, progressDayStartHour, judgeDay),
    [activeTab, offset, dailyCompletions, now, progressDayStartHour, judgeDay, displayDate],
  );

  // Current day key for Oasis evaluation
  const currentDayKey = getProgressDayKey(displayDate, progressDayStartHour);
  const oasisRoutines = deriveOasisRoutinesFromCompletions(dailyCompletions, currentDayKey);
  const dayHabits = (dailyHabits ?? []).filter((h) => h.dayKey === currentDayKey);

  const quranWirdDone =
    (wirdHistory?.[currentDayKey]?.length ?? 0) > 0 || dayHabits.some((h) => h.habit === "quran_wird");

  const mosqueAttendanceCount = prayerTracking.filter((r) => r.dayKey === currentDayKey && wasPrayedAtMosque(r)).length;

  const mosqueHabit = dayHabits.find((h) => h.habit.startsWith("mosque_"))?.habit as
    "mosque_3" | "mosque_5" | undefined;
  const resolvedMosquePrayers: "mosque_3" | "mosque_5" | null =
    mosqueHabit ?? (mosqueAttendanceCount >= 5 ? "mosque_5" : mosqueAttendanceCount >= 3 ? "mosque_3" : null);

  const activeHabit =
    dayHabits.some((h) => h.habit === "active") ||
    oasisRoutines.morning ||
    oasisRoutines.evening ||
    oasisRoutines.beforeSleep ||
    oasisRoutines.afterPrayerCount > 0;

  const oasisHabits: OasisHabits = {
    quranWird: quranWirdDone,
    mosquePrayers: resolvedMosquePrayers,
    active: activeHabit,
  };

  const oasisLevel = calculateOasisLevel(oasisRoutines, oasisHabits);
  const levelDetails = OASIS_LEVEL_DETAILS[oasisLevel];

  // 7-day progression history ending on displayDate
  const weekDaysStatus = useMemo(() => {
    const days: Array<{
      date: Date;
      dayKey: string;
      level: GardenLevel;
      dayLabel: string;
      isToday: boolean;
    }> = [];

    const todayKey = getProgressDayKey(now, progressDayStartHour);

    const weekdayKeys = [
      "progress.weekdaySunday",
      "progress.weekdayMonday",
      "progress.weekdayTuesday",
      "progress.weekdayWednesday",
      "progress.weekdayThursday",
      "progress.weekdayFriday",
      "progress.weekdaySaturday",
    ] as const;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(displayDate);
      d.setDate(d.getDate() - i);
      const dKey = getProgressDayKey(d, progressDayStartHour);
      const routines = deriveOasisRoutinesFromCompletions(dailyCompletions, dKey);
      const hRecords = (dailyHabits ?? []).filter((h) => h.dayKey === dKey);
      const qDone = (wirdHistory?.[dKey]?.length ?? 0) > 0 || hRecords.some((h) => h.habit === "quran_wird");
      const mCount = prayerTracking.filter((r) => r.dayKey === dKey && wasPrayedAtMosque(r)).length;
      const mHab = hRecords.find((h) => h.habit.startsWith("mosque_"))?.habit as "mosque_3" | "mosque_5" | undefined;
      const mRes = mHab ?? (mCount >= 5 ? "mosque_5" : mCount >= 3 ? "mosque_3" : null);
      const lvl = calculateOasisLevel(routines, {
        quranWird: qDone,
        mosquePrayers: mRes,
        active: routines.morning || routines.evening || routines.beforeSleep || routines.afterPrayerCount > 0,
      });

      const dayOfWeek = d.getDay();
      const isToday = dKey === todayKey;
      const dayKeyTranslation = weekdayKeys[dayOfWeek] ?? "progress.weekdaySunday";
      const dayLabel = isToday ? t(language, "progress.today") : t(language, dayKeyTranslation);

      days.push({
        date: d,
        dayKey: dKey,
        level: lvl,
        dayLabel,
        isToday,
      });
    }
    return days;
  }, [displayDate, progressDayStartHour, dailyCompletions, dailyHabits, wirdHistory, prayerTracking, now, language]);

  return (
    <ScreenContainer
      dir={direction}
      tabIndex={0}
      className="relative px-page py-4 overflow-y-auto page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      screenName={t(language, "common.progress")}
    >
      <div className="relative z-10 mx-auto w-full max-w-[80rem] flex flex-col items-center">
        <Header
          title={t(language, "common.progress")}
          language={language}
          right={
            onOpenShareModal ? (
              <IconButton onClick={onOpenShareModal} label={t(language, "progress.shareProgressCard")}>
                <Share2 size={20} className="text-foreground" />
              </IconButton>
            ) : undefined
          }
        />

        {/* Serene Prophetic Touchstone on Constancy */}
        <div className="w-full mb-4 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-center shadow-xs">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-xs font-bold text-foreground leading-relaxed" dir="auto">
            <span>{t(language, "progress.constancyHadith")}</span>
            <span className="ms-1.5 text-micro font-semibold text-muted-foreground">
              — {t(language, "progress.constancyHadithSource")}
            </span>
          </p>
        </div>

        <div className="w-full mb-4">
          <TabList
            value={activeTab}
            onChange={handleTabChange}
            direction={isArabic ? "rtl" : "ltr"}
            idPrefix="global-progress"
            aria-label={t(language, "garden.viewMode")}
            className="mb-4 flex rounded-full border border-border bg-muted p-1"
            itemClassName={(selected) =>
              `flex flex-1 min-h-[44px] items-center justify-center rounded-full py-2 text-sm font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
            tabs={(["day", "week", "month", "year"] as const).map((tab) => ({
              value: tab,
              label: t(
                language,
                (
                  {
                    day: "garden.tabDay",
                    week: "garden.tabWeek",
                    month: "garden.tabMonth",
                    year: "garden.tabYear",
                  } as const
                )[tab],
              ),
            }))}
          />

          <div className="flex items-center justify-between rounded-3xl border border-border/40 bg-card px-3 py-2 shadow-raised">
            <button
              type="button"
              onClick={() => setOffset((prev) => prev - 1)}
              aria-label={t(language, "garden.prevPeriod")}
              title={t(language, "garden.prevPeriod")}
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points={isArabic ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
              </svg>
            </button>

            <span
              data-testid="garden-view-date"
              className="px-2 text-center text-subtitle font-black tracking-wide text-foreground"
              dir="auto"
              aria-live="polite"
              aria-atomic="true"
            >
              {dateLabel}
            </span>

            <button
              type="button"
              onClick={() => setOffset((prev) => prev + 1)}
              disabled={offset >= 0}
              aria-label={t(language, "garden.nextPeriod")}
              title={t(language, "garden.nextPeriod")}
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 text-foreground transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-30 disabled:hover:bg-transparent enabled:hover:bg-muted"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points={isArabic ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Enduring Palms and Preserved Streak Summary in Day View */}
        {activeTab === "day" && (
          <div data-testid="progress-summary-strip" className="w-full mb-4 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/85 p-3.5 shadow-sm backdrop-blur-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0">
                <span className="block text-micro font-bold text-muted-foreground truncate">
                  {t(language, "progress.activeStreakSummary")}
                </span>
                <span className="block text-sm font-black text-foreground">
                  {formatNumerals(activeGardenSummary.currentUsageStreak ?? 0, language)} {t(language, "progress.days")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/85 p-3.5 shadow-sm backdrop-blur-md">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                <PalmTreeMark size={22} className="text-primary" />
              </div>
              <div className="min-w-0">
                <span className="block text-micro font-bold text-muted-foreground truncate">
                  {t(language, "progress.lifetimePalmsSummary")}
                </span>
                <span className="block text-sm font-black text-foreground">
                  {formatNumerals(activeGardenSummary.lifetimePalms, language)} {t(language, "progress.palmsUnit")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Oasis Stage Hero & 7-Day Rhythm (Day view) */}
        {activeTab === "day" && (
          <section
            data-testid="oasis-stage-card"
            className="w-full mb-5 overflow-hidden rounded-3xl border border-border/60 bg-card/90 text-foreground shadow-raised backdrop-blur-md transition-all"
            dir={isArabic ? "rtl" : "ltr"}
            aria-labelledby="oasis-stage-heading"
          >
            <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-12 sm:size-14 items-center justify-center rounded-2xl border border-border/80 bg-muted/30 shadow-sm shrink-0">
                    {renderTierMark(oasisLevel, 36)}
                  </div>
                  <div>
                    <span className="text-micro font-black uppercase tracking-wider text-muted-foreground block">
                      {t(language, "progress.oasisStageTitle")}
                    </span>
                    <h2 id="oasis-stage-heading" className="text-title font-black text-foreground leading-tight">
                      {isArabic ? levelDetails.nameArabic : levelDetails.name}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-sm font-black text-primary shrink-0">
                  <span>
                    {t(language, "progress.oasisLevelBadge", { level: formatNumerals(oasisLevel, language) })}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-caption font-semibold leading-relaxed text-muted-foreground" dir="auto">
                {isArabic ? levelDetails.descriptionArabic : levelDetails.description}
              </p>

              {/* Progress Bar towards next milestone */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-micro font-bold text-muted-foreground mb-1.5">
                  <span>{t(language, "progress.stageCompletion")}</span>
                  <span>{formatNumerals(levelDetails.progressPercent, language)}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={levelDetails.progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={isArabic ? levelDetails.nameArabic : levelDetails.name}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-success to-primary transition-all duration-500"
                    style={{ width: `${levelDetails.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Next Milestone Hint */}
              <div className="mt-3 flex items-start gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs font-semibold text-foreground">
                <Sparkles className="size-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                <span dir="auto">
                  <strong className="font-black text-primary">{t(language, "progress.nextMilestonePrefix")}</strong>
                  {isArabic ? levelDetails.nextMilestoneArabic : levelDetails.nextMilestone}
                </span>
              </div>
            </div>

            {/* 7-Day Rhythm Strip */}
            <div className="bg-card/90 px-4 py-3 sm:px-6">
              <span className="text-micro font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                {t(language, "progress.sevenDayRhythm")}
              </span>
              <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center" role="list">
                {weekDaysStatus.map((day) => {
                  const levelShortName = isArabic
                    ? OASIS_LEVEL_DETAILS[day.level].nameArabic.split(" ")[0]
                    : OASIS_LEVEL_DETAILS[day.level].name.split(" ")[0];
                  return (
                    <div
                      key={day.dayKey}
                      role="listitem"
                      className={`flex flex-col items-center justify-center rounded-2xl p-1.5 sm:p-2 transition-all ${
                        day.isToday
                          ? "border-2 border-primary bg-primary/10 shadow-sm"
                          : "border border-border/40 bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <span className="text-micro font-bold text-muted-foreground">{day.dayLabel}</span>
                      <div className="my-1 flex size-8 sm:size-9 items-center justify-center">
                        {renderTierMark(day.level, 24)}
                      </div>
                      <span className="text-micro font-bold text-foreground truncate max-w-full">
                        {day.level > 0 ? levelShortName : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Wird Routines */}
        <div className="w-full mb-5">
          <TodayRoutineGarden
            summary={activeGardenSummary}
            language={language}
            hideTabs={true}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
            onOpenShareModal={onOpenShareModal}
            onSelectCategory={onSelectCategory}
            visibleCategoryIds={WIRD_CATEGORY_IDS}
            onMedia={false}
            activeTab={activeTab}
            displayDate={displayDate}
          />
        </div>

        {/* Daily Companions (Day view) */}
        {activeTab === "day" && (
          <div className="w-full mb-5">
            <DailyCompanionsCard
              language={language}
              quranWird={quranWirdDone}
              mosquePrayers={resolvedMosquePrayers}
              onToggleQuranWird={() => onToggleDailyHabit?.(currentDayKey, "quran_wird")}
              onCycleMosquePrayers={() => onCycleMosqueHabit?.(currentDayKey)}
            />
          </div>
        )}

        {/* After-prayer Adhkar section */}
        <section
          data-testid="progress-after-prayer"
          dir={direction}
          className="w-full mb-5 overflow-hidden rounded-3xl border border-border/60 bg-card/90 text-foreground shadow-raised backdrop-blur-md"
        >
          <div className="border-b border-border/60 bg-muted/40 px-4 py-4 text-start sm:px-6">
            <h2 className="text-lg font-black leading-tight text-foreground" dir="auto">
              {t(language, "progress.postPrayerAzkar")}
            </h2>
          </div>
          <div className="py-4">
            {activeTab === "day" ? (
              <PrayerTrackerCards
                models={prayerCardModels}
                language={language}
                direction={direction}
                records={prayerTracking}
                dayKey={currentDayKey}
                onToggle={onTogglePrayerTracking ?? (() => undefined)}
                onOpen={(prayer) => {
                  if (prayer) onPrayerResume?.(prayer);
                }}
              />
            ) : (
              <PrayerTrackerStats
                records={prayerTracking}
                activeTab={activeTab}
                displayDate={displayDate}
                language={language}
                calendarType={calendarType}
              />
            )}
          </div>
        </section>

        {/* Friday Card / Stats */}
        {activeTab === "day" ? (
          <FridayProgressCard summary={fridaySummary} language={language} direction={direction} onOpen={onOpenFriday} />
        ) : (
          <FridayProgressStats
            activeTab={activeTab}
            displayDate={displayDate}
            language={language}
            calendarType={calendarType}
            direction={direction}
          />
        )}
      </div>
    </ScreenContainer>
  );
}
