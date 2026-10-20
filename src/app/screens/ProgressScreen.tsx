import { useScrollElevation } from "../hooks/useScrollElevation";
import "./progress-screen.css";
import { useState, useEffect, useMemo, useRef, useId } from "react";
import { Header, IconButton } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { RoutineInsights } from "../components/RoutineInsights";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { createDailyPathIndex, wasPrayedAtMosque, type PalmTier } from "../dailyPath";
import { getGardenSummary, getProgressDayKey } from "../progress";

import { shiftCalendarDate } from "../calendarPeriods";
import { ProgressSelectField } from "../components/ProgressSelectField";
import { ProgressRangeToolbar } from "../components/ProgressRangeToolbar";
import { ProgressDashboard, type ProgressDashboardView } from "../components/ProgressDashboard";
import { TabList, tabId, tabPanelProps } from "../components/Tabs";
import { ProgressPrayerBreakdown } from "../components/ProgressPrayerBreakdown";
import { ZikrInsights } from "../components/ZikrInsights";
import { dashboardText } from "../i18n/progressDashboard";
import {
  exportProgressDashboard,
  indexProgressDashboard,
  metricProgressRange,
  progressPresetRange,
  progressRangeDays,
  type ProgressRange,
} from "../progressDashboard";
import { shiftProgressDayKey } from "../progress";
import { saveFileToDevice } from "../share/shareDispatcher";

import { PrayerProgressSummary } from "../components/PrayerProgressSummary";
import type { PrayerTrackingField } from "../components/PrayerTrackerCards";
import { useNow } from "../hooks/useNow";
import { FridayProgressCard } from "../components/FridayProgressCard";
import { PrayerTrackerStats } from "../components/PrayerTrackerStats";
import { FridayProgressStats } from "../components/FridayProgressStats";

import { getFridaySummary } from "../fridaySummary";
import { getFridayCycleKey } from "../fridayProgress";
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
import { ChevronDown, Share2, Sparkles, Zap, SlidersHorizontal } from "../components/icons";
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
  ZikrDayRecord,
} from "../types";

/** The wird is the three time-of-day routines. After-prayer adhkar are tracked
 *  per prayer in their own section below, the same split Home uses. */
