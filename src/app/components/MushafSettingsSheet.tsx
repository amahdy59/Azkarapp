import { ResponsiveSheet, SidePanel } from "./ResponsiveSheet";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafLayout, MushafTextScale, MushafToolbarSide, MushafTheme, ThemeMode } from "../types";
import { Check, Minus, Plus, SlidersHorizontal, X } from "./icons";

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
  textScale: MushafTextScale;
  onSelectTextScale?: (scale: MushafTextScale) => void;
  /**
   * False where the page is width-bound and the size choice cannot act — the
   * line already runs margin to margin, and the words on a line are page data.
   */
  textScaleApplies?: boolean;
  toolbarSide: MushafToolbarSide;
  onSelectToolbarSide?: (side: MushafToolbarSide) => void;
  /** Only offered where a rail is actually shown. */
  showToolbarSide?: boolean;
  /** Lists the page keys. Shown where there is a keyboard to use them. */
  showKeyboardHelp?: boolean;
  /**
   * Where a tool rail is showing there is width to spare, so the settings dock
   * beside the paper instead of covering it — the reader watches the page
   * answer while they choose. Everywhere else it stays a sheet.
   */
  presentation?: "sheet" | "side-panel";
  /** How far the docked panel holds back from its edge, to clear the rail. */
  panelInset?: number;
  pageNumber: number;
  surahName: string;
}

