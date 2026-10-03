import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CollectionShareModal } from "./CollectionShareModal";
import type { Zikr } from "../types";

// Mock canvas and share functions
vi.mock("../share/collectionShareCard", () => ({
  releaseSharePages: vi.fn(),
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
  it("shows a recoverable generation error and never leaves a loading spinner", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    vi.mocked(generateAllCollectionStoryPages).mockRejectedValueOnce(new RangeError("Too long"));
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={SAMPLE_ITEMS} language="ar" />,
    );
    expect(await screen.findByRole("alert")).toBeVisible();
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

    fireEvent.click(screen.getByRole("combobox", { name: "مظهر البطاقات" }));
    fireEvent.click(screen.getByRole("option", { name: "ذهبي · مسائي" }));

    expect(generateAllCollectionStoryPages).toHaveBeenCalledWith(
      expect.objectContaining({
        appearance: "gold",
      }),
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
    fireEvent.click(screen.getByText("خيارات مشاركة إضافية"));
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
