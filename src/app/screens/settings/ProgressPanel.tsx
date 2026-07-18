import { CheckCircle2, Flame } from "../../components/icons";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useMemo, useState } from "react";
import { CATEGORIES } from "../../content/categories";
import { formatNumerals } from "../../formatting";
import { t } from "../../i18n";
import type { AppLanguage, CategoryId, StoredSession } from "../../types";
import { ProgressBar } from "../../components/ProgressBar";
import { SubHeader } from "./SettingsPrimitives";

type Period = "week" | "month" | "year";

const dayKey = (value: Date) => `${value.getFullYear()}-${value.getMonth()}-${value.getDate()}`;

export function getWeeklyCompletedDays(sessions: StoredSession[], category: CategoryId, now = new Date()) {
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));

  return new Set(
    sessions
      .filter(
        (session) => session.isComplete && session.category === category && new Date(session.completedAt) >= weekStart,
      )
      .map((session) => dayKey(new Date(session.completedAt))),
  ).size;
}

export function ProgressPanel({
  onBack,
  language,
  direction,
  sessions,
  currentStreak,
  longestStreak,
  weeklyGoalDays,
  onWeeklyGoalDaysChange,
}: {
  onBack: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  sessions: StoredSession[];
  currentStreak: number;
  longestStreak: number;
  weeklyGoalDays: number;
  onWeeklyGoalDaysChange: (value: number) => void;
}) {
  const [period, setPeriod] = useState<Period>("week");
  const [category, setCategory] = useState<CategoryId>("morning");
  const isArabic = language === "ar";
  const filtered = sessions.filter((session) => session.category === category && session.isComplete);
  const totalCompleted = sessions.reduce((sum, session) => sum + session.completedCount, 0);
  const completedGoalDays = getWeeklyCompletedDays(sessions, category);
  const activity = useMemo(() => {
    const byDay = new Map<string, number>();
    filtered.forEach((session) => byDay.set(dayKey(new Date(session.completedAt)), session.completedCount));
    return byDay;
  }, [filtered]);
  const days = Array.from({ length: period === "week" ? 7 : period === "month" ? 35 : 84 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - index);
    return { date, count: activity.get(dayKey(date)) ?? 0 };
  }).reverse();

  return (
    <div className="slide-in-from-right flex h-full flex-col bg-background">
      <SubHeader title={t(language, "progressPanel.title")} onBack={onBack} language={language} />
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        <section className="rounded-2xl border border-border bg-card px-6 py-4 text-end">
          <p className="text-[12px] text-muted-foreground">{isArabic ? "منذ بداية الاستخدام" : "Since you started"}</p>
          <p className="mt-2 text-[14px] font-bold text-foreground">
            {isArabic ? "إجمالي الأذكار المكتملة" : "Total azkar completed"}
          </p>
          <p className="mt-1 text-[36px] font-extrabold text-foreground">{formatNumerals(totalCompleted, language)}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="weekly-goal-title">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="weekly-goal-title" className="text-[15px] font-bold text-foreground">
              {t(language, "progressPanel.weeklyGoal")}
            </h2>
            <p className="text-[13px] font-semibold text-muted-foreground">
              {t(language, "progressPanel.goalProgress", {
                done: formatNumerals(Math.min(completedGoalDays, weeklyGoalDays), language),
                goal: formatNumerals(weeklyGoalDays, language),
              })}
            </p>
          </div>
          <ProgressBar
            value={Math.min(completedGoalDays, weeklyGoalDays)}
            max={weeklyGoalDays}
            height={7}
            trackColor="var(--muted)"
            aria-label={t(language, "progressPanel.goalProgress", { done: completedGoalDays, goal: weeklyGoalDays })}
          />
          <RadioGroupPrimitive.Root
            className="mt-4"
            dir={direction}
            value={String(weeklyGoalDays)}
            onValueChange={(value) => onWeeklyGoalDaysChange(Number(value))}
            aria-label={t(language, "progressPanel.chooseGoal")}
          >
            <p className="mb-2 text-[12px] font-semibold text-muted-foreground">
              {t(language, "progressPanel.chooseGoal")}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 7].map((goal) => (
                <RadioGroupPrimitive.Item
                  key={goal}
                  value={String(goal)}
                  className={`min-h-11 rounded-xl border px-2 text-[13px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    weeklyGoalDays === goal
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground"
                  }`}
                >
                  {formatNumerals(goal, language)}
                </RadioGroupPrimitive.Item>
              ))}
            </div>
          </RadioGroupPrimitive.Root>
        </section>

        <div className="flex justify-center gap-2" aria-label="Category filter">
          {CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={category === item.id}
              onClick={() => setCategory(item.id)}
              className={`min-h-11 rounded-full border px-4 text-[13px] font-semibold ${category === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground"}`}
            >
              {isArabic ? item.nameArabic.replace("أذكار ", "") : item.name.replace(" Azkar", "")}
            </button>
          ))}
        </div>

        <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="activity-title">
          <p id="activity-title" className="text-center text-[12px] text-muted-foreground">
            <Flame className="inline text-primary" size={14} /> {formatNumerals(currentStreak, language)}{" "}
            {isArabic ? "أيام · أفضل:" : "day streak · Best:"} {formatNumerals(longestStreak, language)}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-border p-1">
            {(["week", "month", "year"] as Period[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                aria-pressed={period === value}
                className={`min-h-11 rounded-lg text-[12px] font-bold ${period === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                {isArabic ? { week: "أسبوع", month: "شهر", year: "سنة" }[value] : value}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center text-muted-foreground">
            <span className="text-[13px] font-semibold">
              {new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en", { month: "long", year: "numeric" }).format(
                new Date(),
              )}
            </span>
          </div>
          <div
            className={`mt-4 grid gap-1.5 ${period === "week" ? "grid-cols-7" : "grid-cols-7"}`}
            role="img"
            aria-label={`${filtered.length} completed sessions`}
          >
            {days.map(({ date, count }) => (
              <span
                key={date.toISOString()}
                title={`${date.toLocaleDateString()}: ${count}`}
                className={`aspect-square rounded-md border ${count > 0 ? "border-primary bg-primary" : "border-border bg-muted"}`}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[15px] font-bold text-foreground">
            {isArabic ? "الجلسات الأخيرة" : "Recent sessions"}
          </h2>
          <div className="space-y-2">
            {filtered.slice(0, 3).map((session) => (
              <article
                key={session.id}
                className="flex min-h-[66px] items-center gap-3 rounded-xl border border-border bg-card px-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-foreground">
                    {new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en", { dateStyle: "medium" }).format(
                      new Date(session.completedAt),
                    )}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {formatNumerals(session.completedCount, language)} {isArabic ? "ذكر" : "azkar"} ·{" "}
                    {formatNumerals(Math.max(1, Math.round(session.durationSeconds / 60)), language)}{" "}
                    {isArabic ? "دقائق" : "min"}
                  </p>
                </div>
                <CheckCircle2 size={20} className="text-primary" />
              </article>
            ))}
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
                {isArabic ? "ستظهر جلساتك المكتملة هنا" : "Completed sessions will appear here."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
