import { useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, Check, ChevronDown, Minus, Plus, RotateCcw, Search, Undo, X } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName, JUZS, SURAHS, searchSurahs } from "../content/surahInfo";
import {
  effectiveDailyGoal,
  getQuranWirdGoal,
  getQuranWirdDayProgress,
  getReadingMonthDuration,
  TOTAL_MUSHAF_PAGES,
} from "./quranWirdGoal";
import { computeQuranProgressStats, getJuzPageRange } from "./quranProgressStats";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import type { AppLanguage, QuranReadingEvent, QuranReadingPosition, QuranWirdPlan } from "../types";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";

function getSurahPageRange(surahNum: number): { startPage: number; endPage: number } {
  const surah = SURAHS.find((s) => s.number === surahNum) ?? SURAHS[0]!;
  if (surahNum >= 114) return { startPage: surah.startPage, endPage: 604 };
  const nextSurah = SURAHS.find((s) => s.number === surahNum + 1);
  const endPage = nextSurah ? (nextSurah.startPage > surah.startPage ? nextSurah.startPage - 1 : surah.startPage) : 604;
  return { startPage: surah.startPage, endPage: Math.max(surah.startPage, endPage) };
}

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "repeating") {
    if (plan.repeatScope === "juz" && plan.repeatNumber) {
      const juzMeta = JUZS.find((j) => j.number === plan.repeatNumber);
      const name = language === "ar" ? juzMeta?.nameArabic : juzMeta?.nameEnglish;
      return t(language, "mushaf.planRepeatingJuz", {
        juz: name ?? formatNumerals(plan.repeatNumber, language),
        pages: `${formatNumerals(plan.repeatStartPage ?? 1, language)}–${formatNumerals(plan.repeatEndPage ?? 604, language)}`,
      });
    }
    if (plan.repeatScope === "surah" && plan.repeatNumber) {
      const surahName = getSurahDisplayName(plan.repeatNumber, language);
      return t(language, "mushaf.planRepeatingSurah", {
        surah: surahName,
        pages: `${formatNumerals(plan.repeatStartPage ?? 1, language)}–${formatNumerals(plan.repeatEndPage ?? 604, language)}`,
      });
    }
    return t(language, "mushaf.planRepeatingCustom", {
      start: formatNumerals(plan.repeatStartPage ?? 1, language),
      end: formatNumerals(plan.repeatEndPage ?? 604, language),
    });
  }
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "hijriMonth") return t(language, "mushaf.planHijriMonth");
  if (plan.kind === "gregorianMonth") return t(language, "mushaf.planGregorianMonth");
  if (plan.kind === "free") return t(language, "mushaf.planFreeReading");
  if (plan.kind === "custom") {
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  }
  return t(language, "mushaf.planDaily");
}

type VisiblePlanKind = "repeating" | "daily" | "hijriMonth" | "gregorianMonth" | "custom" | "free";

function createPlan(
  kind: VisiblePlanKind,
  now: Date,
  todayKey: string,
  position: QuranReadingPosition,
  current?: QuranWirdPlan,
): QuranWirdPlan {
  if (kind === "free") return { kind, dailyPages: 0, startedDayKey: todayKey };
  if (kind === "repeating") {
    if (current?.kind === "repeating") return { ...current, startedDayKey: todayKey };
    const currentJuz = position.juzNumber ?? getJuzNumberForPage(position.page);
    const range = getJuzPageRange(currentJuz);
    return {
      kind: "repeating",
      dailyPages: range.endPage - range.startPage + 1,
      repeatStartPage: range.startPage,
      repeatEndPage: range.endPage,
      repeatScope: "juz",
      repeatNumber: currentJuz,
      startedDayKey: todayKey,
    };
  }
  if (kind === "daily") {
    return {
      kind,
      dailyPages: current?.kind === "daily" ? current.dailyPages : 4,
      startedDayKey: todayKey,
    };
  }
  if (kind === "custom") {
    const startPage = current?.startPage ?? position.page;
    const targetPage = current?.targetPage ?? TOTAL_MUSHAF_PAGES;
    const durationDays = current?.durationDays ?? 30;
    return {
      kind: "custom",
      durationDays,
      dailyPages: Math.ceil(Math.max(1, targetPage - startPage + 1) / durationDays),
      startPage,
      targetPage,
      startedDayKey: todayKey,
    };
  }

  const durationDays = getReadingMonthDuration(now, kind === "hijriMonth" ? "hijri" : "gregorian");
  return {
    kind,
    durationDays,
    dailyPages: Math.ceil(Math.max(1, TOTAL_MUSHAF_PAGES - position.page + 1) / durationDays),
    startedDayKey: todayKey,
    startPage: position.page,
    targetPage: TOTAL_MUSHAF_PAGES,
  };
}

