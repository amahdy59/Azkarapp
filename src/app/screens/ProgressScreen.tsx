import { Header } from "../components/LayoutShells";
import { TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

export function ProgressScreen({
  dailyCompletions,
  progressDayStartHour,
  calendarType,
  language,
  direction,
  onOpenShareModal,
  onSelectCategory,
}: {
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  calendarType: "hijri" | "gregorian";
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpenShareModal: () => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
}) {
  return (
    <ScreenContainer
      dir={direction}
      tabIndex={0}
      className="relative px-page py-4 overflow-y-auto page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      screenName={t(language, "nav.progress")}
    >
      <div className="relative z-10 w-full flex flex-col items-center">
        <Header title={t(language, "common.progress")} language={language} />
        <TodayRoutineGarden
          summary={getGardenSummary(dailyCompletions, new Date(), progressDayStartHour)}
          language={language}
          hideTabs={false}
          calendarType={calendarType}
          dailyCompletions={dailyCompletions}
          onOpenShareModal={onOpenShareModal}
          onSelectCategory={onSelectCategory}
        />
      </div>
    </ScreenContainer>
  );
}
