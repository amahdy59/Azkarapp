import React from "react";
import { ArrowPrevious, BarChart3, BookOpen, Home, Settings } from "./icons";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

// ─── Shared nav tab definition ────────────────────────────────────────────────

type NavTab = "home" | "azkar" | "progress" | "settings";

interface NavProps {
  active: NavTab;
  onChange: (t: NavTab) => void;
  isArabic?: boolean;
}

function getNavTabs(language: AppLanguage) {
  return [
    { id: "home" as const, label: t(language, "common.home"), Icon: Home },
    { id: "azkar" as const, label: t(language, "common.azkar"), Icon: BookOpen },
    { id: "progress" as const, label: t(language, "common.progress"), Icon: BarChart3 },
    { id: "settings" as const, label: t(language, "common.settings"), Icon: Settings },
  ];
}

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
    <div className="flex w-full shrink-0 items-center gap-2 px-4 pt-0 pb-1" style={{ minHeight: 56 }}>
      {onBack && (
        <IconButton onClick={onBack} label={t(language, "common.back")}>
          <ArrowPrevious size={20} className="text-foreground" />
        </IconButton>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-extrabold truncate text-[1.5rem] leading-tight text-foreground font-sans">{title}</h1>
        {subtitle && <p className="text-[0.75rem] text-muted-foreground font-sans leading-[18px]">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export function BottomNav({ active, onChange, isArabic = false }: NavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = getNavTabs(language);
  return (
    <nav
      aria-label={t(language, "common.bottomNavigation")}
      className="flex h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(0,0,0,0.05)]"
    >
      <div className="flex min-h-0 flex-1 items-center justify-between px-2 min-[390px]:px-6">
        {tabs.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              className="flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg transition-[opacity,transform] duration-150 active:scale-95 active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span className={on ? "nav-active-cue" : ""} key={`${id}-${on}`}>
                <Icon size={24} style={{ color: on ? "var(--primary)" : "var(--card-foreground)" }} />
              </span>
              <span
                className={`whitespace-nowrap font-sans text-[0.625rem] font-semibold leading-6 min-[360px]:text-[0.6875rem] ${on ? "text-primary" : "text-muted-foreground"}`}
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

// ─── Nav Rail (Expanded 900px+) ───────────────────────────────────────────────

/**
 * Vertical navigation rail for expanded viewports (900–1199px).
 * Shows icon + short label in a single column. Replaces BottomNav at this
 * breakpoint.
 */
export function NavRail({ active, onChange, isArabic = false }: NavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = getNavTabs(language);
  return (
    <nav
      aria-label={t(language, "common.bottomNavigation")}
      className="app-rail flex flex-col items-center gap-1 py-4 px-1"
    >
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            data-testid={`nav-rail-${id}`}
            onClick={() => onChange(id)}
            aria-current={on ? "page" : undefined}
            className="nav-rail-item"
          >
            <span className={on ? "nav-active-cue" : ""} key={`${id}-${on}`}>
              <Icon size={22} />
            </span>
            <span className="nav-rail-label" dir="auto">
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── Nav Sidebar (Large 1200px+) ──────────────────────────────────────────────

/**
 * Labeled sidebar navigation for large viewports (1200px+).
 * Shows icon + full label in a persistent left/right column.
 */
export function NavSidebar({ active, onChange, isArabic = false }: NavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = getNavTabs(language);
  return (
    <nav aria-label={t(language, "common.bottomNavigation")} className="app-sidebar nav-sidebar">
      {/* App brand / identity */}
      <div className="nav-sidebar-brand" aria-hidden="true">
        <span className="text-[1.0625rem] font-extrabold text-foreground font-sans">أذكار</span>
        <span className="text-[1.0625rem] font-extrabold text-muted-foreground font-sans">Azkar</span>
      </div>

      {/* Primary nav items */}
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            data-testid={`nav-sidebar-${id}`}
            onClick={() => onChange(id)}
            aria-current={on ? "page" : undefined}
            className="nav-sidebar-item"
          >
            <span className={on ? "nav-active-cue flex" : "flex"} key={`${id}-${on}`}>
              <Icon size={20} />
            </span>
            <span dir="auto">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
