import { Check } from "./icons";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { GardenMilestoneId, GardenSummary, GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId } from "../types";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

export function LeafMark({
  filled = true,
  className = "",
  size = 24,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill={filled ? "currentColor" : "none"}
        fillOpacity={filled ? 0.18 : 0}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14.2 13.2h3.4l2 15.1h-7.4l2-15.1Z" fill="currentColor" fillOpacity="0.18" />
      <path
        d="M14.2 13.2h3.4l2 15.1m-7.4 0 2-15.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9 13.3C13.7 8.1 9.4 5.1 4 5.4c3.1 1.2 5.8 3.9 7 7.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16.1 13.3C18.3 8.1 22.6 5.1 28 5.4c-3.1 1.2-5.8 3.9-7 7.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 12.7C14.6 7.8 15.6 4.4 19 2c.2 3.1-.7 6.4-3 10.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12.7C17.4 7.8 16.4 4.4 13 2c-.2 3.1.7 6.4 3 10.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 28.5h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function gardenMessage(summary: GardenSummary, language: AppLanguage) {
  switch (summary.messageKind) {
    case "complete":
      return t(language, "garden.messageComplete");
    case "partial":
      return t(language, "garden.messagePartial", {
        count: formatNumerals(summary.today.leafCount, language),
        total: formatNumerals(CATEGORIES.length, language),
      });
    case "welcome_back":
      return t(language, "garden.messageWelcomeBack");
    case "yesterday_partial":
      return t(language, "garden.messageYesterdayPartial", {
        count: formatNumerals(summary.yesterdayLeafCount, language),
        total: formatNumerals(CATEGORIES.length, language),
      });
    case "continue":
      return t(language, "garden.messageContinue");
    default:
      return t(language, "garden.messageFirst");
  }
}

export function TodayRoutineGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  return (
    <section
      className="mb-6 rounded-2xl border border-border bg-card p-4"
      aria-labelledby="today-garden-title"
      data-testid="today-garden-card"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          {summary.today.isPalm ? <PalmMark size={30} /> : <LeafMark size={27} filled={summary.today.leafCount > 0} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="today-garden-title" className="text-[0.9375rem] font-bold text-foreground">
              {t(language, "garden.todayTitle")}
            </h2>
            <span className="text-[0.75rem] font-bold text-primary" data-testid="today-leaf-count">
              {t(language, "garden.leafProgress", {
                count: formatNumerals(summary.today.leafCount, language),
                total: formatNumerals(CATEGORIES.length, language),
              })}
            </span>
          </span>
          <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
            {gardenMessage(summary, language)}
          </span>
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-3 gap-2" aria-label={t(language, "garden.todayCollections")}>
        {CATEGORIES.map((category) => {
          const complete = summary.today.completedCategories.includes(category.id);
          const name = language === "ar" ? category.nameArabic : category.name;
          return (
            <li
              key={category.id}
              data-testid={`garden-category-${category.id}`}
              data-state={complete ? "complete" : "pending"}
              className={`min-w-0 rounded-xl border px-2 py-3 text-center ${
                complete ? "border-primary/50 bg-primary/10" : "border-border bg-background"
              }`}
              aria-label={`${name}. ${t(language, complete ? "garden.complete" : "garden.pending")}`}
            >
              <span
                className={`relative mx-auto flex size-9 items-center justify-center rounded-full ${
                  complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                aria-hidden="true"
              >
                <LeafMark size={22} filled={complete} />
                {complete && <Check size={12} strokeWidth={3} className="absolute" />}
              </span>
              <span className="mt-2 block truncate text-[0.6875rem] font-bold text-foreground" title={name}>
                {name.replace(language === "ar" ? "أذكار " : " Azkar", "")}
              </span>
              <span className="mt-0.5 block text-[0.625rem] leading-4 text-muted-foreground">
                {t(language, complete ? "garden.complete" : "garden.pending")}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function localizedCategoryList(categories: CategoryId[], language: AppLanguage) {
  const names = categories.map((category) => categoryName(category, language));
  if (names.length === 0) {
    return "";
  }
  try {
    return new Intl.ListFormat(language === "ar" ? "ar" : "en", { style: "long", type: "conjunction" }).format(names);
  } catch {
    return names.join(", ");
  }
}

function dayAriaLabel(day: GardenSummary["days"][number], language: AppLanguage) {
  const date = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(day.date);
  if (day.isPalm) {
    return t(language, "garden.dayPalm", { date });
  }
  if (day.leafCount > 0) {
    return t(language, "garden.dayPartial", {
      date,
      categories: localizedCategoryList(day.completedCategories, language),
      count: formatNumerals(day.leafCount, language),
    });
  }
  return t(language, "garden.dayEmpty", { date });
}

export function SevenDayGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const locale = language === "ar" ? "ar-EG" : "en-US";
  return (
    <section className="rounded-2xl border border-border bg-card p-4" aria-labelledby="seven-day-garden-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="seven-day-garden-title" className="text-[0.9375rem] font-bold text-foreground">
          {t(language, "garden.sevenDayTitle")}
        </h2>
        <p className="text-[0.75rem] font-semibold text-muted-foreground">
          {t(language, "garden.activeDays", { count: formatNumerals(summary.activeDaysLast7, language) })}
        </p>
      </div>
      <p className="mt-1 text-[0.75rem] leading-5 text-muted-foreground">
        {t(language, "garden.sevenDayHint", { count: formatNumerals(summary.palmDaysLast7, language) })}
      </p>
      <ol className="mt-4 grid grid-cols-7 gap-1" aria-label={t(language, "garden.sevenDayTitle")}>
        {summary.days.map((day) => (
          <li
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            data-state={day.isPalm ? "palm" : day.leafCount > 0 ? "leaf" : "empty"}
            aria-label={dayAriaLabel(day, language)}
            className={`flex min-h-[72px] min-w-0 flex-col items-center justify-center rounded-xl border px-1 py-2 text-center ${
              day.isToday ? "border-primary ring-1 ring-primary/40" : "border-border"
            } ${day.leafCount > 0 ? "bg-primary/10" : "bg-background"}`}
          >
            <span className="text-[0.625rem] font-bold text-muted-foreground" aria-hidden="true">
              {new Intl.DateTimeFormat(locale, { weekday: "narrow" }).format(day.date)}
            </span>
            <span
              className={`mt-1 flex h-7 items-center justify-center ${day.leafCount > 0 ? "text-primary" : "text-muted-foreground"}`}
              aria-hidden="true"
            >
              {day.isPalm ? <PalmMark size={27} /> : <LeafMark size={21} filled={day.leafCount > 0} />}
            </span>
            <span className="mt-1 text-[0.625rem] font-bold text-foreground" aria-hidden="true">
              {formatNumerals(day.leafCount, language)}/{formatNumerals(CATEGORIES.length, language)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

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
                  <LeafMark size={22} filled={milestone.complete} />
                ) : (
                  <PalmMark size={24} />
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

export function GrowthEventStatus({ event, language }: { event: GrowthEvent; language: AppLanguage }) {
  const category = categoryName(event.category, language);
  const text =
    event.kind === "palm"
      ? t(language, "garden.eventPalm")
      : event.kind === "repeat"
        ? t(language, "garden.eventRepeat", { category })
        : t(language, "garden.eventLeaf", { category });

  return (
    <div
      className="mt-5 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-start"
      role="status"
      aria-live="polite"
      data-testid="garden-growth-event"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        aria-hidden="true"
      >
        {event.kind === "palm" ? <PalmMark size={28} /> : <LeafMark size={25} />}
      </span>
      <span>
        <span className="block text-[0.875rem] font-bold text-foreground">{text}</span>
        <span className="mt-1 block text-[0.75rem] leading-5 text-muted-foreground">
          {t(language, "garden.eventHint", {
            count: formatNumerals(event.leafCount, language),
            total: formatNumerals(CATEGORIES.length, language),
          })}
        </span>
      </span>
    </div>
  );
}
