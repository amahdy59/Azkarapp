import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PrayerMinuteAdjustments } from "./PrayerMinuteAdjustments";

describe("PrayerMinuteAdjustments", () => {
  it("exposes labelled bounded choices and an explicit reset without number fields", () => {
    const changed = vi.fn();
    const reset = vi.fn();
    render(
      <PrayerMinuteAdjustments language="en" value={{ fajr: -120, isha: 120 }} onChange={changed} onReset={reset} />,
    );
    expect(screen.getByRole("button", { name: "Move Fajr one minute earlier" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Isha one minute later" })).toBeDisabled();
    const later = screen.getByRole("button", { name: "Move Fajr one minute later" });
    expect(later).toHaveAccessibleDescription("-120 min");
    fireEvent.click(later);
    expect(changed).toHaveBeenCalledExactlyOnceWith("fajr", -119);
    fireEvent.click(screen.getByRole("button", { name: "Reset adjustments" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("labels Arabic actions and disables reset when every offset is zero", () => {
    render(<PrayerMinuteAdjustments language="ar" value={{}} onChange={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByRole("button", { name: "تقديم الفجر دقيقة واحدة" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "تأخير الفجر دقيقة واحدة" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "إعادة ضبط التعديلات" })).toBeDisabled();
  });
});
