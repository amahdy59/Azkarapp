/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { useState, useEffect, useMemo } from "react";
import { Sun, Calendar, Zap, Clock, ArrowLeft, ArrowRight } from "../components/icons";
import { TasbeehCounterButton } from "../components/TasbeehCounterButton";
import { TodayRoutineGarden, GoldenPalmMark, PalmTreeMark } from "../components/RoutineGarden";
import { TranquilityCompletionCard } from "../components/TranquilityCompletionCard";
import { estimateCompletionMinutes, getAzkarForMode, getRoutineProgress, isRoutineCategory } from "../content/azkar";
import { CATEGORIES } from "../content/categories";
import { getEstimatedPrayerTimes, getNextPrayerCountdown, timeToMinutes } from "../content/prayerTimes";
import { triggerBackgroundPrayerTimesRefresh } from "../content/prayerCalculation";
import { formatDisplayDate, formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ScreenContainer } from "../components/ScreenContainer";
import { SegmentedControl } from "../components/SegmentedControl";
import { StatCard, CompactActionCard } from "../components/StatCard";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { getFirstIncompleteZikrIndex, getGardenSummary, MAIN_CATEGORY_IDS } from "../progress";
import type {
  AppLanguage,
  CategoryId,
  DailyCollectionCompletion,
  LocationSettings,
  RoutineCategoryId,
  RoutineMode,
} from "../types";

type HomeActionKind = "resume" | "start" | "again";

export type HomeAction = {
  categoryId: CategoryId;
  index: number;
  completedCount: number;
  totalCount: number;
  kind: HomeActionKind;
};

function suggestedCategoryId(date: Date, location?: LocationSettings): CategoryId {
  return getTimeOfDayZikr(date, "en", location).categoryId;
}

export function getTimeOfDayZikr(now: Date = new Date(), language: AppLanguage = "ar", location?: LocationSettings) {
  const prayerTimes = getEstimatedPrayerTimes(now, location);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const fajrMinutes = timeToMinutes(prayerTimes.fajr);
  const asrMinutes = timeToMinutes(prayerTimes.asr);
  const ishaMinutes = timeToMinutes(prayerTimes.isha);

  if (currentMinutes >= fajrMinutes && currentMinutes < asrMinutes) {
    return {
      categoryId: "morning" as CategoryId,
      title: t(language, "home.morningTitle"),
      desc: t(language, "home.morningDesc"),
    };
  }
  if (currentMinutes >= asrMinutes && currentMinutes < ishaMinutes) {
    return {
      categoryId: "evening" as CategoryId,
      title: t(language, "home.eveningTitle"),
      desc: t(language, "home.eveningDesc"),
    };
  }
  return {
    categoryId: "before_sleep" as CategoryId,
    title: t(language, "home.beforeSleepTitle"),
    desc: t(language, "home.beforeSleepDesc"),
  };
}

export function getHomeAction(
  completed: Record<CategoryId, Set<string>>,
  now: Date = new Date(),
  location?: LocationSettings,
  routineModes: Record<RoutineCategoryId, RoutineMode> = {
    morning: "complete",
    evening: "complete",
    before_sleep: "complete",
    after_prayer: "complete",
  },
): HomeAction {
  const suggestedId = suggestedCategoryId(now, location);
  const categoryIds = [
    suggestedId,
    ...CATEGORIES.filter((category) => category.id !== "comprehensive_duas" && category.id !== "friday_kahf").map(
      (category) => category.id,
    ),
  ].filter((id, index, values) => values.indexOf(id) === index) as CategoryId[];

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done > 0 && done < totalCount) {
      return {
        categoryId,
        index: getFirstIncompleteZikrIndex(visibleAzkar, completed[categoryId]) ?? 0,
        completedCount: done,
        totalCount,
        kind: "resume",
      };
    }
  }

  for (const categoryId of categoryIds) {
    const mode = isRoutineCategory(categoryId) ? routineModes[categoryId] : "complete";
    const visibleAzkar = getAzkarForMode(categoryId, mode);
    const progress = isRoutineCategory(categoryId)
      ? getRoutineProgress(categoryId, mode, completed[categoryId] ?? [])
      : {
          done: visibleAzkar.filter((zikr) => completed[categoryId]?.has(zikr.id)).length,
          total: visibleAzkar.length,
        };
    const done = progress.done;
    const totalCount = progress.total;
    if (done === 0) {
      return { categoryId, index: 0, completedCount: done, totalCount, kind: "start" };
    }
  }

  const totalCount = isRoutineCategory(suggestedId)
    ? getRoutineProgress(suggestedId, routineModes[suggestedId], completed[suggestedId] ?? []).total
    : getAzkarForMode(suggestedId, "complete").length;
  return { categoryId: suggestedId, index: 0, completedCount: totalCount, totalCount, kind: "again" };
}

