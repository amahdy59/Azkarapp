import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AudioSettingsPanel } from "./AudioSettingsPanel";

describe("AudioSettingsPanel", () => {
  beforeEach(() => window.localStorage.clear());

  it("persists the preferred voice, speed, and navigation behavior without an active player", () => {
    render(<AudioSettingsPanel language="en" controller={null} onBack={() => undefined} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Azkar and dua voice" }), {
      target: { value: "muhammad-moataz" },
    });
    fireEvent.click(screen.getByRole("button", { name: "1.25×" }));
    fireEvent.click(screen.getByRole("switch", { name: /Keep playing while I navigate/ }));

    expect(JSON.parse(window.localStorage.getItem("azkar.audio-preferences.v1") ?? "{}")).toMatchObject({
      duaVoiceId: "muhammad-moataz",
      playbackRate: 1.25,
      continueOnNavigation: false,
    });
  });
});
