import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QuranPageTranslationPanel } from "./QuranPageTranslationPanel";
import { __resetQuranTranslationsCacheForTesting } from "../content/quranTranslations";

describe("QuranPageTranslationPanel", () => {
  beforeEach(() => {
    __resetQuranTranslationsCacheForTesting();
    vi.restoreAllMocks();
  });

  it("renders page translation verses when loaded", async () => {
    const onManualBrowse = vi.fn();
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("1.json")) {
        return {
          ok: true,
          json: async () => ({
            "1": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
            "2": "[All] praise is [due] to Allah, Lord of the worlds -",
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <QuranPageTranslationPanel
        pageNumber={1}
        surahName="Al-Fatihah"
        verses={[{ k: "1:1" }, { k: "1:2" }]}
        language="en"
        direction="ltr"
        activeVerseKey="1:2"
        follow
        onManualBrowse={onManualBrowse}
      />,
    );

    expect(screen.getByRole("region", { name: "Page translation" })).toBeInTheDocument();
    expect(
      await screen.findByText("In the name of Allah, the Entirely Merciful, the Especially Merciful."),
    ).toBeInTheDocument();
    expect(screen.getByText("[All] praise is [due] to Allah, Lord of the worlds -")).toBeInTheDocument();
    expect(screen.getByText("Saheeh International")).toBeVisible();
    const verse = screen.getByText("[All] praise is [due] to Allah, Lord of the worlds -").closest("p");
    expect(verse).toHaveAttribute("aria-current", "true");
    const region = verse!.closest('[role="region"]')!;
    fireEvent.wheel(region);
    fireEvent.keyDown(region, { key: "PageDown" });
    fireEvent.pointerDown(region);
    expect(onManualBrowse).toHaveBeenCalledTimes(3);
  });

  it("displays loading indicator when translations are being retrieved", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <QuranPageTranslationPanel
        pageNumber={1}
        surahName="Al-Fatihah"
        verses={[{ k: "1:1" }]}
        language="en"
        direction="ltr"
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });
});
