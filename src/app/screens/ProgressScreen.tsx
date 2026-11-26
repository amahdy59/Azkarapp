import { useScrollElevation } from "../hooks/useScrollElevation";
import "./progress-screen.css";
import "../components/responsive-filters.css";
import { useState, useEffect, useMemo, useRef, useId } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";

import { shiftCalendarDate } from "../calendarPeriods";
import { ProgressRangeToolbar } from "../components/ProgressRangeToolbar";
import { ProgressDashboard, type ProgressDashboardView } from "../components/ProgressDashboard";
import { TabList, tabId, tabPanelProps } from "../components/Tabs";
import { Header, IconButton } from "../components/LayoutShells";
import { PILL_ACTION } from "../components/ui/controlStyles";
import { Modal, SheetHeader } from "../components/ResponsiveSheet";
import { ProgressPrayerBreakdown } from "../components/ProgressPrayerBreakdown";
import { ZikrInsights } from "../components/ZikrInsights";
import { dashboardText } from "../i18n/progressDashboard";
import {
  indexProgressDashboard,
  formatProgressRange,
  metricProgressRange,
  progressPresetRange,
  type ProgressRange,
  type ProgressPreset,
} from "../progressDashboard";

import type { PrayerTrackingField } from "../components/PrayerTrackerCards";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import { FridayProgressStats } from "../components/FridayProgressStats";

import { ChevronDown, SlidersHorizontal, BarChart3, Sprout } from "../components/icons";
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

const EMPTY_PRAYER_TRACKING: readonly PrayerTrackingRecord[] = [];
const EMPTY_DAILY_HABITS: readonly DailyHabitCompletion[] = [];
const EMPTY_ZIKR_HISTORY: readonly ZikrDayRecord[] = [];
const EMPTY_HISTORY: Record<string, number[]> = {};
const EMPTY_GOALS: Record<string, number> = {};

type ProgressScreenProps = {
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
  initialPeriod?: ProgressPreset;
  onPeriodChange?: (period: ProgressPreset) => void;
  zikrHistory?: readonly ZikrDayRecord[];
};

