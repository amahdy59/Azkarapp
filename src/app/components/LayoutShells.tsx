import React from "react";
import { ArrowPrevious, BarChart3, BookOpen, Home, Settings, Globe, Moon, Sun, Contrast } from "./icons";
import { PalmTreeMark } from "./RoutineGarden";
import { t } from "../i18n";
import type { AppLanguage, ThemeMode } from "../types";

// ─── Shared nav tab definition ────────────────────────────────────────────────

export type NavTab = "home" | "azkar" | "progress" | "settings";

export interface NavProps {
  active: NavTab;
  onChange: (t: NavTab) => void;
  isArabic?: boolean;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  onLanguageChange?: (lang: AppLanguage) => void;
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
      className="flex h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 bg-card pb-[env(safe-area-inset-bottom)] shadow-sm"
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
              className="relative flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg transition-[opacity,transform] duration-150 active:scale-95 active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              {/* Persistent non-color active cue. The selected state must not be
                  conveyed by colour alone, and .nav-active-cue below is only a
                  transient entrance animation that reduced-motion disables. */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-3 top-0 h-[3px] rounded-b-full ${on ? "bg-primary" : "bg-transparent"}`}
              />
              <span className={on ? "nav-active-cue" : ""} key={`${id}-${on}`}>
                <Icon size={24} style={{ color: on ? "var(--primary)" : "var(--card-foreground)" }} />
              </span>
              <span
                className={`whitespace-nowrap font-sans text-[0.625rem] leading-6 min-[360px]:text-[0.6875rem] ${
                  on ? "font-extrabold text-primary" : "font-semibold text-muted-foreground"
                }`}
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
      aria-label={t(language, "common.primaryNavigation")}
      className="app-rail flex flex-col items-center gap-2 py-4 px-1"
    >
      {/* Brand icon */}
      <div className="flex items-center justify-center p-2 mb-2" aria-hidden="true">
        <PalmTreeMark size={28} className="text-primary" />
      </div>

      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button
            key={id}
            data-testid={`nav-${id}`}
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
 * Shows palm brand header, full labeled item links, and bottom quick controls.
 */
export function NavSidebar({
  active,
  onChange,
  isArabic = false,
  themeMode = "dark",
  onThemeModeChange,
  onLanguageChange,
}: NavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = getNavTabs(language);

  const toggleLang = () => {
    onLanguageChange?.(isArabic ? "en" : "ar");
  };

  // Cycle all three product themes. A binary dark<->light toggle would strand a
  // Midnight user in Light with no way back from the sidebar.
  const THEME_CYCLE: ThemeMode[] = ["midnight", "dark", "light"];
  const themeLabelKeys = {
    midnight: "settings.themeMidnight",
    dark: "settings.themeDark",
    light: "settings.themeLight",
  } as const;
  const ThemeIcon = themeMode === "light" ? Sun : themeMode === "dark" ? Contrast : Moon;

  const cycleTheme = () => {
    const currentIndex = THEME_CYCLE.indexOf(themeMode);
    const nextMode = THEME_CYCLE[(currentIndex + 1) % THEME_CYCLE.length]!;
    onThemeModeChange?.(nextMode);
  };

  return (
    <nav
      aria-label={t(language, "common.primaryNavigation")}
      className="app-sidebar nav-sidebar flex flex-col justify-between h-full"
    >
      <div className="flex flex-col gap-1">
        {/* App brand / identity */}
        <div className="nav-sidebar-brand flex items-center gap-3 px-3 py-4 mb-2 border-b border-border/40">
          <PalmTreeMark size={32} className="text-primary shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-[1.125rem] font-extrabold text-foreground font-sans">
              {isArabic ? "تطبيق الأذكار" : "Azkar App"}
            </span>
            <span className="text-[0.75rem] font-semibold text-muted-foreground font-sans">
              {isArabic ? "حصنك اليومي" : "Daily Fortress"}
            </span>
          </div>
        </div>

        {/* Primary nav items */}
        {tabs.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              data-testid={`nav-${id}`}
              onClick={() => onChange(id)}
              aria-current={on ? "page" : undefined}
              className="nav-sidebar-item"
            >
              <span className={on ? "nav-active-cue flex text-primary" : "flex"} key={`${id}-${on}`}>
                <Icon size={20} />
              </span>
              <span className="font-semibold" dir="auto">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick controls footer (Language & Theme toggle) */}
      <div className="flex flex-col gap-2 p-3 mt-auto border-t border-border/40">
        {onLanguageChange && (
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center justify-between min-h-11 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-[0.875rem] font-medium text-foreground transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Globe size={18} className="text-primary" />
              <span>{isArabic ? "English" : "العربية"}</span>
            </div>
            <span className="text-[0.6875rem] font-bold uppercase text-muted-foreground">{language.toUpperCase()}</span>
          </button>
        )}

        {onThemeModeChange && (
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`${isArabic ? "المظهر" : "Theme"}: ${t(language, themeLabelKeys[themeMode])}`}
            className="flex items-center justify-between min-h-11 px-3 rounded-xl border border-border/60 bg-card hover:bg-muted text-[0.875rem] font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <div className="flex items-center gap-2.5">
              <ThemeIcon size={18} className="text-primary" />
              <span>{isArabic ? "المظهر" : "Theme"}</span>
            </div>
            <span className="text-[0.6875rem] font-bold text-muted-foreground">
              {t(language, themeLabelKeys[themeMode])}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
