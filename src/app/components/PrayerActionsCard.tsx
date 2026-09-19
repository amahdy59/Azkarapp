import { useMemo, useState } from "react";
import { BookOpen, CloudSun, Info, MoonStar, Mosque, PrayerRug, Sun, Sunrise, Sunset } from "./icons";
import { TrackingCheckMark } from "./PrayerTrackerCards";
import { Modal } from "./ResponsiveSheet";
import { t } from "../i18n";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";

const PRAYER_ICON: Record<PrayerName, typeof Sunrise> = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: CloudSun,
  maghrib: Sunset,
  isha: MoonStar,
};
import { getPrayerActions, getPrayerInfoData } from "../content/prayerActions";
import type { PrayerTrackingWrite } from "./PrayerTrackerCards";

export interface PrayerActionsCardProps {
  prayer: PrayerName;
  language: AppLanguage;
  direction?: "ltr" | "rtl";
  records: readonly PrayerTrackingRecord[];
  dayKey?: string;
  canRecord?: boolean;
  onToggle: (prayer: PrayerName, field: PrayerTrackingWrite, value: boolean | "mosque" | "home" | null) => void;
  onOpenAdhkar: (prayer: PrayerName) => void;
  onGlass?: boolean;
  className?: string;
}

/**
 * Universal, data-driven Prayer Actions Card for all five daily prayers.
 *
 * Visual design:
 * - Frosted glass pill checklist rows
 * - RTL order: [Icon on far right] -> [Action label] -> [Checkbox on far left]
 * - Strictly one line per item without subtitle clutter
 * - Header with Mosque icon + dynamic title + secondary "More Info" button
 * - Educational Sunnah bottom sheet with rak'ah breakdown, rank, and authentic hadith evidence
 * - Prominent full-width gold CTA to start adhkar
 */
