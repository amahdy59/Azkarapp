import { BookOpen, MapPin } from "./icons";
import { t } from "../i18n";
import type { AppLanguage, DailyHabitId, DailyHabitCompletion } from "../types";

export function DailyCompanionsCard({
  language,
  dailyHabits,
  todayKey,
  onToggleHabit,
}: {
  language: AppLanguage;
  dailyHabits: DailyHabitCompletion[];
  todayKey: string;
  onToggleHabit: (habitId: DailyHabitId) => void;
}) {
  const isArabic = language === "ar";
  const todayHabits = new Set(dailyHabits.filter((h) => h.dayKey === todayKey).map((h) => h.habit));

  const hasQuran = todayHabits.has("quran_wird");
  const hasMosque = todayHabits.has("mosque_5") || todayHabits.has("mosque_3");

  const toggleMosque = () => {
    // Cycle: None -> 3 Prayers -> 5 Prayers -> None
    // To simplify: Just toggle "mosque_5" for now, or user can cycle.
    if (todayHabits.has("mosque_5")) {
      onToggleHabit("mosque_5"); // untoggle
    } else if (todayHabits.has("mosque_3")) {
      onToggleHabit("mosque_3"); // untoggle 3
      onToggleHabit("mosque_5"); // toggle 5
    } else {
      onToggleHabit("mosque_3"); // toggle 3
    }
  };

  const toggleQuran = () => onToggleHabit("quran_wird");

  // State text
  const mosqueState = todayHabits.has("mosque_5")
    ? t(language, "progress.mosque5")
    : todayHabits.has("mosque_3")
      ? t(language, "progress.mosque3")
      : t(language, "progress.mosqueNone");

  return (
    <section
      data-testid="daily-companions-card"
      dir={isArabic ? "rtl" : "ltr"}
      className="overflow-hidden rounded-[30px] border border-border bg-card text-foreground shadow-raised"
    >
      <div className="border-b border-border/70 bg-muted/35 px-4 py-4 sm:px-6">
        <h2 className="text-[1.125rem] font-black leading-tight text-foreground" dir="auto">
          {t(language, "home.dailyCompanions")}
        </h2>
        <p className="mt-1 text-[0.8125rem] font-semibold leading-5 text-muted-foreground" dir="auto">
          {t(language, "home.dailyCompanionsDesc")}
        </p>
      </div>

      <div className="divide-y divide-border/60">
        <button
          type="button"
          onClick={toggleQuran}
          className="flex w-full items-center justify-between px-4 py-4 text-start transition-colors hover:bg-muted/50 active:bg-muted sm:px-6"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex size-10 items-center justify-center rounded-2xl ${hasQuran ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
            >
              <BookOpen size={20} strokeWidth={hasQuran ? 2.5 : 2} aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[0.9375rem] font-bold text-foreground">
                {t(language, "progress.quranWird")}
              </span>
              <span
                className={`block text-[0.8125rem] font-semibold ${hasQuran ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
              >
                {hasQuran ? t(language, "progress.completed") : t(language, "progress.markComplete")}
              </span>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={toggleMosque}
          className="flex w-full items-center justify-between px-4 py-4 text-start transition-colors hover:bg-muted/50 active:bg-muted sm:px-6"
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex size-10 items-center justify-center rounded-2xl ${hasMosque ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}
            >
              <MapPin size={20} strokeWidth={hasMosque ? 2.5 : 2} aria-hidden="true" />
            </div>
            <div>
              <span className="block text-[0.9375rem] font-bold text-foreground">
                {t(language, "progress.mosquePrayers")}
              </span>
              <span
                className={`block text-[0.8125rem] font-semibold ${hasMosque ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
              >
                {mosqueState}
              </span>
            </div>
          </div>
        </button>
      </div>
    </section>
  );
}
