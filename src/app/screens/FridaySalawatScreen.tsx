import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import { BookOpen, ExternalLink, MoreVertical, RotateCcw, Sparkles, Volume2, VolumeX, X } from "../components/icons";
import { ReadingScreenChrome } from "../components/ReadingScreenChrome";
import { Modal } from "../components/ResponsiveSheet";
import { ScreenContainer } from "../components/ScreenContainer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { CounterShortcutHints, ZikrCounterSurface } from "../components/ZikrComponents";
import { useCounterClickFeedback } from "../hooks/useCounterClickFeedback";
import { formatNumerals } from "../formatting";
import { readFridaySalawatProgress, writeFridaySalawatProgress, type FridaySalawatTarget } from "../fridayProgress";
import { useWakeLock } from "../hooks/useWakeLock";
import { vibrateIfEnabled } from "../motionPreferences";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

const COPY = {
  en: {
    title: "Salawat ﷺ",
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
    title: "صلاة على النبي ﷺ",
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
    <article className="rounded-3xl border border-border bg-card p-4 text-start">
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

const COMPACT_ACTION_CLASS =
  "interactive-elem flex size-11 items-center justify-center rounded-full border border-border-control bg-card text-foreground shadow-xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

/* The wide band is a fixed navy surface, so its controls take on-media colours
   rather than theme ones — the same split the Reader makes. */
const HERO_ACTION_CLASS =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

export function FridaySalawatScreen({
  language,
  direction,
  onBack,
  reduceMotion = false,
  hapticFeedback = true,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  reduceMotion?: boolean;
  /** Matches the reader and the Masbaha: counting is felt, not only heard. */
  hapticFeedback?: boolean;
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

  /* The same tap feedback the reader and the masbaha give. This counter had
     none, so the one action it exists for was the only counting tap in the app
     that answered silently. */
  const { soundEnabled, toggleSound, playClickFeedback } = useCounterClickFeedback();

  const increment = useCallback(() => {
    if (complete) return;
    playClickFeedback();
    /* The reader and the Masbaha both answer a count with a short pulse, and
       reaching the target with a distinct pattern. This counter played the
       sound and nothing else, so the one screen people tap hundreds of times
       was the one that felt like nothing was happening. Same durations, so the
       three do not develop separate vocabularies. */
    const next = progress.count + 1;
    vibrateIfEnabled(hapticFeedback, next >= progress.target ? [30, 50, 30, 50, 50] : 15);
    persist(next, progress.target);
  }, [complete, hapticFeedback, persist, playClickFeedback, progress.count, progress.target]);

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

  const [isCanvasPressed, setIsCanvasPressed] = useState(false);
  const [canvasRipples, setCanvasRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const target = event.target;
    if (
      target instanceof Element &&
      target.closest(
        "button, a, input, textarea, select, summary, [contenteditable='true'], [role='dialog'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option'], [role='switch'], [data-prevent-count='true']",
      )
    ) {
      return;
    }
    setIsCanvasPressed(true);
    const rect = event.currentTarget.getBoundingClientRect();
    setCanvasRipples((current) => [
      ...current.slice(-3),
      { id: Date.now() + Math.random(), x: event.clientX - rect.left, y: event.clientY - rect.top },
    ]);
  };

  const handlePointerUp = () => setIsCanvasPressed(false);

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
      onClick={handleCanvasClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
        {canvasRipples.map((ripple) => (
          <span
            key={ripple.id}
            className="tap-ripple"
            style={{
              position: "absolute",
              width: 150,
              height: 150,
              transform: "translate(-50%, -50%) scale(0)",
              borderRadius: "50%",
              backgroundColor: "currentColor",
              opacity: 0.1,
              animation: "ripple 600ms linear",
              left: ripple.x,
              top: ripple.y,
            }}
            onAnimationEnd={() => setCanvasRipples((current) => current.filter((item) => item.id !== ripple.id))}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <ReadingScreenChrome
          language={language}
          direction={direction}
          title={copy.title}
          onBack={onBack}
          testId="salawat"
          progress={{
            value: progress.count,
            max: progress.target,
            percentLabel: `${formatNumerals(progressPercent, language)}%`,
            countLabel: `${formatNumerals(progress.count, language)} / ${formatNumerals(progress.target, language)}`,
            ariaLabel: copy.target,
          }}
          subRow={
            <div className="w-full" data-prevent-count="true">
              <CounterTargetPicker
                activeTarget={progress.target}
                onTargetChange={(target) => persist(0, target)}
                language={language}
                direction={direction}
                allowOpen={false}
              />
            </div>
          }
          actions={(tier) => {
            const actionClass = tier === "wide" ? HERO_ACTION_CLASS : COMPACT_ACTION_CLASS;
            return (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowBenefits(true)}
                  className={actionClass}
                  aria-label={copy.benefits}
                  aria-haspopup="dialog"
                >
                  <BookOpen size={20} aria-hidden="true" />
                </button>
                <DropdownMenu dir={direction}>
                  <DropdownMenuTrigger className={actionClass} aria-label={t(language, "common.moreOptions")}>
                    <MoreVertical size={20} aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleSound}>
                      {soundEnabled ? (
                        <Volume2 size={16} className="text-primary me-2" aria-hidden="true" />
                      ) : (
                        <VolumeX size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                      )}
                      <span>{t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={reset} disabled={progress.count === 0}>
                      <RotateCcw size={16} className="text-muted-foreground me-2" aria-hidden="true" />
                      <span>{copy.reset}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          }}
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
          <div
            className="flex-1 flex flex-col justify-center items-center py-6 sm:py-10 origin-center"
            style={{
              transform: isCanvasPressed && !reduceMotion ? "scale(0.97)" : "scale(1)",
              transition: "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
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
            <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
              {t(language, "reader.tapAnywhere")}
            </p>

            <CounterShortcutHints
              language={language}
              direction={direction}
              ariaLabel={t(language, "reader.keyboardShortcuts")}
              shortcuts={[
                { keys: ["Space"], label: t(language, "counter.count") },
                { keys: ["R"], label: t(language, "counter.reset") },
              ]}
            />
          </footer>
        </div>
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
