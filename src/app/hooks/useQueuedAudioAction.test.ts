import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQueuedAudioAction } from "./useQueuedAudioAction";

function setup() {
  const props = {
    context: "reader:morning:ar:1",
    ready: false,
    loading: false,
    error: false,
    requestLoad: vi.fn(),
    perform: vi.fn(),
  };
  return { props, ...renderHook((input) => useQueuedAudioAction(input), { initialProps: props }) };
}

describe("queued audio action", () => {
  it("waits for the controller mount after loading finishes, then starts once", () => {
    const { props, result, rerender } = setup();
    act(() => result.current.start());
    expect(props.requestLoad).toHaveBeenCalledOnce();
    rerender({ ...props, loading: true });
    rerender(props);
    expect(result.current.pending).toBe(true);
    expect(props.perform).not.toHaveBeenCalled();
    rerender({ ...props, ready: true });
    expect(props.perform).toHaveBeenCalledOnce();
    expect(result.current.pending).toBe(false);
    rerender({ ...props, ready: true });
    expect(props.perform).toHaveBeenCalledOnce();
  });

  it.each(["home", "reader:evening:ar:1", "reader:morning:en:1", "reader:morning:ar:2", "reader:morning:ar:1:brief"])(
    "discards an intent after switching to %s",
    (context) => {
      const { props, result, rerender } = setup();
      act(() => result.current.start());
      rerender({ ...props, context });
      rerender({ ...props, ready: true });
      expect(props.perform).not.toHaveBeenCalled();
      expect(result.current.pending).toBe(false);
    },
  );

  it("exposes actual failures and allows an explicit retry", () => {
    const { props, result, rerender } = setup();
    act(() => result.current.start());
    rerender({ ...props, loading: true });
    rerender({ ...props, error: true });
    expect(result.current.failed).toBe(true);
    expect(result.current.pending).toBe(false);
    rerender({ ...props, ready: true, error: true });
    expect(props.perform).not.toHaveBeenCalled();
    act(() => result.current.start());
    expect(props.perform).toHaveBeenCalledOnce();
    expect(result.current.failed).toBe(false);
  });

  it("runs immediately when audio is ready", () => {
    const { props, result, rerender } = setup();
    rerender({ ...props, ready: true });
    act(() => result.current.start());
    expect(props.perform).toHaveBeenCalledOnce();
    expect(props.requestLoad).not.toHaveBeenCalled();
  });
});
