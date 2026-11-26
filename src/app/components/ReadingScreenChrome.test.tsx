import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ReadingScreenChrome } from "./ReadingScreenChrome";

const { useMediaQuery } = vi.hoisted(() => ({ useMediaQuery: vi.fn() }));
vi.mock("../hooks/useMediaQuery", () => ({ useMediaQuery }));

describe("ReadingScreenChrome progress", () => {
  it.each([
    [false, "ar", "rtl"],
    [false, "en", "ltr"],
    [true, "ar", "rtl"],
    [true, "en", "ltr"],
  ] as const)("keeps 8px progress and accessible values (wide=%s, language=%s)", (wide, language, direction) => {
    useMediaQuery.mockReturnValue(wide);
    render(
      <ReadingScreenChrome
        language={language}
        direction={direction}
        title="Morning Azkar"
        onBack={() => {}}
        actions={() => null}
        progress={{ value: 5, max: 25, percentLabel: "20%", countLabel: "5 of 25", ariaLabel: "Collection completion" }}
        testId="reader"
      />,
    );
    const heading = screen.getByRole("heading", { level: 1, name: "Morning Azkar" });
    expect(heading).toHaveClass("text-foreground");
    expect(heading).not.toHaveClass("text-on-media-accent");
    expect(screen.queryByTestId("reader-scene")).not.toBeInTheDocument();
    if (wide) {
      expect(screen.getByTestId("reader-desktop-hero")).toHaveAttribute("data-seamless-header");
      expect(screen.getByTestId("reader-desktop-hero")).not.toHaveAttribute("style");
    }
    const progress = screen.getByRole("progressbar", { name: "Collection completion" });
    expect(progress).toHaveStyle({ height: "8px" });
    expect(progress).toHaveAttribute("dir", direction);
    expect(progress).toHaveAttribute("aria-valuenow", "5");
    expect(progress).toHaveAttribute("aria-valuemax", "25");
  });
});
