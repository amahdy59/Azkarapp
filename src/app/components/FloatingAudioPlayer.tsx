import "./floating-audio-player.css";
import { MushafMagnificationControl } from "./MushafMagnificationControl";
import { getScrollViewport } from "./scrollViewport";
import {
  lazy,
  Suspense,
  useCallback,
  useId,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Headphones,
  Pause,
  Play,
  Repeat,
  ClockRewind,
  ClockFastForward,
  SkipBack,
  SkipForward,
  SlidersHorizontal,
  X,
} from "./icons";
import type { AppLanguage, TextSizeOption, MushafPageTheme, MushafTextScale } from "../types";
import { getReadingFontSizeRem } from "../screens/readingTypography";
import type { AudioController } from "../audio/AudioProvider";
import { formatNumerals } from "../formatting";
import { getAudioVoiceName, getAudioVoices } from "../audio/audioVoices";
import { useMediaQuery } from "../hooks/useMediaQuery";
import * as Popover from "@radix-ui/react-popover";
import { AudioVolumeControl } from "./AudioVolumeControl";
import { getAudioWaveform } from "../audio/audioWaveform";
import { motion, useReducedMotion } from "motion/react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { t } from "../i18n";
import { ReadingTextTransition } from "./ReadingTextTransition";
import { AudioPlayerSurface } from "./AudioPlayerSurface";
import { ListeningWordText } from "./ListeningWordText";
import { useReviewedListeningTiming } from "../hooks/useReviewedListeningTiming";
import { useListeningWordCue } from "../hooks/useListeningWordCue";
import { useListeningTextFollowing } from "../hooks/useListeningTextFollowing";
import { MUSHAF_EXCERPTS } from "../content/mushafExcerpts";
import { QURAN_TEXT_STYLE, getQuranReadingSize } from "../quranTypography";

const QuranListeningReader = lazy(() => import("./QuranListeningReader"));
const MushafExcerpt = lazy(() => import("./MushafExcerpt"));

/** Existing supported speeds, shown explicitly in the selection menu. */
const PLAYBACK_RATES = [0.8, 1, 1.25, 1.5, 2] as const;
const LARGE_SEEK_SECONDS = 30;

function getErrorMessage(code: string | undefined, language: AppLanguage) {
  if (code === "playback-blocked") return t(language, "audioPlayer.errorBlocked");
  if (code === "offline-not-cached") return t(language, "audioPlayer.errorOffline");
  if (code === "decode") return t(language, "audioPlayer.errorDecode");
  return t(language, "audioPlayer.errorUnavailable");
}

function formatTime(seconds: number, language: AppLanguage) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainder = safeSeconds % 60;
  if (hours > 0) {
    return formatNumerals(
      `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`,
      language,
    );
  }
  return formatNumerals(`${minutes}:${remainder.toString().padStart(2, "0")}`, language);
}

