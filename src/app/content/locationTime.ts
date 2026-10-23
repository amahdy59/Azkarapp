/** Convert a selected-location civil time to an instant, including date-specific DST. */
export function locationTime(date: Date, time: string, timeZone: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  const civil = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
  let instant = civil;
  let previous = instant;
  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    const part = (name: string) => Number(parts.find(({ type }) => type === name)?.value);
    const projected = Date.UTC(
      part("year"),
      part("month") - 1,
      part("day"),
      part("hour"),
      part("minute"),
      part("second"),
    );
    const next = civil - (projected - instant);
    if (next === instant) return instant;
    // A civil time skipped by a DST jump is moved forward, never to yesterday.
    if (next === previous) return Math.max(next, instant);
    previous = instant;
    instant = next;
  }
  return instant;
}

export function locationCalendarDate(now: Date, zone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (name: string) => Number(parts.find((value) => value.type === name)?.value);
  return new Date(part("year"), part("month") - 1, part("day"), 12);
}
