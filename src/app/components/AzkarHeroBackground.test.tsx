import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AzkarHeroBackground } from "./AzkarHeroBackground";
import { TimeOfDayBackground } from "./TimeOfDayBackground";

describe("AzkarHeroBackground", () => {
  it("reveals the photo only after decoding and keeps a new scene hidden until it is ready", async () => {
    let finishDecode!: () => void;
    const view = render(<AzkarHeroBackground kind="morning" />);
    const image = view.container.querySelector("img")!;
    Object.defineProperty(image, "naturalWidth", { value: 1280 });
    image.decode = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishDecode = resolve;
        }),
    );
    expect(image).toHaveStyle({ opacity: "0" });
    fireEvent.load(image);
    expect(image).toHaveStyle({ opacity: "0" });
    finishDecode();
    await waitFor(() => expect(image).toHaveStyle({ opacity: "1" }));
    view.rerender(<AzkarHeroBackground kind="evening" />);
    expect(view.container.querySelector("img")).toHaveStyle({ opacity: "0" });
  });
  it("recovers from a failed image when the scene changes", () => {
    const view = render(<AzkarHeroBackground kind="morning" />);
    fireEvent.error(view.container.querySelector("img")!);
    expect(view.container.querySelector("img")).toBeNull();
    view.rerender(<AzkarHeroBackground kind="evening" />);
    expect(view.container.querySelector("img")).toHaveStyle({ opacity: "0" });
  });
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

  it("keeps the time-of-day image unobstructed by overlay layers", () => {
    const { container } = render(<TimeOfDayBackground categoryId="evening" />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("z-0");
    expect(container.firstElementChild).toHaveClass("absolute");
    expect(container.firstElementChild).not.toHaveClass("fixed");
    expect(container.firstElementChild).not.toHaveClass("-z-50");
    expect(container.querySelector("picture")).toBeInTheDocument();
    expect(container.querySelectorAll(".azkar-hero-particles, .azkar-hero__overlay")).toHaveLength(0);
  });
});
