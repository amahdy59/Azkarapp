import React, { useRef } from "react";
import { useScrollElevation } from "../hooks/useScrollElevation";
import "./layout-shells.css";
import "./action-feedback.css";
import {
  ArrowPrevious,
  BarChart3,
  Bookmark,
  BookOpen,
  Compass,
  Contrast,
  Globe,
  Home,
  Moon,
  Settings,
  Sparkles,
  Sun,
} from "./icons";
import { PalmTreeMark } from "./RoutineGarden";
import { t } from "../i18n";
import { LANGUAGE_LABELS } from "../languageOptions";
import type { AppLanguage, ThemeMode } from "../types";

import { NAVIGATION_FOCUS } from "./ui/controlStyles";

const SIDEBAR_QUICK_ACTION = `flex items-center justify-between gap-3 min-h-11 px-3 py-2 rounded-xl border border-border/60 bg-card hover:bg-muted text-sm font-medium text-foreground transition-colors ${NAVIGATION_FOCUS}`;

// ─── Shared nav tab definition ────────────────────────────────────────────────

export type NavTab = "home" | "quran" | "azkar" | "progress" | "settings";

export interface NavProps {
  active?: NavTab;
  onChange: (t: NavTab) => void;
  isArabic?: boolean;
  themeMode?: ThemeMode;
  onThemeModeChange?: (mode: ThemeMode) => void;
  onLanguageChange?: (lang: AppLanguage) => void;
}
type UtilityTab = "qibla" | "masbaha";
interface UtilityNavProps {
  activeUtility?: UtilityTab;
  onOpenQibla?: () => void;
  onOpenMasbaha?: () => void;
}
function getUtilityTabs(language: AppLanguage) {
  return [
    { id: "qibla" as const, label: t(language, "qibla.title"), Icon: Compass },
    { id: "masbaha" as const, label: t(language, "counter.tasbeehTitle"), Icon: Sparkles },
  ];
}
function activateNavigation(id: NavTab | UtilityTab, onChange: NavProps["onChange"], utilities: UtilityNavProps) {
  if (id === "qibla") utilities.onOpenQibla?.();
  else if (id === "masbaha") utilities.onOpenMasbaha?.();
  else onChange(id);
}
function NavigationIcon({ Icon, selected, size = 20 }: { Icon: typeof Home; selected: boolean; size?: number }) {
  return (
    <span className={selected ? "nav-active-cue flex text-primary" : "flex"}>
      <Icon size={size} />
    </span>
  );
}

interface NavSidebarProps extends NavProps {
  activeUtility?: "quran" | "masbaha" | "settings" | "qibla";
  onOpenQuran?: () => void;
  onOpenMasbaha: () => void;
  onOpenSettings?: () => void;
  onOpenQibla?: () => void;
}

function getNavTabs(language: AppLanguage) {
  return [
    { id: "home" as const, label: t(language, "common.home"), Icon: Home },
    { id: "quran" as const, label: t(language, "common.mushaf"), Icon: BookOpen },
    { id: "azkar" as const, label: t(language, "common.azkar"), Icon: Bookmark },
    { id: "progress" as const, label: t(language, "common.progress"), Icon: BarChart3 },
    { id: "settings" as const, label: t(language, "common.settings"), Icon: Settings },
  ];
}

const NAV_HREF: Record<NavTab | UtilityTab, string> = {
  home: "#/home",
  quran: "#/quran-wird",
  azkar: "#/azkar",
  progress: "#/progress",
  settings: "#/settings",
  qibla: "#/qibla",
  masbaha: "#/counter",
};

