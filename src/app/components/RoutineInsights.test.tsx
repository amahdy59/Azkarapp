import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoutineInsights } from "./RoutineInsights";
import { saveFileToDevice } from "../share/shareDispatcher";
vi.mock("../share/shareDispatcher", () => ({ saveFileToDevice: vi.fn().mockResolvedValue(undefined) }));
const now = new Date(2026, 9, 18, 12);
const props = {
  period: "month" as const,
  displayDate: now,
  now,
  language: "en" as const,
  calendarType: "gregorian" as const,
  progressDayStartHour: 0,
};
describe("routine insights", () => {
  it("shows strongest and least recorded routines, explains the measure, and exports exact data", async () => {
    const records = Array.from({ length: 17 }, (_, i) => ({
      dayKey: `2026-10-${String(i + 1).padStart(2, "0")}`,
      category: "morning" as const,
      timeZone: "UTC",
    }));
    render(
      <RoutineInsights
        {...props}
        records={[...records, { dayKey: "2026-10-01", category: "evening", timeZone: "UTC" }]}
      />,
    );
    expect(screen.getByText("Most consistently recorded").nextElementSibling).toHaveTextContent("Morning");
    expect(screen.getByText("A place to give more attention").nextElementSibling).toHaveTextContent("Sleep");
    expect(within(screen.getByTestId("insight-morning")).getByRole("img")).toHaveAccessibleName(/100%/);
    const trends = within(screen.getByTestId("routine-trends"));
    expect(trends.getAllByRole("img")).toHaveLength(1);
    expect(trends.getByTestId("recording-time-line")).toBeInTheDocument();
    fireEvent.click(trends.getByRole("button", { name: "Morning", exact: true }));
    expect(trends.getByRole("img")).toHaveAccessibleName(/Remembrance over time.*Morning/);
    expect(trends.getByTestId("timeline-readout")).toHaveTextContent("100%");
    expect(screen.getByText(/Older item history is unavailable/)).toBeVisible();
    expect(screen.getByRole("link", { name: "Review azkar reminders" })).toHaveAttribute(
      "href",
      "#/settings/notifications",
    );
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download routine data (JSON)" }));
    expect(await screen.findByText("Data file saved.")).toBeVisible();
    const file = vi.mocked(saveFileToDevice).mock.calls.at(-1)![0];
    expect(file.name).toBe("azkar-patterns-2026-10-01.json");
    expect(file.type).toBe("application/json");
  });
  it("announces export errors and retains independent Quran and weekly intention", async () => {
    vi.mocked(saveFileToDevice).mockRejectedValueOnce(new Error("disk unavailable"));
    render(<RoutineInsights {...props} period="week" records={[]} weeklyGoalDays={4} isQuranDoneForDay={() => true} />);
    expect(screen.getByText("Your seven-day intention")).toBeVisible();
    expect(screen.getByText("Quran")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Download routine data (JSON)" }));
    expect(await screen.findByText(/could not be saved/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Download routine data (JSON)" })).toBeEnabled();
  });
});
