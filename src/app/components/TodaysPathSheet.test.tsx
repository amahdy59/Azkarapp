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
  palmTier: "none",
};

describe("TodaysPathSheet", () => {
  it("presents automatic progress and a read-only reward guide", () => {
    render(<TodaysPathSheet open status={status} language="en" direction="ltr" onClose={vi.fn()} />);

    const text = screen.getByTestId("todays-path-sheet").textContent ?? "";
    expect(text.indexOf("Dhikr")).toBeLessThan(text.indexOf("Qur'an wird"));
    expect(text.indexOf("Qur'an wird")).toBeLessThan(text.indexOf("Prayers in congregation"));
    expect(screen.getByText("2 of 5 at the mosque")).toBeInTheDocument();
    expect(screen.getByText(/does not measure faith or reward/i)).toBeInTheDocument();
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText("Updates automatically from your recorded practice")).toBeInTheDocument();
    expect(screen.getByText(/plus 3 prayers at the mosque/)).toBeInTheDocument();
    expect(screen.getByText(/plus all 5 prayers at the mosque/)).toBeInTheDocument();
  });

  it.each(["palm", "golden", "oasis"] as const)("identifies the earned %s tier in text", (palmTier) => {
    const { container } = render(
      <TodaysPathSheet
        open
        status={{ ...status, palmEarned: true, palmTier }}
        language="en"
        direction="ltr"
        onClose={vi.fn()}
      />,
    );
    const current = document.querySelector('[data-reward-tier][aria-current="step"]');
    expect(current).toHaveAttribute("data-reward-tier", palmTier);
    expect(current).toHaveTextContent(
      palmTier === "palm" ? "Palm tree" : palmTier === "golden" ? "Golden palm" : "Palm with an oasis",
    );
    expect(container.querySelector("input")).toBeNull();
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
        onClose={onClose}
        onViewProgress={onViewProgress}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View full progress" }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onViewProgress).toHaveBeenCalledOnce();
  });
});
