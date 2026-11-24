import { MapPin, RefreshCw } from "./icons";
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
  return (
    <div className="home-location" data-testid="home-location">
      <div className="home-location-row">
        <p className="home-location-caption">
          <MapPin size={16} aria-hidden="true" />
          <span data-testid="home-location-caption">
            {t(language, "home.prayerLocationCaption", {
              location: deviceLocation
                ? t(language, "qibla.deviceLocation")
                : (name ?? t(language, "qibla.savedLocation")),
            })}
          </span>
          <span className="sr-only">
            {t(language, deviceLocation ? "home.devicePrayerLocation" : "qibla.savedLocation")}
          </span>
        </p>
        <div className="home-location-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSelect}
            disabled={!onSelect}
            className="home-location-change text-xs"
            aria-label={t(language, "home.chooseLocation")}
          >
            {t(language, "home.changePrayerLocation")}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={locating || !onRefresh}
            aria-busy={locating}
            onClick={(event) => onRefresh?.(event.currentTarget)}
            data-home-location-refresh
            aria-label={
              t(language, locating ? "qibla.locating" : "qibla.refreshLocation") +
              ": " +
              t(language, "qibla.useCurrentLocation")
            }
          >
            <RefreshCw size={18} aria-hidden="true" />
            <span className="home-location-refresh-label">
              {t(language, locating ? "qibla.locating" : "qibla.refreshLocation")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
