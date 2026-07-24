import { Fragment } from "react";
import { ChevronNext } from "../components/icons";
import { CatIcon } from "../components/CatIcon";
import { ProgressBar } from "../components/ProgressBar";
import { TodayRoutineGarden, LeafMark, PalmMark } from "../components/RoutineGarden";
import { getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatHijriDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

import morningScene from "../../assets/home/morning-scene.png";
import eveningScene from "../../assets/home/evening-scene.png";
import beforeSleepScene from "../../assets/home/before-sleep-scene.png";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date): CategoryId {
  const hour = date.getHours();
  if (hour >= 20 || hour < 4) {
    return "before_sleep";
  }
  return hour >= 15 ? "evening" : "morning";
}

function getNextIndex(completed: Set<number>, totalCount: number) {
  return Array.from({ length: totalCount }, (_, index) => index).find((index) => !completed.has(index)) ?? 0;
}

export function getTimeOfDayZikr(now: Date = new Date()) {
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour >= 4 && hour < 15.5) {
    return {
      categoryId: "morning" as CategoryId,
      titleArabic: "حان وقت أذكار الصباح",
      titleEnglish: "Time for Morning Azkar",
      descArabic: "أذكار الصباح تُقرأ بعد صلاة الفجر حتى طلوع الشمس",
      descEnglish: "Morning Azkar are read after Fajr prayer until sunrise",
      bgImage: morningScene,
    };
  }
  if (hour >= 15.5 && hour < 20) {
    return {
      categoryId: "evening" as CategoryId,
      titleArabic: "حان وقت أذكار المساء",
      titleEnglish: "Time for Evening Azkar",
      descArabic: "أذكار المساء تُقرأ بعد صلاة العصر حتى المغرب",
      descEnglish: "Evening Azkar are read after Asr prayer until Maghrib",
      bgImage: eveningScene,
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    titleArabic: "حان وقت أذكار النوم",
    titleEnglish: "Time for Before Sleep Azkar",
    descArabic: "أذكار النوم تُقرأ بعد صلاة العشاء وقبل النوم",
    descEnglish: "Before Sleep Azkar are read after Isha prayer and before sleep",
    bgImage: beforeSleepScene,
  };
}

/** Chooses one calm, useful next action without blocking access to any collection. */
export function getHomeAction(completed: Record<CategoryId, Set<number>>, now: Date = new Date()): HomeAction {
  const suggestedId = suggestedCategoryId(now);
  const categoryIds = [suggestedId, ...CATEGORIES.map((category) => category.id)].filter(
    (id, index, values) => values.indexOf(id) === index,
  ) as CategoryId[];

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getNextIndex(completed[categoryId], totalCount),
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const done = completed[categoryId]?.size ?? 0;
    const totalCount = getCategoryTotal(categoryId);
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = getCategoryTotal(suggestedId);
  return { categoryId: suggestedId, index: 0, completedCount: totalCount, totalCount, kind: "again" };
}

