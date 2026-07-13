import React from "react";
import { ArrowPrevious, BatteryFull, BookOpen, Home, Settings, Signal, Wifi } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-4 shrink-0 border-b border-border h-14">
      {onBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          className="flex items-center justify-center rounded-full transition-colors w-11 h-11 min-w-[44px] hover:bg-muted active:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowPrevious size={22} className="text-foreground" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-[17px] leading-6 text-foreground font-sans">{title}</p>
        {subtitle && <p className="text-[12px] text-muted-foreground font-sans leading-[18px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="flex h-11 shrink-0 items-center justify-between px-6 text-foreground" dir="ltr" aria-hidden="true">
      <span className="font-sans text-[14px] font-semibold leading-5">9:41</span>
      <div className="flex items-center gap-2">
        <Signal size={17} strokeWidth={2.5} />
        <Wifi size={17} strokeWidth={2.5} />
        <BatteryFull size={22} strokeWidth={2} />
      </div>
    </div>
  );
}

export function BottomNav({
  active,
  onChange,
  isArabic = false,
}: {
  active: "home" | "azkar" | "settings";
  onChange: (t: "home" | "azkar" | "settings") => void;
  isArabic?: boolean;
}) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = [
    { id: "home" as const, label: t(language, "common.home"), Icon: Home },
    { id: "azkar" as const, label: t(language, "common.azkar"), Icon: BookOpen },
    { id: "settings" as const, label: t(language, "common.settings"), Icon: Settings },
  ];
  return (
    <nav
      aria-label="Bottom Navigation"
      className="flex h-[83px] shrink-0 flex-col border-t border-border bg-card"
      dir="ltr"
    >
      <div className="flex min-h-0 flex-1 items-start justify-between px-8 pt-3">
        {tabs.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className="flex min-w-12 flex-col items-center justify-center gap-1 rounded-lg transition-[opacity,transform] duration-150 active:scale-95 active:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className={on ? "nav-active-cue" : ""} key={`${id}-${on}`}>
                <Icon size={24} style={{ color: on ? "var(--nav-active)" : "var(--nav-inactive)" }} />
              </span>
              <span
                className={`font-sans text-[11px] font-semibold leading-[14px] ${on ? "text-primary" : "text-muted-foreground"}`}
                dir="auto"
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex h-7 shrink-0 items-start justify-center pt-2">
        <span className="h-[5px] w-[134px] rounded-full bg-foreground" aria-hidden="true" />
      </div>
    </nav>
  );
}
