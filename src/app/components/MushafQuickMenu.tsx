import { type ReactNode } from "react";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafLayout, MushafTheme, ThemeMode } from "../types";
import type { SurahAudioControl } from "./MushafToolRail";
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  Pause,
  Play,
  SlidersHorizontal,
  Translate,
} from "./icons";

interface QuickMenuItem {
  id: string;
  label: string;
  detail?: string;
  icon: ReactNode;
  onSelect: () => void;
  pressed?: boolean;
  disabled?: boolean;
  /** A chevron promises another surface. Items that just act do not get one. */
  opensSurface?: boolean;
  testId?: string;
}

export interface MushafQuickMenuProps {
  open: boolean;
  onClose: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  surahName: string;
  juzNumber: number;
  pageNumber: number;
  showWordMeanings: boolean;
  isLoadingWordMeanings: boolean;
  isPageBookmarked: boolean;
  onOpenIndex: () => void;
  onOpenBookmarks: () => void;
  onToggleWordMeanings: () => void;
  onTogglePageBookmark: () => void;
  onOpenSettings: () => void;
  onReadExternally?: () => void;
  surahAudio?: SurahAudioControl;
  playbackFollowing?: { enabled: boolean; onToggle: () => void };
  showPageTools?: boolean;
  showIndexAction?: boolean;
  readingMode?: "mushaf" | "bilingual";
  onSelectReadingMode?: (mode: "mushaf" | "bilingual") => void;
  mushafLayout?: MushafLayout;
  onSelectLayout?: (layout: MushafLayout) => void;
  showLayoutOptions?: boolean;
  showPageTranslation?: boolean;
  onTogglePageTranslation?: () => void;
  theme?: MushafTheme;
  appTheme?: ThemeMode;
  onSelectTheme?: (theme: MushafTheme) => void;
}

const THEME_OPTIONS: readonly {
  id: MushafTheme;
  nameKey: string;
  swatchBg: string;
  swatchBorder: string;
  swatchAccent: string;
}[] = [
  {
    id: "midnight",
    nameKey: "mushaf.themeMidnight",
    swatchBg: "#0b1220",
    swatchBorder: "#1e293b",
    swatchAccent: "#d4af37",
  },
  { id: "light", nameKey: "mushaf.themeLight", swatchBg: "#fdfbf7", swatchBorder: "#e5e0d8", swatchAccent: "#b45309" },
  { id: "dark", nameKey: "mushaf.themeDark", swatchBg: "#18181b", swatchBorder: "#27272a", swatchAccent: "#a1a1aa" },
  { id: "oled", nameKey: "mushaf.themeOled", swatchBg: "#000000", swatchBorder: "#333333", swatchAccent: "#ffffff" },
];

