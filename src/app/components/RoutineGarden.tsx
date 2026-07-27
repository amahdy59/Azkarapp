import { useState } from "react";
import { CATEGORIES } from "../content/categories";
import { formatHijriDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { type GardenMilestoneId, type GardenSummary, type GrowthEvent } from "../progress";
import type { AppLanguage, CategoryId } from "../types";

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
        fill={filled ? "#F59E0B" : "none"}
        fillOpacity={filled ? 0.95 : 0}
        stroke={filled ? "#D97706" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke={filled ? "#92400E" : "currentColor"}
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
        fill={filled ? "#10B981" : "none"}
        fillOpacity={filled ? 0.95 : 0}
        stroke={filled ? "#059669" : "currentColor"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M4 20c2.7-4.3 6.5-7.7 11.7-10.1"
        stroke={filled ? "#064E3B" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Standard Leaf Mark — aliases to Golden/Green depending on core status. */
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

/** Pale Leaf Mark — kept for subtle secondary indicators. */
export function PaleLeafMark({ className = "", size = 20 }: { className?: string; size?: number }) {
  return <GreenLeafMark filled className={className} size={size} />;
}

/** Bud mark — used for pending core group slots. */
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

/** PalmTreeMark — refined date palm tree SVG. */
export function PalmTreeMark({ className = "", size = 32 }: { className?: string; size?: number }) {
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
      <ellipse cx="32" cy="62" rx="10" ry="2.2" fill="currentColor" fillOpacity="0.12" />
      <path d="M27.5 61.5 L32 58.5 L36.5 61.5 L35.5 53.5 L32 51 L28.5 53.5 Z" fill="#78350F" fillOpacity="0.9" />
      <path d="M28.5 53.5 L32 51 L35.5 53.5 L34.5 45.5 L32 43.5 L29.5 45.5 Z" fill="#92400E" fillOpacity="0.95" />
      <path d="M29.5 45.5 L32 43.5 L34.5 45.5 L33.8 37.5 L32 35.5 L30.2 37.5 Z" fill="#B45309" />
      <path d="M30.2 37.5 L32 35.5 L33.8 37.5 L33.2 29.5 L32 27 L30.8 29.5 Z" fill="#D97706" />

      {/* Date clusters */}
      <circle cx="28" cy="29" r="2.2" fill="#F59E0B" />
      <circle cx="26.5" cy="31.2" r="1.8" fill="#D97706" />
      <circle cx="36" cy="29" r="2.2" fill="#F59E0B" />
      <circle cx="37.5" cy="31.2" r="1.8" fill="#D97706" />

      {/* Frond canopy */}
      <path d="M32 26 C30.8 16.5 31.2 8.5 32 3 C32.8 8.5 33.2 16.5 32 26 Z" fill="#10B981" />
      <path d="M32 26 C26 15.5 17.5 8.5 11 6.5 C17.5 13.5 25 20 32 26 Z" fill="#059669" />
      <path d="M32 26 C38 15.5 46.5 8.5 53 6.5 C46.5 13.5 39 20 32 26 Z" fill="#10B981" />
      <path d="M32 26 C22.5 18 11.5 14 3.5 15 C11.5 20.2 22 24 32 26 Z" fill="#047857" />
      <path d="M32 26 C41.5 18 52.5 14 60.5 15 C52.5 20.2 42 24 32 26 Z" fill="#059669" />
      <path d="M32 26 C21.5 21.5 10.5 22.5 2.5 27.5 C11 28.5 22 27.2 32 26 Z" fill="#065F46" />
      <path d="M32 26 C42.5 21.5 53.5 22.5 61.5 27.5 C53 28.5 42 27.2 32 26 Z" fill="#047857" />
      <path d="M32 26 C22 24.5 13.5 30 6.5 40 C14 36.5 23 31.5 32 26 Z" fill="#047857" />
      <path d="M32 26 C42 24.5 50.5 30 57.5 40 C50 36.5 41 31.5 32 26 Z" fill="#065F46" />
    </svg>
  );
}

export function PalmMark({ className = "", size = 32 }: { className?: string; size?: number }) {
  return <PalmTreeMark className={className} size={size} />;
}

// ─── PalmTreeReward Header Widget ───────────────────────────────────────────

export function PalmTreeReward({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const { today } = summary;
  const goldenCount = today.goldenLeafCount ?? today.leafCount;
  const greenCount = today.greenLeafCount ?? today.extraLeafCount;

  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 dark:bg-amber-500/10"
      role="img"
      aria-label={
        language === "ar"
          ? `النخيل: ${formatNumerals(summary.lifetimePalms, language)}، أوراق ذهبية: ${formatNumerals(goldenCount, language)}، أوراق خضراء: ${formatNumerals(greenCount, language)}`
          : `Palms: ${summary.lifetimePalms}, Golden: ${goldenCount}, Green: ${greenCount}`
      }
    >
      <div className="flex items-center gap-1">
        <PalmTreeMark size={22} />
        <span className="text-[0.875rem] font-extrabold text-amber-500">
          {formatNumerals(summary.lifetimePalms, language)}
        </span>
      </div>
      <span className="h-3 w-px bg-amber-500/30" />
      <div className="flex items-center gap-1">
        <GoldenLeafMark size={16} filled />
        <span className="text-[0.875rem] font-bold text-amber-600 dark:text-amber-400">
          {formatNumerals(goldenCount, language)}
        </span>
      </div>
      <span className="h-3 w-px bg-amber-500/30" />
      <div className="flex items-center gap-1">
        <GreenLeafMark size={16} filled />
        <span className="text-[0.875rem] font-bold text-emerald-600 dark:text-emerald-400">
          {formatNumerals(greenCount, language)}
        </span>
      </div>
    </div>
  );
}

// ─── TodayRoutineGarden (Garden Screen View) ───────────────────────────────────

export function TodayRoutineGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month" | "year">("day");
  const [dayOffset, setDayOffset] = useState(0);

  const isArabic = language === "ar";
  const { today } = summary;
  const goldenCount = today.goldenLeafCount ?? today.leafCount;
  const greenCount = today.greenLeafCount ?? today.extraLeafCount;
  const totalPalms = summary.lifetimePalms;

  const displayDate = new Date();
  displayDate.setDate(displayDate.getDate() + dayOffset);

  return (
    <section className="mb-6 rounded-3xl border border-border/80 bg-card p-5 shadow-xl transition-all dark:border-white/10 dark:bg-[#18181B]">
      {/* Title & Subtitle Header */}
      <div className="mb-4 text-center">
        <h2 className="text-[1.25rem] font-extrabold text-foreground dark:text-white">
          {isArabic ? "حديقتي" : "My Garden"}
        </h2>
        <p className="mt-0.5 text-[0.8125rem] font-medium text-muted-foreground">
          {isArabic ? "اسقِ حديقتك الروحية بأذكارك اليومية" : "Nurture your spiritual garden with daily azkar"}
        </p>
      </div>

      {/* Top View Switcher Tabs (Day | Week | Month | Year) */}
      <nav aria-label={isArabic ? "طريقة العرض" : "View mode"} className="mb-5 flex rounded-2xl bg-muted/60 p-1">
        {(["day", "week", "month", "year"] as const).map((tab) => {
          const isActive = activeTab === tab;
          const labels = {
            day: isArabic ? "يوم" : "Day",
            week: isArabic ? "أسبوع" : "Week",
            month: isArabic ? "شهر" : "Month",
            year: isArabic ? "سنة" : "Year",
          };

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              aria-current={isActive ? "page" : undefined}
              className={`flex-1 rounded-xl py-2 text-[0.875rem] font-extrabold transition-all active:scale-[0.98] ${
                isActive
                  ? "bg-amber-500 text-amber-950 shadow-md dark:bg-amber-500 dark:text-amber-950"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </nav>

      {/* Date Navigation Subtitle Bar */}
      <div className="mb-5 flex items-center justify-between rounded-xl bg-background/80 px-3 py-2 border border-border/60">
        <button
          type="button"
          onClick={() =>
            setDayOffset(
              (prev) => prev - (activeTab === "week" ? 7 : activeTab === "month" ? 30 : activeTab === "year" ? 365 : 1),
            )
          }
          aria-label={isArabic ? "السابق" : "Previous"}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors"
        >
          {isArabic ? "›" : "‹"}
        </button>
        <span className="text-[0.875rem] font-bold text-foreground" data-testid="garden-view-date">
          {activeTab === "day"
            ? `${isArabic ? "اليوم" : "Today"} ${formatHijriDate(displayDate, language)}`
            : activeTab === "week"
              ? isArabic
                ? "الأسبوع الحالي"
                : "Current Week"
              : activeTab === "month"
                ? isArabic
                  ? "الشهر الحالي"
                  : "Current Month"
                : `${formatNumerals(1447, language)} ${isArabic ? "هـ" : "AH"}`}
        </span>
        <button
          type="button"
          onClick={() =>
            setDayOffset((prev) =>
              Math.min(
                0,
                prev + (activeTab === "week" ? 7 : activeTab === "month" ? 30 : activeTab === "year" ? 365 : 1),
              ),
            )
          }
          disabled={dayOffset >= 0}
          aria-label={isArabic ? "التالي" : "Next"}
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors disabled:opacity-30"
        >
          {isArabic ? "‹" : "›"}
        </button>
      </div>

      {/* Summary Badge Row */}
      <div className="mb-6 flex items-center justify-around rounded-2xl border border-amber-500/30 bg-amber-500/5 py-3 px-4 dark:bg-amber-500/10">
        <div className="flex items-center gap-2">
          <PalmTreeMark size={26} />
          <span className="text-[1.125rem] font-black text-amber-500">{formatNumerals(totalPalms, language)}</span>
        </div>
        <span className="h-6 w-px bg-amber-500/30" />
        <div className="flex items-center gap-2">
          <GoldenLeafMark size={22} filled />
          <span className="text-[1.125rem] font-black text-amber-600 dark:text-amber-400">
            {formatNumerals(goldenCount, language)}
          </span>
        </div>
        <span className="h-6 w-px bg-amber-500/30" />
        <div className="flex items-center gap-2">
          <GreenLeafMark size={22} filled />
          <span className="text-[1.125rem] font-black text-emerald-600 dark:text-emerald-400">
            {formatNumerals(greenCount, language)}
          </span>
        </div>
      </div>

      {/* View Content Rendering */}
      {activeTab === "day" && (
        <div className="flex flex-col items-center py-2 text-center">
          {/* Circular Ring Container with Central Palm & Golden Leaves */}
          <div className="relative mb-6 flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 border-amber-500/80 bg-amber-500/5 shadow-inner dark:bg-amber-500/10">
            {/* Palm Tree */}
            <PalmTreeMark size={60} className="transition-transform duration-500 hover:scale-105" />

            {/* 3 Golden Leaves Positioned Right Under the Palm Tree */}
            <div className="mt-1 flex items-center justify-center gap-2">
              {[0, 1, 2].map((idx) => (
                <GoldenLeafMark
                  key={idx}
                  size={24}
                  filled={goldenCount > idx}
                  className="transition-all duration-300"
                />
              ))}
            </div>

            {/* Bottom Pill Badge */}
            <div className="absolute -bottom-3 rounded-full bg-amber-950 px-3.5 py-1 text-[0.75rem] font-extrabold text-amber-400 border border-amber-500/50 shadow-md dark:bg-black dark:text-amber-300">
              {formatNumerals(goldenCount, language)} {isArabic ? "من" : "of"} {formatNumerals(3, language)}{" "}
              {isArabic ? "مكتمل" : "complete"}
            </div>
          </div>

          <h3 className="mt-2 text-[1.125rem] font-black text-foreground dark:text-white">
            {isArabic ? "التحصين اليومي" : "Daily Protection"}
          </h3>
          <p className="mt-1 text-[0.875rem] font-medium text-muted-foreground">
            {isArabic ? "حفظكم الله. تقبل الله منا ومنكم" : "May Allah protect you. May Allah accept from us and you"}
          </p>
        </div>
      )}

      {activeTab === "week" && (
        <div className="space-y-2.5">
          <SevenDayGarden summary={summary} language={language} />
        </div>
      )}

      {activeTab === "month" && (
        <div className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <h3 className="mb-3 text-[0.9375rem] font-bold text-foreground">
            {isArabic ? "إنجاز الشهر الحالي" : "Current Month Achievement"}
          </h3>
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {summary.days.map((day) => (
              <div
                key={day.dayKey}
                className={`flex h-10 flex-col items-center justify-center rounded-lg border text-[0.6875rem] font-extrabold ${
                  day.isPalm
                    ? "border-amber-500/80 bg-amber-500/20 text-amber-500"
                    : day.leafCount > 0
                      ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-500"
                      : "border-border/60 bg-muted/30 text-muted-foreground"
                }`}
              >
                {day.isPalm ? "🌴" : day.leafCount > 0 ? "🌿" : "•"}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "year" && (
        <div className="rounded-2xl border border-border/80 bg-background/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[0.9375rem] font-bold text-foreground">
              {isArabic ? "خريطة واحة العام" : "Year Oasis Heatmap"}
            </h3>
            <span className="text-[0.8125rem] font-bold text-amber-500">
              {formatNumerals(247, language)} {isArabic ? "نخلة كاملة" : "Full Palms"}
            </span>
          </div>

          <div className="space-y-2">
            {[
              "محرم",
              "صفر",
              "ربيع الأول",
              "ربيع الآخر",
              "جمادى الأولى",
              "جمادى الآخرة",
              "رجب",
              "شعبان",
              "رمضان",
              "شوال",
              "ذو القعدة",
              "ذو الحجة",
            ].map((monthName, idx) => (
              <div key={monthName} className="flex items-center gap-2 text-[0.75rem]">
                <span className="w-20 text-start font-bold text-muted-foreground">
                  {isArabic ? monthName : `Month ${idx + 1}`}
                </span>
                <div className="flex flex-1 items-center gap-1">
                  {Array.from({ length: 15 }, (_, dIdx) => {
                    const isFull = (idx + dIdx) % 3 === 0;
                    return (
                      <div
                        key={dIdx}
                        className={`h-3 flex-1 rounded-sm ${
                          isFull
                            ? "bg-emerald-500 dark:bg-emerald-400"
                            : (idx + dIdx) % 2 === 0
                              ? "bg-emerald-500/40 dark:bg-emerald-400/30"
                              : "bg-muted/40"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ─── SevenDayGarden ────────────────────────────────────────────────────────────

export function SevenDayGarden({ summary, language }: { summary: GardenSummary; language: AppLanguage }) {
  const isArabic = language === "ar";
  const locale = isArabic ? "ar-EG" : "en-US";

  return (
    <div className="space-y-2" aria-label={isArabic ? "سجل الأسبوع" : "Weekly Record"}>
      {summary.days.map((day) => {
        const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(day.date);
        const golden = day.goldenLeafCount ?? day.leafCount;
        const green = day.greenLeafCount ?? day.extraLeafCount;
        const palm = day.isPalm ? 1 : 0;

        return (
          <div
            key={day.dayKey}
            data-testid={`garden-day-${day.dayKey}`}
            className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-4 py-2.5"
          >
            <span className="text-[0.875rem] font-bold text-foreground">{weekday}</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[0.75rem] font-extrabold text-amber-500">
                <PalmTreeMark size={16} />
                <span>{formatNumerals(palm, language)}</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-[0.75rem] font-extrabold text-amber-600 dark:text-amber-400">
                <GoldenLeafMark size={14} filled />
                <span>{formatNumerals(golden, language)}</span>
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-[0.75rem] font-extrabold text-emerald-600 dark:text-emerald-400">
                <GreenLeafMark size={14} filled />
                <span>{formatNumerals(green, language)}</span>
              </div>
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
            total: formatNumerals(CATEGORIES.length, language),
          })}
        </span>
      </span>
    </div>
  );
}
