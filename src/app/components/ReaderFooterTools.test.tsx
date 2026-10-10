import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ReaderFooterTools } from "./ReaderFooterTools";

it.each(["en", "ar"] as const)("discloses footer tools with keyboard and preserves focus in %s", async (language) => {
  function Example() {
    const [expanded, setExpanded] = useState(true);
    return (
      <ReaderFooterTools language={language} expanded={expanded} onToggle={() => setExpanded(!expanded)}>
        <button>Share</button>
      </ReaderFooterTools>
    );
  }
  const user = userEvent.setup();
  render(<Example />);
  const toggle = screen.getByRole("button", { name: language === "en" ? "Hide tools" : "إخفاء الأدوات" });
  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(document.getElementById(toggle.getAttribute("aria-controls")!)).toContainElement(screen.getByText("Share"));
  toggle.focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("button", { name: "Share" })).not.toBeInTheDocument();
  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(toggle).toHaveFocus();
  await user.keyboard(" ");
  expect(screen.getByRole("button", { name: "Share" })).toBeVisible();
  expect(toggle).toHaveFocus();
});

it("renders tools and primary counter without a disclosure toggle when onToggle is omitted", () => {
  render(
    <ReaderFooterTools primary={<button data-testid="counter">Count</button>}>
      <button data-testid="share">Share</button>
    </ReaderFooterTools>,
  );

  expect(screen.getByTestId("share")).toBeVisible();
  expect(screen.getByTestId("counter")).toBeVisible();
  expect(screen.queryByTestId("reader-tools-toggle")).not.toBeInTheDocument();
});
