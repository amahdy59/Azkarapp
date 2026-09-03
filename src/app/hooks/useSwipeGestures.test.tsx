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

describe("one gesture across both reading surfaces", () => {
  it("leaves the Mushaf view no drag physics of its own", () => {
    const immersive = readFileSync("src/app/components/MushafImmersiveReader.tsx", "utf8");
    // It had a 1:1 unbounded translation with no cap and no axis lock, settled
    // by a 160ms ease that ran against the page-turn spring. Two curves on one
    // property is what made the swipe feel unnatural, and two implementations
    // of one gesture is why moving between the reader and the Mushaf felt like
    // moving between two apps.
    expect(immersive).toContain("useSwipeGestures");
    expect(immersive).not.toMatch(/translateX\(\$\{offset/);
    expect(immersive).not.toContain("PAPER_SETTLE");
    expect(immersive).not.toContain("SWIPE_THRESHOLD");
  });

  it("damps and caps a pointer drag exactly as it does a touch drag", () => {
    function PointerSurface({ onNext = vi.fn() }: { onNext?: () => void }) {
      const { pointerProps, dragStyle } = useSwipeGestures({ direction: "rtl", onNext, onPrev: vi.fn() });
      return (
        <div data-testid="surface" {...pointerProps}>
          <div data-testid="page" style={dragStyle} />
        </div>
      );
    }
    render(<PointerSurface />);
    const surface = screen.getByTestId("surface");
    fireEvent.pointerDown(surface, { pointerId: 1, button: 0, clientX: 300, clientY: 400 });
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 260, clientY: 400 });
    expect(screen.getByTestId("page").style.transform).toBe("translateX(-22px)");
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: -600, clientY: 400 });
    expect(screen.getByTestId("page").style.transform).toBe("translateX(-72px)");
  });

  it("ignores a pointer drag the axis lock called vertical", () => {
    const onNext = vi.fn();
    const onPrev = vi.fn();
    function PointerSurface() {
      const { pointerProps } = useSwipeGestures({ direction: "rtl", onNext, onPrev });
      return <div data-testid="surface" {...pointerProps} />;
    }
    render(<PointerSurface />);
    const surface = screen.getByTestId("surface");
    fireEvent.pointerDown(surface, { pointerId: 1, button: 0, clientX: 300, clientY: 400 });
    // A scroll that drifts sideways used to engage the drag at 12px of drift.
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 305, clientY: 300 });
    fireEvent.pointerMove(surface, { pointerId: 1, clientX: 380, clientY: 260 });
    fireEvent.pointerUp(surface, { pointerId: 1, clientX: 380, clientY: 260 });
    expect(onNext).not.toHaveBeenCalled();
    expect(onPrev).not.toHaveBeenCalled();
  });
});

describe("what a page turn is allowed to move", () => {
  it("hands the drag to the paper, not to the chrome around it", () => {
    const viewer = readFileSync("src/app/components/MushafPageViewer.tsx", "utf8");
    const surah = readFileSync("src/app/components/MushafImmersiveReader.tsx", "utf8");

    // The drag briefly wrapped the whole viewer, which holds the header, the
    // footer and the rail — so a swipe slid the entire screen sideways instead
    // of the page. MushafPageViewer's own contract says the paper is what a
    // page turn drags, "never the chrome around it".
    expect(viewer).toContain("paperStyle");
    expect(surah).toContain("paperStyle={dragStyle}");
    expect(surah).not.toMatch(/<div style=\{dragStyle\}[^>]*>\s*<MushafPageViewer/);
  });
});
