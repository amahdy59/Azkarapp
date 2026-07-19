import React from "react";
import { ArrowPrevious, BookOpen, Home, Settings } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function IconButton({
  label,
  className = "",
  children,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`ui-icon-button focus-visible:outline-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Header({
  title,
  subtitle,
  onBack,
  right,
  language = "en",
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  language?: AppLanguage;
}) {
  return (
    <div className="flex items-center gap-2 px-4 shrink-0 h-14">
      {onBack && (
        <IconButton onClick={onBack} label={t(language, "common.back")}>
          <ArrowPrevious size={20} className="text-foreground" />
        </IconButton>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold truncate text-[1.0625rem] leading-6 text-foreground font-sans">{title}</h1>
        {subtitle && <p className="text-[0.75rem] text-muted-foreground font-sans leading-[18px]">{subtitle}</p>}
      </div>
      {right}
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
    <nav aria-label={t(language, "common.bottomNavigation")} className="flex h-16 shrink-0 bg-card">
      <div className="flex min-h-0 flex-1 items-center justify-between px-8">
        {tabs.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className="flex min-h-11 min-w-12 flex-col items-center justify-center gap-1 rounded-lg transition-[opacity,transform] duration-150 active:scale-95 active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span className={on ? "nav-active-cue" : ""} key={`${id}-${on}`}>
                <Icon size={24} style={{ color: on ? "var(--primary)" : "var(--card-foreground)" }} />
              </span>
              <span
                className={`font-sans text-[0.6875rem] font-semibold leading-[14px] ${on ? "text-primary" : "text-muted-foreground"}`}
                dir="auto"
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
