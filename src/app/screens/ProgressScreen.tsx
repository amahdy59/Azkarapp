import { PEER_TAB_SELECTED } from "../components/ui/controlStyles";
import "./progress-screen.css";
import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Header, IconButton } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getDailyPathStatus, wasPrayedAtMosque, type PalmTier } from "../dailyPath";
import { getGardenSummary, getProgressDayKey } from "../progress";

import { TabList, tabPanelProps } from "../components/Tabs";
import { getCalendarMonthPeriod, shiftCalendarDate } from "../calendarPeriods";
import { ProgressPeriodNavigation } from "../components/ProgressPeriodNavigation";
import { getProgressPeriodHeading } from "../components/gardenDateLabel";

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
import {
  DropletMark,
  SeedlingMark,
  BranchMark,
  PalmTreeMark,
  OasisMark,
  PathRewardMark,
} from "../components/GardenMarks";
import { ChevronDown, Share2, Sparkles, Zap } from "../components/icons";
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
  weeklyGoalDays,
  onTogglePrayerTracking,
  onToggleDailyHabit,
  onCycleMosqueHabit: _onCycleMosqueHabit,
  onPrayerResume,
  onOpenFriday,
  onOpenKhatmah,
  initialPeriod = "day",
  onPeriodChange,
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
  weeklyGoalDays?: number;
  onTogglePrayerTracking?: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onToggleDailyHabit?: (dayKey: string, habit: DailyHabitId) => void;
  onCycleMosqueHabit?: (dayKey: string) => void;
  onPrayerResume?: (prayer: PrayerName) => void;
  onOpenFriday?: () => void;
  onOpenKhatmah?: () => void;
  initialPeriod?: "day" | "week" | "month" | "year";
  onPeriodChange?: (period: "day" | "week" | "month" | "year") => void;
}) {
  const now = useNow();

  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">(initialPeriod);
  const [offset, setOffset] = useState(0);
  const controlsRef = useRef<HTMLDivElement>(null);
  const pointerFocus = useRef(false);
  useEffect(() => {
    const controls = controlsRef.current;
    const scrollport = controls?.closest<HTMLElement>(".app-screen-surface");
    if (!controls || !scrollport) return;
    const measure = () => {
      scrollport.style.setProperty("--progress-controls-max-height", `${scrollport.clientHeight * 0.6}px`);
      scrollport.style.setProperty("--progress-controls-height", `${controls.getBoundingClientRect().height}px`);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(controls);
    observer?.observe(scrollport);
    return () => {
      observer?.disconnect();
      scrollport.style.removeProperty("--progress-controls-height");
      scrollport.style.removeProperty("--progress-controls-max-height");
    };
  }, []);
  const activePeriodRef = useRef(initialPeriod);
  useEffect(() => {
    if (initialPeriod === activePeriodRef.current) return;
    activePeriodRef.current = initialPeriod;
    setActiveTab(initialPeriod);
    setOffset(0);
  }, [initialPeriod]);

  const isArabic = language === "ar";
  const displayDate = shiftCalendarDate(now, activeTab, offset, calendarType);
  const periodHeading = getProgressPeriodHeading(displayDate, activeTab, offset, language, calendarType);

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    activePeriodRef.current = tab;
    setActiveTab(tab);
    setOffset(0);
    onPeriodChange?.(tab);
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
  const currentDayKey =
    activeTab === "day" && offset === 0
      ? getProgressDayKey(now, progressDayStartHour)
      : getProgressDayKey(displayDate, progressDayStartHour);

  const { selectedDayPath, quranWirdDone, oasisLevel, levelDetails } = useMemo(() => {
    const pathStatus = getDailyPathStatus({
      dayKey: currentDayKey,
      dailyCompletions,
      wirdHistory: wirdHistory ?? {},
      quranWirdPlan,
      quranWirdDailyGoals,
      prayerTracking,
      mosquePrayerGoal,
      dailyPathStartDayKey,
    });
    const routines = deriveOasisRoutinesFromCompletions(dailyCompletions, currentDayKey);
    const dayHabits = (dailyHabits ?? []).filter((h) => h.dayKey === currentDayKey);

    const hasManualQuranHabit = dayHabits.some((h) => h.habit === "quran_wird");
    const quranDone =
      pathStatus.policyVersion === 3
        ? pathStatus.quran.complete
        : quranWirdPlan?.kind !== "free" && (hasManualQuranHabit || pathStatus.quran.complete);

    const mosqueAttendanceCount = prayerTracking.filter(
      (r) => r.dayKey === currentDayKey && wasPrayedAtMosque(r),
    ).length;

    const mosqueHabit = dayHabits.find((h) => h.habit.startsWith("mosque_"))?.habit as
      "mosque_3" | "mosque_5" | undefined;
    const mosquePrayers: "mosque_3" | "mosque_5" | null =
      mosqueHabit ?? (mosqueAttendanceCount >= 5 ? "mosque_5" : mosqueAttendanceCount >= 3 ? "mosque_3" : null);

    const activeHabit =
      dayHabits.some((h) => h.habit === "active") ||
      routines.morning ||
      routines.evening ||
      routines.beforeSleep ||
      routines.afterPrayerCount > 0;

    const habits: OasisHabits = {
      quranWird: quranDone,
      mosquePrayers,
      active: activeHabit,
    };

    const legacyLevel = calculateOasisLevel(routines, habits);
    const level: GardenLevel =
      pathStatus.policyVersion === 3
        ? pathStatus.palmTier === "oasis"
          ? 5
          : pathStatus.palmEarned
            ? 4
            : (Math.min(legacyLevel, 3) as GardenLevel)
        : legacyLevel;
    return {
      selectedDayPath: pathStatus,
      quranWirdDone: quranDone,
      resolvedMosquePrayers: mosquePrayers,
      oasisLevel: level,
      levelDetails: OASIS_LEVEL_DETAILS[level],
    };
  }, [
    currentDayKey,
    dailyCompletions,
    dailyHabits,
    dailyPathStartDayKey,
    mosquePrayerGoal,
    prayerTracking,
    quranWirdDailyGoals,
    quranWirdPlan,
    wirdHistory,
  ]);

  // 7-day progression history ending on displayDate
  const weekDaysStatus = useMemo(() => {
    const days: Array<{
      date: Date;
      dayKey: string;
      level: GardenLevel;
      dayLabel: string;
      isToday: boolean;
      palmTier?: PalmTier;
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
      const dayPath = getDailyPathStatus({
        dayKey: dKey,
        dailyCompletions,
        wirdHistory: wirdHistory ?? {},
        quranWirdPlan,
        quranWirdDailyGoals,
        prayerTracking,
        mosquePrayerGoal,
        dailyPathStartDayKey,
      });
      const qDone =
        dayPath.policyVersion === 3
          ? dayPath.quran.complete
          : quranWirdPlan?.kind !== "free" &&
            (hRecords.some((h) => h.habit === "quran_wird") || dayPath.quran.complete);
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
        level:
          dayPath.policyVersion === 3
            ? dayPath.palmTier === "oasis"
              ? 5
              : dayPath.palmEarned
                ? 4
                : (Math.min(lvl, 3) as GardenLevel)
            : lvl,
        palmTier: dayPath.policyVersion === 3 ? dayPath.palmTier : undefined,
        dayLabel,
        isToday,
      });
    }
    return days;
  }, [
    displayDate,
    progressDayStartHour,
    dailyCompletions,
    dailyHabits,
    wirdHistory,
    prayerTracking,
    now,
    language,
    quranWirdPlan,
    quranWirdDailyGoals,
    mosquePrayerGoal,
    dailyPathStartDayKey,
  ]);

  return (
    <ScreenContainer
      dir={direction}
      tabIndex={0}
      className="progress-screen relative overflow-y-auto outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      onPointerDownCapture={(event) => {
        pointerFocus.current = event.currentTarget.contains(event.target as Node);
      }}
      onPointerUpCapture={() => {
        pointerFocus.current = false;
      }}
      onPointerCancelCapture={() => {
        pointerFocus.current = false;
      }}
      onKeyDownCapture={() => {
        pointerFocus.current = false;
      }}
      onFocusCapture={(event) => {
        const controls = controlsRef.current;
        const target = event.target;
        if (
          !controls ||
          pointerFocus.current ||
          !(target instanceof HTMLElement) ||
          !event.currentTarget.contains(target) ||
          controls.contains(target) ||
          target === event.currentTarget
        )
          return;
        const covered = controls.getBoundingClientRect().bottom - target.getBoundingClientRect().top;
        if (covered > 0) event.currentTarget.scrollTop = Math.max(0, event.currentTarget.scrollTop - covered - 16);
      }}
      screenName={t(language, "common.progress")}
    >
      <div className="progress-screen-content relative z-10 mx-auto flex min-h-screen w-full shrink-0 max-w-7xl flex-col items-center px-page pb-8">
        <div ref={controlsRef} className="progress-screen-controls w-full" data-testid="progress-sticky-controls">
          <Header
            title={t(language, "common.progress")}
            language={language}
            style={{ paddingInline: 0, marginBottom: "0.75rem" }}
            right={
              onOpenShareModal ? (
                <IconButton onClick={onOpenShareModal} label={t(language, "progress.shareProgressCard")}>
                  <Share2 size={20} className="text-foreground" />
                </IconButton>
              ) : undefined
            }
          />

          <div className="w-full">
            <TabList
              value={activeTab}
              onChange={handleTabChange}
              direction={isArabic ? "rtl" : "ltr"}
              idPrefix="global-progress"
              aria-label={t(language, "garden.viewMode")}
              indicatorClassName="bg-primary/10"
              className="flex rounded-xl bg-muted p-1"
              itemClassName={(selected) =>
                `flex min-h-11 flex-1 items-center justify-center rounded-lg px-1 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  selected ? PEER_TAB_SELECTED : "text-muted-foreground hover:text-foreground"
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

            <ProgressPeriodNavigation
              heading={periodHeading}
              language={language}
              onPrevious={() => setOffset((previous) => previous - 1)}
              onNext={() => setOffset((previous) => previous + 1)}
              nextDisabled={offset >= 0}
            />
          </div>
        </div>

        {/* Supporting reflection scrolls with records; the task controls stay visible. */}
        <div className="mb-3 hidden w-full items-start justify-center gap-2 px-2 text-center sm:flex">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-xs font-semibold leading-relaxed text-muted-foreground" dir="auto">
            <span>{t(language, "progress.constancyHadith")}</span>
            <span className="ms-1.5 text-micro">— {t(language, "progress.constancyHadithSource")}</span>
          </p>
        </div>

        <div
          {...tabPanelProps("global-progress", activeTab)}
          className="w-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {/* Prayer is the canonical first practice group in every period. The
            day keeps its fifteen recording controls behind one disclosure; a
            reader who only needs the summary does not have to traverse them. */}
          <section
            data-testid="progress-prayer-group"
            dir={direction}
            className="mb-5 w-full overflow-hidden rounded-2xl border border-border bg-card text-foreground"
          >
            <div className="flex items-center justify-between gap-4 px-4 py-4 text-start sm:px-5">
              <div className="min-w-0">
                <h2 className="text-lg font-black leading-tight text-foreground" dir="auto">
                  {t(language, "dailyPath.prayer")}
                </h2>
                {activeTab === "day" && (
                  <p className="mt-1 text-xs font-semibold text-muted-foreground" dir="auto">
                    {t(language, "dailyPath.prayerSummary", {
                      recorded: formatNumerals(selectedDayPath.salah.recordedCount, language),
                      congregation: formatNumerals(selectedDayPath.salah.mosqueCount, language),
                    })}
                  </p>
                )}
              </div>
            </div>
            {activeTab === "day" ? (
              <details className="border-t border-border">
                <summary className="min-h-11 cursor-pointer px-4 py-3 text-label font-black focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:px-5">
                  {t(language, "progress.reviewPrayerDetails")}
                </summary>
                <div className="border-t border-border py-4">
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
                </div>
              </details>
            ) : (
              <div className="border-t border-border py-4">
                <PrayerTrackerStats
                  records={prayerTracking}
                  activeTab={activeTab}
                  now={now}
                  displayDate={displayDate}
                  language={language}
                  calendarType={calendarType}
                />
              </div>
            )}
          </section>

          {/* The selected period's wird answer (Azkar + Quran) follows prayer. */}
          <div className="mb-5 w-full">
            <TodayRoutineGarden
              now={now}
              progressDayStartHour={progressDayStartHour}
              onSelectMonth={(date) => {
                const target = getCalendarMonthPeriod(date, calendarType, language).startDate.getTime();
                let monthOffset = Math.round((date.getTime() - now.getTime()) / (29.5 * 86400000));
                let candidate = getCalendarMonthPeriod(
                  shiftCalendarDate(now, "month", monthOffset, calendarType),
                  calendarType,
                  language,
                ).startDate.getTime();
                while (candidate !== target) {
                  monthOffset += candidate < target ? 1 : -1;
                  candidate = getCalendarMonthPeriod(
                    shiftCalendarDate(now, "month", monthOffset, calendarType),
                    calendarType,
                    language,
                  ).startDate.getTime();
                }
                activePeriodRef.current = "month";
                setActiveTab("month");
                onPeriodChange?.("month");
                setOffset(monthOffset);
                document.getElementById("global-progress-tab-month")?.focus();
              }}
              summary={activeGardenSummary}
              language={language}
              hideTabs={true}
              calendarType={calendarType}
              dailyCompletions={dailyCompletions}
              onOpenShareModal={onOpenShareModal}
              onSelectCategory={onSelectCategory}
              visibleCategoryIds={WIRD_CATEGORY_IDS}
              quranWird={
                quranWirdPlan?.kind !== "free"
                  ? {
                      progress: selectedDayPath.quran.progress,
                      goal: selectedDayPath.quran.goal,
                      complete: quranWirdDone,
                      active: selectedDayPath.quran.active,
                      onPress: onOpenKhatmah ?? (() => onToggleDailyHabit?.(currentDayKey, "quran_wird")),
                      onToggleComplete: () => onToggleDailyHabit?.(currentDayKey, "quran_wird"),
                    }
                  : undefined
              }
              isQuranDoneForDay={(dayKey) => {
                const habitsForDay = (dailyHabits ?? []).filter((h) => h.dayKey === dayKey);
                const manual = habitsForDay.some((h) => h.habit === "quran_wird");
                const dayPages = (wirdHistory ?? {})[dayKey] ?? [];
                const read = new Set(dayPages).size;
                const recordedGoal = (quranWirdDailyGoals ?? {})[dayKey];
                const goal =
                  typeof recordedGoal === "number"
                    ? recordedGoal
                    : quranWirdPlan?.kind === "daily"
                      ? quranWirdPlan.dailyPages
                      : 0;
                return manual || (goal > 0 && read >= goal);
              }}
              onMedia={false}
              activeTab={activeTab}
              displayDate={displayDate}
              weeklyGoalDays={weeklyGoalDays}
            />
          </div>

          {/* The garden is reflective context, so it follows the day's answer and
            stays collapsed until a reader asks for it. */}
          {activeTab === "day" && (
            <details
              data-testid="oasis-stage-card"
              className="group mb-5 w-full overflow-hidden rounded-2xl border border-border bg-card text-foreground transition-colors"
              dir={isArabic ? "rtl" : "ltr"}
            >
              <summary className="flex min-h-11 cursor-pointer select-none items-center justify-between px-4 py-3 text-start transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center" aria-hidden="true">
                    {selectedDayPath.policyVersion === 3 && selectedDayPath.palmEarned ? (
                      <PathRewardMark tier={selectedDayPath.palmTier} size={28} />
                    ) : (
                      renderTierMark(oasisLevel, 28)
                    )}
                  </span>
                  <span className="min-w-0 text-start">
                    <span className="block text-micro font-bold text-muted-foreground">
                      {t(language, "progressTrend.reflection")}
                    </span>
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className="shrink-0 text-muted-foreground transition-transform duration-standard group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <div className="border-t border-border px-4 pb-4 pt-3 sm:px-5">
                <section aria-labelledby="progress-palm-help-heading" className="mb-4">
                  <h2 id="progress-palm-help-heading" className="text-base font-bold">
                    {t(language, "garden.explanationLabel")}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(language, "garden.explanationWithQuran")}
                  </p>
                </section>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div>
                      <h2 id="oasis-stage-heading" className="text-title font-black text-foreground leading-tight">
                        {selectedDayPath.policyVersion === 3 && selectedDayPath.palmEarned
                          ? t(
                              language,
                              selectedDayPath.palmTier === "oasis"
                                ? "dailyPath.oasisPalm"
                                : selectedDayPath.palmTier === "golden"
                                  ? "dailyPath.goldenPalm"
                                  : "dailyPath.regularPalm",
                            )
                          : isArabic
                            ? levelDetails.nameArabic
                            : levelDetails.name}
                      </h2>
                    </div>
                  </div>

                  <div className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-sm font-black text-primary">
                    <span>
                      {selectedDayPath.policyVersion === 3
                        ? t(language, "dailyPath.recordedToday")
                        : t(language, "progress.oasisLevelBadge", { level: formatNumerals(oasisLevel, language) })}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-caption font-semibold leading-relaxed text-muted-foreground" dir="auto">
                  {selectedDayPath.policyVersion === 3
                    ? t(
                        language,
                        selectedDayPath.palmTier === "oasis"
                          ? "dailyPath.oasisRule"
                          : selectedDayPath.palmTier === "golden"
                            ? "dailyPath.goldenRule"
                            : "dailyPath.palmRule",
                      )
                    : isArabic
                      ? levelDetails.descriptionArabic
                      : levelDetails.description}
                </p>

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs font-semibold text-foreground">
                  <Sparkles className="size-4 shrink-0 text-primary mt-0.5" aria-hidden="true" />
                  <span dir="auto">{t(language, "progress.recordedPracticeReflection")}</span>
                </div>
              </div>
              {/* 7-Day Rhythm Strip */}
              <div className="border-t border-border px-4 py-3 sm:px-5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-micro font-bold uppercase tracking-wider text-muted-foreground block">
                    {t(language, "progress.sevenDayRhythm")}
                  </span>
                  <span className="text-micro font-semibold text-muted-foreground" dir={isArabic ? "rtl" : "ltr"}>
                    {t(language, "progress.sevenDayRhythmDirection")}
                  </span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center" role="list">
                  {weekDaysStatus.map((day) => {
                    const levelShortName = isArabic
                      ? OASIS_LEVEL_DETAILS[day.level].nameArabic.split(" ")[0]
                      : OASIS_LEVEL_DETAILS[day.level].name.split(" ")[0];
                    return (
                      <div
                        key={day.dayKey}
                        role="listitem"
                        className={`flex flex-col items-center justify-center rounded-xl p-1.5 sm:p-2 transition-colors ${
                          day.isToday
                            ? "bg-primary/15 font-black text-primary ring-1 ring-primary/40 shadow-xs"
                            : "bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <span className="text-micro font-bold text-muted-foreground">{day.dayLabel}</span>
                        <div className="my-1 flex size-8 sm:size-9 items-center justify-center">
                          {day.palmTier && day.palmTier !== "none" ? (
                            <PathRewardMark tier={day.palmTier} size={24} />
                          ) : (
                            renderTierMark(day.level, 24)
                          )}
                        </div>
                        <span className="text-micro font-bold text-foreground truncate max-w-full">
                          {day.palmTier && day.palmTier !== "none"
                            ? t(
                                language,
                                day.palmTier === "oasis"
                                  ? "dailyPath.oasisPalm"
                                  : day.palmTier === "golden"
                                    ? "dailyPath.goldenPalm"
                                    : "dailyPath.regularPalm",
                              )
                            : day.level > 0
                              ? levelShortName
                              : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Visual Legend for the 7-day icons */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-border/40 pt-2 text-micro text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-bold text-primary">🌴 {t(language, "progress.palmLabel")}</span>
                    <span>{t(language, "progress.palmTreeLegend")}</span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="font-bold text-primary">🌿 {t(language, "progress.branchLabel")}</span>
                    <span>{t(language, "progress.branchLegend")}</span>
                  </span>
                </div>
              </div>
              {/* Legacy rhythm and palm records remain available, seamlessly integrated as a divided strip without nested card borders */}
              <dl
                data-testid="progress-summary-strip"
                className="grid w-full grid-cols-2 border-t border-border bg-muted/20 divide-x rtl:divide-x-reverse divide-border"
              >
                <div className="flex min-w-0 items-center gap-2.5 p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center text-primary">
                    <Zap className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <dt className="truncate text-micro font-bold text-muted-foreground">
                      {t(language, "progress.activeStreakSummary")}
                    </dt>
                    <dd className="text-sm font-black text-foreground">
                      {formatNumerals(activeGardenSummary.currentUsageStreak ?? 0, language)}{" "}
                      {t(language, "progress.days")}
                    </dd>
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-2.5 p-3">
                  <div className="flex size-8 shrink-0 items-center justify-center text-primary">
                    <PalmTreeMark size={22} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <dt className="truncate text-micro font-bold text-muted-foreground">
                      {t(language, "progress.lifetimePalmsSummary")}
                    </dt>
                    <dd className="text-sm font-black text-foreground">
                      {formatNumerals(activeGardenSummary.lifetimePalms, language)} {t(language, "progress.palmsUnit")}
                    </dd>
                  </div>
                </div>
              </dl>
            </details>
          )}

          {/* Friday Card / Stats */}
          {activeTab === "day" ? (
            <FridayProgressCard
              summary={fridaySummary}
              language={language}
              direction={direction}
              onOpen={onOpenFriday}
            />
          ) : (
            <FridayProgressStats
              activeTab={activeTab}
              now={now}
              displayDate={displayDate}
              language={language}
              calendarType={calendarType}
              direction={direction}
            />
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
