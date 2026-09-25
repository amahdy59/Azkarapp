import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TodaysPathSheet } from "./TodaysPathSheet";
import type { DailyPathStatus } from "../dailyPath";

const status: DailyPathStatus = {
  dayKey: "2026-09-21",
  policyVersion: 2,
  dhikr: {
    morning: true,
    evening: false,
    beforeSleep: false,
    completedCount: 1,
    consistencyComplete: false,
    fullComplete: false,
  },
  quran: { goal: 4, progress: 2, complete: false, active: true },
  salah: { target: 3, recordedCount: 3, mosqueCount: 2, complete: false, configured: true },
  activePillarCount: 3,
  achievedPillarCount: 0,
  streakQualified: false,
  palmEarned: false,
};

describe("TodaysPathSheet", () => {
  it("presents the reviewed practice order and keeps configuration secondary", () => {
    render(
      <TodaysPathSheet
        open
        status={status}
        language="en"
        direction="ltr"
        mosquePrayerGoal={3}
        onMosquePrayerGoalChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    const text = screen.getByTestId("todays-path-sheet").textContent ?? "";
    expect(text.indexOf("Prayer")).toBeLessThan(text.indexOf("Qur'an wird"));
    expect(text.indexOf("Qur'an wird")).toBeLessThan(text.indexOf("Dhikr"));
    expect(screen.getByText(/3 of 5 recorded .* 2 in congregation/)).toBeInTheDocument();
    expect(screen.getByText(/does not measure faith or reward/i)).toBeInTheDocument();
    expect(screen.getByText("Adjust congregation intention").closest("details")).not.toHaveAttribute("open");
  });

  it("closes before opening full progress", () => {
    const onClose = vi.fn();
    const onViewProgress = vi.fn();
    render(
      <TodaysPathSheet
        open
        status={status}
        language="en"
        direction="ltr"
        onMosquePrayerGoalChange={vi.fn()}
        onClose={onClose}
        onViewProgress={onViewProgress}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View full progress" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onViewProgress).toHaveBeenCalledOnce();
  });
});
