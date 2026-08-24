import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AyahInteractionSheet } from "./AyahInteractionSheet";

describe("AyahInteractionSheet", () => {
  afterEach(() => vi.restoreAllMocks());

  it("copies the supplied canonical Unicode text and toggles the verse bookmark", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const onBookmark = vi.fn();

    render(
      <AyahInteractionSheet
        isOpen
        onClose={vi.fn()}
        verseKey="2:255"
        text="ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ"
        language="en"
        isBookmarked={false}
        onBookmark={onBookmark}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Copy ayah" }));
    expect(writeText).toHaveBeenCalledWith("ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ");
    expect(screen.getByRole("status")).toHaveTextContent("Ayah copied to clipboard.");

    await user.click(screen.getByRole("button", { name: "Bookmark ayah" }));
    expect(onBookmark).toHaveBeenCalledOnce();
  });

  it("disables text actions until canonical text has loaded", () => {
    render(
      <AyahInteractionSheet
        isOpen
        onClose={vi.fn()}
        verseKey="2:255"
        text={null}
        language="en"
        isBookmarked={false}
        onBookmark={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Copy ayah" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Share ayah" })).toBeDisabled();
    expect(screen.getByText("Preparing the canonical Quran text…")).toBeInTheDocument();
  });
});
