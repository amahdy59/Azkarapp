import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "./icons";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";
import { formatNumerals } from "../formatting";
import { getAudioVoiceName, getAudioVoices } from "../audio/audioVoices";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { motion, useReducedMotion } from "motion/react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { t } from "../i18n";

/**
 * The speeds worth offering, in the order the control walks through them.
 *
 * A five-option select for one number cost a label, a dropdown and a choice;
 * the pill shows the rate it is on and moves to the next one, which is what
 * people did with the select anyway.
 */
const PLAYBACK_RATES = [0.8, 1, 1.25, 1.5, 2] as const;
const LARGE_SEEK_SECONDS = 30;

function nextPlaybackRate(current: number) {
  const index = PLAYBACK_RATES.findIndex((rate) => rate === current);
  return PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length] ?? 1;
}

function getErrorMessage(code: string | undefined, language: AppLanguage) {
  if (code === "playback-blocked") return t(language, "audioPlayer.errorBlocked");
  if (code === "offline-not-cached") return t(language, "audioPlayer.errorOffline");
  if (code === "decode") return t(language, "audioPlayer.errorDecode");
  return t(language, "audioPlayer.errorUnavailable");
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
      className="flex min-w-11 max-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-2 text-muted-foreground transition-[transform,background-color,color] duration-fast hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
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

function progressBackground(progress: number, direction: "rtl" | "ltr") {
  const clamped = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress)) : 0;
  const stop =
    clamped <= 0
      ? "0%"
      : clamped >= 100
        ? "100%"
        : `calc(0.5625rem + (100% - 1.125rem) * ${(clamped / 100).toFixed(4)})`;
  return `linear-gradient(to ${direction === "rtl" ? "left" : "right"}, var(--primary) ${stop}, var(--muted) ${stop})`;
}