export function HomeScreen({
  completed,
  dailyCompletions,
  quietProgressEnabled,
  progressDayStartHour,
  onCategory,
  onResume,
  onRepeat,
  language,
  direction,
}: {
  completed: Record<CategoryId, Set<number>>;
  dailyCompletions: DailyCollectionCompletion[];
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  onCategory: (category: CategoryId) => void;
  onResume: (category: CategoryId, index: number) => void;
  onRepeat: (category: CategoryId) => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
}) {
  const isArabic = language === "ar";
  const now = new Date();
  const gardenSummary = getGardenSummary(dailyCompletions, now, progressDayStartHour);

  // Time-of-day Zikr Reminder
  const reminderInfo = getTimeOfDayZikr(now);
  const reminderCategory = CATEGORIES.find((category) => category.id === reminderInfo.categoryId)!;
  const doneCount = completed[reminderInfo.categoryId]?.size ?? 0;
  const totalCount = getCategoryTotal(reminderInfo.categoryId);
  const nextIdx = getNextIndex(completed[reminderInfo.categoryId] ?? new Set(), totalCount);

  let actionKind: HomeActionKind = "start";
  if (doneCount === totalCount) {
    actionKind = "again";
  } else if (doneCount > 0) {
    actionKind = "resume";
  }

  const ctaLabel = isArabic
    ? actionKind === "again"
      ? `اقرأ أذكار ${reminderCategory.nameArabic.replace("أذكار ", "")} مرة أخرى`
      : actionKind === "resume"
        ? `تابع ${reminderCategory.nameArabic}`
        : `ابدأ ${reminderCategory.nameArabic}`
    : actionKind === "again"
      ? `Read ${reminderCategory.name} Again`
      : actionKind === "resume"
        ? `Resume ${reminderCategory.name}`
        : `Start ${reminderCategory.name}`;

  return (
    <ScreenContainer dir={direction} className="px-page">
      {/* Top Header Bar matching Screenshot 1 */}
      <header className="flex h-14 shrink-0 items-center justify-between px-1">
        {/* Left: Today's Leaves Count */}
        <div
          className="flex items-center gap-1.5 font-extrabold text-emerald-500"
          title={isArabic ? "أوراق اليوم" : "Today's Leaves"}
          aria-label={
            isArabic
              ? `أوراق اليوم: ${gardenSummary.today.leafCount}`
              : `Today's leaves: ${gardenSummary.today.leafCount}`
          }
        >
          <span className="text-[1.125rem]">{formatNumerals(gardenSummary.today.leafCount, language)}</span>
          <LeafMark size={22} filled={gardenSummary.today.leafCount > 0} className="text-emerald-500" />
        </div>

        {/* Center: Title */}
        <h1 className="text-[1.25rem] font-extrabold text-foreground tracking-wide">{t(language, "home.title")}</h1>

        {/* Right: Palms Earned Count */}
        <div
          className="flex items-center gap-1.5 font-extrabold text-emerald-500"
          title={isArabic ? "النخيل المكتسبة" : "Palms Earned"}
          aria-label={
            isArabic
              ? `النخيل المكتسبة: ${gardenSummary.lifetimePalms}`
              : `Palms earned: ${gardenSummary.lifetimePalms}`
          }
        >
          <span className="text-[1.125rem]">{formatNumerals(gardenSummary.lifetimePalms, language)}</span>
          <PalmMark size={24} className="text-emerald-500" />
        </div>
      </header>

      {/* Hijri Date Subtitle */}
      <div className="pb-3 text-center">
        <p className="text-[0.875rem] font-semibold text-muted-foreground" data-testid="hijri-date">
          {formatHijriDate(now, language)}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-1">
        {/* Current Zikr Reminder Card */}
        <section aria-labelledby="current-zikr-heading" className="mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#18181B] shadow-xl transition-all">
            {/* Background Scene Image */}
            <img
              src={reminderInfo.bgImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-bottom opacity-75 pointer-events-none"
            />

            {/* Gradient Overlay for AAA Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/35 pointer-events-none" />

            {/* Card Content */}
            <div className="relative z-10 flex min-h-[170px] flex-col justify-between p-5 text-start">
              <div>
                <h2
                  id="current-zikr-heading"
                  className="text-[1.25rem] font-extrabold text-white tracking-wide"
                  style={{ color: "#FFFFFF" }}
                >
                  {isArabic ? reminderInfo.titleArabic : reminderInfo.titleEnglish}
                </h2>
                <p
                  className="mt-1 text-[0.875rem] font-medium text-amber-100 leading-relaxed"
                  style={{ color: "#FEF3C7" }}
                >
                  {isArabic ? reminderInfo.descArabic : reminderInfo.descEnglish}
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {doneCount > 0 && (
                  <div>
                    <ProgressBar
                      value={doneCount}
                      max={totalCount}
                      height={5}
                      trackColor="rgba(255, 255, 255, 0.25)"
                      direction={direction}
                      aria-label={
                        isArabic ? `تقدم ${reminderCategory.nameArabic}` : `${reminderCategory.name} progress`
                      }
                    />
                    <span className="mt-1.5 block text-[0.75rem] font-semibold text-white">
                      {formatNumerals(doneCount, language)} {isArabic ? "من" : "of"}{" "}
                      {formatNumerals(totalCount, language)} {t(language, "home.complete")}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  data-testid="home-primary-cta"
                  onClick={() => {
                    if (actionKind === "again") {
                      onRepeat(reminderInfo.categoryId);
                    } else {
                      onResume(reminderInfo.categoryId, nextIdx);
                    }
                  }}
                  aria-label={`${ctaLabel}. ${formatNumerals(doneCount, language)} ${isArabic ? "من" : "of"} ${formatNumerals(totalCount, language)}`}
                  className="interactive-elem group inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 self-start rounded-lg px-3 py-2 text-[0.9375rem] font-extrabold text-[#FACC15] hover:text-amber-300 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors"
                >
                  <span>{ctaLabel}</span>
                  <span
                    className="text-[1.125rem] leading-none transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    aria-hidden="true"
                  >
                    {direction === "rtl" ? "←" : "→"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Leaves & Progress Garden (tracked for 3 main azkar groups) */}
        {quietProgressEnabled && <TodayRoutineGarden summary={gardenSummary} language={language} />}

        {/* Collections List */}
        <section aria-labelledby="collections-heading" className="mb-6">
          <h2 id="collections-heading" className="mb-3 text-[0.9375rem] font-bold text-foreground">
            {t(language, "home.collections")}
          </h2>
          <div className="space-y-3">
            {CATEGORIES.map((category) => {
              const done = completed[category.id]?.size ?? 0;
              const totalCount = getCategoryTotal(category.id);

              return (
                <Fragment key={category.id}>
                  <button
                    type="button"
                    onClick={() => onCategory(category.id)}
                    dir={direction}
                    data-testid={`category-card-${category.id}`}
                    className="flex min-h-[96px] w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    aria-label={
                      isArabic
                        ? `${category.nameArabic}، ${formatNumerals(done, language)} من ${formatNumerals(totalCount, language)} مكتملة`
                        : `${category.name}, ${done} of ${totalCount} complete`
                    }
                  >
                    <span
                      data-slot="category-icon"
                      className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full border border-border bg-background"
                      aria-hidden="true"
                    >
                      <CatIcon type={category.icon} size={28} color="var(--primary)" />
                    </span>

                    <span data-slot="category-copy" className="flex min-w-0 flex-1 flex-col justify-center gap-3">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[1.125rem] font-bold text-foreground">
                          {isArabic ? category.nameArabic : category.name}
                        </span>
                        <span
                          className="whitespace-nowrap text-[0.8125rem] font-medium text-muted-foreground"
                          dir={isArabic ? "rtl" : "ltr"}
                        >
                          {formatNumerals(done, language)} {isArabic ? "من" : "of"}{" "}
                          {formatNumerals(totalCount, language)}
                        </span>
                      </span>
                      <ProgressBar
                        value={done}
                        max={totalCount}
                        height={6}
                        trackColor="color-mix(in srgb, var(--primary) 15%, transparent)"
                        direction={direction}
                        aria-label={isArabic ? `تقدم ${category.nameArabic}` : `${category.name} progress`}
                      />
                    </span>

                    <ChevronNext
                      size={20}
                      aria-hidden="true"
                      data-slot="category-chevron"
                      className="shrink-0 text-muted-foreground"
                    />
                  </button>
                </Fragment>
              );
            })}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