export function ProgressScreen({
  dailyCompletions,
  progressDayStartHour,
  calendarType: initialCalendarType,
  language,
  direction,
  prayerTracking = EMPTY_PRAYER_TRACKING,
  dailyHabits = EMPTY_DAILY_HABITS,
  wirdHistory,
  quranWirdPlan,
  quranWirdDailyGoals,
  initialPeriod = "month",
  onPeriodChange,
  zikrHistory = EMPTY_ZIKR_HISTORY,
}: ProgressScreenProps) {
  const clock = useNow();
  const clockKey = `${progressDayStartHour}:${getProgressDayKey(clock, 0)}:${getProgressDayKey(clock, progressDayStartHour)}`;
  const dayClock = useRef({ key: clockKey, value: clock });
  if (dayClock.current.key !== clockKey) dayClock.current = { key: clockKey, value: clock };
  // Statistics depend on civil/devotional dates, not each minute tick.
  const now = dayClock.current.value;

  const [activeTab, setActiveTab] = useState<ProgressPreset>(initialPeriod);
  const [offset, setOffset] = useState(0);
  const [calendarType, setCalendarType] = useState(initialCalendarType);
  const [customRange, setCustomRange] = useState<ProgressRange | null>(null);
  const [view, setView] = useState<ProgressDashboardView>("overview");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterButtonId = useId();
  const filterId = useId();
  const closeFilters = () => {
    setFiltersOpen(false);
  };
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
    setCustomRange(null);
  }, [initialPeriod]);

  // Header elevation changes presentation only. Keep the date identity stable
  // so those scroll-state renders do not rebuild unchanged lifetime history.
  const displayDate = useMemo(
    () => shiftCalendarDate(now, activeTab === "last30" ? "day" : activeTab, offset, calendarType),
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
  const handleTabChange = (tab: ProgressPreset) => {
    activePeriodRef.current = tab;
    setActiveTab(tab);
    setOffset(0);
    setCustomRange(null);
    onPeriodChange?.(tab);
  };

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
        const viewport = event.currentTarget;
        const reveal = () => {
          if (controls.contains(target)) {
            const bounds = controls.getBoundingClientRect();
            const focused = target.getBoundingClientRect();
            if (focused.bottom > bounds.bottom - 4) controls.scrollTop += focused.bottom - bounds.bottom + 4;
            else if (focused.top < bounds.top + 4) controls.scrollTop -= bounds.top + 4 - focused.top;
            return;
          }
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
      <div className="progress-screen-content">
        <div
          ref={controlsRef}
          data-scrolled={hasScrolledControls || undefined}
          className="progress-screen-controls w-full"
          data-testid="progress-sticky-controls"
        >
          <div className="progress-controls-inner">
            <Header
              title={t(language, "common.progress")}
              subtitle={
                <span data-testid="garden-view-date" className="block">
                  {dashboardText(language, customRange ? "custom" : activeTab)} ·{" "}
                  {formatProgressRange(selectedRange, language, calendarType)}
                </span>
              }
              language={language}
              elevateOnScroll={false}
              style={{ paddingInline: 0 }}
              right={
                <div className="progress-header-actions section-view-actions">
                  <TabList
                    value={view}
                    onChange={(next) => {
                      if (next === view) return;
                      setView(next);
                      const viewport = controlsRef.current?.closest<HTMLElement>(".app-screen-surface");
                      if (viewport) viewport.scrollTop = 0;
                    }}
                    tabs={(["overview", "trends"] as const).map((value) => ({
                      value,
                      label: (
                        <span
                          className="flex items-center justify-center gap-2"
                          style={{ color: value === view ? "var(--primary-foreground)" : "inherit" }}
                        >
                          {value === "overview" ? (
                            <BarChart3 size={20} className="progress-tab-icon shrink-0" aria-hidden="true" />
                          ) : value === "trends" ? (
                            <Sprout size={20} className="progress-tab-icon shrink-0" aria-hidden="true" />
                          ) : null}
                          <span className="section-tab-label">{dashboardText(language, `view_${value}`)}</span>
                        </span>
                      ),
                      testId: `progress-tab-${value}`,
                      ariaLabel: dashboardText(language, `view_${value}`),
                    }))}
                    direction={direction}
                    idPrefix={viewId}
                    aria-label={dashboardText(language, "views")}
                    className="progress-view-tabs section-view-tabs"
                    itemClassName={(selected) =>
                      `section-view-tab progress-focus ${selected ? "text-primary-foreground" : "text-muted-foreground"}`
                    }
                  />
                  <IconButton
                    className={`${PILL_ACTION} section-view-action`}
                    id={filterButtonId}
                    data-testid="progress-filters-toggle"
                    data-progress-value={customRange ? "custom" : activeTab}
                    label={dashboardText(language, "dateFilters")}
                    aria-expanded={filtersOpen}
                    aria-haspopup="dialog"
                    onClick={() => setFiltersOpen(true)}
                  >
                    <SlidersHorizontal size={20} aria-hidden="true" />
                  </IconButton>
                </div>
              }
            />
            <Modal
              open={filtersOpen}
              onClose={closeFilters}
              onCloseAutoFocus={(event) => {
                // Touch opening need not focus the button in WebKit. Restore
                // explicitly after the modal releases its focus trap.
                event.preventDefault();
                document.getElementById(filterButtonId)?.focus({ preventScroll: true });
              }}
              title={dashboardText(language, "dateFilters")}
              language={language}
              direction={direction}
              showCloseButton={false}
              testId="progress-filter-sheet"
              className="filter-sheet"
            >
              <SheetHeader
                title={dashboardText(language, "dateFilters")}
                language={language}
                onClose={closeFilters}
                className="filter-sheet-header"
              />
              <div id={filterId} className="progress-date-filter min-h-0 overflow-y-auto p-3">
                <ProgressRangeToolbar
                  dateTestId="progress-filter-date"
                  period={customRange ? "custom" : activeTab}
                  range={selectedRange}
                  today={civilToday}
                  language={language}
                  calendar={calendarType}
                  onPeriod={(period) => {
                    handleTabChange(period);
                    closeFilters();
                  }}
                  onCustom={(range) => {
                    setCustomRange(range);
                    closeFilters();
                  }}
                />
              </div>
            </Modal>
          </div>
        </div>

        <div className="progress-scroll-edge" data-scrolled={hasScrolledControls || undefined} aria-hidden="true" />
        <div
          className="mx-auto w-full max-w-7xl shrink-0 px-page pb-8 outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
          {...tabPanelProps(viewId, view)}
        >
          <ProgressDashboard
            view={view}
            onChooseWeek={() => {
              handleTabChange("week");
              document.getElementById(tabId(viewId, "trends"))?.focus({ preventScroll: true });
            }}
            onShowTrend={() => {
              setView("trends");
              const viewport = controlsRef.current?.closest<HTMLElement>(".app-screen-surface");
              if (viewport) viewport.scrollTop = 0;
              document.getElementById(tabId(viewId, "trends"))?.focus({ preventScroll: true });
            }}
            renderBreakdown={(metric, range) =>
              metric === "prayers" || metric === "mosque" || metric === "rawatib" || metric === "adhkar" ? (
                <details className="progress-summary-card" key={metric}>
                  <summary className="progress-disclosure progress-focus">
                    {dashboardText(language, "perPrayer")}
                    <ChevronDown size={18} aria-hidden="true" />
                  </summary>
                  <ProgressPrayerBreakdown
                    records={prayerTracking}
                    range={range}
                    language={language}
                    initialMetric={metric === "prayers" ? "fard" : metric}
                  />
                </details>
              ) : null
            }
            renderSpecial={(topic) =>
              topic === "friday" ? (
                <FridayProgressStats
                  activeTab="month"
                  range={selectedRange}
                  now={now}
                  displayDate={displayDate}
                  language={language}
                  calendarType={calendarType}
                  direction={direction}
                />
              ) : (
                <ZikrInsights
                  records={zikrHistory}
                  language={language}
                  startKey={metricProgressRange(selectedRange, "routines", now, progressDayStartHour, true).startKey}
                  endKey={metricProgressRange(selectedRange, "routines", now, progressDayStartHour, true).endKey}
                />
              )
            }
            records={dashboardRecords}
            range={selectedRange}
            period={customRange ? (customRange.startKey === customRange.endKey ? "day" : "custom") : activeTab}
            displayDate={displayDate}
            now={now}
            dayStart={progressDayStartHour}
            currentDay={isCurrentDay}
            language={language}
            calendar={calendarType}
          />
        </div>
      </div>
    </ScreenContainer>
  );
}
