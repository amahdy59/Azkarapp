import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerTrackerCards, type PrayerCardModel } from "./PrayerTrackerCards";
import type { PrayerName, PrayerTrackingRecord } from "../types";

/**
 * The row shows a window onto the five prayers, not the first two of them.
 *
 * The window used to look right only in the morning: it opens on whatever is
 * current, and the screens that render it sampled `new Date()` once per mount,
 * so a page left open kept framing Fajr and Dhuhr into the evening. The clock
 * is fixed in `useNow`; what these tests hold is the other half — that given a
 * correct clock, the window lands on the prayers you can still act on.
 */

/** jsdom has no matchMedia, and the tier the row picks is read from it. */
function stubViewport(matchingQueries: string[]) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: matchingQueries.includes(query),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

const TIMES: Record<PrayerName, string> = {
  fajr: "04:52",
  dhuhr: "12:59",
  asr: "16:31",
  maghrib: "19:34",
  isha: "21:02",
};

/** Builds the row's models with `current` on the named prayer. */
function modelsWithCurrent(current: PrayerName): PrayerCardModel[] {
  const order: PrayerName[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
  const activeIndex = order.indexOf(current);
  return order.map((prayer, index) => ({
    prayer,
    time: TIMES[prayer],
    state:
      index === activeIndex
        ? "current"
        : index < activeIndex
          ? "past"
          : index === activeIndex + 1
            ? "next"
            : "upcoming",
    ...(index === activeIndex + 1 ? { countdown: "01:00" } : {}),
  }));
}

function renderRow(current: PrayerName) {
  render(
    <PrayerTrackerCards
      models={modelsWithCurrent(current)}
      language="en"
      direction="ltr"
      records={[]}
      dayKey="2026-08-19"
      onToggle={() => undefined}
    />,
  );
  return [...screen.getAllByTestId(/^prayer-card-/)].map((card) => card.dataset.prayer);
}

afterEach(() => vi.unstubAllGlobals());

describe("PrayerTrackerCards", () => {
  it("renders all five cards unconditionally", () => {
    stubViewport([]);
    expect(renderRow("fajr")).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  });
});

/**
 * The card became a door when tapping it started opening the prayer screen.
 * These hold the two things that changed with it: that it says where it goes,
 * and that it no longer contradicts the screen it opens.
 */
describe("the card as a way into the prayer", () => {
  afterEach(() => vi.unstubAllGlobals());

  function renderRow(records: PrayerTrackingRecord[], onOpen = vi.fn()) {
    stubViewport(["(min-width: 1024px)"]);
    render(
      <PrayerTrackerCards
        models={modelsWithCurrent("fajr")}
        language="en"
        direction="ltr"
        records={records}
        dayKey="2026-09-05"
        onToggle={() => undefined}
        onOpen={onOpen}
      />,
    );
    return onOpen;
  }

  it("names the prayer it opens, not the adhkar it used to", () => {
    const onOpen = renderRow([]);
    const card = screen.getByRole("button", { name: /Open Fajr/i });
    fireEvent.click(card);
    expect(onOpen).toHaveBeenCalledWith("fajr");
  });

  it("counts a prayer recorded at home as prayed", () => {
    // The row only knew `mosque`, so a prayer recorded at home on the prayer
    // screen showed here as an empty box — which reads as "not recorded".
    renderRow([{ dayKey: "2026-09-05", prayer: "fajr", mosque: false, adhkar: false, location: "home" }]);
    const prayed = screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!;
    expect(prayed).toBeChecked();
    expect(screen.getByText("At home")).toBeInTheDocument();
  });

  it("still reads a mosque record made before the place existed", () => {
    renderRow([{ dayKey: "2026-09-05", prayer: "fajr", mosque: true, adhkar: false }]);
    expect(screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!).toBeChecked();
    expect(screen.getByText("At the mosque")).toBeInTheDocument();
  });

  it("leaves an unrecorded prayer unticked and unnamed", () => {
    renderRow([]);
    expect(screen.getAllByRole("checkbox", { name: /Prayed/i })[0]!).not.toBeChecked();
    expect(screen.queryByText("At home")).toBeNull();
  });
});
