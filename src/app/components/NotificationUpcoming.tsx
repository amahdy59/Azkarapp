import { t } from "../i18n";
import { notificationCopy, notificationEvidenceDetails } from "../notificationCopy";
import type { ReminderOccurrence } from "../reminderOccurrences";
import type { AppLanguage } from "../types";
import { EvidenceSource } from "./EvidenceSource";

export function NotificationUpcoming({
  events,
  language,
  timeZone,
}: {
  events: ReminderOccurrence[];
  language: AppLanguage;
  timeZone: string;
}) {
  const display = (event: ReminderOccurrence, featured = false) => {
    const copy = notificationCopy(language, event, event.dateKey, event.prayerTime);
    const zone = ["morning", "evening", "before_sleep", "after_prayer"].includes(event.kind)
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : timeZone;
    const clock = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en", {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      timeZone: zone,
    }).format(event.at);
    return (
      <div key={event.key} className="min-w-0 border-t border-border/40 py-2 first:border-t-0">
        <p className={featured ? "text-lg font-bold" : "text-sm font-semibold"}>{copy.title}</p>
        <p
          className={
            featured
              ? "font-semibold [overflow-wrap:anywhere]"
              : "text-label text-muted-foreground [overflow-wrap:anywhere]"
          }
        >
          <time dateTime={new Date(event.at).toISOString()}>{clock}</time> · <bdi>{zone}</bdi>
        </p>
        <EvidenceSource
          language={language}
          label={t(language, "notifications.preview")}
          details={{
            title: copy.title,
            ...(copy.evidenceId
              ? notificationEvidenceDetails(language, copy.evidenceId)
              : { quotation: copy.body, reference: "" }),
          }}
        />
      </div>
    );
  };
  return (
    <div data-testid="notification-upcoming">
      {events[0] ? display(events[0], true) : <p className="text-sm">{t(language, "readiness.none")}</p>}
      {events.length > 1 && (
        <details>
          <summary className="min-h-11 cursor-pointer rounded-lg py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {t(language, "notifications.upcoming")}
          </summary>
          {events.slice(1, 4).map((event) => display(event))}
        </details>
      )}
    </div>
  );
}
