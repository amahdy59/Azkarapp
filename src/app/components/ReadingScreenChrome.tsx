import type { ReactNode } from "react";
import { ArrowPrevious } from "./icons";
import { Header, IconButton } from "./LayoutShells";
import { ProgressBar } from "./ProgressBar";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/**
 * The chrome above a counting screen: title, the way back, the screen's two
 * actions, and its progress.
 *
 * The Reader, the Masbaha and the Salawat counter are the same kind of screen —
 * a phrase to read and a count to keep — but only the Reader had the wide
 * treatment: a navy brand band with a centred gold title and the progress bar
 * inside it. The other two kept a plain start-aligned header at every width, so
 * on a desktop they read as a different product. Sharing the chrome is what
 * stops that happening again; the shortcut pill drifted three ways for exactly
 * as long as it was three copies.
 *
 * Below 768px all three collapse to the same compact header, which is what the
 * Reader already did.
 */
export interface ReadingProgress {
  value: number;
  /** Omitted for an open-ended count, where a bar and a percentage mean nothing. */
  max?: number;
  /** e.g. "٠٪ مكتمل" — omitted alongside `max`. */
  percentLabel?: string;
  /** e.g. "٠ من ٢٥", or the bare tally when the target is open. */
  countLabel: string;
  ariaLabel: string;
}

export function ReadingScreenChrome({
  language,
  direction,
  title,
  onBack,
  actions,
  progress,
  subRow,
  testId,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  title: string;
  onBack: () => void;
  /**
   * Rendered per tier: the wide band needs on-media colours to stay legible on
   * the fixed navy surface, the compact header needs theme colours. Passing one
   * node for both is what produced white-on-white the last time these two
   * treatments were conflated.
   */
  actions: (tier: "wide" | "compact") => ReactNode;
  progress?: ReadingProgress;
  /** Sits under the bar — the surah name and its Mushaf control, or the
   *  Masbaha's phrase and target selectors. */
  subRow?: ReactNode;
  /** Namespaces the hooks the e2e suite already targets, e.g. "reader". */
  testId: string;
}) {
  const isWide = useMediaQuery("(min-width: 768px)");

  if (isWide) {
    return (
      /* Fixed navy brand surface, independent of the active theme — it mirrors
         Home's .azkar-hero rather than following light/dark/midnight tokens,
         because it plays the same "always-dark brand band" role. */
      <div
        data-testid={`${testId}-desktop-hero`}
        className="relative mx-4 mt-3 flex shrink-0 flex-col items-center gap-2 overflow-hidden rounded-3xl px-6 py-3 text-center"
        style={{
          background:
            "radial-gradient(120% 140% at 50% 10%, rgba(232,180,32,0.18), transparent 60%), var(--brand-hero)",
        }}
      >
        <IconButton
          onClick={onBack}
          label={t(language, "common.back")}
          className="absolute start-4 top-4 border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] hover:bg-[color:var(--on-media)]/20"
        >
          <ArrowPrevious size={20} />
        </IconButton>

        <div className="absolute end-4 top-4 flex items-center gap-2" data-testid={`${testId}-hero-actions`}>
          {actions("wide")}
        </div>

        <h1 className="text-display font-extrabold text-[color:var(--on-media-accent)]" dir="auto">
          {title}
        </h1>

        {(progress || subRow) && (
          <div className="flex w-full max-w-[520px] flex-col items-center gap-2">
            {progress && (
              <>
                <div className="flex w-full items-center justify-between px-1" aria-hidden="true">
                  <span className="text-label font-semibold text-[color:var(--on-media-accent)]">
                    {progress.percentLabel ?? ""}
                  </span>
                  <span className="text-xs font-bold text-[color:var(--on-media-accent)]">{progress.countLabel}</span>
                </div>
                {progress.max !== undefined && (
                  <ProgressBar
                    value={progress.value}
                    max={progress.max}
                    height={8}
                    trackColor="rgba(255,255,255,0.2)"
                    fillColor="var(--on-media-accent)"
                    direction={direction}
                    aria-label={progress.ariaLabel}
                  />
                )}
              </>
            )}
            {subRow}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        <Header title={title} onBack={onBack} language={language} right={actions("compact")} />
      </div>

      {(progress || subRow) && (
        <div className="shrink-0 px-5 pb-3 pt-2 reader-column" data-testid={`${testId}-session-chrome`}>
          {progress && (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                <span>{progress.percentLabel ?? ""}</span>
                <span>{progress.countLabel}</span>
              </div>
              {progress.max !== undefined && (
                <ProgressBar
                  value={progress.value}
                  max={progress.max}
                  height={6}
                  trackColor="var(--card)"
                  fillColor="var(--primary)"
                  direction={direction}
                  aria-label={progress.ariaLabel}
                />
              )}
            </>
          )}
          {subRow && <div className={progress ? "mt-3.5" : ""}>{subRow}</div>}
        </div>
      )}
    </>
  );
}
