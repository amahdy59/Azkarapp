import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ResponsiveFilters } from "./ResponsiveFilters";

afterEach(() => vi.unstubAllGlobals());

it("starts compact on phones, preserves values and restores focus when results are requested", () => {
  vi.stubGlobal("innerWidth", 390);
  render(
    <ResponsiveFilters label="Search and filters" summary="Daily azkar" testId="filters">
      {({ collapse }) => (
        <>
          <input aria-label="Search" defaultValue="morning" />
          <button onClick={collapse}>Show results</button>
        </>
      )}
    </ResponsiveFilters>,
  );
  const details = screen.getByTestId("filters");
  const summary = details.querySelector("summary")!;
  expect(details).not.toHaveAttribute("open");
  fireEvent.click(summary);
  expect(screen.getByRole("textbox")).toHaveValue("morning");
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "evening" } });
  expect(details).toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Show results" }));
  expect(details).not.toHaveAttribute("open");
  expect(summary).toHaveFocus();
  fireEvent.click(summary);
  expect(screen.getByRole("textbox")).toHaveValue("evening");
});

it("keeps wider-layout controls exposed when a choice is completed", () => {
  vi.stubGlobal("innerWidth", 900);
  render(
    <ResponsiveFilters label="Filters" summary="Week" testId="filters">
      {({ collapse }) => <button onClick={collapse}>Choose week</button>}
    </ResponsiveFilters>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Choose week" }));
  expect(screen.getByTestId("filters")).toHaveAttribute("open");
});
