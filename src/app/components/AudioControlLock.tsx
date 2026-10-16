import { useEffect, useRef, useState, useId } from "react";
import { Modal } from "./ResponsiveSheet";
import { Lock } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

/** Accidental-touch protection, not a device or security lock. */
export function AudioControlLock({ language, onUnlock }: { language: AppLanguage; onUnlock: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const descriptionId = useId();
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const begin = () => {
    if (timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      onUnlock();
    }, 2000);
  };
  return (
    <Modal
      open
      onClose={onUnlock}
      title={t(language, "audioPlayer.controlsLocked")}
      direction={language === "ar" ? "rtl" : "ltr"}
      language={language}
      showCloseButton={false}
      preventOutsideDismiss
      describedById={descriptionId}
      testId="audio-control-lock"
      maxWidthClassName="max-w-sm"
    >
      <div className="flex flex-col items-center gap-5 p-6 text-center">
        <Lock size={32} aria-hidden="true" />
        <h2 className="text-title font-bold">{t(language, "audioPlayer.controlsLocked")}</h2>
        <p id={descriptionId} className="text-sm leading-relaxed text-muted-foreground">
          {t(language, "audioPlayer.lockHint")}
        </p>
        <button
          type="button"
          data-testid="audio-unlock"
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.currentTarget.focus();
            event.currentTarget.setPointerCapture(event.pointerId);
            begin();
          }}
          onPointerUp={cancel}
          onPointerCancel={cancel}
          onLostPointerCapture={cancel}
          onBlur={cancel}
          onKeyDown={(event) => {
            if ([" ", "Enter"].includes(event.key)) {
              event.preventDefault();
              if (!event.repeat) begin();
            }
          }}
          onKeyUp={(event) => {
            if ([" ", "Enter"].includes(event.key)) {
              event.preventDefault();
              cancel();
            }
          }}
          className="min-h-12 w-full touch-none select-none rounded-xl border border-primary bg-primary/10 px-4 py-3 font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-describedby={descriptionId}
        >
          {t(language, holding ? "audioPlayer.keepHolding" : "audioPlayer.holdToUnlock")}
        </button>
      </div>
    </Modal>
  );
}
