import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fridayKahfOpenedKey, writeFridaySalawatProgress } from "../fridayProgress";
import { FridayModeScreen } from "./FridayModeScreen";

describe("FridayModeScreen", () => {
  beforeEach(() => localStorage.clear());
  afterEach(cleanup);

  it("treats Al-Kahf as one complete surah and can launch it again", () => {
    const onStartKahf = vi.fn();
    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={1}
        duasCompletedCount={0}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={onStartKahf}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Start reading" }));
    expect(onStartKahf).toHaveBeenCalledOnce();
  });

  it("reports only the Al-Kahf status it can actually prove", () => {
    const { unmount } = render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={0}
        duasCompletedCount={0}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );

    // Nothing opened and nothing completed — no invented verse number.
    expect(screen.getByText("Not started")).toBeInTheDocument();
    expect(screen.queryByText(/Ayah/)).not.toBeInTheDocument();

    unmount();
    localStorage.setItem(fridayKahfOpenedKey(), "true");
    const { rerender } = render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={0}
        duasCompletedCount={0}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );
    expect(screen.getByText("In progress")).toBeInTheDocument();

    rerender(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={1}
        duasCompletedCount={0}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );

    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("keeps the Sunnahs as a weekly checklist and the duas behind one action", () => {
    const onStartDuasSession = vi.fn();
    const onOpenSalawat = vi.fn();
    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={0}
        duasCompletedCount={0}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={onOpenSalawat}
        onStartDuasSession={onStartDuasSession}
      />,
    );

    const ghusl = screen.getByRole("checkbox", { name: "Perform ghusl" });
    expect(ghusl).toHaveAttribute("aria-checked", "false");
    fireEvent.click(ghusl);
    expect(ghusl).toHaveAttribute("aria-checked", "true");

    expect(screen.getAllByRole("checkbox")).toHaveLength(7);

    fireEvent.click(screen.getByRole("button", { name: /Salawat Counter/ }));
    expect(onOpenSalawat).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole("button", { name: /Comprehensive Duas/ }));
    expect(onStartDuasSession).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Show benefit and source" })).not.toBeInTheDocument();
    expect(screen.queryByText("Set aside a quiet time for dua before sunset.")).not.toBeInTheDocument();
  });

  it("derives the three smart-card completions automatically", () => {
    writeFridaySalawatProgress({ count: 10, target: 10 });

    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={1}
        duasCompletedCount={47}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );

    expect(screen.getByText("3 / 10")).toBeInTheDocument();
    expect(screen.getByText(/blessed step/i)).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(7);
  });

  it("announces the completed Friday routine after all weekly practices are done", () => {
    writeFridaySalawatProgress({ count: 10, target: 10 });
    render(
      <FridayModeScreen
        isArabic={false}
        direction="ltr"
        kahfCompletedCount={1}
        duasCompletedCount={47}
        duasTotalCount={47}
        onBack={() => undefined}
        onStartKahf={() => undefined}
        onOpenSalawat={() => undefined}
        onStartDuasSession={() => undefined}
      />,
    );

    for (const practice of screen.getAllByRole("checkbox")) fireEvent.click(practice);

    expect(screen.getAllByText("10 / 10").length).toBeGreaterThan(0);
    expect(screen.getByRole("status")).toHaveTextContent("may Allah accept");
  });
});
