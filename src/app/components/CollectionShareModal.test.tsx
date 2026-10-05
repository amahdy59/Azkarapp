import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CollectionShareModal } from "./CollectionShareModal";
import type { Zikr } from "../types";

// Mock canvas and share functions
vi.mock("../share/collectionShareCard", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../share/collectionShareCard")>()),
  releaseSharePages: vi.fn(),
  getCompatibleShareFormats: vi.fn().mockResolvedValue(["story", "square", "portrait", "tall"]),
  generateAllCollectionStoryPages: vi.fn().mockResolvedValue([
    {
      pageNumber: 1,
      totalPages: 5,
      file: new File(["p1"], "p1.png", { type: "image/png" }),
      blob: new Blob(["p1"]),
      dataUrl: "data:image/png;base64,page1",
      altText: "أذكار الصباح - صفحة 1 من 5",
    },
    {
      pageNumber: 2,
      totalPages: 5,
      file: new File(["p2"], "p2.png", { type: "image/png" }),
      blob: new Blob(["p2"]),
      dataUrl: "data:image/png;base64,page2",
      altText: "أذكار الصباح - صفحة 2 من 5",
    },
  ]),
}));

vi.mock("../share/shareDispatcher", () => ({
  canShareMultipleFiles: vi.fn().mockReturnValue(true),
  shareSingleFile: vi.fn().mockResolvedValue({ method: "shared", fileCount: 1 }),
  shareMultipleFiles: vi.fn().mockResolvedValue({ method: "shared", fileCount: 2 }),
  downloadFile: vi.fn(),
  downloadFilesSequentially: vi.fn().mockResolvedValue(undefined),
  canCopyImage: vi.fn().mockReturnValue(true),
  copyImageToClipboard: vi.fn().mockResolvedValue(true),
}));

const SAMPLE_ITEMS: Zikr[] = [
  {
    id: "m-1",
    category: "morning",
    orderIndex: 0,
    arabicText: "الحمد لله وحده",
    benefitArabic: "فضل عظيم",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "أبو داود",
    preferredTiming: "الصباح",
    hadithText: "حديث",
  },
];

