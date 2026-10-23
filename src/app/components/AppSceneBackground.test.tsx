import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppSceneBackground } from "./AppSceneBackground";
import { DEFAULT_LOCATION } from "../content/prayerCalculation";

const preferences = vi.hoisted(() => ({ forced: false, reduced: false, now: new Date(2026, 9, 16, 9) }));
vi.mock("../hooks/useNow", () => ({ useNow: () => preferences.now }));
vi.mock("../hooks/useMediaQuery", () => ({
  useMediaQuery: (query: string) => (query.includes("forced-colors") ? preferences.forced : preferences.reduced),
}));
afterEach(() => {
  preferences.forced = false;
  preferences.reduced = false;
  preferences.now = new Date(2026, 9, 16, 9);
});
it("shares Friday morning and afternoon scenes, recovers from image errors and keeps decoration hidden from accessibility", () => {
  const props = { location: DEFAULT_LOCATION, material: "glass" as const, reduceTransparency: false };
  const view = render(<AppSceneBackground {...props} />);
  expect(screen.getByTestId("app-scene")).toHaveAttribute("aria-hidden", "true");
  expect(view.container.querySelector("img")?.src).toContain("friday-morning");
  fireEvent.error(view.container.querySelector("img")!);
  expect(screen.getByTestId("app-scene")).toHaveAttribute("data-failed", "true");
  expect(view.container.querySelector("img")).toBeNull();
  preferences.now = new Date(2026, 9, 16, 14);
  view.rerender(<AppSceneBackground {...props} />);
  expect(view.container.querySelector("img")?.src).toContain("/friday/friday-");
});
it("does not request a photo under forced colors or a reduced legacy system preference", () => {
  preferences.forced = true;
  const props = { location: DEFAULT_LOCATION, material: "system" as const, reduceTransparency: false };
  const view = render(<AppSceneBackground {...props} />);
  expect(view.container.querySelector("img")).toBeNull();
  preferences.forced = false;
  preferences.reduced = true;
  view.rerender(<AppSceneBackground {...props} />);
  expect(view.container.querySelector("img")).toBeNull();
  preferences.reduced = false;
  view.rerender(<AppSceneBackground {...props} reduceTransparency />);
  expect(view.container.querySelector("img")).toBeNull();
});
it("honors Save-Data by retaining only the theme background", () => {
  const previous = Object.getOwnPropertyDescriptor(navigator, "connection");
  Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: true } });
  try {
    const view = render(<AppSceneBackground location={DEFAULT_LOCATION} material="glass" reduceTransparency={false} />);
    expect(view.container.querySelector("img")).toBeNull();
    expect(screen.getByTestId("app-scene")).toHaveAttribute("data-failed", "true");
  } finally {
    if (previous) Object.defineProperty(navigator, "connection", previous);
    else Reflect.deleteProperty(navigator, "connection");
  }
});
