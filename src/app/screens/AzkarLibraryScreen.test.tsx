import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CategoryId } from "../types";
import { AzkarLibraryScreen } from "./AzkarLibraryScreen";

describe("AzkarLibraryScreen", () => {
  it("keeps the collection available from the Azkar Library every day", () => {
    const onCategory = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={onCategory}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const card = screen.getByRole("button", {
      name: "Comprehensive Duas, 0 of 47 complete",
    });
    fireEvent.click(card);

    expect(onCategory).toHaveBeenCalledWith("comprehensive_duas");
  });

  it("filters collections in place while typing instead of navigating away", () => {
    const onSearch = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={onSearch}
        savedZikrIds={new Set()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search adhkar and duas" }) as HTMLInputElement;
    expect(input.labels?.[0]).toBeVisible();
    expect(input.labels?.[0]).toHaveTextContent("Search adhkar and duas");

    expect(screen.getByRole("button", { name: /^Morning Azkar/ })).toBeInTheDocument();

    // Typing narrows the visible collections and must never leave the Library.
    fireEvent.change(input, { target: { value: " sleep " } });
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /^Morning Azkar/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Before Sleep Azkar/ })).toBeInTheDocument();
    expect(screen.getByTestId("library-filter-status")).toHaveTextContent("1 collection matches “sleep”");
    expect(screen.getByTestId("library-filter-status")).toHaveAttribute("aria-live", "polite");
  });

  it("escalates to full search only when the query is submitted", () => {
    const onSearch = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={onSearch}
        savedZikrIds={new Set()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search adhkar and duas" }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: " " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: " sleep " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith("sleep");
  });

  it("starts an empty Arabic query in RTL and uses automatic direction after typing", () => {
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="ar"
        direction="rtl"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("lang", "ar");

    fireEvent.change(input, { target: { value: " " } });
    expect(input).toHaveAttribute("dir", "rtl");

    fireEvent.change(input, { target: { value: "English" } });
    expect(input).toHaveAttribute("dir", "auto");
  });
});
