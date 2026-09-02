import { fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { useSwipeGestures } from "./useSwipeGestures";

function Surface({
  direction = "rtl",
  onNext = vi.fn(),
  onPrev = vi.fn(),
  reduceMotion = false,
}: {
  direction?: "ltr" | "rtl";
  onNext?: () => void;
  onPrev?: () => void;
  reduceMotion?: boolean;
}) {
  const { onTouchStart, onTouchMove, onTouchEnd, dragStyle } = useSwipeGestures({
    direction,
    onNext,
    onPrev,
    reduceMotion,
  });
  return (
    <div data-testid="surface" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div data-testid="page" style={dragStyle} />
    </div>
  );
}

const touch = (x: number, y: number) => ({ touches: [{ clientX: x, clientY: y }] });
const release = (x: number, y: number) => ({ changedTouches: [{ clientX: x, clientY: y }] });

describe("reader page drag", () => {
  it("follows the thumb while the gesture is in progress", () => {
    render(<Surface />);
    const surface = screen.getByTestId("surface");
    const page = screen.getByTestId("page");

    expect(page.style.transform).toBe("");
    fireEvent.touchStart(surface, touch(200, 400));
    fireEvent.touchMove(surface, touch(160, 400));
    // Damped, not one-for-one: a page that follows exactly would leave the
    // screen before the gesture ended.
    expect(page.style.transform).toBe("translateX(-22px)");
    expect(page.style.transition).toBe("none");
  });

  it("caps how far the page can travel, so the threshold stays legible", () => {
    render(<Surface />);
    const surface = screen.getByTestId("surface");
    fireEvent.touchStart(surface, touch(300, 400));
    fireEvent.touchMove(surface, touch(-900, 400));
    expect(screen.getByTestId("page").style.transform).toBe("translateX(-72px)");
  });

  it("returns on the same sprung curve a press uses", () => {
    render(<Surface />);
    const surface = screen.getByTestId("surface");
    fireEvent.touchStart(surface, touch(200, 400));
    fireEvent.touchMove(surface, touch(180, 400));
    fireEvent.touchEnd(surface, release(180, 400));

    const page = screen.getByTestId("page");
    expect(page.style.transform).toBe("");
    expect(page.style.transition).toContain("--motion-ease-release");
  });

  it("does not drag sideways during a vertical scroll", () => {
    render(<Surface />);
    const surface = screen.getByTestId("surface");
    fireEvent.touchStart(surface, touch(200, 400));
    // Mostly vertical: a long surah being scrolled. The axis locks on the first
    // meaningful movement and holds, so a wandering thumb cannot start dragging
    // the page halfway through a scroll.
    fireEvent.touchMove(surface, touch(205, 340));
    fireEvent.touchMove(surface, touch(260, 300));
    expect(screen.getByTestId("page").style.transform).toBe("");
  });

  it("does not turn the page when the gesture was a scroll", () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    render(<Surface onNext={onNext} onPrev={onPrev} />);
    const surface = screen.getByTestId("surface");
    fireEvent.touchStart(surface, touch(200, 400));
    fireEvent.touchMove(surface, touch(202, 300));
    fireEvent.touchEnd(surface, release(300, 300));
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });

  it("turns forward in the direction the script reads", () => {
    const rtlNext = vi.fn();
    const { unmount } = render(<Surface direction="rtl" onNext={rtlNext} />);
    const rtl = screen.getByTestId("surface");
    fireEvent.touchStart(rtl, touch(100, 400));
    fireEvent.touchMove(rtl, touch(200, 400));
    fireEvent.touchEnd(rtl, release(200, 400));
    expect(rtlNext).toHaveBeenCalledTimes(1);
    unmount();

    const ltrNext = vi.fn();
    render(<Surface direction="ltr" onNext={ltrNext} />);
    const ltr = screen.getByTestId("surface");
    fireEvent.touchStart(ltr, touch(200, 400));
    fireEvent.touchMove(ltr, touch(100, 400));
    fireEvent.touchEnd(ltr, release(100, 400));
    expect(ltrNext).toHaveBeenCalledTimes(1);
  });

  it("still turns the page under reduced motion, without the drag", () => {
    const onNext = vi.fn();
    render(<Surface reduceMotion onNext={onNext} />);
    const surface = screen.getByTestId("surface");
    fireEvent.touchStart(surface, touch(100, 400));
    fireEvent.touchMove(surface, touch(200, 400));
    expect(screen.getByTestId("page").style.transform).toBe("");
    fireEvent.touchEnd(surface, release(200, 400));
    expect(onNext).toHaveBeenCalledTimes(1);
  });
});

describe("the reader applies the gesture on every layout", () => {
  it("carries the drag and the press in both branches, not just the wide one", () => {
    const reader = readFileSync("src/app/screens/ReaderScreen.tsx", "utf8");
    // The reader renders two different trees, one for phones and one from the
    // tablet breakpoint up. The drag and the press hung off the wide branch
    // alone, so on a phone the page followed nothing and a tap to count moved
    // nothing — on the device where a swipe and a tap are the only controls.
    expect(reader.match(/style=\{dragStyle\}/g)).toHaveLength(2);
    expect(reader.match(/style=\{pressStyle\}/g)).toHaveLength(2);
    expect(reader.match(/renderReadingContent\(\)/g)).toHaveLength(2);
  });
});
