/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
import { Modal } from "./ResponsiveSheet";
import { getPrayerVirtues, PRAYER_VIRTUE_CLOSING_ARABIC } from "../content/prayerVirtues";
import { t } from "../i18n";
import type { AppLanguage, PrayerName } from "../types";

/**
 * Acknowledges praying in congregation with what that prayer is worth.
 *
 * Deliberately small: it appears on a tap the reader made for a different
 * reason, so it stays an acknowledgement rather than a reading screen. Built
 * on the shared Modal, which already supplies the entrance and exit motion,
 * focus containment, focus restore, and Escape — so this cannot drift from
 * every other dialog in the app.
 */
export function PrayerVirtueModal({
  prayer,
  language,
  direction,
  onClose,
  onGlass = false,
}: {
  prayer: PrayerName | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
  onGlass?: boolean;
}) {
  if (!prayer) return null;
  const virtues = getPrayerVirtues(prayer);
  if (virtues.length === 0) return null;

  const name = t(language, `notifications.${prayer}`);

  return (
    <Modal
      open
      onClose={onClose}
      title={t(language, "prayerTracking.virtueTitle", { prayer: name })}
      direction={direction}
      testId="prayer-virtue-modal"
      maxWidthClassName="max-w-[32rem]"
      onGlass={onGlass}
    >
      <div className="flex min-h-0 flex-col">
        <header
          className={`shrink-0 border-b px-5 py-4 text-center ${
            onGlass ? "border-white/20 bg-white/10" : "border-border/50 bg-gradient-to-b from-primary/12 to-transparent"
          }`}
        >
          <p className={`text-xs font-bold ${onGlass ? "text-white/80" : "text-muted-foreground"}`}>
            {t(language, "prayerTracking.mosque")}
          </p>
          <h2 className={`mt-0.5 text-lg font-black ${onGlass ? "text-white" : "text-foreground"}`} dir="auto">
            {t(language, "prayerTracking.virtueTitle", { prayer: name })}
          </h2>
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          tabIndex={0}
          role="region"
          aria-label={t(language, "prayerTracking.virtueTitle", { prayer: name })}
        >
          <ul className="flex flex-col gap-3">
            {virtues.map((virtue) => (
              <li
                key={virtue.referenceArabic + virtue.textArabic.slice(0, 12)}
                data-testid="prayer-virtue-item"
                className={`rounded-2xl p-4 ${
                  onGlass ? "border border-white/20 bg-white/10 text-white" : "border border-border/60 bg-background"
                }`}
              >
                <p
                  className={`zikr-text text-base font-bold leading-[1.9] ${onGlass ? "text-white" : "text-foreground"}`}
                  lang="ar"
                  dir="rtl"
                >
                  {virtue.textArabic}
                </p>
                {/* Isolated so the collection number cannot reorder against the
                    Arabic name of the collection beside it. */}
                <bdi className={`mt-2 block text-xs font-bold ${onGlass ? "text-white/70" : "text-muted-foreground"}`}>
                  {language === "ar" ? virtue.referenceArabic : virtue.referenceEnglish}
                </bdi>
              </li>
            ))}
          </ul>

          <p
            data-testid="prayer-virtue-closing"
            className={`zikr-text mt-4 rounded-2xl px-4 py-3 text-center text-subtitle font-black leading-[1.9] ${
              onGlass ? "bg-white/15 text-white border border-white/20" : "bg-primary/10 text-primary"
            }`}
            lang="ar"
            dir="rtl"
          >
            {PRAYER_VIRTUE_CLOSING_ARABIC}
          </p>
        </div>

        <footer className={`shrink-0 border-t px-5 py-3 ${onGlass ? "border-white/20" : "border-border/50"}`}>
          <button
            type="button"
            onClick={onClose}
            data-testid="prayer-virtue-close"
            className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-black text-primary-foreground transition-[background-color,transform] duration-press ease-standard hover:brightness-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t(language, "common.close")}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
