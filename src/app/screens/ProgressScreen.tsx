import { useEffect, useState } from "react";
import { Header } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getGardenSummary, getProgressDayKey } from "../progress";

import { TabList } from "../components/Tabs";
import { shiftCalendarDate } from "../calendarPeriods";
import { getGardenDateLabel } from "../components/gardenDateLabel";

import { PrayerTrackerCards, type PrayerTrackingField } from "../components/PrayerTrackerCards";
import { useNow } from "../hooks/useNow";
import { buildPrayerCardModels } from "../prayerCardModels";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { FridayProgressCard } from "../components/FridayProgressCard";
import { PrayerTrackerStats } from "../components/PrayerTrackerStats";
import { FridayProgressStats } from "../components/FridayProgressStats";

import { getFridaySummary } from "../fridaySummary";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  PrayerName,
  PrayerTrackingRecord,
} from "../types";

/** The wird is the three time-of-day routines. After-prayer adhkar are tracked
 *  per prayer in their own section below, the same split Home uses. */
const WIRD_CATEGORY_IDS = ["morning", "evening", "before_sleep"] as const satisfies readonly CategoryId[];

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
  onTogglePrayerTracking,
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
  onTogglePrayerTracking?: (prayer: PrayerName, field: PrayerTrackingField, next: boolean) => void;
  onPrayerResume?: (prayer: PrayerName) => void;
  onOpenFriday?: () => void;
}) {
  // Ticking, not sampled once per mount: this screen is one people leave open,
  // and a frozen clock left the prayer row framing Fajr and Dhuhr all evening
  // and writing ticks to the previous day after midnight.
  const now = useNow();
  /* Crossing midnight leaves the cached API times pointing at yesterday. The
     offline calculation covers the new day on its own, so nothing is ever
     blank; this only replaces it with the fetched times, the same way Home
     does — Progress used to depend on Home having been opened first. */
  const [, setPrayerTimesRevision] = useState(0);
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
  const fridaySummary = getFridaySummary();
  return (
    <ScreenContainer
      dir={direction}
      tabIndex={0}
      className="relative px-page py-4 overflow-y-auto page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      screenName={t(language, "common.progress")}
    >
      {/* Capped at the same 80rem measure the day/week/month views use internally.
          Without it the page container's 90rem let the tabs, summary strip, and
          after-prayer card run 51px wider per side than the charts they frame. */}
      <div className="relative z-10 mx-auto w-full max-w-[80rem] flex flex-col items-center">
        <Header title={t(language, "common.progress")} language={language} />

        <div className="w-full mb-4">
          <TabList
            value={activeTab}
            onChange={handleTabChange}
            direction={isArabic ? "rtl" : "ltr"}
            idPrefix="global-progress"
            aria-label={t(language, "garden.viewMode")}
            className="mb-4 flex rounded-full border border-border bg-muted p-1"
            itemClassName={(selected) =>
              `flex flex-1 min-h-[44px] items-center justify-center rounded-full py-2 text-[0.875rem] font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
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
              className="px-2 text-center text-[0.9375rem] font-black tracking-wide text-foreground"
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

        <TodayRoutineGarden
          summary={
            offset === 0 && activeTab === "day"
              ? getGardenSummary(dailyCompletions, now, progressDayStartHour)
              : getGardenSummary(dailyCompletions, displayDate, progressDayStartHour)
          }
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

        <>
          {/* After-prayer adhkar are tracked per prayer, not as one routine, so
            they get their own section rather than a fourth tile inside the
            wird card — the same separation Home makes. */}
          <section
            data-testid="progress-after-prayer"
            dir={direction}
            className="mt-4 w-full overflow-hidden rounded-3xl border border-border bg-card text-foreground shadow-raised"
          >
            <div className="border-b border-primary/40 bg-gradient-to-b from-muted/45 to-transparent px-4 py-4 text-start sm:px-6">
              <h2 className="text-[1.125rem] font-black leading-tight text-foreground" dir="auto">
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
                  dayKey={getProgressDayKey(now, progressDayStartHour)}
                  onToggle={onTogglePrayerTracking ?? (() => undefined)}
                  onOpen={onPrayerResume}
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
              displayDate={displayDate}
              language={language}
              calendarType={calendarType}
              direction={direction}
            />
          )}
        </>
      </div>
    </ScreenContainer>
  );
}
