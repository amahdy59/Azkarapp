import { MushafMaterialHint } from "./MushafMaterialHint";
import { MushafMagnificationControl } from "./MushafMagnificationControl";
import { ResponsiveSheet, SheetHeader, SidePanel } from "./ResponsiveSheet";
import { ToolbarPanel } from "./ToolbarPanel";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage, MushafLayout, MushafTextScale, MushafToolbarSide, MushafTheme, ThemeMode } from "../types";
import { Check, ChevronDown, SlidersHorizontal } from "./icons";
import { MushafKeyboardShortcutList } from "./MushafKeyboardShortcuts";
import { ToggleTrack } from "./SettingsRow";
import { handleRadioNavigation } from "./radioNavigation";
import "./mushaf-reading-settings.css";

export interface MushafSettingsSheetProps {
  open: boolean;
  onClose: () => void;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  theme: MushafTheme;
  appTheme?: ThemeMode;
  onSelectTheme: (theme: MushafTheme) => void;
  colorGestures?: boolean;
  onSelectColorGestures?: (enabled: boolean) => void;
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
    nameKey: "mushaf.colorMidnight",
    swatchBg: "#0b1220",
    swatchBorder: "#1e293b",
    swatchAccent: "#d4af37",
  },
  {
    id: "light",
    nameKey: "mushaf.colorLight",
    swatchBg: "#fdfbf7",
    swatchBorder: "#e5e0d8",
    swatchAccent: "#b45309",
  },
  {
    id: "dark",
    nameKey: "mushaf.colorDark",
    swatchBg: "#18181b",
    swatchBorder: "#27272a",
    swatchAccent: "#a1a1aa",
  },
  {
    id: "oled",
    nameKey: "mushaf.colorOled",
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
  colorGestures = true,
  onSelectColorGestures,
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
    <div className="mushaf-reading-settings flex flex-col h-full overflow-hidden" dir={direction}>
      {/* Standard Sheet Header */}
      <SheetHeader
        title={t(language, "mushaf.readingSettings")}
        subtitle={`${surahName} · ${t(language, "mushaf.pageLabel", { page: formatNumerals(pageNumber, language) })}`}
        icon={<SlidersHorizontal size={20} aria-hidden="true" />}
        onClose={onClose}
        language={language}
        direction={direction}
      />

      <div className="mushaf-settings-body flex flex-col gap-5 p-5 sm:p-6 overflow-y-auto min-h-0 flex-1">
        {/* Section: Themes (Clean Swatches + App Theme Badge) */}
        <section aria-labelledby="mushaf-theme-heading" className="flex flex-col gap-2.5">
          <h3 id="mushaf-theme-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {t(language, "mushaf.pageColor")}
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={theme === "follow-app"}
            aria-label={t(language, "mushaf.themeFollowApp")}
            onClick={() => onSelectTheme(theme === "follow-app" ? resolvedTheme : "follow-app")}
            className="mushaf-follow-app"
          >
            <span>
              <span className="block text-sm font-semibold">{t(language, "mushaf.themeFollowApp")}</span>
              <span className="block text-xs text-muted-foreground">
                {t(language, theme === "follow-app" ? "mushaf.colorAutomatic" : "mushaf.colorManual")}
              </span>
            </span>
            <ToggleTrack checked={theme === "follow-app"} />
          </button>
          <MushafMaterialHint language={language} />
          <div
            role="radiogroup"
            aria-labelledby="mushaf-theme-heading"
            className="mushaf-color-options"
            dir={direction}
          >
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id || (theme === "follow-app" && opt.id === appTheme);
              const label = t(language, opt.nameKey);

              return (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  data-testid={`mushaf-theme-option-${opt.id}`}
                  onClick={() => onSelectTheme(opt.id)}
                  tabIndex={isSelected ? 0 : -1}
                  onKeyDown={handleRadioNavigation}
                  className="mushaf-color-option"
                >
                  <span
                    className="mushaf-color-preview"
                    style={{ backgroundColor: opt.swatchBg, borderColor: opt.swatchBorder }}
                    aria-hidden="true"
                  >
                    <span style={{ backgroundColor: opt.swatchAccent }} />
                    <span style={{ backgroundColor: opt.swatchAccent }} />
                    <span style={{ backgroundColor: opt.swatchAccent }} />
                    {isSelected && (
                      <span className="mushaf-color-check">
                        <Check size={14} aria-hidden="true" />
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-semibold">{label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {onSelectColorGestures && (
          <section className="flex flex-col gap-2">
            <button
              type="button"
              role="switch"
              aria-checked={colorGestures}
              onClick={() => onSelectColorGestures(!colorGestures)}
              className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
            >
              <span>{t(language, "mushaf.colorGestures")}</span>
              <ToggleTrack checked={colorGestures} />
            </button>
            <details className="rounded-xl border border-border px-3">
              <summary className="min-h-11 cursor-pointer py-3 text-xs font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                {t(language, "mushaf.gestureGuide")}
              </summary>
              <p className="pb-3 text-xs leading-relaxed text-muted-foreground">
                {t(language, "mushaf.gestureGuideBody")}
              </p>
            </details>
          </section>
        )}

        {(onSelectMagnification || (autoSpreadRoom && onSelectLayout) || (showToolbarSide && onSelectToolbarSide)) && (
          <details className="mushaf-advanced-display">
            <summary>
              <span>{t(language, "mushaf.advancedDisplay")}</span>
              <ChevronDown size={18} aria-hidden="true" />
            </summary>
            <div className="flex flex-col gap-5 pt-4">
              {onSelectMagnification && (
                <MushafMagnificationControl
                  language={language}
                  value={magnification}
                  onChange={onSelectMagnification}
                />
              )}

              {autoSpreadRoom && onSelectLayout && (
                <section aria-labelledby="mushaf-layout-heading" className="flex flex-col gap-2.5">
                  <h3
                    id="mushaf-layout-heading"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
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
                          <span>{label}</span>
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
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-micro font-medium leading-snug text-muted-foreground">
                    {t(language, "mushaf.toolbarSideHint")}
                  </p>
                </section>
              )}
            </div>
          </details>
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
        className={`mushaf-protected-overlay ${sheetSurfaceClass}`}
      >
        {body}
      </SidePanel>
    );
  }

  return (
    <ResponsiveSheet
      readerPanel={ToolbarPanel}
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.readingSettings")}
      direction={direction}
      language={language}
      testId="mushaf-settings-sheet"
      maxWidthClassName="max-w-md"
      overlayClassName="bg-black/50"
      dialogClassName={`mushaf-protected-overlay ${sheetSurfaceClass}`}
      drawerClassName={`mushaf-protected-overlay ${sheetSurfaceClass}`}
      showCloseButton={false}
    >
      {body}
    </ResponsiveSheet>
  );
}
