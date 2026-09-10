import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import App from "./App";

const loadAudioModuleMock = vi.hoisted(() => vi.fn());

// Mock matchMedia because jsdom does not implement it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("./state", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./state")>();
  return {
    ...actual,
    loadAppState: vi.fn(actual.loadAppState),
    saveAppState: vi.fn(() => true),
  };
});

// Avoid actually registering SW in tests
/**
 * The audio chunk loads itself in the background after first paint, so its
 * dynamic import routinely resolves *after* a test has finished and Vitest has
 * torn the environment down. Vitest counts that as an unhandled rejection and
 * fails the entire run — naming no test, because it belongs to none.
 *
 * That is what made `pnpm check` report `FAIL unit tests` while the same suite
 * passed standalone, intermittently, across several pushes. It read as
 * contention and was not: nothing was slow, something was still in flight.
 *
 * Stubbed so nothing is pending when the test ends. The real loader is covered
 * where the audio subsystem itself is tested.
 */
vi.mock("./audio/lazyAudio", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./audio/lazyAudio")>();
  return {
    ...actual,
    loadAudioModule: loadAudioModuleMock,
  };
});

vi.mock("virtual:pwa-register", () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

vi.mock("./screens/onboarding/SplashScreen", () => ({
  SplashScreen: ({ onDone }: { onDone: () => void }) => {
    React.useEffect(() => {
      onDone();
    }, [onDone]);
    return React.createElement("div", { "data-testid": "mock-splash" }, "Splash");
  },
}));

vi.mock("./screens/settings/SettingsScreen", () => ({
  SettingsScreen: () => React.createElement("h1", null, "Settings"),
}));

vi.mock("./screens/ProgressScreen", () => ({
  ProgressScreen: () => React.createElement("h1", null, "Progress"),
}));

describe("App Composition and Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadAudioModuleMock.mockResolvedValue({
      AudioProvider: ({ children }: { children: React.ReactNode }) => children,
      buildPlaybackPlan: () => null,
      getAudioCoverage: (items: Array<{ id: string }>) => ({
        total: items.length,
        available: items.length,
        unavailable: 0,
        availableZikrIds: items.map((item) => item.id),
        unavailableZikrIds: [],
      }),
    });
    window.history.replaceState(null, "", "/");
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("boots to Home screen when onboarding is complete", async () => {
    render(<App />);

    expect(await screen.findByRole("main")).toBeInTheDocument();

    const homeTab = await screen.findByRole("button", { name: /home/i });
    expect(homeTab).toHaveAttribute("aria-current", "page");
  });

  it("restores route from URL hash on boot", async () => {
    window.history.replaceState(null, "", "/#/settings");

    render(<App />);

    expect(await screen.findByRole("heading", { name: /settings/i, level: 1 }, { timeout: 5000 })).toBeInTheDocument();

    const settingsTab = await screen.findByRole("button", {
      name: /settings/i,
    });
    expect(settingsTab).toHaveAttribute("aria-current", "page");
  });

  it("keeps approved Al-Kahf audio actionable and retries audio initialization", async () => {
    loadAudioModuleMock.mockRejectedValueOnce(new Error("audio chunk unavailable"));
    window.history.replaceState(null, "", "/#/azkar/friday-kahf/1");

    const user = userEvent.setup();
    render(<App />);

    const listen = await screen.findByTestId("mushaf-rail-listen", {}, { timeout: 5000 });
    expect(listen).toBeEnabled();
    await waitFor(() => expect(loadAudioModuleMock).toHaveBeenCalledTimes(1));

    await user.click(listen);
    await waitFor(() => expect(loadAudioModuleMock).toHaveBeenCalledTimes(2));
    expect(listen).toBeEnabled();
  });

  it("updates URL and view when navigating via keyboard shortcuts", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("main");

    // Press Alt+4 for settings
    await user.keyboard("{Alt>}{4}{/Alt}");

    expect(await screen.findByRole("heading", { name: /settings/i, level: 1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/settings");

    // Press Alt+3 for progress
    await user.keyboard("{Alt>}{3}{/Alt}");

    expect(await screen.findByRole("heading", { name: /progress/i, level: 1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/progress");
  });

  it("handles browser back/forward buttons (popstate)", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByRole("main");

    // Click Settings tab
    const settingsTab = await screen.findByRole("button", {
      name: /settings/i,
    });
    await user.click(settingsTab);

    expect(await screen.findByRole("heading", { name: /settings/i, level: 1 }, { timeout: 5000 })).toBeInTheDocument();
    expect(window.location.hash).toBe("#/settings");

    // Simulate browser back button
    act(() => {
      window.history.back();
    });

    // Wait for home screen to return (Settings heading goes away)
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: /settings/i, level: 1 })).not.toBeInTheDocument();
    });

    const homeTab = await screen.findByRole("button", { name: /home/i });
    expect(homeTab).toHaveAttribute("aria-current", "page");
  });
});
