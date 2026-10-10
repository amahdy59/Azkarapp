import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { QuranListeningTranslation } from "./QuranListeningTranslation";

const verses = [
  { verseKey: "67:1", text: "Reviewed first meaning ", marker: "(1)" },
  { verseKey: "67:2", text: " Reviewed second meaning ", marker: "(2)" },
];

describe("paired English reading", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("scrolls only its own pane to the active verse while preserving keyboard focus and manual control", () => {
    const props = { verses, textSize: "medium" as const, pageNumber: 562, follow: true };
    const { rerender } = render(<QuranListeningTranslation {...props} activeVerseKey="67:1" />);
    const region = screen.getByRole("region", { name: "English meaning" });
    const active = region.querySelector<HTMLElement>('[data-translation-verse="67:2"]')!;
    Object.defineProperties(region, { clientHeight: { value: 200 }, scrollHeight: { value: 1000 } });
    region.getBoundingClientRect = () => ({ top: 0, bottom: 200 }) as DOMRect;
    active.getBoundingClientRect = () => ({ top: 400, bottom: 500 }) as DOMRect;
    const scroll = vi.fn();
    region.scrollTo = scroll;
    region.focus();
    rerender(<QuranListeningTranslation {...props} activeVerseKey="67:2" />);
    expect(scroll).toHaveBeenCalledWith({ top: 400, behavior: "instant" });
    expect(active).toHaveAttribute("aria-current", "true");
    expect(region).toHaveFocus();
    expect(region).toHaveAttribute("lang", "en");
    expect(region).toHaveAttribute("dir", "ltr");
    scroll.mockClear();
    rerender(<QuranListeningTranslation {...props} follow={false} activeVerseKey="67:1" />);
    expect(scroll).not.toHaveBeenCalled();
    rerender(<QuranListeningTranslation {...props} follow={false} pageNumber={563} activeVerseKey={null} />);
    expect(region.scrollTop).toBe(0);
  });
  it("preserves the disclosure choice and uses the app's scalable English text steps", () => {
    const props = { verses, activeVerseKey: null, follow: true, pageNumber: 562 };
    const { rerender } = render(<QuranListeningTranslation {...props} textSize="small" />);
    const disclosure = screen.getByTestId("quran-page-translation");
    const region = screen.getByRole("region", { name: "English meaning" });
    expect(region.style.fontSize).toBe("1.125rem");
    rerender(<QuranListeningTranslation {...props} textSize="large" />);
    expect(region.style.fontSize).toBe("1.5rem");
    (disclosure as HTMLDetailsElement).open = false;
    fireEvent(disclosure, new Event("toggle"));
    rerender(<QuranListeningTranslation {...props} textSize="large" pageNumber={563} />);
    expect(disclosure).not.toHaveAttribute("open");
  });
  it("keeps the cue visible after native pane resizing and releases observation when following stops", () => {
    let resize = () => {};
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resize = callback;
        }
        observe = vi.fn();
        disconnect = disconnect;
      },
    );
    const props = { verses, textSize: "medium" as const, pageNumber: 562, follow: true, activeVerseKey: "67:2" };
    const { rerender } = render(<QuranListeningTranslation {...props} />);
    const region = screen.getByRole("region", { name: "English meaning" });
    Object.defineProperties(region, { clientHeight: { value: 200 }, scrollHeight: { value: 1000 } });
    region.getBoundingClientRect = () => ({ top: 0, bottom: 200 }) as DOMRect;
    region.querySelector<HTMLElement>('[aria-current="true"]')!.getBoundingClientRect = () =>
      ({ top: 400, bottom: 500 }) as DOMRect;
    const scroll = vi.fn();
    region.scrollTo = scroll;
    resize();
    expect(scroll).toHaveBeenCalledWith({ top: 400, behavior: "instant" });
    rerender(<QuranListeningTranslation {...props} follow={false} />);
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
