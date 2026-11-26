import { useId, useMemo, useState } from "react";
import * as RadioGroup from "@radix-ui/react-radio-group";
import type { AuthenticZikrItem } from "../content/authenticAzkar";
import type { AppLanguage } from "../types";
import { formatNumerals } from "../formatting";
import { t } from "../i18n";
import { ResponsiveSheet, SheetHeader } from "./ResponsiveSheet";
import { ChoiceRadioItem } from "./ChoiceRadioItem";
import { FIELD_CONTROL_CLASS, FIELD_LABEL_CLASS } from "./FormField";
import { normalizeDhikrSearch } from "./masbahaControls";
import { Button } from "./ui/button";
import { X } from "./icons";
import "./masbaha.css";

/** Screen-owned persistence is invoked only by Continue, never by row selection. */
export function MasbahaDhikrSheet({
  items,
  current,
  savedItems,
  language,
  direction,
  onContinue,
  onClose,
}: {
  items: readonly AuthenticZikrItem[];
  current: AuthenticZikrItem;
  savedItems: Record<string, { count: number; target: number }>;
  language: AppLanguage;
  direction: "rtl" | "ltr";
  onContinue: (item: AuthenticZikrItem) => void;
  onClose: () => void;
}) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [candidate, setCandidate] = useState(current.id);
  const filtered = useMemo(() => {
    const terms = normalizeDhikrSearch(query).split(/\s+/u).filter(Boolean);
    return items.filter((item) => {
      const searchable = normalizeDhikrSearch(
        `${item.textAr} ${item.textEn} ${item.shortNameAr} ${item.shortNameEn} ${item.categoryNameAr} ${item.categoryNameEn}`,
      );
      return terms.every((term) => searchable.includes(term));
    });
  }, [items, query]);
  const selected = filtered.find((item) => item.id === candidate);
  return (
    <ResponsiveSheet
      open
      onClose={onClose}
      title={t(language, "counter.chooseDhikr")}
      language={language}
      direction={direction}
      showCloseButton={false}
      focusOnOpen
      testId="masbaha-dhikr-sheet"
      drawerClassName="masbaha-sheet"
      dialogClassName="masbaha-sheet"
    >
      <SheetHeader
        title={t(language, "counter.chooseDhikr")}
        onClose={onClose}
        language={language}
        direction={direction}
      />
      <div className="masbaha-search">
        <label htmlFor={searchId} className={FIELD_LABEL_CLASS}>
          {t(language, "counter.searchLabel")}
        </label>
        <div className="relative">
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`${FIELD_CONTROL_CLASS} pe-12`}
            placeholder={t(language, "counter.searchDhikrPlaceholder")}
            autoComplete="off"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-0 top-0"
              aria-label={t(language, "common.clear")}
              onClick={() => setQuery("")}
            >
              <X aria-hidden="true" />
            </Button>
          )}
        </div>
      </div>
      <div className="masbaha-sheet-body">
        {filtered.length ? (
          <RadioGroup.Root
            value={candidate}
            onValueChange={setCandidate}
            dir={direction}
            aria-label={t(language, "counter.chooseDhikr")}
            className="masbaha-dhikr-choices"
          >
            {filtered.map((item) => {
              const saved = savedItems[item.id];
              const label = language === "ar" ? item.textAr : item.textEn;
              return (
                <ChoiceRadioItem
                  key={item.id}
                  value={item.id}
                  className="masbaha-dhikr-choice"
                  data-testid={`zikr-option-${item.id}`}
                >
                  <span className="min-w-0 w-full text-start">
                    <span className="block leading-relaxed" lang={language} dir="auto">
                      {label}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                      {item.id === current.id && <span>{t(language, "counter.currentDhikr")}</span>}
                      {saved && saved.count > 0 && (
                        <bdi>
                          {t(language, "counter.savedCount", {
                            count: formatNumerals(saved.count, language),
                            target: formatNumerals(saved.target, language),
                          })}
                        </bdi>
                      )}
                    </span>
                  </span>
                </ChoiceRadioItem>
              );
            })}
          </RadioGroup.Root>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p role="status">{t(language, "counter.noDhikrResults")}</p>
            <Button variant="outline" onClick={() => setQuery("")}>
              {t(language, "counter.clearSearch")}
            </Button>
          </div>
        )}
      </div>
      <div className="masbaha-sheet-footer">
        <Button
          className="w-full"
          disabled={!selected}
          onClick={() => {
            if (selected) onContinue(selected);
          }}
        >
          {t(language, "common.continue")}
        </Button>
      </div>
    </ResponsiveSheet>
  );
}
