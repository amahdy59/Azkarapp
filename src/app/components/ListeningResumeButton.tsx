import { BookOpen } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Recovery shares the footer tools; it never covers the recited text. */
export function ListeningResumeButton({ language, onResume }: { language: AppLanguage; onResume: () => void }) {
  const label = t(language, "quranListening.returnToVerse");
  return (
    <button
      type="button"
      className="audio-listening-resume inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-border px-3 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      aria-label={label}
      title={label}
      onClick={onResume}
    >
      <BookOpen size={20} className="control-cue" aria-hidden="true" />
      <span className="audio-context-label">{label}</span>
    </button>
  );
}