function VolumeControl({
  controller,
  language,
  inline = false,
}: {
  controller: AudioController;
  language: AppLanguage;
  inline?: boolean;
}) {
  const supportsHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const lastPointerTypeRef = useRef<string>("mouse");
  const level = controller.preferences.muted ? 0 : controller.preferences.volume;
  const percentage = Math.round(level * 100);
  const volumeLabel = t(language, "audioPlayer.volume");
  const muteLabel = controller.preferences.muted ? t(language, "audioPlayer.unmute") : t(language, "audioPlayer.mute");

  useEffect(() => {
    if (inline || !open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [inline, open]);

  if (inline) {
    return (
      <div
        role="toolbar"
        aria-label={volumeLabel}
        className="flex min-h-11 items-center gap-1 rounded-full border border-border px-1"
      >
        <button
          type="button"
          aria-label={muteLabel}
          onClick={controller.toggleMuted}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {controller.preferences.muted || controller.preferences.volume === 0 ? (
            <VolumeX size={20} aria-hidden="true" />
          ) : (
            <Volume2 size={20} aria-hidden="true" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={level}
          onChange={(event) => controller.setVolume(Number(event.currentTarget.value))}
          aria-label={volumeLabel}
          aria-valuetext={`${formatNumerals(percentage, language)}%`}
          style={
            {
              "--audio-range-fill": progressBackground(percentage, language === "ar" ? "rtl" : "ltr"),
            } as CSSProperties
          }
          className="audio-timeline-range h-11 w-20 cursor-pointer appearance-none accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:w-28"
        />
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-label={volumeLabel}
      className="relative flex shrink-0"
      onPointerEnter={(event) => {
        if (supportsHover && event.pointerType === "mouse") setOpen(true);
      }}
      onFocusCapture={() => supportsHover && setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        type="button"
        aria-label={muteLabel}
        aria-expanded={open}
        aria-controls="audio-volume-control"
        onPointerDown={(event) => {
          lastPointerTypeRef.current = event.pointerType || "mouse";
        }}
        onClick={() => {
          const isTouchOrPen = lastPointerTypeRef.current === "touch" || lastPointerTypeRef.current === "pen";
          if (supportsHover && !isTouchOrPen) {
            controller.toggleMuted();
          } else {
            setOpen((value) => !value);
          }
        }}
        className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-[background-color,color,transform] duration-fast hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        {controller.preferences.muted || controller.preferences.volume === 0 ? (
          <VolumeX size={20} aria-hidden="true" />
        ) : (
          <Volume2 size={20} aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          id="audio-volume-control"
          data-testid="audio-volume-popover"
          className="absolute bottom-full end-[-0.625rem] z-10 h-16 w-44 pb-2"
        >
          <div className="flex h-full w-full items-center gap-1 rounded-2xl border border-border bg-card/98 px-2 shadow-overlay backdrop-blur-xl">
            {controller.preferences.muted || controller.preferences.volume === 0 ? (
              <VolumeX size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            ) : (
              <Volume2 size={18} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={level}
              onChange={(event) => controller.setVolume(Number(event.currentTarget.value))}
              aria-label={volumeLabel}
              aria-valuetext={`${formatNumerals(percentage, language)}%`}
              style={
                {
                  "--audio-range-fill": progressBackground(percentage, language === "ar" ? "rtl" : "ltr"),
                } as CSSProperties
              }
              className="audio-timeline-range h-11 min-w-0 flex-1 cursor-pointer appearance-none accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function FloatingAudioPlayer({
  controller,
  language,
  direction = language === "ar" ? "rtl" : "ltr",
  overReadingSurface = false,
  dockedInReader = false,
}: {
  controller: AudioController;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  /**
   * The player is covering something being read — today, the Mushaf.
   *
   * The expanded player takes a large share of a 375px screen, which on the
   * one flow it exists to serve — listening to a surah while reading along —
   * hides the pages. It opens compact there instead; the expand control is
   * still one tap away, and a reader who expands it is left alone.
   */
  overReadingSurface?: boolean;
  /**
   * Docked inside the Reader's Zikr area. Takes up the exact space of the Zikr card
   * without covering desktop side navigation or progress menus.
   */
  dockedInReader?: boolean;
}) {
  const { state, currentEntry, currentSegment } = controller;
  /* A tablet or desktop has room for the player beside the page. */
  const hasRoomBesideReading = useMediaQuery("(min-width: 768px)");
  const coversReading = overReadingSurface && !hasRoomBesideReading;
  const [isMinimized, setIsMinimized] = useState(true);
  const systemReducedMotion = useReducedMotion();
  const motionReduced =
    systemReducedMotion ||
    (typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion"));
  const shellTransition = {
    duration: motionReduced ? 0 : 0.2,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const trackMetaTransition = {
    duration: motionReduced ? 0 : 0.16,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const wasCoveringReading = useRef(coversReading);
  const [selectedVoiceOverride, setSelectedVoiceOverride] = useState<string | null>(null);
  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  const timingRef = useRef({ currentTime: state.currentTime, duration: state.duration });
  timingRef.current = { currentTime: state.currentTime, duration: state.duration };

  useEffect(() => {
    setSelectedVoiceOverride(null);
  }, [currentEntry?.entryId, state.currentVoiceId]);

  useEffect(() => {
    // Only on the way in: opening the Mushaf while a surah plays should fold
    // the player away, but closing it must not reopen what the reader folded.
    if (coversReading && !wasCoveringReading.current) setIsMinimized(true);
    wasCoveringReading.current = coversReading;
  }, [coversReading]);

  useEffect(() => {
    // Recovery actions must never be hidden behind the compact player.
    if (state.status === "error") setIsMinimized(false);
  }, [state.status]);

  const jumpSeconds = useCallback((delta: number) => {
    const { currentTime, duration } = timingRef.current;
    controllerRef.current.seek(Math.max(0, Math.min(currentTime + delta, duration || 0)));
  }, []);

  const handleTimelineKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      if (event.key === "PageUp" || event.key === "PageDown") {
        event.preventDefault();
        event.stopPropagation();
        jumpSeconds(event.key === "PageUp" ? LARGE_SEEK_SECONDS : -LARGE_SEEK_SECONDS);
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        const isForward = direction === "rtl" ? event.key === "ArrowLeft" : event.key === "ArrowRight";
        jumpSeconds(isForward ? 5 : -5);
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        jumpSeconds(event.key === "ArrowUp" ? 5 : -5);
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        event.stopPropagation();
        controllerRef.current.seek(0);
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        event.stopPropagation();
        controllerRef.current.seek(timingRef.current.duration || 0);
      }
    },
    [direction, jumpSeconds],
  );

  useEffect(() => {
    const handleWindowKeyDown = (e: globalThis.KeyboardEvent) => {
      const activeElement = document.activeElement as HTMLElement | null;
      if (activeElement?.closest("button, a[href], input, textarea, select, [contenteditable='true'], [role='button']"))
        return;

      if (e.key === " ") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (state.status === "playing") controllerRef.current.pause();
        else controllerRef.current.play();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        e.stopImmediatePropagation();
        jumpSeconds(direction === "rtl" ? 5 : -5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        e.stopImmediatePropagation();
        jumpSeconds(direction === "rtl" ? -5 : 5);
      } else if (e.key === "Escape") {
        if (!isMinimized) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setIsMinimized(true);
        }
      }
    };
    window.addEventListener("keydown", handleWindowKeyDown, true);
    return () => window.removeEventListener("keydown", handleWindowKeyDown, true);
  }, [direction, isMinimized, jumpSeconds, state.status]);

  if (!state.plan || !currentEntry) return null;

  const isPlaying = state.status === "playing";
  const isBusy = state.status === "loading" || state.status === "buffering";
  const totalTracks = state.plan.entries.length;
  const queuePosition = `${formatNumerals(state.entryIndex + 1, language)} / ${formatNumerals(totalTracks, language)}`;
  const repetitionPosition =
    currentEntry.repetitions > 1
      ? `${formatNumerals(state.repetitionIndex + 1, language)} / ${formatNumerals(currentEntry.repetitions, language)}`
      : null;
  const title = language === "ar" ? currentEntry.titleArabic : currentEntry.titleEnglish;
  const activeVoiceId = state.currentVoiceId ?? currentEntry.defaultVoiceId;
  const displayedVoiceId = selectedVoiceOverride ?? activeVoiceId;
  const reciterDisplayName =
    getAudioVoiceName(displayedVoiceId, language) ??
    currentEntry.segmentsByVoice[displayedVoiceId]?.[0]?.voiceName ??
    currentSegment?.voiceName ??
    displayedVoiceId;

  const mainVoices = getAudioVoices(language);
  const mainVoiceIds = new Set(mainVoices.map((voice) => voice.id));
  const extraVoiceIds = Array.from(new Set([activeVoiceId, ...currentEntry.availableVoiceIds])).filter(
    (id) => Boolean(id) && !mainVoiceIds.has(id),
  );
  const reciterOptions = [
    ...mainVoices.map((voice) => ({
      id: voice.id,
      label: language === "ar" ? voice.nameArabic : voice.nameEnglish,
    })),
    ...extraVoiceIds.map((id) => ({
      id,
      label:
        getAudioVoiceName(id, language) ??
        currentEntry.segmentsByVoice[id]?.[0]?.voiceName ??
        (id === activeVoiceId ? currentSegment?.voiceName : undefined) ??
        id,
    })),
  ];

  const attributionText = currentSegment
    ? `${language === "ar" ? (currentSegment.sourceNameArabic ?? currentSegment.sourceName) : currentSegment.sourceName} · ${
        language === "ar"
          ? (currentSegment.attributionArabic ?? currentSegment.attribution)
          : currentSegment.attribution
      }`
    : `${t(language, "audioPlayer.recitationBy")} ${reciterDisplayName}`;

  const liveMessage =
    state.status === "error"
      ? getErrorMessage(state.error?.code, language)
      : state.announcement === "queue-completed"
        ? t(language, "audioPlayer.queueCompleted")
        : state.announcement === "repetition-completed"
          ? t(language, "audioPlayer.repetitionCompleted")
          : state.announcement === "track-changed"
            ? `${t(language, "audioPlayer.trackChanged")}: ${title}`
            : "";

  const repeatEnabled = currentEntry.repetitions > 1;
  const canRepeat = currentEntry.supportedModes.includes("repeat-prescribed-count");
  const progressPercent =
    Number.isFinite(state.duration) && state.duration > 0
      ? Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100))
      : 0;
  const entryProgress =
    currentEntry.repetitions > 1
      ? (state.repetitionIndex + progressPercent / 100) / currentEntry.repetitions
      : progressPercent / 100;
  const sessionProgressPercent = Math.min(100, Math.max(0, ((state.entryIndex + entryProgress) / totalTracks) * 100));

  const positionChip =
    totalTracks > 1
      ? `${t(language, "audioPlayer.track")} ${queuePosition}`
      : repetitionPosition
        ? `${t(language, "audioPlayer.repetitionChip")} ${repetitionPosition}`
        : null;

  const zikrArabicText = currentEntry.arabicText?.trim() || currentEntry.titleArabic;
  const isEnglishMode = language === "en" || displayedVoiceId === "english-george";
  const showSeparateTitle = !currentEntry.arabicText || currentEntry.arabicText.trim() !== title.trim();

  if (isMinimized) {
    return (
      <motion.section
        initial={motionReduced ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={shellTransition}
        aria-label={t(language, "audioPlayer.region")}
        dir={direction}
        data-variant="compact"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className={
          dockedInReader
            ? "floating-audio-player floating-audio-player--compact absolute inset-x-2 bottom-[env(safe-area-inset-bottom)] sm:inset-x-3 md:bottom-2 z-30 rounded-2xl border border-primary/30 bg-card px-2.5 py-2 shadow-overlay dark:border-white/15"
            : `floating-audio-player floating-audio-player--compact fixed z-40 rounded-t-2xl border border-b-0 border-primary/30 bg-card px-2.5 py-2 shadow-overlay dark:border-white/15 ${overReadingSurface ? "floating-audio-player--reading" : ""}`
        }
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {/* Phones use this quiet progress strip because the compact timeline
            does not fit. Wider compact layouts show the interactive timeline
            instead, so only one progress indicator is visible at a time. */}
        <div
          data-testid="audio-compact-progress"
          className="absolute inset-x-3 top-0.5 h-1 overflow-hidden rounded-full bg-muted md:hidden"
          role="progressbar"
          aria-label={t(language, "audioPlayer.sessionProgress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(sessionProgressPercent)}
        >
          <div
            className="absolute top-0 h-full bg-primary transition-[width] duration-fast"
            style={{ width: `${sessionProgressPercent}%`, insetInlineStart: 0 }}
          />
        </div>

        <div className="audio-compact-row flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label={t(language, "audioPlayer.expand")}
            className="group flex min-w-0 flex-1 items-center gap-2 rounded-xl px-1 py-1 text-start transition-colors duration-fast hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
              <ChevronUp size={20} aria-hidden="true" />
            </span>

            <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <div>
                <WaveBars playing={isPlaying} />
              </div>
              <motion.span
                key={currentEntry.entryId}
                initial={motionReduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={trackMetaTransition}
                className="min-w-0 flex-1 block"
              >
                <span className="block truncate text-label font-black text-foreground">{title}</span>
                <span className="block truncate text-micro font-semibold text-muted-foreground">
                  {reciterDisplayName}
                  {positionChip ? ` · ${positionChip}` : ""}
                  <span className="md:hidden">
                    {" · "}
                    <span dir="ltr" className="tabular-nums">
                      {formatTime(state.currentTime, language)} / {formatTime(state.duration, language)}
                    </span>
                  </span>
                </span>
              </motion.span>
            </div>
          </button>

          <div className="hidden min-w-32 flex-1 items-center gap-2 md:flex" dir={direction}>
            <span className="w-10 text-center text-micro font-bold tabular-nums text-muted-foreground">
              {formatTime(state.currentTime, language)}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, state.duration)}
              step="any"
              value={Math.min(state.currentTime, state.duration || 0)}
              disabled={state.duration <= 0}
              onChange={(event) => controller.seek(Number(event.currentTarget.value))}
              onKeyDown={handleTimelineKeyDown}
              aria-label={t(language, "audioPlayer.seek")}
              aria-keyshortcuts="PageUp PageDown"
              aria-valuetext={accessibleTime(state.currentTime, state.duration, language)}
              style={{ "--audio-range-fill": progressBackground(progressPercent, direction) } as CSSProperties}
              className="audio-timeline-range h-11 min-w-0 flex-1 cursor-pointer appearance-none accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
            <span className="w-10 text-center text-micro font-bold tabular-nums text-muted-foreground">
              {formatTime(state.duration, language)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => jumpSeconds(-10)}
              disabled={state.duration <= 0}
              aria-label={t(language, "audioPlayer.jumpBack10")}
              className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 md:flex"
            >
              <JumpBack10Icon className="size-5" />
            </button>
            <button
              style={{ borderRadius: 9999 }}
              type="button"
              onClick={isPlaying ? controller.pause : controller.play}
              aria-label={isPlaying ? t(language, "audioPlayer.pause") : t(language, "audioPlayer.play")}
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-raised transition-transform duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span className="flex items-center justify-center">
                {isPlaying ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
              </span>
            </button>
            <button
              type="button"
              onClick={() => jumpSeconds(10)}
              disabled={state.duration <= 0}
              aria-label={t(language, "audioPlayer.jumpForward10")}
              className="hidden size-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 md:flex"
            >
              <JumpForward10Icon className="size-5" />
            </button>
            <VolumeControl controller={controller} language={language} />
            <button
              type="button"
              onClick={controller.stop}
              aria-label={t(language, "audioPlayer.stop")}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={motionReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shellTransition}
      aria-label={t(language, "audioPlayer.region")}
      dir={direction}
      data-variant="expanded"
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      className={
        dockedInReader
          ? "floating-audio-player floating-audio-player--expanded absolute inset-0 z-30 flex h-full w-full flex-col justify-between overflow-x-hidden overflow-y-auto overscroll-contain bg-card px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-overlay sm:px-6 lg:px-8 md:rounded-3xl md:border md:border-border/80"
          : `floating-audio-player floating-audio-player--expanded fixed z-40 inset-0 flex h-full w-full flex-col justify-between overflow-x-hidden overflow-y-auto overscroll-contain bg-card px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 shadow-overlay sm:px-6 lg:px-8 ${overReadingSurface ? "floating-audio-player--reading" : ""}`
      }
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {/* Minimize and close retain the same logical edges in both player sizes. */}
      <div className="flex shrink-0 items-center justify-between">
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          aria-label={t(language, "audioPlayer.collapse")}
          className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <ChevronDown size={22} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={controller.stop}
          aria-label={t(language, "audioPlayer.stop")}
          className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      {/* What is playing: title, reciter dropdown, followed by the full scrollable Zikr text within the zikr card */}
      <div className="my-2 flex min-h-0 flex-1 flex-col rounded-3xl border border-border/50 bg-muted/30 p-3 sm:p-5 overflow-hidden">
        <motion.div
          key={currentEntry.entryId}
          initial={motionReduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={trackMetaTransition}
          className="flex min-h-0 flex-1 flex-col items-center"
        >
          <div className="shrink-0 flex flex-col items-center text-center">
            <div>
              <WaveBars playing={isPlaying} />
            </div>
            {showSeparateTitle && (
              <h3 className="mt-1.5 line-clamp-2 text-base sm:text-lg font-black leading-snug text-foreground">
                {title}
              </h3>
            )}
            <div className="mt-1.5 flex max-w-full items-center justify-center">
              <Select
                value={displayedVoiceId}
                onValueChange={(nextVoiceId) => {
                  setSelectedVoiceOverride(nextVoiceId);
                  controller.setVoice(nextVoiceId);
                }}
                dir={language === "ar" ? "rtl" : "ltr"}
              >
                <SelectTrigger
                  aria-label={t(language, "audioPlayer.voice")}
                  data-testid="audio-reciter-select"
                  size="sm"
                  className="min-h-11 w-auto max-w-full gap-2 rounded-full border-border/80 bg-background/70 px-3.5 py-1.5 text-label font-bold text-foreground shadow-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <Headphones size={15} className="shrink-0 text-primary" aria-hidden="true" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="center">
                  {reciterOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {positionChip && (
              <p className="mt-2 rounded-full border border-border px-3 py-0.5 text-xs font-bold text-muted-foreground">
                {positionChip}
              </p>
            )}
            {isBusy && (
              <p className="mt-1.5 text-xs font-semibold text-primary" role="status">
                {state.status === "buffering"
                  ? t(language, "audioPlayer.buffering")
                  : t(language, "audioPlayer.loading")}
              </p>
            )}
          </div>

          {/* Full Zikr Text Area: written within the area of the Zikr name */}
          <div className="mt-3 flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto border-t border-border/50 px-2 py-3 sm:px-6 sm:py-4 select-text">
            <div className="my-auto flex w-full max-w-[42rem] flex-col items-center justify-center text-center">
              <p
                data-testid="audio-player-zikr-text"
                className="zikr-text text-center font-medium leading-[2.1] text-foreground text-lg sm:text-2xl"
                dir="rtl"
                lang="ar"
                style={{ fontFamily: "var(--font-zikr)" }}
              >
                {zikrArabicText}
              </p>
              {isEnglishMode && currentEntry.translation && (
                <p
                  className="mt-4 border-t border-border/50 pt-3 text-center text-sm sm:text-base leading-relaxed text-muted-foreground"
                  dir="ltr"
                  lang="en"
                >
                  {currentEntry.translation}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Transport Controller Area: docked at the bottom where the counter normally sits */}
      <div className="mx-auto w-full max-w-2xl shrink-0 pt-1">
        {/* Timeline / Scrub Bar with Generous 44px Hit Target */}
        <div className="flex items-center gap-3" dir={direction}>
          <span className="w-11 text-center text-xs font-bold tabular-nums text-muted-foreground">
            {formatTime(state.currentTime, language)}
          </span>
          <div className="relative flex min-w-0 flex-1 items-center h-11">
            <input
              type="range"
              min={0}
              max={Math.max(0, state.duration)}
              step="any"
              value={Math.min(state.currentTime, state.duration || 0)}
              disabled={state.duration <= 0}
              onChange={(event) => controller.seek(Number(event.currentTarget.value))}
              onKeyDown={handleTimelineKeyDown}
              aria-label={t(language, "audioPlayer.seek")}
              aria-keyshortcuts="PageUp PageDown"
              aria-valuetext={accessibleTime(state.currentTime, state.duration, language)}
              /* The played part of the track is drawn here rather than in a
                 stylesheet: a range input needs one gradient per browser engine
                 to fill, and the value is already in hand. */
              style={{ "--audio-range-fill": progressBackground(progressPercent, direction) } as CSSProperties}
              className="audio-timeline-range h-11 w-full cursor-pointer appearance-none accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            />
          </div>
          <span className="w-11 text-center text-xs font-bold tabular-nums text-muted-foreground">
            {formatTime(state.duration, language)}
          </span>
        </div>

        {/* Primary Transport Controls Row */}
        <div className="mt-1 flex w-full items-start justify-center gap-0.5 sm:gap-2">
          {totalTracks > 1 && (
            <TransportButton
              label={t(language, "audioPlayer.previousShort")}
              ariaLabel={t(language, "audioPlayer.previous")}
              onClick={controller.previous}
              disabled={state.entryIndex === 0}
            >
              <SkipBack size={20} className="rtl:rotate-180" aria-hidden="true" />
            </TransportButton>
          )}

          <TransportButton
            label={t(language, "audioPlayer.back10Short")}
            ariaLabel={t(language, "audioPlayer.jumpBack10")}
            onClick={() => jumpSeconds(-10)}
            disabled={state.duration <= 0}
          >
            <JumpBack10Icon className="size-5" />
          </TransportButton>

          <button
            style={{ borderRadius: 9999 }}
            type="button"
            onClick={isPlaying ? controller.pause : controller.play}
            aria-label={isPlaying ? t(language, "audioPlayer.pause") : t(language, "audioPlayer.play")}
            className="mx-1 mt-1 flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-raised transition-transform duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="flex items-center justify-center">
              {isPlaying ? <Pause size={28} aria-hidden="true" /> : <Play size={28} aria-hidden="true" />}
            </span>
          </button>

          <TransportButton
            label={t(language, "audioPlayer.forward10Short")}
            ariaLabel={t(language, "audioPlayer.jumpForward10")}
            onClick={() => jumpSeconds(10)}
            disabled={state.duration <= 0}
          >
            <JumpForward10Icon className="size-5" />
          </TransportButton>

          {totalTracks > 1 && (
            <TransportButton
              label={t(language, "audioPlayer.nextShort")}
              ariaLabel={t(language, "audioPlayer.next")}
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
            <p className="text-label font-semibold text-destructive">{getErrorMessage(state.error?.code, language)}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={controller.retry}
                className="min-h-11 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "audioPlayer.retry")}
              </button>
              <button
                type="button"
                onClick={controller.skip}
                className="min-h-11 rounded-xl border border-border px-4 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "audioPlayer.skip")}
              </button>
              <button
                type="button"
                onClick={controller.stop}
                className="min-h-11 rounded-xl border border-destructive/40 px-4 text-xs font-bold text-destructive focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "audioPlayer.stop")}
              </button>
            </div>
          </div>
        )}

        {/* Only contextual options remain here. Restart is already available by
            moving the timeline to its start and Play restarts an ended item. */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t border-border/70 pt-3">
          {canRepeat && (
            <button
              type="button"
              aria-pressed={repeatEnabled}
              onClick={() => controller.setPlaybackMode(repeatEnabled ? "play-once" : "repeat-prescribed-count")}
              className={`${PILL_CLASS} ${repeatEnabled ? PILL_ACTIVE : PILL_IDLE}`}
            >
              <RotateCcw size={16} aria-hidden="true" />
              {t(language, "audioPlayer.repeatShort")}
            </button>
          )}

          <button
            type="button"
            onClick={() => controller.setPlaybackRate(nextPlaybackRate(state.playbackRate))}
            className={`${PILL_CLASS} ${state.playbackRate === 1 ? PILL_IDLE : PILL_ACTIVE}`}
          >
            {t(language, "audioPlayer.speedShort")}
            <span dir="ltr" className="font-black tabular-nums text-primary">
              {formatNumerals(state.playbackRate, language)}×
            </span>
          </button>

          <VolumeControl controller={controller} language={language} inline />
        </div>

        {/* Whose recitation this is, always on screen rather than behind a
            disclosure — it is an attribution, not a setting. */}
        <p className="mt-2 text-center text-micro font-semibold leading-5 text-muted-foreground/80">
          {attributionText}
        </p>
      </div>
    </motion.section>
  );
}
