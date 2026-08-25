import { ResponsiveSheet } from "./ResponsiveSheet";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafLayout, MushafTheme, ThemeMode } from "../types";
import { Bookmark, Check, SlidersHorizontal, X } from "./icons";

export interface MushafSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  theme: MushafTheme;
  appTheme?: ThemeMode;
  onSelectTheme: (theme: MushafTheme) => void;
  mushafLayout: MushafLayout;
  onSelectLayout?: (layout: MushafLayout) => void;
  autoSpreadRoom?: boolean;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  pageNumber: number;
  surahName: string;
}

interface ThemeOption {
  id: MushafTheme;
  nameKey: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  accentClass: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: "follow-app",
    nameKey: "mushaf.themeFollowApp",
    bgClass: "bg-gradient-to-br from-card to-muted",
    borderClass: "border-border",
    textClass: "text-foreground",
    accentClass: "bg-primary",
  },
  {
    id: "midnight",
    nameKey: "mushaf.themeMidnight",
    bgClass: "bg-[#0b1220]",
    borderClass: "border-[#1e293b]",
    textClass: "text-[#e2e8f0]",
    accentClass: "bg-[#d4af37]",
  },
  {
    id: "dark",
    nameKey: "mushaf.themeDark",
    bgClass: "bg-[#18181b]",
    borderClass: "border-[#27272a]",
    textClass: "text-[#f4f4f5]",
    accentClass: "bg-[#a1a1aa]",
  },
  {
    id: "light",
    nameKey: "mushaf.themeLight",
    bgClass: "bg-[#fdfbf7]",
    borderClass: "border-[#e5e0d8]",
    textClass: "text-[#1c1917]",
    accentClass: "bg-[#b45309]",
  },
  {
    id: "oled",
    nameKey: "mushaf.themeOled",
    bgClass: "bg-black",
    borderClass: "border-neutral-800",
    textClass: "text-white",
    accentClass: "bg-white",
  },
];

export function MushafSettingsSheet({
  open,
  onClose,
  language,
  direction,
  theme,
  appTheme = "midnight",
  onSelectTheme,
  mushafLayout,
  onSelectLayout,
  autoSpreadRoom = false,
  isBookmarked,
  onToggleBookmark,
  pageNumber,
  surahName,
}: MushafSettingsSheetProps) {
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;
  const sheetSurfaceClass =
    resolvedTheme === "oled"
      ? "bg-black text-white border-neutral-800"
      : `theme-${resolvedTheme} bg-card text-card-foreground border-border`;

  const layoutOptions = [
    ["auto", t(language, "mushaf.layoutAuto")],
    ["single", t(language, "mushaf.layoutSingle")],
    ["spread", t(language, "mushaf.layoutSpread")],
  ] as const;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.readingSettings")}
      direction={direction}
      testId="mushaf-settings-sheet"
      maxWidthClassName="max-w-[460px]"
      dialogClassName={sheetSurfaceClass}
      drawerClassName={sheetSurfaceClass}
    >
      <div className="flex flex-col gap-5 p-5 sm:p-6" dir={direction}>
        {/* Sheet Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal size={20} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p aria-hidden="true" className="text-base font-bold leading-tight truncate">
                {t(language, "mushaf.readingSettings")}
              </p>
              <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">
                {surahName} · {t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t(language, "common.close")}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Section 1: Themes (Modern 1-Tap Grid) */}
        <section aria-labelledby="mushaf-theme-heading" className="flex flex-col gap-2.5">
          <h3 id="mushaf-theme-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(language, "mushaf.themeTitle")}
          </h3>
          <div
            role="radiogroup"
            aria-labelledby="mushaf-theme-heading"
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              const label = t(language, opt.nameKey);

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`mushaf-theme-option-${opt.id}`}
                  onClick={() => onSelectTheme(opt.id)}
                  className={`interactive-elem flex min-h-[48px] items-center justify-between gap-3 rounded-xl border p-2.5 text-start transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40 font-bold"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Visual Color Preview Swatch */}
                    <div
                      className={`size-6 shrink-0 rounded-full border shadow-2xs flex items-center justify-center ${opt.bgClass} ${opt.borderClass}`}
                      aria-hidden="true"
                    >
                      <div className={`size-2 rounded-full ${opt.accentClass}`} />
                    </div>
                    <span className="text-xs font-semibold truncate">{label}</span>
                  </div>
                  {isSelected && (
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Section 2: Page Layout (Segmented Control when available) */}
        {autoSpreadRoom && onSelectLayout && (
          <section aria-labelledby="mushaf-layout-heading" className="flex flex-col gap-2.5">
            <h3 id="mushaf-layout-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {t(language, "mushaf.layoutTitle")}
            </h3>
            <div
              role="radiogroup"
              aria-labelledby="mushaf-layout-heading"
              className="grid grid-cols-3 gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1"
            >
              {layoutOptions.map(([id, label]) => {
                const isSelected = mushafLayout === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    data-testid={`mushaf-layout-option-${id}`}
                    onClick={() => onSelectLayout(id)}
                    className={`flex min-h-[44px] items-center justify-center rounded-lg px-2 text-center text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                      isSelected
                        ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 3: Bookmark Toggle Switch */}
        <section aria-label={t(language, "mushaf.tabBookmarks")} className="border-t border-border/40 pt-4">
          <button
            type="button"
            role="switch"
            aria-checked={isBookmarked}
            data-testid="mushaf-bookmark-toggle"
            onClick={onToggleBookmark}
            className={`interactive-elem flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border p-3 text-start transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
              isBookmarked ? "border-primary/50 bg-primary/10" : "border-border/60 bg-muted/30 hover:bg-muted/60"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                  isBookmarked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Bookmark size={18} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold leading-snug">
                  {t(language, "mushaf.bookmarkCurrentPage")}
                </span>
                <span className="block text-[0.6875rem] text-muted-foreground font-medium truncate mt-0.5">
                  {t(language, "mushaf.bookmarkHint")}
                </span>
              </div>
            </div>

            {/* Switch pill */}
            <div
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isBookmarked ? "bg-primary" : "bg-muted-foreground/30"
              }`}
              aria-hidden="true"
            >
              <div
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow-xs transition-transform ${
                  isBookmarked ? (direction === "rtl" ? "-translate-x-5" : "translate-x-5") : "translate-x-0.5"
                }`}
              />
            </div>
          </button>
        </section>
      </div>
    </ResponsiveSheet>
  );
}
