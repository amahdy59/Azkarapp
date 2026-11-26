import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { useLearningPosition } from "./useLearningLibrary";
import { learningCatalogue } from "../learning/catalogue";

afterEach(() => vi.restoreAllMocks());

it("restores the saved fraction against settled fonts and cancels after unmount", async () => {
  let ready!: () => void;
  const fonts = new Promise<void>((resolve) => {
    ready = resolve;
  });
  const original = Object.getOwnPropertyDescriptor(document, "fonts");
  Object.defineProperty(document, "fonts", { configurable: true, value: { ready: fonts } });
  const resource = learningCatalogue("ar")[0]!;
  localStorage.setItem(
    "azkar.learning.v1",
    JSON.stringify({ [resource.id]: { bookmarks: [], position: { unitId: "p-4", offset: 0.6 } } }),
  );
  let frame: FrameRequestCallback | undefined;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frame = callback;
    return 1;
  });
  const failure = vi.fn();
  function Reader() {
    const ref = useRef<HTMLDivElement>(null);
    useLearningPosition(resource, "p-4", ref, failure);
    return <div ref={ref} data-testid="scroll" />;
  }
  try {
    const view = render(<Reader />);
    const element = view.getByTestId("scroll");
    Object.defineProperties(element, {
      scrollHeight: { configurable: true, value: 500 },
      clientHeight: { value: 100 },
    });
    expect(frame).toBeUndefined();
    Object.defineProperty(element, "scrollHeight", { value: 1100 });
    await act(async () => {
      ready();
      await fonts;
    });
    act(() => frame?.(0));
    expect(element.scrollTop).toBe(600);
    view.unmount();
    expect(failure).not.toHaveBeenCalled();
  } finally {
    if (original) Object.defineProperty(document, "fonts", original);
    else Reflect.deleteProperty(document, "fonts");
  }
});
