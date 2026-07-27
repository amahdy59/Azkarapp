import { Check } from "./icons";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { MAIN_CATEGORY_IDS, type GardenMilestoneId, type GardenSummary, type GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId } from "../types";

const MAIN_CATEGORIES = CATEGORIES.filter((category) => MAIN_CATEGORY_IDS.includes(category.id));

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

// ─── SVG Marks ────────────────────────────────────────────────────────────────

/** Standard leaf mark — used for core group completions. */
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

/** Pale leaf mark — used for extra (non-core) group completions. Softer, smaller visual weight. */
export function PaleLeafMark({
  className = "",
  size = 20,
}: {
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
      style={{ opacity: 0.65 }}
    >
      <path
        d="M20.5 3.5C12.8 3.7 6.4 6.5 4.1 11.3c-1.5 3.1-.5 6.3 2.3 7.4 2.8 1.2 5.9-.2 7.8-2.4 2.7-3.6 4.7-8 6.3-12.8Z"
        fill="currentColor"
        fillOpacity={0.08}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** Bud mark — used for pending core group slots, communicating "not yet completed". */
export function BudMark({
  className = "",
  size = 14,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Small teardrop sprout shape */}
      <path
        d="M7 13 C7 9.5 4.5 7 4.5 5 C4.5 3.3 5.6 2 7 2 C8.4 2 9.5 3.3 9.5 5 C9.5 7 7 9.5 7 13Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * PalmTreeMark — a beautiful, detailed date palm SVG replacing the old simple PalmMark.
 * Features: curved trunk with bark texture, 7 arching fronds, date clusters at crown,
 * and a subtle ground shadow. Uses currentColor for full theme compatibility.
 */
export function PalmTreeMark({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Ground shadow — subtle ellipse anchoring the tree */}
      <ellipse cx="29" cy="62" rx="11" ry="2.5" fill="currentColor" fillOpacity="0.1" />

      {/* Trunk — organic gentle curve with slight rightward lean, tapers toward crown */}
      <path
        d="M27 62 C26 54 27 44 28 34 C29 26 30 22 32 16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Bark ring marks — subtle horizontal tick marks suggesting palm bark texture */}
      <path d="M27 52 Q28 51 29 52" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.28" />
      <path d="M27 42 Q28 41 30 42" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.28" />
      <path d="M28 32 Q29 31 31 32" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.28" />
      <path d="M29 24 Q30 23 32 24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.28" />

      {/* Date clusters — three grouped circles at the crown base, referencing the Islamic date palm */}
      <circle cx="29" cy="19" r="3" fill="currentColor" fillOpacity="0.45" />
      <circle cx="33" cy="20" r="2.5" fill="currentColor" fillOpacity="0.38" />
      <circle cx="31" cy="22" r="2.2" fill="currentColor" fillOpacity="0.32" />

      {/* Crown fronds — 7 arching paths radiating from the crown point */}
      {/* Frond 1: Top center, slight rightward lean */}
      <path d="M32 16 C33 10 34 6 36 2" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      {/* Frond 2: Upper-left */}
      <path d="M31 15 C24 9 16 7 8 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      {/* Frond 3: Upper-right */}
      <path d="M33 15 C40 9 48 7 56 8" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
      {/* Frond 4: Left drooping — arches outward and curves down */}
      <path d="M30 18 C22 17 14 19 6 25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Frond 5: Right drooping */}
      <path d="M34 18 C42 17 50 19 58 25" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      {/* Frond 6: Lower-left — hanging frond */}
      <path d="M29 21 C21 22 13 27 7 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Frond 7: Lower-right */}
      <path d="M35 21 C43 22 51 27 57 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Legacy PalmMark — kept for backward compatibility in places that still reference it.
 * Internally delegates to PalmTreeMark.
 */
export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}

// ─── PalmTreeReward ────────────────────────────────────────────────────────────

/**
 * PalmTreeReward — the unified gamification top-bar component.
 * Shows the palm tree with leaf cluster indicators:
 * - Up to 3 bright green LeafMark slots (one per core group, filled or pending bud)
 * - A pale-leaf + count for extra groups when any are completed
 * - A golden ambient glow when all 3 core groups are done (palm day)
 */
export function PalmTreeReward({
  summary,
  language,
}: {
  summary: GardenSummary;
  language: AppLanguage;
}) {
  const { today } = summary;
  const isPalm = today.isPalm;
  const coreLeafCount = today.leafCount;
  const extraLeafCount = today.extraLeafCount;

  const treeColor =
    isPalm ? "text-emerald-500" : coreLeafCount > 0 ? "text-primary" : "text-muted-foreground";
  const treeOpacity = coreLeafCount === 0 ? "opacity-40" : "opacity-100";

  const ariaLabel =
    language === "ar"
      ? `حديقتي: ${coreLeafCount} من ${MAIN_CATEGORY_IDS.length} مجموعات أساسية${extraLeafCount > 0 ? `، ${extraLeafCount} إضافية` : ""}`
      : `Garden: ${coreLeafCount} of ${MAIN_CATEGORY_IDS.length} core groups${extraLeafCount > 0 ? `, ${extraLeafCount} extra` : ""}`;

  return (
    <div className="relative flex flex-col items-center gap-0.5" role="img" aria-label={ariaLabel}>
      {/* Ambient glow ring on palm-day milestone */}
      {isPalm && (
        <div
          className="absolute inset-0 -m-3 rounded-full bg-amber-400/10 blur-md animate-palm-glow-pulse"
          aria-hidden="true"
        />
      )}

      {/* The palm tree */}
      <PalmTreeMark
        size={28}
        className={`${treeColor} ${treeOpacity} transition-[color,opacity] duration-500`}
      />

      {/* Leaf cluster row — core slots + optional extra count */}
      <div className="flex items-center gap-0.5" aria-hidden="true">
        {MAIN_CATEGORY_IDS.map((catId) => {
          const complete = today.completedCategories.includes(catId as CategoryId);
          return complete ? (
            <LeafMark
              key={catId}
              size={10}
              filled
              className="text-emerald-500 animate-leaf-appear"
            />
          ) : (
            <BudMark key={catId} size={9} className="text-muted-foreground/35" />
          );
        })}

        {/* Extra group count indicator — shown only when extras exist */}
        {extraLeafCount > 0 && (
          <>
            <span className="mx-0.5 h-2 w-px rounded-full bg-border/60" />
            <PaleLeafMark size={9} className="text-muted-foreground" />
            <span className="text-[0.5rem] font-bold leading-none text-muted-foreground">
              {formatNumerals(extraLeafCount, language)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Garden Message ────────────────────────────────────────────────────────────

function gardenMessage(summary: GardenSummary, language: AppLanguage) {
  switch (summary.messageKind) {
    case "complete":
      return t(language, "garden.messageComplete");
    case "partial":
      return t(language, "garden.messagePartial", {
        count: formatNumerals(summary.today.leafCount, language),
        total: formatNumerals(MAIN_CATEGORY_IDS.length, language),
      });
    case "welcome_back":
      return t(language, "garden.messageWelcomeBack");
    case "yesterday_partial":
      return t(language, "garden.messageYesterdayPartial", {
        count: formatNumerals(summary.yesterdayLeafCount, language),
        total: formatNumerals(MAIN_CATEGORY_IDS.length, language),
      });
    case "continue":
      return t(language, "garden.messageContinue");
    default:
      return t(language, "garden.messageFirst");
  }
}

// ─── TodayRoutineGarden ────────────────────────────────────────────────────────

export function TodayRoutineGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const { today } = summary;
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
          {today.isPalm ? <PalmTreeMark size={30} /> : <LeafMark size={27} filled={today.leafCount > 0} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <h2 id="today-garden-title" className="text-[0.9375rem] font-bold text-foreground">
              {t(language, "garden.todayTitle")}
            </h2>
            <span className="text-[0.75rem] font-bold text-primary" data-testid="today-leaf-count">
              {t(language, "garden.leafProgress", {
                count: formatNumerals(today.leafCount, language),
                total: formatNumerals(MAIN_CATEGORY_IDS.length, language),
              })}
            </span>
          </span>
          <span className="mt-1 block text-[0.8125rem] leading-5 text-muted-foreground">
            {gardenMessage(summary, language)}
          </span>
        </span>
      </div>

      {/* Core group slots */}
      <ul className="mt-4 grid grid-cols-3 gap-2" aria-label={t(language, "garden.todayCollections")}>
        {MAIN_CATEGORIES.map((category) => {
          const complete = today.completedCategories.includes(category.id);
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

      {/* Extra group progress — shown as a subtle count pill when any extras are done */}
      {today.extraLeafCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-2.5 py-1.5">
          <PaleLeafMark size={14} className="shrink-0 text-muted-foreground" />
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">
            {t(language, "garden.extraProgress", {
              count: formatNumerals(today.extraLeafCount, language),
            })}
          </span>
        </div>
      )}
    </section>
  );
}

// ─── SevenDayGarden ────────────────────────────────────────────────────────────

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
              {day.isPalm ? <PalmTreeMark size={27} /> : <LeafMark size={21} filled={day.leafCount > 0} />}
            </span>
            <span className="mt-1 text-[0.625rem] font-bold text-foreground" aria-hidden="true">
              {formatNumerals(day.leafCount, language)}/{formatNumerals(MAIN_CATEGORY_IDS.length, language)}
            </span>
          </li>
        ))}
      </ol>
    </section>
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
                  <LeafMark size={22} filled={milestone.complete} />
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

/**
 * GrowthEventStatus — shown on the completion screen to communicate what reward was earned.
 * Core events (leaf, palm) receive full-colour treatment.
 * Extra events receive a quieter, muted-foreground treatment.
 * Repeat events show a calm acknowledgement.
 */
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
    <div
      className={containerClass}
      role="status"
      aria-live="polite"
      data-testid="garden-growth-event"
    >
      <span className={iconClass} aria-hidden="true">
        {event.kind === "palm" ? (
          <PalmTreeMark size={isCore ? 28 : 22} />
        ) : isExtra ? (
          <PaleLeafMark size={20} />
        ) : (
          <LeafMark size={isCore ? 25 : 20} />
        )}
      </span>
      <span>
        <span className={`block font-bold text-foreground ${isCore ? "text-[0.875rem]" : "text-[0.8125rem]"}`}>
          {text}
        </span>
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
