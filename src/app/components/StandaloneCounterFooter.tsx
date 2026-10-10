import { useState, type ReactNode } from "react";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { DevotionalAction, DevotionalFooter } from "./DevotionalControls";
import { ReaderFooterTools } from "./ReaderFooterTools";
import { RotateCcw, Volume2, VolumeX } from "./icons";

/** The Reader's footer anatomy with the standalone counter's own actions. */
export function StandaloneCounterFooter({
  language,
  benefit,
  counter,
  soundEnabled,
  onToggleSound,
  onReset,
  resetDisabled,
}: {
  language: AppLanguage;
  benefit: ReactNode;
  counter: ReactNode;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  resetDisabled: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const soundLabel = t(language, soundEnabled ? "counter.muteSound" : "counter.enableSound");
  return (
    <DevotionalFooter className="reader-session-footer mx-auto w-full">
      <ReaderFooterTools
        language={language}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
        primary={
          <div className="w-full pb-1" data-testid="counter-panel">
            <div className="standalone-counter-row">
              <div>{counter}</div>
            </div>
          </div>
        }
      >
        <div data-testid="reader-support-actions">
          {benefit}
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
        </div>
      </ReaderFooterTools>
    </DevotionalFooter>
  );
}
