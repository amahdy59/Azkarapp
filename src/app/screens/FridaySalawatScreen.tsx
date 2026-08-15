import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { BookOpen, ExternalLink, MoreVertical, RotateCcw, Sparkles, X } from "../components/icons";
import { Header } from "../components/LayoutShells";
import { ProgressBar } from "../components/ProgressBar";
import { Modal } from "../components/ResponsiveSheet";
import { ScreenContainer } from "../components/ScreenContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { ZikrCounterSurface } from "../components/ZikrComponents";
import { formatNumerals } from "../formatting";
import { readFridaySalawatProgress, writeFridaySalawatProgress, type FridaySalawatTarget } from "../fridayProgress";
import { useWakeLock } from "../hooks/useWakeLock";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const COPY = {
  en: {
    title: "Salawat Counter ﷺ",
    subtitle: "Choose a target and count with intention",
    phrase: "Allahumma salli wa sallim ‘ala Nabiyyina Muhammad",
    target: "Target",
    completed: "Target completed",
    reset: "Reset counter",
    benefits: "Authentic benefits",
    muslim: "Whoever sends one blessing upon the Prophet ﷺ, Allah sends ten blessings upon that person.",
    muslimSource: "Sahih Muslim 408",
    friday: "Friday is among the best of your days, so increase your prayers upon the Prophet ﷺ on it.",
    fridaySource: "Sunan Abi Dawud 1047 — Sahih",
  },
  ar: {
    title: "الصلاة على النبي ﷺ",
    subtitle: "اختر هدفًا واحتسب الأجر",
    phrase: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    target: "الهدف",
    completed: "اكتمل الهدف",
    reset: "تصفير العداد",
    benefits: "فضائل ثابتة بأحاديث صحيحة",
    muslim: "«مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا».",
    muslimSource: "صحيح مسلم ٤٠٨",
    friday: "«إِنَّ مِنْ أَفْضَلِ أَيَّامِكُمْ يَوْمَ الْجُمُعَةِ، فَأَكْثِرُوا عَلَيَّ مِنَ الصَّلَاةِ فِيهِ».",
    fridaySource: "سنن أبي داود ١٠٤٧ — صحيح",
  },
} as const;

function ReferenceLink({ text, source, href }: { text: string; source: string; href: string }) {
  return (
    <article className="rounded-[22px] border border-border bg-card p-4 text-start">
      <p className="text-[0.9375rem] font-semibold leading-7 text-foreground" dir="auto">
        {text}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl text-[0.8125rem] font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {source}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  );
}

