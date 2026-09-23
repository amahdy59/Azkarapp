import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DailyCompanionsCard } from "./DailyCompanionsCard";

describe("DailyCompanionsCard", () => {
  it("renders with initial uncompleted state", () => {
    const onToggleQuran = vi.fn();
    const onCycleMosque = vi.fn();

    render(
      <DailyCompanionsCard
        language="ar"
        quranWird={false}
        mosquePrayers={null}
        onToggleQuranWird={onToggleQuran}
        onCycleMosquePrayers={onCycleMosque}
      />,
    );

    expect(screen.getByText("الرفاق اليومية")).toBeInTheDocument();
    expect(screen.getByText("ورد القرآن الكريم")).toBeInTheDocument();
    expect(screen.getByText("اضغط للتسجيل")).toBeInTheDocument();
    expect(screen.getByText("صلوات المسجد في جماعة")).toBeInTheDocument();
    expect(screen.getByText("لم تسجل صلاة جماعة")).toBeInTheDocument();
    expect(screen.getByText("0/5")).toBeInTheDocument();
  });

  it("handles toggling quran wird", () => {
    const onToggleQuran = vi.fn();
    const onCycleMosque = vi.fn();

    render(
      <DailyCompanionsCard
        language="ar"
        quranWird={false}
        mosquePrayers={null}
        onToggleQuranWird={onToggleQuran}
        onCycleMosquePrayers={onCycleMosque}
      />,
    );

    const quranBtn = screen.getByRole("button", { name: /ورد القرآن الكريم/ });
    fireEvent.click(quranBtn);
    expect(onToggleQuran).toHaveBeenCalledTimes(1);
  });

  it("handles cycling mosque prayers", () => {
    const onToggleQuran = vi.fn();
    const onCycleMosque = vi.fn();

    render(
      <DailyCompanionsCard
        language="en"
        quranWird={true}
        mosquePrayers="mosque_3"
        onToggleQuranWird={onToggleQuran}
        onCycleMosquePrayers={onCycleMosque}
      />,
    );

    expect(screen.getByText("Quran Wird")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("3 prayers at mosque")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();

    const mosqueBtn = screen.getByRole("button", { name: /Mosque Prayers/ });
    fireEvent.click(mosqueBtn);
    expect(onCycleMosque).toHaveBeenCalledTimes(1);
  });

  it("renders 5 prayers state correctly", () => {
    render(
      <DailyCompanionsCard
        language="ar"
        quranWird={true}
        mosquePrayers="mosque_5"
        onToggleQuranWird={vi.fn()}
        onCycleMosquePrayers={vi.fn()}
      />,
    );

    expect(screen.getByText("٥ صلوات في المسجد")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("renders in-progress fractional pages correctly for Arabic and English", () => {
    const { rerender } = render(
      <DailyCompanionsCard
        language="ar"
        quranWird={false}
        quranProgress={{ progress: 1, goal: 4 }}
        mosquePrayers={null}
        onToggleQuranWird={vi.fn()}
        onCycleMosquePrayers={vi.fn()}
      />,
    );

    // In Arabic: subtitle "١ / ٤ صفحة" and badge "١/٤"
    expect(screen.getByText("١ / ٤ صفحة")).toBeInTheDocument();
    expect(screen.getByText("١/٤")).toBeInTheDocument();

    // In English: subtitle "1 / 4 pages" and badge "1/4"
    rerender(
      <DailyCompanionsCard
        language="en"
        quranWird={false}
        quranProgress={{ progress: 1, goal: 4 }}
        mosquePrayers={null}
        onToggleQuranWird={vi.fn()}
        onCycleMosquePrayers={vi.fn()}
      />,
    );

    expect(screen.getByText("1 / 4 pages")).toBeInTheDocument();
    expect(screen.getByText("1/4")).toBeInTheDocument();
  });

  it("renders completed state with progress badge when goal is achieved", () => {
    render(
      <DailyCompanionsCard
        language="en"
        quranWird={true}
        quranProgress={{ progress: 4, goal: 4 }}
        mosquePrayers={null}
        onToggleQuranWird={vi.fn()}
        onCycleMosquePrayers={vi.fn()}
      />,
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("4/4")).toBeInTheDocument();
  });
});
