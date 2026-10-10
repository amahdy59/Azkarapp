import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { QuranBilingualStreamView } from "./QuranBilingualStreamView";
import type { MushafVerseData } from "../content/qcfMushaf";
import { __resetQuranTranslationsCacheForTesting } from "../content/quranTranslations";

describe("QuranBilingualStreamView", () => {
  beforeEach(() => {
    __resetQuranTranslationsCacheForTesting();
    vi.restoreAllMocks();
  });

  const samplePageData: MushafVerseData[] = [
    {
      k: "1:1",
      w: [
        [1, 1, 0, "بِسْمِ", "glyph1"],
        [2, 1, 0, "ٱللَّهِ", "glyph2"],
        [3, 1, 0, "ٱلرَّحْمَـٰنِ", "glyph3"],
        [4, 1, 0, "ٱلرَّحِيمِ", "glyph4"],
        [5, 1, 1, "١", "glyph5"],
      ],
    },
  ];

  it("renders Arabic text and English translation for verses on the page", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).includes("1.json")) {
        return {
          ok: true,
          json: async () => ({
            "1": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          }),
        } as Response;
      }
      return { ok: false } as Response;
    });

    render(
      <QuranBilingualStreamView
        pageNumber={1}
        surahName="Al-Fatihah"
        juzNumber={1}
        pageData={samplePageData}
        language="en"
        direction="ltr"
        bookmarkedVerses={[]}
        onToggleVerseBookmark={vi.fn()}
        onAyahAction={vi.fn()}
        showWordMeanings={false}
        onPaginate={vi.fn()}
        atFirstPage={true}
        atLastPage={false}
      />,
    );

    expect(screen.getByTestId("bilingual-stream-view")).toBeInTheDocument();
    expect(screen.getByText("Saheeh International")).toBeVisible();
    expect(screen.getByText("بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ ١")).toBeInTheDocument();
    expect(
      await screen.findByText("In the name of Allah, the Entirely Merciful, the Especially Merciful."),
    ).toBeInTheDocument();
  });

  it("handles verse bookmarking and ayah actions", async () => {
    const user = userEvent.setup();
    const onToggleBookmark = vi.fn();
    const onAyahAction = vi.fn();

    render(
      <QuranBilingualStreamView
        pageNumber={1}
        surahName="Al-Fatihah"
        juzNumber={1}
        pageData={samplePageData}
        language="en"
        direction="ltr"
        bookmarkedVerses={[]}
        onToggleVerseBookmark={onToggleBookmark}
        onAyahAction={onAyahAction}
        showWordMeanings={false}
        onPaginate={vi.fn()}
        atFirstPage={true}
        atLastPage={false}
      />,
    );

    const bookmarkBtn = screen.getByTestId("bilingual-bookmark-1:1");
    await user.click(bookmarkBtn);
    expect(onToggleBookmark).toHaveBeenCalledWith("1:1", 1);

    const detailsBtn = screen.getByTestId("bilingual-details-1:1");
    await user.click(detailsBtn);
    expect(onAyahAction).toHaveBeenCalledWith("1:1", 1);
  });
});
