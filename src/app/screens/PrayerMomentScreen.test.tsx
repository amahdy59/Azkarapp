import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerMomentScreen } from "./PrayerMomentScreen";
import { PrayerMomentPanel } from "../components/PrayerMomentPanel";
import { getEstimatedPrayerTimes } from "../content/prayerTimes";
import type { PrayerName, PrayerTrackingRecord } from "../types";
import { formatDisplayDate } from "../formatting";
import { dateFromProgressDayKey } from "../progress";

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
  it("names the record date across midnight without repeating the timetable countdown or completion tally", () => {
    render(
      <PrayerMomentPanel
        prayer="isha"
        language="en"
        direction="ltr"
        records={[]}
        dayKey="2026-09-04"
        calendarType="gregorian"
        now={new Date(2026, 8, 5, 1)}
        onToggle={vi.fn()}
        onOpenAdhkar={vi.fn()}
      />,
    );
    expect(screen.queryByTestId("prayer-record-date")).toBeNull();
    fireEvent.click(screen.getByTestId("prayer-actions-more-info"));
    expect(screen.getByTestId("prayer-record-date")).toHaveAttribute("datetime", "2026-09-04");
    expect(screen.getByTestId("prayer-record-date")).toHaveTextContent("Record for Friday, September 4, 2026 AD");
    expect(screen.queryByText("Not yet due")).toBeNull();
    expect(screen.queryByText(/In \d+ min/)).toBeNull();
    expect(screen.queryByTestId("prayer-actions-progress")).toBeNull();
    expect(screen.getByTestId("prayer-moment-virtue")).toBeInTheDocument();
  });
  it.each(["ar", "en"] as const)(
    "follows calendar and Hijri adjustment changes in %s without moving the record day",
    (language) => {
      const props = {
        prayer: "isha" as const,
        language,
        direction: language === "ar" ? ("rtl" as const) : ("ltr" as const),
        records: [],
        dayKey: DAY,
        now: new Date(2026, 8, 5, 1),
        onBack: vi.fn(),
        onToggle: vi.fn(),
        onOpenAdhkar: vi.fn(),
        onSelectPrayer: vi.fn(),
      };
      const { rerender } = render(<PrayerMomentScreen {...props} calendarType="hijri" hijriDateOffset={1} />);
      fireEvent.click(screen.getByTestId("prayer-actions-more-info"));
      const date = screen.getByTestId("prayer-record-date");
      expect(date).toHaveTextContent(formatDisplayDate(dateFromProgressDayKey(DAY), language, "hijri", 1));
      rerender(<PrayerMomentScreen {...props} calendarType="hijri" hijriDateOffset={-1} />);
      expect(date).toHaveTextContent(formatDisplayDate(dateFromProgressDayKey(DAY), language, "hijri", -1));
      rerender(<PrayerMomentScreen {...props} calendarType="gregorian" hijriDateOffset={1} />);
      expect(date).toHaveTextContent(formatDisplayDate(dateFromProgressDayKey(DAY), language, "gregorian"));
      expect(date).toHaveAttribute("datetime", DAY);
      fireEvent.click(screen.getByTestId("prayer-actions-info-close"));
      fireEvent.click(screen.getByTestId("prayer-action-location").querySelector("input")!);
      expect(props.onToggle).toHaveBeenCalledWith("isha", "location", "mosque");
    },
  );
  it("allows an approaching prayer preview without allowing an early record", () => {
    const onToggle = vi.fn();
    render(
      <PrayerMomentPanel
        prayer="dhuhr"
        language="en"
        direction="ltr"
        records={[]}
        dayKey={DAY}
        now={at(shift(times.dhuhr, -10))}
        canRecord={false}
        onToggle={onToggle}
        onOpenAdhkar={() => undefined}
      />,
    );

    const inputs = screen.getByTestId("prayer-journey").querySelectorAll("input[type=checkbox]");
    expect(inputs.length).toBeGreaterThan(0);
    for (const input of inputs) expect(input).toBeDisabled();
    fireEvent.click(inputs[0]!);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("opens on one compact prayer identity with its reviewed virtue", () => {
    renderScreen({ prayer: "maghrib", now: at(shift(times.maghrib, 5)) });
    expect(screen.getByTestId("prayer-moment-screen")).toHaveAttribute("data-prayer", "maghrib");
    expect(screen.getByRole("heading", { level: 2, name: /أعمال صلاة المغرب/ })).toBeInTheDocument();
    expect(screen.queryByTestId("prayer-moment-hero")).toBeNull();
    expect(screen.queryByTestId("prayer-moment-status")).toBeNull();
  });

  it("offers the virtue while it can still be an invitation", () => {
    renderScreen({ now: at(shift(times.isha, 5)) });
    const virtue = screen.getByTestId("prayer-moment-virtue");
    expect(virtue).toBeInTheDocument();
    expect(virtue.closest("article")).toContainElement(screen.getByTestId("prayer-journey"));
  });

  it("keeps the virtue hadith present even after the prayer's time has passed", () => {
    renderScreen({ prayer: "fajr", now: at(shift(times.dhuhr, 30)) });
    expect(screen.getByTestId("prayer-moment-virtue")).toBeInTheDocument();
  });

  it("keeps the source inline with the complete narration and the record date in information", () => {
    renderScreen({ prayer: "fajr" });
    const source = screen.getByTestId("prayer-virtue-source");
    expect(source.tagName).toBe("SPAN");
    expect(source.parentElement).toHaveAttribute("lang", "ar");
    expect(source.parentElement).toHaveTextContent("«مَنْ صَلَّى الصُّبْحَ فِي جَمَاعَةٍ فَهُوَ فِي ذِمَّةِ اللَّهِ»");
    expect(source).toHaveTextContent("صحيح مسلم ٦٥٧");
    expect(screen.queryByTestId("prayer-record-date")).toBeNull();
    fireEvent.click(screen.getByTestId("prayer-actions-more-info"));
    expect(screen.getByRole("dialog")).toContainElement(screen.getByTestId("prayer-record-date"));
  });

  it("asks whether the prayer was in congregation, not where it was prayed", () => {
    /* This used to offer two places, mosque and home, and record whichever was
       pressed. Recording "at home" changed no outcome anywhere — the palm and
       the day's path both count congregation — so it was a decision asked of
       the reader for the app's benefit rather than theirs. One answer now. */
    const { onToggle } = renderScreen();
    fireEvent.click(screen.getByTestId("prayer-action-location").querySelector("input")!);
    expect(onToggle).toHaveBeenCalledWith("isha", "location", "mosque");
  });

  it("clears the answer when it is pressed again", () => {
    const records: PrayerTrackingRecord[] = [
      { dayKey: DAY, prayer: "isha", mosque: true, adhkar: false, location: "mosque" },
    ];
    const { onToggle } = renderScreen({ records });
    fireEvent.click(screen.getByTestId("prayer-action-location").querySelector("input")!);
    expect(onToggle).toHaveBeenCalledWith("isha", "location", null);
  });

  it("offers the adhkar whether or not the prayer was in congregation", () => {
    /* They were gated on "where did you pray", which with a single
       congregation answer would lock the collection for everyone who prayed
       alone. Reading adhkar was never something to earn, and the library has
       always offered them regardless — the gate only made Home disagree. */
    const { onOpenAdhkar } = renderScreen();
    expect(screen.queryByTestId("prayer-adhkar-hint")).toBeNull();
    fireEvent.click(screen.getByTestId("prayer-open-adhkar"));
    expect(onOpenAdhkar).toHaveBeenCalledWith("isha");
  });

  it("renders the prayer actions card with prayer-specific deeds", () => {
    renderScreen({ prayer: "dhuhr" });
    expect(screen.getByRole("heading", { level: 2, name: /أعمال صلاة الجمعة/ })).toBeInTheDocument();
    expect(screen.getByTestId("prayer-action-location")).toHaveTextContent("صليتها في المسجد");
    expect(screen.queryByTestId("prayer-action-dhuhr-sunnah-before")).toBeNull();
    expect(screen.getByTestId("prayer-action-dhuhr-adhkar")).toHaveTextContent("أذكار بعد الصلاة");
    expect(screen.getByTestId("prayer-action-dhuhr-sunnah-after")).toHaveTextContent("سنة بعد الجمعة");
  });

  it("names an encouraged sunnah in More Info, not as one of the twelve", () => {
    renderScreen({ prayer: "asr" });
    fireEvent.click(screen.getByTestId("prayer-actions-more-info"));
    const modal = screen.getByTestId("prayer-actions-info-modal");
    expect(modal).toHaveTextContent("سنة مستحبة");
    expect(modal).toHaveTextContent("أربع ركعات");
    expect(modal).toHaveTextContent("رَحِمَ اللَّهُ امْرَأً صَلَّى قَبْلَ الْعَصْرِ أَرْبَعًا");
    expect(modal).toHaveTextContent("حسّنه الألباني");
  });

  it("offers the narration a sunnah rests on, without recording anything", () => {
    renderScreen({ prayer: "fajr" });
    fireEvent.click(screen.getByTestId("prayer-actions-more-info"));
    const modal = screen.getByTestId("prayer-actions-info-modal");
    expect(modal).toHaveTextContent("رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا");
    expect(modal).toHaveTextContent("صحيح مسلم ٧٢٥");
    expect(modal).not.toHaveTextContent("الألباني");
  });

  it("keeps the day's five within reach", () => {
    const { onSelectPrayer } = renderScreen();
    expect(screen.getByTestId("prayer-strip-fajr")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("prayer-strip-asr"));
    expect(onSelectPrayer).toHaveBeenCalledWith("asr");
  });

  it("names each card once, not twice", () => {
    renderScreen();
    expect(screen.getAllByText("أذكار بعد الصلاة")).toHaveLength(1);
  });
});
