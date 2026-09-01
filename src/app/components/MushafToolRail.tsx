import { type ReactNode } from "react";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Bookmark,
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
  /**
   * Appended to the tooltip only, never to the accessible name.
   *
   * DEC-097 put the arrow-key behaviour in the footer as a static line. The
   * rail replaced that footer and has no room for a sentence, so the hint moves
   * to the control it describes, where a pointer user meets it on hover and a
   * screen-reader user still hears the plain action name.
   */
  hint?: string;
  icon: ReactNode;
  onClick: () => void;
  /** Renders as a switch rather than a button, and lights when on. */
  pressed?: boolean;
  disabled?: boolean;
  /** Present, false included, on any action that can be waiting. */
  busy?: boolean;
  testId?: string;
}

/**
 * The rail's own width, in pixels.
 *
 * Kept alongside the `w-15` / `w-18` classes below because a surface that docks
 * against the rail — the reading settings panel — has to know how far in to
 * start, and a Tailwind class cannot tell it. Change both together.
 */
export const MUSHAF_RAIL_WIDTH = { regular: 72, compact: 60 } as const;

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
      title={action.hint ? `${action.label} — ${action.hint}` : action.label}
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
  isPageBookmarked: boolean;
  isFullscreen: boolean;
  onBack: () => void;
  onOpenIndex: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleWordMeanings: () => void;
  onTogglePageBookmark: () => void;
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
  isPageBookmarked,
  isFullscreen,
  onBack,
  onOpenIndex,
  onPrevious,
  onNext,
  onToggleWordMeanings,
  onTogglePageBookmark,
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
      id: "page-bookmark",
      label: t(language, "mushaf.bookmarkCurrentPage"),
      caption: t(language, "mushaf.railPageBookmark"),
      icon: <Bookmark size={iconSize} className={isPageBookmarked ? "fill-current" : undefined} />,
      onClick: onTogglePageBookmark,
      pressed: isPageBookmarked,
      testId: "mushaf-rail-page-bookmark",
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
      // Deliberately a group, not a toolbar: `toolbar` promises roving arrow-key
      // focus between its controls, and in this reader the arrow keys turn the
      // page. Claiming the role and then not honouring it is the worse of the
      // two, so the rail asks for nothing it does not implement.
      role="group"
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

      {/* The rail stands on end; the book does not. A page turn is horizontal —
          right goes back towards page one, left goes onward (DEC-094) — and it
          is the same motion whether it comes from this button, the arrow keys,
          the swipe, or the footer on a phone. Up and down chevrons here gave
          one action two directional languages, and contradicted the key hint
          printed in the tooltip beside them. */}
      <nav className="flex flex-col items-stretch gap-0.5" aria-label={t(language, "mushaf.pageNavigation")}>
        <RailButton
          action={{
            id: "previous",
            label: t(language, "common.previous"),
            hint: t(language, "mushaf.keyPrevious"),
            icon: <ChevronRight size={iconSize} />,
            onClick: onPrevious,
            disabled: atFirstPage,
            testId: "mushaf-rail-previous",
          }}
        />
        {/* No numeral here. Every page prints its own folio inside its frame,
            so repeating one in the rail said the same thing twice — and beside
            a two-page spread it named only one of them, which is worse than
            saying nothing. The count stays available to assistive tech. */}
        <p className="sr-only" data-testid="mushaf-rail-page">
          {t(language, "mushaf.pageOfTotal", {
            page: formatNumerals(pageNumber, language),
            total: formatNumerals(lastPage, language),
          })}
        </p>
        <RailButton
          action={{
            id: "next",
            label: t(language, "common.next"),
            hint: t(language, "mushaf.keyNext"),
            icon: <ChevronLeft size={iconSize} />,
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
