import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AzkarHeroBackground } from "./AzkarHeroBackground";

describe("AzkarHeroBackground", () => {
  it("emits the standard fetch-priority hint without a React DOM warning", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { container } = render(<AzkarHeroBackground kind="morning" priority />);

    expect(container.querySelector("img")).toHaveAttribute("fetchpriority", "high");
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
