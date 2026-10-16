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
      overlayClassName="audio-lock-shield"
      className="audio-control-lock"
      style={{
        top: "max(0.75rem, env(safe-area-inset-top))",
        left: "auto",
        insetInlineEnd: `max(0.75rem, env(safe-area-inset-${language === "ar" ? "left" : "right"}))`,
        width: "min(18rem, calc(100% - 1.5rem))",
        transform: "none",
        translate: "none",
        animation: "none",
      }}
    >
      <div className="p-2">
        <p id={descriptionId} className="sr-only">
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
          className="flex min-h-12 w-full touch-none select-none items-center justify-center gap-2 rounded-xl border border-primary bg-card px-3 py-2 text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          aria-describedby={descriptionId}
        >
          <Lock size={20} aria-hidden="true" />
          {t(language, holding ? "audioPlayer.keepHolding" : "audioPlayer.holdToUnlock")}
        </button>
      </div>
    </Modal>
  );
}
