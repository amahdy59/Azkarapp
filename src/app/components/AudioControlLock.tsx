import { useEffect, useRef, useState, useId } from "react";
import { Modal } from "./ResponsiveSheet";
import { Lock } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { acquireAudioControlLock } from "../audioControlLock";

/** Accidental-touch protection, not a device or security lock. */
export function AudioControlLock({ language, onUnlock }: { language: AppLanguage; onUnlock: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);
  const unlock = useRef(onUnlock);
  unlock.current = onUnlock;
  const descriptionId = useId();
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (interval.current) clearInterval(interval.current);
    interval.current = null;
    setHolding(false);
    setProgress(0);
  };
  useEffect(() => {
    const release = acquireAudioControlLock();
    const visibility = () => {
      if (document.hidden) cancel();
    };
    window.addEventListener("blur", cancel);
    window.addEventListener("pagehide", cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      if (interval.current) clearInterval(interval.current);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pagehide", cancel);
      document.removeEventListener("visibilitychange", visibility);
      release();
    };
  }, []);
  const begin = () => {
    if (timer.current) return;
    setHolding(true);
    const started = Date.now();
    interval.current = setInterval(() => setProgress(Math.min(100, (Date.now() - started) / 20)), 100);
    timer.current = setTimeout(() => {
      timer.current = null;
      if (interval.current) clearInterval(interval.current);
      interval.current = null;
      setProgress(100);
      unlock.current();
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
          onPointerMove={(event) => {
            if (!timer.current) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              cancel();
          }}
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
          <span className="relative flex size-9 shrink-0 items-center justify-center" aria-hidden="true">
            <svg viewBox="0 0 36 36" className="absolute inset-0 size-9 -rotate-90" fill="none">
              <circle cx="18" cy="18" r="15" stroke="var(--border-control)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="94.248"
                strokeDashoffset={94.248 * (1 - progress / 100)}
              />
            </svg>
            <Lock size={18} />
          </span>
          {t(language, holding ? "audioPlayer.keepHolding" : "audioPlayer.holdToUnlock")}
        </button>
        {holding && (
          <span
            role="progressbar"
            className="sr-only"
            aria-label={t(language, "audioPlayer.unlockProgress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
        )}
      </div>
    </Modal>
  );
}
