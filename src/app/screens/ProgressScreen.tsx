import { Header } from "../components/LayoutShells";
import { PalmTreeMark, TodayRoutineGarden } from "../components/RoutineGarden";
import { ScreenContainer } from "../components/ScreenContainer";
import { t } from "../i18n";
import { getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

export function ProgressScreen({
  dailyCompletions,
  progressDayStartHour,
  calendarType,
  quietProgressEnabled,
  language,
  direction,
  onOpenShareModal,
  onSelectCategory,
  onQuietProgressEnabledChange,
}: {
  dailyCompletions: DailyCollectionCompletion[];
  progressDayStartHour: number;
  calendarType: "hijri" | "gregorian";
  quietProgressEnabled: boolean;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onOpenShareModal: () => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
  onQuietProgressEnabledChange: (value: boolean) => void;
}) {
  return (
    <ScreenContainer
      dir={direction}
      tabIndex={0}
      className="relative px-page py-4 overflow-y-auto page-content-center outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      screenName={t(language, "common.progress")}
    >
      <div className="relative z-10 w-full flex flex-col items-center">
        <Header title={t(language, "common.progress")} language={language} />
        <section
          className="mb-4 flex min-h-16 w-full items-center gap-3 rounded-3xl border border-border bg-card p-2 ps-4 shadow-raised"
          aria-label={t(language, "progressPanel.gardenToggle")}
          data-testid="progress-garden-visibility"
        >
          <PalmTreeMark
            size={24}
            filled={quietProgressEnabled}
            className={quietProgressEnabled ? "shrink-0 text-primary" : "shrink-0 text-muted-foreground"}
          />
          <div className="min-w-0 flex-1 text-start">
            <h2 className="text-[0.875rem] font-extrabold text-foreground">
              {t(language, "progressPanel.gardenToggle")}
            </h2>
            <p className="text-[0.75rem] leading-5 text-muted-foreground">
              {t(language, "progressPanel.gardenToggleHint")}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={quietProgressEnabled}
            aria-label={t(language, "progressPanel.gardenToggle")}
            onClick={() => onQuietProgressEnabledChange(!quietProgressEnabled)}
            className={`relative h-12 w-14 shrink-0 rounded-full border border-border-control p-1 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
              quietProgressEnabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`block size-8 rounded-full bg-card shadow-raised transition-transform ${
                quietProgressEnabled ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </section>
        {quietProgressEnabled ? (
          <TodayRoutineGarden
            summary={getGardenSummary(dailyCompletions, new Date(), progressDayStartHour)}
            language={language}
            hideTabs={false}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
            progressDayStartHour={progressDayStartHour}
            onOpenShareModal={onOpenShareModal}
            onSelectCategory={onSelectCategory}
          />
        ) : (
          <section
            className="w-full rounded-3xl border border-border bg-card p-6 text-start shadow-raised"
            data-testid="garden-hidden-state"
          >
            <h2 className="text-[0.9375rem] font-bold text-foreground">
              {t(language, "progressPanel.gardenHiddenTitle")}
            </h2>
            <p className="mt-1 text-[0.8125rem] leading-5 text-muted-foreground">
              {t(language, "progressPanel.gardenHiddenBody")}
            </p>
          </section>
        )}
      </div>
    </ScreenContainer>
  );
}
