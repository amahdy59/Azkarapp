import "./RoutineGarden.css";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { type GardenMilestoneId, type GardenSummary, type GrowthEvent } from "../progress";
import { ProgressDayView, ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressViews";
import { tabPanelProps } from "./Tabs";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";
import { Zap } from "./icons";

// Re-exported so existing imports from RoutineGarden keep working after the split.
export {
  GoldenLeafMark,
  GreenLeafMark,
  LeafMark,
  PaleLeafMark,
  BudMark,
  PalmTreeMark,
  GoldenPalmMark,
  PalmMark,
} from "./GardenMarks";
export { getGardenDateLabel } from "./gardenDateLabel";
import { GoldenLeafMark, GreenLeafMark, PalmTreeMark } from "./GardenMarks";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

// ─── SVG Leaf & Palm Marks ───────────────────────────────────────────────────

/** Golden Leaf Mark — earned for completing core daily protection azkar (morning, evening, before sleep). */

export function TodayRoutineGarden({
  summary,
  language,
  hideTabs = false,
  onOpenShareModal: _onOpenShareModal,
  calendarType = "hijri",
  dailyCompletions = [],
  onSelectCategory,
  visibleCategoryIds,
  onOpenWirdBenefits,
  onMedia = true,
  activeTab = "day",
  displayDate = new Date(),
}: {
  summary: GardenSummary;
  language: AppLanguage;
  hideTabs?: boolean;
  /** See ProgressDayView: media surfaces get overlays and a reserved height. */
  onMedia?: boolean;
  /** Passed through to the day view; see ProgressDayView for the contract. */
  visibleCategoryIds?: readonly CategoryId[];
  onOpenShareModal?: () => void;
  calendarType?: "hijri" | "gregorian";
  dailyCompletions?: DailyCollectionCompletion[];
  onSelectCategory?: (categoryId: CategoryId) => void;
  /** Passed through to the day view; see ProgressDayView for the contract. */
  onOpenWirdBenefits?: () => void;
  activeTab?: "day" | "week" | "month" | "year";
  displayDate?: Date;
}) {
  const totalPalms = summary.lifetimePalms;
  const streak = summary.currentPalmRhythm ?? summary.currentUsageStreak ?? 0;
  // Fallback to internal navigation if not hidden (e.g. for HomeScreen where it uses its own simple label)

  const completedCount = summary.today.completedCategories.length;
  const dynamicSubtitle = t(
    language,
    completedCount === 0
      ? "garden.todayPromptEmpty"
      : completedCount === 1
        ? "garden.todayPromptOne"
        : completedCount === 2
          ? "garden.todayPromptTwo"
          : "garden.todayPromptComplete",
  );

  return (
    <section
      data-testid="today-garden-card"
      aria-label={t(language, "garden.todayTitle")}
      className={`w-full transition-colors ${onMedia ? "h-full" : ""}`}
    >
      {!hideTabs && (
        <div className="mb-4 flex items-center justify-around rounded-3xl border border-border bg-card px-3 py-3 shadow-sm">
          <div className="flex items-center gap-1.5" title={t(language, "progress.dailyStreak")}>
            <Zap
              className={`h-[1.25rem] w-[1.25rem] ${streak > 0 ? "text-primary" : "text-muted-foreground/40"}`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${streak > 0 ? "text-primary" : "text-muted-foreground/60"}`}
            >
              {formatNumerals(streak, language)} {t(language, "progress.days")}
            </span>
          </div>
          <span className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5" title={t(language, "progress.palmsTitle")}>
            <PalmTreeMark
              size={20}
              filled={totalPalms > 0}
              className={totalPalms > 0 ? "text-primary" : "text-muted-foreground/40"}
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${totalPalms > 0 ? "text-primary" : "text-muted-foreground/60"}`}
            >
              {formatNumerals(totalPalms, language)} {t(language, "progress.palmsUnit")}
            </span>
          </div>
        </div>
      )}

      <div
        {...(hideTabs ? {} : tabPanelProps("garden", activeTab))}
        className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {activeTab === "day" && (
          <ProgressDayView
            onMedia={onMedia}
            summary={summary}
            language={language}
            dynamicSubtitle={dynamicSubtitle}
            onSelectCategory={onSelectCategory}
            visibleCategoryIds={visibleCategoryIds}
            headingLevel={hideTabs ? 3 : 2}
            onOpenWirdBenefits={onOpenWirdBenefits}
          />
        )}

        {activeTab === "week" && (
          <ProgressWeekView language={language} dailyCompletions={dailyCompletions} referenceDate={displayDate} />
        )}

        {activeTab === "month" && (
          <ProgressMonthView
            language={language}
            referenceDate={displayDate}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
          />
        )}

        {activeTab === "year" && (
          <ProgressYearView
            language={language}
            referenceDate={displayDate}
            calendarType={calendarType}
            dailyCompletions={dailyCompletions}
          />
        )}
      </div>
    </section>
  );
}

// ─── SevenDayGarden ────────────────────────────────────────────────────────────

export function SevenDayGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const isArabic = language === "ar";
  const locale = isArabic ? "ar-EG" : "en-US";

  return (
    <div className="space-y-2" role="list" aria-label={t(language, "garden.weeklyRecord")}>
      {summary.days.map((day) => {
        const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(day.date);
        const azkarCount = day.completedCategories.length;

        return (
          <div
            role="listitem"
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-2.5"
          >
            <span className="text-[0.875rem] font-bold text-foreground">{weekday}</span>
            <div className="flex items-center gap-2">
              {day.isPalm ? (
                <div
                  role="img"
                  className="flex size-9 items-center justify-center rounded-xl border border-primary/80 bg-primary/20 text-primary shadow-2xs dark:bg-primary/25"
                  title={t(language, "progress.palmCompleted")}
                  aria-label={t(language, "progress.palmCompleted")}
                >
                  <PalmTreeMark size={22} filled />
                </div>
              ) : azkarCount > 0 ? (
                <div
                  role="img"
                  className="flex size-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary"
                  title={t(language, "progress.inProgress")}
                  aria-label={t(language, "progress.inProgress")}
                >
                  <GoldenLeafMark size={20} filled />
                </div>
              ) : (
                <div
                  role="img"
                  className="flex size-9 items-center justify-center rounded-xl border border-transparent bg-muted/30 dark:bg-muted/40 text-muted-foreground/30"
                  title={t(language, "progress.inactive")}
                  aria-label={t(language, "progress.inactive")}
                >
                  <GoldenLeafMark size={20} filled={false} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── GardenMilestones ─────────────────────────────────────────────────────────

const MILESTONE_KEYS: Record<GardenMilestoneId, { title: string; body: string }> = {
  first_leaf: { title: "garden.milestoneFirstLeaf", body: "garden.milestoneFirstLeafBody" },
  first_palm: { title: "garden.milestoneFirstPalm", body: "garden.milestoneFirstPalmBody" },
  seven_palms: { title: "garden.milestoneSevenPalms", body: "garden.milestoneSevenPalmsBody" },
  thirty_palms: { title: "garden.milestoneThirtyPalms", body: "garden.milestoneThirtyPalmsBody" },
};

export function GardenMilestones({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  return (
    <section aria-labelledby="garden-milestones-title">
      <h2 id="garden-milestones-title" className="mb-3 text-[0.9375rem] font-bold text-foreground">
        {t(language, "garden.milestonesTitle")}
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {summary.milestones.map((milestone) => {
          const keys = MILESTONE_KEYS[milestone.id];
          return (
            <article
              key={milestone.id}
              data-testid={`garden-milestone-${milestone.id}`}
              data-state={milestone.complete ? "complete" : "in-progress"}
              className={`rounded-2xl border p-4 ${
                milestone.complete ? "border-primary/50 bg-primary/10" : "border-border bg-card"
              }`}
            >
              <span
                className={`flex size-9 items-center justify-center rounded-xl ${milestone.complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                aria-hidden="true"
              >
                {milestone.id === "first_leaf" ? (
                  <GoldenLeafMark size={22} filled={milestone.complete} />
                ) : (
                  <PalmTreeMark size={24} />
                )}
              </span>
              <h3 className="mt-3 text-[0.8125rem] font-bold leading-5 text-foreground">{t(language, keys.title)}</h3>
              <p className="mt-1 text-[0.6875rem] leading-4 text-muted-foreground">{t(language, keys.body)}</p>
              <p className="mt-3 text-[0.6875rem] font-bold text-foreground">
                {milestone.complete
                  ? t(language, "garden.milestoneComplete")
                  : t(language, "garden.milestoneProgress", {
                      current: formatNumerals(Math.min(milestone.current, milestone.target), language),
                      target: formatNumerals(milestone.target, language),
                    })}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── GrowthEventStatus ────────────────────────────────────────────────────────

export function GrowthEventStatus({ event, language }: { event: GrowthEvent; language: AppLanguage }) {
  const category = categoryName(event.category, language);

  const isCore = event.kind === "leaf" || event.kind === "palm";
  const isExtra = event.kind === "extra_leaf";

  const text =
    event.kind === "palm"
      ? t(language, "garden.eventPalm")
      : event.kind === "leaf"
        ? t(language, "garden.eventLeaf", { category })
        : event.kind === "extra_leaf"
          ? t(language, "garden.eventExtraLeaf", { category })
          : t(language, "garden.eventRepeat", { category });

  const containerClass = isCore
    ? "mt-5 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-start animate-leaf-float-core"
    : isExtra
      ? "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card/80 p-3.5 text-start animate-leaf-float-extra"
      : "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-start";

  const iconClass = isCore
    ? "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
    : "flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground";

  return (
    <div className={containerClass} role="status" aria-live="polite" data-testid="garden-growth-event">
      <span className={iconClass} aria-hidden="true">
        {event.kind === "palm" ? (
          <PalmTreeMark size={isCore ? 28 : 22} />
        ) : isExtra ? (
          <GreenLeafMark size={20} />
        ) : (
          <GoldenLeafMark size={isCore ? 25 : 20} />
        )}
      </span>
      <span>
        <span className={`block font-bold text-foreground ${isCore ? "text-[0.875rem]" : "text-[0.8125rem]"}`}>
          {text}
        </span>
        <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">
          {t(language, "garden.eventHint", {
            count: formatNumerals(event.leafCount, language),
            total: formatNumerals(CATEGORIES.filter((category) => category.id !== "friday_kahf").length, language),
          })}
        </span>
      </span>
    </div>
  );
}
