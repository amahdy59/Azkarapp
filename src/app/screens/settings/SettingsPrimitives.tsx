import React from "react";
import { Card } from "../../components/Card";
import { IconButton } from "../../components/LayoutShells";
import { ArrowPrevious } from "../../components/icons";
import { t } from "../../i18n";
import type { AppLanguage } from "../../types";

import { useLayoutMode } from "../../hooks/useLayoutMode";

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

  if (isTwoPane) {
    return (
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <h1 className="text-2xl font-extrabold text-foreground font-sans leading-tight">{title}</h1>
        <div className="flex justify-end items-center">{right}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 56 }}>
      <IconButton onClick={onBack} label={t(language, "common.back")}>
        <ArrowPrevious size={20} className="text-foreground" />
      </IconButton>
      <h1 className="text-[1.5rem] font-extrabold text-foreground font-sans leading-tight">{title}</h1>
      <div style={{ width: 44 }} className="flex justify-end items-center">
        {right}
      </div>
    </div>
  );
}

export function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4 pt-6 pb-2">
      <h2
        className="text-[0.8125rem] font-semibold font-sans leading-[18px]"
        style={{ color: "var(--muted-foreground)" }}
      >
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
        padding={variant === "content" ? "md" : "none"}
        className={`mx-4 ${variant === "rows" ? "overflow-hidden" : ""} ${className}`.trim()}
      >
        {children}
      </Card>
    </>
  );
}

export * from "../../components/SettingsRow";
