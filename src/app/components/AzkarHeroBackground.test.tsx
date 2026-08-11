import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AzkarHeroBackground } from "./AzkarHeroBackground";
import { TimeOfDayBackground } from "./TimeOfDayBackground";

describe("AzkarHeroBackground", () => {
  it("emits the standard fetch-priority hint without a React DOM warning", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { container } = render(<AzkarHeroBackground kind="morning" priority />);

    expect(container.querySelector("img")).toHaveAttribute("fetchpriority", "high");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it("provides responsive focal points that keep the subject in view", () => {
    const { container } = render(<AzkarHeroBackground kind="sleep" />);
    const picture = container.querySelector("picture");

    expect(picture?.style.getPropertyValue("--azkar-bg-position")).toBe("25% 74%");
    expect(picture?.style.getPropertyValue("--azkar-bg-position-wide")).toBe("42% 72%");
  });

  it("adds a small decorative, non-interactive particle layer", () => {
    const { container } = render(<TimeOfDayBackground categoryId="evening" variant="card" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".azkar-hero-particle")).toHaveLength(9);
  });
});
