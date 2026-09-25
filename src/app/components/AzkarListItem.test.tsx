import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Zikr } from "../types";
import { AzkarListItem } from "./AzkarListItem";

const zikr: Zikr = {
  id: "layout-test",
  canonicalKey: "layout-test",
  audioBehavior: {
    defaultMode: "play-once",
    supportedModes: ["play-once"],
  },
  arabicText: "سُبْحَانَ اللَّهِ",
  transliteration: "Subhan Allah",
  translation: "Glory be to Allah",
  benefit: "",
  repetitionCount: 1,
  sourceReference: "Test fixture",
  category: "morning",
  orderIndex: 0,
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("AzkarListItem disclosure", () => {
  it("hides the disclosure when the two-line summary does not overflow", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(64);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(64);

    render(<AzkarListItem z={zikr} index={0} isCardCompleted={false} language="en" isArabic={false} direction="ltr" />);

    expect(screen.queryByRole("button", { name: "Expand dhikr" })).not.toBeInTheDocument();
    expect(screen.getByText("Recite once")).toBeInTheDocument();
  });

  it("shows one native disclosure when the summary overflows", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(64);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(96);

    render(<AzkarListItem z={zikr} index={0} isCardCompleted={false} language="en" isArabic={false} direction="ltr" />);

    const disclosure = screen.getByRole("button", { name: "Expand dhikr" });
    expect(disclosure).toHaveAttribute("aria-expanded", "false");
    expect(disclosure).toHaveAttribute("aria-controls", "zikr-details-0");
    expect(screen.getByTestId("zikr-summary-0").closest("[role='button']")).toBeNull();
  });
});
