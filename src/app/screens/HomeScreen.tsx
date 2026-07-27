import { ProgressBar } from "../components/ProgressBar";
import { TodayRoutineGarden, PalmTreeReward } from "../components/RoutineGarden";
import { getCategoryTotal } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { formatHijriDateWithTime, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { getGardenSummary } from "../progress";
import type { AppLanguage, CategoryId, DailyCollectionCompletion } from "../types";

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
    };
  }
  if (hour >= 15.5 && hour < 20) {
    return {
      categoryId: "evening" as CategoryId,
      titleArabic: "حان وقت أذكار المساء",
      titleEnglish: "Time for Evening Azkar",
      descArabic: "أذكار المساء تُقرأ بعد صلاة العصر حتى المغرب",
      descEnglish: "Evening Azkar are read after Asr prayer until Maghrib",
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    titleArabic: "حان وقت أذكار النوم",
    titleEnglish: "Time for Before Sleep Azkar",
    descArabic: "أذكار النوم تُقرأ بعد صلاة العشاء وقبل النوم",
    descEnglish: "Before Sleep Azkar are read after Isha prayer and before sleep",
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
      {/* Accessibility: visually-hidden page title for screen readers */}
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Top Header Bar — clean edge-to-edge Elevate style header */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between px-0 pt-0 pb-1">
        {/* Date, Weekday & Live Time */}
        <div className="min-w-0 flex-1 text-start">
          <p className="text-[0.875rem] font-bold text-muted-foreground" data-testid="hijri-date">
            {formatHijriDateWithTime(now, language)}
          </p>
        </div>
        {/* Palm Tree Reward Widget */}
        <PalmTreeReward summary={gardenSummary} language={language} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-1">
        {/* Clean Hero Zikr Reminder Card */}
        <section aria-labelledby="current-zikr-heading" className="mb-6">
          <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 text-card-foreground shadow-xl transition-all dark:border-white/10 dark:bg-[#18181B]">
            {/* Card Content */}
            <div className="flex flex-col justify-between text-start">
              <div>
                <h2
                  id="current-zikr-heading"
                  className="text-[1.375rem] font-black tracking-wide text-foreground dark:text-white"
                >
                  {isArabic ? reminderInfo.titleArabic : reminderInfo.titleEnglish}
                </h2>
                <p className="mt-1.5 text-[0.875rem] font-semibold leading-relaxed text-muted-foreground">
                  {isArabic ? reminderInfo.descArabic : reminderInfo.descEnglish}
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {doneCount > 0 && (
                  <div>
                    <ProgressBar
                      value={doneCount}
                      max={totalCount}
                      height={6}
                      trackColor="var(--muted)"
                      direction={direction}
                      aria-label={
                        isArabic ? `تقدم ${reminderCategory.nameArabic}` : `${reminderCategory.name} progress`
                      }
                    />
                    <span className="mt-2 block text-[0.75rem] font-extrabold text-foreground dark:text-slate-200">
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
                  className="interactive-elem group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[0.9375rem] font-black active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all shadow-md self-start"
                  style={{ color: "#020617", backgroundColor: "#F59E0B" }}
                >
                  <span style={{ color: "#020617" }}>{ctaLabel}</span>
                  <span
                    className="text-[1.125rem] leading-none transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                    style={{ color: "#020617" }}
                    aria-hidden="true"
                  >
                    {direction === "rtl" ? "←" : "→"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Leaves & Progress Garden (Daily Progress) */}
        {quietProgressEnabled && <TodayRoutineGarden summary={gardenSummary} language={language} hideTabs={true} />}
      </div>
    </ScreenContainer>
  );
}
