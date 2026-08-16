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
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  MoonStar,
  Sparkles,
  User,
} from "../components/icons";
import { t } from "../i18n";
import { fridayChecklistKey, fridayKahfOpenedKey, readFridaySalawatProgress } from "../fridayProgress";
import { FRIDAY_KAHF } from "../content/fridayKahf";
import { registerLazyCollection } from "../content/azkar";

registerLazyCollection("friday_kahf", FRIDAY_KAHF);

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
          checked ? "border-success bg-success text-white" : "border-border bg-background text-transparent"
        }`}
        aria-hidden="true"
      >
        <Check size={15} strokeWidth={3} />
      </span>
      <span className="min-w-0 flex-1 text-[0.875rem] font-extrabold text-foreground">{label}</span>
      <span className="text-primary" aria-hidden="true">
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
  duasTotalCount,
  onBack,
  onStartKahf,
  onOpenSalawat,
  onStartDuasSession,
  isDuasLoading = false,
  duasLoadError = false,
  onRetryDuas,
}: {
  isArabic: boolean;
  direction: "ltr" | "rtl";
  kahfCompletedCount: number;
  duasCompletedCount: number;
  duasTotalCount: number;
  onBack: () => void;
  onStartKahf: () => void;
  onOpenSalawat: () => void;
  onStartDuasSession: () => void;
  isDuasLoading?: boolean;
  duasLoadError?: boolean;
  onRetryDuas?: () => void;
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

  // Only two facts are actually persisted: whether the surah was opened this
  // week, and whether it was marked complete. Reporting a verse number from
  // that would be invented precision, so the UI states the status it can prove.
  const kahfComplete = kahfCompletedCount > 0;
  const kahfStatusKey = kahfComplete
    ? "friday.kahfCompleted"
    : kahfStarted
      ? "friday.kahfInProgress"
      : "friday.kahfNotStarted";
  const salawatComplete = salawatProgress.count >= salawatProgress.target;
  const duasComplete = duasTotalCount > 0 && duasCompletedCount >= duasTotalCount;
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
    <ScreenContainer
      dir={direction}
      className="px-0 relative"
      data-testid="friday-mode-screen"
      screenName={t(language, "friday.title")}
    >
      <Header onBack={onBack} title={t(language, "friday.title")} language={language} />

      <div className="page-content-center relative z-10 grid min-h-0 flex-1 auto-rows-max grid-cols-1 gap-4 overflow-y-auto px-5 pb-8 pt-3 lg:grid-cols-2 lg:items-start">
        <section className="shrink-0 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 to-card p-5 shadow-raised lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="text-start">
              <h2 className="mt-1 text-[1.5rem] font-black text-foreground">{t(language, "friday.blessedFriday")}</h2>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
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
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${(completedCount / totalPractices) * 100}%` }}
            />
          </div>
          {completedCount >= totalPractices ? (
            <p role="status" className="mt-3 text-[0.75rem] font-semibold text-success">
              {t(language, "friday.progressComplete")}
            </p>
          ) : completedCount > 0 ? (
            <p className="mt-3 text-[0.75rem] font-semibold text-muted-foreground">
              {t(language, "friday.progressContinue")}
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 border-t border-primary/20 pt-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-background/55 p-3 text-start">
              <h3 className="text-[0.8125rem] font-black text-foreground">{t(language, "friday.kahfHeading")}</h3>
              <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">
                {t(language, "friday.kahfHadith")}
              </p>
              <p className="mt-2 text-[0.6875rem] font-bold text-primary">{t(language, "home.fridayReadingSource")}</p>
            </div>
            <div className="rounded-2xl bg-background/55 p-3 text-start">
              <h3 className="text-[0.8125rem] font-black text-foreground">{t(language, "home.fridayVirtues")}</h3>
              <ul className="mt-1 list-disc space-y-1 ps-4 text-xs font-semibold leading-5 text-muted-foreground">
                <li>{t(language, "home.fridayVirtueFajr")}</li>
                <li>{t(language, "home.fridayVirtueDua")}</li>
              </ul>
            </div>
          </div>
        </section>

        {sections.map((section) => (
          <section key={section.title} aria-labelledby={`friday-${section.items[0]?.id}`} className="shrink-0">
            <h2 id={`friday-${section.items[0]?.id}`} className="mb-2 px-1 text-[0.9375rem] font-black text-foreground">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-3xl border border-border/40 bg-card shadow-raised">
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

        <section
          aria-labelledby="kahf-heading"
          className="shrink-0 rounded-3xl border border-border/40 bg-card p-5 shadow-raised"
        >
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <BookOpen size={29} />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <h2 id="kahf-heading" className="text-[1.125rem] font-black text-foreground">
                {t(language, "friday.kahfHeading")}
              </h2>
              <p className="mt-1 text-[0.8125rem] font-semibold text-muted-foreground">{t(language, kahfStatusKey)}</p>
            </div>
            {kahfComplete && <CheckCircle2 size={22} className="shrink-0 text-success" aria-hidden="true" />}
          </div>
          <button
            type="button"
            onClick={onStartKahf}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-[0.9375rem] font-black text-white shadow-sm transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring dark:bg-primary dark:text-primary-foreground"
          >
            <BookOpen size={19} />
            {t(language, kahfStarted && !kahfComplete ? "friday.kahfContinue" : "friday.kahfStart")}
          </button>
        </section>

        <button
          type="button"
          onClick={onOpenSalawat}
          aria-labelledby="salawat-heading"
          className="flex min-h-24 shrink-0 items-center gap-4 rounded-3xl border border-border/40 bg-card p-5 text-start shadow-raised hover:border-primary/40 transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <MoonStar size={24} className="fill-current/15" aria-hidden="true" />
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
            <CheckCircle2 size={22} className="shrink-0 text-success" aria-hidden="true" />
          ) : direction === "rtl" ? (
            <ChevronLeft size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          onClick={onStartDuasSession}
          disabled={isDuasLoading || duasLoadError}
          aria-busy={isDuasLoading || undefined}
          className="flex min-h-24 shrink-0 items-center gap-3 rounded-3xl border border-border/40 bg-card p-5 text-start shadow-raised hover:border-primary/40 transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring lg:col-span-2"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Clock size={23} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[0.875rem] font-black text-foreground">{t(language, "friday.responseHourHeading")}</p>
            <p className="mt-1 text-[0.75rem] font-black text-primary">
              {t(language, "friday.duasHeading")} · {formatRatio(duasCompletedCount, duasTotalCount, language)}
            </p>
          </div>
          {duasComplete ? (
            <CheckCircle2 size={22} className="shrink-0 text-success" aria-hidden="true" />
          ) : direction === "rtl" ? (
            <ChevronLeft size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <ChevronRight size={20} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
        </button>
        {duasLoadError && (
          <div className="rounded-2xl bg-destructive/10 p-4 text-start lg:col-span-2" role="alert">
            <p className="text-[0.8125rem] font-semibold text-destructive">
              {t(language, "common.contentLoadErrorDescription")}
            </p>
            {onRetryDuas && (
              <button
                type="button"
                onClick={onRetryDuas}
                className="mt-2 min-h-11 rounded-xl border border-destructive/40 px-4 text-[0.8125rem] font-bold text-destructive"
              >
                {t(language, "common.tryAgain")}
              </button>
            )}
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
