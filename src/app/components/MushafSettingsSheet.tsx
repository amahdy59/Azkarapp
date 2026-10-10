import { MushafMagnificationControl } from "./MushafMagnificationControl";
import { Modal, SheetHeader, SidePanel } from "./ResponsiveSheet";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafLayout, MushafTextScale, MushafToolbarSide, MushafTheme, ThemeMode } from "../types";
import { Check, SlidersHorizontal } from "./icons";
import { MushafKeyboardShortcutList } from "./MushafKeyboardShortcuts";

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
  magnification?: number;
  onSelectMagnification?: (value: number) => void;
  textScale?: MushafTextScale;
  onSelectTextScale?: (scale: MushafTextScale) => void;
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
   * answer while they choose. Everywhere else it opens as a centered modal.
   */
  presentation?: "sheet" | "side-panel" | "modal";
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
    id: "midnight",
    nameKey: "mushaf.themeMidnight",
    swatchBg: "#0b1220",
    swatchBorder: "#1e293b",
    swatchAccent: "#d4af37",
  },
  {
    id: "light",
    nameKey: "mushaf.themeLight",
    swatchBg: "#fdfbf7",
    swatchBorder: "#e5e0d8",
    swatchAccent: "#b45309",
  },
  {
    id: "dark",
    nameKey: "mushaf.themeDark",
    swatchBg: "#18181b",
    swatchBorder: "#27272a",
    swatchAccent: "#a1a1aa",
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
  magnification = 100,
  onSelectMagnification,
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
      ? "theme-oled bg-card text-card-foreground border-neutral-800"
      : `theme-${resolvedTheme} bg-card text-card-foreground border-border`;

  const layoutOptions = [
    ["auto", t(language, "mushaf.layoutAuto")],
    ["single", t(language, "mushaf.layoutSingle")],
    ["spread", t(language, "mushaf.layoutSpread")],
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
    <div className="flex flex-col h-full overflow-hidden" dir={direction}>
      {/* Standard Sheet Header */}
      <SheetHeader
        title={t(language, "mushaf.readingSettings")}
        subtitle={`${surahName} · ${t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}`}
        icon={<SlidersHorizontal size={20} aria-hidden="true" />}
        onClose={onClose}
        language={language}
        direction={direction}
      />

      <div className="flex flex-col gap-5 p-5 sm:p-6 overflow-y-auto min-h-0 flex-1">
        {onSelectMagnification && (
          <MushafMagnificationControl language={language} value={magnification} onChange={onSelectMagnification} />
        )}

        {/* Section: Themes (Clean Swatches + App Theme Badge) */}
        <section aria-labelledby="mushaf-theme-heading" className="flex flex-col gap-2.5">
          <h3 id="mushaf-theme-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(language, "mushaf.themeTitle")}
          </h3>
          <div
            role="radiogroup"
            aria-labelledby="mushaf-theme-heading"
            className={`grid gap-2 ${isPanel ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
          >
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id || (theme === "follow-app" && opt.id === appTheme);
              const label = t(language, opt.nameKey);
              const isAppTheme = opt.id === appTheme;

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
                      ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/40 font-bold text-foreground"
                      : "border-border/60 bg-muted/30 hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Visual Color Preview Swatch: Rectangular miniature page, not a radio circle */}
                    <div
                      className="flex h-7 w-9 shrink-0 flex-col justify-center gap-1 rounded-lg border px-1.5 shadow-xs transition-transform"
                      style={{ backgroundColor: opt.swatchBg, borderColor: opt.swatchBorder }}
                      aria-hidden="true"
                    >
                      <div
                        className="h-1 w-full rounded-full opacity-90"
                        style={{ backgroundColor: opt.swatchAccent }}
                      />
                      <div
                        className="h-1 w-2/3 rounded-full opacity-60"
                        style={{ backgroundColor: opt.swatchAccent }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold truncate">{label}</span>
                      {isAppTheme && (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {t(language, "mushaf.appThemeBadge")}
                        </span>
                      )}
                    </div>
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
              aria-describedby="mushaf-layout-hint"
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
            <p id="mushaf-layout-hint" className="text-micro font-medium leading-snug text-muted-foreground">
              {mushafLayout === "single"
                ? t(language, "mushaf.layoutHintSingle")
                : mushafLayout === "spread"
                  ? t(language, "mushaf.layoutHintSpread")
                  : t(language, "mushaf.layoutHintAuto")}
            </p>
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
            <p className="text-micro font-medium leading-snug text-muted-foreground">
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
            <MushafKeyboardShortcutList language={language} />
          </section>
        )}
      </div>
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
    <Modal
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.readingSettings")}
      direction={direction}
      language={language}
      testId="mushaf-settings-sheet"
      maxWidthClassName="max-w-md"
      overlayClassName="bg-black/50"
      className={sheetSurfaceClass}
      showCloseButton={false}
    >
      {body}
    </Modal>
  );
}
