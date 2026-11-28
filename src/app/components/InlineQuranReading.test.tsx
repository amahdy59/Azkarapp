import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { QuranReadingZoom } from "./QuranReadingZoom";
import { dismissTopOverlay } from "../hooks/useOverlayBack";

const words = [
  { id: "one", text: "first" },
  { id: "two", text: "second" },
  { id: "three", text: "third" },
];
function Reader() {
  return (
    <QuranReadingZoom inline words={words} language="en">
      {(trigger, enlarged, header) => (
        <>
          {header}
          {trigger}
          {enlarged}
        </>
      )}
    </QuranReadingZoom>
  );
}
describe("continuous inline Quran enlargement", () => {
  it("keeps all words once and returns to the printed view when decreased to 100%", () => {
    render(<Reader />);
    const trigger = screen.getByRole("button", { name: "Enlarge text" });
    expect(trigger).toHaveTextContent("Enlarge");
    fireEvent.click(trigger);
    expect(screen.getByTestId("quran-zoom-header")).toHaveTextContent("150%");
    expect(
      [...screen.getByTestId("quran-enlarged-text").querySelectorAll("[data-zoom-word]")].map(
        (word) => word.textContent,
      ),
    ).toEqual(words.map((word) => word.text));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Smaller Quran text" }));
    expect(screen.getByTestId("quran-zoom-header")).toHaveTextContent("125%");
    fireEvent.click(screen.getByRole("button", { name: "Smaller Quran text" }));
    expect(screen.queryByTestId("quran-enlarged-reading")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("supports Page view, Escape and Android Back, without losing source words", () => {
    render(<Reader />);
    const trigger = screen.getByRole("button", { name: "Enlarge text" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Page view" }));
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("quran-enlarged-reading")).not.toBeInTheDocument();
    fireEvent.click(trigger);
    expect(dismissTopOverlay()).toBe(true);
  });
  it("bounds the one header stepper and pauses following through the supplied callback", () => {
    const onOpen = vi.fn();
    render(
      <QuranReadingZoom inline words={words} language="en" onOpen={onOpen}>
        {(trigger, enlarged, header) => (
          <>
            {header}
            {trigger}
            {enlarged}
          </>
        )}
      </QuranReadingZoom>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Enlarge text" }));
    expect(onOpen).toHaveBeenCalledOnce();
    const increase = screen.getByRole("button", { name: "Larger Quran text" });
    for (let step = 0; step < 4; step++) fireEvent.click(increase);
    expect(increase).toBeDisabled();
    expect(screen.getByTestId("quran-zoom-header")).toHaveTextContent("250%");
  });
});