function followInAppLink(event: React.MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  action();
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
      className={`ui-icon-button ui-action-cue surface-control-finish focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring ${className}`}
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
  elevateOnScroll = true,
  decoration,
  backButtonClassName,
  style,
  titleStyle,
  pageGutters = true,
}: {
  title: string;
  subtitle?: React.ReactNode;
  onBack?: () => void;
  right?: React.ReactNode;
  language?: AppLanguage;
  elevateOnScroll?: boolean;
  /** Absolutely positioned, non-interactive artwork; never changes sizing. */
  decoration?: React.ReactNode;
  backButtonClassName?: string;
  style?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  /** Devotional chrome can opt into its compact reading inset. */
  pageGutters?: boolean;
}) {
  const headerRef = useRef<HTMLDivElement>(null);
  const isScrolled = useScrollElevation(headerRef, elevateOnScroll);

  return (
    <div
      ref={headerRef}
      data-testid="shared-screen-header"
      data-scrolled={isScrolled || undefined}
      data-header-contrast="solid"
      className={`shared-screen-header ${decoration ? "isolate" : ""} sticky top-0 z-40 flex w-full shrink-0 gap-2 border-transparent bg-background ${pageGutters ? "page-header-frame items-start px-page" : "items-center px-4"} pt-2 pb-1 transition-colors duration-standard`}
      style={{ minHeight: 56, ...style }}
    >
      {/* Reading headers use one opaque surface; scene artwork belongs below
          the header so it cannot reduce contrast between the title/actions. */}
      {onBack && (
        <div
          className={pageGutters ? "shared-header-back" : undefined}
          style={{
            position: "relative",
            zIndex: 10,
            background: decoration ? "var(--background)" : undefined,
            borderRadius: "var(--radius-btn)",
          }}
        >
          <IconButton onClick={onBack} label={t(language, "common.back")} className={backButtonClassName}>
            <ArrowPrevious size={20} className="text-foreground" />
          </IconButton>
        </div>
      )}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          background: decoration ? "var(--background)" : undefined,
          borderRadius: "var(--radius-btn)",
        }}
        className="flex-1 min-w-0"
      >
        {/* Long collection names wrap within the available header column.
            Enlarged text may need more than two lines; the header grows rather
            than hiding the destination name. */}
        <h1
          className={
            pageGutters
              ? "page-title max-w-full font-sans text-foreground"
              : "max-w-full break-words font-sans text-lg font-extrabold leading-tight text-foreground min-[360px]:text-xl sm:text-2xl"
          }
          title={title}
          style={titleStyle}
        >
          {title}
        </h1>
        {subtitle && <p className="text-xs text-muted-foreground font-sans leading-normal">{subtitle}</p>}
      </div>
      {right && (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            background: decoration ? "var(--background)" : undefined,
            borderRadius: "var(--radius-btn)",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

export function BottomNav({ active, onChange, isArabic = false, ...utilities }: NavProps & UtilityNavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const primary = getNavTabs(language);
  const tabs = [...primary.slice(0, 3), ...getUtilityTabs(language), primary[4]!];
  return (
    <nav
      aria-label={t(language, "common.bottomNavigation")}
      className="bottom-nav flex min-h-[calc(4.5rem+env(safe-area-inset-bottom))] shrink-0 bg-card pb-[env(safe-area-inset-bottom)] shadow-sm"
    >
      <div className="bottom-nav-items flex min-h-0 flex-1 items-center justify-between px-1 min-[360px]:px-2 min-[390px]:px-4">
        {tabs.map(({ id, label, Icon }) => {
          const on =
            id === "qibla" || id === "masbaha"
              ? utilities.activeUtility === id
              : !utilities.activeUtility && active === id;
          return (
            <a
              key={id}
              href={NAV_HREF[id]}
              data-testid={`nav-${id}`}
              onClick={(event) => followInAppLink(event, () => activateNavigation(id, onChange, utilities))}
              aria-label={label}
              aria-current={on ? "page" : undefined}
              data-navigation-optional={id === "masbaha" || undefined}
              className="relative flex h-full min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg no-underline transition-[opacity,transform] duration-fast active:opacity-70 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
            >
              {/* Persistent non-color active cue. The selected state must not be
                  conveyed by colour alone, and .nav-active-cue below is only a
                  transient entrance animation that reduced-motion disables. */}
              <span
                aria-hidden="true"
                className={`absolute inset-x-2 top-0 h-[3px] rounded-b-full ${on ? "bg-primary" : "bg-transparent"}`}
              />
              <span className={on ? "nav-active-cue" : ""}>
                <Icon size={22} style={{ color: on ? "var(--primary)" : "var(--card-foreground)" }} />
              </span>
              <span
                className={`bottom-nav-label inline-flex min-h-[2em] max-w-full items-center justify-center px-0.5 text-center font-sans text-micro leading-normal whitespace-normal [overflow-wrap:anywhere] ${
                  on ? "font-extrabold text-primary" : "font-semibold text-muted-foreground"
                }`}
                dir="auto"
              >
                {label}
              </span>
            </a>
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
export function NavRail({ active, onChange, isArabic = false, ...utilities }: NavProps & UtilityNavProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = [
    ...getNavTabs(language),
    ...getUtilityTabs(language).filter(({ id }) => (id === "qibla" ? utilities.onOpenQibla : utilities.onOpenMasbaha)),
  ];
  return (
    <nav
      aria-label={t(language, "common.primaryNavigation")}
      className="app-rail flex flex-col items-center gap-2 py-4 px-1"
    >
      {/* Brand icon */}
      <a
        href={NAV_HREF.home}
        data-testid="desktop-rail-brand-home"
        onClick={(event) => followInAppLink(event, () => onChange("home"))}
        aria-label={t(language, "common.home")}
        className={`flex min-h-11 min-w-11 items-center justify-center p-2 mb-2 rounded-xl ${NAVIGATION_FOCUS} hover:bg-white/10 transition-colors`}
      >
        <PalmTreeMark size={28} className="text-primary" />
      </a>

      {tabs.map(({ id, label, Icon }) => {
        const on =
          id === "qibla" || id === "masbaha"
            ? utilities.activeUtility === id
            : !utilities.activeUtility && active === id;
        return (
          <a
            key={id}
            href={NAV_HREF[id]}
            data-testid={`nav-${id}`}
            onClick={(event) => followInAppLink(event, () => activateNavigation(id, onChange, utilities))}
            aria-current={on ? "page" : undefined}
            className="nav-rail-item"
          >
            <NavigationIcon Icon={Icon} selected={on} size={22} />
            <span className="nav-rail-label" dir="auto">
              {label}
            </span>
          </a>
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
  activeUtility,
  onOpenMasbaha,
  onOpenQibla,
}: NavSidebarProps) {
  const language: AppLanguage = isArabic ? "ar" : "en";
  const tabs = getNavTabs(language);
  const utilityTabs = getUtilityTabs(language)
    .filter(({ id }) => id === "masbaha" || onOpenQibla)
    .map((tool) => ({ ...tool, onClick: tool.id === "masbaha" ? onOpenMasbaha : onOpenQibla }));

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
        <a
          href={NAV_HREF.home}
          data-testid="desktop-brand-home"
          onClick={(event) => followInAppLink(event, () => onChange("home"))}
          aria-label={t(language, "common.home")}
          className={`nav-sidebar-brand flex min-h-11 items-center gap-3 px-3 py-4 mb-2 border-b border-border/40 rounded-xl ${NAVIGATION_FOCUS}`}
        >
          <PalmTreeMark size={32} className="text-primary shrink-0" />
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-extrabold text-foreground font-sans">{t(language, "common.appName")}</span>
            <span className="text-xs font-semibold text-muted-foreground font-sans">
              {t(language, "common.appTagline")}
            </span>
          </div>
        </a>

        {/* Primary nav items */}
        {tabs.map(({ id, label, Icon }) => {
          const on = !activeUtility && active === id;
          return (
            <a
              key={id}
              href={NAV_HREF[id]}
              data-testid={`nav-${id}`}
              onClick={(event) => followInAppLink(event, () => onChange(id))}
              aria-current={on ? "page" : undefined}
              className="nav-sidebar-item"
            >
              <NavigationIcon Icon={Icon} selected={on} />
              <span className="font-semibold" dir="auto">
                {label}
              </span>
            </a>
          );
        })}

        <div className="my-2 border-t border-border/40" aria-hidden="true" />
        {utilityTabs.map(({ id, label, Icon, onClick }) => {
          const on = activeUtility === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`nav-${id}`}
              onClick={onClick}
              aria-current={on ? "page" : undefined}
              className="nav-sidebar-item"
            >
              <NavigationIcon Icon={Icon} selected={on} />
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
            // Named like its theme sibling below (DEC-068 / F31). Without this
            // the accessible name was the concatenated text content,
            // "LanguageEnglish", so two adjacent controls of the same type
            // announced in two different formats. The explicit focus ring
            // matches the theme button too, which had one while this did not.
            aria-label={`${t(language, "settings.language")}: ${LANGUAGE_LABELS[language]}`}
            className={SIDEBAR_QUICK_ACTION}
          >
            <div className="flex min-w-0 items-center gap-2">
              <Globe size={18} className="block shrink-0 text-primary" />
              <span className="min-w-0">{t(language, "settings.language")}</span>
            </div>
            {/* Label names the setting, value shows the CURRENT language —
                matching the theme button directly below and every settings row.
                It previously labelled itself with the *target* language
                ("English") beside a badge showing the current one ("AR"), which
                is two opposite mental models in one control. */}
            <span className="shrink-0 text-micro font-bold text-muted-foreground">{LANGUAGE_LABELS[language]}</span>
          </button>
        )}

        {onThemeModeChange && (
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`${t(language, "common.theme")}: ${t(language, themeLabelKeys[themeMode])}`}
            className={SIDEBAR_QUICK_ACTION}
          >
            <div className="flex min-w-0 items-center gap-2">
              <ThemeIcon size={18} className="block shrink-0 text-primary" />
              <span className="min-w-0">{t(language, "common.theme")}</span>
            </div>
            <span className="shrink-0 text-micro font-bold text-muted-foreground">
              {t(language, themeLabelKeys[themeMode])}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
