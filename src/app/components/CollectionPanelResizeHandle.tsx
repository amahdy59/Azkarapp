/* A focusable ARIA separator is the interactive WAI-ARIA window splitter.
 * jsx-a11y's static-role classification does not recognize that pattern. */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
import { useRef, useState } from "react";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";

export function CollectionPanelResizeHandle({
  width,
  minimum,
  maximum,
  direction,
  language,
  onResize,
  onReset,
  onCollapse,
}: {
  width: number;
  minimum: number;
  maximum: number;
  direction: "ltr" | "rtl";
  language: AppLanguage;
  onResize: (width: number) => void;
  onReset: () => void;
  onCollapse: () => void;
}) {
  const drag = useRef<{ pointerId: number; x: number; width: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const factor = direction === "rtl" ? 1 : -1;
  return (
    <div className="relative w-3 shrink-0" data-prevent-count="true">
      <div
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={t(language, "reader.resizeSidebar")}
        aria-controls="reader-collection-navigator"
        aria-valuemin={minimum}
        aria-valuemax={maximum}
        aria-valuenow={Math.round(width)}
        aria-valuetext={t(language, "reader.sidebarWidth", { width: formatNumerals(Math.round(width), language) })}
        title={t(language, "reader.resizeSidebarHint")}
        data-testid="reader-sidebar-resizer"
        data-dragging={dragging || undefined}
        className="collection-panel-resizer absolute inset-y-0 left-1/2 z-10 flex w-11 -translate-x-1/2 touch-none cursor-col-resize items-center justify-center outline-none"
        onDoubleClick={onReset}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { pointerId: event.pointerId, x: event.clientX, width };
          setDragging(true);
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          if (start?.pointerId === event.pointerId) onResize(start.width + (event.clientX - start.x) * factor);
        }}
        onPointerUp={(event) => {
          if (drag.current?.pointerId !== event.pointerId) return;
          drag.current = null;
          setDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onLostPointerCapture={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End", "Enter", "Escape"].includes(event.key)) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Home") onResize(minimum);
          else if (event.key === "End") onResize(maximum);
          else if (event.key === "Enter" || event.key === "Escape") onCollapse();
          else onResize(width + (event.key === "ArrowRight" ? 1 : -1) * factor * (event.shiftKey ? 32 : 16));
        }}
      >
        <span className="collection-panel-resizer-grip h-12 w-1 rounded-full bg-border" aria-hidden="true" />
      </div>
    </div>
  );
}
