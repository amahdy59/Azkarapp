import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { t } from "../i18n";
import { HomeLocationRow } from "./HomeLocationRow";

describe("Home split location control", () => {
  it.each(["ar", "en"] as const)("keeps city selection and explicit detection independent in %s", (language) => {
    const onSelect = vi.fn();
    const onRefresh = vi.fn();
    const name = language === "ar" ? "القاهرة" : "Cairo";
    render(<HomeLocationRow {...{ language, name, onSelect, onRefresh }} deviceLocation={false} locating={false} />);
    const city = screen.getByRole("button", { name: `${t(language, "home.chooseLocation")}: ${name}` });
    const detect = screen.getByRole("button", { name: t(language, "qibla.useCurrentLocation") });
    expect(city).toHaveTextContent(name);
    expect(city).toHaveAccessibleDescription(t(language, "qibla.savedLocation"));
    expect(detect).toHaveAttribute("title", t(language, "qibla.useCurrentLocation"));
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(onRefresh).not.toHaveBeenCalled();
    fireEvent.click(city);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onRefresh).not.toHaveBeenCalled();
    fireEvent.click(detect);
    expect(onRefresh).toHaveBeenCalledExactlyOnceWith(detect);
  });

  it("announces acquisition, prevents a duplicate request and keeps manual selection available", () => {
    const onSelect = vi.fn();
    const onRefresh = vi.fn();
    render(<HomeLocationRow language="en" name="Cairo" deviceLocation={false} locating {...{ onSelect, onRefresh }} />);
    const detect = screen.getByRole("button", { name: t("en", "qibla.locating") });
    expect(detect).toBeDisabled();
    expect(detect).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent(t("en", "qibla.locating"));
    fireEvent.click(detect);
    expect(onRefresh).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /Change prayer location/ }));
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("retains honest device-location context instead of an old city name", () => {
    render(<HomeLocationRow language="en" name="Cairo" deviceLocation locating={false} />);
    const city = screen.getByRole("button", { name: /Change prayer location/ });
    expect(city).toHaveTextContent(t("en", "qibla.deviceLocation"));
    expect(city).not.toHaveTextContent("Cairo");
    expect(city).toHaveAccessibleDescription(t("en", "home.devicePrayerLocation"));
    expect(screen.getAllByRole("button").every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });
});
