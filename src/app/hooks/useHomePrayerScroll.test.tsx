import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHomePrayerScroll } from "./useHomePrayerScroll";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setup(reduceMotion = false, canAnimate = true) {
  const content = document.createElement("div");
  const sticky = document.createElement("div");
  sticky.innerHTML =
    '<article data-density="summary"><span data-prayer-compact-countdown></span><div data-prayer-footer></div></article>';
  let height = 200;
  for (const element of [sticky, sticky.firstElementChild!])
    vi.spyOn(element, "getBoundingClientRect").mockImplementation(() => ({ height }) as DOMRect);
  const animations: { cancel: ReturnType<typeof vi.fn>; finished: Promise<void> }[] = [];
  const animate = vi.fn(() => {
    const animation = { cancel: vi.fn(), finished: Promise.resolve() };
    animations.push(animation);
    return animation;
  });
  if (canAnimate)
    for (const element of [sticky, ...sticky.querySelectorAll("*")])
      Object.defineProperty(element, "animate", { value: animate });
  const contentRef = { current: content };
  const stickyRef = { current: sticky };
  const view = renderHook(({ reduce }) => useHomePrayerScroll(contentRef, stickyRef, reduce), {
    initialProps: { reduce: reduceMotion },
  });
  const scroll = (position: number, nextHeight = height) =>
    act(() => {
      view.result.current.updateScroll(position);
      height = nextHeight;
    });
  return { view, scroll, animate, animations };
}

describe("Home prayer scroll transition", () => {
  it("coordinates card and sticky geometry with a single finite transition and hysteresis", () => {
    const { view, scroll, animate, animations } = setup();
    scroll(96);
    expect(view.result.current.condensed).toBe(false);
    expect(animate).not.toHaveBeenCalled();
    scroll(97, 172);
    expect(view.result.current.condensed).toBe(true);
    expect(animate).toHaveBeenCalledTimes(3);
    expect(animate.mock.calls[0]).toEqual([
      [{ height: "200px" }, { height: "172px" }],
      { duration: 180, easing: "cubic-bezier(0.2, 0, 0, 1)" },
    ]);
    scroll(40);
    expect(animate).toHaveBeenCalledTimes(3);
    scroll(8, 200);
    expect(view.result.current.condensed).toBe(false);
    expect(animate).toHaveBeenCalledTimes(6);
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    view.unmount();
    expect(animations.every((animation) => animation.cancel.mock.calls.length === 1)).toBe(true);
  });
  it("keeps reduced motion immediate and supports browsers without Web Animations", () => {
    for (const [reduce, supported] of [
      [true, true],
      [false, false],
    ]) {
      const run = setup(reduce, supported);
      run.scroll(150, 172);
      expect(run.view.result.current.condensed).toBe(true);
      expect(run.animate).not.toHaveBeenCalled();
      run.view.unmount();
    }
  });
  it("cancels active effects on application preference changes", () => {
    const { view, scroll, animations } = setup();
    scroll(150, 172);
    view.rerender({ reduce: true });
    expect(animations.every((animation) => animation.cancel.mock.calls.length === 1)).toBe(true);
  });
  it("observes OS preference changes and avoids interpolation of unchanged geometry", () => {
    let onChange: (() => void) | undefined;
    const media = {
      matches: false,
      addEventListener: vi.fn((_type, listener) => {
        onChange = listener;
      }),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue(media));
    const { view, scroll, animate, animations } = setup();
    scroll(150);
    expect(animate).toHaveBeenCalledTimes(1);
    media.matches = true;
    onChange?.();
    expect(animations[0].cancel).toHaveBeenCalledOnce();
    view.unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith("change", onChange);
    const reduced = setup();
    reduced.scroll(150);
    expect(reduced.animate).not.toHaveBeenCalled();
  });
});
