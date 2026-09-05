/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { ArrowLeft, ArrowRight, ExternalLink, Info, BookOpen, X } from "./icons";
import {
  QURAN_WORD_MEANING_SOURCE,
  type QuranWordMeaning,
  type WordMeaningSelection,
} from "../content/quranWordMeanings";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { useLayoutMode } from "../hooks/useLayoutMode";

// ─── Shared content ───────────────────────────────────────────────────────────

function WordMeaningContent({
  meanings,
  position,
  language,
  direction,
  onNavigate,
  onClose,
  variant,
}: {
  meanings: QuranWordMeaning[];
  /** Where this word sits among the passage's annotated words, 1-based. */
  position: { index: number; total: number };
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onNavigate?: (index: number) => void;
  onClose: () => void;
  variant: "sheet" | "dialog";
}) {
  const sourceName = language === "ar" ? QURAN_WORD_MEANING_SOURCE.nameArabic : QURAN_WORD_MEANING_SOURCE.nameEnglish;

  return (
    <div className="flex flex-col h-full max-h-[inherit] overflow-hidden">
      {/* Drag handle (sheet only) */}
      {variant === "sheet" && (
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" aria-hidden="true" />
        </div>
      )}

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookOpen size={20} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-foreground leading-snug">
              {t(language, "reader.wordMeaningTitle")}
            </h2>
            <p className="text-xs font-medium text-muted-foreground">{t(language, "reader.wordMeaningsTitle")}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t(language, "reader.closeWordMeaning")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable main content */}
      <div
        role="region"
        aria-label={t(language, "reader.wordMeaningTitle")}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-4 outline-none focus-visible:ring-1 focus-visible:ring-ring"
        tabIndex={0}
        dir={direction}
      >
        {/* One card per word rather than a headline card stacked on a meaning
            card. The pair always belonged together — splitting them doubled the
            vertical cost of every word and made a multi-word selection read as
            a long alternating stack instead of a short glossary. */}
        <div className="flex flex-col gap-3 pb-4">
          {meanings.map((meaning) => (
            <div
              key={meaning.id}
              data-testid="quran-word-meaning-entry"
              className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs"
            >
              <div className="flex items-baseline justify-between gap-3 border-b border-border/50 bg-primary/10 px-4 py-3">
                <p
                  className="zikr-text min-w-0 text-xl font-extrabold leading-relaxed text-primary"
                  lang="ar"
                  dir="rtl"
                >
                  {meaning.word}
                </p>
                {/* Isolated so the ayah number cannot reorder against the word. */}
                <bdi className="shrink-0 text-xs font-bold text-muted-foreground">
                  {t(language, "reader.ayahLabel", {
                    ayah: formatNumerals(meaning.ayahNumber, language),
                  })}
                </bdi>
              </div>
              <p className="px-4 py-3 text-base font-medium leading-7 text-foreground" lang="ar" dir="rtl">
                {meaning.explanationArabic}
              </p>
            </div>
          ))}

          {/* Reviewed Source Note */}
          <div className="flex items-start gap-2.5 px-1 py-1 text-xs leading-5 text-muted-foreground">
            <Info size={15} className="mt-0.5 shrink-0 text-muted-foreground/80" aria-hidden="true" />
            <span id="quran-word-meaning-description">{t(language, "reader.wordMeaningArabicNote")}</span>
          </div>

          {/* Source Card Footer */}
          <a
            href={QURAN_WORD_MEANING_SOURCE.url}
            target="_blank"
            rel="noreferrer"
            className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-3.5 shadow-xs transition-[color,background-color,border-color,box-shadow] hover:border-primary/50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <div className="min-w-0 flex-1 text-start">
              <span className="block text-micro font-bold uppercase tracking-wider text-muted-foreground/80">
                {t(language, "reader.sourceLabel")}
              </span>
              <span className="mt-0.5 block truncate text-label font-semibold text-foreground leading-snug">
                {sourceName}
              </span>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <ExternalLink size={16} aria-hidden="true" />
            </div>
          </a>
        </div>
      </div>

      {/* Stepping through the passage's words in place. Looking one word up
          almost always means looking the next one up too, and without this the
          reader had to dismiss the sheet and hit another small target inside
          running Arabic text for every single word. */}
      {onNavigate && position.total > 1 && (
        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/40 px-6 py-3">
          <StepButton
            onClick={() => onNavigate(position.index - 2)}
            disabled={position.index <= 1}
            label={t(language, "reader.immersivePrevious")}
            direction={direction}
            testId="word-meaning-previous"
            back
          />
          <bdi data-testid="word-meaning-position" className="text-xs font-bold text-muted-foreground">
            {formatNumerals(position.index, language)} / {formatNumerals(position.total, language)}
          </bdi>
          <StepButton
            onClick={() => onNavigate(position.index)}
            disabled={position.index >= position.total}
            label={t(language, "reader.immersiveNext")}
            direction={direction}
            testId="word-meaning-next"
          />
        </div>
      )}
    </div>
  );
}

function StepButton({
  onClick,
  disabled,
  label,
  direction,
  testId,
  back = false,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  direction: "ltr" | "rtl";
  testId: string;
  back?: boolean;
}) {
  // The arrow points the way the reader physically moves through the passage.
  const Icon = back === (direction === "ltr") ? ArrowLeft : ArrowRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      aria-label={label}
      className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-card px-4 text-label font-bold text-foreground transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <Icon size={16} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function QuranWordMeaningSheet({
  selection,
  language,
  direction,
  onNavigate,
  onClose,
}: {
  selection: WordMeaningSelection | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onNavigate?: (index: number) => void;
  onClose: () => void;
}) {
  const layoutMode = useLayoutMode();

  /* Clamped rather than trusted: the passage changes when the reader moves to
     another zikr, and a stale index would otherwise index past the new list. */
  const total = selection?.groups.length ?? 0;
  const index = selection ? Math.min(Math.max(selection.index, 0), Math.max(total - 1, 0)) : 0;
  const meanings = selection?.groups[index];

  if (!selection || !meanings?.length) return null;

  return (
    <ResponsiveSheet
      open
      onClose={onClose}
      title={t(language, "reader.wordMeaningTitle")}
      direction={direction}
      testId="quran-word-meaning-sheet"
      describedById="quran-word-meaning-description"
    >
      <WordMeaningContent
        meanings={meanings}
        position={{ index: index + 1, total }}
        language={language}
        direction={direction}
        onNavigate={onNavigate}
        onClose={onClose}
        variant={layoutMode === "compact" ? "sheet" : "dialog"}
      />
    </ResponsiveSheet>
  );
}
