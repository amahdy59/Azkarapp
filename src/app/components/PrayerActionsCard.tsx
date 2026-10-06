import { useMemo, useState, type ReactNode } from "react";
import { BookOpen, ChevronDown, Info, PrayerRug } from "./icons";
import { TrackingCheckMark } from "./PrayerTrackerCards";
import { Modal, SheetHeader } from "./ResponsiveSheet";
import { t } from "../i18n";
import { formatNumerals } from "../formatting";
import type { AppLanguage, PrayerName, PrayerTrackingRecord } from "../types";

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
  /** Context and reviewed evidence compose into the same reading surface. */
  status?: ReactNode;
  showProgress?: boolean;
  headingLevel?: 2 | 3;
  children?: ReactNode;
}

/**
 * Universal, data-driven Prayer Actions Card for all five daily prayers.
 *
 * Visual design:
 * - Plain, wrapping checklist rows with full-row native checkbox targets
 * - RTL order: [Action label] -> [Checkbox on far left]
 * - One dynamic heading and a secondary information action
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
  status,
  showProgress = false,
  headingLevel = 3,
  children,
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
  const Heading = headingLevel === 2 ? "h2" : "h3";

  return (
    <section
      data-testid="prayer-actions-card"
      data-prayer={prayer}
      aria-labelledby={`prayer-actions-heading-${prayer}`}
      dir={direction}
      className={`flex min-w-0 flex-col gap-3 p-4 sm:p-5 ${className}`}
    >
      {/* One heading and a quiet information action. */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Heading
            id={`prayer-actions-heading-${prayer}`}
            className={`text-title font-bold leading-relaxed ${titleColor}`}
            dir="auto"
          >
            {t(language, "prayerActions.heading", { prayer: infoData.prayerName })}
          </Heading>
        </div>

        <button
          type="button"
          onClick={(event) => {
            // Safari pointer activation does not focus buttons by default.
            // The sheet must capture this trigger, not the previous checkbox.
            event.currentTarget.focus();
            setInfoOpen(true);
          }}
          data-testid="prayer-actions-more-info"
          aria-haspopup="dialog"
          aria-label={t(language, "prayerActions.moreInfoAria", { prayer: infoData.prayerName })}
          className={`flex size-11 -me-3 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring ${
            onGlass ? "text-on-media hover:bg-white/10" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full border-2">
            <Info size={14} />
          </span>
        </button>
      </div>
      {(status || showProgress) && (
        <div
          className={`flex flex-wrap items-start justify-between gap-x-3 gap-y-1 text-label ${onGlass ? "text-on-media-muted" : "text-muted-foreground"}`}
        >
          {status}
          {showProgress && (
            <output
              aria-live="polite"
              aria-atomic="true"
              className="leading-relaxed"
              data-testid="prayer-actions-progress"
            >
              {t(language, "prayerActions.completedCount", {
                count: formatNumerals(actions.filter((action) => action.checked).length, language),
                total: formatNumerals(actions.length, language),
              })}
            </output>
          )}
        </div>
      )}
      {children}

      {/* Plain rows grow naturally with wrapped labels, retaining 44px targets. */}
      <ol className="flex flex-col">
        {actions.map((action) => {
          const inputId = `prayer-action-${prayer}-${action.id}`;
          const labelId = `prayer-action-label-${prayer}-${action.id}`;

          return (
            <li
              key={action.id}
              data-testid={action.testId}
              className={`group/item relative -mx-2 flex min-h-11 items-center justify-between gap-3 rounded-xl px-2 py-1 transition-colors duration-fast ${
                onGlass
                  ? "text-white hover:bg-white/10 active:bg-white/15"
                  : "text-foreground hover:bg-muted/50 active:bg-muted/70"
              }`}
            >
              {/* Overlay transparent checkbox spanning full row for accessibility & 44px+ hit target */}
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
                className="tracking-choice peer absolute inset-0 m-0 h-full w-full cursor-pointer appearance-none rounded-xl opacity-0 disabled:cursor-not-allowed"
              />

              <div className="min-w-0 flex-1">
                <span
                  id={labelId}
                  className={`block break-words text-base font-semibold leading-relaxed ${onGlass ? "text-on-media" : titleColor}`}
                  dir="auto"
                >
                  {action.label}
                </span>
              </div>

              {/* End: Circular tracking checkmark on far left (RTL) / far right (LTR) */}
              <TrackingCheckMark checked={action.checked} onGlass={onGlass} compact />
            </li>
          );
        })}
      </ol>

      {/* Dominant Primary Action: Golden Pill CTA */}
      <button
        type="button"
        onClick={() => onOpenAdhkar(prayer)}
        data-testid="prayer-open-adhkar"
        className="mt-1 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-base font-bold text-primary-foreground transition-colors duration-fast hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
      >
        <BookOpen size={20} className="shrink-0" aria-hidden="true" />
        <span>{t(language, "prayerActions.startAdhkar")}</span>
      </button>

      {/* Educational More Info Modal */}
      {infoOpen && (
        <Modal
          open
          onClose={() => setInfoOpen(false)}
          title={infoData.modalTitle}
          direction={direction}
          language={language}
          testId="prayer-actions-info-modal"
          maxWidthClassName="max-w-lg"
          showCloseButton={false}
          className="pb-safe"
        >
          <div dir={direction} className="flex max-h-[85vh] flex-col overflow-hidden text-start">
            <SheetHeader
              title={infoData.modalTitle}
              icon={<BookOpen size={20} aria-hidden="true" />}
              onClose={() => setInfoOpen(false)}
              language={language}
              direction={direction}
            />

            <div dir={direction} className="flex flex-col overflow-y-auto px-5 py-4 sm:px-6 min-h-0 flex-1">
              {infoData.sunnahItems.length === 0 ? (
                <p className="py-8 text-center text-sm font-medium text-muted-foreground" dir="auto">
                  {t(language, "prayerMoment.statusNow")}
                </p>
              ) : (
                <ul className="divide-y divide-border/20 list-disc ps-5 m-0" data-testid="prayer-info-points">
                  {infoData.sunnahItems.map((item, idx) => (
                    <li key={`${item.position}-${idx}`} className="space-y-2 py-3.5 first:pt-1 last:pb-2">
                      {/* Header Row: Title on start, Badges on end */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="text-base font-bold text-foreground" dir="auto">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-micro font-semibold text-foreground border border-border/40">
                            {item.rakahsLabel}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-semibold ${
                              item.rank === "confirmed"
                                ? "border border-success/30 bg-success/15 text-success"
                                : "border border-border/40 bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            {item.rankLabel}
                          </span>
                        </div>
                      </div>

                      {/* Short Explanation */}
                      <p className="text-sm leading-relaxed text-muted-foreground" dir="auto">
                        {item.description}
                      </p>

                      {/* Supporting Hadith Evidence - rendered only when distinct from the overarching rawatib banner */}
                      {item.sunnah.evidence &&
                        item.sunnah.evidence.textArabic !== infoData.rawatibVirtue?.evidence.textArabic && (
                          <details className="group mt-1 rounded-xl border border-border/40 bg-muted/20 transition-colors">
                            <summary className="flex min-h-11 cursor-pointer list-none select-none items-center justify-between px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring rounded-xl">
                              <span className="flex items-center gap-2">
                                <BookOpen size={15} className="text-primary shrink-0" aria-hidden="true" />
                                <span>{t(language, "prayerActions.hadithReference")}</span>
                              </span>
                              <ChevronDown
                                size={15}
                                className="shrink-0 text-muted-foreground transition-transform duration-standard group-open:rotate-180"
                                aria-hidden="true"
                              />
                            </summary>
                            <blockquote
                              className="border-t border-border/30 bg-muted/40 p-3.5 text-start rounded-b-xl"
                              dir={isArabic || !item.sunnah.evidence.textEnglish ? "rtl" : "ltr"}
                            >
                              <p
                                className={`text-sm font-bold leading-loose text-foreground ${
                                  isArabic || !item.sunnah.evidence.textEnglish ? "zikr-text" : ""
                                }`}
                                lang={isArabic || !item.sunnah.evidence.textEnglish ? "ar" : "en"}
                              >
                                {isArabic
                                  ? item.sunnah.evidence.textArabic
                                  : (item.sunnah.evidence.textEnglish ?? item.sunnah.evidence.textArabic)}
                              </p>
                              <footer className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-micro font-medium text-muted-foreground border-t border-border/20 pt-2">
                                <span>
                                  {isArabic
                                    ? item.sunnah.evidence.referenceArabic
                                    : item.sunnah.evidence.referenceEnglish}
                                </span>
                                {(isArabic
                                  ? item.sunnah.evidence.gradingArabic
                                  : item.sunnah.evidence.gradingEnglish) && (
                                  <span className="font-bold text-primary">
                                    {isArabic
                                      ? item.sunnah.evidence.gradingArabic
                                      : item.sunnah.evidence.gradingEnglish}
                                  </span>
                                )}
                              </footer>
                            </blockquote>
                          </details>
                        )}
                    </li>
                  ))}
                </ul>
              )}

              {/* Rawatib Virtue Foundation Banner */}
              {infoData.rawatibVirtue && (
                <details
                  className="group mt-3.5 flex flex-col rounded-2xl border border-primary/20 bg-primary/5 p-3.5 text-foreground transition-colors"
                  data-testid="rawatib-virtue-banner"
                >
                  <summary className="flex min-h-11 cursor-pointer list-none select-none items-center justify-between gap-2.5 rounded-xl text-sm font-bold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
                    <div className="flex items-center gap-2">
                      <PrayerRug size={18} className="shrink-0 text-primary" aria-hidden="true" />
                      <span className="text-foreground font-bold">{infoData.rawatibVirtue.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-muted-foreground transition-transform duration-standard group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="mt-2.5 flex flex-col gap-2.5 border-t border-primary/10 pt-2.5">
                    <p className="text-xs font-semibold leading-relaxed text-muted-foreground sm:text-sm" dir="auto">
                      {infoData.rawatibVirtue.description}
                    </p>
                    <blockquote
                      className="rounded-xl border-s-2 border-primary bg-card p-3 shadow-xs"
                      dir={isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "rtl" : "ltr"}
                    >
                      <p
                        className={`text-sm font-bold leading-loose text-foreground ${
                          isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "zikr-text" : ""
                        }`}
                        lang={isArabic || !infoData.rawatibVirtue.evidence.textEnglish ? "ar" : "en"}
                      >
                        {isArabic
                          ? infoData.rawatibVirtue.evidence.textArabic
                          : (infoData.rawatibVirtue.evidence.textEnglish ?? infoData.rawatibVirtue.evidence.textArabic)}
                      </p>
                      <footer className="mt-2 text-micro font-medium text-muted-foreground border-t border-border/20 pt-1.5">
                        {isArabic
                          ? infoData.rawatibVirtue.evidence.referenceArabic
                          : infoData.rawatibVirtue.evidence.referenceEnglish}
                      </footer>
                    </blockquote>
                  </div>
                </details>
              )}
            </div>

            {/* Modal Footer with Primary Close Action */}
            <footer className="shrink-0 border-t border-border/40 px-5 py-3">
              <button
                type="button"
                onClick={() => setInfoOpen(false)}
                data-testid="prayer-actions-info-close"
                className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-muted font-bold text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                {t(language, "common.close")}
              </button>
            </footer>
          </div>
        </Modal>
      )}
    </section>
  );
}
