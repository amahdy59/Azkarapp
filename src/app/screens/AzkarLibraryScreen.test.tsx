import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { CategoryId } from "../types";
import { normalizeSearchText } from "../content/searchNormalization";
import { AzkarLibraryScreen } from "./AzkarLibraryScreen";

describe("AzkarLibraryScreen", () => {
  it("keeps collections primary and exposes one clear Benefits destination", () => {
    const onOpenBenefits = vi.fn();
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
        onOpenBenefits={onOpenBenefits}
      />,
    );

    const collection = screen.getByRole("button", { name: /^Morning Azkar/ });
    const benefits = screen.getByTestId("library-benefits-tool");
    expect(collection.compareDocumentPosition(benefits) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.queryByTestId("library-quran-tool")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Masbaha" })).not.toBeInTheDocument();

    fireEvent.click(benefits);
    expect(onOpenBenefits).toHaveBeenCalledOnce();
  });

  it("shows Collections and Saved as an accessible two-tab switch", async () => {
    const user = userEvent.setup();
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const tabs = screen.getByRole("tablist", { name: "Azkar Library" });
    const collections = screen.getByTestId("library-section-collections");
    const saved = screen.getByTestId("library-section-saved");
    expect(tabs).toBeVisible();
    expect(collections).toHaveAttribute("aria-selected", "true");
    expect(saved).toHaveAttribute("aria-selected", "false");
    await user.click(saved);
    expect(saved).toHaveAttribute("aria-selected", "true");
    expect(collections).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
  });

  it("offers Collections and Saved through one compact section menu", async () => {
    const user = userEvent.setup();
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const sectionMenu = screen.getByTestId("library-mobile-section");
    expect(sectionMenu).toHaveAttribute("aria-haspopup", "menu");
    expect(sectionMenu).toHaveTextContent("Collections");
    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");

    await user.click(sectionMenu);
    const saved = screen.getByRole("menuitemradio", { name: "Saved" });
    expect(saved).toHaveAttribute("aria-checked", "false");
    await user.click(saved);

    expect(sectionMenu).toHaveTextContent("Saved");
    expect(screen.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
  });

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

    const input = screen.getByRole("textbox", { name: "Search azkar and duas" }) as HTMLInputElement;
    expect(input.labels?.[0]).toBeVisible();
    expect(input.labels?.[0]).toHaveTextContent("Search azkar and duas");

    expect(screen.getByRole("button", { name: /^Morning Azkar/ })).toBeInTheDocument();

    // Typing narrows the visible collections and must never leave the Library.
    fireEvent.change(input, { target: { value: " sleep " } });
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /^Morning Azkar/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Before Sleep Azkar/ })).toBeInTheDocument();
    expect(screen.getByTestId("library-filter-status")).toHaveTextContent("1 collection matches “sleep”");
    expect(screen.getByTestId("library-filter-status")).toHaveAttribute("aria-live", "polite");
  });

  it("keeps search within the library page and allows opening matching zikr directly", () => {
    const onSearch = vi.fn();
    const onZikr = vi.fn();

    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={onZikr}
        onSearch={onSearch}
        savedZikrIds={new Set()}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search azkar and duas" }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: " " } });
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).not.toHaveBeenCalled();

    // Searching in-page shows results and submitting delegates to onSearch
    fireEvent.change(input, { target: { value: "sleep" } });
    fireEvent.submit(input.closest("form")!);
    expect(onSearch).toHaveBeenCalledWith("sleep");

    // Matching collections and matching azkar are rendered in-page
    expect(screen.getByRole("button", { name: /^Before Sleep Azkar/ })).toBeInTheDocument();
    const matchingZikrCards = screen.getAllByTestId("matching-zikr-card");
    expect(matchingZikrCards.length).toBeGreaterThan(0);

    // Clicking a matching zikr directly calls onZikr
    fireEvent.click(matchingZikrCards[0]);
    expect(onZikr).toHaveBeenCalledOnce();

    // Clear button resets the search
    const clearBtn = screen.getAllByRole("button", { name: "Clear search" })[0];
    fireEvent.click(clearBtn);
    expect(input.value).toBe("");
    expect(screen.getByRole("button", { name: /^Morning Azkar/ })).toBeInTheDocument();
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

  it("normalizes unvocalized Arabic search and finds vocalized azkar in-page", () => {
    const onZikr = vi.fn();
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="ar"
        direction="rtl"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={onZikr}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const input = screen.getByRole("textbox") as HTMLInputElement;
    // Type without tashkeel
    fireEvent.change(input, { target: { value: "حسبي الله" } });

    const matchingZikrCards = screen.getAllByTestId("matching-zikr-card");
    expect(matchingZikrCards.length).toBeGreaterThan(0);
    expect(normalizeSearchText(matchingZikrCards[0].textContent!)).toContain("حسبي الله");

    fireEvent.click(matchingZikrCards[0]);
    expect(onZikr).toHaveBeenCalled();
  });

  it("shows empty state when no results match and restores on clear", () => {
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

    const input = screen.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "xyznonexistent" } });

    expect(screen.getByRole("heading", { name: "لم يتم العثور على أذكار" })).toBeInTheDocument();
    const clearActions = screen.getAllByRole("button", { name: "مسح البحث" });
    expect(clearActions.length).toBeGreaterThan(0);
    fireEvent.click(clearActions[0]);
    expect(input.value).toBe("");
  });

  it("provides horizontal scroll affordances for category filter chips", () => {
    render(
      <AzkarLibraryScreen
        completed={{} as Record<CategoryId, Set<string>>}
        language="en"
        direction="ltr"
        routineModes={{ morning: "core", evening: "core", before_sleep: "core", after_prayer: "core" }}
        onCategory={() => undefined}
        onZikr={() => undefined}
        onSearch={() => undefined}
        savedZikrIds={new Set()}
      />,
    );

    const scrollContainer = screen.getByTestId("library-category-group-scroll");
    expect(scrollContainer).toBeInTheDocument();

    // Mock scroll dimensions
    Object.defineProperty(scrollContainer, "scrollWidth", { configurable: true, value: 500 });
    Object.defineProperty(scrollContainer, "clientWidth", { configurable: true, value: 300 });
    Object.defineProperty(scrollContainer, "scrollLeft", { configurable: true, value: 50, writable: true });

    fireEvent.scroll(scrollContainer);

    expect(screen.getByTestId("library-scroll-fade-start")).toBeInTheDocument();
    expect(screen.getByTestId("library-scroll-fade-end")).toBeInTheDocument();
  });
});
