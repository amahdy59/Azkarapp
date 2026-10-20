import { chooseProgressOption } from "../../test/progressSelect";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressPrayerBreakdown } from "./ProgressPrayerBreakdown";
import type { PrayerTrackingRecord } from "../types";

const range = { startKey: "2026-10-02", endKey: "2026-10-08" };
const records: PrayerTrackingRecord[] = [
  { dayKey: "2026-10-01", prayer: "fajr", location: "mosque", mosque: true },
  { dayKey: "2026-10-02", prayer: "fajr", location: "home", sunnahBefore: true },
  { dayKey: "2026-10-03", prayer: "fajr", location: "mosque", mosque: true, adhkar: true },
  { dayKey: "2026-10-09", prayer: "fajr", location: "home" },
  { dayKey: "2026-10-04", prayer: "asr", sunnah: true, adhkar: true },
];
describe("selected-range per-prayer breakdown", () => {
  it("partitions the selected prayer opportunities into home, mosque and unrecorded only", () => {
    render(<ProgressPrayerBreakdown records={records} range={range} language="en" />);
    const list = screen.getAllByRole("list")[0]!;
    const fajr = within(list).getAllByRole("listitem")[0]!;
    expect(fajr).toHaveTextContent("2 of 7");
    expect(fajr).toHaveTextContent("At the mosque: 1");
    expect(fajr).toHaveTextContent("At home: 1");
    expect(fajr).toHaveTextContent("Not recorded: 5");
    expect(screen.getAllByRole("img")).toHaveLength(5);
  });
  it("keeps Rawatib independent, excludes Asr and shows selected-period mosque/adhkar records", async () => {
    render(<ProgressPrayerBreakdown records={records} range={range} language="en" />);
    const select = screen.getByRole("combobox", { name: "Practice to compare" });
    await chooseProgressOption(select, "rawatib");
    expect(screen.getAllByRole("img")).toHaveLength(4);
    expect(screen.queryByTestId("insight-asr")).not.toBeInTheDocument();
    expect(screen.getByTestId("insight-fajr")).toHaveTextContent("1");
    await chooseProgressOption(select, "adhkar");
    expect(screen.getByTestId("insight-asr")).toHaveTextContent("1");
    await chooseProgressOption(select, "mosque");
    expect(screen.getByTestId("insight-fajr")).toHaveTextContent("1");
  });
  it("does not manufacture comparisons for an empty completed window", () => {
    render(
      <ProgressPrayerBreakdown
        records={records}
        range={{ startKey: "2026-10-02", endKey: "2026-10-01" }}
        language="ar"
      />,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(screen.getByText("لا توجد أيام مكتملة في هذه الفترة بعد.")).toBeInTheDocument();
  });
});
