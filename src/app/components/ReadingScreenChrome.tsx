import type { ReactNode } from "react";
import { ArrowPrevious, Keyboard } from "./icons";
import { Header, IconButton } from "./LayoutShells";
import { ProgressBar } from "./ProgressBar";
import { ReaderSceneArt } from "./ReaderSceneArt";
import { AppearanceMenu } from "./AppearanceMenu";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { t } from "../i18n";
import type { AppLanguage, CategoryId, TextSizeOption } from "../types";

/** Shared ghost icon-button treatment for every control in the phone header row. */
const HEADER_ACTION_CLASS =
  "flex h-11 w-11 min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-40";

/** Wide desktop hero action style on the navy brand surface. */
const HERO_ACTION_CLASS =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[color:var(--on-media-accent)]/25 bg-[color:var(--on-media)]/10 text-[color:var(--on-media)] transition-colors hover:bg-[color:var(--on-media)]/20 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";

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
  category = "neutral",
  textSize,
  onTextSizeChange,
  onKeyboardHelp,
  keyboardHelpOpen = false,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  title: string;
  onBack: () => void;
  actions: (tier: "wide" | "compact") => ReactNode;
  progress?: ReadingProgress;
  subRow?: ReactNode;
  testId: string;
  category?: CategoryId | "neutral";
  textSize?: TextSizeOption;
  onTextSizeChange?: (size: TextSizeOption) => void;
  onKeyboardHelp?: () => void;
  keyboardHelpOpen?: boolean;
}) {
  const isWide = useMediaQuery("(min-width: 768px)");
  const artCategory: CategoryId = category === "neutral" ? "miscellaneous" : category;

  if (isWide) {
    return (
      <div
        data-testid={`${testId}-desktop-hero`}
        data-reading-chrome
        className="relative isolate w-full flex shrink-0 flex-col items-center overflow-hidden rounded-b-2xl px-6 pb-2.5 pt-2 text-center"
        style={{
          gap: "0.375rem",
          background:
            "radial-gradient(120% 140% at 50% 10%, rgba(232,180,32,0.18), transparent 60%), var(--brand-hero)",
        }}
      >
        <ReaderSceneArt category={artCategory} />

        <div className="reading-hero-toolbar relative z-10 grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <IconButton onClick={onBack} label={t(language, "common.back")} className={HERO_ACTION_CLASS}>
            <ArrowPrevious size={20} />
          </IconButton>

          <h1
            className="min-w-0 break-words text-lg md:text-xl font-extrabold leading-tight text-on-media-accent"
            dir="auto"
          >
            {title}
          </h1>

          <div className="flex items-center gap-2" data-testid={`${testId}-hero-actions`}>
            {onKeyboardHelp && (
              <button
                type="button"
                data-testid={`${testId}-help-trigger`}
                aria-label={t(language, "reader.keyboardShortcuts")}
                title={t(language, "reader.keyboardShortcuts")}
                aria-expanded={keyboardHelpOpen}
                className={HERO_ACTION_CLASS}
                onClick={onKeyboardHelp}
              >
                <Keyboard size={20} aria-hidden="true" />
              </button>
            )}
            {textSize && onTextSizeChange && (
              <AppearanceMenu
                triggerClass={HERO_ACTION_CLASS}
                textSize={textSize}
                onTextSizeChange={onTextSizeChange}
                language={language}
                direction={direction}
                testIdPrefix={testId}
              />
            )}
            {actions("wide")}
          </div>
        </div>

        {(progress || subRow) && (
          <div className="relative z-10 flex w-full max-w-[42rem] flex-col items-center gap-2">
            {progress && (
              <>
                <div className="flex w-full items-center justify-between px-1" aria-hidden="true">
                  <span className="text-label font-semibold text-[color:var(--on-media-accent)]">
                    {progress.percentLabel ?? ""}
                  </span>
                  <span className="text-xs font-bold text-[color:var(--on-media-accent)]" dir="ltr">
                    {progress.countLabel}
                  </span>
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
        <Header
          title={title}
          onBack={onBack}
          language={language}
          elevateOnScroll={false}
          right={
            <div className="flex items-center gap-1.5">
              {textSize && onTextSizeChange && (
                <AppearanceMenu
                  triggerClass={HEADER_ACTION_CLASS}
                  textSize={textSize}
                  onTextSizeChange={onTextSizeChange}
                  language={language}
                  direction={direction}
                  testIdPrefix={testId}
                />
              )}
              {actions("compact")}
            </div>
          }
        />
      </div>

      {(progress || subRow) && (
        <div className="shrink-0 px-5 pb-3 pt-2 reader-column" data-testid={`${testId}-session-chrome`}>
          {progress && (
            <>
              <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold text-muted-foreground">
                <span>{progress.percentLabel ?? ""}</span>
                <span dir="ltr">{progress.countLabel}</span>
              </div>
              {progress.max !== undefined && (
                <ProgressBar
                  value={progress.value}
                  max={progress.max}
                  height={8}
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
