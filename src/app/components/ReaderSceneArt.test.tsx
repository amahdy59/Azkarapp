import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReaderSceneArt } from "./ReaderSceneArt";
import { Header } from "./LayoutShells";

describe("Reader scene", () => {
  it.each(["morning", "evening", "before_sleep", "travel"] as const)(
    "keeps %s artwork decorative and independent of remote assets",
    (category) => {
      const { container } = render(<ReaderSceneArt category={category} />);
      expect(screen.getByTestId("reader-scene")).toHaveAttribute("aria-hidden", "true");
      expect(screen.getByTestId("reader-scene")).toHaveAttribute(
        "data-scene",
        category === "travel" ? "neutral" : category,
      );
      expect(container.querySelector("svg")).toHaveAttribute("focusable", "false");
      expect(container.querySelector("svg")).toHaveAttribute("preserveAspectRatio", "xMidYMax meet");
      expect(container.querySelectorAll("image, img, a, button, [tabindex], animate, filter")).toHaveLength(0);
    },
  );

  it("preserves compact header semantics and minimum height", () => {
    render(<Header title="Morning Azkar" decoration={<ReaderSceneArt category="morning" compact />} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Morning Azkar");
    expect(screen.getByTestId("shared-screen-header")).toHaveStyle({ minHeight: "56px" });
    expect(screen.getByTestId("reader-scene")).toHaveClass("reader-scene--compact");
  });

  it("allows the Reader to match its borderless back button without changing ordinary headers", () => {
    const { rerender } = render(<Header title="Morning Azkar" onBack={() => {}} backButtonClassName="reader-ghost" />);
    expect(screen.getByRole("button", { name: "Back" })).toHaveClass("reader-ghost");
    rerender(<Header title="Library" onBack={() => {}} />);
    expect(screen.getByRole("button", { name: "Back" })).not.toHaveClass("reader-ghost");
  });
});
