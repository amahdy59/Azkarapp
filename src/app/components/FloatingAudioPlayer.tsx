import { Play, Pause, SkipForward, SkipBack, X } from "../components/icons";
import type { AppLanguage } from "../types";
import type { PlaybackRate } from "../hooks/useAudioPlayer";

interface FloatingAudioPlayerProps {
  title: string;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  playbackRate: PlaybackRate;
  autoPlayAll: boolean;
  language: AppLanguage;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSetSpeed: (rate: PlaybackRate) => void;
  onToggleAutoPlayAll: () => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function FloatingAudioPlayer({
  title,
  isPlaying,
  isBuffering,
  currentTime,
  duration,
  playbackRate,
  autoPlayAll,
  language,
  onTogglePlayPause,
  onNext,
  onPrev,
  onSetSpeed,
  onToggleAutoPlayAll,
  onClose,
}: FloatingAudioPlayerProps) {
  const isArabic = language === "ar";
  const speeds: PlaybackRate[] = [0.8, 1.0, 1.25];

  return (
    <div
      role="region"
      aria-label={isArabic ? "مشغل الصوت" : "Audio Player"}
      className="fixed bottom-16 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-amber-500/30 bg-card/95 p-3 shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-[#18181B]/95"
    >
      {/* Title & Controls Header */}
      <div className="flex items-center justify-between gap-2">
        {/* Track Title */}
        <div className="min-w-0 flex-1 text-start">
          <p className="truncate text-[0.8125rem] font-black text-foreground">{title}</p>
          <span className="text-[0.6875rem] font-semibold text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Previous Track */}
          <button
            type="button"
            onClick={onPrev}
            aria-label={isArabic ? "السابق" : "Previous"}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <SkipBack size={16} className="rtl:rotate-180" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={onTogglePlayPause}
            aria-label={isPlaying ? (isArabic ? "إيقاف مؤقت" : "Pause") : isArabic ? "تشغيل الصوتي" : "Play Audio"}
            className="flex size-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all"
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

          {/* Next Track */}
          <button
            type="button"
            onClick={onNext}
            aria-label={isArabic ? "التالي" : "Next"}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <SkipForward size={16} className="rtl:rotate-180" />
          </button>

          {/* Auto-Play All Toggle */}
          <button
            type="button"
            onClick={onToggleAutoPlayAll}
            aria-label={isArabic ? "التشغيل المتتابع للكل" : "Auto-Play All"}
            title={isArabic ? "التشغيل المتتابع للكل" : "Auto-Play All"}
            className={`flex size-8 items-center justify-center rounded-lg text-[0.75rem] font-bold transition-all ${
              autoPlayAll
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/50"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <svg
              width={15}
              height={15}
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
          </button>

          {/* Speed Selector */}
          <button
            type="button"
            onClick={() => {
              const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
              onSetSpeed(speeds[nextIdx]!);
            }}
            aria-label={isArabic ? `السرعة: ${playbackRate}x` : `Speed: ${playbackRate}x`}
            className="flex h-8 px-2 items-center justify-center rounded-lg border border-border text-[0.75rem] font-extrabold text-foreground hover:bg-muted active:scale-95 transition-all"
          >
            {playbackRate}x
          </button>

          {/* Close Player */}
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? "إغلاق مشغل الصوت" : "Close Audio Player"}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground active:scale-95 transition-all"
          >
            <X size={16} />
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
