import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerMomentScreen } from "./PrayerMomentScreen";
import { getEstimatedPrayerTimes } from "../content/prayerTimes";
import type { PrayerName, PrayerTrackingRecord } from "../types";

afterEach(cleanup);

const DAY = "2026-09-04";

function at(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return new Date(2026, 8, 4, h ?? 0, m ?? 0, 0, 0);
}

function shift(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const times = getEstimatedPrayerTimes(at("12:00"));

function renderScreen({
  prayer = "isha" as PrayerName,
  now = at(shift(times.isha, 10)),
  records = [] as PrayerTrackingRecord[],
  onToggle = vi.fn(),
  onOpenAdhkar = vi.fn(),
  onSelectPrayer = vi.fn(),
} = {}) {
  render(
    <PrayerMomentScreen
      prayer={prayer}
      language="ar"
      direction="rtl"
      records={records}
      dayKey={DAY}
      now={now}
      onBack={() => undefined}
      onToggle={onToggle}
      onOpenAdhkar={onOpenAdhkar}
      onSelectPrayer={onSelectPrayer}
    />,
  );
  return { onToggle, onOpenAdhkar, onSelectPrayer };
}

describe("the prayer as one surface", () => {
  it("opens on the prayer, its time and its own sky", () => {
    renderScreen({ prayer: "maghrib", now: at(shift(times.maghrib, 5)) });
    expect(screen.getByTestId("prayer-moment-screen")).toHaveAttribute("data-prayer", "maghrib");
    // Five scenes, one per prayer: the hour is the only thing that differs
    // between them, and it is drawn rather than fetched.
    expect(screen.getByTestId("prayer-scene")).toHaveAttribute("data-prayer-scene", "maghrib");
  });

  it("offers the virtue while it can still be an invitation", () => {
    renderScreen({ now: at(shift(times.isha, 5)) });
    expect(screen.getByTestId("prayer-moment-virtue")).toBeInTheDocument();
  });

  it("drops the virtue once the prayer's time has gone", () => {
    // After the window it could only congratulate, which is the reward-shaped
    // dialog this screen replaced.
    renderScreen({ prayer: "fajr", now: at(shift(times.dhuhr, 30)) });
    expect(screen.queryByTestId("prayer-moment-virtue")).toBeNull();
  });

  it("records where the prayer was prayed rather than only whether it was at the mosque", () => {
    const { onToggle } = renderScreen();
    fireEvent.click(screen.getByTestId("prayer-location-home"));
    expect(onToggle).toHaveBeenCalledWith("isha", "location", "home");
  });

  it("clears the answer when the same place is pressed again", () => {
    const records: PrayerTrackingRecord[] = [
      { dayKey: DAY, prayer: "isha", mosque: true, adhkar: false, location: "mosque" },
    ];
    const { onToggle } = renderScreen({ records });
    fireEvent.click(screen.getByTestId("prayer-location-mosque"));
    expect(onToggle).toHaveBeenCalledWith("isha", "location", null);
  });

  it("waits for the prayer to be recorded before offering its adhkar", () => {
    // The gate is the reader's own answer, never the clock: someone may pray
    // Isha at eleven, and no timer can know that.
    renderScreen();
    expect(screen.getByTestId("prayer-adhkar-hint")).toBeInTheDocument();
    expect(screen.queryByTestId("prayer-open-adhkar")).toBeNull();
  });

  it("opens the adhkar once it is", () => {
    const records: PrayerTrackingRecord[] = [
      { dayKey: DAY, prayer: "isha", mosque: false, adhkar: false, location: "home" },
    ];
    const { onOpenAdhkar } = renderScreen({ records });
    fireEvent.click(screen.getByTestId("prayer-open-adhkar"));
    expect(onOpenAdhkar).toHaveBeenCalledWith("isha");
  });

  it("names the rak'ahs due now, in Arabic that counts them", () => {
    // Two is a dual noun and four takes the plural, so the copy cannot be a
    // number dropped into one template.
    renderScreen({ prayer: "dhuhr", now: at(shift(times.dhuhr, -10)) });
    expect(screen.getByTestId("prayer-action-prayer-sunnah")).toHaveTextContent("أربع ركعات قبل الظهر");
  });

  it("shows no rawātib card for a prayer that has none", () => {
    renderScreen({ prayer: "asr", now: at(shift(times.asr, 5)) });
    expect(screen.queryByTestId("prayer-action-prayer-sunnah")).toBeNull();
  });

  it("keeps the day's five within reach", () => {
    const { onSelectPrayer } = renderScreen();
    expect(screen.getByTestId("prayer-strip-fajr")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("prayer-strip-asr"));
    expect(onSelectPrayer).toHaveBeenCalledWith("asr");
  });

  it("names each card once, not twice", () => {
    // The card carried a screen-reader-only copy of its own title beside the
    // visible one, so it announced itself twice.
    renderScreen();
    expect(screen.getAllByText("أذكار ما بعد الصلاة")).toHaveLength(1);
  });
});
