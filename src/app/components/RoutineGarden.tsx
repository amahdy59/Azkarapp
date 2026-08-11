import { useMemo, useState } from "react";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getGardenSummary, type GardenMilestoneId, type GardenSummary, type GrowthEvent } from "../progress";
import { ProgressDayView, ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressViews";
import { TabList, tabPanelProps } from "./Tabs";
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
import { getGardenDateLabel } from "./gardenDateLabel";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

// ─── SVG Leaf & Palm Marks ───────────────────────────────────────────────────

/** Golden Leaf Mark — earned for completing core daily protection azkar (morning, evening, before sleep). */

export function TodayRoutineGarden({
  summary: initialSummary,
  language,
  hideTabs = false,
  onOpenShareModal: _onOpenShareModal,
  calendarType = "hijri",
  dailyCompletions = [],
  onSelectCategory,
  visibleCategoryIds,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  hideTabs?: boolean;
  /** Passed through to the day view; see ProgressDayView for the contract. */
  visibleCategoryIds?: readonly CategoryId[];
  onOpenShareModal?: () => void;
  calendarType?: "hijri" | "gregorian";
  dailyCompletions?: DailyCollectionCompletion[];
  onSelectCategory?: (categoryId: CategoryId) => void;
}) {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [offset, setOffset] = useState(0);

  const isArabic = language === "ar";

  const displayDate = useMemo(() => {
    const d = new Date();
    if (offset !== 0) {
      if (activeTab === "day") {
        d.setDate(d.getDate() + offset);
      } else if (activeTab === "week") {
        d.setDate(d.getDate() + offset * 7);
      } else if (activeTab === "month") {
        d.setMonth(d.getMonth() + offset);
      } else if (activeTab === "year") {
        d.setFullYear(d.getFullYear() + offset);
      }
    }
    return d;
  }, [activeTab, offset]);

  const summary = useMemo(
    () => (offset === 0 && activeTab === "day" ? initialSummary : getGardenSummary(dailyCompletions, displayDate)),
    [initialSummary, dailyCompletions, displayDate, offset, activeTab],
  );

  const totalPalms = summary.lifetimePalms;
  const streak = summary.currentPalmRhythm ?? summary.currentUsageStreak ?? 0;

  const dateLabel = getGardenDateLabel(displayDate, activeTab, offset, language, calendarType);

  const handleTabChange = (tab: "day" | "week" | "month" | "year") => {
    setActiveTab(tab);
    setOffset(0);
  };

  const targetYear = displayDate.getFullYear();
  const targetMonth = displayDate.getMonth();

  const completedCount = summary.today.completedCategories.length;
  const dynamicSubtitle =
    completedCount === 0
      ? isArabic
        ? "أكمل أوراد اليوم لتنمو نخلتك"
        : "Complete today's routines to grow your palm"
      : completedCount === 1
        ? isArabic
          ? "بداية ممتازة! أكمل وردين آخرين لنخلة كاملة 🌴"
          : "Great start! Complete 2 more routines for a full palm 🌴"
        : completedCount === 2
          ? isArabic
            ? "أوشكت على الانتهاء! متبقي ورد واحد فقط 🌴"
            : "Almost there! 1 more routine for a full palm 🌴"
          : isArabic
            ? "ماشاء الله! اكتملت جميع أوراد اليوم 🌴"
            : "Masha'Allah! All today's routines completed! 🌴";

  return (
    <section
      data-testid="today-garden-card"
      aria-label={t(language, "garden.todayTitle")}
      className="h-full w-full transition-all"
    >
      {!hideTabs && (
        <>
          <TabList
            value={activeTab}
            onChange={handleTabChange}
            direction={isArabic ? "rtl" : "ltr"}
            idPrefix="garden"
            aria-label={t(language, "garden.viewMode")}
            className="mb-4 flex rounded-full bg-muted/60 p-1 dark:bg-muted/30"
            itemClassName={(selected) =>
              `flex flex-1 min-h-[44px] items-center justify-center rounded-full py-2 text-[0.875rem] font-extrabold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${
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

          <div className="mb-4 flex items-center justify-between rounded-3xl border border-border/40 bg-card px-3 py-2 shadow-raised">
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
              className="px-2 text-center text-[0.9375rem] font-black tracking-wide text-foreground"
              data-testid="garden-view-date"
              dir="auto"
              aria-live="polite"
              aria-atomic="true"
            >
              {dateLabel}
            </span>

            <button
              type="button"
              onClick={() => setOffset((prev) => Math.min(0, prev + 1))}
              disabled={offset >= 0}
              aria-label={t(language, "garden.nextPeriod")}
              title={t(language, "garden.nextPeriod")}
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points={isArabic ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
              </svg>
            </button>
          </div>
        </>
      )}

      {!hideTabs && (
        <div className="mb-4 flex items-center justify-around rounded-3xl border border-amber-500/30 bg-amber-500/10 py-3 px-3 shadow-sm backdrop-blur-sm dark:bg-amber-500/15">
          <div className="flex items-center gap-1.5" title={t(language, "progress.dailyStreak")}>
            <Zap
              className={`h-[1.25rem] w-[1.25rem] ${streak > 0 ? "text-amber-500" : "text-muted-foreground/40"}`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${streak > 0 ? "text-amber-500" : "text-muted-foreground/60"}`}
            >
              {formatNumerals(streak, language)} {t(language, "progress.days")}
            </span>
          </div>
          <span className="h-4 w-px bg-amber-500/30" />
          <div className="flex items-center gap-1.5" title={t(language, "progress.palmsTitle")}>
            <PalmTreeMark
              size={20}
              filled={totalPalms > 0}
              className={totalPalms > 0 ? "text-amber-500" : "text-muted-foreground/40"}
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${totalPalms > 0 ? "text-amber-500" : "text-muted-foreground/60"}`}
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
            summary={summary}
            language={language}
            dynamicSubtitle={dynamicSubtitle}
            onSelectCategory={onSelectCategory}
            visibleCategoryIds={visibleCategoryIds}
          />
        )}

        {activeTab === "week" && (
          <ProgressWeekView language={language} dailyCompletions={dailyCompletions} referenceDate={displayDate} />
        )}

        {activeTab === "month" && (
          <ProgressMonthView
            language={language}
            targetYear={targetYear}
            targetMonth={targetMonth}
            dailyCompletions={dailyCompletions}
          />
        )}

        {activeTab === "year" && (
          <ProgressYearView language={language} targetYear={targetYear} dailyCompletions={dailyCompletions} />
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
    <div className="space-y-2" aria-label={t(language, "garden.weeklyRecord")}>
      {summary.days.map((day) => {
        const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(day.date);
        const azkarCount = day.completedCategories.length;

        return (
          <div
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-2.5"
          >
            <span className="text-[0.875rem] font-bold text-foreground">{weekday}</span>
            <div className="flex items-center gap-2">
              {day.isPalm ? (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-amber-400/80 bg-amber-500/20 text-amber-500 shadow-2xs dark:bg-amber-500/25"
                  title={t(language, "progress.palmCompleted")}
                  aria-label={t(language, "progress.palmCompleted")}
                >
                  <PalmTreeMark size={22} filled />
                </div>
              ) : azkarCount > 0 ? (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  title={t(language, "progress.inProgress")}
                  aria-label={t(language, "progress.inProgress")}
                >
                  <GoldenLeafMark size={20} filled />
                </div>
              ) : (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-transparent bg-muted/30 dark:bg-zinc-800/40 text-muted-foreground/30"
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
