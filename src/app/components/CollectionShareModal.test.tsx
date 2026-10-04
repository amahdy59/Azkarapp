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
      "Card labels only. English meaning is a separate addition.",
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
    fireEvent.click(screen.getByRole("checkbox", { name: "Include reviewed English meaning" }));
    await waitFor(() => expect(details.querySelector("summary")).toHaveTextContent("Meaning"));
    details.open = false;
    expect(details.querySelector("summary svg")).toHaveAttribute("aria-hidden", "true");
    expect(details.querySelector("summary")).toHaveTextContent("Meaning");
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
    fireEvent.click(screen.getByRole("checkbox", { name: "Include reviewed English meaning" }));
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
    expect(screen.getByRole("button", { name: "Save image" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Select card 2" }));
    expect(canShareMultipleFiles).toHaveBeenLastCalledWith([expect.objectContaining({ name: "p2.png" })]);
    fireEvent.click(screen.getByRole("button", { name: "Share selected" }));
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

    const shareCurrentBtn = screen.getByRole("button", { name: /مشاركة هذه البطاقة/i });
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
    fireEvent.click(screen.getByText("خيارات الحفظ والنسخ"));
    fireEvent.click(screen.getByRole("button", { name: "نسخ الصورة" }));
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
    const button = screen.getByRole("button", { name: "مشاركة هذه البطاقة" });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(shareSingleFile).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    finish({ method: "shared", fileCount: 1 });
    await waitFor(() => expect(button).toBeEnabled());
  });
});
