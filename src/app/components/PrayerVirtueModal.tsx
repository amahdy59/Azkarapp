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
}: {
  prayer: PrayerName | null;
  language: AppLanguage;
  direction: "ltr" | "rtl";
  onClose: () => void;
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
    >
      <div className="flex min-h-0 flex-col">
        <header className="shrink-0 border-b border-border/50 bg-gradient-to-b from-primary/12 to-transparent px-5 py-4 text-center">
          <p className="text-[0.75rem] font-bold text-muted-foreground">{t(language, "prayerTracking.mosque")}</p>
          <h2 className="mt-0.5 text-[1.125rem] font-black text-foreground" dir="auto">
            {t(language, "prayerTracking.virtueTitle", { prayer: name })}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <ul className="flex flex-col gap-3">
            {virtues.map((virtue) => (
              <li
                key={virtue.referenceArabic + virtue.textArabic.slice(0, 12)}
                data-testid="prayer-virtue-item"
                className="rounded-2xl border border-border/60 bg-background px-4 py-3"
              >
                <p className="zikr-text text-[1rem] font-bold leading-[1.9] text-foreground" lang="ar" dir="rtl">
                  {virtue.textArabic}
                </p>
                {/* Isolated so the collection number cannot reorder against the
                    Arabic name of the collection beside it. */}
                <bdi className="mt-2 block text-[0.75rem] font-bold text-muted-foreground">
                  {language === "ar" ? virtue.referenceArabic : virtue.referenceEnglish}
                </bdi>
              </li>
            ))}
          </ul>

          <p
            data-testid="prayer-virtue-closing"
            className="zikr-text mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-center text-[0.9375rem] font-black leading-[1.9] text-primary"
            lang="ar"
            dir="rtl"
          >
            {PRAYER_VIRTUE_CLOSING_ARABIC}
          </p>
        </div>

        <footer className="shrink-0 border-t border-border/50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            data-testid="prayer-virtue-close"
            className="flex min-h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-[0.875rem] font-black text-primary-foreground transition-[background-color,transform] duration-press ease-standard hover:brightness-110 active:scale-[var(--motion-scale-pressed,0.98)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t(language, "common.close")}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
