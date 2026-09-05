import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Headphones, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "./icons";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";
import { formatNumerals } from "../formatting";
import { getAudioVoiceName } from "../audio/audioVoices";
import { useMediaQuery } from "../hooks/useMediaQuery";

const COPY = {
  en: {
    region: "Audio player",
    play: "Play audio",
    pause: "Pause audio",
    previous: "Previous item",
    next: "Next item",
    jumpBack10: "Rewind 10 seconds",
    jumpForward10: "Forward 10 seconds",
    replayQuran: "Replay this surah",
    replayDua: "Replay this zikr",
    replay: "Replay this item",
    stop: "Stop audio and close player",
    seek: "Seek audio",
    options: "Audio options",
    speed: "Playback speed",
    voice: "Voice or reciter",
    playOnce: "Play once",
    repeat: "Repeat prescribed count",
    retry: "Retry",
    skip: "Skip this item",
    buffering: "Buffering audio",
    loading: "Loading audio",
    ended: "Queue complete",
    trackChanged: "Track changed",
    repetitionCompleted: "Audio repetition completed",
    queueCompleted: "Audio queue completed",
    expand: "Expand player",
    collapse: "Minimize player",
    customRecording: "Custom recording",
    recitationBy: "Recitation by",
    previousShort: "Previous",
    nextShort: "Next",
    back10Short: "Rewind",
    forward10Short: "Forward",
    replayShort: "Replay",
    track: "Track",
    repetitionChip: "Repetition",
    speedShort: "Speed",
    reciterShort: "Reciter",
    repeatShort: "Repeat",
  },
  ar: {
    region: "مشغل الصوت",
    play: "تشغيل الصوت",
    pause: "إيقاف الصوت مؤقتًا",
    previous: "الذكر السابق",
    next: "الذكر التالي",
    jumpBack10: "تأخير ١٠ ثوانٍ",
    jumpForward10: "تقديم ١٠ ثوانٍ",
    replayQuran: "إعادة تشغيل السورة",
    replayDua: "إعادة تشغيل هذا الذكر",
    replay: "إعادة تشغيل هذا المقطع",
    stop: "إيقاف الصوت وإغلاق المشغل",
    seek: "تقديم أو تأخير الصوت",
    options: "خيارات الصوت",
    speed: "سرعة التشغيل",
    voice: "الصوت أو القارئ",
    playOnce: "تشغيل مرة واحدة",
    repeat: "تكرار العدد المحدد",
    retry: "إعادة المحاولة",
    skip: "تخطي هذا الذكر",
    buffering: "جارٍ تحميل الصوت",
    loading: "جارٍ تجهيز الصوت",
    ended: "اكتمل التشغيل",
    trackChanged: "تم تغيير المقطع",
    repetitionCompleted: "اكتمل تكرار الصوت",
    queueCompleted: "اكتملت قائمة الصوت",
    expand: "توسيع المشغل",
    collapse: "تصغير المشغل",
    customRecording: "تسجيل خاص",
    recitationBy: "تلاوة القارئ",
    previousShort: "السابق",
    nextShort: "التالي",
    back10Short: "تأخير",
    forward10Short: "تقديم",
    replayShort: "إعادة",
    track: "المقطع",
    repetitionChip: "تكرار",
    speedShort: "السرعة",
    reciterShort: "القارئ",
    repeatShort: "التكرار",
  },
} as const;

/**
 * The speeds worth offering, in the order the control walks through them.
 *
 * A five-option select for one number cost a label, a dropdown and a choice;
 * the pill shows the rate it is on and moves to the next one, which is what
 * people did with the select anyway.
 */
const PLAYBACK_RATES = [0.8, 1, 1.25, 1.5, 2] as const;

function nextPlaybackRate(current: number) {
  const index = PLAYBACK_RATES.findIndex((rate) => rate === current);
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length] ?? 1;
}

function formatTime(seconds: number, language: AppLanguage) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return formatNumerals(`${minutes}:${remainder.toString().padStart(2, "0")}`, language);
}

