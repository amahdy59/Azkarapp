import type { AppLanguage, MushafToolbarSide } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ArrowLeft, ArrowRight, ChevronDown, Eye, Keyboard, Maximize, Minimize, Search } from "./icons";
import "./mushaf-reading-chrome.css";

export function MushafFocusButton({ language, onEnter }: { language: AppLanguage; onEnter: () => void }) {
  return (
    <button
      type="button"
      className="mushaf-chrome-action mushaf-focus-action"
      data-testid="mushaf-focus-toggle"
      aria-label={t(language, "mushaf.focusModeEnter")}
      onClick={onEnter}
    >
      <span className="mushaf-furniture-pill">
        <Eye size={16} aria-hidden="true" />
        {t(language, "mushaf.railFocus")}
      </span>
    </button>
  );
}

export function MushafDesktopHeader({
  language,
  direction,
  toolbarSide,
  surahName,
  juzNumber,
  isFullscreen,
  onBack,
  onToggleFullscreen,
  onSurahs,
  onJuzs,
}: {
  language: AppLanguage;
  direction: "rtl" | "ltr";
  toolbarSide: MushafToolbarSide;
  surahName: string;
  juzNumber: number;
  isFullscreen: boolean;
  onBack: () => void;
  onToggleFullscreen: () => void;
  onSurahs: () => void;
  onJuzs: () => void;
}) {
  const Back = toolbarSide === "right" ? ArrowRight : ArrowLeft;
  return (
    <div
      className="mushaf-desktop-header"
      dir={direction}
      data-back-at-start={(direction === "rtl") === (toolbarSide === "right")}
      data-testid="mushaf-desktop-header"
    >
      <div className="mushaf-header-actions">
        <button
          type="button"
          className="mushaf-chrome-action"
          onClick={onBack}
          aria-label={t(language, "common.back")}
          data-testid="mushaf-rail-back"
        >
          <Back size={20} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="mushaf-chrome-action"
          onClick={onToggleFullscreen}
          aria-label={t(language, isFullscreen ? "mushaf.exitFullscreen" : "mushaf.enterFullscreen")}
          data-testid="mushaf-fullscreen-toggle"
        >
          {isFullscreen ? <Minimize size={19} aria-hidden="true" /> : <Maximize size={19} aria-hidden="true" />}
        </button>
      </div>
      <div className="mushaf-location-controls">
        <button
          type="button"
          className="mushaf-chrome-action"
          onClick={onSurahs}
          aria-label={t(language, "mushaf.indexTitle")}
          data-testid="mushaf-rail-index"
        >
          <span className="mushaf-furniture-pill">
            <span className="mushaf-location-name">{surahName}</span>
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </button>
        <button type="button" className="mushaf-chrome-action" onClick={onJuzs} data-testid="mushaf-desktop-juz">
          <span className="mushaf-furniture-pill">
            {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
            <ChevronDown size={14} aria-hidden="true" />
          </span>
        </button>
      </div>
      <button
        type="button"
        className="mushaf-chrome-action"
        onClick={onSurahs}
        aria-label={t(language, "mushaf.searchIndex")}
        data-testid="mushaf-desktop-search"
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </div>
  );
}

export function MushafDesktopFooter({
  language,
  direction,
  firstPage,
  secondPage,
  onJump,
}: {
  language: AppLanguage;
  direction: "rtl" | "ltr";
  firstPage: number;
  secondPage?: number;
  onJump: () => void;
}) {
  const range =
    secondPage === undefined
      ? formatNumerals(firstPage, language)
      : `${formatNumerals(Math.min(firstPage, secondPage), language)}–${formatNumerals(Math.max(firstPage, secondPage), language)}`;
  return (
    <div className="mushaf-desktop-footer" dir={direction} data-testid="mushaf-desktop-footer">
      <button
        type="button"
        onClick={onJump}
        className="mushaf-chrome-action"
        aria-label={t(language, "mushaf.pagePosition", { position: range })}
        data-testid="mushaf-desktop-page-range"
      >
        <span className="mushaf-furniture-pill">
          <span className="mushaf-range-label">{t(language, "mushaf.pagesLabel")}</span>
          <bdi dir="ltr" className="tabular-nums">
            {range}
          </bdi>
        </span>
      </button>
      <p className="mushaf-key-hint">
        <Keyboard size={17} aria-hidden="true" />
        <span>{t(language, "mushaf.pageNavigation")}</span>
        <span dir="ltr" className="mushaf-keycaps">
          <kbd title={t(language, "mushaf.keyNext")}>←</kbd>
          <kbd title={t(language, "mushaf.keyPrevious")}>→</kbd>
        </span>
      </p>
    </div>
  );
}
