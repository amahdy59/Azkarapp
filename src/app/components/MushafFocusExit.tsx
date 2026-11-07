import { useEffect, useRef } from "react";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { CollapseCorners, Eye } from "./icons";

/** One discoverable 44px exit for either Mushaf owner; no fullscreen API. */
export function MushafFocusExit({
  language,
  onExit,
  iconOnly = false,
}: {
  language: AppLanguage;
  onExit: () => void;
  iconOnly?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ref.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      data-testid="mushaf-focus-exit"
      aria-label={t(language, "mushaf.focusModeExit")}
      onClick={() => {
        const reader = ref.current?.closest<HTMLElement>("[data-mushaf-reader]");
        onExit();
        requestAnimationFrame(() => {
          const trigger =
            reader?.querySelector<HTMLElement>('[data-testid="mushaf-focus-toggle"], [data-tool="focus"]') ??
            reader?.querySelector<HTMLElement>(
              '[data-testid="mushaf-more-actions"], [data-testid="mushaf-immersive-more"], [data-testid="mushaf-rail-more"]',
            );
          (trigger ?? reader)?.focus({ preventScroll: true });
        });
      }}
      className="group flex min-h-11 items-center justify-center focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
    >
      <span className="mushaf-furniture-pill gap-2">
        {iconOnly ? <CollapseCorners size={16} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        {!iconOnly && t(language, "mushaf.focusModeExit")}
      </span>
    </button>
  );
}
