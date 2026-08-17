import { Header } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getGardenSummary, getProgressDayKey } from "../progress";
import { PrayerTrackerCards, type PrayerTrackingField } from "../components/PrayerTrackerCards";
import { buildPrayerCardModels } from "../prayerCardModels";
import { FridayProgressCard } from "../components/FridayProgressCard";
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
  const now = new Date();
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
        <TodayRoutineGarden
          summary={getGardenSummary(dailyCompletions, new Date(), progressDayStartHour)}
          language={language}
          hideTabs={false}
          calendarType={calendarType}
          dailyCompletions={dailyCompletions}
          progressDayStartHour={progressDayStartHour}
          onOpenShareModal={onOpenShareModal}
          onSelectCategory={onSelectCategory}
          visibleCategoryIds={WIRD_CATEGORY_IDS}
        />

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
            <PrayerTrackerCards
              models={prayerCardModels}
              language={language}
              direction={direction}
              records={prayerTracking}
              dayKey={getProgressDayKey(now, progressDayStartHour)}
              onToggle={onTogglePrayerTracking ?? (() => undefined)}
              onOpen={onPrayerResume}
            />
          </div>
        </section>

        <FridayProgressCard summary={fridaySummary} language={language} direction={direction} onOpen={onOpenFriday} />
      </div>
    </ScreenContainer>
  );
}
