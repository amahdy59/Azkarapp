import { useCallback, useEffect, useId, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { useOverlayBack } from "../hooks/useOverlayBack";
import { usePopoverOutsideDismiss } from "../hooks/usePopoverOutsideDismiss";
import { useSafeAreaCollisionPadding } from "../hooks/useSafeAreaCollisionPadding";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { ChevronDown, ChevronLeft, ChevronRight, Minus, Plus, X } from "./icons";
import { Button } from "./ui/button";
import "./enlarged-reading-toolbar.css";

/** Transient presentation only; the owning reader keeps scale and word anchor. */
export function EnlargedReadingToolbar({
  language,
  scale,
  onScale,
  current,
  total,
  ready,
  onPrevious,
  onNext,
  onClose,
  closeLabel,
}: {
  language: AppLanguage;
  scale: number;
  onScale: (value: number) => void;
  current: number;
  total: number;
  ready: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose?: () => void;
  closeLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const closeSize = useCallback(() => setOpen(false), []);
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const sizeId = useId();
  const backDismiss = useOverlayBack(open, closeSize);
  const restoreFocus = usePopoverOutsideDismiss(open, closeSize, trigger, popup);
  const safePadding = useSafeAreaCollisionPadding();
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !(event.target instanceof Node) || !popup.current?.contains(event.target)) return;
      // Consume this nested key before the dialog's document capture listener
      // sees the popup disappear and treats the same key as its own dismissal.
      event.preventDefault();
      event.stopPropagation();
      closeSize();
    };
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [closeSize, open]);
  const owner = trigger.current?.closest<HTMLElement>('[role="dialog"], [data-quran-inline-zoom]');
  const percentage = `${formatNumerals(scale, language)}%`;
  const previousIcon = language === "ar" ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />;
  const nextIcon = language === "ar" ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />;
  return (
    <footer className="enlarged-reading-toolbar" data-prevent-count="true" data-testid="enlarged-reading-toolbar">
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            ref={trigger}
            variant="outline"
            className="enlarged-size-trigger"
            aria-label={t(language, "quranZoom.size")}
            data-testid="enlarged-size-trigger"
          >
            <span aria-hidden="true">Aa</span>
            <bdi dir="ltr">{percentage}</bdi>
            <ChevronDown aria-hidden="true" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal container={owner}>
          <Popover.Content
            ref={popup}
            aria-labelledby={sizeId}
            dir={language === "ar" ? "rtl" : "ltr"}
            side="top"
            align="end"
            sideOffset={8}
            collisionBoundary={owner ?? undefined}
            collisionPadding={owner ? 8 : safePadding}
            data-dropdown-surface=""
            data-overlay-surface="contextual"
            data-back-dismiss={backDismiss}
            data-testid="enlarged-size-popover"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              popup.current?.querySelector<HTMLInputElement>('input[type="range"]')?.focus({ preventScroll: true });
            }}
            onEscapeKeyDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              // The parent dialog also owns Escape. A portal's React event
              // must not bubble into it after this popup has been dismissed.
              event.preventDefault();
              event.stopPropagation();
              closeSize();
            }}
            onCloseAutoFocus={restoreFocus}
            className="enlarged-size-popover"
          >
            <label id={sizeId} htmlFor={`${sizeId}-range`}>
              {t(language, "quranZoom.size")}
            </label>
            <div className="enlarged-size-adjustments" dir="ltr">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t(language, "quranZoom.smaller")}
                disabled={scale <= 125}
                onClick={() => onScale(Math.max(125, scale - 25))}
              >
                <Minus aria-hidden="true" />
              </Button>
              <input
                id={`${sizeId}-range`}
                type="range"
                min={125}
                max={250}
                step={25}
                value={scale}
                onChange={(event) => onScale(Number(event.currentTarget.value))}
                aria-valuetext={percentage}
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label={t(language, "quranZoom.larger")}
                disabled={scale >= 250}
                onClick={() => onScale(Math.min(250, scale + 25))}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <output htmlFor={`${sizeId}-range`} aria-live="polite" dir="ltr">
              {percentage}
            </output>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {total > 1 && (
        <nav className="quran-portion-navigation" aria-label={t(language, "quranZoom.portions")}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t(language, "common.previous")}
            disabled={!ready || current === 0}
            onClick={onPrevious}
          >
            {previousIcon}
          </Button>
          <span
            role="status"
            aria-atomic="true"
            aria-label={t(language, "quranZoom.portion", {
              current: formatNumerals(current + 1, language),
              total: formatNumerals(total, language),
            })}
          >
            <bdi dir="ltr" aria-hidden="true">
              {formatNumerals(current + 1, language)} / {formatNumerals(total, language)}
            </bdi>
          </span>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t(language, "common.next")}
            disabled={!ready || current >= total - 1}
            onClick={onNext}
          >
            {nextIcon}
          </Button>
        </nav>
      )}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label={closeLabel ?? t(language, "quranZoom.returnMushaf")}
          className="enlarged-inline-close"
        >
          <X aria-hidden="true" />
        </Button>
      )}
    </footer>
  );
}
