import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SituationalShortcuts } from "./SituationalShortcuts";

describe("situational shortcuts", () => {
  it("opens existing collections and preserves native modified links", () => {
    const onOpen = vi.fn();
    render(<SituationalShortcuts language="en" onOpen={onOpen} />);
    const travel = screen.getByRole("link", { name: "Travel" });
    expect(travel).toHaveAttribute("href", "#/azkar/travel/1");
    fireEvent.click(travel);
    expect(onOpen).toHaveBeenCalledWith("travel");
    onOpen.mockClear();
    fireEvent.click(travel, { ctrlKey: true });
    expect(onOpen).not.toHaveBeenCalled();
    expect(screen.getAllByRole("link")).toHaveLength(6);
  });
  it("labels shortcuts in Arabic without duplicating devotional text", () => {
    render(<SituationalShortcuts language="ar" onOpen={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "أذكار لمواقف يومك" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "أذكار الكرب والهم" })).toHaveAttribute(
      "href",
      "#/azkar/distress-anxiety/1",
    );
  });
});
