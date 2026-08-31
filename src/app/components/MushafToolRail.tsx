import { type ReactNode } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
  Maximize,
  Minimize,
  SlidersHorizontal,
} from "./icons";

/**
 * The Mushaf's tools, stood on end beside the paper.
 *
 * On a landscape screen the scarce dimension is height, and the two horizontal
 * chrome bars spent 112px of it on controls that need no width at all. Standing
 * them in a 60–72px rail returns that height to the page — the reading surface
 * is the point of the screen, and it should be the largest thing on it.
 *
 * The rail is not a second toolbar: where it is shown, it is the only one.
 */

export interface MushafToolRailAction {
  id: string;
  /** The full action name — the accessible name and the tooltip. */
  label: string;
  /** The caption printed under the icon, abbreviated to fit a 60px rail. */
  caption?: string;
  icon: ReactNode;
  onClick: () => void;
  /** Renders as a switch rather than a button, and lights when on. */
  pressed?: boolean;
  disabled?: boolean;
  /** Present, false included, on any action that can be waiting. */
  busy?: boolean;
  testId?: string;
}

/** Rail controls share one anatomy; only the label's size steps down. */
const RAIL_CELL =
  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-lg px-0.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring";
/** Arabic ink reaches well past a 1.15 line box, so a clamped caption would
 *  crop its own descenders. */
const RAIL_LABEL = "line-clamp-2 max-w-full text-center text-[0.625rem] font-extrabold leading-[1.6]";

function RailButton({ action }: { action: MushafToolRailAction }) {
  const isToggle = action.pressed !== undefined;
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      aria-busy={action.busy}
      aria-label={action.label}
      title={action.label}
      data-testid={action.testId}
      {...(isToggle ? { role: "switch" as const, "aria-checked": action.pressed } : {})}
      className={`${RAIL_CELL} disabled:cursor-not-allowed disabled:opacity-40 ${
        action.pressed ? "bg-primary/15 text-primary" : "hover:bg-current/10"
      }`}
    >
      <span className="flex items-center justify-center" aria-hidden="true">
        {action.icon}
      </span>
      <span className={RAIL_LABEL} aria-hidden="true">
        {action.caption ?? action.label}
      </span>
    </button>
  );
}

export interface MushafToolRailProps {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  /** Which edge the rail is pinned to, so the back arrow points out of it. */
  side: "right" | "left";
  compact: boolean;
  /** The bare surah name — the rail has no room for "Surah" as well. */
  surahName: string;
  juzNumber: number;
  pageNumber: number;
  lastPage: number;
  atFirstPage: boolean;
  atLastPage: boolean;
  showWordMeanings: boolean;
  isLoadingWordMeanings: boolean;
  isPlaceSaved: boolean;
  isFullscreen: boolean;
  onBack: () => void;
  onOpenIndex: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleWordMeanings: () => void;
  onToggleSavePlace: () => void;
  onToggleFullscreen: () => void;
  onEnterFocusMode: () => void;
  onOpenSettings: () => void;
}

