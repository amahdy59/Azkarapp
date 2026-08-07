import { useMemo, useState } from "react";
import { CATEGORIES } from "../content/categories";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getGardenSummary, type GardenMilestoneId, type GardenSummary, type GrowthEvent } from "../progress";
import { ProgressDayView, ProgressWeekView, ProgressMonthView, ProgressYearView } from "./ProgressViews";
import { TabList, tabPanelProps } from "./Tabs";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";
import { Zap } from "./icons";

function categoryName(category: CategoryId, language: AppLanguage) {
  const item = CATEGORIES.find((candidate) => candidate.id === category);
  return language === "ar" ? (item?.nameArabic ?? category) : (item?.name ?? category);
}

// ─── SVG Leaf & Palm Marks ───────────────────────────────────────────────────

/** Golden Leaf Mark — earned for completing core daily protection azkar (morning, evening, before sleep). */
export function GoldenLeafMark({
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
        fill="#F59E0B"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="#D97706"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="#92400E"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Green Leaf Mark — earned for completing any non-core azkar group (after prayer, food, travel, etc.). */
export function GreenLeafMark({
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
        fill="#10B981"
        fillOpacity={filled ? 0.95 : 0.22}
        stroke="#059669"
        strokeOpacity={filled ? 1 : 0.45}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke="#064E3B"
        strokeOpacity={filled ? 1 : 0.35}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
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
  return <GoldenLeafMark filled={filled} className={className} size={size} />;
}

export function PaleLeafMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  return <GreenLeafMark filled className={className} size={size} />;
}

export function BudMark({ className = "", size = 14 }: { className?: string; size?: number }) {
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

/** Single unified Palm Tree vector matching public/palm tree.svg across the app. */
export function PalmTreeMark({
  filled = true,
  className = "",
  size = 32,
  color,
  strokeWidth = 2,
}: {
  filled?: boolean;
  className?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 53"
      width={size}
      height={size}
      fill="none"
      stroke={color || "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} ${!filled && !color ? "opacity-40" : ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22.335 14.3339H11.6675L9.00064 11.6671L6.33376 14.3339H1C1 6.97358 7.56053 1 15.6678 1C23.7752 1 30.3357 6.97358 30.3357 14.3339C31.6691 19.6675 38.3363 37.0015 33.0026 51.6688H22.335C24.5486 46.3352 26.3354 41.0017 25.0019 34.3347M30.3357 12.0408C33.0362 10.0443 36.3114 8.9776 39.6698 9.0007C47.7771 9.0007 54.3376 14.9743 54.3376 22.3346H46.337L43.6701 19.6678L41.0032 22.3346H33.0026M11.3744 18.8953C5.64061 24.6289 5.24058 33.4826 10.441 38.7095L21.7486 27.3757L31.1627 17.9619C25.9622 12.7351 17.1082 13.1617 11.3744 18.8953Z" />
    </svg>
  );
}

/** Golden Palm Tree Mark — matching golden amber (#E4A84A). */
export function GoldenPalmMark({
  className = "",
  size = 28,
  color = "#E4A84A",
}: {
  className?: string;
  size?: number;
  color?: string;
}) {
  return <PalmTreeMark size={size} color={color} className={className} />;
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}

// ─── Date Label Helper & Parsers ──────────────────────────────────────────────

function parseCleanNumber(val: unknown): number {
  if (typeof val === "number" && !isNaN(val)) return val;
  const str = String(val ?? "");
  const western = str.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const parsed = parseInt(western.replace(/\D/g, ""), 10);
  return isNaN(parsed) ? 1 : parsed;
}

function getHijriDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-SA-u-ca-islamic-umalqura" : "en-US-u-ca-islamic-umalqura";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear.replace(/AH|AD/gi, "").trim();
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

function getGregorianDetails(date: Date, language: AppLanguage) {
  try {
    const locale = language === "ar" ? "ar-EG" : "en-US";
    const formatter = new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const rawDay = parts.find((p) => p.type === "day")?.value ?? "1";
    const day = parseCleanNumber(rawDay);
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const rawYear = parts.find((p) => p.type === "year")?.value ?? "";
    const year = language === "ar" ? formatNumerals(rawYear, "ar") : rawYear;
    return { weekday, day, month, year };
  } catch {
    return { weekday: "", day: date.getDate(), month: "", year: "" };
  }
}

const ARABIC_WEEK_ORDINALS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"];

export function getGardenDateLabel(
  displayDate: Date,
  tab: "day" | "week" | "month" | "year",
  offset: number,
  language: AppLanguage,
  calendarType: "hijri" | "gregorian" = "hijri",
): string {
  const isArabic = language === "ar";
  const isHijri = calendarType === "hijri";
  const { weekday, day, month, year } = isHijri
    ? getHijriDetails(displayDate, language)
    : getGregorianDetails(displayDate, language);

  const eraSuffix = isHijri ? (isArabic ? "هـ" : "AH") : isArabic ? "م" : "AD";

  if (tab === "day") {
    if (offset === 0) {
      return isArabic
        ? `اليوم ${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
        : `Today, ${weekday} ${day} ${month} ${year} ${eraSuffix}`;
    }
    return isArabic
      ? `${weekday} ${formatNumerals(day, language)} ${month} ${year} ${eraSuffix}`
      : `${weekday}, ${day} ${month} ${year} ${eraSuffix}`;
  }

  if (tab === "week") {
    const weekIndex = Math.min(4, Math.max(0, Math.floor((day - 1) / 7)));
    const startDay = weekIndex * 7 + 1;
    const endDay = Math.min((weekIndex + 1) * 7, 30);
    const weekOrdinal = isArabic ? (ARABIC_WEEK_ORDINALS[weekIndex] ?? "الأول") : `Week ${weekIndex + 1}`;

    if (isArabic) {
      return `الأسبوع ${weekOrdinal} (${formatNumerals(startDay, language)} - ${formatNumerals(endDay, language)} ${month} ${year} ${eraSuffix})`;
    }
    return `${weekOrdinal} (${startDay} - ${endDay} ${month} ${year} ${eraSuffix})`;
  }

  if (tab === "month") {
    return isArabic ? `${month} ${year} ${eraSuffix}` : `${month} ${year} ${eraSuffix}`;
  }

  return isArabic ? `${year} ${eraSuffix}` : `${year} ${eraSuffix}`;
}

export function TodayRoutineGarden({
  summary: initialSummary,
  language,
  hideTabs = false,
  onOpenShareModal: _onOpenShareModal,
  calendarType = "hijri",
  dailyCompletions = [],
  onSelectCategory,
}: {
  summary: GardenSummary;
  language: AppLanguage;
  hideTabs?: boolean;
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
      className="w-full transition-all"
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
              `flex flex-1 min-h-[44px] items-center justify-center rounded-full py-2 text-[0.875rem] font-extrabold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
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
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
              className="flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-xl border border-border/60 hover:bg-muted text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <div className="flex items-center gap-1.5" title={isArabic ? "السلسلة اليومية" : "Daily Streak"}>
            <Zap
              className={`h-[1.25rem] w-[1.25rem] ${streak > 0 ? "text-amber-500" : "text-muted-foreground/40"}`}
              strokeWidth={2.5}
              aria-hidden="true"
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${streak > 0 ? "text-amber-500" : "text-muted-foreground/60"}`}
            >
              {formatNumerals(streak, language)} {isArabic ? "أيام" : "days"}
            </span>
          </div>
          <span className="h-4 w-px bg-amber-500/30" />
          <div className="flex items-center gap-1.5" title={isArabic ? "أشجار النخيل" : "Palms"}>
            <PalmTreeMark
              size={20}
              filled={totalPalms > 0}
              className={totalPalms > 0 ? "text-amber-500" : "text-muted-foreground/40"}
            />
            <span
              className={`text-[0.875rem] font-black leading-tight ${totalPalms > 0 ? "text-amber-500" : "text-muted-foreground/60"}`}
            >
              {formatNumerals(totalPalms, language)} {isArabic ? "نخلة" : "palms"}
            </span>
          </div>
        </div>
      )}

      <div
        {...tabPanelProps("garden", activeTab)}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {activeTab === "day" && (
          <ProgressDayView
            summary={summary}
            language={language}
            dynamicSubtitle={dynamicSubtitle}
            onSelectCategory={onSelectCategory}
          />
        )}

        {activeTab === "week" && (
          <ProgressWeekView
            summary={summary}
            language={language}
            dailyCompletions={dailyCompletions}
            referenceDate={displayDate}
          />
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
                  title={isArabic ? "نخلة مكتملة" : "Palm Completed"}
                  aria-label={isArabic ? "نخلة مكتملة" : "Palm Completed"}
                >
                  <PalmTreeMark size={22} filled />
                </div>
              ) : azkarCount > 0 ? (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  title={isArabic ? "نشط" : "In Progress"}
                  aria-label={isArabic ? "نشط" : "In Progress"}
                >
                  <GoldenLeafMark size={20} filled />
                </div>
              ) : (
                <div
                  className="flex size-9 items-center justify-center rounded-xl border border-transparent bg-muted/30 dark:bg-zinc-800/40 text-muted-foreground/30"
                  title={isArabic ? "غير نشط" : "Inactive"}
                  aria-label={isArabic ? "غير نشط" : "Inactive"}
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
