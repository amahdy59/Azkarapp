import React, { useEffect, useRef } from "react";
import { Card } from "../../components/Card";
import { IconButton } from "../../components/LayoutShells";
import { ArrowPrevious } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";

import { useLayoutMode } from "../../hooks/useLayoutMode";

/** Restore a nested panel's opener after its parent has actually mounted. */
export function useSettingsReturnFocus(testId?: string) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!testId) return;
    const frame = requestAnimationFrame(() =>
      root.current?.querySelector<HTMLElement>(`[data-testid="${testId}"]`)?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [testId]);
  return root;
}

export function SubHeader({
  title,
  onBack,
  right,
  language = "en",
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
  language?: AppLanguage;
}) {
  const layoutMode = useLayoutMode();
  const isTwoPane = layoutMode === "expanded" || layoutMode === "large";
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    // Panels may mount after the outgoing animation has finished. Focus the
    // heading owned by the mounted panel, rather than querying the old panel.
    const frame = requestAnimationFrame(() => headingRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [isTwoPane, title]);

  if (isTwoPane) {
    return (
      <div className="flex items-center justify-between px-page pt-2 pb-1 shrink-0" style={{ minHeight: 56 }}>
        <h2
          ref={headingRef}
          data-settings-subheading
          tabIndex={-1}
          aria-label={
            title === t(language, "settings.accessibility")
              ? t(language, "settings.accessibilityDetailHeading")
              : undefined
          }
          className="block min-w-0 flex-1 break-words font-sans text-xl sm:text-2xl font-extrabold leading-tight text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {title}
        </h2>
        <div className="flex justify-end items-center">{right}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ minHeight: 56 }}>
      <IconButton onClick={onBack} label={t(language, "common.back")}>
        <ArrowPrevious size={20} className="text-foreground" />
      </IconButton>
      <h1
        ref={headingRef}
        data-settings-subheading
        tabIndex={-1}
        className="block min-w-0 flex-1 break-words text-center font-sans text-xl font-extrabold leading-tight text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:text-2xl"
      >
        {title}
      </h1>
      <div style={{ width: 44 }} className="flex justify-end items-center">
        {right}
      </div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-[var(--settings-gutter,1rem)] pt-6 pb-2">
      <h2 className="text-label font-semibold font-sans leading-[18px]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </h2>
    </div>
  );
}

/**
 * Card wrapper for a settings section: optional SectionLabel above a Card.
 * "rows" (default) = no padding, clips children's corners for a list of SettingsRowItem rows.
 * "content" = padded, for sections wrapping arbitrary content (e.g. ThemeModeSelector).
 */
export function SettingsSection({
  label,
  variant = "rows",
  className = "",
  children,
}: {
  label?: string;
  variant?: "rows" | "content";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {label && <SectionLabel label={label} />}
      <Card
        elevation="flat"
        padding={variant === "content" ? "md" : "none"}
        className={`mx-[var(--settings-gutter,1rem)] ${variant === "rows" ? "overflow-hidden" : ""} ${className}`.trim()}
      >
        {children}
      </Card>
    </>
  );
}

export * from "../../components/SettingsRow";
