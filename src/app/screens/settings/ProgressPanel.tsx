import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { CheckCircle2 } from "../../components/icons";
import { PalmTreeMark, TodayRoutineGarden } from "../../components/RoutineGarden";
import { CATEGORIES } from "../../content/categories";
import { formatNumerals } from "../../formatting";
import { t } from "../../i18n";
import { getGardenSummary } from "../../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion, StoredSession } from "../../types";
import { ProgressBar } from "../../components/ProgressBar";
import { SettingsToggleRow, SubHeader } from "./SettingsPrimitives";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

export function ProgressPanel({
  onBack,
  language,
  direction,
  sessions,
  dailyCompletions,
  quietProgressEnabled,
  progressDayStartHour,
  weeklyGoalDays,
  onQuietProgressEnabledChange,
  onWeeklyGoalDaysChange,
}: {
  onBack: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  sessions: StoredSession[];
  dailyCompletions: DailyCollectionCompletion[];
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  weeklyGoalDays: number;
  onQuietProgressEnabledChange: (value: boolean) => void;
  onWeeklyGoalDaysChange: (value: number) => void;
}) {
  const now = new Date();
  const summary = getGardenSummary(dailyCompletions, now, progressDayStartHour);
  const completedSessions = sessions.filter((session) => session.isComplete);
  const completedGoalDays = Math.min(summary.activeDaysLast7, weeklyGoalDays);
  const isArabic = language === "ar";

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background/50 backdrop-blur-md">
      <SubHeader title={t(language, "progressPanel.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {/* Garden toggle */}
        <section
          className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised"
          aria-label={t(language, "progressPanel.gardenToggle")}
        >
          <SettingsToggleRow
            icon={
              <PalmTreeMark
                size={22}
                filled={quietProgressEnabled}
                className={quietProgressEnabled ? "text-primary" : "text-muted-foreground/40"}
              />
            }
            iconBg="color-mix(in srgb, var(--primary) 12%, transparent)"
            label={t(language, "progressPanel.gardenToggle")}
            description={t(language, "progressPanel.gardenToggleHint")}
            checked={quietProgressEnabled}
            onChange={() => onQuietProgressEnabledChange(!quietProgressEnabled)}
            hasDivider={false}
          />
        </section>

        {quietProgressEnabled ? (
          <>
            {/* Embedded Routine Garden with Day, Week, Month, and 12-Month Year views */}
            <TodayRoutineGarden
              summary={summary}
              language={language}
              dailyCompletions={dailyCompletions}
              calendarType="hijri"
            />

            {/* Weekly goal */}
            <section
              className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
              aria-labelledby="weekly-goal-title"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="weekly-goal-title" className="text-[0.9375rem] font-bold text-foreground">
                  {t(language, "progressPanel.weeklyGoal")}
                </h2>
                <p className="text-[0.8125rem] font-semibold text-muted-foreground">
                  {t(language, "progressPanel.goalProgress", {
                    done: formatNumerals(completedGoalDays, language),
                    goal: formatNumerals(weeklyGoalDays, language),
                  })}
                </p>
              </div>
              <ProgressBar
                value={completedGoalDays}
                max={weeklyGoalDays}
                height={7}
                trackColor="var(--muted)"
                direction={direction}
                aria-label={t(language, "progressPanel.goalProgress", {
                  done: formatNumerals(completedGoalDays, language),
                  goal: formatNumerals(weeklyGoalDays, language),
                })}
              />
              <RadioGroupPrimitive.Root
                className="mt-4"
                dir={direction}
                value={String(weeklyGoalDays)}
                onValueChange={(value) => onWeeklyGoalDaysChange(Number(value))}
                aria-label={t(language, "progressPanel.chooseGoal")}
              >
                <p className="mb-2 text-[0.75rem] font-semibold leading-5 text-muted-foreground">
                  {t(language, "progressPanel.chooseGoal")}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 7].map((goal) => (
                    <RadioGroupPrimitive.Item
                      key={goal}
                      value={String(goal)}
                      className={`min-h-11 rounded-xl border px-2 text-[0.8125rem] font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                        weeklyGoalDays === goal
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border-control text-foreground"
                      }`}
                    >
                      {formatNumerals(goal, language)}
                    </RadioGroupPrimitive.Item>
                  ))}
                </div>
              </RadioGroupPrimitive.Root>
            </section>
          </>
        ) : (
          <section
            className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
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

        <section
          className="rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
          aria-labelledby="progress-day-boundary-title"
        >
          <h2 id="progress-day-boundary-title" className="text-[0.9375rem] font-bold text-foreground">
            {t(language, "progressPanel.dayBoundaryTitle")}
          </h2>
          <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
            {t(language, "progressPanel.dayBoundaryHint")}
          </p>
          <div className="mt-3 flex min-h-11 items-center justify-between gap-3 text-[0.8125rem] font-semibold text-foreground">
            <span>{t(language, "progressPanel.dayStartsAt")}</span>
            <span className="flex min-h-11 items-center rounded-xl border border-border-control bg-background px-3 font-bold">
              {t(language, "progressPanel.midnight")}
            </span>
          </div>
        </section>

        <section aria-labelledby="recent-sessions-title">
          <h2 id="recent-sessions-title" className="mb-3 text-[0.9375rem] font-bold text-foreground">
            {t(language, "progressPanel.recentSessions")}
          </h2>
          <div className="space-y-2">
            {completedSessions.slice(0, 5).map((session) => (
              <article
                key={session.id}
                className="flex min-h-[70px] items-center gap-3 rounded-2xl border border-border/40 bg-card px-4 shadow-raised"
              >
                <div className="min-w-0 flex-1 text-start">
                  <p className="text-[0.875rem] font-semibold text-foreground">
                    {categoryName(session.category, language)}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-muted-foreground">
                    {new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-US", { dateStyle: "medium" }).format(
                      new Date(session.completedAt),
                    )}
                  </p>
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                    {t(language, "progressPanel.sessionSummary", {
                      count: formatNumerals(session.completedCount, language),
                      minutes: formatNumerals(Math.max(1, Math.round(session.durationSeconds / 60)), language),
                    })}
                  </p>
                </div>
                <CheckCircle2 size={20} className="shrink-0 text-primary" aria-hidden="true" />
              </article>
            ))}
            {completedSessions.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border p-6 text-center text-[0.8125rem] text-muted-foreground">
                {t(language, "progressPanel.noSessions")}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
