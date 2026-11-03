import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ResponsiveFilters } from "./ResponsiveFilters";

afterEach(() => vi.unstubAllGlobals());

it.each([false, true])(
  "opens a phone sheet with icon-only=%s, preserves values and restores focus",
  async (compactIconOnly) => {
    vi.stubGlobal("innerWidth", 390);
    function Filters() {
      const [value, setValue] = useState("morning");
      return (
        <ResponsiveFilters
          compactIconOnly={compactIconOnly}
          label="Search and filters"
          summary="Daily azkar"
          testId="filters"
        >
          {({ collapse }) => (
            <>
              <input aria-label="Search" value={value} onChange={(event) => setValue(event.target.value)} />
              <button onClick={collapse}>Show results</button>
            </>
          )}
        </ResponsiveFilters>
      );
    }
    render(<Filters />);
    const details = screen.getByTestId("filters");
    const summary = screen.getByRole("button", { name: /Search and filters/ });
    expect(summary).toHaveAttribute("aria-expanded", "false");
    summary.focus();
    fireEvent.click(summary);
    await waitFor(() => expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement));
    expect(screen.getByRole("textbox")).toHaveValue("morning");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "evening" } });
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Search and filters");
    expect(details).not.toContainElement(screen.getByRole("dialog"));
    fireEvent.click(screen.getByRole("button", { name: "Show results" }));
    expect(summary).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(summary).toHaveFocus());
    fireEvent.click(summary);
    expect(screen.getByRole("textbox")).toHaveValue("evening");
  },
);

it("keeps wider-layout controls exposed when a choice is completed", () => {
  vi.stubGlobal("innerWidth", 900);
  render(
    <ResponsiveFilters label="Filters" summary="Week" testId="filters">
      {({ collapse }) => <button onClick={collapse}>Choose week</button>}
    </ResponsiveFilters>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Choose week" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Choose week" })).toBeVisible();
});