export function MushafQuickMenu({
  open,
  onClose,
  language,
  direction,
  surahName,
  juzNumber,
  pageNumber,
  showWordMeanings,
  isLoadingWordMeanings,
  isPageBookmarked,
  onOpenIndex,
  onOpenBookmarks,
  onToggleWordMeanings,
  onTogglePageBookmark,
  onOpenSettings,
  onReadExternally,
  surahAudio,
  playbackFollowing,
  showPageTools = true,
  showIndexAction = true,
  readingMode = "mushaf",
  onSelectReadingMode,
  mushafLayout = "auto",
  onSelectLayout,
  showLayoutOptions = false,
  showPageTranslation = false,
  onTogglePageTranslation,
  theme,
  appTheme = "midnight",
  onSelectTheme,
}: MushafQuickMenuProps) {
  const items: QuickMenuItem[] = [
    ...(playbackFollowing
      ? [
          {
            id: "follow-recitation",
            label: t(language, "quranListening.follow"),
            icon: <BookOpen size={18} />,
            pressed: playbackFollowing.enabled,
            onSelect: playbackFollowing.onToggle,
            testId: "mushaf-playback-follow",
          },
        ]
      : []),
    ...(surahAudio
      ? [
          {
            id: "surah-audio",
            label:
              surahAudio.status === "playing"
                ? t(language, "mushaf.pauseRecitation")
                : t(language, !surahAudio.available ? "reader.audioUnavailable" : "mushaf.listenSurah"),
            icon:
              surahAudio.status === "playing" ? (
                <Pause size={19} aria-hidden="true" />
              ) : (
                <Play size={19} aria-hidden="true" />
              ),
            disabled: !surahAudio.available,
            onSelect: surahAudio.onToggle,
            testId: "mushaf-quick-audio",
          },
        ]
      : []),
    ...(onReadExternally
      ? [
          {
            id: "read-externally",
            label: t(language, "reader.readExternally"),
            icon: <Check size={19} aria-hidden="true" />,
            onSelect: () => {
              onClose();
              onReadExternally();
            },
            testId: "mushaf-quick-read-externally",
          },
        ]
      : []),
    ...(showIndexAction
      ? [
          {
            id: "index",
            label: t(language, "mushaf.indexTitle"),
            detail: `${surahName} · ${t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}`,
            icon: <List size={19} aria-hidden="true" />,
            onSelect: onOpenIndex,
            opensSurface: true,
            testId: "mushaf-quick-index",
          },
        ]
      : []),
    {
      id: "bookmarks",
      label: t(language, "mushaf.tabBookmarks"),
      icon: <BookmarkCheck size={19} aria-hidden="true" />,
      onSelect: onOpenBookmarks,
      opensSurface: true,
      testId: "mushaf-quick-bookmarks",
    },
    ...(showPageTools
      ? [
          {
            id: "page-bookmark",
            label: t(language, "mushaf.bookmarkCurrentPage"),
            detail: t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) }),
            icon: <Bookmark size={19} aria-hidden="true" className={isPageBookmarked ? "fill-current" : undefined} />,
            onSelect: onTogglePageBookmark,
            pressed: isPageBookmarked,
            testId: "mushaf-quick-page-bookmark",
          },
          {
            id: "word-meanings",
            label: t(language, "mushaf.difficultWordsInvite"),
            icon: <BookOpen size={19} aria-hidden="true" />,
            onSelect: onToggleWordMeanings,
            pressed: showWordMeanings,
            disabled: isLoadingWordMeanings,
            testId: "mushaf-quick-word-meanings",
          },
        ]
      : []),
  ];

  const Chevron = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.readingViewOptions")}
      direction={direction}
      testId="mushaf-quick-menu"
      maxWidthClassName="max-w-sm"
      showCloseButton={false}
      drawerClassName="pb-safe"
    >
      <div className="flex flex-col h-full overflow-hidden text-start" dir={direction}>
        <SheetHeader
          title={t(language, "mushaf.readingViewOptions")}
          subtitle={`${surahName} · ${t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}`}
          icon={<SlidersHorizontal size={20} aria-hidden="true" />}
          onClose={onClose}
          language={language}
          direction={direction}
        />
        <div className="flex flex-col gap-4 p-4 overflow-y-auto min-h-0 flex-1">
          {/* Section 1: Reading Mode (Mushaf Page vs Bilingual Stream) */}
          {onSelectReadingMode && (
            <section aria-labelledby="quick-reading-mode-heading" className="flex flex-col gap-2">
              <h3
                id="quick-reading-mode-heading"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t(language, "mushaf.readingModeTitle")}
              </h3>
              <div
                role="radiogroup"
                aria-labelledby="quick-reading-mode-heading"
                className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/40 p-1"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={readingMode === "mushaf"}
                  data-testid="quick-mode-mushaf"
                  onClick={() => {
                    onSelectReadingMode("mushaf");
                    onClose();
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    readingMode === "mushaf"
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen size={16} aria-hidden="true" />
                  <span>{t(language, "mushaf.modeMushaf")}</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={readingMode === "bilingual"}
                  data-testid="quick-mode-bilingual"
                  onClick={() => {
                    onSelectReadingMode("bilingual");
                    onClose();
                  }}
                  className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    readingMode === "bilingual"
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText size={16} aria-hidden="true" />
                  <span>{t(language, "mushaf.modeBilingual")}</span>
                </button>
              </div>
            </section>
          )}

          {/* Section 2: Page Layout (Desktop Single vs Two Pages vs Auto) */}
          {readingMode !== "bilingual" && showLayoutOptions && onSelectLayout && (
            <section aria-labelledby="quick-layout-heading" className="flex flex-col gap-2">
              <h3
                id="quick-layout-heading"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t(language, "mushaf.viewModeTitle")}
              </h3>
              <div
                role="radiogroup"
                aria-labelledby="quick-layout-heading"
                className="grid grid-cols-2 gap-2 rounded-xl border border-border/60 bg-muted/40 p-1"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={mushafLayout === "single"}
                  data-testid="quick-layout-single"
                  onClick={() => onSelectLayout("single")}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    mushafLayout === "single"
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{t(language, "mushaf.layoutSingle")}</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mushafLayout === "spread"}
                  data-testid="quick-layout-spread"
                  onClick={() => onSelectLayout("spread")}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                    mushafLayout === "spread"
                      ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{t(language, "mushaf.layoutSpread")}</span>
                </button>
              </div>
            </section>
          )}

          {/* Section 3: English Translation Toggle (Side-by-Side Paired View on Desktop) */}
          {readingMode !== "bilingual" && onTogglePageTranslation && (
            <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-muted/20 p-1">
              <button
                type="button"
                role="switch"
                aria-checked={showPageTranslation}
                data-testid="quick-page-translation-switch"
                onClick={onTogglePageTranslation}
                className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-start transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  showPageTranslation ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      showPageTranslation ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Translate size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <span className="block text-sm font-bold leading-tight">
                      {t(language, "mushaf.pairedTranslation")}
                    </span>
                    <span className="block text-xs text-muted-foreground truncate">
                      {t(language, "mushaf.pairedTranslationDesc")}
                    </span>
                  </div>
                </div>
                {showPageTranslation ? (
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={13} strokeWidth={3} aria-hidden="true" />
                  </div>
                ) : (
                  <div className="size-5 shrink-0 rounded-full border border-border" />
                )}
              </button>
            </div>
          )}

          {/* Section 4: Primary Actions & Bookmarks */}
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isToggle = item.pressed !== undefined;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  data-testid={item.testId}
                  {...(isToggle ? { role: "switch" as const, "aria-checked": item.pressed } : {})}
                  onClick={() => {
                    item.onSelect();
                    if (!isToggle) onClose();
                  }}
                  className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50 ${
                    item.pressed ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                      item.pressed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold leading-tight">{item.label}</span>
                    {item.detail && (
                      <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
                        {item.detail}
                      </span>
                    )}
                  </span>
                  {item.opensSurface && <Chevron size={16} className="shrink-0 opacity-40" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* Section 5: Appearance / Quick Themes */}
          {onSelectTheme && (
            <section
              aria-labelledby="quick-appearance-heading"
              className="flex flex-col gap-2 pt-2 border-t border-border/40"
            >
              <h3
                id="quick-appearance-heading"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                {t(language, "mushaf.appearanceTitle")}
              </h3>
              <div role="radiogroup" aria-labelledby="quick-appearance-heading" className="grid grid-cols-4 gap-2">
                {THEME_OPTIONS.map((opt) => {
                  const isSelected = theme === opt.id || (theme === "follow-app" && opt.id === appTheme);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      title={t(language, opt.nameKey)}
                      aria-label={t(language, opt.nameKey)}
                      data-testid={`quick-theme-${opt.id}`}
                      onClick={() => onSelectTheme(opt.id)}
                      className={`flex h-11 flex-col items-center justify-center rounded-xl border p-1 transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/40 shadow-xs"
                          : "border-border/60 hover:border-border"
                      }`}
                      style={{ backgroundColor: opt.swatchBg }}
                    >
                      <div className="h-1.5 w-6 rounded-full" style={{ backgroundColor: opt.swatchAccent }} />
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Section 6: More Settings */}
          <div className="pt-2 border-t border-border/40">
            <button
              type="button"
              data-testid="mushaf-quick-settings"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <SlidersHorizontal size={18} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold">{t(language, "mushaf.moreSettings")}</span>
              </div>
              <Chevron size={16} className="shrink-0 opacity-40" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </ResponsiveSheet>
  );
}
