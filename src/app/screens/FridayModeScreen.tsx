import { useState, type ReactNode } from "react";
import { Header } from "../components/LayoutShells";
import { ScreenContainer } from "../components/ScreenContainer";
import { formatNumerals, formatRatio } from "../formatting";
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
  Sparkles,
  User,
} from "../components/icons";
import { t } from "../i18n";
import { fridayChecklistKey, fridayKahfOpenedKey, readFridaySalawatProgress } from "../fridayProgress";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { TimeOfDayBackground } from "../components/TimeOfDayBackground";
import { registerLazyCollection } from "../content/azkar";

registerLazyCollection("friday_kahf", FRIDAY_KAHF);

const KAHF_VERSE_COUNT = 110;
const COMPREHENSIVE_DUA_COUNT = 47;

type PracticeId = "ghusl" | "siwak" | "perfume" | "best_clothes" | "early" | "walking" | "listen";

const PRACTICE_IDS: PracticeId[] = ["ghusl", "siwak", "perfume", "best_clothes", "early", "walking", "listen"];

function loadChecklist(): Set<PracticeId> {
  try {
    const stored = JSON.parse(localStorage.getItem(fridayChecklistKey()) ?? "[]");
    return new Set(Array.isArray(stored) ? stored.filter((id): id is PracticeId => PRACTICE_IDS.includes(id)) : []);
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
  duasCompletedCount,
  onBack,
  onStartKahf,
  onOpenSalawat,
  onStartDuasSession,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  kahfCompletedCount: number;
  duasCompletedCount: number;
  onBack: () => void;
  onStartKahf: () => void;
  onOpenSalawat: () => void;
  onStartDuasSession: () => void;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const [checkedPractices, setCheckedPractices] = useState(loadChecklist);
  const [salawatProgress] = useState(readFridaySalawatProgress);
  const [kahfStarted] = useState(() => {
    try {
      return localStorage.getItem(fridayKahfOpenedKey()) === "true";
    } catch {
      return false;
    }
  });

  const kahfProgress = kahfCompletedCount > 0 ? KAHF_VERSE_COUNT : 0;
  const kahfComplete = kahfProgress === KAHF_VERSE_COUNT;
  const salawatComplete = salawatProgress.count >= salawatProgress.target;
  const duasComplete = duasCompletedCount >= COMPREHENSIVE_DUA_COUNT;
  const completedCount =
    checkedPractices.size + (kahfComplete ? 1 : 0) + (salawatComplete ? 1 : 0) + (duasComplete ? 1 : 0);
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
    <ScreenContainer dir={direction} className="px-0 relative" data-testid="friday-mode-screen">
      <TimeOfDayBackground categoryId="friday" />
      <Header
        onBack={onBack}
        title={t(language, "friday.title")}
        subtitle={t(language, "friday.subtitle")}
        language={language}
      />

      <div className="relative z-10 flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-8 pt-3">
        <section className="shrink-0 overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-card p-5 backdrop-blur-xl shadow-lg shadow-black/5">
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
          className="shrink-0 rounded-3xl border border-border/40 bg-card p-5 backdrop-blur-xl shadow-lg shadow-black/5"
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
            {t(language, kahfStarted && !kahfComplete ? "friday.kahfContinue" : "friday.kahfStart")}
          </button>
        </section>

        <button
          type="button"
          onClick={onOpenSalawat}
          aria-labelledby="salawat-heading"
          className="flex min-h-24 shrink-0 items-center gap-4 rounded-3xl border border-border/40 bg-card p-5 text-start backdrop-blur-xl shadow-lg shadow-black/5 hover:border-amber-500/40 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <Heart size={24} className="fill-current/15" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span id="salawat-heading" className="block text-[1rem] font-black text-foreground">
              {t(language, "friday.salawatHeading")}
            </span>
            <span className="mt-1 block text-[0.8125rem] font-semibold text-muted-foreground">
              {formatRatio(salawatProgress.count, salawatProgress.target, language)}
            </span>
          </span>
          {salawatComplete ? (
            <CheckCircle2 size={22} className="shrink-0 text-emerald-500" aria-hidden="true" />
          ) : (
            <ChevronNext size={20} className="shrink-0 text-muted-foreground rtl:scale-x-[-1]" aria-hidden="true" />
          )}
        </button>

        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`friday-${section.items[0]?.id}`} className="shrink-0">
            <h2 id={`friday-${section.items[0]?.id}`} className="mb-2 px-1 text-[0.9375rem] font-black text-foreground">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card backdrop-blur-xl shadow-lg shadow-black/5">
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

        <button
          type="button"
          onClick={onStartDuasSession}
          className="flex min-h-24 shrink-0 items-center gap-3 rounded-3xl border border-border/40 bg-card p-5 text-start backdrop-blur-xl shadow-lg shadow-black/5 hover:border-amber-500/40 hover:shadow-xl transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Clock size={23} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.875rem] font-black text-foreground">{t(language, "friday.responseHourHeading")}</p>
            <p className="mt-0.5 text-[0.75rem] font-semibold leading-5 text-muted-foreground">
              {t(language, "friday.responseHourBody")}
            </p>
            <p className="mt-1 text-[0.75rem] font-black text-amber-700 dark:text-amber-300">
              {t(language, "friday.duasHeading")} · {formatRatio(duasCompletedCount, COMPREHENSIVE_DUA_COUNT, language)}
            </p>
          </div>
          {duasComplete ? (
            <CheckCircle2 size={22} className="shrink-0 text-emerald-500" aria-hidden="true" />
          ) : (
            <ChevronNext size={20} className="shrink-0 text-muted-foreground rtl:scale-x-[-1]" aria-hidden="true" />
          )}
        </button>
      </div>
    </ScreenContainer>
  );
}
