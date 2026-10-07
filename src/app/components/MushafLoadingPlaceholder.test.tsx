import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MushafLoadingPlaceholder } from "./MushafLoadingPlaceholder";

describe("Mushaf first-load placeholder", () => {
  it.each([false, true])("reserves equal 15-line leaves for spread=%s", (spread) => {
    render(<MushafLoadingPlaceholder language="en" spread={spread} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    const leaves = screen.getAllByTestId("mushaf-loading-leaf");
    expect(leaves).toHaveLength(spread ? 2 : 1);
    for (const leaf of leaves) expect(leaf.children).toHaveLength(15);
  });
});
