import { useId, type Ref } from "react";
import { FIELD_CONTROL_CLASS, FIELD_LABEL_CLASS } from "./FormField";
import { MapPin } from "./icons";
import { t } from "../i18n";
import type { PrayerLocationPreset } from "../content/prayerLocations";
import type { AppLanguage } from "../types";
import "./prayer-settings.css";

/** Prepared offline results; the owning screen selects and saves the location. */
export function PrayerCitySearch({
  language,
  query,
  onQueryChange,
  results,
  onSelect,
  selectedId,
  inputRef,
  emptyMessage,
  resultsLabel,
  searchLabel,
}: {
  language: AppLanguage;
  query: string;
  onQueryChange: (value: string) => void;
  results: PrayerLocationPreset[];
  onSelect: (city: PrayerLocationPreset) => void;
  selectedId?: string;
  inputRef?: Ref<HTMLInputElement>;
  emptyMessage?: string;
  resultsLabel?: string;
  searchLabel?: string;
}) {
  const id = useId();
  return (
    <>
      <div className="prayer-settings-search shrink-0 space-y-2 px-5 py-3">
        <label htmlFor={id} className={FIELD_LABEL_CLASS}>
          {searchLabel ?? t(language, "notifications.citySearchLabel")}
        </label>
        <input
          ref={inputRef}
          id={id}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t(language, "notifications.citySearchPlaceholder")}
          className={FIELD_CONTROL_CLASS}
          aria-describedby={`${id}-hint`}
        />
        <p id={`${id}-hint`} className="sr-only">
          {t(language, "notifications.citySearchHint")}
        </p>
      </div>
      <div className="min-h-0 overflow-y-auto overscroll-contain px-3 pb-3" data-vaul-no-drag>
        <p className="px-2 pb-2 text-xs font-semibold text-muted-foreground">
          {resultsLabel ?? t(language, query.trim() ? "notifications.cityResults" : "notifications.popularCities")}
        </p>
        {results.length ? (
          <ul className="space-y-1">
            {results.map((city) => (
              <li key={city.id}>
                <button
                  type="button"
                  onClick={() => onSelect(city)}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-ring"
                  aria-pressed={selectedId === city.id}
                >
                  <MapPin size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {language === "ar" ? city.nameArabic : city.nameEnglish}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {language === "ar" ? city.countryArabic : city.countryEnglish}
                    </span>
                  </span>
                  {selectedId === city.id && (
                    <span className="ms-auto shrink-0 text-xs text-primary">
                      {t(language, "prayerLocation.current")}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="px-2 py-4 text-label leading-relaxed text-muted-foreground">
            {emptyMessage ?? t(language, "prayerLocation.noCitiesFound")}
          </p>
        )}
      </div>
    </>
  );
}