export function FridaySalawatScreen({
  language,
  direction,
  onBack,
  reduceMotion = false,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  reduceMotion?: boolean;
}) {
  const copy = COPY[language];
  const [progress, setProgress] = useState(readFridaySalawatProgress);
  const [showBenefits, setShowBenefits] = useState(false);
  const complete = progress.count >= progress.target;
  const progressPercent = Math.min(100, Math.round((progress.count / progress.target) * 100));

  useWakeLock(true);

  const persist = useCallback((count: number, target: FridaySalawatTarget) => {
    const next = { count, target };
    setProgress(next);
    writeFridaySalawatProgress(next);
  }, []);

  const increment = useCallback(() => {
    if (!complete) persist(progress.count + 1, progress.target);
  }, [complete, persist, progress.count, progress.target]);

  const reset = useCallback(() => persist(0, progress.target), [persist, progress.target]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const focusedControl =
        activeElement instanceof Element &&
        activeElement.closest(
          'button, a[href], input, textarea, select, [contenteditable="true"], [role="button"], [role="checkbox"], [role="combobox"], [role="menuitem"], [role="option"], [role="radio"], [role="search"], [role="switch"], [role="tab"], [role="textbox"]',
        );
      if (event.key === "Escape") {
        event.preventDefault();
        if (showBenefits) setShowBenefits(false);
        else onBack();
        return;
      }
      if (focusedControl || showBenefits) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        increment();
      } else if (event.key === "r" || event.key === "R" || event.key === "ق") {
        event.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [increment, onBack, reset, showBenefits]);

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    const element = event.target;
    if (
      element instanceof Element &&
      element.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [data-prevent-count='true']",
      )
    )
      return;
    increment();
  };

  return (
    <ScreenContainer
      dir={direction}
      className="relative flex flex-col overflow-y-auto page-content-center"
      screenName={copy.title}
    >
      <Header
        title={copy.title}
        onBack={onBack}
        language={language}
        right={
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowBenefits(true)}
              className="interactive-elem flex size-11 items-center justify-center rounded-full border border-border-control bg-card text-foreground shadow-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              aria-label={copy.benefits}
              aria-haspopup="dialog"
            >
              <BookOpen size={20} aria-hidden="true" />
            </button>
            <DropdownMenu dir={direction}>
              <DropdownMenuTrigger
                className="interactive-elem flex size-11 items-center justify-center rounded-full border border-border-control bg-card text-foreground shadow-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "common.moreOptions")}
              >
                <MoreVertical size={20} aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={reset} disabled={progress.count === 0}>
                  <RotateCcw size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                  <span>{copy.reset}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {complete ? copy.completed : ""}
      </p>

      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        className="relative z-10 mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col overflow-y-auto px-4 pb-6 pt-2 sm:px-5"
        data-counting-mode="canvas"
        onClick={handleCanvasClick}
      >
        <section
          className="space-y-3 rounded-[24px] border border-border bg-card p-4 sm:p-5 shadow-raised"
          aria-label={copy.target}
        >
          <div className="flex items-center justify-between gap-3 text-[0.75rem] font-bold text-muted-foreground">
            <span>{formatNumerals(progressPercent, language)}%</span>
            <span>
              {formatNumerals(progress.count, language)} / {formatNumerals(progress.target, language)}
            </span>
          </div>
          <ProgressBar value={progress.count} max={progress.target} direction={direction} aria-label={copy.target} />
        </section>

        <div className="relative z-20 mt-4 flex w-full" data-prevent-count="true">
          <CounterTargetPicker
            activeTarget={progress.target}
            onTargetChange={(target) => persist(0, target)}
            language={language}
            direction={direction}
            allowOpen={false}
          />
        </div>

        <div className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10">
          <p
            className="zikr-text max-w-[34rem] text-center text-[1.25rem] font-extrabold leading-[2] text-foreground sm:text-[1.5rem]"
            dir="rtl"
            lang="ar"
          >
            {copy.phrase}
          </p>
        </div>

        <footer className="shrink-0 flex flex-col items-center justify-center pb-3 pt-2">
          <div className="flex w-full items-center justify-center gap-2.5">
            <div className="flex min-w-0 flex-1 justify-center">
              <ZikrCounterSurface
                count={progress.count}
                total={progress.target}
                complete={complete}
                onTap={increment}
                language={language}
                instructionText={t(language, "reader.tapAnywhere")}
                testId="salawat-counter"
                reduceMotion={reduceMotion}
                className="salawat-counter-surface"
              />
            </div>
          </div>

          <div
            dir="ltr"
            className="mt-5 hidden w-fit max-w-full flex-wrap items-center justify-center gap-3 rounded-full border border-border/40 bg-muted/60 px-5 py-2 text-[0.75rem] font-medium text-muted-foreground md:flex"
          >
            <span className="flex items-center gap-1.5" dir={direction}>
              <kbd className="rounded bg-card border border-border px-1.5 py-0.5 font-mono text-[0.6875rem] shadow-2xs font-bold text-foreground">
                Space
              </kbd>
              <span>{t(language, "counter.count")}</span>
            </span>
            <span className="h-3 w-px bg-border/60" aria-hidden="true" />
            <span className="flex items-center gap-1.5" dir={direction}>
              <kbd className="rounded bg-card border border-border px-1.5 py-0.5 font-mono text-[0.6875rem] shadow-2xs font-bold text-foreground">
                R
              </kbd>
              <span>{t(language, "counter.reset")}</span>
            </span>
          </div>
        </footer>
      </div>

      {showBenefits && (
        <Modal
          open
          onClose={() => setShowBenefits(false)}
          title={copy.benefits}
          direction={direction}
          maxWidthClassName="max-w-lg"
          className="p-5 sm:p-6"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.125rem] font-black text-foreground">{copy.benefits}</h2>
              <button
                type="button"
                onClick={() => setShowBenefits(false)}
                className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-control bg-background text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                aria-label={t(language, "common.close")}
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles size={20} aria-hidden="true" />
            </span>
            <ReferenceLink text={copy.muslim} source={copy.muslimSource} href="https://sunnah.com/muslim:408" />
            <ReferenceLink text={copy.friday} source={copy.fridaySource} href="https://sunnah.com/abudawud:1047" />
          </div>
        </Modal>
      )}
    </ScreenContainer>
  );
}