interface ThemeOption {
  id: MushafTheme;
  nameKey: string;
  swatchBg: string;
  swatchBorder: string;
  swatchAccent: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  {
    id: "follow-app",
    nameKey: "mushaf.themeFollowApp",
    swatchBg: "var(--card)",
    swatchBorder: "var(--border)",
    swatchAccent: "var(--primary)",
  },
  {
    id: "midnight",
    nameKey: "mushaf.themeMidnight",
    swatchBg: "#0b1220",
    swatchBorder: "#1e293b",
    swatchAccent: "#d4af37",
  },
  {
    id: "dark",
    nameKey: "mushaf.themeDark",
    swatchBg: "#18181b",
    swatchBorder: "#27272a",
    swatchAccent: "#a1a1aa",
  },
  {
    id: "light",
    nameKey: "mushaf.themeLight",
    swatchBg: "#fdfbf7",
    swatchBorder: "#e5e0d8",
    swatchAccent: "#b45309",
  },
  {
    id: "oled",
    nameKey: "mushaf.themeOled",
    swatchBg: "#000000",
    swatchBorder: "#333333",
    swatchAccent: "#ffffff",
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
  textScale,
  onSelectTextScale,
  textScaleApplies = true,
  toolbarSide,
  onSelectToolbarSide,
  showToolbarSide = false,
  showKeyboardHelp = false,
  presentation = "sheet",
  panelInset = 0,
  pageNumber,
  surahName,
}: MushafSettingsSheetProps) {
  const resolvedTheme = theme === "follow-app" ? appTheme : theme;
  const isPanel = presentation === "side-panel";
  const sheetSurfaceClass =
    resolvedTheme === "oled"
      ? "bg-black text-white border-neutral-800"
      : `theme-${resolvedTheme} bg-card text-card-foreground border-border`;

  const layoutOptions = [
    ["auto", t(language, "mushaf.layoutAuto")],
    ["single", t(language, "mushaf.layoutSingle")],
    ["spread", t(language, "mushaf.layoutSpread")],
  ] as const;

  const textScaleOptions = [
    ["small", t(language, "mushaf.textSizeSmall")],
    ["medium", t(language, "mushaf.textSizeMedium")],
    ["large", t(language, "mushaf.textSizeLarge")],
  ] as const;

  const toolbarSideOptions = [
    ["right", t(language, "mushaf.toolbarSideRight")],
    ["left", t(language, "mushaf.toolbarSideLeft")],
  ] as const;

  const segmentClass = (isSelected: boolean) =>
    `flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg px-2 text-center text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
      isSelected
        ? "bg-card text-foreground shadow-xs ring-1 ring-border/80"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const body = (
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

      {/* Section 1: Reading type size. Scales the ink inside the fifteen
            slots; it can never add, remove, or re-break a line. */}
      {onSelectTextScale && (
        <section aria-labelledby="mushaf-text-size-heading" className="flex flex-col gap-2.5">
          <h3
            id="mushaf-text-size-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            {t(language, "mushaf.textSizeTitle")}
          </h3>
          <div
            role="radiogroup"
            aria-labelledby="mushaf-text-size-heading"
            aria-describedby="mushaf-text-size-hint"
            data-testid="mushaf-text-size-group"
            className={`grid grid-cols-3 gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1 ${
              textScaleApplies ? "" : "opacity-50"
            }`}
          >
            {textScaleOptions.map(([id, label]) => {
              const isSelected = textScale === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!textScaleApplies}
                  data-testid={`mushaf-text-size-option-${id}`}
                  onClick={() => onSelectTextScale(id)}
                  className={segmentClass(isSelected)}
                >
                  {id === "small" && <Minus size={13} aria-hidden="true" className="shrink-0" />}
                  {id === "large" && <Plus size={13} aria-hidden="true" className="shrink-0" />}
                  <span
                    className="truncate"
                    style={{ fontSize: id === "small" ? "0.6875rem" : id === "large" ? "0.875rem" : undefined }}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
          <p id="mushaf-text-size-hint" className="text-[0.6875rem] font-medium leading-snug text-muted-foreground">
            {t(language, textScaleApplies ? "mushaf.textSizeHint" : "mushaf.textSizeAtPageWidth")}
          </p>
        </section>
      )}

      {/* Section 1: Themes (Modern 1-Tap Grid) */}
      <section aria-labelledby="mushaf-theme-heading" className="flex flex-col gap-2.5">
        <h3 id="mushaf-theme-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t(language, "mushaf.themeTitle")}
        </h3>
        <div
          role="radiogroup"
          aria-labelledby="mushaf-theme-heading"
          // A 352px panel has room for one column; a centred sheet has two.
          className={`grid gap-2 ${isPanel ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
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
                className={`interactive-elem flex min-h-[48px] items-center justify-between gap-3 rounded-xl border p-2.5 text-start transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40 font-bold"
                    : "border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Visual Color Preview Swatch */}
                  <div
                    className="size-6 shrink-0 rounded-full border shadow-xs flex items-center justify-center"
                    style={{ backgroundColor: opt.swatchBg, borderColor: opt.swatchBorder }}
                    aria-hidden="true"
                  >
                    <div className="size-2 rounded-full" style={{ backgroundColor: opt.swatchAccent }} />
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
                  className={`flex min-h-[44px] items-center justify-center rounded-lg px-2 text-center text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
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

      {/* Toolbar position — only meaningful where a rail is actually shown. */}
      {showToolbarSide && onSelectToolbarSide && (
        <section aria-labelledby="mushaf-toolbar-side-heading" className="flex flex-col gap-2.5">
          <h3
            id="mushaf-toolbar-side-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            {t(language, "mushaf.toolbarSideTitle")}
          </h3>
          <div
            role="radiogroup"
            aria-labelledby="mushaf-toolbar-side-heading"
            className="grid grid-cols-2 gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1"
          >
            {toolbarSideOptions.map(([id, label]) => {
              const isSelected = toolbarSide === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`mushaf-toolbar-side-option-${id}`}
                  onClick={() => onSelectToolbarSide(id)}
                  className={segmentClass(isSelected)}
                >
                  <span className="truncate">{label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[0.6875rem] font-medium leading-snug text-muted-foreground">
            {t(language, "mushaf.toolbarSideHint")}
          </p>
        </section>
      )}
      {/* DEC-097 put the arrow-key behaviour in the footer; the rail replaced
          that footer and has no room for a list. It belongs where a desktop
          reader goes looking for it. */}
      {showKeyboardHelp && (
        <section aria-labelledby="mushaf-keys-heading" className="flex flex-col gap-2 border-t border-border/40 pt-4">
          <h3 id="mushaf-keys-heading" className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {t(language, "mushaf.keyboardTitle")}
          </h3>
          <dl className="flex flex-col gap-1.5 text-[0.75rem]">
            {(
              [
                ["→", "common.previous"],
                ["←", "common.next"],
                ["Home", "mushaf.keyFirstPage"],
                ["End", "mushaf.keyLastPage"],
                ["F", "mushaf.focusMode"],
              ] as const
            ).map(([key, labelKey]) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <dt className="min-w-0 truncate font-medium text-muted-foreground">{t(language, labelKey)}</dt>
                <dd
                  dir="ltr"
                  className="shrink-0 rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 font-bold tabular-nums"
                >
                  {key}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );

  if (presentation === "side-panel") {
    return (
      <SidePanel
        open={open}
        onClose={onClose}
        title={t(language, "mushaf.readingSettings")}
        direction={direction}
        testId="mushaf-settings-sheet"
        side={toolbarSide}
        inset={panelInset}
        className={sheetSurfaceClass}
      >
        {body}
      </SidePanel>
    );
  }

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.readingSettings")}
      direction={direction}
      testId="mushaf-settings-sheet"
      maxWidthClassName="max-w-md"
      // Theme, type size, and layout all change the page behind this sheet, so
      // it dims rather than filters what it covers.
      overlayClassName="bg-black/50"
      dialogClassName={sheetSurfaceClass}
      drawerClassName={sheetSurfaceClass}
    >
      {body}
    </ResponsiveSheet>
  );
}
