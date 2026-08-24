import { useMemo, useState } from "react";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { ScreenContainer } from "../components/ScreenContainer";
import { ArrowNext, BookOpen, Check, Undo } from "../components/icons";
import { getJuzNumberForPage, getSurahDisplayName } from "../content/surahInfo";
import { effectiveDailyGoal } from "./quranWirdGoal";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { getProgressDayKey } from "../progress";
import { useNow } from "../hooks/useNow";
import type { AppLanguage, QuranReadingPosition, QuranWirdPlan } from "../types";
import { currentSaturdayWeekKeys } from "./quranWirdWeek";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const TOTAL_PAGES = 604;

function planLabel(language: AppLanguage, plan: QuranWirdPlan) {
  if (plan.kind === "khatmah30") return t(language, "mushaf.planKhatmah30");
  if (plan.kind === "custom")
    return t(language, "mushaf.planCustom", { days: formatNumerals(plan.durationDays ?? 30, language) });
  return t(language, "mushaf.planDaily");
}

export function QuranWirdScreen({
  language,
  direction,
  position,
  plan,
  wirdHistory,
  onBack,
  onContinue,
  onPlanChange,
  onUndoPage,
  progressDayStartHour,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  position: QuranReadingPosition;
  plan: QuranWirdPlan;
  wirdHistory: Record<string, number[]>;
  onBack: () => void;
  onContinue: () => void;
  onPlanChange: (plan: QuranWirdPlan) => void;
  onUndoPage: () => void;
  progressDayStartHour: number;
}) {
  const isArabic = language === "ar";
  const now = useNow();
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const completedPages = wirdHistory[todayKey] ?? [];
  const read = completedPages.length;
  const goal = effectiveDailyGoal(plan, wirdHistory);

  const remaining = Math.max(goal - read, 0);
  const targetEndPage = Math.min(position.page + remaining - 1, TOTAL_PAGES);

  const positionSurah = getSurahDisplayName(position.surahNumber ?? 1, language);
  const positionJuz = position.juzNumber ?? getJuzNumberForPage(position.page);

  const khatmahPagesRead = Math.max(0, position.page - 1);
  const khatmahPercent = Math.floor((khatmahPagesRead / TOTAL_PAGES) * 100);

  const week = useMemo(() => currentSaturdayWeekKeys(), []);

  // Draft State
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftPlan, setDraftPlan] = useState<QuranWirdPlan>(plan);

  const draftGoal = effectiveDailyGoal(draftPlan, wirdHistory);
  const draftCompletionDate = useMemo(() => {
    if (draftPlan.kind === "daily") {
      const remainingPages = TOTAL_PAGES - position.page;
      const days = Math.ceil(remainingPages / draftPlan.dailyPages);
      const d = new Date(now);
      d.setDate(d.getDate() + days);
      return new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en", { month: "long", day: "numeric" }).format(d);
    } else {
      const d = new Date(now);
      d.setDate(d.getDate() + (draftPlan.durationDays ?? 30));
      return new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en", { month: "long", day: "numeric" }).format(d);
    }
  }, [draftPlan, position.page, now, isArabic]);

  return (
    <ScreenContainer dir={direction} screenName={t(language, "mushaf.wirdTitle")} className="overflow-y-auto">
      <Header title={t(language, "mushaf.wirdTitle")} onBack={onBack} language={language} />
      <div className="mx-auto flex w-full max-w-[44rem] flex-col gap-4 px-4 pb-8 pt-3 sm:px-6">
        {/* EXACT DAILY PORTION */}
        <section
          className="rounded-3xl border border-primary/50 bg-card p-5 shadow-raised sm:p-6"
          aria-labelledby="wird-today-title"
        >
          <div className="flex items-end justify-between gap-3 mb-2">
            <h2 id="wird-today-title" className="text-xl font-extrabold text-foreground">
              {isArabic ? "????? ?????" : "Today's reading"}
            </h2>
          </div>

          <div className="flex flex-col gap-1 mb-4">
            <div className="text-lg font-bold text-primary" dir="auto">
              {isArabic ? "???????" : "Pages"} {formatNumerals(position.page, language)}
              {remaining > 0 ? "�" + formatNumerals(targetEndPage, language) : ""}
            </div>
            <div className="text-sm font-medium text-muted-foreground" dir="auto">
              {positionSurah} � {isArabic ? "?????" : "Juz"} {formatNumerals(positionJuz, language)}
            </div>
          </div>

          <div className="flex items-center justify-between mb-2 text-sm font-bold text-foreground">
            <span>
              {formatNumerals(read, language)} {isArabic ? "??" : "of"} {formatNumerals(goal, language)}{" "}
              {isArabic ? "??????" : "completed"}
            </span>
          </div>

          <ProgressBar
            aria-label={t(language, "mushaf.todayProgress", {
              read: formatNumerals(read, language),
              goal: formatNumerals(goal, language),
            })}
            value={Math.min(read, goal)}
            max={goal}
            height={8}
            direction={direction}
          />

          {remaining > 0 ? (
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {isArabic ? "???? ?? ??????" : "Continue from page"} {formatNumerals(position.page, language)}
            </p>
          ) : (
            <div className="mt-3 flex items-center gap-2 text-primary font-bold">
              <Check size={16} />
              <span>{isArabic ? "????? ??? ?????" : "Today's Wird complete"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-btn bg-primary px-4 text-sm font-extrabold text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <BookOpen size={18} aria-hidden="true" />
            {t(language, "mushaf.continueReading")}
            <ArrowNext size={18} aria-hidden="true" />
          </button>

          {read > 0 && (
            <button
              type="button"
              onClick={onUndoPage}
              className="mt-2 flex min-h-11 items-center gap-1 rounded-xl px-3 text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <Undo size={16} aria-hidden="true" />
              {t(language, "mushaf.undoLastPage")}
            </button>
          )}
        </section>

        {/* KHATMAH PROGRESS */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base font-extrabold text-foreground">
              {isArabic ? "?????? ???????" : "Current Khatmah"}
            </h2>
            <span className="text-sm font-bold text-primary">{formatNumerals(khatmahPercent, language)}%</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground mb-3">
            {formatNumerals(khatmahPagesRead, language)} / {formatNumerals(TOTAL_PAGES, language)}{" "}
            {isArabic ? "????" : "pages"}
          </div>
          <ProgressBar
            aria-label={t(language, "mushaf.todayProgress", {
              read: formatNumerals(read, language),
              goal: formatNumerals(goal, language),
            })}
            value={khatmahPagesRead}
            max={TOTAL_PAGES}
            height={6}
            direction={direction}
          />
        </section>

        {/* PLAN DRAFTING */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-base font-extrabold text-foreground">{t(language, "mushaf.planTitle")}</h2>
              {!isDrafting && (
                <p className="mt-1 text-sm font-medium text-muted-foreground">{planLabel(language, plan)}</p>
              )}
            </div>
            {!isDrafting && (
              <button onClick={() => setIsDrafting(true)} className="text-sm font-bold text-primary hover:underline">
                {isArabic ? "?????" : "Edit"}
              </button>
            )}
          </div>

          {isDrafting ? (
            <div className="border-t border-border/60 pt-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">
                  {isArabic ? "??? ?????" : "Plan type"}
                </label>
                <Select
                  value={draftPlan.kind === "daily" ? "daily" : "custom"}
                  onValueChange={(val) => {
                    if (val === "daily") {
                      setDraftPlan({ kind: "daily", dailyPages: 4 });
                    } else {
                      setDraftPlan({
                        kind: "custom",
                        durationDays: 30,
                        dailyPages: Math.ceil(Math.max(0, TOTAL_PAGES - position.page) / 30),
                        startedDayKey: todayKey,
                        startPage: position.page,
                      });
                    }
                  }}
                >
                  <SelectTrigger aria-label={isArabic ? "????? ?????" : "Change plan"} className="font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent dir={direction} position="popper">
                    <SelectItem value="daily">
                      <div className="flex flex-col text-start">
                        <span>{isArabic ? "????? ?????" : "Pages per day"}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {isArabic ? "???? ??? ?????? ?? ???" : "Read the same amount every day"}
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="custom">
                      <div className="flex flex-col text-start">
                        <span>{isArabic ? "????? ??????" : "Finish by a date"}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {isArabic ? "???? ?????? ??? ??????" : "The daily amount adapts if you read more or less"}
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {draftPlan.kind === "daily" ? (
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isArabic ? "????? ?? ?????" : "Pages per day"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={draftPlan.dailyPages}
                    onChange={(e) =>
                      setDraftPlan({ ...draftPlan, dailyPages: Math.max(1, Number(e.target.value) || 1) })
                    }
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">
                    {isArabic ? "????? ???????? (????)" : "Finish in (days)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="604"
                    value={draftPlan.durationDays ?? 30}
                    onChange={(e) => {
                      const days = Math.max(1, Number(e.target.value) || 1);
                      setDraftPlan({
                        kind: "custom",
                        durationDays: days,
                        dailyPages: Math.ceil(Math.max(0, TOTAL_PAGES - position.page) / days),
                        startedDayKey: todayKey,
                        startPage: position.page,
                      });
                    }}
                    className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-bold text-foreground focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  />
                </div>
              )}

              <div className="rounded-xl bg-muted p-4 flex flex-col gap-1">
                <div className="text-sm font-medium text-foreground">
                  {isArabic ? "?????" : "Around"}{" "}
                  <span className="font-bold text-primary">{formatNumerals(draftGoal, language)}</span>{" "}
                  {isArabic ? "???? / ???" : "pages/day"}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {isArabic ? "????? ???????? ???????:" : "Estimated completion:"}{" "}
                  <span className="font-bold">{draftCompletionDate}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    setDraftPlan(plan);
                    setIsDrafting(false);
                  }}
                  className="flex-1 rounded-xl border border-border py-2.5 font-bold hover:bg-muted"
                >
                  {isArabic ? "?????" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    onPlanChange(draftPlan);
                    setIsDrafting(false);
                  }}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground py-2.5 font-bold hover:bg-primary/90"
                >
                  {isArabic ? "??? ?????" : "Save plan"}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* WEEKLY PROGRESS */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-xs" aria-labelledby="wird-week-title">
          <h2 id="wird-week-title" className="text-base font-extrabold text-foreground">
            {t(language, "mushaf.thisWeek")}
          </h2>
          <div className="mt-4 flex flex-col gap-3" role="list" aria-label={t(language, "mushaf.thisWeek")}>
            {week.map((dayKey) => {
              const count = (wirdHistory[dayKey] ?? []).length;
              // We compare against the current goal. A fully accurate history would store daily goals, but we estimate against the current goal for visual simplicity.
              const dayGoal = goal;

              const dayLabel = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
                weekday: "short",
              }).format(new Date(dayKey + "T12:00:00"));

              const isToday = dayKey === todayKey;

              return (
                <div
                  key={dayKey}
                  role="listitem"
                  className={"flex items-center justify-between p-3 rounded-xl " + (isToday ? "bg-muted" : "")}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-[0.875rem] font-bold text-foreground">{dayLabel}</span>
                    {count >= dayGoal && dayGoal > 0 ? (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5" />
                    )}
                  </div>
                  <bdi dir="ltr" className="text-[0.875rem] font-bold text-muted-foreground">
                    {count > 0 ? (
                      <>
                        <span className={count >= dayGoal ? "text-foreground" : ""}>
                          {formatNumerals(count, language)}
                        </span>{" "}
                        / {formatNumerals(dayGoal, language)}
                      </>
                    ) : (
                      <span>�</span>
                    )}
                  </bdi>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </ScreenContainer>
  );
}
