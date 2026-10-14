import type { ReactNode, Ref } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { DevotionalAction, DevotionalFooter } from "./DevotionalControls";
import { ReaderFooterTools } from "./ReaderFooterTools";
import { RotateCcw, Share2, Volume2, VolumeX } from "./icons";

/** The Reader's footer anatomy with the standalone counter's own actions. */
export function StandaloneCounterFooter({
  language,
  benefit,
  counter,
  soundEnabled,
  onToggleSound,
  onReset,
  resetDisabled,
  focusMode,
  onToggleFocus,
  focusToggleRef,
  onShare,
  previous,
  next,
}: {
  language: AppLanguage;
  benefit: ReactNode;
  counter: ReactNode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  resetDisabled: boolean;
  focusMode: boolean;
  onToggleFocus: () => void;
  focusToggleRef: Ref<HTMLButtonElement>;
  onShare?: () => void;
  previous?: ReactNode;
  next?: ReactNode;
}) {
  const soundLabel = t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound");
  return (
    <DevotionalFooter className="reader-session-footer mx-auto w-full">
      <ReaderFooterTools
        language={language}
        focusMode={focusMode}
        onToggleFocus={onToggleFocus}
        focusToggleRef={focusToggleRef}
        primary={
          <div className="w-full pb-1" data-testid="counter-panel">
            {previous || next ? (
              <div className="adaptive-counter-row flex items-center justify-between gap-2 sm:gap-3 w-full">
                <div className="shrink-0">{previous}</div>
                <div className="flex-1 min-w-0">{counter}</div>
                <div className="shrink-0">{next}</div>
              </div>
            ) : (
              <div className="standalone-counter-row">
                <div>{counter}</div>
              </div>
            )}
          </div>
        }
      >
        <div data-testid="reader-support-actions">
          {benefit}
          {onShare && (
            <DevotionalAction
              type="button"
              aria-label={t(language, "reader.shareAction")}
              title={t(language, "reader.shareAction")}
              onClick={(event) => {
                event.stopPropagation();
                onShare();
              }}
              data-testid="counter-share-button"
            >
              <Share2 size={20} aria-hidden="true" />
              <span className="min-w-0 truncate text-label font-semibold">{t(language, "reader.shareAction")}</span>
            </DevotionalAction>
          )}
          <DevotionalAction
            aria-label={soundLabel}
            title={soundLabel}
            aria-pressed={soundEnabled}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSound();
            }}
          >
            {soundEnabled ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
            <span className="min-w-0 truncate text-label font-semibold">{t(language, "counter.sound")}</span>
          </DevotionalAction>
          {!onShare && (
            <DevotionalAction
              aria-label={t(language, "reader.resetCounter")}
              title={t(language, "reader.resetCounter")}
              disabled={resetDisabled}
              className="disabled:opacity-100 disabled:border-dashed disabled:bg-muted"
              onClick={(event) => {
                event.stopPropagation();
                onReset();
              }}
            >
              <RotateCcw size={20} aria-hidden="true" />
              <span className="min-w-0 truncate text-label font-semibold">{t(language, "counter.reset")}</span>
            </DevotionalAction>
          )}
        </div>
      </ReaderFooterTools>
    </DevotionalFooter>
  );
}