const WIRD_CATEGORY_IDS = ["morning", "evening", "before_sleep"] as const satisfies readonly CategoryId[];
const EMPTY_PRAYER_TRACKING: readonly PrayerTrackingRecord[] = [];
const EMPTY_DAILY_HABITS: readonly DailyHabitCompletion[] = [];
const EMPTY_ZIKR_HISTORY: readonly ZikrDayRecord[] = [];
const EMPTY_HISTORY: Record<string, number[]> = {};
const EMPTY_GOALS: Record<string, number> = {};

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
  calendarType: initialCalendarType,
  language,
  direction,
  onOpenShareModal,
  prayerTracking = EMPTY_PRAYER_TRACKING,
  dailyHabits = EMPTY_DAILY_HABITS,
  wirdHistory,
  quranWirdPlan,
  quranWirdDailyGoals,
  mosquePrayerGoal,
  dailyPathStartDayKey,
  weeklyGoalDays,
  initialPeriod = "day",
  onPeriodChange,
  onOpenHome,
  onOpenKhatmah,
  zikrHistory = EMPTY_ZIKR_HISTORY,
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
  onOpenHome?: () => void;
  initialPeriod?: "day" | "week" | "month" | "year";
  onPeriodChange?: (period: "day" | "week" | "month" | "year") => void;
  zikrHistory?: readonly ZikrDayRecord[];
}) {
  const now = useNow();

  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">(initialPeriod);
  const [offset, setOffset] = useState(0);
  const [calendarType, setCalendarType] = useState(initialCalendarType);
  const [customRange, setCustomRange] = useState<ProgressRange | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailChoice, setDetailChoice] = useState<"prayers" | "routines" | "friday" | "reflection">("prayers");
  const detailTopic = detailChoice === "reflection" && (customRange || activeTab !== "day") ? "prayers" : detailChoice;
  const [view, setView] = useState<ProgressDashboardView>("overview");
  const viewId = useId();
  useEffect(() => setCalendarType(initialCalendarType), [initialCalendarType]);
  const controlsRef = useRef<HTMLDivElement>(null);
  const pointerFocus = useRef(false);
  const focusFrame = useRef<number | undefined>(undefined);
  const hasScrolledControls = useScrollElevation(controlsRef);

  useEffect(
    () => () => {
      if (focusFrame.current !== undefined) cancelAnimationFrame(focusFrame.current);
    },
    [],
  );

  useEffect(() => {
    const controls = controlsRef.current;
    const scrollport = controls?.closest<HTMLElement>(".app-screen-surface");
    if (!controls || !scrollport) return;
    const header = controls.querySelector<HTMLElement>(".shared-screen-header");
    const measure = () => {
      scrollport.style.setProperty("--progress-controls-max-height", `${scrollport.clientHeight * 0.6}px`);
      scrollport.style.setProperty("--progress-controls-height", `${controls.getBoundingClientRect().height}px`);
      controls.style.setProperty("--progress-title-height", `${header?.getBoundingClientRect().height ?? 0}px`);
    };
    measure();
    const observer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
    observer?.observe(controls);
    observer?.observe(scrollport);
    if (header) observer?.observe(header);
    return () => {
      observer?.disconnect();
      scrollport.style.removeProperty("--progress-controls-height");
      scrollport.style.removeProperty("--progress-controls-max-height");
      controls.style.removeProperty("--progress-title-height");
    };
  }, []);
  const activePeriodRef = useRef(initialPeriod);
  useEffect(() => {
    if (initialPeriod === activePeriodRef.current) return;
    activePeriodRef.current = initialPeriod;
    setActiveTab(initialPeriod);
    setOffset(0);
    setCustomRange(null);
  }, [initialPeriod]);

  const isArabic = language === "ar";
  // Header elevation changes presentation only. Keep the date identity stable
  // so those scroll-state renders do not rebuild unchanged lifetime history.
  const displayDate = useMemo(
    () => shiftCalendarDate(now, activeTab, offset, calendarType),
    [now, activeTab, offset, calendarType],
  );
  const selectedRange = useMemo(
    () => customRange ?? progressPresetRange(activeTab, displayDate, language, calendarType),
    [customRange, activeTab, displayDate, language, calendarType],
  );
  const civilToday = getProgressDayKey(now, 0);
  const devotionalToday = getProgressDayKey(now, progressDayStartHour);
  const dashboardInput = useMemo(
    () => ({
      dailyCompletions,
      prayerTracking,
      dailyHabits,
      wirdHistory: wirdHistory ?? EMPTY_HISTORY,
      quranWirdDailyGoals: quranWirdDailyGoals ?? EMPTY_GOALS,
      quranWirdPlan,
    }),
    [dailyCompletions, prayerTracking, dailyHabits, wirdHistory, quranWirdDailyGoals, quranWirdPlan],
  );
  const dashboardRecords = useMemo(
    () => indexProgressDashboard(dashboardInput, devotionalToday),
    [dashboardInput, devotionalToday],
  );
  const isCurrentDay = !customRange && activeTab === "day" && offset === 0;
  const customDays = customRange ? progressRangeDays(customRange) : 0;
  const moveRange = (step: number) => {
    if (customRange)
      setCustomRange({
        startKey: shiftProgressDayKey(customRange.startKey, customDays * step),
        endKey: shiftProgressDayKey(customRange.endKey, customDays * step),
      });
    else setOffset((previous) => previous + step);
  };
  const exportSelectedPeriod = async () => {
    const data = exportProgressDashboard(
      dashboardInput,
      dashboardRecords,
      selectedRange,
      now,
      progressDayStartHour,
      isCurrentDay,
      calendarType,
    );
    const zikrRange = metricProgressRange(selectedRange, "routines", now, progressDayStartHour, false, isCurrentDay);
    await saveFileToDevice(
      new File(
        [
          JSON.stringify(
            {
              ...data,
              zikrHistory: zikrHistory.filter(
                (row) => row.dayKey >= zikrRange.startKey && row.dayKey <= zikrRange.endKey,
              ),
            },
            null,
            2,
          ),
        ],
        `progress-${selectedRange.startKey}-${selectedRange.endKey}.json`,
        { type: "application/json" },
      ),
    );
  };

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    activePeriodRef.current = tab;
    setActiveTab(tab);
    setOffset(0);
    setCustomRange(null);
    onPeriodChange?.(tab);
  };

  const getDayPath = useMemo(
    () =>
      createDailyPathIndex({
        dailyCompletions,
        wirdHistory: wirdHistory ?? EMPTY_HISTORY,
        quranWirdPlan,
        quranWirdDailyGoals,
        prayerTracking,
        mosquePrayerGoal,
        dailyPathStartDayKey,
      }),
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
  const judgeDay = useMemo(
    () => (dayKey: string) => {
      const status = getDayPath(dayKey);
      return { palm: status.palmEarned, qualifies: status.streakQualified };
    },
    [getDayPath],
  );

  const fridaySummary = getFridaySummary(getFridayCycleKey(displayDate));

  const isQuranDoneForDay = (dayKey: string) => {
    const manual = dailyHabits.some((habit) => habit.dayKey === dayKey && habit.habit === "quran_wird");
    const read = new Set(wirdHistory?.[dayKey] ?? []).size;
    const goal = quranWirdDailyGoals?.[dayKey] ?? (quranWirdPlan?.kind === "daily" ? quranWirdPlan.dailyPages : 0);
    return manual || (goal > 0 && read >= goal);
  };

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
    const pathStatus = getDayPath(currentDayKey);
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
  }, [getDayPath, currentDayKey, dailyCompletions, dailyHabits, prayerTracking, quranWirdPlan]);

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
      const dayPath = getDayPath(dKey);
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
    getDayPath,
    displayDate,
    progressDayStartHour,
    dailyCompletions,
    dailyHabits,
    prayerTracking,
    now,
    language,
    quranWirdPlan,
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
          target === event.currentTarget
        )
          return;
        if (controls.contains(target)) {
          const header = controls.querySelector<HTMLElement>(".shared-screen-header");
          if (!header || header.contains(target)) return;
          const reveal = () => {
            const headerBottom = header.getBoundingClientRect().bottom;
            const targetBounds = target.getBoundingClientRect();
            const covered = headerBottom - targetBounds.top;
            if (covered > 0) {
              // Reserve breathing room only when it fits the short viewport.
              const gap = Math.max(
                0,
                Math.min(16, controls.getBoundingClientRect().bottom - headerBottom - targetBounds.height),
              );
              controls.scrollTop = Math.floor(Math.max(0, controls.scrollTop - covered - gap));
            }
          };
          reveal();
          // WebKit may finish native focus scrolling after the focus event.
          // Recheck once after layout, only while this control still owns focus.
          if (focusFrame.current !== undefined) cancelAnimationFrame(focusFrame.current);
          focusFrame.current = requestAnimationFrame(() => {
            focusFrame.current = undefined;
            if (document.activeElement === target && controls.contains(target)) reveal();
          });
          return;
        }
        const viewport = event.currentTarget;
        const reveal = () => {
          const controlsBottom = controls.getBoundingClientRect().bottom;
          const viewportBottom = viewport.getBoundingClientRect().bottom;
          const context = target.closest<HTMLElement>("[data-progress-focus-context]");
          const contextBounds = context?.getBoundingClientRect();
          // Keep the chart's series, plot and readout together when they fit.
          // Revealing only its lower scrubber can leave the series controls
          // partially covered by the sticky filters on a wide screen.
          if (contextBounds && contextBounds.height <= viewportBottom - controlsBottom - 32) {
            if (contextBounds.top < controlsBottom + 16)
              viewport.scrollTop = Math.max(0, viewport.scrollTop - (controlsBottom + 16 - contextBounds.top));
            else if (contextBounds.bottom > viewportBottom - 16)
              viewport.scrollTop += contextBounds.bottom - viewportBottom + 16;
            return;
          }
          const covered = controlsBottom - target.getBoundingClientRect().top;
          if (covered > 0) viewport.scrollTop = Math.max(0, viewport.scrollTop - covered - 16);
        };
        reveal();
        // Native focus scrolling can finish after focus capture in WebKit.
        // Reconcile once while the same control still owns focus, as above.
        if (focusFrame.current !== undefined) cancelAnimationFrame(focusFrame.current);
        focusFrame.current = requestAnimationFrame(() => {
          focusFrame.current = undefined;
          if (document.activeElement === target && viewport.contains(target)) reveal();
        });
      }}
      screenName={t(language, "common.progress")}
    >
      <div className="progress-screen-content relative z-10 mx-auto flex min-h-screen w-full shrink-0 max-w-7xl flex-col items-center px-page pb-8">
        <div
          ref={controlsRef}
          data-scrolled={hasScrolledControls || undefined}
          className="progress-screen-controls w-full"
          data-testid="progress-sticky-controls"
        >
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

          <ProgressRangeToolbar
            period={customRange ? "custom" : activeTab}
            range={selectedRange}
            today={civilToday}
            language={language}
            calendar={calendarType}
            onPeriod={handleTabChange}
            onCalendar={(calendar) => {
              setCalendarType(calendar);
              setOffset(0);
            }}
            onCustom={setCustomRange}
            onMonth={(month) => {
              handleTabChange("month");
              setCalendarType("gregorian");
              const [year, number] = month.split("-").map(Number);
              setOffset((year! - now.getFullYear()) * 12 + number! - 1 - now.getMonth());
            }}
            onPrevious={() => moveRange(-1)}
            onNext={() => moveRange(1)}
            onToday={() => handleTabChange("day")}
            nextDisabled={customRange ? shiftProgressDayKey(customRange.endKey, customDays) > civilToday : offset >= 0}
          />
          <TabList
            value={view}
            onChange={(next) => {
              if (next === view) return;
              setView(next);
              setDetailsOpen(false);
              const viewport = controlsRef.current?.closest<HTMLElement>(".app-screen-surface");
              if (viewport) viewport.scrollTop = 0;
            }}
            tabs={(["overview", "trends", "records"] as const).map((value) => ({
              value,
              label: dashboardText(language, `view_${value}`),
              testId: `progress-tab-${value}`,
            }))}
            direction={direction}
            idPrefix={viewId}
            aria-label={dashboardText(language, "views")}
            className="mt-3 mb-1 grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/50 p-1"
            itemClassName={(selected) =>
              `min-h-11 min-w-0 rounded-lg px-2 py-2 text-xs font-bold progress-focus ${selected ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`
            }
            indicatorClassName="border border-border-control bg-card shadow-xs"
          />
        </div>

        <div
          className="w-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          {...tabPanelProps(viewId, view)}
        >
          <ProgressDashboard
            view={view}
            onChooseWeek={() => {
              handleTabChange("week");
              document.getElementById(tabId(viewId, "trends"))?.focus({ preventScroll: true });
            }}
            emptyActions={
              <>
                {onOpenHome && (
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-border-control px-3 text-sm font-semibold progress-focus"
                    onClick={onOpenHome}
                  >
                    {dashboardText(language, "openHome")}
                  </button>
                )}
                {onOpenKhatmah && (
                  <button
                    type="button"
                    className="min-h-11 rounded-lg border border-border-control px-3 text-sm font-semibold progress-focus"
                    onClick={onOpenKhatmah}
                  >
                    {dashboardText(language, "openQuran")}
                  </button>
                )}
              </>
            }
            onShowTrend={() => {
              setView("trends");
              setDetailsOpen(false);
              const viewport = controlsRef.current?.closest<HTMLElement>(".app-screen-surface");
              if (viewport) viewport.scrollTop = 0;
              document.getElementById(tabId(viewId, "trends"))?.focus({ preventScroll: true });
            }}
            records={dashboardRecords}
            range={selectedRange}
            period={customRange ? (customRange.startKey === customRange.endKey ? "day" : "custom") : activeTab}
            displayDate={displayDate}
            now={now}
            dayStart={progressDayStartHour}
            currentDay={isCurrentDay}
            language={language}
            calendar={calendarType}
            onExport={exportSelectedPeriod}
          />
          {view === "overview" && (
            <details
              className="mt-5 w-full rounded-xl border border-border bg-card px-4 sm:px-5"
              data-testid="progress-detailed-context"
              onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
            >
              <summary className="progress-disclosure">
                {dashboardText(language, "details")}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              {detailsOpen && (
                <div className="pb-4">
                  <ProgressSelectField
                    label={dashboardText(language, "detailTopic")}
                    value={detailTopic}
                    options={(
                      [
                        "prayers",
                        "routines",
                        "friday",
                        ...(!customRange && activeTab === "day" ? ["reflection" as const] : []),
                      ] as const
                    ).map((value) => ({ value, label: dashboardText(language, `detail_${value}`) }))}
                    onChange={setDetailChoice}
                    language={language}
                    icon={SlidersHorizontal}
                  />
                  <p className="sr-only">{dashboardText(language, "detailHelp")}</p>
                  {!customRange ? (
                    <>
                      {/* Supporting reflection stays inside optional context. */}
                      <div className="mb-3 hidden w-full items-start justify-center gap-2 px-2 text-center sm:flex">
                        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                        <p className="text-xs font-semibold leading-relaxed text-muted-foreground" dir="auto">
                          <span>{t(language, "progress.constancyHadith")}</span>
                          <span className="ms-1.5 text-micro">— {t(language, "progress.constancyHadithSource")}</span>
                        </p>
                      </div>

                      <div className="w-full">
                        {/* Prayer records lead; Home owns timing and devotional guidance. */}
                        {detailTopic === "prayers" && (
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
                                  <p
                                    role="status"
                                    aria-atomic="true"
                                    className="mt-1 text-xs font-semibold text-muted-foreground"
                                    dir="auto"
                                  >
                                    {t(language, "dailyPath.prayerSummary", {
                                      recorded: formatNumerals(selectedDayPath.salah.recordedCount, language),
                                      congregation: formatNumerals(selectedDayPath.salah.mosqueCount, language),
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            {activeTab === "day" ? (
                              <PrayerProgressSummary
                                language={language}
                                records={prayerTracking}
                                dayKey={selectedRange.startKey}
                              />
                            ) : (
                              <div className="border-t border-border py-4">
                                <PrayerTrackerStats
                                  key={`${activeTab}-${offset}`}
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
                        )}

                        {/* The selected period's wird answer (Azkar + Quran) follows prayer. */}
                        {detailTopic === "routines" && (
                          <div className="mb-5 w-full">
                            {activeTab !== "day" ? (
                              <RoutineInsights
                                zikrHistory={zikrHistory}
                                key={`${activeTab}-${offset}`}
                                records={dailyCompletions}
                                period={activeTab}
                                displayDate={displayDate}
                                now={now}
                                language={language}
                                calendarType={calendarType}
                                progressDayStartHour={progressDayStartHour}
                                weeklyGoalDays={weeklyGoalDays}
                                isQuranDoneForDay={isQuranDoneForDay}
                              />
                            ) : (
                              <TodayRoutineGarden
                                readOnly
                                now={now}
                                progressDayStartHour={progressDayStartHour}
                                summary={activeGardenSummary}
                                language={language}
                                hideTabs={true}
                                calendarType={calendarType}
                                dailyCompletions={dailyCompletions}
                                onOpenShareModal={onOpenShareModal}
                                visibleCategoryIds={WIRD_CATEGORY_IDS}
                                quranWird={
                                  quranWirdPlan?.kind !== "free"
                                    ? {
                                        progress: selectedDayPath.quran.progress,
                                        goal: selectedDayPath.quran.goal,
                                        complete: quranWirdDone,
                                        active: selectedDayPath.quran.active,
                                      }
                                    : undefined
                                }
                                isQuranDoneForDay={isQuranDoneForDay}
                                onMedia={false}
                                activeTab={activeTab}
                                displayDate={displayDate}
                                weeklyGoalDays={weeklyGoalDays}
                              />
                            )}
                          </div>
                        )}

                        {/* The garden is reflective context, so it follows the day's answer and
            stays collapsed until a reader asks for it. */}
                        {detailTopic === "reflection" && activeTab === "day" && (
                          <details
                            data-testid="oasis-stage-card"
                            className="group mb-5 w-full overflow-hidden rounded-2xl border border-border bg-card text-foreground transition-colors"
                            dir={isArabic ? "rtl" : "ltr"}
                          >
                            <summary className="flex min-h-11 cursor-pointer select-none items-center justify-between px-4 py-3 text-start transition-colors hover:bg-muted/40 progress-focus">
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
                                    <h2
                                      id="oasis-stage-heading"
                                      className="text-title font-black text-foreground leading-tight"
                                    >
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
                                      : t(language, "progress.oasisLevelBadge", {
                                          level: formatNumerals(oasisLevel, language),
                                        })}
                                  </span>
                                </div>
                              </div>

                              <p
                                className="mt-3 text-caption font-semibold leading-relaxed text-muted-foreground"
                                dir="auto"
                              >
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
                                <span
                                  className="text-micro font-semibold text-muted-foreground"
                                  dir={isArabic ? "rtl" : "ltr"}
                                >
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
                                  <span className="font-bold text-primary">
                                    🌿 {t(language, "progress.branchLabel")}
                                  </span>
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
                                    {formatNumerals(activeGardenSummary.lifetimePalms, language)}{" "}
                                    {t(language, "progress.palmsUnit")}
                                  </dd>
                                </div>
                              </div>
                            </dl>
                          </details>
                        )}

                        {/* Friday Card / Stats */}
                        {detailTopic === "friday" &&
                          (activeTab === "day" ? (
                            <FridayProgressCard
                              readOnly
                              summary={fridaySummary}
                              language={language}
                              direction={direction}
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
                          ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {detailTopic === "prayers" && (
                        <ProgressPrayerBreakdown
                          records={prayerTracking}
                          range={metricProgressRange(selectedRange, "prayers", now, progressDayStartHour, true)}
                          language={language}
                        />
                      )}
                      {detailTopic === "routines" && (
                        <ZikrInsights
                          records={zikrHistory}
                          language={language}
                          startKey={
                            metricProgressRange(selectedRange, "routines", now, progressDayStartHour, true).startKey
                          }
                          endKey={
                            metricProgressRange(selectedRange, "routines", now, progressDayStartHour, true).endKey
                          }
                        />
                      )}
                      {detailTopic === "friday" && (
                        <FridayProgressStats
                          activeTab="month"
                          range={selectedRange}
                          now={now}
                          displayDate={displayDate}
                          language={language}
                          calendarType={calendarType}
                          direction={direction}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </details>
          )}
        </div>
      </div>
    </ScreenContainer>
  );
}
