import { t } from "../i18n";
import type { AppLanguage } from "../types";

/**
 * The Mushaf's keys, in one place.
 *
 * The reading settings panel and the rail's help control both show this list.
 * Kept as one definition because two copies drift: a key added to the handler
 * and to only one of the two lists is worse than no list at all, since a
 * reader then has a printed answer that is wrong.
 *
 * Order follows the reading act — turn, jump, then the modes — rather than the
 * order the handler happens to test the keys in.
 */
export const MUSHAF_SHORTCUTS = [
  ["→ / Page Up", "common.previous"],
  ["← / Page Down", "common.next"],
  ["Home", "mushaf.keyFirstPage"],
  ["End", "mushaf.keyLastPage"],
  ["F", "mushaf.focusMode"],
  ["Space", "mushaf.listenSurah"],
  ["Esc", "common.back"],
] as const;

/**
 * `dl` rather than a table: each row is a term and its description, which is
 * what a screen reader should hear, and the key itself stays `dir="ltr"` so a
 * right-to-left interface does not reorder "→ / Page Up".
 */
export function MushafKeyboardShortcutList({ language }: { language: AppLanguage }) {
  return (
    <dl className="flex flex-col gap-1.5 text-[0.75rem]">
      {MUSHAF_SHORTCUTS.map(([key, labelKey]) => (
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
  );
}
