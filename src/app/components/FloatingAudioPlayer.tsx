import { Pause, Play, RotateCcw, SkipBack, SkipForward, X } from "./icons";
import type { AppLanguage } from "../types";
import type { AudioController } from "../audio/AudioProvider";
import { formatNumerals } from "../formatting";

const COPY = {
  en: {
    region: "Audio player",
    play: "Play audio",
    pause: "Pause audio",
    previous: "Previous zikr",
    next: "Next zikr",
    replay: "Replay this zikr",
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
  },
  ar: {
    region: "مشغل الصوت",
    play: "تشغيل الصوت",
    pause: "إيقاف الصوت مؤقتًا",
    previous: "الذكر السابق",
    next: "الذكر التالي",
    replay: "إعادة تشغيل هذا الذكر",
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
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return language === "ar"
      ? `${formatNumerals(minutes, language)} دقيقة و${formatNumerals(remainder, language)} ثانية`
      : `${minutes} minute${minutes === 1 ? "" : "s"} ${remainder} second${remainder === 1 ? "" : "s"}`;
  };
  return language === "ar"
    ? `${describe(current)} من ${describe(duration)}`
    : `${describe(current)} of ${describe(duration)}`;
}

export function FloatingAudioPlayer({ controller, language }: { controller: AudioController; language: AppLanguage }) {
  const { state, currentEntry, currentSegment } = controller;
  if (!state.plan || !currentEntry) return null;

  const copy = COPY[language];
  const direction = language === "ar" ? "rtl" : "ltr";
  const isPlaying = state.status === "playing";
  const isBusy = state.status === "loading" || state.status === "buffering";
  const queuePosition = `${formatNumerals(state.entryIndex + 1, language)} / ${formatNumerals(state.plan.entries.length, language)}`;
  const repetitionPosition =
    currentEntry.repetitions > 1
      ? `${formatNumerals(state.repetitionIndex + 1, language)} / ${formatNumerals(currentEntry.repetitions, language)}`
      : null;
  const title = language === "ar" ? currentEntry.titleArabic : currentEntry.titleEnglish;
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

  return (
    <section
      aria-label={copy.region}
      dir={direction}
      className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 rounded-2xl border border-primary/30 bg-card/95 p-3 shadow-overlay backdrop-blur-md dark:border-white/10 dark:bg-card/95"
    >
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveMessage}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-start">
          <div className="flex items-center gap-2">
            <p className="truncate text-[0.875rem] font-black text-foreground">{title}</p>
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
            {queuePosition}
            {repetitionPosition ? ` · ${repetitionPosition}` : ""}
          </p>
          {isBusy && (
            <p className="mt-1 text-[0.75rem] font-semibold text-primary" role="status">
              {state.status === "buffering" ? copy.buffering : copy.loading}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          <button
            type="button"
            onClick={controller.previous}
            disabled={state.entryIndex === 0}
            aria-label={copy.previous}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40 disabled:active:scale-100"
          >
            <SkipBack size={18} className="rtl:rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={isPlaying ? controller.pause : controller.play}
            aria-label={isPlaying ? copy.pause : copy.play}
            className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-all duration-150 active:scale-95 hover:bg-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            {isPlaying ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={controller.next}
            disabled={state.entryIndex === state.plan.entries.length - 1}
            aria-label={copy.next}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40 disabled:active:scale-100"
          >
            <SkipForward size={18} className="rtl:rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={controller.stop}
            aria-label={copy.stop}
            className="flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-all duration-150 active:scale-95 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3" dir="ltr">
        <span className="w-10 text-center text-[0.6875rem] font-semibold text-muted-foreground">
          {formatTime(state.currentTime, language)}
        </span>
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
          className="h-11 min-w-0 flex-1 accent-amber-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        />
        <span className="w-10 text-center text-[0.6875rem] font-semibold text-muted-foreground">
          {formatTime(state.duration, language)}
        </span>
      </div>

      {state.status === "error" && (
        <div className="mt-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3" role="alert">
          <p className="text-[0.8125rem] font-semibold text-destructive">{state.error?.message}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={controller.retry}
              className="min-h-11 rounded-xl bg-primary px-4 font-bold text-primary-foreground"
            >
              {copy.retry}
            </button>
            <button
              type="button"
              onClick={controller.skip}
              className="min-h-11 rounded-xl border border-border px-4 font-bold text-foreground"
            >
              {copy.skip}
            </button>
            <button
              type="button"
              onClick={controller.stop}
              className="min-h-11 rounded-xl border border-destructive/40 px-4 font-bold text-destructive"
            >
              {copy.stop}
            </button>
          </div>
        </div>
      )}

      <details className="mt-2 rounded-xl border border-border bg-muted/30">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-[0.8125rem] font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {copy.options}
        </summary>
        <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={controller.replay}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <RotateCcw size={17} aria-hidden="true" />
            {copy.replay}
          </button>

          <label className="grid gap-1 text-[0.75rem] font-bold text-muted-foreground">
            {copy.speed}
            <select
              value={state.playbackRate}
              onChange={(event) => controller.setPlaybackRate(Number(event.currentTarget.value))}
              className="min-h-11 rounded-xl border border-border-control bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {[0.8, 1, 1.25, 1.5, 2].map((rate) => (
                <option key={rate} value={rate}>
                  {formatNumerals(rate, language)}×
                </option>
              ))}
            </select>
          </label>

          {currentEntry.availableVoiceIds.length > 1 && (
            <label className="grid gap-1 text-[0.75rem] font-bold text-muted-foreground">
              {copy.voice}
              <select
                value={state.currentVoiceId ?? currentEntry.defaultVoiceId}
                onChange={(event) => controller.setVoice(event.currentTarget.value)}
                className="min-h-11 rounded-xl border border-border-control bg-background px-3 text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {currentEntry.availableVoiceIds.map((voiceId) => (
                  <option key={voiceId} value={voiceId}>
                    {currentEntry.segmentsByVoice[voiceId]?.[0]?.voiceName ?? voiceId}
                  </option>
                ))}
              </select>
            </label>
          )}

          {currentSegment && (
            <p className="text-[0.75rem] leading-5 text-muted-foreground sm:col-span-2">
              <span className="font-bold text-foreground">{currentSegment.voiceName}</span>
              {` · ${currentSegment.sourceName} · ${currentSegment.attribution}`}
            </p>
          )}

          {canRepeat && (
            <button
              type="button"
              aria-pressed={repeatEnabled}
              onClick={() => controller.setPlaybackMode(repeatEnabled ? "play-once" : "repeat-prescribed-count")}
              className="min-h-11 rounded-xl border border-border bg-background px-3 font-bold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {repeatEnabled ? copy.playOnce : copy.repeat}
            </button>
          )}
        </div>
      </details>
    </section>
  );
}
