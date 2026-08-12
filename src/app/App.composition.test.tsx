import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import App from "./App";

// Mock matchMedia because jsdom does not implement it
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
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
    return <div data-testid="mock-splash">Splash</div>;
  },
}));

// Also import React at the top since we use it in the mock
import React from "react";

describe("App Composition and Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState(null, "", "/");
    window.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("boots to Home screen when onboarding is complete", async () => {
    render(<App />);

    // We expect the home screen elements to appear. The greeting "السلام عليكم" is typically on home
    expect(await screen.findByRole("main")).toBeInTheDocument();

    // Bottom nav should highlight Home
    const homeTab = await screen.findByRole("button", { name: /home/i });
    expect(homeTab).toHaveAttribute("aria-current", "page");
  });

  it("restores route from URL hash on boot", async () => {
    window.history.replaceState(null, "", "/#/settings");

    render(<App />);

    // Wait for the settings screen to load (it's lazy loaded)
    expect(await screen.findByRole("heading", { name: /settings/i, level: 1 }, { timeout: 5000 })).toBeInTheDocument();

    const settingsTab = await screen.findByRole("button", { name: /settings/i });
    expect(settingsTab).toHaveAttribute("aria-current", "page");
  });

  it("updates URL and view when navigating via keyboard shortcuts", async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for home to settle
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
    const settingsTab = await screen.findByRole("button", { name: /settings/i });
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

    // Check if the bottom nav home tab is selected again
    const homeTab = await screen.findByRole("button", { name: /home/i });
    expect(homeTab).toHaveAttribute("aria-current", "page");
  });
});
