import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useListeningTextFollowing } from "./useListeningTextFollowing";

it("scrolls only outside the viewport and respects manual navigation until resumed or track changed", () => {
  const root = document.createElement("div"),
    word = document.createElement("span"),
    input = document.createElement("input");
  word.dataset.listeningWord = "";
  root.append(word, input);
  root.getBoundingClientRect = () => ({ top: 100, bottom: 300 }) as DOMRect;
  word.getBoundingClientRect = () => ({ top: 350, bottom: 380 }) as DOMRect;
  const scroll = vi.fn();
  root.scrollTo = scroll;
  const reference = { current: root };
  const { result, rerender } = renderHook(({ cue, identity }) => useListeningTextFollowing(reference, cue, identity), {
    initialProps: { cue: 1, identity: "first" },
  });
  expect(scroll).toHaveBeenCalledWith({ top: 92, behavior: "instant" });
  act(() => root.dispatchEvent(new WheelEvent("wheel")));
  expect(result.current[0]).toBe(false);
  scroll.mockClear();
  rerender({ cue: 2, identity: "first" });
  expect(scroll).not.toHaveBeenCalled();
  act(() => result.current[1](true));
  expect(scroll).toHaveBeenCalledTimes(1);
  act(() => input.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown", bubbles: true })));
  expect(result.current[0]).toBe(true);
  act(() => root.dispatchEvent(new KeyboardEvent("keydown", { key: "PageDown" })));
  expect(result.current[0]).toBe(false);
  word.getBoundingClientRect = () => ({ top: 150, bottom: 180 }) as DOMRect;
  scroll.mockClear();
  rerender({ cue: 3, identity: "second" });
  expect(result.current[0]).toBe(true);
  expect(scroll).not.toHaveBeenCalled();
  act(() => root.dispatchEvent(new Event("touchmove")));
  expect(result.current[0]).toBe(false);
});
