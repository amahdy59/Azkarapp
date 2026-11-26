import { useId, useMemo, useState } from "react";
import { Bookmark, List, Search } from "./icons";
import { TabList, tabPanelProps } from "./Tabs";
import { learningT } from "../i18n/learning";
import { normalizeSearchText } from "../content/searchNormalization";
import { formatNumerals } from "../formatting";
import type { AppLanguage } from "../types";
import type { LearningPack } from "../learning/types";

export function LearningContents({
  language,
  direction,
  pack,
  unitId,
  bookmarks,
  linkFor,
  onNavigate,
}: {
  language: AppLanguage;
  direction: "ltr" | "rtl";
  pack: LearningPack;
  unitId?: string;
  bookmarks: string[];
  linkFor: (id: string) => string;
  onNavigate: (id: string) => void;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"contents" | "bookmarks">("contents");
  const normalized = normalizeSearchText(query);
  const entries = useMemo(
    () =>
      normalized
        ? pack.units
            .filter((unit) => normalizeSearchText(unit.text).includes(normalized))
            .map((unit) => ({ unitId: unit.id, title: unit.title }))
        : mode === "bookmarks"
          ? pack.units
              .filter((unit) => bookmarks.includes(unit.id))
              .map((unit) => ({ unitId: unit.id, title: unit.title }))
          : pack.contents,
    [normalized, mode, pack, bookmarks],
  );
  return (
    <div className="learn-contents">
      <div className="space-y-3 p-3">
        <TabList
          value={mode}
          onChange={setMode}
          direction={direction}
          idPrefix={id}
          aria-label={learningT(language, "contents")}
          className="flex flex-wrap gap-1"
          itemClassName={(selected) =>
            `flex min-h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm ${selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"} focus-visible:outline focus-visible:outline-ring`
          }
          tabs={[
            {
              value: "contents",
              label: (
                <>
                  <List size={18} aria-hidden="true" />
                  {learningT(language, "contents")}
                </>
              ),
            },
            {
              value: "bookmarks",
              label: (
                <>
                  <Bookmark size={18} aria-hidden="true" />
                  {learningT(language, "bookmarks")}
                </>
              ),
            },
          ]}
        />
        <label htmlFor={`${id}-search`} className="block text-sm font-semibold">
          {learningT(language, "search")}
        </label>
        <div className="relative">
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-3.5 text-muted-foreground"
          />
          <input
            id={`${id}-search`}
            type="search"
            dir="auto"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-describedby={`${id}-help`}
            className="min-h-11 w-full min-w-0 rounded-xl border border-border-control bg-background py-2 pe-3 ps-10 text-base text-foreground focus-visible:outline focus-visible:outline-ring"
          />
        </div>
        <p id={`${id}-help`} className="text-sm leading-relaxed text-muted-foreground">
          {learningT(language, "searchHelp")}
        </p>
        {normalized && (
          <p role="status" className="text-sm">
            {learningT(language, "results", { count: formatNumerals(entries.length, language) })}
          </p>
        )}
      </div>
      <nav {...tabPanelProps(id, mode)} aria-label={learningT(language, mode)} className="learn-contents-list">
        {!entries.length && (
          <p className="p-3 text-sm text-muted-foreground">
            {learningT(language, normalized ? "noResults" : "noBookmarks")}
          </p>
        )}
        <ol>
          {entries.map((entry, index) => (
            <li key={`${entry.unitId}-${index}`}>
              <a
                href={linkFor(entry.unitId)}
                lang={pack.language}
                dir={pack.language === "ar" ? "rtl" : "ltr"}
                aria-current={entry.unitId === unitId ? "location" : undefined}
                onClick={(event) => {
                  if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  onNavigate(entry.unitId);
                }}
              >
                {entry.title}
                <span className="text-sm text-muted-foreground">
                  {formatNumerals(Number(entry.unitId.slice(2)), language)}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
