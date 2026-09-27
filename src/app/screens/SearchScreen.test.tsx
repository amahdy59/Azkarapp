import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { normalizeRecentSearches, SearchScreen } from "./SearchScreen";

describe("SearchScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = "en";
  });

  it("preserves an initial query and exposes a visible associated label", () => {
    render(
      <SearchScreen
        language="en"
        direction="ltr"
        initialQuery=" query "
        onBack={() => undefined}
        onZikr={() => undefined}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Search azkar and duas" }) as HTMLInputElement;
    expect(input).toHaveValue("query");
    expect(input).toHaveAttribute("dir", "auto");
    expect(input.labels?.[0]).toBeVisible();
    expect(input.labels?.[0]).toHaveTextContent("Search azkar and duas");
  });

  it("starts an empty Arabic query in RTL and follows the entered language", () => {
    render(<SearchScreen language="ar" direction="rtl" onBack={() => undefined} onZikr={() => undefined} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("dir", "rtl");
    expect(input).toHaveAttribute("lang", "ar");

    fireEvent.change(input, { target: { value: " " } });
    expect(input).toHaveAttribute("dir", "rtl");

    fireEvent.change(input, { target: { value: "English" } });
    expect(input).toHaveAttribute("dir", "auto");
  });

  it("clears all recent searches in a single action", () => {
    localStorage.setItem("azkarapp_recent_searches_en", JSON.stringify(["morning", "forgive"]));
    render(<SearchScreen language="en" direction="ltr" onBack={() => undefined} onZikr={() => undefined} />);

    expect(screen.getByRole("button", { name: "morning" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "forgive" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(screen.queryByRole("button", { name: "morning" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "forgive" })).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("azkarapp_recent_searches_en") ?? "[]")).toEqual([]);
  });

  it("recovers from malformed recent-search data without rendering invalid values", () => {
    localStorage.setItem(
      "azkarapp_recent_searches_en",
      JSON.stringify([null, 17, {}, "  morning  ", "", "morning", "forgive"]),
    );

    render(<SearchScreen language="en" direction="ltr" onBack={() => undefined} onZikr={() => undefined} />);

    expect(screen.getAllByRole("button", { name: "morning" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "forgive" })).toBeInTheDocument();
  });

  it("bounds and normalizes persisted recent searches", () => {
    expect(normalizeRecentSearches([" a ", "a", "b", "c", "d", "e", "f", null])).toEqual(["a", "b", "c", "d", "e"]);
  });

  it("updates the document title for the search route", () => {
    render(<SearchScreen language="en" direction="ltr" onBack={() => undefined} onZikr={() => undefined} />);
    expect(document.title).toBe("Search azkar and duas - wa-zaker");
  });

  it("renders Arabic result previews with zikr-text typography and whole-word match highlighting", () => {
    render(
      <SearchScreen
        language="ar"
        direction="rtl"
        initialQuery="احيانا"
        onBack={() => undefined}
        onZikr={() => undefined}
      />,
    );

    const results = screen.getAllByTestId("search-result");
    expect(results.length).toBeGreaterThan(0);

    const firstPreview = results[0]?.querySelector("p.zikr-text");
    expect(firstPreview).toBeInTheDocument();

    const highlighted = firstPreview?.querySelector("mark");
    expect(highlighted).toBeInTheDocument();
    expect(highlighted?.textContent).toContain("أَحْيَانَا");
  });
});
