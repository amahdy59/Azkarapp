import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrayerTrackerCards, type PrayerCardModel } from "./PrayerTrackerCards";
import type { PrayerName } from "../types";

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
