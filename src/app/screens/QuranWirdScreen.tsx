import { useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, Check, Undo, Minus, Plus } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { effectiveDailyGoal, getQuranWirdGoal, getReadingMonthDuration, TOTAL_MUSHAF_PAGES } from "./quranWirdGoal";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import type { AppLanguage, QuranReadingEvent, QuranReadingPosition, QuranWirdPlan } from "../types";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "hijriMonth") return t(language, "mushaf.planHijriMonth");
  if (plan.kind === "gregorianMonth") return t(language, "mushaf.planGregorianMonth");
  if (plan.kind === "free") return t(language, "mushaf.planFreeReading");
  if (plan.kind === "custom") {
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  }
  return t(language, "mushaf.planDaily");
}

type VisiblePlanKind = "daily" | "hijriMonth" | "gregorianMonth" | "free";

function createPlan(
  kind: VisiblePlanKind,
  now: Date,
  todayKey: string,
  position: QuranReadingPosition,
  current?: QuranWirdPlan,
): QuranWirdPlan {
  if (kind === "free") return { kind, dailyPages: 0, startedDayKey: todayKey };
  if (kind === "daily") {
    return {
      kind,
      dailyPages: current?.kind === "daily" ? current.dailyPages : 4,
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
  onContinue: () => void;
  onPlanChange: (plan: QuranWirdPlan) => void;
  onUndoReadingEvent: () => void;
  progressDayStartHour: number;
}) {
  const now = useNow();
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const isFreeReading = plan.kind === "free";
  const planCalendar = plan.kind === "hijriMonth" ? "hijri" : plan.kind === "gregorianMonth" ? "gregorian" : null;
  const isMonthPlan = planCalendar !== null;
  const completedPages = Array.from(new Set(wirdHistory[todayKey] ?? []));
  const read = completedPages.length;
  const goalResult = getQuranWirdGoal(plan, wirdHistory, todayKey);
  const goal = goalResult.dailyGoal;
  const remaining = Math.max(goal - read, 0);
  const targetPages: number[] = [];
  for (let page = position.page; page <= TOTAL_MUSHAF_PAGES && targetPages.length < remaining; page += 1) {
    if (!completedPages.includes(page)) targetPages.push(page);
  }
  const targetStartPage = targetPages[0] ?? position.page;
  const targetEndPage = targetPages.at(-1) ?? position.page;
  const positionSurah = getSurahDisplayName(position.surahNumber ?? 1, language);
  const positionJuz = position.juzNumber ?? getJuzNumberForPage(position.page);
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
  const week = useMemo(() => currentSaturdayWeekKeys(now), [now]);
  const firstPlan =
    !plan.startedDayKey && position.page === 1 && Object.values(wirdHistory).every((pages) => !pages.length);
  const [isDrafting, setIsDrafting] = useState(firstPlan);
  const [draftPlan, setDraftPlan] = useState<QuranWirdPlan>(() =>
    plan.kind === "custom" || plan.kind === "khatmah30" ? createPlan("hijriMonth", now, todayKey, position) : plan,
  );
  const timedDraft =
    draftPlan.kind === "custom" ||
    draftPlan.kind === "khatmah30" ||
    draftPlan.kind === "hijriMonth" ||
    draftPlan.kind === "gregorianMonth";
  const normalizedDraft: QuranWirdPlan = {
    ...draftPlan,
    startedDayKey: todayKey,
    ...(timedDraft
      ? { startPage: draftPlan.startPage ?? position.page, targetPage: draftPlan.targetPage ?? TOTAL_MUSHAF_PAGES }
      : {}),
  };
  const draftGoal = effectiveDailyGoal(normalizedDraft, wirdHistory, todayKey);
  const draftDays =
    normalizedDraft.kind === "free"
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
          <h2 id="wird-today-title" className="mb-3 text-xl font-extrabold text-foreground">
            {t(language, "mushaf.todayReadingTitle")}
          </h2>

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
                onClick={onContinue}
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
                <p className="text-lg font-bold text-primary" dir={direction}>
                  {t(language, "mushaf.pagesRange", {
                    start: formatNumerals(targetStartPage, language),
                    end: formatNumerals(targetEndPage, language),
                  })}
                </p>
                <p className="text-sm font-medium text-muted-foreground" dir={direction}>
                  {t(language, "mushaf.readingContext", {
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
                onClick={onContinue}
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

        <section
          className={`rounded-3xl border border-border bg-card p-5 shadow-xs ${isFreeReading || isMonthPlan ? "lg:col-span-2" : ""}`}
        >
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-base font-extrabold text-foreground">{t(language, "mushaf.planTitle")}</h2>
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
                  setDraftPlan(
                    plan.kind === "custom" || plan.kind === "khatmah30"
                      ? createPlan("hijriMonth", now, todayKey, position)
                      : plan,
                  );
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
                      ["daily", "mushaf.planPagesPerDay", "mushaf.planPagesPerDayHint"],
                      ["hijriMonth", "mushaf.planHijriMonth", "mushaf.planHijriMonthHint"],
                      ["gregorianMonth", "mushaf.planGregorianMonth", "mushaf.planGregorianMonthHint"],
                      ["free", "mushaf.planFreeReading", "mushaf.planFreeReadingHint"],
                    ] as const
                  ).map(([kind, titleKey, hintKey]) => (
                    <label
                      key={kind}
                      htmlFor={`quran-wird-plan-${kind}`}
                      aria-label={t(language, titleKey)}
                      className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 text-foreground transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10 hover:bg-muted focus-within:ring-[3px] focus-within:ring-ring"
                    >
                      <input
                        id={`quran-wird-plan-${kind}`}
                        type="radio"
                        name="quran-wird-plan-type"
                        value={kind}
                        checked={draftPlan.kind === kind}
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
                  ))}
                </div>
              </fieldset>

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

              <div className="flex flex-col gap-1 rounded-xl bg-muted p-4 text-sm font-medium text-foreground">
                {draftPlan.kind === "free" ? (
                  <p>{t(language, "mushaf.freeReadingSummary")}</p>
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
          <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-week-title">
            <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
              {t(language, "mushaf.thisWeek")}
            </h2>
            <div className="mt-4 flex flex-col gap-2" role="list" aria-label={t(language, "mushaf.thisWeek")}>
              {week.map((dayKey) => {
                const count = new Set(wirdHistory[dayKey] ?? []).size;
                const dayEligible = !plan.startedDayKey || dayKey >= plan.startedDayKey;
                const dayGoal = dayEligible
                  ? (quranWirdDailyGoals[dayKey] ?? effectiveDailyGoal(plan, wirdHistory, dayKey))
                  : 0;
                const dayLabel = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
                  weekday: "short",
                }).format(new Date(`${dayKey}T12:00:00`));
                const complete = dayGoal > 0 && count >= dayGoal;

                return (
                  <div
                    key={dayKey}
                    role="listitem"
                    className={`flex items-center justify-between rounded-xl p-3 ${dayKey === todayKey ? "bg-muted" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-12 text-[0.875rem] font-bold text-foreground">{dayLabel}</span>
                      {complete ? (
                        <span className="flex size-5 items-center justify-center rounded-full bg-success text-success-foreground">
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="size-5" aria-hidden="true" />
                      )}
                    </div>
                    <bdi dir="ltr" className="text-[0.875rem] font-bold text-muted-foreground">
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
