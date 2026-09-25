import { useCallback, useEffect, useState } from "react";
import { CounterTargetPicker } from "../components/CounterTargetPicker";
import {
  ArrowPrevious,
  Check,
  ExternalLink,
  Lightbulb,
  MoreVertical,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "../components/icons";
import { ReadingScreenChrome } from "../components/ReadingScreenChrome";
import { Modal } from "../components/ResponsiveSheet";
import { CountingRipples, useCountingSurface } from "../components/countingSurface";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "../components/ui/button";
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
import { getReadingFontSize } from "./readingTypography";
import type { AppLanguage, TextSizeOption } from "../types";

const SALAWAT_ARABIC = "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ";
const SALAWAT_TRANSLITERATION = "Allahumma salli wa sallim ‘ala Nabiyyina Muhammad";

const COPY = {
  en: {
    title: "Salawat ﷺ",
    subtitle: "Choose a target and count with intention",
    phrase: SALAWAT_ARABIC,
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
    phrase: SALAWAT_ARABIC,
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
      <p className="text-subtitle font-semibold leading-7 text-foreground" dir="auto">
        {text}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl text-label font-black text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {source}
        <ExternalLink size={16} aria-hidden="true" />
      </a>
    </article>
  );
}

const HEADER_ACTION_CLASS =
  "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

const HEADER_ACTION_PILL_CLASS = `${HEADER_ACTION_CLASS} w-auto gap-1.5 px-2.5`;

/* The wide band is a fixed navy surface, so its controls take on-media colours
   rather than theme ones — the same split the Reader makes. */
const HERO_ACTION_CLASS =
  "flex size-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

const HERO_ACTION_PILL_CLASS =
  "flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 px-3 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

function getNextSalawatTarget(currentTarget: number): number {
  const presets = [10, 33, 100, 1000];
  const next = presets.find((p) => p > currentTarget);
  if (next) return next;
  if (currentTarget >= 1000) return currentTarget + 500;
  return currentTarget + 10;
}

export function FridaySalawatScreen({
  language,
  direction,
  onBack,
  reduceMotion = false,
  hapticFeedback = true,
  textSize = "medium",
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onBack: () => void;
  reduceMotion?: boolean;
  /** Matches the reader and the Masbaha: counting is felt, not only heard. */
  hapticFeedback?: boolean;
  textSize?: TextSizeOption;
}) {
  const copy = COPY[language];
  const [progress, setProgress] = useState(readFridaySalawatProgress);
  const [showBenefits, setShowBenefits] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [rounds, setRounds] = useState(0);
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
    if (complete) {
      setShowCompletionModal(true);
      return;
    }
    playClickFeedback();
    const next = progress.count + 1;
    const reachedTarget = next >= progress.target;
    vibrateIfEnabled(hapticFeedback, reachedTarget ? [30, 50, 30, 50, 50] : 15);
    persist(next, progress.target);
    if (reachedTarget) {
      setShowCompletionModal(true);
    }
  }, [complete, hapticFeedback, persist, playClickFeedback, progress.count, progress.target]);

  const handleContinueHigherTarget = useCallback(() => {
    const nextTarget = getNextSalawatTarget(progress.target);
    persist(progress.count, nextTarget);
    setShowCompletionModal(false);
  }, [persist, progress.count, progress.target]);

  const handleStartNewRound = useCallback(() => {
    setRounds((r) => r + 1);
    persist(0, progress.target);
    setShowCompletionModal(false);
  }, [persist, progress.target]);

  const handleReturn = useCallback(() => {
    setShowCompletionModal(false);
    onBack();
  }, [onBack]);

  const reset = useCallback(() => {
    persist(0, progress.target);
    setRounds(0);
    setShowCompletionModal(false);
  }, [persist, progress.target]);

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
        else if (showCompletionModal) setShowCompletionModal(false);
        else onBack();
        return;
      }
      if (focusedControl || showBenefits || showCompletionModal) return;
      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        if (complete) {
          setShowCompletionModal(true);
        } else {
          increment();
        }
      } else if (event.key === "r" || event.key === "R" || event.key === "ق") {
        event.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [complete, increment, onBack, reset, showBenefits, showCompletionModal]);

  const {
    ripples: canvasRipples,
    dismissRipple,
    pressStyle,
    surfaceProps,
  } = useCountingSurface({ onCount: increment, reduceMotion });

  return (
    <ScreenContainer
      dir={direction}
      className="relative flex flex-col overflow-y-auto h-full !pb-0 sm:!pt-0"
      screenName={copy.title}
    >
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden="true">
        <CountingRipples ripples={canvasRipples} onDismiss={dismissRipple} />
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
                onTargetChange={(target) => {
                  persist(0, target);
                  setShowCompletionModal(false);
                }}
                language={language}
                direction={direction}
                allowOpen={false}
              />
            </div>
          }
          actions={(tier) => {
            const isWide = tier === "wide";
            const actionClass = isWide ? HERO_ACTION_CLASS : HEADER_ACTION_CLASS;
            const pillClass = isWide ? HERO_ACTION_PILL_CLASS : HEADER_ACTION_PILL_CLASS;
            return (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowBenefits(true)}
                  className={pillClass}
                  aria-label={copy.benefits}
                  title={copy.benefits}
                  aria-haspopup="dialog"
                >
                  <Lightbulb size={18} aria-hidden="true" />
                  <span
                    className={isWide ? "text-label font-extrabold" : "text-xs font-extrabold min-[600px]:text-label"}
                    aria-hidden="true"
                  >
                    {t(language, "reader.referencesButton")}
                  </span>
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

        <div className="relative mx-4 mb-4 mt-4 flex min-h-0 flex-1 overflow-hidden bg-transparent">
          <div
            className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden cursor-pointer"
            data-testid="reader-card"
            data-counting-mode="canvas"
            {...surfaceProps}
          >
            <div
              className="salawat-stage mx-auto flex min-h-0 w-full max-w-[44rem] flex-1 flex-col justify-between select-none relative"
              data-testid="salawat-content"
            >
              <div className="relative flex min-h-0 flex-1">
                <div className="reader-text-scroll h-full min-h-0 w-full overflow-y-auto ps-6 pe-7 md:px-20 py-4 outline-none focus-visible:outline-none focus:ring-0">
                  <div className="reading-measure mx-auto flex min-h-full w-full flex-col py-4">
                    <div style={pressStyle} className="my-auto w-full flex flex-col items-center justify-center">
                      <p
                        className="zikr-text max-w-[34rem] text-center font-medium leading-[2.1] text-foreground"
                        dir="rtl"
                        lang="ar"
                        style={{
                          fontFamily: "var(--font-zikr)",
                          fontSize: getReadingFontSize({
                            textSize,
                            arabicLength: SALAWAT_ARABIC.length,
                            longSurah: false,
                          }),
                        }}
                      >
                        {SALAWAT_ARABIC}
                      </p>
                      {language !== "ar" && (
                        <p
                          className="mt-3 max-w-[34rem] text-center text-sm font-semibold leading-7 text-muted-foreground"
                          dir="ltr"
                        >
                          {SALAWAT_TRANSLITERATION}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <footer className="shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
                <div data-testid="reader-counter-stack">
                  <div className="px-3 pb-1" data-testid="counter-panel">
                    <div className="adaptive-counter-row flex w-full items-center justify-center gap-2.5">
                      <div className="flex min-w-0 flex-1 justify-center">
                        <ZikrCounterSurface
                          count={progress.count}
                          total={progress.target}
                          complete={complete}
                          onTap={increment}
                          onCompleteTap={() => setShowCompletionModal(true)}
                          language={language}
                          instructionText={t(language, "reader.tapAnywhere")}
                          testId="salawat-counter"
                          reduceMotion={reduceMotion}
                        />
                      </div>
                    </div>
                    <p className="mt-3 min-h-5 text-center text-sm font-medium text-muted-foreground">
                      {t(language, "reader.tapAnywhere")}
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <CounterShortcutHints
                      language={language}
                      direction={direction}
                      testId="counter-keyboard-shortcuts"
                      ariaLabel={t(language, "reader.keyboardShortcuts")}
                      shortcuts={[
                        { keys: ["Space"], label: t(language, "counter.count") },
                        { keys: ["R"], label: t(language, "counter.reset") },
                      ]}
                    />
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>

      {showCompletionModal && (
        <Modal
          open
          onClose={() => setShowCompletionModal(false)}
          title={t(language, "counter.goalReached")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-sm"
          className="p-5 sm:p-6 text-center"
        >
          <div>
            <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-success/20 text-success">
              <Check size={32} strokeWidth={3} aria-hidden="true" />
            </div>
            <h2 className="mb-1 text-xl font-extrabold text-foreground">{t(language, "counter.goalReached")}</h2>
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              {t(language, "counter.salawatCompletedDetail", { count: formatNumerals(progress.count, language) })}
            </p>
            {rounds > 0 && (
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} aria-hidden="true" />
                {t(language, "counter.roundCompleted", { round: formatNumerals(rounds + 1, language) })}
              </p>
            )}
            <div className="mt-4 space-y-2">
              <Button
                onClick={handleContinueHigherTarget}
                size="lg"
                className="w-full gap-2"
                data-testid="salawat-continue-streak-btn"
              >
                <Sparkles size={18} aria-hidden="true" />
                {t(language, "counter.continueHigherTargetWithNum", {
                  target: formatNumerals(getNextSalawatTarget(progress.target), language),
                })}
              </Button>
              <Button
                variant="outline"
                onClick={handleStartNewRound}
                size="lg"
                className="w-full gap-2"
                data-testid="salawat-new-round-btn"
              >
                <Play size={18} aria-hidden="true" />
                {t(language, "counter.newRoundWithNum", { round: formatNumerals(rounds + 2, language) })} (
                {formatNumerals(progress.target, language)})
              </Button>
              <Button
                variant="ghost"
                onClick={handleReturn}
                size="lg"
                className="w-full gap-2 text-muted-foreground hover:text-foreground"
                data-testid="salawat-return-btn"
              >
                <ArrowPrevious size={18} data-rtl-flip aria-hidden="true" />
                {t(language, "counter.returnToHub")}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showBenefits && (
        <Modal
          open
          onClose={() => setShowBenefits(false)}
          title={copy.benefits}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-lg"
          className="p-5 sm:p-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3 pe-10">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb size={20} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-black text-foreground">{copy.benefits}</h2>
            </div>
            <ReferenceLink text={copy.muslim} source={copy.muslimSource} href="https://sunnah.com/muslim:408" />
            <ReferenceLink text={copy.friday} source={copy.fridaySource} href="https://sunnah.com/abudawud:1047" />
          </div>
        </Modal>
      )}
    </ScreenContainer>
  );
}
