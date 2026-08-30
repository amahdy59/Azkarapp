import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pause, Play, RotateCcw, SkipBack, SkipForward, SlidersHorizontal, X } from "./icons";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";
import { formatNumerals } from "../formatting";
import { getAudioVoiceName } from "../audio/audioVoices";

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
  },
} as const;

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

export function FloatingAudioPlayer({ controller, language }: { controller: AudioController; language: AppLanguage }) {
  const { state, currentEntry, currentSegment } = controller;
  const [isMinimized, setIsMinimized] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

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

  if (isMinimized) {
    return (
      <section
        aria-label={copy.region}
        dir={direction}
        className="fixed bottom-16 sm:bottom-6 inset-x-0 mx-auto z-40 w-[calc(100%-1rem)] sm:max-w-lg rounded-2xl border border-primary/30 bg-card/95 px-3.5 py-2.5 shadow-overlay backdrop-blur-xl dark:border-white/15"
      >
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {liveMessage}
        </div>

        {/* Mini progress bar */}
        <div className="absolute inset-x-0 -top-px h-1 overflow-hidden rounded-t-2xl bg-muted" aria-hidden="true">
          <div
            className="h-full bg-primary transition-[width] duration-fast"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            aria-label={`${title} · ${copy.expand}`}
            className="flex min-w-0 flex-1 items-center gap-2.5 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-3.5 shrink-0" aria-hidden="true">
                <span className="w-0.5 bg-primary rounded-full waveform-bar h-3" style={{ animationDelay: "0ms" }} />
                <span className="w-0.5 bg-primary rounded-full waveform-bar h-2" style={{ animationDelay: "150ms" }} />
                <span
                  className="w-0.5 bg-primary rounded-full waveform-bar h-3.5"
                  style={{ animationDelay: "300ms" }}
                />
                <span
                  className="w-0.5 bg-primary rounded-full waveform-bar h-1.5"
                  style={{ animationDelay: "450ms" }}
                />
              </div>
            ) : (
              <span className="size-2 rounded-full bg-muted-foreground/50 shrink-0" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.8125rem] font-black text-foreground">{title}</p>
              <p className="truncate text-[0.6875rem] font-semibold text-muted-foreground">
                {reciterDisplayName} · {formatTime(state.currentTime, language)} /{" "}
                {formatTime(state.duration, language)}
              </p>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={isPlaying ? controller.pause : controller.play}
              aria-label={isPlaying ? copy.pause : copy.play}
              className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {isPlaying ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(false)}
              aria-label={copy.expand}
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <ChevronUp size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={controller.stop}
              aria-label={copy.stop}
              className="flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <X size={18} aria-hidden="true" />
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
      className="fixed bottom-16 sm:bottom-6 inset-x-0 mx-auto z-40 w-[calc(100%-1rem)] sm:max-w-lg rounded-3xl border border-primary/20 bg-card/95 p-4 sm:p-5 shadow-overlay backdrop-blur-xl dark:border-white/10"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      {/* Header Row: Title & Queue on Start, Minimize & Close on End */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-start">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[0.9375rem] font-black text-foreground">{title}</h3>
            {isPlaying && (
              <div className="flex items-end gap-0.5 h-3.5 shrink-0" aria-hidden="true">
                <span className="w-0.5 bg-primary rounded-full waveform-bar h-3" style={{ animationDelay: "0ms" }} />
                <span className="w-0.5 bg-primary rounded-full waveform-bar h-2" style={{ animationDelay: "150ms" }} />
                <span
                  className="w-0.5 bg-primary rounded-full waveform-bar h-3.5"
                  style={{ animationDelay: "300ms" }}
                />
                <span
                  className="w-0.5 bg-primary rounded-full waveform-bar h-1.5"
                  style={{ animationDelay: "450ms" }}
                />
              </div>
            )}
          </div>
          <p className="mt-0.5 text-[0.75rem] font-semibold text-muted-foreground">
            {reciterDisplayName} · {queuePosition}
            {repetitionPosition ? ` · ${repetitionPosition}` : ""}
          </p>
          {isBusy && (
            <p className="mt-1 text-[0.75rem] font-semibold text-primary" role="status">
              {state.status === "buffering" ? copy.buffering : copy.loading}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            aria-label={copy.collapse}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color] active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <ChevronDown size={19} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={controller.stop}
            aria-label={copy.stop}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color] active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <X size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Timeline / Scrub Bar with Generous 44px Hit Target */}
      <div className="mt-4 flex items-center gap-3" dir="ltr">
        <span className="w-11 text-center text-[0.75rem] font-bold tabular-nums text-muted-foreground">
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
            className="w-full h-2 rounded-full accent-primary bg-muted appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          />
        </div>
        <span className="w-11 text-center text-[0.75rem] font-bold tabular-nums text-muted-foreground">
          {formatTime(state.duration, language)}
        </span>
      </div>

      {/* Primary Transport Controls Row */}
      <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3">
        {totalTracks > 1 && (
          <button
            type="button"
            onClick={controller.previous}
            disabled={state.entryIndex === 0}
            aria-label={copy.previous}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
          >
            <SkipBack size={20} className="rtl:rotate-180" aria-hidden="true" />
          </button>
        )}

        {/* Jump Backward 10s */}
        <button
          type="button"
          onClick={() => jumpSeconds(-10)}
          disabled={state.duration <= 0}
          aria-label={copy.jumpBack10}
          className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
        >
          <JumpBack10Icon className="size-5" />
        </button>

        {/* Main Play / Pause Button */}
        <button
          type="button"
          onClick={isPlaying ? controller.pause : controller.play}
          aria-label={isPlaying ? copy.pause : copy.play}
          className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {isPlaying ? <Pause size={24} aria-hidden="true" /> : <Play size={24} aria-hidden="true" />}
        </button>

        {/* Jump Forward 10s */}
        <button
          type="button"
          onClick={() => jumpSeconds(10)}
          disabled={state.duration <= 0}
          aria-label={copy.jumpForward10}
          className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
        >
          <JumpForward10Icon className="size-5" />
        </button>

        {totalTracks > 1 && (
          <button
            type="button"
            onClick={controller.next}
            disabled={state.entryIndex === totalTracks - 1}
            aria-label={copy.next}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-30 disabled:active:scale-100"
          >
            <SkipForward size={20} className="rtl:rotate-180" aria-hidden="true" />
          </button>
        )}

        {totalTracks === 1 && (
          <button
            type="button"
            onClick={controller.replay}
            aria-label={replayLabel}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-[transform,background-color,color] duration-fast active:scale-95 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Error state */}
      {state.status === "error" && (
        <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5" role="alert">
          <p className="text-[0.8125rem] font-semibold text-destructive">{state.error?.message}</p>
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

      {/* Options & Settings Drawer */}
      <div className="mt-4 border-t border-border/70 pt-3">
        <button
          type="button"
          onClick={() => setShowOptions(!showOptions)}
          aria-expanded={showOptions}
          className="flex min-h-11 w-full items-center justify-between rounded-xl px-1 text-start text-[0.8125rem] font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} aria-hidden="true" />
            {copy.options}
          </span>
          <ChevronDown
            size={17}
            aria-hidden="true"
            className={`text-muted-foreground transition-transform duration-standard ease-standard ${
              showOptions ? "rotate-180" : ""
            }`}
          />
        </button>

        {showOptions && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={controller.replay}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-bold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <RotateCcw size={16} aria-hidden="true" />
              {replayLabel}
            </button>

            <label className="grid gap-1 text-[0.75rem] font-bold text-muted-foreground">
              {copy.speed}
              <select
                dir="ltr"
                value={state.playbackRate}
                onChange={(event) => controller.setPlaybackRate(Number(event.currentTarget.value))}
                className="min-h-11 rounded-xl border border-border-control bg-background px-3 text-xs font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {[0.8, 1, 1.25, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>
                    {formatNumerals(rate, language)}×
                  </option>
                ))}
              </select>
            </label>

            {currentEntry.availableVoiceIds.length > 1 && (
              <label className="grid gap-1 text-[0.75rem] font-bold text-muted-foreground sm:col-span-2">
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

            {canRepeat && (
              <button
                type="button"
                aria-pressed={repeatEnabled}
                onClick={() => controller.setPlaybackMode(repeatEnabled ? "play-once" : "repeat-prescribed-count")}
                className={`min-h-11 rounded-xl border px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:col-span-2 ${
                  repeatEnabled
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted"
                }`}
              >
                {repeatEnabled ? copy.playOnce : copy.repeat}
              </button>
            )}

            <p className="text-[0.6875rem] font-semibold leading-5 text-muted-foreground/80 sm:col-span-2 pt-1 border-t border-border/50 text-center">
              {attributionText}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
