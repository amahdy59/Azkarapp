import { expect, it } from "vitest";
import { recordedPageRhythm } from "./recordedPageRhythm";

it("clips to the selected scope and elapsed dates and keeps empty saved counts factual", () => {
  const points = recordedPageRhythm(
    "2026-10-18",
    "2026-10-31",
    "2026-10-20",
    new Map([
      ["2026-10-19", 2],
      ["2026-10-22", 9],
    ]),
  );
  expect(points).toEqual([
    { dayKey: "2026-10-18", count: 0 },
    { dayKey: "2026-10-19", count: 2 },
    { dayKey: "2026-10-20", count: 0 },
  ]);
  expect(recordedPageRhythm("2026-10-22", "2026-10-31", "2026-10-20", new Map())).toEqual([]);
});
