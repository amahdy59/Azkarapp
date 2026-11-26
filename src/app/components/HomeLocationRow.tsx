import { useId } from "react";
import { ChevronDown, Locate, MapPin } from "./icons";
import { Button } from "./ui/button";
import { t } from "../i18n";
import type { AppLanguage } from "../types";

export function HomeLocationRow({
  language,
  name,
  deviceLocation,
  locating,
  onSelect,
  onRefresh,
}: {
  language: AppLanguage;
  name?: string;
  deviceLocation: boolean;
  locating: boolean;
  onSelect?: () => void;
  onRefresh?: (trigger: HTMLButtonElement) => void;
}) {
  const descriptionId = useId();
  const label = name?.trim() || t(language, deviceLocation ? "qibla.deviceLocation" : "qibla.savedLocation");
  const changeLabel = `${t(language, "home.chooseLocation")}: ${label}`;
  const locateLabel = t(language, locating ? "qibla.locating" : "qibla.useCurrentLocation");
  return (
    <div className="home-location" data-testid="home-location">
      <div className="home-location-row">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelect}
          disabled={!onSelect}
          className="home-location-change"
          aria-label={changeLabel}
          aria-describedby={descriptionId}
          title={changeLabel}
        >
          <MapPin size={16} aria-hidden="true" />
          <span className="home-location-caption" data-testid="home-location-caption">
            {label}
          </span>
          <ChevronDown size={14} aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="home-location-detect"
          disabled={locating || !onRefresh}
          aria-busy={locating}
          onClick={(event) => onRefresh?.(event.currentTarget)}
          data-home-location-refresh
          aria-label={locateLabel}
          title={locateLabel}
        >
          <Locate size={18} aria-hidden="true" />
        </Button>
      </div>
      <span className="sr-only" id={descriptionId}>
        {t(language, deviceLocation ? "home.devicePrayerLocation" : "qibla.savedLocation")}
      </span>
      <span className="sr-only" role="status">
        {locating ? locateLabel : ""}
      </span>
    </div>
  );
}