export function PrayerActionsCard({
  prayer,
  language,
  direction = "rtl",
  records,
  dayKey,
  canRecord = true,
  onToggle,
  onOpenAdhkar,
  onGlass = false,
  className = "",
}: PrayerActionsCardProps) {
  const [infoOpen, setInfoOpen] = useState(false);
  const isArabic = language === "ar";

  const record = useMemo(
    () => records.find((r) => (!dayKey || r.dayKey === dayKey) && r.prayer === prayer),
    [dayKey, prayer, records],
  );

  const actions = useMemo(() => getPrayerActions({ prayer, language, record }), [prayer, language, record]);

  const infoData = useMemo(() => getPrayerInfoData(prayer, language), [prayer, language]);

  const titleColor = onGlass ? "text-on-media" : "text-foreground";

  return (
    <section
      data-testid="prayer-actions-card"
      data-prayer={prayer}
      aria-labelledby={`prayer-actions-heading-${prayer}`}
      className={`flex flex-col gap-3 p-5 sm:p-6 ${className}`}
    >
      {/* Header: Prayer Icon + Heading + More Info Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              onGlass
                ? "border border-white/20 bg-on-media-surface/60 text-on-media-accent"
                : "bg-primary/15 text-primary"
            }`}
          >
            {(() => {
              const HeaderIcon = PRAYER_ICON[prayer] ?? Mosque;
              return <HeaderIcon size={20} />;
            })()}
          </span>
          <h3
            id={`prayer-actions-heading-${prayer}`}
            className={`truncate text-subtitle font-black ${onGlass ? "text-on-media-accent" : titleColor}`}
            dir="auto"
          >
            {t(language, "prayerActions.heading", { prayer: infoData.prayerName })}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setInfoOpen(true)}
          data-testid="prayer-actions-more-info"
          aria-label={t(language, "prayerActions.moreInfoAria", { prayer: infoData.prayerName })}
          className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            onGlass
              ? "border-white/20 bg-on-media-surface/60 text-white backdrop-blur-md hover:border-white/40 hover:bg-on-media-surface/60"
              : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Info size={16} aria-hidden="true" />
          <span>{t(language, "prayerActions.moreInfo")}</span>
        </button>
      </div>

      {/* Main Checklist: 1 line per item, floating frosted glass pill */}
      <ol className="flex flex-col gap-2">
        {actions.map((action) => {
          const ItemIcon = action.Icon;
          const inputId = `prayer-action-${prayer}-${action.id}`;
          const labelId = `prayer-action-label-${prayer}-${action.id}`;

          return (
            <li
              key={action.id}
              data-testid={action.testId}
              className={`group/item relative flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-colors duration-fast ${
                onGlass
                  ? "border border-white/20 bg-on-media-surface/60 text-white hover:border-white/40 hover:bg-on-media-surface/60"
                  : "border border-border/60 bg-card hover:bg-muted/40 text-foreground"
              }`}
            >
              {/* Overlay transparent checkbox spanning full row for accessibility & 48px hit target */}
              <input
                id={inputId}
                type="checkbox"
                disabled={!canRecord}
                checked={action.checked}
                onChange={(event) => {
                  if (!canRecord) return;
                  const next = event.currentTarget.checked;
                  if (action.id === "congregation") {
                    onToggle(prayer, "location", next ? "mosque" : null);
                  } else {
                    onToggle(prayer, action.field, next);
                  }
                }}
                aria-labelledby={labelId}
                className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-2xl opacity-0 disabled:cursor-not-allowed"
              />

              {/* Start: Icon on far right (RTL) / far left (LTR) + 1-line label */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    onGlass
                      ? "border border-white/15 bg-on-media-surface/60 text-on-media-accent"
                      : "border border-border/60 bg-muted text-primary"
                  }`}
                >
                  <ItemIcon size={19} />
                </span>
                <span
                  id={labelId}
                  className={`truncate text-base font-bold ${onGlass ? "text-white" : titleColor}`}
                  dir="auto"
                >
                  {action.label}
                </span>
              </div>

              {/* End: Circular tracking checkmark on far left (RTL) / far right (LTR) */}
              <TrackingCheckMark checked={action.checked} onGlass={onGlass} />
            </li>
          );
        })}
      </ol>

      {/* Dominant Primary Action: Golden Pill CTA */}
      <button
        type="button"
        onClick={() => onOpenAdhkar(prayer)}
        data-testid="prayer-open-adhkar"
        className="mt-2 flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-lg font-black text-primary-foreground shadow-raised transition-colors duration-fast hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <BookOpen size={22} aria-hidden="true" />
        <span>{t(language, "prayerActions.startAdhkar")}</span>
      </button>

      {/* Educational More Info Bottom Sheet */}
      {infoOpen && (
        <Modal
          open
          onClose={() => setInfoOpen(false)}
          title={infoData.modalTitle}
          direction={direction}
          testId="prayer-actions-info-modal"
          maxWidthClassName="max-w-lg"
          onGlass={onGlass}
        >
          <div className="flex max-h-[75vh] flex-col gap-4 overflow-y-auto px-5 py-4 text-start">
            <div
              className={`flex items-center justify-between border-b pb-3 pe-12 ${onGlass ? "border-white/20" : "border-border/40"}`}
            >
              <h3 className={`text-base font-black ${onGlass ? "text-white" : "text-foreground"}`} dir="auto">
                {infoData.modalTitle}
              </h3>
            </div>

            {/* Rawatib Virtue Foundation Banner */}
            {infoData.rawatibVirtue && (
              <aside
                className={`flex flex-col gap-2 rounded-2xl p-4 ${
                  onGlass
                    ? "border border-white/20 bg-on-media-surface/60 text-white"
                    : "border border-primary/30 bg-primary/10"
                }`}
                data-testid="rawatib-virtue-banner"
              >
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className={`flex size-7 items-center justify-center rounded-lg ${
                      onGlass
                        ? "border border-white/15 bg-on-media-surface/60 text-on-media-accent"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    <PrayerRug size={16} />
                  </span>
                  <h4
                    className={`text-sm font-black sm:text-base ${onGlass ? "text-white" : "text-primary"}`}
                    dir="auto"
                  >
                    {infoData.rawatibVirtue.title}
                  </h4>
                </div>
                <p
                  className={`text-xs font-semibold leading-relaxed sm:text-sm ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
                  dir="auto"
                >
                  {infoData.rawatibVirtue.description}
                </p>
                <blockquote
                  className={`mt-1 rounded-xl p-3 ${
                    onGlass
                      ? "border border-white/20 bg-on-media-surface/60 text-white"
                      : "border border-primary/20 bg-card"
                  }`}
                  dir={isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "rtl" : "ltr"}
                >
                  <p
                    className={`text-sm font-bold leading-loose ${onGlass ? "text-white" : "text-foreground"} ${
                      isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "zikr-text" : ""
                    }`}
                    lang={isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "ar" : "en"}
                  >
                    {isArabic
                      ? infoData.rawatibVirtue.evidence.textArabic
                      : (infoData.rawatibVirtue.evidence.textEnglish ?? infoData.rawatibVirtue.evidence.textArabic)}
                  </p>
                  <footer
                    className={`mt-1 text-micro font-semibold ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
                  >
                    {isArabic
                      ? infoData.rawatibVirtue.evidence.referenceArabic
                      : infoData.rawatibVirtue.evidence.referenceEnglish}
                  </footer>
                </blockquote>
              </aside>
            )}

            {infoData.sunnahItems.length === 0 ? (
              <p
                className={`text-center text-sm font-medium ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
                dir="auto"
              >
                {t(language, "prayerMoment.statusNow")}
              </p>
            ) : (
              infoData.sunnahItems.map((item, idx) => (
                <article
                  key={`${item.position}-${idx}`}
                  className={`flex flex-col gap-2.5 rounded-2xl p-4 ${
                    onGlass
                      ? "border border-white/20 bg-on-media-surface/60 text-white"
                      : "border border-border/80 bg-muted/30"
                  }`}
                >
                  {/* Category Header & Badges */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 ${
                      onGlass ? "border-white/20" : "border-border/60"
                    }`}
                  >
                    <h4
                      className={`text-sm font-black sm:text-base ${onGlass ? "text-white" : "text-foreground"}`}
                      dir="auto"
                    >
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-micro font-black sm:text-xs ${
                          onGlass
                            ? "border border-white/15 bg-on-media-surface/60 text-white"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {item.rakahsLabel}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-micro font-bold sm:text-xs ${
                          item.rank === "confirmed"
                            ? onGlass
                              ? "border border-success bg-success/15 text-success"
                              : "bg-success/15 text-success"
                            : onGlass
                              ? "border border-white/15 bg-on-media-surface/60 text-white/90"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.rankLabel}
                      </span>
                    </div>
                  </div>

                  {/* Short Explanation */}
                  <p
                    className={`text-xs font-semibold leading-relaxed sm:text-sm ${onGlass ? "text-white/80" : "text-muted-foreground"}`}
                    dir="auto"
                  >
                    {item.description}
                  </p>

                  {/* Supporting Hadith Evidence - rendered only when distinct from the overarching rawatib banner */}
                  {item.sunnah.evidence &&
                    item.sunnah.evidence.textArabic !== infoData.rawatibVirtue?.evidence.textArabic && (
                      <blockquote
                        className={`mt-1 rounded-xl p-3 ${
                          onGlass
                            ? "border border-white/20 bg-on-media-surface/60 text-white"
                            : "border border-primary/20 bg-primary/5"
                        }`}
                        dir={isArabic || !item.sunnah.evidence.textEnglish ? "rtl" : "ltr"}
                      >
                        <p
                          className={`text-sm font-bold leading-loose ${onGlass ? "text-white" : "text-foreground"} ${
                            isArabic || !item.sunnah.evidence.textEnglish ? "zikr-text" : ""
                          }`}
                          lang={isArabic || !item.sunnah.evidence.textEnglish ? "ar" : "en"}
                        >
                          {isArabic
                            ? item.sunnah.evidence.textArabic
                            : (item.sunnah.evidence.textEnglish ?? item.sunnah.evidence.textArabic)}
                        </p>
                        <footer
                          className={`mt-2 flex flex-wrap items-center justify-between gap-2 text-micro font-semibold ${
                            onGlass ? "text-white/70" : "text-muted-foreground"
                          }`}
                        >
                          <span>
                            {isArabic ? item.sunnah.evidence.referenceArabic : item.sunnah.evidence.referenceEnglish}
                          </span>
                          {(isArabic ? item.sunnah.evidence.gradingArabic : item.sunnah.evidence.gradingEnglish) && (
                            <span className={`font-bold ${onGlass ? "text-on-media-accent" : "text-primary"}`}>
                              {isArabic ? item.sunnah.evidence.gradingArabic : item.sunnah.evidence.gradingEnglish}
                            </span>
                          )}
                        </footer>
                      </blockquote>
                    )}
                </article>
              ))
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}
