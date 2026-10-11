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
    expect(region).toHaveStyle({ fontSize: "1.25rem" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveAttribute("dir", "ltr");
    expect(region).toHaveAttribute("lang", "en");
    expect(screen.getByRole("heading", { name: "English translation" })).toBeVisible();
    const header = document.querySelector(".quran-meaning-header");
    expect(header).toHaveClass("mushaf-page-furniture");
    const footer = document.querySelector(".mushaf-page-furniture--foot");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveTextContent("Saheeh International");
    fireEvent.wheel(region);
    fireEvent.keyDown(region, { key: "PageDown" });
    fireEvent.pointerDown(region);
    expect(onManualBrowse).toHaveBeenCalledTimes(3);
  });

  it("scales typography cleanly with textSize option", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      async () =>
        ({
          ok: true,
          json: async () => ({ "1": "In the name of Allah." }),
        }) as Response,
    );

    const { rerender } = render(
      <QuranPageTranslationPanel
        pageNumber={1}
        surahName="Al-Fatihah"
        verses={[{ k: "1:1" }]}
        language="en"
        direction="ltr"
        textSize="small"
      />,
    );

    const verseText = await screen.findByText("In the name of Allah.");
    const region = verseText.closest('[role="region"]')!;
    expect(region).toHaveStyle({ fontSize: "1.125rem" });

    rerender(
      <QuranPageTranslationPanel
        pageNumber={1}
        surahName="Al-Fatihah"
        verses={[{ k: "1:1" }]}
        language="en"
        direction="ltr"
        textSize="large"
      />,
    );
    expect(region).toHaveStyle({ fontSize: "1.5rem" });
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

  it("offers localized resumption only when following is paused and available", () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    const onResumeFollowing = vi.fn();
    const props = {
      pageNumber: 3,
      surahName: "البقرة",
      verses: [{ k: "2:6" }],
      language: "ar" as const,
      onResumeFollowing,
    };
    const { rerender } = render(<QuranPageTranslationPanel {...props} follow={false} />);
    fireEvent.click(screen.getByRole("button", { name: "استئناف المتابعة" }));
    expect(onResumeFollowing).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "الترجمة الإنجليزية" })).toHaveAttribute("lang", "ar");
    rerender(<QuranPageTranslationPanel {...props} follow />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
