import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveVisitorPresence, VisitorCount } from "./VisitorCount";

function renderVisitorCount(language: "ar" | "en") {
  return render(
    <ActiveVisitorPresence>
      <VisitorCount language={language} />
    </ActiveVisitorPresence>,
  );
}

describe("VisitorCount", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("shows the active visitor count after a successful heartbeat", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ active: 12 }), { status: 200 })),
    );
    renderVisitorCount("en");
    expect(screen.queryByText("Visitors now: 12")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Visitors now: 12")).toBeInTheDocument());
  });

  it("fails quietly when the analytics endpoint is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 })),
    );
    renderVisitorCount("ar");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
  });

  it("refreshes presence every 30 seconds while the app remains open", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ active: 2 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    let heartbeat: TimerHandler | undefined;
    const nativeSetInterval = window.setInterval;
    vi.spyOn(window, "setInterval").mockImplementation((handler, timeout, ...args) => {
      if (timeout === 30_000) {
        heartbeat = handler;
        return 1;
      }
      return nativeSetInterval(handler, timeout, ...args);
    });

    renderVisitorCount("en");
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await act(async () => {
      if (typeof heartbeat === "function") heartbeat();
      await Promise.resolve();
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
