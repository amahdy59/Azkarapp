import { BookOpen, ArrowNext, CheckCircle2, Calendar } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, QuranReadingPosition, QuranWirdPlan } from "../types";
import { getSurahDisplayName } from "../content/surahInfo";
import { getQuranWirdGoal } from "../screens/quranWirdGoal";
import { getProgressDayKey } from "../progress";
import { formatNumerals } from "../formatting";

export function QuranHomeCard({
  language,
  direction,
  position,
  plan,
  wirdHistory,
  progressDayStartHour,
  now,
  onContinue,
  onOverview,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  position?: QuranReadingPosition;
  plan?: QuranWirdPlan;
  wirdHistory: Record<string, number[]>;
  progressDayStartHour: number;
  now: Date;
  onContinue: () => void;
  onOverview: () => void;
}) {
  const surahName = getSurahDisplayName(position?.surahNumber ?? 1, language);
  const pageNumber = position?.page ?? 1;
  const hasReadingActivity =
    Boolean(plan?.startedDayKey) || pageNumber > 1 || Object.values(wirdHistory).some((pages) => pages.length > 0);
  const textAlignment = direction === "rtl" ? "text-right" : "text-left";

  if (!plan || !hasReadingActivity) {
    // First-time user state
    return (
      <div className={`px-page mt-2 mb-2 ${textAlignment}`} dir={direction}>
        <div className="flex flex-col rounded-2xl bg-card border border-border p-4 shadow-raised">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={20} />
            </div>
            <div className={`flex-1 ${textAlignment}`}>
              <div className="text-[1.05rem] font-bold text-foreground" dir={direction}>
                {t(language, "home.khatmahTitle")}
              </div>
            </div>
          </div>
          <div className="text-[0.875rem] font-medium text-muted-foreground mb-4" dir={direction}>
            {t(language, "mushaf.wirdIntro")}
          </div>
          <button
            type="button"
            data-testid="home-quran-overview"
            onClick={onOverview}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-primary-foreground font-bold transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {t(language, "mushaf.setPlan")}
          </button>
        </div>
      </div>
    );
  }

  // Returning user state
  const todayKey = getProgressDayKey(now, progressDayStartHour);
  const completedPages = wirdHistory[todayKey] ?? [];
  const read = completedPages.length;
  const goalResult = getQuranWirdGoal(plan, wirdHistory, todayKey);
  const goal = goalResult.dailyGoal;

  const isComplete = read >= goal && goal > 0;

  return (
    <div className={`px-page mt-2 mb-2 ${textAlignment}`} dir={direction}>
      <div className="flex flex-col rounded-2xl bg-card border border-border shadow-raised overflow-hidden">
        {/* Main Content Area: Continue Reading */}
        <div className={`flex flex-col items-start p-4 ${textAlignment}`}>
          <div className="flex items-center w-full gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen size={20} />
            </div>
            <div className="flex-1">
              <div
                className="text-[0.8125rem] font-medium text-primary mb-0.5 uppercase tracking-wider"
                dir={direction}
              >
                {t(language, "common.mushaf")}
              </div>
              <div className="text-[1.05rem] font-bold text-foreground" dir={direction}>
                {surahName} · {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
              </div>
            </div>
          </div>

          {goalResult.expired ? (
            <div className="mb-3 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-[0.8125rem] font-semibold text-foreground">
              {t(language, "mushaf.planExpired")}
            </div>
          ) : isComplete ? (
            <div className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-success bg-success/15 px-2.5 py-1 rounded-full mb-3 shrink-0">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{t(language, "mushaf.wirdCompleteShort")}</span>
            </div>
          ) : null}

          {goal > 0 && !isComplete && (
            <div className="mb-3 w-full">
              <div className="flex justify-between items-center mb-1.5 text-[0.8125rem] font-semibold text-foreground">
                <span>{t(language, "mushaf.wirdToday")}</span>
                <span className="text-muted-foreground">
                  {formatNumerals(read, language)} /{" "}
                  {t(language, "mushaf.pagesCount", { count: formatNumerals(goal, language) })}
                </span>
              </div>
              <div className="h-1.5 w-full bg-current/10 rounded-full overflow-hidden">
                <div
                  role="progressbar"
                  aria-label={t(language, "mushaf.todayProgress", {
                    read: formatNumerals(read, language),
                    goal: formatNumerals(goal, language),
                  })}
                  aria-valuemin={0}
                  aria-valuemax={goal}
                  aria-valuenow={Math.min(read, goal)}
                  className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${Math.min(100, Math.max(0, (read / goal) * 100))}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onContinue}
            className="mt-3 flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-[0.875rem] font-bold text-primary hover:bg-muted hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span>{t(language, "mushaf.continueReading")}</span>
            <ArrowNext size={16} data-rtl-flip aria-hidden="true" />
          </button>
        </div>

        <div className="h-px w-full bg-border" />

        <button
          type="button"
          onClick={onOverview}
          className="flex min-h-11 w-full items-center justify-between p-4 text-[0.875rem] font-semibold text-foreground hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span>{t(language, "mushaf.planAndProgress")}</span>
          </div>
          <ArrowNext size={16} data-rtl-flip aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