describe("CollectionShareModal", () => {
  it("can omit sources from image and text exports without changing the reviewed item", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const original = JSON.stringify(SAMPLE_ITEMS);
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    const checkbox = screen.getByRole("checkbox", { name: "Include sources", exact: true });
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({ content: expect.objectContaining({ source: false }) }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Text", exact: true }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).not.toContain("أبو داود");
    fireEvent.click(screen.getByRole("checkbox", { name: "Include sources", exact: true }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("أبو داود");
    expect(JSON.stringify(SAMPLE_ITEMS)).toBe(original);
  });
  it("offers a transient collection subtitle without changing reading additions", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        collectionSubtitle="Begin with remembrance"
        items={SAMPLE_ITEMS}
        language="en"
      />,
    );
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    const checkbox = screen.getByRole("checkbox", { name: "Show the collection subtitle", exact: true });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({ subtitle: true, meaning: false, pronunciation: false, benefit: false }),
        }),
      ),
    );
    expect(screen.getByText("Show the collection subtitle", { selector: "summary *" })).toBeVisible();
  });
  for (const language of ["ar", "en"] as const) {
    for (const single of [false, true]) {
      it(`distinguishes the ${single ? "single" : "collection"} title in ${language}`, async () => {
        const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
        const collectionTitle = language === "ar" ? "أذكار الصباح" : "Morning adhkar";
        render(
          <CollectionShareModal
            open
            single={single}
            onClose={vi.fn()}
            collectionTitle={collectionTitle}
            categoryId="morning"
            items={SAMPLE_ITEMS}
            language={language}
          />,
        );
        await screen.findByRole("img");
        const expected = single ? (language === "ar" ? "من أذكار الصباح" : "From Morning adhkar") : collectionTitle;
        expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
          expect.objectContaining({
            collectionTitle: expected,
            allItems: [expect.objectContaining(single ? { title: expected } : { id: "m-1" })],
          }),
        );
      });
    }
  }
  it("offers reviewed word meanings only for Arabic exports and keeps them independent of translation", async () => {
    const { ALL_AZKAR } = await import("../content/azkar");
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const item = ALL_AZKAR.find((zikr) => zikr.canonicalKey === "quran-112")!;
    const view = render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={[item]} language="ar" />,
    );
    await screen.findByRole("img");
    screen.getByText("تخصيص المحتوى").closest("details")!.open = true;
    fireEvent.click(screen.getByRole("checkbox", { name: "معاني الكلمات", exact: true }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({ content: expect.objectContaining({ wordMeanings: true, meaning: false }) }),
      ),
    );
    expect(screen.getByRole("checkbox", { name: "إضافة الترجمة الإنجليزية المراجعة" })).not.toBeChecked();
    view.unmount();
    render(<CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={[item]} language="en" />);
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    expect(screen.queryByRole("checkbox", { name: "معاني الكلمات" })).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Content preset" })).toHaveTextContent("Arabic only");
  });
  it("uses matching selected styles and truthful card counts as the scope changes", async () => {
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await screen.findByRole("img");
    expect(screen.getByText("1 card to share")).toBeVisible();
    const image = screen.getByRole("button", { name: "Image", exact: true });
    const current = screen.getByRole("button", { name: "This card", exact: true });
    expect(image).toHaveClass("border-primary", "bg-muted");
    expect(current).toHaveClass("border-primary", "bg-muted");
    fireEvent.click(screen.getByRole("button", { name: "Selected cards", exact: true }));
    expect(screen.getByText("No cards selected to share")).toBeVisible();
    expect(current).not.toHaveClass("border-primary");
    fireEvent.click(screen.getByRole("checkbox", { name: "Select card 1", exact: true }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Select card 2", exact: true }));
    expect(screen.getByText("2 cards to share")).toBeVisible();
  });
  it("associates size and language guidance and hides image settings in other modes", async () => {
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        categoryId="morning"
        items={SAMPLE_ITEMS}
        language="en"
      />,
    );
    await screen.findByRole("img");
    const settings = screen.getByText("Image settings").closest("details")!;
    settings.open = true;
    const size = screen.getByRole("combobox", { name: "Image size" });
    expect(size).toHaveAccessibleDescription("Choose the shape that suits your destination.");
    expect(screen.getByRole("combobox", { name: "Card language" })).toHaveAccessibleDescription(
      "Card labels only. English translation is a separate addition. Word meanings are available in Arabic only.",
    );
    expect(
      screen.getByRole("button", { name: "Image", exact: true }).querySelector('svg[aria-hidden="true"]'),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Text", exact: true }));
    expect(screen.queryByText("Image settings")).not.toBeInTheDocument();
    expect(screen.getByText("Customize content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Link", exact: true }));
    expect(screen.queryByText("Customize content")).not.toBeInTheDocument();
  });
  it("summarizes selected additions in a native disclosure", async () => {
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        items={[{ ...SAMPLE_ITEMS[0]!, translation: "Praise Allah" }]}
        language="en"
      />,
    );
    await screen.findByRole("img");
    const details = screen.getByText("Customize content").closest("details")!;
    details.open = true;
    fireEvent.click(screen.getByRole("checkbox", { name: "Include reviewed English translation" }));
    await waitFor(() => expect(details.querySelector("summary")).toHaveTextContent("English translation"));
    details.open = false;
    expect(details.querySelector("summary svg")).toHaveAttribute("aria-hidden", "true");
    expect(details.querySelector("summary")).toHaveTextContent("English translation");
  });
  it("keeps full text available when no image format fits", async () => {
    const { getCompatibleShareFormats } = await import("../share/collectionShareCard");
    vi.mocked(getCompatibleShareFormats).mockResolvedValueOnce([]);
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        categoryId="morning"
        items={SAMPLE_ITEMS}
        language="en"
      />,
    );
    await screen.findByRole("alert");
    fireEvent.click(screen.getAllByRole("button", { name: "Text", exact: true })[0]!);
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain(SAMPLE_ITEMS[0]!.arabicText);
    expect(screen.getByRole("button", { name: "Copy", exact: true })).toBeEnabled();
  });
  it("offers compatible sizes and text instead of splitting an oversized item", async () => {
    const { getCompatibleShareFormats, generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    vi.mocked(getCompatibleShareFormats).mockResolvedValueOnce(["tall"]);
    vi.mocked(generateAllCollectionStoryPages).mockClear();
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        categoryId="morning"
        items={SAMPLE_ITEMS}
        language="en"
      />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/complete/i);
    expect(generateAllCollectionStoryPages).not.toHaveBeenCalled();
    expect(screen.getByText("Choose a compatible size to enable saving.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Text", exact: true })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Use Tall reading image" }));
    await screen.findByRole("img");
    expect(generateAllCollectionStoryPages).toHaveBeenCalledWith(expect.objectContaining({ format: "tall" }));
  });
  it("keeps English labels independent from the optional meaning", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Morning"
        items={[{ ...SAMPLE_ITEMS[0]!, translation: "All praise belongs to Allah." }]}
        language="en"
      />,
    );
    await screen.findByRole("img");
    expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
      expect.objectContaining({ language: "en", content: expect.objectContaining({ meaning: false }) }),
    );
    fireEvent.click(screen.getByText("Customize content"));
    fireEvent.click(screen.getByRole("checkbox", { name: "Include reviewed English translation" }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({ language: "en", content: expect.objectContaining({ meaning: true }) }),
      ),
    );
  });
  it("checks native support using only the chosen files", async () => {
    const { canShareMultipleFiles, shareSingleFile } = await import("../share/shareDispatcher");
    vi.mocked(shareSingleFile).mockClear();
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await screen.findByRole("img");
    fireEvent.click(screen.getByRole("button", { name: "Selected cards", exact: true }));
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select card 2" }));
    expect(canShareMultipleFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: "p2.png" })]);
    fireEvent.click(screen.getByRole("button", { name: "Share", exact: true }));
    await waitFor(() =>
      expect(shareSingleFile).toHaveBeenCalledWith(expect.objectContaining({ name: "p2.png" }), expect.anything()),
    );
  });
  it("shows a recoverable generation error and never leaves a loading spinner", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    vi.mocked(generateAllCollectionStoryPages).mockRejectedValueOnce(new RangeError("Too long"));
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={SAMPLE_ITEMS} language="ar" />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "حاول تجهيز الصورة مرة أخرى، أو اختر النص أو الرابط من الأعلى.",
    );
    fireEvent.click(screen.getByRole("button", { name: "حاول مرة أخرى" }));
    expect(await screen.findByAltText("أذكار الصباح - صفحة 1 من 5")).toBeVisible();
  });
  it("renders modal when open is true", async () => {
    render(
      <CollectionShareModal
        open={true}
        onClose={vi.fn()}
        collectionTitle="أذكار الصباح"
        items={SAMPLE_ITEMS}
        language="ar"
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getAllByText("بطاقات الأذكار للمشاركة").length).toBeGreaterThan(0);

    // Wait for mock pages to load
    await waitFor(() => {
      expect(screen.getByAltText("أذكار الصباح - صفحة 1 من 5")).toBeInTheDocument();
    });
  });

  it("navigates between carousel pages", async () => {
    render(
      <CollectionShareModal
        open={true}
        onClose={vi.fn()}
        collectionTitle="أذكار الصباح"
        items={SAMPLE_ITEMS}
        language="ar"
      />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("أذكار الصباح - صفحة 1 من 5")).toBeInTheDocument();
    });

    const nextBtn = screen.getByLabelText("البطاقة التالية");
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByAltText("أذكار الصباح - صفحة 2 من 5")).toBeInTheDocument();
    });
  });

  it("switches theme between daylight and midnight", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");

    render(
      <CollectionShareModal
        open={true}
        onClose={vi.fn()}
        collectionTitle="أذكار الصباح"
        items={SAMPLE_ITEMS}
        language="ar"
        themeMode="light"
      />,
    );

    await screen.findByRole("img");
    fireEvent.click(screen.getByRole("button", { name: "ذهبي · مسائي" }));

    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenCalledWith(
        expect.objectContaining({
          appearance: "gold",
        }),
      ),
    );
  });

  it("shares current card via shareSingleFile", async () => {
    const { shareSingleFile } = await import("../share/shareDispatcher");

    render(
      <CollectionShareModal
        open={true}
        onClose={vi.fn()}
        collectionTitle="أذكار الصباح"
        items={SAMPLE_ITEMS}
        language="ar"
      />,
    );

    await waitFor(() => {
      expect(screen.getByAltText("أذكار الصباح - صفحة 1 من 5")).toBeInTheDocument();
    });

    const shareCurrentBtn = screen.getByRole("button", { name: "مشاركة", exact: true });
    fireEvent.click(shareCurrentBtn);

    expect(shareSingleFile).toHaveBeenCalled();
  });
  it("does not regenerate previews for a parent render with identical content", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const props = {
      open: true,
      onClose: vi.fn(),
      collectionTitle: "أذكار الصباح",
      items: SAMPLE_ITEMS,
      language: "ar" as const,
    };
    const { rerender } = render(<CollectionShareModal {...props} />);
    await screen.findByRole("img");
    const count = vi.mocked(generateAllCollectionStoryPages).mock.calls.length;
    rerender(<CollectionShareModal {...props} items={SAMPLE_ITEMS.map((item) => ({ ...item }))} />);
    expect(vi.mocked(generateAllCollectionStoryPages).mock.calls.length).toBe(count);
  });
  it("offers complete text and an exact collection link", async () => {
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="أذكار الصباح"
        categoryId="morning"
        items={SAMPLE_ITEMS}
        language="ar"
      />,
    );
    await screen.findByRole("img");
    fireEvent.click(screen.getByRole("button", { name: "نص", exact: true }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("الحمد لله وحده");
    fireEvent.click(screen.getByRole("button", { name: "رابط", exact: true }));
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("#/azkar/morning");
  });
  it("keeps a denied image copy visible without silently downloading", async () => {
    const { copyImageToClipboard, downloadFile } = await import("../share/shareDispatcher");
    vi.mocked(copyImageToClipboard).mockResolvedValueOnce(false);
    vi.mocked(downloadFile).mockClear();
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={SAMPLE_ITEMS} language="ar" />,
    );
    await screen.findByRole("img");
    fireEvent.click(screen.getByRole("button", { name: "نسخ", exact: true }));
    expect(await screen.findByRole("alert")).toHaveTextContent("تعذر نسخ الصورة");
    expect(downloadFile).not.toHaveBeenCalled();
  });
  it("serializes rapid share activations", async () => {
    const { shareSingleFile } = await import("../share/shareDispatcher");
    let finish!: (result: { method: "shared"; fileCount: number }) => void;
    vi.mocked(shareSingleFile)
      .mockClear()
      .mockReturnValueOnce(
        new Promise((resolve) => {
          finish = resolve;
        }),
      );
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={SAMPLE_ITEMS} language="ar" />,
    );
    await screen.findByRole("img");
    const button = screen.getByRole("button", { name: "مشاركة", exact: true });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(shareSingleFile).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    finish({ method: "shared", fileCount: 1 });
    await waitFor(() => expect(button).toBeEnabled());
  });
  it("puts three concise icon actions in the footer and removes the extra disclosure", async () => {
    const { copyImageToClipboard } = await import("../share/shareDispatcher");
    vi.mocked(copyImageToClipboard).mockClear();
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await screen.findByRole("img");
    const footer = screen.getByTestId("sharing-actions");
    expect(Array.from(footer.querySelectorAll("button")).map((button) => button.textContent)).toEqual([
      "Share",
      "Save",
      "Copy",
    ]);
    expect(footer.querySelectorAll('button svg[aria-hidden="true"]')).toHaveLength(3);
    expect(screen.queryByText("Save and copy options")).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("dialog")
        .querySelector('[id="' + screen.getByRole("dialog").getAttribute("aria-describedby") + '"]'),
    ).toHaveClass("sr-only");
    fireEvent.click(screen.getByRole("button", { name: "Copy", exact: true }));
    await waitFor(() => expect(copyImageToClipboard).toHaveBeenCalled());
    expect(await screen.findByText("Image copied to clipboard.")).toHaveClass("sr-only");
  });
  it("keeps explicit saving available when native image sharing is unsupported", async () => {
    const { canShareMultipleFiles, downloadFile } = await import("../share/shareDispatcher");
    vi.mocked(canShareMultipleFiles).mockReturnValue(false);
    vi.mocked(downloadFile).mockClear();
    try {
      render(
        <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
      );
      await screen.findByRole("img");
      expect(screen.getByRole("button", { name: "Share", exact: true })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Share", exact: true })).toHaveAccessibleDescription(
        /Use Save or Copy/u,
      );
      fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
      expect(downloadFile).toHaveBeenCalledWith(expect.objectContaining({ name: "p1.png" }));
    } finally {
      vi.mocked(canShareMultipleFiles).mockReturnValue(true);
    }
  });
  it("copies the selected text for multiple images and saves text without native sharing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const { downloadFile } = await import("../share/shareDispatcher");
    vi.mocked(downloadFile).mockClear();
    try {
      render(
        <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
      );
      await screen.findByRole("img");
      fireEvent.click(screen.getByRole("button", { name: "Entire collection", exact: true }));
      fireEvent.click(screen.getByRole("button", { name: "Copy", exact: true }));
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining(SAMPLE_ITEMS[0]!.arabicText)));
      await waitFor(() => expect(screen.getByRole("button", { name: "Copy", exact: true })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Text", exact: true }));
      fireEvent.click(screen.getByRole("button", { name: "Save", exact: true }));
      expect(downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "azkar.txt", type: "text/plain;charset=utf-8" }),
      );
    } finally {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