export function HomeScreen({
  completed,
  dailyCompletions,
  quietProgressEnabled,
  progressDayStartHour,
  language,
  direction,
  calendarType = "hijri",
  locationSettings,
  onResume,
  onRepeat,
  onOpenFridayMode,
  onOpenProgress: _onOpenProgress,
  routineModes,
  onSetRoutineMode,
  onOpenCustomCounter,
}: {
  completed: Record<CategoryId, Set<string>>;
  dailyCompletions: DailyCollectionCompletion[];
  language: AppLanguage;
  direction: "ltr" | "rtl";
  quietProgressEnabled: boolean;
  progressDayStartHour: number;
  calendarType?: "hijri" | "gregorian";
  locationSettings?: LocationSettings;
  onResume: (category: CategoryId) => void;
  onRepeat: (category: CategoryId) => void;
  onOpenFridayMode?: () => void;
  onOpenProgress?: () => void;
  routineModes: Record<RoutineCategoryId, RoutineMode>;
  onSetRoutineMode?: (categoryId: RoutineCategoryId, mode: RoutineMode) => void;
  onOpenCustomCounter?: () => void;
}) {
  const isArabic = language === "ar";
  const [now, setNow] = useState(() => new Date());
  const [, setPrayerTimesRevision] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const updateAtNextMinute = () => {
      setNow(new Date());
      timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    };
    timer = setTimeout(updateAtNextMinute, 60_050 - (Date.now() % 60_000));
    return () => clearTimeout(timer);
  }, []);

  const prayerDateKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

  useEffect(() => {
    let active = true;
    triggerBackgroundPrayerTimesRefresh(new Date(), locationSettings, () => {
      if (active) setPrayerTimesRevision((revision) => revision + 1);
    });
    return () => {
      active = false;
    };
  }, [locationSettings, prayerDateKey]);

  const gardenSummary = useMemo(
    () => getGardenSummary(dailyCompletions, now, progressDayStartHour),
    [dailyCompletions, now, progressDayStartHour],
  );

  const nextPrayerInfo = getNextPrayerCountdown(now, language, locationSettings);

  const reminderInfo = useMemo(
    () => getTimeOfDayZikr(now, language, locationSettings),
    [now, language, locationSettings],
  );
  const reminderCategory = CATEGORIES.find((c) => c.id === reminderInfo.categoryId)!;
  const doneSet = completed[reminderInfo.categoryId] ?? new Set<string>();

  const reminderMode = isRoutineCategory(reminderInfo.categoryId) ? routineModes[reminderInfo.categoryId] : "complete";
  const visibleReminderAzkar = getAzkarForMode(reminderInfo.categoryId, reminderMode);
  const reminderProgress = isRoutineCategory(reminderInfo.categoryId)
    ? getRoutineProgress(reminderInfo.categoryId, reminderMode, doneSet)
    : {
        done: visibleReminderAzkar.filter((zikr) => doneSet.has(zikr.id)).length,
        total: visibleReminderAzkar.length,
      };
  const totalCount = reminderProgress.total;
  const doneCount = reminderProgress.done;
  const isComplete = doneCount >= totalCount && totalCount > 0;

  const estimatedMinutes = useMemo(() => estimateCompletionMinutes(visibleReminderAzkar), [visibleReminderAzkar]);

  const actionKind: "start" | "continue" | "again" = doneCount === 0 ? "start" : isComplete ? "again" : "continue";

  const ctaLabel =
    actionKind === "start"
      ? t(language, "home.startGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
      : actionKind === "again"
        ? t(language, "home.readGroupAgain", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name })
        : t(language, "home.continueGroup", { name: isArabic ? reminderCategory.nameArabic : reminderCategory.name });

  const streakDays = gardenSummary.currentUsageStreak ?? gardenSummary.activeDaysLast7 ?? 0;
  const activeDaysThisWeek = gardenSummary.activeDaysLast7 ?? 0;
  const totalDays = gardenSummary.lifetimePalms * 3 + gardenSummary.today.goldenLeafCount;

  return (
    <ScreenContainer
      dir={direction}
      className="px-0 relative overflow-hidden flex flex-col"
      screenName={t(language, "home.title")}
    >
      <h1 className="sr-only">{t(language, "home.title")}</h1>

      {/* Atmospheric Background Sky Image & Backdrop Overlay */}
      <TimeOfDayBackground categoryId={reminderInfo.categoryId} />

      {/* Absolute Header floating above everything for scrolling translucency */}
      <div className="absolute top-0 inset-x-0 z-30 px-page pt-2 pb-2 pointer-events-none">
        <header className="flex w-full flex-col pointer-events-auto" dir={direction}>
          <div
            className="flex min-h-[48px] w-full shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-semibold"
            dir="auto"
            aria-label={
              isArabic
                ? `أشجار النخيل: ${formatNumerals(gardenSummary.lifetimePalms, language)}، أوراق اليوم: ${formatNumerals(gardenSummary.today.goldenLeafCount, language)} من ${formatNumerals(MAIN_CATEGORY_IDS.length, language)}، السلسلة اليومية: ${formatNumerals(streakDays, language)} أيام`
                : `Palms: ${gardenSummary.lifetimePalms}, Today's leaves: ${gardenSummary.today.goldenLeafCount} of ${MAIN_CATEGORY_IDS.length}, Daily streak: ${streakDays} days`
            }
          >
            {/* Start side: Streak & Palms Gamification Badges */}
            <div className="flex items-center gap-2.5">
              {/* Streak */}
              <div
                className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[0.8125rem] font-black text-primary backdrop-blur-md shadow-xs"
                title={isArabic ? "السلسلة اليومية" : "Daily Streak"}
              >
                <span>
                  {formatNumerals(streakDays, language)} {isArabic ? "أيام" : "days"}
                </span>
                <Zap className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} aria-hidden="true" />
              </div>

              {/* Palms */}
              <div
                className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[0.8125rem] font-black text-primary backdrop-blur-md shadow-xs"
                title={isArabic ? "أشجار النخيل" : "Palms"}
              >
                <PalmTreeMark
                  size={16}
                  filled={gardenSummary.lifetimePalms > 0}
                  className={gardenSummary.lifetimePalms > 0 ? "text-primary" : "text-white/40"}
                />
                <span>
                  {formatNumerals(gardenSummary.lifetimePalms, language)} {isArabic ? "نخلة" : "palms"}
                </span>
              </div>
            </div>

            {/* End side: Date & Next Prayer info */}
            <div className="flex flex-wrap items-center gap-3 rounded-full border border-white/15 bg-black/25 px-3.5 py-1.5 backdrop-blur-md shadow-xs text-white">
              {/* Date */}
              <div data-testid="hijri-date" className="flex items-center gap-2 text-white whitespace-nowrap">
                <Calendar className="h-[15px] w-[15px] shrink-0 text-[#e2a84a]" />
                <span className="text-[0.8125rem] font-medium">{formatDisplayDate(now, language, calendarType)}</span>
              </div>

              <div className="hidden sm:block h-3.5 w-px bg-white/25 shrink-0" />

              {/* Prayer timing */}
              <div data-testid="next-prayer" className="flex items-center gap-2 text-white whitespace-nowrap">
                <Sun className="h-[15px] w-[15px] shrink-0 text-[#e2a84a]" />
                <span className="flex items-center gap-1 text-[0.8125rem] font-medium">
                  <span>{isArabic ? nextPrayerInfo.nameArabic : nextPrayerInfo.nameEnglish}</span>
                  <span dir="ltr">{nextPrayerInfo.formattedCountdown}</span>
                </span>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable Content Area */}
      <main
        tabIndex={0}
        aria-label={t(language, "app.name")}
        className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden px-page pb-24 pt-[76px] outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
      >
        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4 lg:gap-5 w-full items-start">
          {/* Top Row: Hero Zikr Banner (3 cols) & Today's Wird Routine Card (2 cols) */}
          {isComplete ? (
            <div className="lg:col-span-3">
              <TranquilityCompletionCard
                categoryId={reminderInfo.categoryId}
                language={language}
                direction={direction}
                onReview={onRepeat}
              />
            </div>
          ) : (
            <section
              aria-labelledby="current-zikr-heading"
              className="lg:col-span-3 flex flex-col justify-between p-1 md:p-2 transition-all"
            >
              <div className="flex flex-col gap-3 text-start">
                {/* Hero Text & Category Header */}
                <div className="flex w-full flex-col items-start gap-1 px-1">
                  <p
                    className="text-[1.125rem] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                    dir="auto"
                  >
                    {isArabic ? "حان وقت" : "Time for"}
                  </p>
                  <h2
                    id="current-zikr-heading"
                    className="text-3xl md:text-4xl font-black text-primary tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                    dir="auto"
                    style={{ lineHeight: "1.25" }}
                  >
                    {isArabic ? reminderCategory.nameArabic : reminderCategory.name}
                  </h2>
                  <p
                    className="text-[0.875rem] font-bold text-white bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full w-fit mt-1 shadow-sm border border-white/10"
                    dir="auto"
                  >
                    {reminderInfo.desc}
                  </p>
                </div>

                {/* Routine Mode Selector Pill (Abbreviated vs Complete) */}
                <SegmentedControl
                  value={reminderMode}
                  onChange={(mode) => {
                    if (isRoutineCategory(reminderInfo.categoryId)) {
                      onSetRoutineMode?.(reminderInfo.categoryId, mode);
                    }
                  }}
                  direction={direction}
                  aria-label={isArabic ? "وضع الورد" : "Routine mode"}
                  className="flex min-h-[44px] w-full items-center rounded-2xl bg-black/40 p-1 border border-white/15 dark:border-white/10"
                  itemClassName={(selected) =>
                    `flex min-h-[42px] flex-1 items-center justify-center rounded-2xl transition-all duration-200 text-[0.875rem] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      selected ? "bg-primary text-primary-foreground shadow-md" : "text-white/80 hover:text-white"
                    }`
                  }
                  options={[
                    { value: "complete", label: isArabic ? "الكاملة" : "Complete" },
                    { value: "core", label: isArabic ? "المختصرة" : "Abbreviated" },
                  ]}
                />

                {/* Progress Text & Progress Bar */}
                {totalCount > 0 && (
                  <div className="flex flex-col gap-2 w-full mt-1">
                    <div
                      className="flex w-full items-center justify-between text-[0.8125rem] font-bold text-foreground dark:text-white"
                      dir="auto"
                    >
                      <span>
                        {formatNumerals(doneCount, language)} {isArabic ? "من" : "of"}{" "}
                        {formatNumerals(totalCount, language)}
                      </span>
                      <div className="flex items-center gap-1.5 text-muted-foreground dark:text-white/90">
                        <Clock className="h-[14px] w-[14px] text-[#e2a84a]" />
                        <span>
                          {isArabic
                            ? `${formatNumerals(estimatedMinutes, language)} دقائق تقريباً`
                            : `~${estimatedMinutes} mins`}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-black/20 dark:bg-white/20">
                      <div
                        className="h-full w-full rounded-full bg-primary transition-[transform] duration-500 ease-out origin-[--bar-origin]"
                        style={
                          {
                            transform: `scaleX(${Math.min(1, Math.max(0, doneCount / totalCount))})`,
                            "--bar-origin": direction === "rtl" ? "right" : "left",
                          } as React.CSSProperties
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Primary Action Button (Gold Gradient CTA) */}
                <button
                  type="button"
                  data-testid="home-primary-cta"
                  onClick={() => {
                    onResume(reminderInfo.categoryId);
                  }}
                  className="mt-2 flex h-[54px] min-h-[48px] w-full items-center justify-center gap-2.5 rounded-2xl bg-[#e2a84a] text-[1.0625rem] font-black text-slate-950 shadow-lg hover:bg-[#ebd074] transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer group"
                >
                  <span>{ctaLabel}</span>
                  {direction === "rtl" ? (
                    <ArrowLeft size={20} className="shrink-0 transition-transform group-hover:-translate-x-1" />
                  ) : (
                    <ArrowRight size={20} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </div>
            </section>
          )}

          {/* Today's Wird Routine Card ("وردك اليوم") */}
          {quietProgressEnabled && (
            <div className="lg:col-span-2 flex w-full">
              <TodayRoutineGarden
                summary={gardenSummary}
                language={language}
                hideTabs={true}
                calendarType={calendarType}
                dailyCompletions={dailyCompletions}
                onSelectCategory={onResume}
              />
            </div>
          )}

          {/* Middle Row: 4 Compact Stat & Resume Cards (Side-by-side on Desktop & Tablet) */}
          <div className="home-grid-full grid grid-cols-2 md:grid-cols-4 gap-3.5 my-1">
            {/* Card 1: Streak / "سلسلة المتابعة" */}
            <StatCard
              title={isArabic ? "سلسلة المتابعة" : "Streak"}
              icon={<Zap size={18} />}
              value={formatNumerals(streakDays, language)}
              subtitle={isArabic ? "أيام متتالية" : "consecutive days"}
            />

            {/* Card 2: This Week / "هذا الأسبوع" */}
            <StatCard
              title={isArabic ? "هذا الأسبوع" : "This Week"}
              icon={<Calendar size={18} />}
              value={formatNumerals(activeDaysThisWeek, language)}
              subtitle={isArabic ? "من ٧ أيام" : "of 7 days"}
            />

            {/* Card 3: Total Azkar / "إجمالي الأذكار" */}
            <StatCard
              title={isArabic ? "إجمالي الأذكار" : "Total Days"}
              icon={<GoldenPalmMark size={18} />}
              value={formatNumerals(totalDays, language)}
              subtitle={isArabic ? "يوماً" : "days active"}
            />

            {/* Card 4: Resume Reading / "تابع من حيث توقفت" */}
            <CompactActionCard
              title={isArabic ? "تابع من حيث توقفت" : "Resume Reading"}
              icon="📖"
              contentTitle={isArabic ? reminderCategory.nameArabic : reminderCategory.name}
              contentSubtitle={isArabic ? "آخر قراءة: اليوم" : "Last read: Today"}
              actionLabel={isArabic ? "متابعة" : "Resume"}
              onAction={() => onResume(reminderInfo.categoryId)}
            />
          </div>

          {/* Bottom Section: Special Friday Banner ("أذكار يوم الجمعة") */}
          <section className="home-grid-full my-1">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden rounded-3xl border border-border/40 bg-card p-6 shadow-raised transition-all">
              {/* Left Side (RTL Start): Dome Artwork + Titles + Description + CTA */}
              <div className="flex flex-1 flex-col items-start gap-3 text-start z-10">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500 border border-amber-500/30 shadow-xs backdrop-blur-md">
                    <span className="text-2xl">🕌</span>
                  </div>
                  <div>
                    <span className="text-[0.75rem] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {isArabic ? "الأذكار الموصى بها" : "Recommended Azkar"}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-foreground">
                      {isArabic ? "أذكار يوم الجمعة" : "Friday Special Azkar"}
                    </h3>
                  </div>
                </div>

                <p className="text-[0.875rem] font-medium text-muted-foreground max-w-xl">
                  {isArabic
                    ? "أذكار مختارة ليوم الجمعة، تزيد من الأجر وتذكرك بما يهمك."
                    : "Special recommended Azkar for Friday to multiply your rewards and keep you connected."}
                </p>

                {onOpenFridayMode && (
                  <button
                    type="button"
                    onClick={onOpenFridayMode}
                    className="mt-1 flex h-[48px] min-h-[44px] items-center justify-center gap-2 rounded-2xl bg-[#e2a84a] px-6 text-[0.9375rem] font-black text-slate-950 shadow-lg hover:bg-[#ebd074] transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <span>{isArabic ? "عرض الأذكار" : "View Friday Azkar"}</span>
                    {direction === "rtl" ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </button>
                )}
              </div>

              {/* Right Side (RTL End): Virtues Checklist */}
              <div className="flex flex-col gap-2.5 rounded-2xl border border-white/10 bg-black/10 dark:bg-black/40 p-4 z-10 w-full md:w-auto min-w-[270px] text-start shadow-xs backdrop-blur-md">
                <p className="text-[0.8125rem] font-black text-amber-600 dark:text-amber-400">
                  {isArabic ? "من فضائل أذكار الجمعة" : "Virtues of Friday Azkar"}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span className="text-amber-500 font-black">✓</span>
                  <span>{isArabic ? "تكفير الذنوب بين الجمعتين" : "Expiation of sins between Fridays"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span className="text-amber-500 font-black">✓</span>
                  <span>{isArabic ? "رفع الدرجات وزيادة الحسنات" : "Raising ranks and multiplying rewards"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <span className="text-amber-500 font-black">✓</span>
                  <span>{isArabic ? "الذكر نور للقلب والرزق" : "Remembrance brings light to heart & sustenance"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Tasbeeh Counter Button (Full width matching design system tokens) */}
          {onOpenCustomCounter && (
            <div className="home-grid-full mt-1">
              <TasbeehCounterButton onClick={onOpenCustomCounter} language={language} direction={direction} />
            </div>
          )}
        </div>
      </main>
    </ScreenContainer>
  );
}
