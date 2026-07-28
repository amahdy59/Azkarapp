import { Play, Pause, SkipForward, SkipBack, X } from "../components/icons";
import type { AppLanguage } from "../types";
import type { PlaybackRate, ReciterOption } from "../hooks/useAudioPlayer";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";

interface FloatingAudioPlayerProps {
  title: string;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRate;
  autoPlayAll: boolean;
  reciter?: ReciterOption;
  language: AppLanguage;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSetSpeed: (rate: PlaybackRate) => void;
  onSetReciter?: (reciter: ReciterOption) => void;
  onToggleAutoPlayAll: () => void;
  onClose: () => void;
}

function formatTime(seconds: number, language: AppLanguage): string {
  if (isNaN(seconds) || seconds <= 0) return formatNumerals("0:00", language);
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const timeStr = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  return formatNumerals(timeStr, language);
}

export function FloatingAudioPlayer({
  title,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  playbackRate,
  autoPlayAll,
  reciter = "alafasy",
  language,
  onTogglePlayPause,
  onNext,
  onPrev,
  onSetSpeed,
  onSetReciter,
  onToggleAutoPlayAll,
  onClose,
}: FloatingAudioPlayerProps) {
  const isArabic = language === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  const speeds: PlaybackRate[] = [0.8, 1.0, 1.25];

  const reciterNameKey =
    reciter === "alafasy"
      ? "audioPlayer.reciterAlafasy"
      : reciter === "ghamdi"
        ? "audioPlayer.reciterGhamdi"
        : "audioPlayer.reciterAbdulbasit";

  return (
    <div
      role="region"
      aria-label={t(language, "audioPlayer.regionAria")}
      dir={direction}
      className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-500/30 bg-card/95 p-3 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#18181B]/95"
    >
      {/* Title & Controls Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Track Title */}
        <div className="min-w-0 flex-1 text-start">
          <p className="truncate text-[0.8125rem] font-black text-foreground">{title}</p>
          <span className="text-[0.6875rem] font-semibold text-muted-foreground" dir="ltr">
            {formatTime(currentTime, language)} / {formatTime(duration, language)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Previous Track — 44px touch target */}
          <button
            type="button"
            onClick={onPrev}
            aria-label={t(language, "audioPlayer.previous")}
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <SkipBack size={18} className="rtl:rotate-180" />
          </button>

          {/* Play / Pause Toggle — 44px touch target */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? t(language, "audioPlayer.pause") : t(language, "audioPlayer.play")}
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
          >
            {isBuffering ? (
              <svg
                className="animate-spin"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : isPlaying ? (
              <Pause size={18} className="fill-current" />
            ) : (
              <Play size={18} className="fill-current translate-x-0.5 rtl:-translate-x-0.5" />
            )}
          </button>

          {/* Next Track — 44px touch target */}
          <button
            type="button"
            onClick={onNext}
            aria-label={t(language, "audioPlayer.next")}
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <SkipForward size={18} className="rtl:rotate-180" />
          </button>

          {/* Auto-Play All / Single Item Toggle — 44px touch target */}
          <button
            type="button"
            onClick={onToggleAutoPlayAll}
            aria-label={autoPlayAll ? t(language, "audioPlayer.modePlayAll") : t(language, "audioPlayer.modeSingle")}
            title={autoPlayAll ? t(language, "audioPlayer.playAll") : t(language, "audioPlayer.playSingle")}
            className={`flex h-11 min-h-[44px] px-2.5 items-center gap-1 rounded-xl text-[0.75rem] font-bold transition-all ${
              autoPlayAll
                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-1 ring-amber-500/50"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            <span>{autoPlayAll ? t(language, "audioPlayer.all") : t(language, "audioPlayer.single")}</span>
          </button>

          {/* Reciter Selector — 44px touch target */}
          {onSetReciter && (
            <button
              type="button"
              onClick={() => {
                const options: ReciterOption[] = ["alafasy", "ghamdi", "abdulbasit"];
                const nextIdx = (options.indexOf(reciter) + 1) % options.length;
                onSetReciter(options[nextIdx]!);
              }}
              aria-label={t(language, "audioPlayer.currentReciter", { name: t(language, reciterNameKey) })}
              title={t(language, "audioPlayer.currentReciter", { name: t(language, reciterNameKey) })}
              className="flex h-11 min-h-[44px] px-2.5 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-[0.6875rem] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all"
            >
              🎙️ {t(language, reciterNameKey)}
            </button>
          )}

          {/* Speed Selector — 44px touch target */}
          <button
            type="button"
            onClick={() => {
              const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
              onSetSpeed(speeds[nextIdx]!);
            }}
            aria-label={t(language, "audioPlayer.speed", { rate: formatNumerals(playbackRate, language) })}
            className="flex h-11 min-h-[44px] px-2.5 items-center justify-center rounded-xl border border-border text-[0.75rem] font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all"
          >
            {formatNumerals(playbackRate, language)}x
          </button>

          {/* Close Player — 44px touch target */}
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "audioPlayer.close")}
            className="flex size-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Track Progress Bar */}
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-amber-500 transition-all duration-300"
          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