export function MushafToolRail({
  language,
  direction,
  side,
  compact,
  surahName,
  juzNumber,
  pageNumber,
  lastPage,
  atFirstPage,
  atLastPage,
  showWordMeanings,
  isLoadingWordMeanings,
  isPlaceSaved,
  isFullscreen,
  onBack,
  onOpenIndex,
  onPrevious,
  onNext,
  onToggleWordMeanings,
  onToggleSavePlace,
  onToggleFullscreen,
  onEnterFocusMode,
  onOpenSettings,
}: MushafToolRailProps) {
  const iconSize = compact ? 18 : 20;
  // The back arrow points away from the reading surface, which depends on the
  // edge the rail is pinned to rather than on the interface language.
  const backIcon = side === "right" ? <ArrowRight size={iconSize} /> : <ArrowLeft size={iconSize} />;

  const tools: MushafToolRailAction[] = [
    {
      id: "save-place",
      label: t(language, "mushaf.savePlace"),
      caption: t(language, "mushaf.railSavePlace"),
      icon: <MapPin size={iconSize} className={isPlaceSaved ? "fill-current" : undefined} />,
      onClick: onToggleSavePlace,
      pressed: isPlaceSaved,
      testId: "mushaf-save-place",
    },
    {
      id: "word-meanings",
      label: t(language, "mushaf.difficultWordsInvite"),
      caption: t(language, "mushaf.railMeanings"),
      icon: showWordMeanings ? <CheckCircle2 size={iconSize} /> : <BookOpen size={iconSize} />,
      onClick: onToggleWordMeanings,
      pressed: showWordMeanings,
      disabled: isLoadingWordMeanings,
      busy: isLoadingWordMeanings,
      testId: "mushaf-difficult-words-switch",
    },
    {
      id: "focus",
      label: t(language, "mushaf.focusModeEnter"),
      caption: t(language, "mushaf.railFocus"),
      icon: <Eye size={iconSize} />,
      onClick: onEnterFocusMode,
      testId: "mushaf-focus-enter",
    },
    {
      id: "fullscreen",
      label: t(language, isFullscreen ? "mushaf.exitFullscreen" : "mushaf.enterFullscreen"),
      caption: t(language, "mushaf.railFullscreen"),
      icon: isFullscreen ? <Minimize size={iconSize} /> : <Maximize size={iconSize} />,
      onClick: onToggleFullscreen,
      testId: "mushaf-fullscreen-toggle",
    },
    {
      id: "settings",
      label: t(language, "common.settings"),
      caption: t(language, "mushaf.railSettings"),
      icon: <SlidersHorizontal size={iconSize} />,
      onClick: onOpenSettings,
      testId: "mushaf-settings-trigger",
    },
  ];

  return (
    <div
      dir={direction}
      data-testid="mushaf-tool-rail"
      data-rail-side={side}
      className={`flex shrink-0 flex-col items-stretch gap-1 overflow-y-auto overscroll-contain px-1.5 py-2 ${
        compact ? "w-15" : "w-18"
      }`}
      role="toolbar"
      aria-orientation="vertical"
      aria-label={t(language, "mushaf.toolbar")}
    >
      <RailButton
        action={{
          id: "back",
          label: t(language, "common.back"),
          icon: backIcon,
          onClick: onBack,
          testId: "mushaf-rail-back",
        }}
      />

      <div className="mx-1 my-1 h-px flex-none bg-current/15" aria-hidden="true" />

      {/* The reader's place: which surah, which juz, opened for navigation. */}
      <button
        type="button"
        onClick={onOpenIndex}
        className={`${RAIL_CELL} arabic-ui px-1 hover:bg-current/10`}
        aria-label={t(language, "mushaf.indexTitle")}
        data-testid="mushaf-rail-index"
      >
        <span className={RAIL_LABEL} dir="auto">
          {surahName}
        </span>
        <span className="text-[0.625rem] font-bold leading-[1.6] opacity-70">
          {t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}
        </span>
      </button>

      {/* Up is back towards page one, down is onward — the vertical reading of
          the same physical rule the horizontal chrome follows (DEC-094). */}
      <nav className="flex flex-col items-stretch gap-0.5" aria-label={t(language, "mushaf.pageNavigation")}>
        <RailButton
          action={{
            id: "previous",
            label: t(language, "common.previous"),
            icon: <ChevronUp size={iconSize} />,
            onClick: onPrevious,
            disabled: atFirstPage,
            testId: "mushaf-rail-previous",
          }}
        />
        {/* A readout, not a control — the numeral and its unit are the visible
            text, and the full "page X of 604" is carried in the same element
            rather than in an aria-label a <p> is not allowed to have. */}
        <p className="flex min-h-9 flex-col items-center justify-center" data-testid="mushaf-rail-page">
          <bdi className="text-sm font-extrabold leading-[1.6] tabular-nums" aria-hidden="true">
            {formatNumerals(pageNumber, language)}
          </bdi>
          <span className="text-[0.625rem] font-bold leading-[1.6] opacity-70" aria-hidden="true">
            {t(language, "mushaf.railPageUnit")}
          </span>
          <span className="sr-only">
            {t(language, "mushaf.pageOfTotal", {
              page: formatNumerals(pageNumber, language),
              total: formatNumerals(lastPage, language),
            })}
          </span>
        </p>
        <RailButton
          action={{
            id: "next",
            label: t(language, "common.next"),
            icon: <ChevronDown size={iconSize} />,
            onClick: onNext,
            disabled: atLastPage,
            testId: "mushaf-rail-next",
          }}
        />
      </nav>

      <div className="mx-1 my-1 h-px flex-none bg-current/15" aria-hidden="true" />

      <div className="flex flex-col gap-0.5">
        {tools.map((action) => (
          <RailButton key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}
