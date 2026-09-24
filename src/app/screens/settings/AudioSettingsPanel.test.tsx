import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AudioSettingsPanel } from "./AudioSettingsPanel";

describe("AudioSettingsPanel", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("persists the preferred voice, speed, and navigation behavior without an active player", async () => {
    const user = userEvent.setup();
    render(<AudioSettingsPanel language="en" controller={null} onBack={() => undefined} />);

    await user.click(screen.getByRole("combobox", { name: "Azkar and dua voice" }));
    await user.click(screen.getByRole("option", { name: "Muhammad Moataz" }));
    fireEvent.click(screen.getByRole("button", { name: "1.25×" }));
    fireEvent.click(screen.getByRole("switch", { name: /Keep playing while I navigate/ }));

    expect(JSON.parse(window.localStorage.getItem("azkar.audio-preferences.v1") ?? "{}")).toMatchObject({
      duaVoiceId: "muhammad-moataz",
      playbackRate: 1.25,
      continueOnNavigation: false,
    });
  });

  it("uses the shared themed select instead of a browser-native dropdown", () => {
    const { container } = render(<AudioSettingsPanel language="en" controller={null} onBack={() => undefined} />);

    expect(container.querySelector("select")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Azkar and dua voice" })).toHaveAttribute(
      "data-slot",
      "select-trigger",
    );
  });
});
