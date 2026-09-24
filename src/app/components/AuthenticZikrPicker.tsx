import { useMemo, useState } from "react";
import type { AuthenticZikrItem } from "../content/authenticAzkar";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { FormField } from "./FormField";
import { Check, ChevronDown, Lightbulb, Search } from "./icons";
import { Modal } from "./ResponsiveSheet";

function searchableText(item: AuthenticZikrItem) {
  return [item.textAr, item.textEn, item.categoryNameAr, item.categoryNameEn, item.virtueAr, item.virtueEn]
    .join(" ")
    .toLocaleLowerCase();
}

export function AuthenticZikrPicker({
  items,
  selected,
  language,
  direction,
  onSelect,
}: {
  items: readonly AuthenticZikrItem[];
  selected: AuthenticZikrItem;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onSelect: (item: AuthenticZikrItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return normalizedQuery ? items.filter((item) => searchableText(item).includes(normalizedQuery)) : items;
  }, [items, query]);

  const selectedText = language === "ar" ? selected.textAr : selected.textEn;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="interactive-elem flex min-h-11 w-full items-center justify-between gap-2 overflow-hidden rounded-2xl border border-border-control bg-card px-3 text-label font-bold text-foreground shadow-xs transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring sm:px-4 sm:text-sm"
      >
        <span className="min-w-0 flex-1 truncate text-start" dir="auto">
          {selectedText}
        </span>
        <ChevronDown size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          title={t(language, "counter.chooseDhikr")}
          direction={direction}
          language={language}
          maxWidthClassName="max-w-xl"
          className="p-5 sm:p-6"
        >
          <div className="space-y-4">
            <div className="pe-10">
              <h2 className="text-lg font-black text-foreground">{t(language, "counter.chooseDhikr")}</h2>
              <p className="mt-1 text-label font-semibold leading-6 text-muted-foreground">
                {t(language, "counter.chooseDhikrHint")}
              </p>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute end-3 top-[2.2rem] z-10 text-muted-foreground"
                aria-hidden="true"
              />
              <FormField
                type="search"
                label={t(language, "counter.searchDhikr")}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={t(language, "counter.searchDhikrPlaceholder")}
                autoComplete="off"
                lang={language}
                dir={query.trim() ? "auto" : direction}
                controlClassName="pe-11"
              />
            </div>

            <fieldset className="min-w-0">
              <legend className="sr-only">{t(language, "counter.chooseDhikr")}</legend>
              <div className="max-h-[min(26rem,55vh)] space-y-2 overflow-y-auto pe-1">
                {filteredItems.map((item) => {
                  const checked = item.id === selected.id;
                  const text = language === "ar" ? item.textAr : item.textEn;
                  const benefit = language === "ar" ? item.virtueAr : item.virtueEn;
                  return (
                    <label
                      key={item.id}
                      className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border p-3 text-start transition-colors focus-within:ring-[3px] focus-within:ring-ring ${
                        checked ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="authentic-zikr"
                        value={item.id}
                        checked={checked}
                        onChange={() => {
                          onSelect(item);
                          setOpen(false);
                          setQuery("");
                        }}
                        className="sr-only"
                      />
                      <span
                        className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          checked
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border-control bg-background text-transparent"
                        }`}
                        aria-hidden="true"
                      >
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black leading-7 text-foreground" dir="auto">
                          {text}
                        </span>
                        <span className="mt-1 flex items-start gap-2 text-xs font-semibold leading-5 text-muted-foreground">
                          <Lightbulb size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                          <span className="line-clamp-2" dir="auto">
                            {benefit}
                          </span>
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {filteredItems.length === 0 && (
              <p className="rounded-2xl border border-border bg-muted/40 p-4 text-center text-sm font-semibold text-muted-foreground">
                {t(language, "counter.noDhikrResults")}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
