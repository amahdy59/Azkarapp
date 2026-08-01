import { useState, type ReactNode } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import {
  BookOpen,
  Building,
  Check,
  CheckCircle2,
  ChevronNext,
  Clock,
  Droplets,
  Heart,
  RotateCcw,
  Sparkles,
  User,
} from "../components/icons";
import { t } from "../i18n";
import { fridayChecklistKey } from "../fridayProgress";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { registerLazyCollection } from "../content/azkar";

registerLazyCollection("friday_kahf", FRIDAY_KAHF);

const SALAWAT_KEY = "azkarapp_salawat_friday_count";
const KAHF_VERSE_COUNT = 110;

type PracticeId =
  "ghusl" | "siwak" | "perfume" | "best_clothes" | "early" | "walking" | "listen" | "salawat" | "dua_after_asr";

function loadChecklist(): Set<PracticeId> {
  try {
    const stored = JSON.parse(localStorage.getItem(fridayChecklistKey()) ?? "[]");
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

function PracticeRow({
  label,
  icon,
  checked,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onClick}
      className="flex min-h-12 w-full items-center gap-3 border-b border-border/70 px-3 py-2.5 text-start last:border-b-0 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span
        className={`flex size-6 shrink-0 items-center justify-center rounded-lg border transition-colors ${
          checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-border bg-background text-transparent"
        }`}
        aria-hidden="true"
      >
        <Check size={15} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1 text-[0.875rem] font-extrabold text-foreground">{label}</span>
      <span className="text-amber-600 dark:text-amber-400" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}

export function FridayModeScreen({
  isArabic,
  direction,
  kahfCompletedCount,
  onBack,
  onStartKahf,
  onStartDuasSession,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  kahfCompletedCount: number;
  onBack: () => void;
  onStartKahf: () => void;
  onStartDuasSession: () => void;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const [checkedPractices, setCheckedPractices] = useState(loadChecklist);
  const [salawatCount, setSalawatCount] = useState<number>(() => {
    try {
      const stored = Number.parseInt(localStorage.getItem(SALAWAT_KEY) ?? "0", 10);
      return Number.isFinite(stored) ? stored : 0;
    } catch {
      return 0;
    }
  });

  const kahfProgress = Math.min(kahfCompletedCount, KAHF_VERSE_COUNT);
  const kahfComplete = kahfProgress === KAHF_VERSE_COUNT;
  const completedCount = checkedPractices.size + (kahfComplete ? 1 : 0);
  const totalPractices = 10;

  const persistChecklist = (next: Set<PracticeId>) => {
    setCheckedPractices(next);
    try {
      localStorage.setItem(fridayChecklistKey(), JSON.stringify([...next]));
    } catch {
      // Local progress remains usable for this session when storage is unavailable.
    }
  };

  const togglePractice = (id: PracticeId) => {
    const next = new Set(checkedPractices);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistChecklist(next);
  };

  const handleIncrementSalawat = () => {
    const nextCount = salawatCount + 1;
    setSalawatCount(nextCount);
    const nextPractices = new Set(checkedPractices).add("salawat");
    persistChecklist(nextPractices);
    try {
      localStorage.setItem(SALAWAT_KEY, String(nextCount));
    } catch {
      // Non-fatal storage failure.
    }
  };

  const handleResetSalawat = () => {
    setSalawatCount(0);
    try {
      localStorage.setItem(SALAWAT_KEY, "0");
    } catch {
      // Non-fatal storage failure.
    }
  };

  const sections: Array<{
    title: string;
    items: Array<{ id: PracticeId; label: string; icon: ReactNode }>;
  }> = [
    {
      title: t(language, "friday.preparationHeading"),
      items: [
        { id: "ghusl", label: t(language, "friday.ghusl"), icon: <Droplets size={19} /> },
        { id: "siwak", label: t(language, "friday.siwak"), icon: <Sparkles size={19} /> },
        { id: "perfume", label: t(language, "friday.perfume"), icon: <Sparkles size={19} /> },
        { id: "best_clothes", label: t(language, "friday.bestClothes"), icon: <User size={19} /> },
      ],
    },
    {
      title: t(language, "friday.goingHeading"),
      items: [
        { id: "early", label: t(language, "friday.goEarly"), icon: <Clock size={19} /> },
        { id: "walking", label: t(language, "friday.walkIfPossible"), icon: <User size={19} /> },
        { id: "listen", label: t(language, "friday.listenToKhutbah"), icon: <Building size={19} /> },
      ],
    },
  ];

  return (
    <ScreenContainer dir={direction} className="px-0">
      <Header
        onBack={onBack}
        title={t(language, "friday.title")}
        subtitle={t(language, "friday.subtitle")}
        language={language}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8 pt-3">
        <section className="shrink-0 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="text-start">
              <p className="text-[0.75rem] font-black uppercase tracking-wide text-amber-700 dark:text-amber-300">
                {t(language, "friday.todayPractices")}
              </p>
              <h2 className="mt-1 text-[1.5rem] font-black text-foreground">{t(language, "friday.blessedFriday")}</h2>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 shadow-sm">
              <Sparkles size={25} />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between text-[0.75rem] font-extrabold text-muted-foreground">
            <span>{t(language, "friday.weeklyProgress")}</span>
            <span>
              {formatNumerals(completedCount, language)} / {formatNumerals(totalPractices, language)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/80" aria-hidden="true">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width]"
              style={{ width: `${(completedCount / totalPractices) * 100}%` }}
            />
          </div>
        </section>

        <section
          aria-labelledby="kahf-heading"
          className="shrink-0 rounded-3xl border border-amber-500/35 bg-card p-5 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
              <BookOpen size={29} />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h2 id="kahf-heading" className="text-[1.125rem] font-black text-foreground">
                {t(language, "friday.kahfHeading")}
              </h2>
              <p className="mt-1 text-[0.8125rem] font-semibold text-muted-foreground">
                {t(language, "friday.kahfVerseProgress", {
                  done: formatNumerals(kahfProgress, language),
                  total: formatNumerals(KAHF_VERSE_COUNT, language),
                })}
              </p>
            </div>
            {kahfComplete && <CheckCircle2 size={22} className="shrink-0 text-emerald-500" aria-hidden="true" />}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-amber-500 transition-[width]"
              style={{ width: `${(kahfProgress / KAHF_VERSE_COUNT) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={onStartKahf}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-4 text-[0.9375rem] font-black text-white shadow-sm transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:bg-amber-500 dark:text-slate-950"
          >
            <BookOpen size={19} />
            {t(language, kahfProgress > 0 && !kahfComplete ? "friday.kahfContinue" : "friday.kahfStart")}
          </button>
        </section>

        <section
          aria-labelledby="salawat-heading"
          className="shrink-0 rounded-3xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleIncrementSalawat}
              aria-label={t(language, "friday.salawatCounterAriaLabel", {
                count: formatNumerals(salawatCount, language),
              })}
              className="flex size-20 shrink-0 items-center justify-center rounded-full border-4 border-amber-500/70 bg-amber-500/10 text-[1.5rem] font-black text-amber-700 shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:text-amber-300"
            >
              {formatNumerals(salawatCount, language)}
            </button>
            <button type="button" onClick={handleIncrementSalawat} className="min-w-0 flex-1 text-start">
              <span className="flex items-center gap-2">
                <Heart size={19} className="fill-rose-500/15 text-rose-500" />
                <span id="salawat-heading" className="text-[0.9375rem] font-black text-foreground">
                  {t(language, "friday.salawatHeading")}
                </span>
              </span>
              <span className="mt-1 block text-[0.75rem] font-semibold text-muted-foreground">
                {t(language, "friday.salawatTapHint")}
              </span>
            </button>
            {salawatCount > 0 && (
              <button
                type="button"
                onClick={handleResetSalawat}
                aria-label={t(language, "friday.salawatResetAriaLabel")}
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <RotateCcw size={18} />
              </button>
            )}
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`friday-${section.items[0]?.id}`} className="shrink-0">
            <h2 id={`friday-${section.items[0]?.id}`} className="mb-2 px-1 text-[0.9375rem] font-black text-foreground">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {section.items.map((item) => (
                <PracticeRow
                  key={item.id}
                  label={item.label}
                  icon={item.icon}
                  checked={checkedPractices.has(item.id)}
                  onClick={() => togglePractice(item.id)}
                />
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="friday-day-practices" className="shrink-0">
          <h2 id="friday-day-practices" className="mb-2 px-1 text-[0.9375rem] font-black text-foreground">
            {t(language, "friday.dayHeading")}
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <PracticeRow
              label={t(language, "friday.kahfHeading")}
              icon={<BookOpen size={19} />}
              checked={kahfComplete}
              onClick={onStartKahf}
            />
            <PracticeRow
              label={t(language, "friday.increaseSalawat")}
              icon={<Heart size={19} />}
              checked={checkedPractices.has("salawat")}
              onClick={() => togglePractice("salawat")}
            />
            <PracticeRow
              label={t(language, "friday.duaAfterAsr")}
              icon={<Clock size={19} />}
              checked={checkedPractices.has("dua_after_asr")}
              onClick={() => togglePractice("dua_after_asr")}
            />
          </div>
        </section>

        <aside className="flex shrink-0 items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-start">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Clock size={23} />
          </div>
          <div>
            <p className="text-[0.875rem] font-black text-foreground">{t(language, "friday.responseHourHeading")}</p>
            <p className="mt-0.5 text-[0.75rem] font-semibold leading-5 text-muted-foreground">
              {t(language, "friday.responseHourBody")}
            </p>
          </div>
        </aside>

        <button
          type="button"
          onClick={onStartDuasSession}
          className="flex min-h-14 shrink-0 items-center gap-3 rounded-2xl border border-border bg-card px-4 text-start shadow-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300">
            <BookOpen size={21} />
          </span>
          <span className="flex-1 text-[0.9375rem] font-black text-foreground">
            {t(language, "friday.duasHeading")}
          </span>
          <ChevronNext size={20} className="text-muted-foreground" aria-hidden="true" />
        </button>
      </div>
    </ScreenContainer>
  );
}
