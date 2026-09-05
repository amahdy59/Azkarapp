import { useMemo } from "react";
import { ScreenContainer } from "../components/ScreenContainer";
import { Header } from "../components/LayoutShells";
import { PRAYER_ICON, PrayerMomentPanel } from "../components/PrayerMomentPanel";
import { t } from "../i18n";
import { PRAYER_NAMES, formatPrayerTimeLabel, getEstimatedPrayerTimes } from "../content/prayerTimes";
import type { AppLanguage, LocationSettings, PrayerName, PrayerTrackingRecord } from "../types";

export function PrayerMomentScreen({
  prayer,
  language,
  direction,
  records,
  dayKey,
  locationSettings,
  now = new Date(),
  onBack,
  onToggle,
  onOpenAdhkar,
  onSelectPrayer,
}: {
  prayer: PrayerName;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey: string;
  locationSettings?: LocationSettings;
  /** Injected so the screen's states can be held to a fixed clock in a test. */
  now?: Date;
  onBack: () => void;
  onToggle: (
    prayer: PrayerName,
    field: "location" | "adhkar" | "sunnah",
    value: boolean | "mosque" | "home" | null,
  ) => void;
  onOpenAdhkar: (prayer: PrayerName) => void;
  onSelectPrayer: (prayer: PrayerName) => void;
}) {
  const times = useMemo(() => getEstimatedPrayerTimes(now, locationSettings), [locationSettings, now]);
  const isArabic = language === "ar";
  const name = t(language, `notifications.${prayer}`);

  return (
    <ScreenContainer dir={direction} screenName={name} data-testid="prayer-moment-screen" data-prayer={prayer}>
      <Header title={name} onBack={onBack} language={language} />

      {/* A scrolling column, so its children keep their own height and the
          column scrolls past them. Without `shrink-0` the flex algorithm takes
          the overflow out of whichever child is allowed to give — and the hero
          is, because clipping the scene to its corners means `overflow: hidden`,
          which switches off the automatic minimum size. It collapsed from 150px
          to 37px with the sky and half the type cropped inside it.

          From the tablet tier it becomes a two-column grid inside the shared
          content measure. `auto-rows-min` and `content-start` are what keep it
          a page rather than a poster: a grid whose rows may stretch will spread
          three rows of content down a 900px desk screen, leaving 150px of empty
          card between every band. */}
      <div className="page-content-center flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6 [&>*]:shrink-0 md:grid md:content-start md:grid-cols-2 md:gap-4">
        <PrayerMomentPanel
          prayer={prayer}
          language={language}
          direction={direction}
          records={records}
          dayKey={dayKey}
          locationSettings={locationSettings}
          now={now}
          onToggle={onToggle}
          onOpenAdhkar={onOpenAdhkar}
        />

        {/* The day's five, so this screen is never a dead end. Home has its own
            tracker cards for the same purpose, which is why the strip belongs
            to the screen rather than to the shared panel. */}
        <nav
          className="mt-1 flex items-stretch justify-between gap-1 rounded-2xl border border-border bg-card p-1.5 md:col-span-2"
          aria-label={t(language, "prayerMoment.dayTitle")}
          data-testid="prayer-moment-strip"
        >
          {PRAYER_NAMES.map((item) => {
            const ItemIcon = PRAYER_ICON[item];
            const current = item === prayer;
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelectPrayer(item)}
                aria-current={current ? "true" : undefined}
                data-testid={`prayer-strip-${item}`}
                className={`flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
                  current ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <ItemIcon size={18} aria-hidden="true" />
                <span className="text-micro font-black">{t(language, `notifications.${item}`)}</span>
                <span className="text-micro font-semibold tabular-nums" dir="auto">
                  {formatPrayerTimeLabel(times[item], isArabic)}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </ScreenContainer>
  );
}
