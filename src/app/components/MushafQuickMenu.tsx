import { type ReactNode } from "react";
import { ResponsiveSheet } from "./ResponsiveSheet";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import type { AppLanguage } from "../types";
import { Bookmark, BookOpen, ChevronLeft, ChevronRight, Eye, List, MapPin, SlidersHorizontal } from "./icons";

/**
 * The Mushaf's secondary actions, off the page.
 *
 * A phone has room for the page and about four controls. Everything else —
 * the index, saved places, study mode, focus, settings — belongs behind one
 * button rather than crowded into a bar the reader looks past anyway.
 */

interface QuickMenuItem {
  id: string;
  label: string;
  detail?: string;
  icon: ReactNode;
  onSelect: () => void;
  pressed?: boolean;
  disabled?: boolean;
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
  isPlaceSaved: boolean;
  isPageBookmarked: boolean;
  onOpenIndex: () => void;
  onOpenBookmarks: () => void;
  onToggleWordMeanings: () => void;
  onToggleSavePlace: () => void;
  onTogglePageBookmark: () => void;
  onEnterFocusMode: () => void;
  onOpenSettings: () => void;
}

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
  isPlaceSaved,
  isPageBookmarked,
  onOpenIndex,
  onOpenBookmarks,
  onToggleWordMeanings,
  onToggleSavePlace,
  onTogglePageBookmark,
  onEnterFocusMode,
  onOpenSettings,
}: MushafQuickMenuProps) {
  const items: QuickMenuItem[] = [
    {
      id: "index",
      label: t(language, "mushaf.indexTitle"),
      detail: `${surahName} · ${t(language, "mushaf.juzLabel", { juz: formatNumerals(juzNumber, language) })}`,
      icon: <List size={19} aria-hidden="true" />,
      onSelect: onOpenIndex,
      testId: "mushaf-quick-index",
    },
    {
      id: "bookmarks",
      label: t(language, "mushaf.tabBookmarks"),
      icon: <Bookmark size={19} aria-hidden="true" />,
      onSelect: onOpenBookmarks,
      testId: "mushaf-quick-bookmarks",
    },
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
      id: "save-place",
      label: t(language, "mushaf.savePlace"),
      icon: <MapPin size={19} aria-hidden="true" className={isPlaceSaved ? "fill-current" : undefined} />,
      onSelect: onToggleSavePlace,
      pressed: isPlaceSaved,
      testId: "mushaf-quick-save-place",
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
    {
      id: "focus",
      label: t(language, "mushaf.focusMode"),
      detail: t(language, "mushaf.focusModeHint"),
      icon: <Eye size={19} aria-hidden="true" />,
      onSelect: onEnterFocusMode,
      testId: "mushaf-quick-focus",
    },
    {
      id: "settings",
      label: t(language, "mushaf.readingSettings"),
      icon: <SlidersHorizontal size={19} aria-hidden="true" />,
      onSelect: onOpenSettings,
      testId: "mushaf-quick-settings",
    },
  ];

  const Chevron = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <ResponsiveSheet
      open={open}
      onClose={onClose}
      title={t(language, "mushaf.moreActions")}
      direction={direction}
      testId="mushaf-quick-menu"
      maxWidthClassName="max-w-sm"
    >
      <div className="flex flex-col gap-1 p-3" dir={direction}>
        <h2 className="px-2 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t(language, "mushaf.moreActions")}
        </h2>
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
                onClose();
              }}
              className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl px-3 py-2 text-start transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:opacity-50 ${
                item.pressed ? "bg-primary/10 text-primary" : ""
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                  item.pressed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {item.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold leading-tight">{item.label}</span>
                {item.detail && (
                  <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">{item.detail}</span>
                )}
              </span>
              {!isToggle && <Chevron size={16} className="shrink-0 opacity-40" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </ResponsiveSheet>
  );
}