function accessibleTime(current: number, duration: number, language: AppLanguage) {
  const describe = (seconds: number) => {
    const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const remainder = Math.floor(safe % 60);
    if (hours > 0) {
      return language === "ar"
        ? `${formatNumerals(hours, language)} ساعة و${formatNumerals(minutes, language)} دقيقة و${formatNumerals(remainder, language)} ثانية`
        : `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"} ${remainder} second${remainder === 1 ? "" : "s"}`;
    }
    return language === "ar"
      ? `${formatNumerals(minutes, language)} دقيقة و${formatNumerals(remainder, language)} ثانية`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ${remainder} second${remainder === 1 ? "" : "s"}`;
  };
  return language === "ar"
    ? `${describe(current)} من ${describe(duration)}`
    : `${describe(current)} of ${describe(duration)}`;
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
  const accessibleName = ariaLabel || label;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={accessibleName}
      title={accessibleName}
      className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast hover:bg-muted hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function FloatingAudioPlayer({
  controller,
  language,
  direction = language === "ar" ? "rtl" : "ltr",
  overReadingSurface = false,
  preferCompactReading = false,
  dockedInReader = false,
  onClose,
  textSize = "medium",
  mushafTheme = "light",
  mushafTextScale = "medium",
}: {
  controller: AudioController;
  language: AppLanguage;
  textSize?: TextSizeOption;
  mushafTheme?: MushafPageTheme;
  mushafTextScale?: MushafTextScale;
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
  /** The main Mushaf owns synchronized reading on desktop as well as mobile. */
  preferCompactReading?: boolean;
  /**
   * Docked inside the Reader's Zikr area. Takes up the exact space of the Zikr card
   * without covering desktop side navigation or progress menus.
   */
  dockedInReader?: boolean;
  dockSlots?: {
    benefit?: ReactNode;
  };
  onClose?: () => void;
}) {
  const { state, currentEntry, currentSegment } = controller;
  /* A tablet or desktop has room for the player beside the page. */
  const hasRoomBesideReading = useMediaQuery("(min-width: 768px)");
  const coversReading = overReadingSurface && (preferCompactReading || !hasRoomBesideReading);
  const [isMinimized, setIsMinimized] = useState(true);
  const compactRootRef = useRef<HTMLElement>(null);
  const reserveClearanceRef = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;
    const clear = () => {
      main.style.removeProperty("--floating-audio-clearance");
      main.style.removeProperty("--mushaf-audio-clearance");
    };
    if (dockedInReader || !currentEntry?.entryId) clear();
    return clear;
  }, [dockedInReader, currentEntry?.entryId]);
  useLayoutEffect(() => {
    const main = document.getElementById("main-content");
    const dock = compactRootRef.current;
    if (!main || !dock || !isMinimized || dockedInReader || !currentEntry?.entryId) return;
    const reserve = () => {
      const clearance = Math.max(
        0,
        Math.ceil(main.getBoundingClientRect().bottom - dock.getBoundingClientRect().top) + 8,
      );
      main.style.setProperty("--floating-audio-clearance", `${clearance}px`);
      if (preferCompactReading) main.style.setProperty("--mushaf-audio-clearance", `${clearance}px`);
      else main.style.removeProperty("--mushaf-audio-clearance");
      const focused = document.activeElement;
      if (focused instanceof HTMLElement && main.contains(focused) && !dock.contains(focused)) {
        const scroll = getScrollViewport(focused);
        const bottom = Math.min(main.getBoundingClientRect().bottom, scroll.getBoundingClientRect().bottom) - clearance;
        const covered = focused.getBoundingClientRect().bottom - bottom;
        if (covered > 0) scroll.scrollTop += covered + 8;
      }
    };
    reserveClearanceRef.current = reserve;
    reserve();
    // Container layout can settle after the compact shell has mounted.
    const frame = requestAnimationFrame(reserve);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(reserve);
    observer?.observe(dock);
    observer?.observe(main);
    window.addEventListener("resize", reserve);
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      reserveClearanceRef.current = null;
      window.removeEventListener("resize", reserve);
      // Keep the compact footprint while the expanded overlay covers the page.
      // Removing and restoring inherited calc() padding leaves stale layout in WebKit.
    };
  }, [isMinimized, preferCompactReading, dockedInReader, currentEntry?.entryId]);
  const collapseButtonRef = useRef<HTMLButtonElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const readingTextRef = useRef<HTMLDivElement>(null);
  const wasExpandedRef = useRef(false);
  const systemReducedMotion = useReducedMotion();
  const motionReduced =
    systemReducedMotion ||
    (typeof document !== "undefined" && document.documentElement.classList.contains("reduce-motion"));
  const shellTransition = {
    duration: motionReduced ? 0 : 0.2,
    ease: [0.22, 1, 0.36, 1] as const,
  };

  useEffect(() => {
    if (!isMinimized) {
      wasExpandedRef.current = true;
      collapseButtonRef.current?.focus();
    } else if (wasExpandedRef.current) {
      expandButtonRef.current?.focus();
      wasExpandedRef.current = false;
    }
  }, [isMinimized]);
  const trackMetaTransition = {
    duration: motionReduced ? 0 : 0.16,
    ease: [0.22, 1, 0.36, 1] as const,
  };
  const wasCoveringReading = useRef(coversReading);
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [pageMagnification, setPageMagnification] = useState(100);
  const [arabicVisibility, setArabicVisibility] = useState<"auto" | "show" | "hide">("auto");
  const [showListeningWords, setShowListeningWords] = useState(true);
  const arabicTextId = useId();
  const compactDescriptionId = useId();
  const controllerRef = useRef(controller);
  controllerRef.current = controller;
  const timingRef = useRef({ currentTime: state.currentTime, duration: state.duration });
  timingRef.current = { currentTime: state.currentTime, duration: state.duration };

  useEffect(() => {
    if (readingTextRef.current) readingTextRef.current.scrollTop = 0;
  }, [currentEntry?.entryId]);

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
        const isForward = event.key === (direction === "rtl" ? "ArrowLeft" : "ArrowRight");
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
    [jumpSeconds, direction],
  );

  useEffect(() => {
    const handleWindowKeyDown = (e: globalThis.KeyboardEvent) => {
      if (!isMinimized || document.querySelector("[role=dialog], [role=menu], [role=listbox]")) return;

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
      }
    };
    window.addEventListener("keydown", handleWindowKeyDown, true);
    return () => window.removeEventListener("keydown", handleWindowKeyDown, true);
  }, [isMinimized, jumpSeconds, state.status, direction]);

  const currentVoiceId = state.currentVoiceId ?? currentEntry?.defaultVoiceId;
  const zikrArabicText = currentEntry ? currentEntry.arabicText?.trim() || currentEntry.titleArabic : "";
  const isEnglishMode = language === "en" || currentVoiceId === "english-george";
  const englishFirst =
    (language === "en" || currentVoiceId === "english-george") && Boolean(currentEntry?.translation?.trim());
  const spokenLanguage = currentVoiceId === "english-george" ? "en" : "ar";
  const spokenText = spokenLanguage === "en" ? (currentEntry?.translation ?? "") : zikrArabicText;
  const listeningTiming = useReviewedListeningTiming(currentSegment, spokenText, spokenLanguage);
  const showArabic =
    arabicVisibility === "show" || (arabicVisibility === "auto" && spokenLanguage === "ar" && Boolean(listeningTiming));
  const liveListeningCue = useListeningWordCue(
    listeningTiming,
    state.currentTime,
    state.status === "playing",
    controller.getPlaybackTime,
  );
  const listeningCue = showListeningWords ? liveListeningCue : null;
  const [followListeningText, setFollowListeningText] = useListeningTextFollowing(
    readingTextRef,
    listeningCue,
    `${currentSegment?.variantId ?? ""}:${currentSegment?.sha256 ?? ""}:${isMinimized}`,
  );

  if (!state.plan || !currentEntry) return null;

  const hasExcerpt = Boolean(MUSHAF_EXCERPTS[currentEntry.canonicalKey]);
  const ArabicTextTag = hasExcerpt ? "div" : "p";

  const isPlaying = state.status === "playing";
  const isBusy = state.status === "loading" || state.status === "buffering";
  const totalTracks = state.plan.entries.length;
  const queuePosition = `${formatNumerals(state.entryIndex + 1, language)} / ${formatNumerals(totalTracks, language)}`;
  const embeddedRepetitions = currentEntry.embeddedRepetitions ?? 1;
  const currentRepetition =
    embeddedRepetitions > 1
      ? Math.min(currentEntry.prescribedRepetitions, (state.repetitionIndex + 1) * embeddedRepetitions)
      : state.repetitionIndex + 1;
  const totalRepetitions = embeddedRepetitions > 1 ? currentEntry.prescribedRepetitions : currentEntry.repetitions;
  const repetitionProgress =
    currentEntry.repetitions > 1 && totalRepetitions > 1
      ? `${formatNumerals(currentRepetition, language)} / ${formatNumerals(totalRepetitions, language)}`
      : null;
  const title = language === "ar" ? currentEntry.titleArabic : currentEntry.titleEnglish;
  const activeVoiceId = state.currentVoiceId ?? currentEntry.defaultVoiceId;
  const displayedVoiceId = activeVoiceId;
  const reciterDisplayName =
    (displayedVoiceId === "english-george" ? t(language, "audioPlayer.englishVoiceShort") : null) ??
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
      disabled: !currentEntry.availableVoiceIds.includes(voice.id),
    })),
    ...extraVoiceIds.map((id) => ({
      id,
      label:
        getAudioVoiceName(id, language) ??
        currentEntry.segmentsByVoice[id]?.[0]?.voiceName ??
        (id === activeVoiceId ? currentSegment?.voiceName : undefined) ??
        id,
      disabled: false,
    })),
  ];

  const liveMessage =
    state.status === "error"
      ? getErrorMessage(state.error?.code, language)
      : state.announcement === "entry-completed"
        ? t(language, "audioPlayer.entryCompleted")
        : state.announcement === "queue-completed"
          ? t(language, "audioPlayer.queueCompleted")
          : state.announcement === "repetition-completed"
            ? t(language, "audioPlayer.repetitionCompleted")
            : state.announcement === "track-changed"
              ? `${t(language, "audioPlayer.trackChanged")}: ${title}`
              : "";

  const waveform = getAudioWaveform(currentSegment);
  const repeatEnabled = currentEntry.playbackMode === "repeat-prescribed-count" || currentEntry.repetitions > 1;
  const canRepeat = currentEntry.supportedModes.includes("repeat-prescribed-count");
  const progressPercent =
    Number.isFinite(state.duration) && state.duration > 0
      ? Math.min(100, Math.max(0, (state.currentTime / state.duration) * 100))
      : 0;
  const positionChip = totalTracks > 1 ? `${t(language, "audioPlayer.track")} ${queuePosition}` : null;
  const repeatLabel = t(language, "audioPlayer.repeatPrescribed", {
    count: formatNumerals(currentEntry.prescribedRepetitions, language),
  });

  const renderWaveform = (peaks: readonly number[], height: number, testId: string, amplitudePower = 1) => {
    let minPeak = 255;
    let maxPeak = 0;
    for (let i = 0; i < peaks.length; i++) {
      const p = peaks[i]!;
      if (p < minPeak) minPeak = p;
      if (p > maxPeak) maxPeak = p;
    }
    const peakRange = maxPeak - minPeak;
    const calcHeight = (peak: number) => {
      if (peakRange > 15) {
        const normalized = (peak - minPeak) / peakRange;
        return Math.max(2.5, (0.18 + 0.82 * Math.pow(normalized, amplitudePower)) * height);
      }
      return Math.max(2, Math.pow(peak / 255, amplitudePower) * height);
    };

    return (
      <div className="audio-seek-waveform" aria-hidden="true" data-testid={testId}>
        {peaks.map((peak, index) => (
          <span key={index} style={{ height: calcHeight(peak) }} />
        ))}
        <div
          className="audio-seek-waveform-played"
          style={{
            clipPath:
              direction === "rtl" ? `inset(0 0 0 ${100 - progressPercent}%)` : `inset(0 ${100 - progressPercent}% 0 0)`,
          }}
        >
          {peaks.map((peak, index) => (
            <span key={index} style={{ height: calcHeight(peak) }} />
          ))}
        </div>
        <div
          className="audio-seek-waveform-playhead"
          data-testid={`${testId}-playhead`}
          style={{
            height: `${height + 2}px`,
            insetInlineStart: `clamp(1px, ${progressPercent}%, calc(100% - 1px))`,
          }}
        />
      </div>
    );
  };
  const renderCompact = () => (
    <motion.section
      ref={compactRootRef}
      initial={motionReduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={shellTransition}
      onAnimationComplete={() => reserveClearanceRef.current?.()}
      role="region"
      aria-label={t(language, "audioPlayer.region")}
      aria-describedby={compactDescriptionId}
      dir={direction}
      data-variant="compact"
      onClick={(event) => {
        event.stopPropagation();
      }}
      onTouchStart={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      className={
        dockedInReader
          ? "floating-audio-player floating-audio-player--compact floating-audio-player--docked w-full"
          : `floating-audio-player floating-audio-player--compact fixed z-40 rounded-2xl border border-border bg-card shadow-sm overflow-hidden ${overReadingSurface ? "floating-audio-player--reading" : ""}`
      }
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>
      <div
        className={`audio-compact-card relative w-full ${dockedInReader ? "max-w-2xl mx-auto rounded-2xl border border-border bg-card shadow-sm overflow-hidden" : ""}`}
      >
        <div className="audio-compact-row">
          <button
            type="button"
            onClick={() => {
              controller.stop();
              onClose?.();
            }}
            aria-label={t(language, "audioPlayer.stop")}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <X size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label={`${t(language, "audioPlayer.openFullPlayer")}: ${title}`}
            className="audio-compact-context flex min-h-11 min-w-11 items-center gap-2 rounded-xl py-1 text-start hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <span className="audio-compact-context-icon shrink-0 items-center justify-center text-muted-foreground">
              <Headphones size={20} aria-hidden="true" />
            </span>
            <motion.span
              key={currentEntry.entryId}
              initial={motionReduced ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={trackMetaTransition}
              className="min-w-0 flex-1"
            >
              <span
                data-testid="audio-compact-title"
                title={title}
                className="truncate block text-label font-bold text-foreground"
              >
                {title}
              </span>
              <span className="audio-compact-meta flex min-w-0 flex-wrap items-center gap-x-2 text-xs font-semibold text-muted-foreground">
                <span className="audio-compact-voice truncate" title={reciterDisplayName}>
                  {reciterDisplayName}
                </span>
                <span dir="ltr" className="shrink-0 tabular-nums">
                  {formatTime(state.currentTime, language)}
                </span>
              </span>
            </motion.span>
          </button>
          <button
            style={{ borderRadius: 9999 }}
            type="button"
            onClick={isPlaying ? controller.pause : controller.play}
            aria-label={isPlaying ? t(language, "audioPlayer.pause") : t(language, "audioPlayer.play")}
            className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {isPlaying ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
          </button>
          <button
            type="button"
            ref={expandButtonRef}
            onClick={() => setIsMinimized(false)}
            aria-label={t(language, "audioPlayer.expand")}
            aria-describedby={compactDescriptionId}
            aria-expanded={false}
            className="flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <ChevronUp size={20} aria-hidden="true" />
          </button>
        </div>
        <span id={compactDescriptionId} className="sr-only">
          {title} · {reciterDisplayName} · {positionChip}
        </span>
        <div
          data-testid="audio-compact-progress"
          className="audio-compact-progress"
          dir={direction}
          role="progressbar"
          aria-label={t(language, "audioPlayer.sessionProgress")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercent)}
          aria-valuetext={accessibleTime(state.currentTime, state.duration, language)}
        >
          <div data-testid="audio-compact-waveform" className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>
    </motion.section>
  );

  if (isMinimized) {
    return renderCompact();
  }

  return (
    <AudioPlayerSurface dockedInReader={dockedInReader} onCollapse={() => setIsMinimized(true)}>
      <motion.section
        initial={motionReduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={shellTransition}
        role="region"
        aria-label={t(language, "audioPlayer.region")}
        dir={direction}
        data-variant="expanded"
        onKeyDown={(event) => {
          event.stopPropagation();
          const viewport = readingTextRef.current;
          if (
            viewport &&
            event.target === viewport &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey &&
            ["Home", "End"].includes(event.key)
          ) {
            event.preventDefault();
            setFollowListeningText(false);
            viewport.scrollTo({ top: event.key === "Home" ? 0 : viewport.scrollHeight, behavior: "instant" });
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        className={`floating-audio-player--expanded flex h-full min-h-0 flex-col ${dockedInReader ? "floating-audio-player--docked" : ""}`}
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        <motion.div
          initial={motionReduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shellTransition}
          className="audio-expanded-layout"
        >
          {/* Minimize and close retain the same logical edges in both player sizes. */}
          <div className="audio-expanded-header relative grid shrink-0 items-center">
            <button
              type="button"
              onClick={() => {
                controller.stop();
                onClose?.();
              }}
              aria-label={t(language, "audioPlayer.stop")}
              title={t(language, "audioPlayer.stop")}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={19} aria-hidden="true" />
            </button>
            <div
              className="audio-expanded-identity flex min-w-0 items-center justify-center px-1"
              data-testid="audio-expanded-identity"
            >
              <span className="truncate text-sm font-semibold">{reciterDisplayName}</span>
            </div>
            <button
              ref={collapseButtonRef}
              data-audio-initial-focus
              type="button"
              onClick={() => setIsMinimized(true)}
              aria-label={t(language, "audioPlayer.collapse")}
              className="flex size-11 items-center justify-center rounded-full text-muted-foreground transition-colors duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ChevronDown size={22} aria-hidden="true" />
            </button>
          </div>

          {/* Metadata stays still while the complete reviewed text scrolls independently. */}
          <div className="audio-expanded-reading flex min-h-0 flex-col overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col items-center">
              <div className="audio-expanded-meta w-full shrink-0 flex items-center px-3 text-center">
                {isBusy && (
                  <p className="mt-1 text-xs font-semibold text-primary" role="status">
                    {state.status === "buffering"
                      ? t(language, "audioPlayer.buffering")
                      : t(language, "audioPlayer.loading")}
                  </p>
                )}
              </div>

              {/* Full Zikr Text Area: written within the area of the Zikr name */}
              <div
                ref={readingTextRef}
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Native text region must be keyboard-scrollable.
                tabIndex={0}
                role="region"
                aria-label={t(language, "audioPlayer.nowPlaying")}
                className="audio-expanded-text mt-2 flex min-h-0 w-full flex-1 flex-col items-center overflow-y-auto overscroll-contain px-4 py-1 sm:px-8 select-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring/40"
                style={{
                  scrollbarGutter: "stable both-edges",
                  paddingBlockStart:
                    currentEntry.contentKind === "quran" && currentEntry.quranRange && currentEntry.mushafPages?.length
                      ? 0
                      : undefined,
                }}
              >
                {currentEntry.contentKind === "quran" && currentEntry.quranRange && currentEntry.mushafPages?.length ? (
                  <Suspense fallback={<p role="status">{t(language, "quranListening.loading")}</p>}>
                    <QuranListeningReader
                      key={currentEntry.entryId}
                      entry={currentEntry}
                      segment={controller.currentSegment}
                      currentTime={state.currentTime}
                      playing={state.status === "playing"}
                      readTime={state.status === "loading" ? undefined : controller.getPlaybackTime}
                      theme={mushafTheme}
                      textScale={mushafTextScale}
                      magnification={pageMagnification}
                      language={language}
                      textSize={textSize}
                    />
                  </Suspense>
                ) : (
                  <ReadingTextTransition
                    entryId={currentEntry.entryId}
                    index={state.entryIndex}
                    direction={direction}
                    reduceMotion={Boolean(motionReduced)}
                    className={`w-full max-w-2xl shrink-0 py-2 text-center`}
                  >
                    <div className="flex w-full flex-col items-center justify-center">
                      {englishFirst && (
                        <>
                          <p
                            data-testid="audio-player-zikr-text"
                            className="w-full text-center text-lg sm:text-xl leading-relaxed text-foreground"
                            dir="ltr"
                            lang="en"
                          >
                            <ListeningWordText
                              text={currentEntry.translation ?? ""}
                              cue={spokenLanguage === "en" ? listeningCue : null}
                            />
                          </p>
                        </>
                      )}
                      {language === "en" && !englishFirst && (
                        <p className="mb-2 text-sm leading-relaxed text-muted-foreground" lang="en" dir="ltr">
                          {t(language, "audioPlayer.translationUnavailable")}
                        </p>
                      )}

                      <ArabicTextTag
                        id={arabicTextId}
                        hidden={englishFirst && !showArabic}
                        data-testid={englishFirst ? "audio-player-arabic-text" : "audio-player-zikr-text"}
                        className={`zikr-text text-center font-medium ${
                          currentEntry.quranText || currentEntry.contentKind === "quran"
                            ? "leading-[1.7]"
                            : "leading-relaxed"
                        } text-foreground ${hasExcerpt ? "w-full" : ""} ${englishFirst ? "mt-2 w-full border-t border-border pt-3" : ""}`}
                        style={{
                          fontFamily:
                            currentEntry.quranText || currentEntry.contentKind === "quran"
                              ? "var(--font-mushaf)"
                              : undefined,
                          ...(currentEntry.quranText || currentEntry.contentKind === "quran" ? QURAN_TEXT_STYLE : {}),
                          fontSize:
                            currentEntry.quranText || currentEntry.contentKind === "quran"
                              ? getQuranReadingSize(textSize)
                              : getReadingFontSizeRem({
                                  textSize,
                                  arabicLength: zikrArabicText.length,
                                  longSurah: false,
                                }),
                        }}
                        dir="rtl"
                        lang="ar"
                      >
                        {hasExcerpt ? (
                          <Suspense
                            fallback={
                              <ListeningWordText
                                text={zikrArabicText}
                                quranLanguage={
                                  currentEntry.quranText || currentEntry.contentKind === "quran" ? language : undefined
                                }
                                cue={spokenLanguage === "ar" ? listeningCue : null}
                              />
                            }
                          >
                            <MushafExcerpt
                              canonicalKey={currentEntry.canonicalKey}
                              transcript={zikrArabicText}
                              language={language}
                              cue={spokenLanguage === "ar" ? listeningCue : null}
                              textSize={textSize}
                              theme={mushafTheme}
                              fallback={
                                <ListeningWordText
                                  text={zikrArabicText}
                                  quranLanguage={
                                    currentEntry.quranText || currentEntry.contentKind === "quran"
                                      ? language
                                      : undefined
                                  }
                                  cue={spokenLanguage === "ar" ? listeningCue : null}
                                />
                              }
                            />
                          </Suspense>
                        ) : (
                          <ListeningWordText
                            text={zikrArabicText}
                            quranLanguage={
                              currentEntry.quranText || currentEntry.contentKind === "quran" ? language : undefined
                            }
                            cue={spokenLanguage === "ar" ? listeningCue : null}
                          />
                        )}
                      </ArabicTextTag>
                      {!englishFirst && isEnglishMode && currentEntry.translation && (
                        <p
                          className="mt-3 border-t border-border/40 pt-2 text-center text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl"
                          dir="ltr"
                          lang="en"
                        >
                          <ListeningWordText
                            text={currentEntry.translation}
                            cue={spokenLanguage === "en" ? listeningCue : null}
                          />
                        </p>
                      )}
                    </div>
                  </ReadingTextTransition>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Transport Controller Area: docked at the bottom where the counter normally sits */}
          <div className="audio-expanded-controls mx-auto w-full max-w-5xl shrink-0 border-t border-border pt-1">
            {/* One waveform seek control with balanced time labels. */}
            <div className="audio-seek-row flex items-center gap-2 px-1" dir={direction}>
              <span className="w-10 text-center text-micro font-bold tabular-nums text-muted-foreground">
                {formatTime(state.currentTime, language)}
              </span>
              <div
                className={`audio-seek-control relative flex min-w-0 flex-1 items-center h-11 ${waveform ? "audio-seek-control--waveform" : ""}`}
              >
                {waveform && renderWaveform(waveform, 18, "audio-seek-waveform")}
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
                  style={
                    {
                      "--audio-range-fill": `linear-gradient(to ${direction === "rtl" ? "left" : "right"}, var(--primary) ${progressPercent}%, var(--muted) ${progressPercent}%)`,
                    } as CSSProperties
                  }
                  className="audio-timeline-range h-11 w-full cursor-pointer appearance-none accent-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                />
              </div>
              <span className="w-10 text-center text-micro font-bold tabular-nums text-muted-foreground">
                {formatTime(state.duration, language)}
              </span>
            </div>

            <div className="audio-expanded-actions" dir={direction}>
              {/* Primary Universal Audio Controller Row: Strict Symmetry Maintained */}
              <div
                className="audio-expanded-transport"
                data-tracks={totalTracks > 1 ? "multiple" : "single"}
                dir={direction}
              >
                {totalTracks > 1 && (
                  <TransportButton
                    label={t(language, "audioPlayer.previousShort")}
                    ariaLabel={t(language, "audioPlayer.previous")}
                    onClick={controller.previous}
                    disabled={state.entryIndex === 0}
                  >
                    {/* data-rtl-flip mirrors the directional arrow in RTL context */}
                    <SkipBack size={20} aria-hidden="true" data-rtl-flip />
                  </TransportButton>
                )}

                <TransportButton
                  label={t(language, "audioPlayer.back10Short")}
                  ariaLabel={t(language, "audioPlayer.jumpBack10")}
                  onClick={() => jumpSeconds(-10)}
                  disabled={state.duration <= 0}
                >
                  <ClockRewind className="size-5" aria-hidden="true" data-rtl-flip />
                </TransportButton>

                <button
                  style={{ borderRadius: 9999 }}
                  type="button"
                  onClick={isPlaying ? controller.pause : controller.play}
                  aria-label={isPlaying ? t(language, "audioPlayer.pause") : t(language, "audioPlayer.play")}
                  className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="flex items-center justify-center">
                    {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
                  </span>
                </button>

                <TransportButton
                  label={t(language, "audioPlayer.forward10Short")}
                  ariaLabel={t(language, "audioPlayer.jumpForward10")}
                  onClick={() => jumpSeconds(10)}
                  disabled={state.duration <= 0}
                >
                  <ClockFastForward className="size-5" aria-hidden="true" data-rtl-flip />
                </TransportButton>

                {totalTracks > 1 && (
                  <TransportButton
                    label={t(language, "audioPlayer.nextShort")}
                    ariaLabel={t(language, "audioPlayer.next")}
                    onClick={controller.next}
                    disabled={state.entryIndex === totalTracks - 1}
                  >
                    {/* data-rtl-flip mirrors the directional arrow in RTL context */}
                    <SkipForward size={20} aria-hidden="true" data-rtl-flip />
                  </TransportButton>
                )}
              </div>
            </div>

            <div
              className="audio-expanded-options flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-muted-foreground"
              dir={direction}
            >
              {positionChip && (
                <span data-testid="audio-queue-position" className="sr-only">
                  {t(language, "audioPlayer.track")} <span dir="ltr">{queuePosition}</span>
                </span>
              )}
              {repetitionProgress && (
                <span data-testid="audio-repetition-progress" className="sr-only">
                  {t(language, "audioPlayer.repetitionChip")} <span dir="ltr">{repetitionProgress}</span>
                </span>
              )}
              {canRepeat && (
                <button
                  type="button"
                  aria-pressed={repeatEnabled}
                  onClick={() => controller.setPlaybackMode(repeatEnabled ? "play-once" : "repeat-prescribed-count")}
                  className={`audio-repeat-option flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold hover:bg-muted transition-colors duration-fast focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    repeatEnabled
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={repeatLabel}
                  title={repeatLabel}
                >
                  <Repeat
                    size={15}
                    className={repeatEnabled ? "text-primary" : "text-muted-foreground"}
                    aria-hidden="true"
                  />
                  <span className={repeatEnabled ? "text-primary font-bold" : "text-foreground font-semibold"}>
                    {repeatLabel}
                  </span>
                </button>
              )}
              <Popover.Root>
                <Popover.Trigger asChild>
                  <button
                    type="button"
                    aria-label={t(language, "audioPlayer.options")}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors duration-fast focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                  >
                    <span>{t(language, "audioPlayer.options")}</span>
                    <ChevronUp size={16} aria-hidden="true" />
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    side="top"
                    collisionPadding={8}
                    sideOffset={8}
                    dir={direction}
                    aria-label={t(language, "audioPlayer.options")}
                    onEscapeKeyDown={(event) => {
                      event.stopPropagation();
                      // A nested select owns this Escape; keep options open
                      // until its focus has returned to the select trigger.
                      if (voiceMenuOpen || speedMenuOpen) event.preventDefault();
                    }}
                    onInteractOutside={(event) => {
                      if (voiceMenuOpen || speedMenuOpen) event.preventDefault();
                    }}
                    className="audio-options-menu z-50 flex max-h-[75dvh] sm:max-h-[80dvh] w-[22rem] sm:w-[24rem] max-w-[calc(100vw-1.5rem)] flex-col gap-3 overflow-y-auto rounded-2xl border border-border bg-card p-3.5 text-foreground shadow-overlay"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-border/60">
                      <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <SlidersHorizontal size={15} aria-hidden="true" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{t(language, "audioPlayer.options")}</span>
                      </div>
                      <Popover.Close asChild>
                        <button
                          type="button"
                          aria-label={t(language, "common.close")}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors cursor-pointer"
                        >
                          <X size={16} aria-hidden="true" />
                        </button>
                      </Popover.Close>
                    </div>

                    <div className="flex flex-col rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40">
                      <div className="flex flex-col gap-1.5 p-2.5">
                        <span className="text-micro font-medium text-muted-foreground px-0.5">
                          {t(language, "audioPlayer.reciterShort")}
                        </span>
                        <Select
                          open={voiceMenuOpen}
                          onOpenChange={setVoiceMenuOpen}
                          value={displayedVoiceId}
                          onValueChange={controller.setVoice}
                          dir={language === "ar" ? "rtl" : "ltr"}
                        >
                          <SelectTrigger
                            aria-label={t(language, "audioPlayer.voice")}
                            data-testid="audio-reciter-select"
                            size="sm"
                            className="h-11 w-full min-w-0 shrink justify-between gap-2 rounded-xl border-border bg-card px-3 py-1 text-sm font-medium text-foreground shadow-2xs transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring"
                          >
                            <Headphones size={15} className="shrink-0 text-primary" aria-hidden="true" />
                            <SelectValue className="truncate text-start font-medium flex-1">
                              {reciterDisplayName}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent
                            align="center"
                            className="z-[110] min-w-[10rem] max-w-[min(18rem,calc(100vw-2rem))]"
                            onEscapeKeyDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setVoiceMenuOpen(false);
                            }}
                          >
                            <SelectGroup>
                              {reciterOptions.map((option) => (
                                <SelectItem
                                  key={option.id}
                                  value={option.id}
                                  disabled={option.disabled}
                                  tabIndex={option.id === displayedVoiceId ? 0 : -1}
                                  aria-label={option.label}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {language === "en" && (
                          <span className="text-micro text-muted-foreground px-1">
                            {t(
                              language,
                              currentVoiceId === "english-george"
                                ? "audioPlayer.englishRecording"
                                : "audioPlayer.arabicRecording",
                            )}
                          </span>
                        )}
                      </div>

                      <div className="audio-options-row audio-expanded-speed flex min-h-11 items-center justify-between gap-3 px-3 py-1.5">
                        <span className="text-sm font-medium text-foreground">
                          {t(language, "audioPlayer.speedShort")}
                        </span>
                        <Select
                          open={speedMenuOpen}
                          onOpenChange={setSpeedMenuOpen}
                          value={String(state.playbackRate)}
                          onValueChange={(value) => controller.setPlaybackRate(Number(value))}
                          dir={direction}
                        >
                          <SelectTrigger
                            size="sm"
                            aria-label={`${t(language, "audioPlayer.speedShort")}: ${formatNumerals(state.playbackRate, language)}×`}
                            className="audio-speed-select w-auto min-h-11 gap-2 rounded-xl border border-border bg-card px-3 text-xs font-bold text-foreground shadow-2xs hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent
                            onEscapeKeyDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setSpeedMenuOpen(false);
                            }}
                          >
                            {PLAYBACK_RATES.map((rate) => (
                              <SelectItem key={rate} value={String(rate)}>
                                <span dir="ltr">{formatNumerals(rate, language)}×</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="audio-options-row flex min-h-11 items-center justify-between gap-3 px-3 py-1.5">
                        <span className="text-sm font-medium text-foreground">{t(language, "audioPlayer.volume")}</span>
                        <AudioVolumeControl controller={controller} language={language} />
                      </div>
                    </div>

                    {(currentEntry.contentKind === "quran" || englishFirst || listeningTiming) && (
                      <div className="flex flex-col rounded-xl border border-border/60 bg-muted/20 divide-y divide-border/40">
                        {currentEntry.contentKind === "quran" && (
                          <div className="p-2.5">
                            <MushafMagnificationControl
                              language={language}
                              value={pageMagnification}
                              onChange={setPageMagnification}
                            />
                          </div>
                        )}

                        {englishFirst && (
                          <button
                            type="button"
                            aria-expanded={showArabic}
                            aria-controls={arabicTextId}
                            onClick={() => setArabicVisibility(showArabic ? "hide" : "show")}
                            className="audio-options-row flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
                          >
                            <span>{t(language, showArabic ? "audioPlayer.hideArabic" : "audioPlayer.showArabic")}</span>
                            {showArabic ? (
                              <ChevronUp size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />
                            ) : (
                              <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-muted-foreground" />
                            )}
                          </button>
                        )}

                        {listeningTiming && (
                          <div data-listening-controls="" className="flex flex-col divide-y divide-border/40">
                            <button
                              type="button"
                              aria-pressed={showListeningWords}
                              onClick={() => setShowListeningWords((value) => !value)}
                              className="audio-options-row flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
                            >
                              <span>
                                {t(
                                  language,
                                  listeningTiming.reviewStatus === "owner-preview"
                                    ? "quranListening.estimatedWords"
                                    : "quranListening.words",
                                )}
                              </span>
                              <span
                                aria-hidden="true"
                                className={`audio-option-check ${showListeningWords ? "audio-option-check--on" : ""}`}
                              >
                                {showListeningWords && <Check size={14} />}
                              </span>
                            </button>
                            <button
                              type="button"
                              aria-pressed={followListeningText}
                              onClick={() => setFollowListeningText((value) => !value)}
                              className="audio-options-row flex min-h-11 items-center justify-between gap-3 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
                            >
                              <span>{t(language, "quranListening.followText")}</span>
                              <span
                                aria-hidden="true"
                                className={`audio-option-check ${followListeningText ? "audio-option-check--on" : ""}`}
                              >
                                {followListeningText && <Check size={14} />}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {totalTracks > 1 && (
                      <div className="rounded-xl border border-border/60 bg-muted/20">
                        <button
                          type="button"
                          role="switch"
                          aria-label={t(language, "audioPlayer.autoAdvance")}
                          aria-checked={controller.autoAdvance}
                          onClick={() => controller.setAutoAdvance(!controller.autoAdvance)}
                          className="audio-options-row audio-auto-advance flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors cursor-pointer"
                        >
                          <div className="flex flex-col items-start text-start">
                            <span className="font-semibold text-foreground">
                              {t(language, "audioPlayer.playAllShort")}
                            </span>
                            <span className="text-micro text-muted-foreground">
                              {t(language, "audioPlayer.autoAdvance")}
                            </span>
                          </div>
                          <span
                            aria-hidden="true"
                            className={`audio-switch-track ${controller.autoAdvance ? "audio-switch-track--on" : ""}`}
                          >
                            <span />
                          </span>
                        </button>
                      </div>
                    )}

                    <Popover.Close asChild>
                      <button
                        type="button"
                        className="audio-options-close min-h-11 w-full rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring transition-colors shadow-2xs cursor-pointer"
                      >
                        {t(language, "common.close")}
                      </button>
                    </Popover.Close>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>

            {/* Error state */}
            {state.status === "error" && (
              <div className="mt-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3" role="alert">
                <p className="text-label font-semibold text-destructive">
                  {getErrorMessage(state.error?.code, language)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
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
          </div>
        </motion.div>
      </motion.section>
    </AudioPlayerSurface>
  );
}