function accessibleTime(current: number, duration: number, language: AppLanguage) {
  const describe = (seconds: number) => {
    const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const minutes = Math.floor(safe / 60);
    const remainder = Math.floor(safe % 60);
    return language === "ar"
      ? `${formatNumerals(minutes, language)} دقيقة و${formatNumerals(remainder, language)} ثانية`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ${remainder} second${remainder === 1 ? "" : "s"}`;
  };
  return language === "ar"
    ? `${describe(current)} من ${describe(duration)}`
    : `${describe(current)} of ${describe(duration)}`;
}

function JumpBack10Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3.5 10A8.5 8.5 0 1 1 12 20.5a8.5 8.5 0 0 1-5.5-2" />
      <polyline points="3.5 5.5 3.5 10 8 10" />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        stroke="none"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        10
      </text>
    </svg>
  );
}

function JumpForward10Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.5 10A8.5 8.5 0 1 0 12 20.5a8.5 8.5 0 0 0 5.5-2" />
      <polyline points="20.5 5.5 20.5 10 16 10" />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fontSize="7"
        fontWeight="800"
        stroke="none"
        fill="currentColor"
        fontFamily="sans-serif"
      >
        10
      </text>
    </svg>
  );
}

/**
 * Four bars that move while the recitation does.
 *
 * The same block was inlined twice, once per player form, which meant the
 * "something is playing" cue could drift between them.
 */
function WaveBars({ playing }: { playing: boolean }) {
  if (!playing) {
    return <span className="size-2 shrink-0 rounded-full bg-muted-foreground/50" aria-hidden="true" />;
  }
  return (
    <span className="flex h-3.5 shrink-0 items-end gap-0.5" aria-hidden="true">
      {[
        { height: "h-3", delay: "0ms" },
        { height: "h-2", delay: "150ms" },
        { height: "h-3.5", delay: "300ms" },
        { height: "h-1.5", delay: "450ms" },
      ].map((bar) => (
        <span
          key={bar.delay}
          className={`waveform-bar w-0.5 rounded-full bg-primary ${bar.height}`}
          style={{ animationDelay: bar.delay }}
        />
      ))}
    </span>
  );
}

/**
 * A transport control with its name under it.
 *
 * Five unlabeled glyphs in a row asked the reader to tell a rewind from a
 * skip at a glance, on the surface they reach for while reciting. The visible
 * label is also the control's accessible name unless `ariaLabel` extends it —
 * which it only ever does by adding words around the same label, so the name
 * still contains what is on screen.
 */
function TransportButton({
  label,
  ariaLabel,
  onClick,
  disabled,
  children,
}: {
  label: string;
  ariaLabel?: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex w-[4.25rem] shrink-0 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-muted-foreground transition-[transform,background-color,color] duration-fast hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
    >
      {children}
      <span className="text-micro font-semibold leading-4">{label}</span>
    </button>
  );
}

/** One shape for every option control under the transport row. */
const PILL_CLASS =
  "flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-label font-bold transition-colors duration-fast focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";
const PILL_IDLE = "border-border text-foreground hover:bg-muted";
const PILL_ACTIVE = "border-primary bg-primary/15 text-primary";

export function FloatingAudioPlayer({
  controller,
  language,
  overReadingSurface = false,
}: {
  controller: AudioController;
  language: AppLanguage;
  /**
   * The player is covering something being read — today, the Mushaf.
   *
   * The expanded player takes a large share of a 375px screen, which on the
   * one flow it exists to serve — listening to a surah while reading along —
   * hides the pages. It opens compact there instead; the expand control is
   * still one tap away, and a reader who expands it is left alone.
   */
  overReadingSurface?: boolean;
}) {
  const { state, currentEntry, currentSegment } = controller;
  /* A tablet or desktop has room for the player beside the page. */
  const hasRoomBesideReading = useMediaQuery("(min-width: 768px)");
  const coversReading = overReadingSurface && !hasRoomBesideReading;
  const [isMinimized, setIsMinimized] = useState(coversReading);
  const wasCoveringReading = useRef(coversReading);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Only on the way in: opening the Mushaf while a surah plays should fold
    // the player away, but closing it must not reopen what the reader folded.
    if (coversReading && !wasCoveringReading.current) setIsMinimized(true);
    wasCoveringReading.current = coversReading;
  }, [coversReading]);

  const jumpSeconds = useCallback(
    (delta: number) => {
      const target = Math.max(0, Math.min(state.currentTime + delta, state.duration || 0));
      controller.seek(target);
    },
    [controller, state.currentTime, state.duration],
  );

  useEffect(() => {
    const handleWindowKeyDown = (e: globalThis.KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement | null)?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT") return;

      if (e.key === " " && activeTag !== "BUTTON") {
        e.preventDefault();
        if (state.status === "playing") controller.pause();
        else controller.play();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        jumpSeconds(language === "ar" ? 5 : -5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        jumpSeconds(language === "ar" ? -5 : 5);
      } else if (e.key === "Escape") {
        if (!isMinimized) {
          e.preventDefault();
          setIsMinimized(true);
        }
      }
    };
    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [controller, isMinimized, jumpSeconds, language, state.status]);

  if (!state.plan || !currentEntry) return null;

  const copy = COPY[language];
  const direction = language === "ar" ? "rtl" : "ltr";
  const isPlaying = state.status === "playing";
  const isBusy = state.status === "loading" || state.status === "buffering";
  const totalTracks = state.plan.entries.length;
  const queuePosition = `${formatNumerals(state.entryIndex + 1, language)} / ${formatNumerals(totalTracks, language)}`;
  const repetitionPosition =
    currentEntry.repetitions > 1
      ? `${formatNumerals(state.repetitionIndex + 1, language)} / ${formatNumerals(currentEntry.repetitions, language)}`
      : null;
  const title = language === "ar" ? currentEntry.titleArabic : currentEntry.titleEnglish;
  const isQuran = currentEntry.contentKind === "quran";
  const replayLabel = isQuran ? copy.replayQuran : copy.replayDua;

  const voiceId = state.currentVoiceId ?? currentEntry.defaultVoiceId;
  const reciterDisplayName = getAudioVoiceName(voiceId, language) ?? currentSegment?.voiceName ?? voiceId;

  const attributionText =
    language === "ar"
      ? `${copy.recitationBy} ${reciterDisplayName} · ${copy.customRecording}`
      : `${copy.recitationBy} ${reciterDisplayName} · ${copy.customRecording}`;

  const liveMessage =
    state.status === "error"
      ? state.error?.message
      : state.announcement === "queue-completed"
        ? copy.queueCompleted
        : state.announcement === "repetition-completed"
          ? copy.repetitionCompleted
          : state.announcement === "track-changed"
            ? `${copy.trackChanged}: ${title}`
            : "";

  const repeatEnabled = currentEntry.repetitions > 1;
  const canRepeat = currentEntry.supportedModes.includes("repeat-prescribed-count");
  const progressPercent =
    Number.isFinite(state.duration) && state.duration > 0
      ? Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100))
      : 0;

  const positionChip =
    totalTracks > 1
      ? `${copy.track} ${queuePosition}`
      : repetitionPosition
        ? `${copy.repetitionChip} ${repetitionPosition}`
        : null;

  if (isMinimized) {
    return (
      <section
        aria-label={copy.region}
        dir={direction}
        className="fixed bottom-16 sm:bottom-6 inset-x-0 mx-auto z-40 w-[calc(100%-1rem)] sm:max-w-lg rounded-2xl border border-primary/30 bg-card/95 px-2.5 py-2 shadow-overlay backdrop-blur-xl dark:border-white/15"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {/* How far into the recitation, on the card's own top edge. */}
        <div className="absolute inset-x-0 top-0 h-1 overflow-hidden rounded-t-2xl bg-muted" aria-hidden="true">
          <div
            className="h-full bg-primary transition-[width] duration-fast"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label={copy.expand}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <ChevronUp size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label={`${title} · ${copy.expand}`}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 text-start focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <WaveBars playing={isPlaying} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-label font-black text-foreground">{title}</span>
              <span className="block truncate text-micro font-semibold text-muted-foreground">
                {reciterDisplayName}
                {" · "}
                {/* The clock is Latin-ordered whatever the interface language,
                    so only the times take an explicit direction — leaving the
                    separator in the sentence it belongs to. */}
                <span dir="ltr" className="tabular-nums">
                  {formatTime(state.currentTime, language)} / {formatTime(state.duration, language)}
                </span>
              </span>
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={isPlaying ? controller.pause : controller.play}
              aria-label={isPlaying ? copy.pause : copy.play}
              className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-raised transition-[transform,background-color] duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {isPlaying ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={controller.stop}
              aria-label={copy.stop}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label={copy.region}
      dir={direction}
      className="fixed bottom-16 sm:bottom-6 inset-x-0 mx-auto z-40 w-[calc(100%-1rem)] sm:max-w-lg rounded-3xl border border-primary/20 bg-card/95 px-4 pb-4 pt-2 sm:px-5 sm:pb-5 shadow-overlay backdrop-blur-xl dark:border-white/10"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {/* Closing sits in the corner; folding the player away is the centre
          grabber, because it is the one people reach for while reciting. */}
      <div className="relative flex items-center justify-center">
        <button
          type="button"
          onClick={controller.stop}
          aria-label={copy.stop}
          className="absolute start-0 flex size-11 items-center justify-center rounded-full text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <X size={19} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          aria-label={copy.collapse}
          className="flex h-11 w-20 items-center justify-center rounded-full text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <ChevronDown size={22} aria-hidden="true" />
        </button>
      </div>

      {/* What is playing, read down the middle: cue, surah, reciter, place. */}
      <div className="flex flex-col items-center text-center">
        <WaveBars playing={isPlaying} />
        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight text-foreground">{title}</h3>
        <p className="mt-1 truncate text-label font-semibold text-muted-foreground">{reciterDisplayName}</p>
        {positionChip && (
          <p className="mt-2.5 rounded-full border border-border px-3 py-1 text-xs font-bold text-muted-foreground">
            {positionChip}
          </p>
        )}
        {isBusy && (
          <p className="mt-2 text-xs font-semibold text-primary" role="status">
            {state.status === "buffering" ? copy.buffering : copy.loading}
          </p>
        )}
      </div>

      {/* Timeline / Scrub Bar with Generous 44px Hit Target */}
      <div className="mt-4 flex items-center gap-3" dir="ltr">
        <span className="w-11 text-center text-xs font-bold tabular-nums text-muted-foreground">
          {formatTime(state.currentTime, language)}
        </span>
        <div className="relative flex min-w-0 flex-1 items-center h-11">
          <input
            type="range"
            min={0}
            max={Math.max(0, state.duration)}
            step={1}
            value={Math.min(state.currentTime, state.duration || 0)}
            disabled={state.duration <= 0}
            onChange={(event) => controller.seek(Number(event.currentTarget.value))}
            aria-label={copy.seek}
            aria-valuetext={accessibleTime(state.currentTime, state.duration, language)}
            /* The played part of the track is drawn here rather than in a
               stylesheet: a range input needs one gradient per browser engine
               to fill, and the value is already in hand. */
            style={{
              background: `linear-gradient(to right, var(--primary) ${progressPercent}%, var(--muted) ${progressPercent}%)`,
            }}
            className="w-full h-2 rounded-full accent-primary appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>
        <span className="w-11 text-center text-xs font-bold tabular-nums text-muted-foreground">
          {formatTime(state.duration, language)}
        </span>
      </div>

      {/* Primary Transport Controls Row */}
      <div className="mt-1 flex items-start justify-center gap-0.5 sm:gap-2">
        {totalTracks > 1 && (
          <TransportButton
            label={copy.previousShort}
            ariaLabel={copy.previous}
            onClick={controller.previous}
            disabled={state.entryIndex === 0}
          >
            <SkipBack size={20} className="rtl:rotate-180" aria-hidden="true" />
          </TransportButton>
        )}

        <TransportButton
          label={copy.back10Short}
          ariaLabel={copy.jumpBack10}
          onClick={() => jumpSeconds(-10)}
          disabled={state.duration <= 0}
        >
          <JumpBack10Icon className="size-5" />
        </TransportButton>

        <button
          type="button"
          onClick={isPlaying ? controller.pause : controller.play}
          aria-label={isPlaying ? copy.pause : copy.play}
          className="mx-1 mt-1 flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-raised transition-[transform,background-color] duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {isPlaying ? <Pause size={28} aria-hidden="true" /> : <Play size={28} aria-hidden="true" />}
        </button>

        <TransportButton
          label={copy.forward10Short}
          ariaLabel={copy.jumpForward10}
          onClick={() => jumpSeconds(10)}
          disabled={state.duration <= 0}
        >
          <JumpForward10Icon className="size-5" />
        </TransportButton>

        {totalTracks > 1 && (
          <TransportButton
            label={copy.nextShort}
            ariaLabel={copy.next}
            onClick={controller.next}
            disabled={state.entryIndex === totalTracks - 1}
          >
            <SkipForward size={20} className="rtl:rotate-180" aria-hidden="true" />
          </TransportButton>
        )}
      </div>

      {/* Error state */}
      {state.status === "error" && (
        <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5" role="alert">
          <p className="text-label font-semibold text-destructive">{state.error?.message}</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={controller.retry}
              className="min-h-11 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {copy.retry}
            </button>
            <button
              type="button"
              onClick={controller.skip}
              className="min-h-11 rounded-xl border border-border px-4 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {copy.skip}
            </button>
            <button
              type="button"
              onClick={controller.stop}
              className="min-h-11 rounded-xl border border-destructive/40 px-4 text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {copy.stop}
            </button>
          </div>
        </div>
      )}

      {/* The options that exist, on one row, rather than behind a disclosure
          that hid the repeat toggle three taps from the reader who wants it. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border/70 pt-4">
        <button
          type="button"
          onClick={controller.replay}
          aria-label={replayLabel}
          className={`${PILL_CLASS} ${PILL_IDLE}`}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {copy.replayShort}
        </button>

        {canRepeat && (
          <button
            type="button"
            aria-pressed={repeatEnabled}
            onClick={() => controller.setPlaybackMode(repeatEnabled ? "play-once" : "repeat-prescribed-count")}
            className={`${PILL_CLASS} ${repeatEnabled ? PILL_ACTIVE : PILL_IDLE}`}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {copy.repeatShort}
          </button>
        )}

        <button
          type="button"
          onClick={() => controller.setPlaybackRate(nextPlaybackRate(state.playbackRate))}
          className={`${PILL_CLASS} ${state.playbackRate === 1 ? PILL_IDLE : PILL_ACTIVE}`}
        >
          {copy.speedShort}
          <span dir="ltr" className="font-black tabular-nums text-primary">
            {formatNumerals(state.playbackRate, language)}×
          </span>
        </button>

        {currentEntry.availableVoiceIds.length > 1 && (
          <button
            type="button"
            aria-expanded={showOptions}
            onClick={() => setShowOptions(!showOptions)}
            className={`${PILL_CLASS} ${showOptions ? PILL_ACTIVE : PILL_IDLE}`}
          >
            <Headphones size={16} aria-hidden="true" />
            {copy.reciterShort}
          </button>
        )}
      </div>

      {showOptions && currentEntry.availableVoiceIds.length > 1 && (
        <label className="mt-3 grid gap-1 text-xs font-bold text-muted-foreground">
          {copy.voice}
          <select
            value={state.currentVoiceId ?? currentEntry.defaultVoiceId}
            onChange={(event) => controller.setVoice(event.currentTarget.value)}
            className="min-h-11 rounded-xl border border-border-control bg-background px-3 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {currentEntry.availableVoiceIds.map((vId) => (
              <option key={vId} value={vId}>
                {getAudioVoiceName(vId, language) ?? currentEntry.segmentsByVoice[vId]?.[0]?.voiceName ?? vId}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Whose recitation this is, always on screen rather than behind a
          disclosure — it is an attribution, not a setting. */}
      <p className="mt-3 text-center text-micro font-semibold leading-5 text-muted-foreground/80">{attributionText}</p>
    </section>
  );
}