function completionDate(now: Date, days: number, language: AppLanguage, calendarType: "hijri" | "gregorian") {
  const date = new Date(now);
  date.setDate(date.getDate() + Math.max(0, days - 1));
  const locale = language === "ar" ? "ar-EG" : "en";
  if (calendarType === "hijri") {
    return new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function monthLabel(date: Date, calendar: "hijri" | "gregorian", language: AppLanguage) {
  const locale = language === "ar" ? "ar-EG" : "en";
  return new Intl.DateTimeFormat(calendar === "hijri" ? `${locale}-u-ca-islamic-umalqura` : locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function QuranWirdScreen({
  language,
  direction,
  calendarType = "hijri",
  position,
  plan,
  wirdHistory,
  quranWirdDailyGoals = {},
  lastReadingEvent,
  onBack,
  onContinue,
  onPlanChange,
  onUndoReadingEvent,
  progressDayStartHour,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  calendarType?: "hijri" | "gregorian";
  position: QuranReadingPosition;
  plan: QuranWirdPlan;
  wirdHistory: Record<string, number[]>;
  quranWirdDailyGoals: Record<string, number>;
  lastReadingEvent?: QuranReadingEvent;
  onBack: () => void;
  onContinue: (targetPage?: number) => void;
  onPlanChange: (plan: QuranWirdPlan) => void;
  onUndoReadingEvent: () => void;
  progressDayStartHour: number;
}) {
  const now = useNow();
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const isFreeReading = plan.kind === "free";
  const isRepeating = plan.kind === "repeating";
  const planCalendar = plan.kind === "hijriMonth" ? "hijri" : plan.kind === "gregorianMonth" ? "gregorian" : null;
  const isMonthPlan = planCalendar !== null;
  const todayProgress = getQuranWirdDayProgress(plan, wirdHistory, todayKey);
  const goalResult = getQuranWirdGoal(plan, wirdHistory, todayKey);
  const goal = todayProgress.goal;
  const read = todayProgress.read;
  const remaining = todayProgress.remaining;

  const repeatStart = plan.repeatStartPage ?? 1;
  const repeatEnd = plan.repeatEndPage ?? TOTAL_MUSHAF_PAGES;
  const completedPages = Array.from(new Set(wirdHistory[todayKey] ?? []));

  const overallStats = useMemo(
    () => computeQuranProgressStats(plan, wirdHistory, position),
    [plan, wirdHistory, position],
  );

  const targetPages: number[] = [];
  if (isRepeating) {
    for (let page = repeatStart; page <= repeatEnd; page += 1) {
      if (!completedPages.includes(page)) targetPages.push(page);
    }
  } else {
    for (let page = position.page; page <= TOTAL_MUSHAF_PAGES && targetPages.length < remaining; page += 1) {
      if (!completedPages.includes(page)) targetPages.push(page);
    }
  }
  const targetStartPage = isRepeating ? (targetPages[0] ?? repeatStart) : (targetPages[0] ?? position.page);
  const targetEndPage = isRepeating ? repeatEnd : (targetPages.at(-1) ?? position.page);

  let repeatingContext = "";
  if (isRepeating) {
    if (plan.repeatScope === "juz" && plan.repeatNumber) {
      const juzMeta = JUZS.find((j) => j.number === plan.repeatNumber);
      repeatingContext = language === "ar" ? (juzMeta?.nameArabic ?? "") : (juzMeta?.nameEnglish ?? "");
    } else if (plan.repeatScope === "surah" && plan.repeatNumber) {
      repeatingContext = getSurahDisplayName(plan.repeatNumber, language);
    } else {
      repeatingContext = t(language, "mushaf.repeatingScopeCustom");
    }
  }
  const positionSurah = isRepeating ? repeatingContext : getSurahDisplayName(position.surahNumber ?? 1, language);
  const positionJuz = isRepeating
    ? plan.repeatScope === "juz"
      ? (plan.repeatNumber ?? 1)
      : getJuzNumberForPage(repeatStart)
    : (position.juzNumber ?? getJuzNumberForPage(position.page));

  const planStartPage = plan.startPage ?? 1;
  const planTargetPage = plan.targetPage ?? TOTAL_MUSHAF_PAGES;
  const planPageCount = Math.max(1, planTargetPage - planStartPage + 1);
  const monthPagesRead = isMonthPlan
    ? new Set(
        Object.entries(wirdHistory)
          .filter(([dayKey]) => !plan.startedDayKey || dayKey >= plan.startedDayKey)
          .flatMap(([, pages]) => pages)
          .filter((page) => page >= planStartPage && page <= planTargetPage),
      ).size
    : 0;
  const monthStartedAt = plan.startedDayKey ? new Date(`${plan.startedDayKey}T12:00:00`) : now;
  const currentPlanMonth = planCalendar ? monthLabel(monthStartedAt, planCalendar, language) : "";
  const week = useMemo(() => currentSaturdayWeekKeys(now, progressDayStartHour), [now, progressDayStartHour]);
  const firstPlan =
    !plan.startedDayKey && position.page === 1 && Object.values(wirdHistory).every((pages) => !pages.length);
  const [isDrafting, setIsDrafting] = useState(firstPlan);
  const [draftPlan, setDraftPlan] = useState<QuranWirdPlan>(() =>
    plan.kind === "khatmah30" ? createPlan("hijriMonth", now, todayKey, position) : plan,
  );

  const [juzSearch, setJuzSearch] = useState("");
  const [surahSearch, setSurahSearch] = useState("");

  const filteredJuzs = useMemo(() => {
    const query = juzSearch.trim().toLowerCase();
    if (!query) return JUZS;
    return JUZS.filter((j) => {
      const nameAr = j.nameArabic.toLowerCase();
      const nameEn = j.nameEnglish.toLowerCase();
      const num = String(j.number);
      return nameAr.includes(query) || nameEn.includes(query) || num.includes(query);
    });
  }, [juzSearch]);

  const filteredSurahs = useMemo(() => {
    const query = surahSearch.trim().toLowerCase();
    if (!query) return SURAHS;
    return searchSurahs(query, language);
  }, [surahSearch, language]);

  const timedDraft =
    draftPlan.kind === "custom" ||
    draftPlan.kind === "khatmah30" ||
    draftPlan.kind === "hijriMonth" ||
    draftPlan.kind === "gregorianMonth";
  const normalizedDraft: QuranWirdPlan = {
    ...draftPlan,
    startedDayKey: todayKey,
    ...(draftPlan.kind === "repeating"
      ? {
          repeatStartPage: draftPlan.repeatStartPage ?? 1,
          repeatEndPage: draftPlan.repeatEndPage ?? 604,
          dailyPages: (draftPlan.repeatEndPage ?? 604) - (draftPlan.repeatStartPage ?? 1) + 1,
        }
      : timedDraft
        ? { startPage: draftPlan.startPage ?? position.page, targetPage: draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES }
        : {}),
  };
  const draftGoal = effectiveDailyGoal(normalizedDraft, wirdHistory, todayKey);
  const draftDays =
    normalizedDraft.kind === "free"
      ? null
      : normalizedDraft.kind === "repeating"
        ? null
        : normalizedDraft.kind === "daily"
          ? Math.max(1, Math.ceil((TOTAL_MUSHAF_PAGES - position.page + 1) / normalizedDraft.dailyPages))
          : (normalizedDraft.durationDays ?? 30);
  const draftCompletionDate = draftDays === null ? null : completionDate(now, draftDays, language, calendarType);
  const canUndo = lastReadingEvent?.dayKey === todayKey && lastReadingEvent.pages.length > 0;
  const textAlignment = direction === "rtl" ? "text-right" : "text-left";

  return (
    <ScreenContainer dir={direction} screenName={t(language, "mushaf.wirdTitle")} className="overflow-y-auto">
      <Header title={t(language, "mushaf.wirdTitle")} onBack={onBack} language={language} />
      <div
        data-testid="quran-wird-content"
        className={`mx-auto grid w-full grid-cols-1 gap-4 px-4 pb-8 pt-3 sm:px-6 lg:max-w-6xl lg:grid-cols-2 lg:items-start ${textAlignment}`}
      >
        <section
          className="rounded-3xl border border-primary/50 bg-card p-5 shadow-raised sm:p-6 lg:col-span-2"
          aria-labelledby="wird-today-title"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="wird-today-title" className="text-xl font-extrabold text-foreground">
              {t(language, "mushaf.todayReadingTitle")}
            </h2>
            {!isFreeReading && !goalResult.expired && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  remaining === 0 ? "bg-success/15 text-success" : "bg-primary/10 text-primary"
                }`}
              >
                {remaining === 0 ? (
                  <>
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                    <span>{t(language, "mushaf.statusCompleted")}</span>
                  </>
                ) : (
                  <span>{t(language, "mushaf.statusInProgress")}</span>
                )}
              </span>
            )}
          </div>

          {isFreeReading ? (
            <>
              <p className="text-sm font-bold text-foreground">{t(language, "mushaf.freeReadingActive")}</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {t(language, "mushaf.freeReadingActiveHint")}
              </p>
              <p className="mt-4 text-sm font-medium text-muted-foreground" dir={direction}>
                {t(language, "mushaf.readingContext", {
                  surah: positionSurah,
                  juz: formatNumerals(positionJuz, language),
                })}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {t(language, "mushaf.continueFromPage", { page: formatNumerals(position.page, language) })}
              </p>
              <button
                type="button"
                onClick={() => onContinue()}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <BookOpen size={18} aria-hidden="true" />
                {t(language, "mushaf.continueReading")}
                <ArrowNext size={18} data-rtl-flip aria-hidden="true" />
              </button>
            </>
          ) : goalResult.expired ? (
            <div className="rounded-2xl border border-border bg-muted p-4" role="status">
              <p className="text-sm font-bold text-foreground">{t(language, "mushaf.planExpired")}</p>
              <button
                type="button"
                onClick={() => setIsDrafting(true)}
                className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "mushaf.adjustPlan")}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-lg font-bold text-primary" dir={direction}>
                    {isRepeating
                      ? t(language, "mushaf.pagesRange", {
                          start: formatNumerals(repeatStart, language),
                          end: formatNumerals(repeatEnd, language),
                        })
                      : t(language, "mushaf.pagesRange", {
                          start: formatNumerals(targetStartPage, language),
                          end: formatNumerals(targetEndPage, language),
                        })}
                  </p>
                  {isRepeating && (
                    <button
                      type="button"
                      onClick={() => onContinue(repeatStart)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      title={t(language, "mushaf.startSectionAgain")}
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                      <span>{t(language, "mushaf.startSectionAgain")}</span>
                    </button>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground" dir={direction}>
                  {isRepeating
                    ? repeatingContext
                    : t(language, "mushaf.readingContext", {
                        surah: positionSurah,
                        juz: formatNumerals(positionJuz, language),
                      })}
                </p>
              </div>

              <p className="mb-2 text-sm font-bold text-foreground">
                {t(language, "mushaf.completedCount", {
                  read: formatNumerals(read, language),
                  goal: formatNumerals(goal, language),
                })}
              </p>
              <ProgressBar
                aria-label={t(language, "mushaf.todayProgress", {
                  read: formatNumerals(read, language),
                  goal: formatNumerals(goal, language),
                })}
                value={Math.min(read, goal)}
                max={Math.max(goal, 1)}
                height={8}
                direction={direction}
              />

              {remaining > 0 ? (
                <p className="mt-3 text-sm font-medium text-muted-foreground">
                  {t(language, "mushaf.continueFromPage", { page: formatNumerals(position.page, language) })}
                </p>
              ) : (
                <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
                  <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                  <span>{t(language, "mushaf.wirdCompleteShort")}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onContinue()}
                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <BookOpen size={18} aria-hidden="true" />
                {t(language, "mushaf.continueReading")}
                <ArrowNext size={18} data-rtl-flip aria-hidden="true" />
              </button>
            </>
          )}

          {canUndo && (
            <button
              type="button"
              onClick={onUndoReadingEvent}
              className="mt-2 flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Undo size={16} aria-hidden="true" />
              {t(language, "mushaf.undoPages", {
                pages: lastReadingEvent.pages.map((page) => formatNumerals(page, language)).join("–"),
              })}
            </button>
          )}
        </section>

        {/* Plan card with integrated overall completion metrics */}
        <section
          className={`rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6 ${
            isFreeReading || isMonthPlan ? "lg:col-span-2" : "lg:col-span-1"
          }`}
          aria-labelledby="wird-plan-title"
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 id="wird-plan-title" className="text-base font-extrabold text-foreground">
                {t(language, "mushaf.planTitle")}
              </h2>
              {!isDrafting && (
                <>
                  {isMonthPlan && <p className="mt-1 text-lg font-extrabold text-foreground">{currentPlanMonth}</p>}
                  <p className="mt-1 text-sm font-medium text-muted-foreground">{planLabel(language, plan)}</p>
                </>
              )}
            </div>
            {!isDrafting && (
              <button
                type="button"
                onClick={() => {
                  setDraftPlan(plan.kind === "khatmah30" ? createPlan("hijriMonth", now, todayKey, position) : plan);
                  setIsDrafting(true);
                }}
                className="min-h-11 rounded-xl px-3 text-sm font-bold text-primary hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "mushaf.editPlan")}
              </button>
            )}
          </div>

          {!isDrafting && isMonthPlan && (
            <div className="border-t border-border/60 pt-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-foreground">
                <span>{t(language, "mushaf.monthProgress")}</span>
                <bdi dir="ltr">
                  {formatNumerals(monthPagesRead, language)} / {formatNumerals(planPageCount, language)}
                </bdi>
              </div>
              <ProgressBar
                aria-label={t(language, "mushaf.monthProgressAria", {
                  read: formatNumerals(monthPagesRead, language),
                  total: formatNumerals(planPageCount, language),
                  month: currentPlanMonth,
                })}
                value={monthPagesRead}
                max={planPageCount}
                height={8}
                direction={direction}
              />
            </div>
          )}

          {!isDrafting && !isMonthPlan && !isFreeReading && (
            <div className="border-t border-border/60 pt-4">
              <p className="mb-3 text-xs font-bold text-muted-foreground">
                {t(language, "mushaf.overallProgressTitle")}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs font-bold text-muted-foreground">{t(language, "mushaf.overallPagesRead")}</p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    <bdi dir="ltr">
                      {formatNumerals(overallStats.totalUniquePagesRead, language)} /{" "}
                      {formatNumerals(TOTAL_MUSHAF_PAGES, language)}
                    </bdi>
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs font-bold text-muted-foreground">{t(language, "mushaf.completedJuzs")}</p>
                  <p className="mt-1 text-sm font-black text-foreground">
                    <bdi dir="ltr">
                      {formatNumerals(overallStats.completedJuzsCount, language)} / {formatNumerals(30, language)}
                    </bdi>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                <span>
                  {t(language, "mushaf.khatmahProgressPercent", {
                    percent: formatNumerals(overallStats.mushafCompletionPercent, language),
                  })}
                </span>
                <span>
                  {t(language, "mushaf.wirdRemaining", {
                    count: formatNumerals(
                      Math.max(0, TOTAL_MUSHAF_PAGES - overallStats.totalUniquePagesRead),
                      language,
                    ),
                    goal: formatNumerals(TOTAL_MUSHAF_PAGES, language),
                  })}
                </span>
              </div>
            </div>
          )}

          {isDrafting && (
            <div className="flex flex-col gap-4 border-t border-border/60 pt-4">
              <fieldset>
                <legend className="mb-2 text-sm font-bold text-foreground">
                  {t(language, "mushaf.chooseReadingStyle")}
                </legend>
                <p className="mb-3 text-sm text-muted-foreground">{t(language, "mushaf.chooseReadingStyleHint")}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      ["repeating", "mushaf.planRepeating", "mushaf.planRepeatingHint"],
                      ["daily", "mushaf.planPagesPerDay", "mushaf.planPagesPerDayHint"],
                      ["hijriMonth", "mushaf.planHijriMonth", "mushaf.planHijriMonthHint"],
                      ["gregorianMonth", "mushaf.planGregorianMonth", "mushaf.planGregorianMonthHint"],
                      ["custom", "mushaf.planCustomChoice", "mushaf.customPlanChoiceHint"],
                      ["free", "mushaf.planFreeReading", "mushaf.planFreeReadingHint"],
                    ] as const
                  ).map(([kind, titleKey, hintKey]) => {
                    const isSelected = draftPlan.kind === kind;
                    return (
                      <label
                        key={kind}
                        htmlFor={`quran-wird-plan-${kind}`}
                        aria-label={t(language, titleKey)}
                        className={`flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border p-3 text-foreground transition-colors hover:bg-muted focus-within:ring-[3px] focus-within:ring-ring ${
                          isSelected ? "border-primary bg-primary/10" : "border-border bg-background"
                        }`}
                      >
                        <input
                          id={`quran-wird-plan-${kind}`}
                          type="radio"
                          name="quran-wird-plan-type"
                          value={kind}
                          checked={isSelected}
                          onChange={() => setDraftPlan(createPlan(kind, now, todayKey, position, draftPlan))}
                          className="mt-0.5 size-5 shrink-0 accent-primary"
                        />
                        <span className={`flex min-w-0 flex-col ${textAlignment}`}>
                          <span className="text-sm font-bold">{t(language, titleKey)}</span>
                          <span className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {t(language, hintKey)}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {draftPlan.kind === "repeating" && (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    {(["juz", "surah", "custom"] as const).map((scope) => {
                      const active = (draftPlan.repeatScope ?? "juz") === scope;
                      return (
                        <button
                          key={scope}
                          type="button"
                          onClick={() => {
                            if (scope === "juz") {
                              const jNum =
                                draftPlan.repeatNumber && draftPlan.repeatNumber <= 30
                                  ? draftPlan.repeatNumber
                                  : (position.juzNumber ?? 1);
                              const range = getJuzPageRange(jNum);
                              setDraftPlan({
                                ...draftPlan,
                                repeatScope: "juz",
                                repeatNumber: jNum,
                                repeatStartPage: range.startPage,
                                repeatEndPage: range.endPage,
                                dailyPages: range.endPage - range.startPage + 1,
                                startedDayKey: todayKey,
                              });
                            } else if (scope === "surah") {
                              const sNum =
                                draftPlan.repeatNumber && draftPlan.repeatNumber <= 114
                                  ? draftPlan.repeatNumber
                                  : (position.surahNumber ?? 1);
                              const range = getSurahPageRange(sNum);
                              setDraftPlan({
                                ...draftPlan,
                                repeatScope: "surah",
                                repeatNumber: sNum,
                                repeatStartPage: range.startPage,
                                repeatEndPage: range.endPage,
                                dailyPages: range.endPage - range.startPage + 1,
                                startedDayKey: todayKey,
                              });
                            } else {
                              const start = draftPlan.repeatStartPage ?? 1;
                              const end = draftPlan.repeatEndPage ?? 20;
                              setDraftPlan({
                                ...draftPlan,
                                repeatScope: "custom",
                                repeatStartPage: start,
                                repeatEndPage: end,
                                dailyPages: end - start + 1,
                                startedDayKey: todayKey,
                              });
                            }
                          }}
                          className={`min-h-11 flex-1 rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                            active
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "border border-border bg-card text-foreground hover:bg-muted"
                          }`}
                        >
                          {t(
                            language,
                            scope === "juz"
                              ? "mushaf.repeatingScopeJuz"
                              : scope === "surah"
                                ? "mushaf.repeatingScopeSurah"
                                : "mushaf.repeatingScopeCustom",
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {(draftPlan.repeatScope ?? "juz") === "juz" && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="quran-wird-juz-select" className="text-xs font-bold text-muted-foreground">
                        {t(language, "mushaf.selectJuz")}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                          <Search size={16} aria-hidden="true" />
                        </span>
                        <input
                          type="text"
                          value={juzSearch}
                          onChange={(e) => setJuzSearch(e.target.value)}
                          placeholder={t(language, "mushaf.searchJuzPlaceholder")}
                          aria-label={t(language, "mushaf.searchJuzPlaceholder")}
                          className="h-11 w-full rounded-xl border border-border bg-background pe-12 ps-9 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {juzSearch && (
                          <button
                            type="button"
                            onClick={() => setJuzSearch("")}
                            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                            aria-label={t(language, "common.clear")}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          id="quran-wird-juz-select"
                          value={draftPlan.repeatNumber ?? 1}
                          onChange={(e) => {
                            const juzNum = Number(e.target.value);
                            const range = getJuzPageRange(juzNum);
                            setDraftPlan({
                              ...draftPlan,
                              repeatScope: "juz",
                              repeatNumber: juzNum,
                              repeatStartPage: range.startPage,
                              repeatEndPage: range.endPage,
                              dailyPages: range.endPage - range.startPage + 1,
                              startedDayKey: todayKey,
                            });
                          }}
                          className="h-12 w-full appearance-none rounded-xl border border-border bg-card pe-10 ps-3.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          {filteredJuzs.map((j) => {
                            const range = getJuzPageRange(j.number);
                            const name = language === "ar" ? j.nameArabic : j.nameEnglish;
                            return (
                              <option key={j.number} value={j.number}>
                                {name} ({formatNumerals(range.startPage, language)}–
                                {formatNumerals(range.endPage, language)})
                              </option>
                            );
                          })}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-muted-foreground">
                          <ChevronDown size={18} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  )}

                  {draftPlan.repeatScope === "surah" && (
                    <div className="flex flex-col gap-2">
                      <label htmlFor="quran-wird-surah-select" className="text-xs font-bold text-muted-foreground">
                        {t(language, "mushaf.selectSurah")}
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-muted-foreground">
                          <Search size={16} aria-hidden="true" />
                        </span>
                        <input
                          type="text"
                          value={surahSearch}
                          onChange={(e) => setSurahSearch(e.target.value)}
                          placeholder={t(language, "mushaf.searchSurahPlaceholder")}
                          aria-label={t(language, "mushaf.searchSurahPlaceholder")}
                          className="h-11 w-full rounded-xl border border-border bg-background pe-12 ps-9 text-xs font-bold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        {surahSearch && (
                          <button
                            type="button"
                            onClick={() => setSurahSearch("")}
                            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                            aria-label={t(language, "common.clear")}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <select
                          id="quran-wird-surah-select"
                          value={draftPlan.repeatNumber ?? 1}
                          onChange={(e) => {
                            const surahNum = Number(e.target.value);
                            const range = getSurahPageRange(surahNum);
                            setDraftPlan({
                              ...draftPlan,
                              repeatScope: "surah",
                              repeatNumber: surahNum,
                              repeatStartPage: range.startPage,
                              repeatEndPage: range.endPage,
                              dailyPages: range.endPage - range.startPage + 1,
                              startedDayKey: todayKey,
                            });
                          }}
                          className="h-12 w-full appearance-none rounded-xl border border-border bg-card pe-10 ps-3.5 text-sm font-bold text-foreground transition-colors hover:border-primary/50 focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        >
                          {filteredSurahs.map((s) => {
                            const range = getSurahPageRange(s.number);
                            const name = getSurahDisplayName(s.number, language);
                            const pagesCount = range.endPage - range.startPage + 1;
                            return (
                              <option key={s.number} value={s.number}>
                                {s.number}. {name} ({formatNumerals(pagesCount, language)}{" "}
                                {t(language, "mushaf.pagesUnit")})
                              </option>
                            );
                          })}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 end-3.5 flex items-center text-muted-foreground">
                          <ChevronDown size={18} aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  )}

                  {draftPlan.repeatScope === "custom" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="quran-wird-custom-start"
                          className="mb-1 block text-xs font-bold text-muted-foreground"
                        >
                          {t(language, "mushaf.fromPage")}
                        </label>
                        <input
                          id="quran-wird-custom-start"
                          type="number"
                          min={1}
                          max={604}
                          value={draftPlan.repeatStartPage ?? 1}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const start = Math.min(604, Math.max(1, Number(e.target.value) || 1));
                            const end = Math.max(start, draftPlan.repeatEndPage ?? start);
                            setDraftPlan({
                              ...draftPlan,
                              repeatScope: "custom",
                              repeatStartPage: start,
                              repeatEndPage: end,
                              dailyPages: end - start + 1,
                              startedDayKey: todayKey,
                            });
                          }}
                          className="h-12 w-full rounded-xl border border-border bg-card px-3 text-center text-base font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="quran-wird-custom-end"
                          className="mb-1 block text-xs font-bold text-muted-foreground"
                        >
                          {t(language, "mushaf.toPage")}
                        </label>
                        <input
                          id="quran-wird-custom-end"
                          type="number"
                          min={1}
                          max={604}
                          value={draftPlan.repeatEndPage ?? 1}
                          onWheel={(e) => e.currentTarget.blur()}
                          onChange={(e) => {
                            const end = Math.min(604, Math.max(1, Number(e.target.value) || 1));
                            const start = Math.min(end, draftPlan.repeatStartPage ?? 1);
                            setDraftPlan({
                              ...draftPlan,
                              repeatScope: "custom",
                              repeatStartPage: start,
                              repeatEndPage: end,
                              dailyPages: end - start + 1,
                              startedDayKey: todayKey,
                            });
                          }}
                          className="h-12 w-full rounded-xl border border-border bg-card px-3 text-center text-base font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {draftPlan.kind === "daily" ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="quran-wird-daily-pages" className="text-sm font-bold text-foreground">
                    {t(language, "mushaf.planPagesPerDay")}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPlan({
                          ...draftPlan,
                          dailyPages: Math.max(1, draftPlan.dailyPages - 1),
                          startedDayKey: todayKey,
                        })
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      aria-label={t(language, "common.decrease")}
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      id="quran-wird-daily-pages"
                      type="number"
                      min={1}
                      max={604}
                      value={draftPlan.dailyPages}
                      onChange={(event) =>
                        setDraftPlan({
                          ...draftPlan,
                          dailyPages: Math.min(604, Math.max(1, Number(event.target.value) || 1)),
                          startedDayKey: todayKey,
                        })
                      }
                      inputMode="numeric"
                      onWheel={(event) => event.currentTarget.blur()}
                      className="h-12 w-full rounded-xl border border-border bg-background px-3 text-center text-lg font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraftPlan({
                          ...draftPlan,
                          dailyPages: Math.min(604, draftPlan.dailyPages + 1),
                          startedDayKey: todayKey,
                        })
                      }
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      aria-label={t(language, "common.increase")}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              ) : null}

              {draftPlan.kind === "custom" ? (
                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="quran-wird-custom-start-page"
                        className="mb-1 block text-xs font-bold text-muted-foreground"
                      >
                        {t(language, "mushaf.fromPage")}
                      </label>
                      <input
                        id="quran-wird-custom-start-page"
                        type="number"
                        min={1}
                        max={604}
                        value={draftPlan.startPage ?? position.page}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => {
                          const start = Math.min(604, Math.max(1, Number(e.target.value) || 1));
                          const end = Math.max(start, draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES);
                          const days = draftPlan.durationDays ?? 30;
                          setDraftPlan({
                            ...draftPlan,
                            startPage: start,
                            targetPage: end,
                            dailyPages: Math.ceil((end - start + 1) / days),
                            startedDayKey: todayKey,
                          });
                        }}
                        className="h-12 w-full rounded-xl border border-border bg-card px-3 text-center text-base font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="quran-wird-custom-target-page"
                        className="mb-1 block text-xs font-bold text-muted-foreground"
                      >
                        {t(language, "mushaf.toPage")}
                      </label>
                      <input
                        id="quran-wird-custom-target-page"
                        type="number"
                        min={1}
                        max={604}
                        value={draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES}
                        onWheel={(e) => e.currentTarget.blur()}
                        onChange={(e) => {
                          const end = Math.min(604, Math.max(1, Number(e.target.value) || 1));
                          const start = Math.min(end, draftPlan.startPage ?? 1);
                          const days = draftPlan.durationDays ?? 30;
                          setDraftPlan({
                            ...draftPlan,
                            startPage: start,
                            targetPage: end,
                            dailyPages: Math.ceil((end - start + 1) / days),
                            startedDayKey: todayKey,
                          });
                        }}
                        className="h-12 w-full rounded-xl border border-border bg-card px-3 text-center text-base font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="quran-wird-custom-days"
                      className="mb-1 block text-xs font-bold text-muted-foreground"
                    >
                      {t(language, "mushaf.durationDays")}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const days = Math.max(1, (draftPlan.durationDays ?? 30) - 5);
                          const start = draftPlan.startPage ?? position.page;
                          const end = draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES;
                          setDraftPlan({
                            ...draftPlan,
                            durationDays: days,
                            dailyPages: Math.ceil((end - start + 1) / days),
                            startedDayKey: todayKey,
                          });
                        }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        aria-label={t(language, "common.decrease")}
                      >
                        <Minus size={20} />
                      </button>
                      <input
                        id="quran-wird-custom-days"
                        type="number"
                        min={1}
                        max={365}
                        value={draftPlan.durationDays ?? 30}
                        onChange={(e) => {
                          const days = Math.min(365, Math.max(1, Number(e.target.value) || 1));
                          const start = draftPlan.startPage ?? position.page;
                          const end = draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES;
                          setDraftPlan({
                            ...draftPlan,
                            durationDays: days,
                            dailyPages: Math.ceil((end - start + 1) / days),
                            startedDayKey: todayKey,
                          });
                        }}
                        inputMode="numeric"
                        onWheel={(e) => e.currentTarget.blur()}
                        className="h-12 w-full rounded-xl border border-border bg-background px-3 text-center text-lg font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const days = Math.min(365, (draftPlan.durationDays ?? 30) + 5);
                          const start = draftPlan.startPage ?? position.page;
                          const end = draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES;
                          setDraftPlan({
                            ...draftPlan,
                            durationDays: days,
                            dailyPages: Math.ceil((end - start + 1) / days),
                            startedDayKey: todayKey,
                          });
                        }}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                        aria-label={t(language, "common.increase")}
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      {[30, 60, 90, 180].map((preset) => {
                        const isActive = (draftPlan.durationDays ?? 30) === preset;
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => {
                              const start = draftPlan.startPage ?? position.page;
                              const end = draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES;
                              setDraftPlan({
                                ...draftPlan,
                                durationDays: preset,
                                dailyPages: Math.ceil((end - start + 1) / preset),
                                startedDayKey: todayKey,
                              });
                            }}
                            className={`min-h-11 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-card text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {formatNumerals(preset, language)} {t(language, "mushaf.durationDays")}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="flex flex-col gap-1 rounded-xl bg-muted p-4 text-sm font-medium text-foreground">
                {draftPlan.kind === "free" ? (
                  <p>{t(language, "mushaf.freeReadingSummary")}</p>
                ) : draftPlan.kind === "repeating" ? (
                  <>
                    <p>{t(language, "mushaf.repeatingSummary")}</p>
                    <p>
                      {t(language, "mushaf.aroundPagesPerDay", {
                        count: formatNumerals(draftPlan.dailyPages, language),
                      })}
                    </p>
                  </>
                ) : (
                  <>
                    <p>{t(language, "mushaf.aroundPagesPerDay", { count: formatNumerals(draftGoal, language) })}</p>
                    <p>{t(language, "mushaf.estimatedCompletion", { date: draftCompletionDate ?? "" })}</p>
                  </>
                )}
              </div>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraftPlan(plan);
                    setIsDrafting(false);
                  }}
                  className="min-h-11 flex-1 rounded-xl border border-border px-3 font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {t(language, "mushaf.cancelPlan")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPlanChange(normalizedDraft);
                    setIsDrafting(false);
                  }}
                  className="min-h-11 flex-1 rounded-xl bg-primary px-3 font-bold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  {t(language, "mushaf.savePlan")}
                </button>
              </div>
            </div>
          )}
        </section>

        {!isFreeReading && !isMonthPlan && (
          <section
            className="rounded-3xl border border-border bg-card p-5 shadow-xs sm:p-6 lg:col-span-1"
            aria-labelledby="wird-week-title"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
                {t(language, "mushaf.thisWeek")}
              </h2>
              <span className="text-xs font-bold text-muted-foreground">
                {t(language, "mushaf.weekDaysCompleted", {
                  done: formatNumerals(
                    week.filter((k) => {
                      const dp = getQuranWirdDayProgress(plan, wirdHistory, k);
                      const elig = !plan.startedDayKey || k >= plan.startedDayKey;
                      const dg = elig ? (quranWirdDailyGoals[k] ?? dp.goal) : 0;
                      return elig && dg > 0 && dp.read >= dg;
                    }).length,
                    language,
                  ),
                })}
              </span>
            </div>
            <div className="flex flex-col gap-2" role="list" aria-label={t(language, "mushaf.thisWeek")}>
              {week.map((dayKey) => {
                const dayProgress = getQuranWirdDayProgress(plan, wirdHistory, dayKey);
                const dayEligible = !plan.startedDayKey || dayKey >= plan.startedDayKey;
                const dayGoal = dayEligible ? (quranWirdDailyGoals[dayKey] ?? dayProgress.goal) : 0;
                const count = dayProgress.read;
                const dayLabel = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
                  weekday: "short",
                }).format(new Date(`${dayKey}T12:00:00`));
                const complete = dayEligible && dayGoal > 0 && count >= dayGoal;

                return (
                  <div
                    key={dayKey}
                    role="listitem"
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors ${
                      dayKey === todayKey ? "bg-muted font-bold" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-sm font-bold text-foreground">{dayLabel}</span>
                      {complete ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-success text-success-foreground">
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <bdi dir="ltr" className="text-sm font-bold text-muted-foreground">
                      {dayEligible && dayKey <= todayKey && dayGoal > 0
                        ? `${formatNumerals(count, language)} / ${formatNumerals(dayGoal, language)}`
                        : t(language, "mushaf.noReading")}
                    </bdi>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </ScreenContainer>
  );
}
