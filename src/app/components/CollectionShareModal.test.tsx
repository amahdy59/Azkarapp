import { describe, expect, it, vi } from "vitest";
import { act, render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { CollectionShareModal } from "./CollectionShareModal";
import type { Zikr } from "../types";

// Mock canvas and share functions
vi.mock("../share/attributedCard", () => ({
  attributeCardImage: vi.fn(async (blob: Blob) => blob),
}));
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

function goStep(step: "content" | "design" | "share") {
  const nav = screen.getByRole("navigation", { name: /Sharing steps|خطوات المشاركة/ });
  const names = { content: /^(Content|المحتوى),/, design: /^(Design|التصميم),/, share: /^(Share|المشاركة),/ };
  fireEvent.click(within(nav).getByRole("button", { name: names[step] }));
}

async function chooseScope(value: string) {
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Cards to share" }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("option", { name: value, exact: true }));
}
function showCaption() {
  goStep("share");
  const checkbox = screen.getByRole("checkbox", { name: /Include text with image|إرفاق نص مع الصورة/u });
  if (!(checkbox as HTMLInputElement).checked) fireEvent.click(checkbox);
  return screen.getByRole("textbox", { name: /Caption preview|معاينة النص المرفق/u });
}
describe("CollectionShareModal", () => {
  it("switches content from one zikr to its collection while retaining the chosen design", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const collection = [...SAMPLE_ITEMS, { ...SAMPLE_ITEMS[0]!, id: "m-2", arabicText: "سبحان الله" }];
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="One zikr"
        items={SAMPLE_ITEMS}
        language="en"
        initialFormat="square"
        collection={{ items: collection, title: "Morning", titleEnglish: "Morning" }}
      />,
    );
    await screen.findByRole("img");
    fireEvent.click(screen.getByRole("radio", { name: "Entire collection" }));
    await waitFor(() =>
      expect(vi.mocked(generateAllCollectionStoryPages).mock.lastCall![0]).toMatchObject({
        single: false,
        format: "square",
        collectionTitle: "Morning",
        allItems: expect.arrayContaining([expect.objectContaining({ id: "m-2" })]),
      }),
    );
    goStep("share");
    expect(screen.getByRole("combobox", { name: "Cards to share" })).toHaveTextContent("All cards");
    goStep("content");
    fireEvent.click(screen.getByRole("radio", { name: "This zikr" }));
    await waitFor(() =>
      expect(vi.mocked(generateAllCollectionStoryPages).mock.lastCall![0]).toMatchObject({
        single: true,
        format: "square",
        allItems: [expect.objectContaining({ id: "m-1" })],
      }),
    );
  });
  it("skips optional design with the current export and choices intact", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const { shareSingleFile } = await import("../share/shareDispatcher");
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="Reading"
        items={SAMPLE_ITEMS}
        language="en"
        initialFormat="square"
      />,
    );
    await screen.findByRole("img");
    const calls = vi.mocked(generateAllCollectionStoryPages).mock.calls.length;
    const image = screen.getByRole("img").getAttribute("src");
    fireEvent.click(screen.getByRole("button", { name: "Skip design" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Share", exact: true })).toHaveFocus());
    expect(screen.getByRole("img")).toHaveAttribute("src", image);
    expect(generateAllCollectionStoryPages).toHaveBeenCalledTimes(calls);
    fireEvent.click(screen.getByRole("button", { name: "Share", exact: true }));
    await waitFor(() => expect(shareSingleFile).toHaveBeenCalled());
    goStep("content");
    fireEvent.click(screen.getByRole("button", { name: "Next step", exact: true }));
    expect(screen.getByText("Optional — keep the current design or adjust its look and size.")).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Image size" })).toHaveTextContent("Square");
  });
  it("shares precisely the optional caption without regenerating the image", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const { shareSingleFile } = await import("../share/shareDispatcher");
    vi.mocked(shareSingleFile).mockClear();
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="Reading"
        items={SAMPLE_ITEMS}
        language="en"
      />,
    );
    await screen.findByRole("img");
    goStep("share");
    fireEvent.click(screen.getByRole("button", { name: "Share", exact: true }));
    await waitFor(() => expect(shareSingleFile).toHaveBeenCalled());
    expect(vi.mocked(shareSingleFile).mock.lastCall![1]?.text).toBeUndefined();
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Include text with image" })).toBeEnabled());
    const calls = vi.mocked(generateAllCollectionStoryPages).mock.calls.length;
    const field = showCaption() as HTMLTextAreaElement;
    expect(field.value).toContain(SAMPLE_ITEMS[0]!.arabicText);
    fireEvent.click(screen.getByRole("button", { name: "Share", exact: true }));
    await waitFor(() => expect(vi.mocked(shareSingleFile).mock.lastCall![1]?.text).toBe(field.value));
    expect(generateAllCollectionStoryPages).toHaveBeenCalledTimes(calls);
  });
  it("shows step progress and explicitly expands and collapses the preview", async () => {
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await screen.findByRole("img");
    expect(
      screen.getByRole("navigation", { name: "Sharing steps" }).querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Content");
    const toggle = screen.getByTestId("sharing-preview-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName("Reduce preview");
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(toggle).toHaveAccessibleName("Enlarge preview");
    goStep("design");
    expect(
      screen.getByRole("navigation", { name: "Sharing steps" }).querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Design");
    goStep("share");
    expect(
      screen.getByRole("navigation", { name: "Sharing steps" }).querySelector('[aria-current="step"]'),
    ).toHaveTextContent("Share");
  });
  it("retains a card chosen during streaming when generation finishes", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    let finish!: (value: Awaited<ReturnType<typeof generateAllCollectionStoryPages>>) => void;
    let publish!: NonNullable<Parameters<typeof generateAllCollectionStoryPages>[0]["onPage"]>;
    vi.mocked(generateAllCollectionStoryPages).mockImplementationOnce(
      (options) =>
        new Promise((resolve) => {
          finish = resolve;
          publish = options.onPage!;
        }),
    );
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    await waitFor(() => expect(publish).toBeDefined());
    const first = {
      pageNumber: 1,
      totalPages: 2,
      file: new File(["one"], "one.png"),
      blob: new Blob(["one"]),
      dataUrl: "data:image/png;base64,one",
      altText: "First card",
    };
    const second = { ...first, pageNumber: 2, dataUrl: "data:image/png;base64,two", altText: "Second card" };
    act(() => {
      publish(first);
      publish(second);
    });
    fireEvent.click(screen.getByRole("button", { name: "Next card", exact: true }));
    expect(screen.getByRole("img")).toHaveAttribute("src", second.dataUrl);
    finish([first, second]);
    await waitFor(() => expect(screen.queryByText("Preparing the remaining cards…")).not.toBeInTheDocument());
    expect(screen.getByRole("img")).toHaveAttribute("src", second.dataUrl);
  });
  it("keeps a later-card preview through streamed replacements while blocking stale exports", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="Morning" items={SAMPLE_ITEMS} language="en" />,
    );
    const preview = await screen.findByRole("img");
    fireEvent.click(screen.getByRole("button", { name: "Next card", exact: true }));
    const previous = preview.getAttribute("src");
    let finish!: (value: Awaited<ReturnType<typeof generateAllCollectionStoryPages>>) => void;
    let publish!: NonNullable<Parameters<typeof generateAllCollectionStoryPages>[0]["onPage"]>;
    vi.mocked(generateAllCollectionStoryPages).mockImplementationOnce(
      (options) =>
        new Promise((resolve) => {
          finish = resolve;
          publish = options.onPage!;
        }),
    );
    goStep("design");
    fireEvent.click(screen.getByRole("button", { name: "Gold · Evening" }));
    await waitFor(() => expect(finish).toBeDefined());
    expect(screen.getByRole("img")).toHaveAttribute("src", previous);
    goStep("share");
    expect(screen.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copy text", exact: true })).toBeDisabled();
    const replacement = {
      pageNumber: 1,
      totalPages: 1,
      file: new File(["new"], "new.png"),
      blob: new Blob(["new"]),
      dataUrl: "data:image/png;base64,new",
      altText: "New selected design",
    };
    act(() => publish(replacement));
    expect(screen.getByRole("img")).toHaveAttribute("src", previous);
    expect(screen.getByText("Card 2 of 5")).toBeVisible();
    expect(screen.getByRole("button", { name: "Previous card", exact: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next card", exact: true })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("img").closest("button")!, { key: "Home" });
    expect(screen.getByRole("img")).toHaveAttribute("src", previous);
    expect(screen.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Copy text", exact: true })).toBeDisabled();
    finish([replacement]);
    await waitFor(() => expect(screen.getByRole("button", { name: "Save", exact: true })).toBeEnabled());
    expect(screen.getByRole("img")).toHaveAttribute("src", "data:image/png;base64,new");
  });
  it("preserves content and design choices across steps without regenerating on navigation", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="Dua"
        items={[{ ...SAMPLE_ITEMS[0]!, translation: "All praise belongs to Allah." }]}
        language="en"
      />,
    );
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    fireEvent.click(screen.getByRole("checkbox", { name: "Include reviewed English translation" }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({ content: expect.objectContaining({ meaning: true }) }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("combobox", { name: "Image size" })).toHaveClass("sharing-select-trigger");
    expect(screen.queryByRole("checkbox", { name: "Include reviewed English translation" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Gold · Evening" }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({ appearance: "gold", content: expect.objectContaining({ meaning: true }) }),
      ),
    );
    const calls = vi.mocked(generateAllCollectionStoryPages).mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByRole("button", { name: "Save", exact: true })).toBeEnabled();
    expect(screen.queryByRole("button", { name: "Previous step" })).not.toBeInTheDocument();
    goStep("design");
    expect(screen.getByRole("button", { name: "Gold · Evening" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Previous step" }));
    screen.getByText("Customize content").closest("details")!.open = true;
    expect(screen.getByRole("checkbox", { name: "Include reviewed English translation" })).toBeChecked();
    expect(generateAllCollectionStoryPages).toHaveBeenCalledTimes(calls);
  });
  it("omits the translation preset when no translation exists and makes full detail truthful", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="Dua"
        items={[{ ...SAMPLE_ITEMS[0]!, benefit: "A reviewed benefit" }]}
        language="en"
      />,
    );
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    expect(screen.queryByRole("checkbox", { name: "Include reviewed English translation" })).not.toBeInTheDocument();
    expect(screen.getByText(/No separate English translation/)).toBeVisible();
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Content preset" }), { key: "Enter" });
    expect(screen.queryByRole("option", { name: "Arabic + English translation" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: "Full detail" }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({ meaning: false, pronunciation: false, wordMeanings: false }),
        }),
      ),
    );
  });
  it("explains partial translation coverage instead of promising it for every reading", async () => {
    render(
      <CollectionShareModal
        open
        onClose={vi.fn()}
        collectionTitle="Readings"
        language="en"
        items={[]}
        shareItems={[
          { id: "a", arabicText: "نص", translation: "Meaning" },
          { id: "b", arabicText: "آخر" },
        ]}
      />,
    );
    await screen.findByRole("img");
    screen.getByText("Customize content").closest("details")!.open = true;
    expect(screen.getByText("Available for 1 of 2 readings.")).toBeVisible();
    fireEvent.click(screen.getByRole("checkbox", { name: /Include reviewed English translation/ }));
    showCaption();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("Meaning");
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("آخر");
  });
  it("localizes custom evidence and uses its source link for link sharing", async () => {
    const { generateAllCollectionStoryPages } = await import("../share/collectionShareCard");
    const byLanguage = {
      ar: [
        {
          id: "evidence",
          arabicText: "اقتباس عربي",
          textDirection: "rtl" as const,
          sourceReference: "المصدر",
          language: "ar" as const,
        },
      ],
      en: [
        {
          id: "evidence",
          arabicText: "English quotation",
          textDirection: "ltr" as const,
          sourceReference: "Source",
          language: "en" as const,
        },
      ],
    };
    render(
      <CollectionShareModal
        open
        single
        onClose={vi.fn()}
        collectionTitle="Evidence"
        items={[]}
        shareItemsByLanguage={byLanguage}
        shareUrl="https://example.com/source"
        language="en"
      />,
    );
    await screen.findByRole("img");
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Reading language" }), { key: "Enter" });
    fireEvent.click(await screen.findByRole("option", { name: "العربية" }));
    await waitFor(() =>
      expect(generateAllCollectionStoryPages).toHaveBeenLastCalledWith(
        expect.objectContaining({
          allItems: [expect.objectContaining({ arabicText: "اقتباس عربي", sourceReference: "المصدر" })],
        }),
      ),
    );
    showCaption();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("اقتباس عربي");
    fireEvent.click(screen.getByRole("button", { name: "Copy reading link", exact: true }));
    expect(screen.getByRole("textbox", { name: "Reading link" })).toHaveValue("https://example.com/source");
  });
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
    showCaption();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).not.toContain("أبو داود");
    goStep("content");
    screen.getByText("Customize content").closest("details")!.open = true;
    fireEvent.click(screen.getByRole("checkbox", { name: "Include sources", exact: true }));
    showCaption();
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
    expect(screen.getByText("Selected additions: 1", { selector: "summary *" })).toBeVisible();
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
    goStep("share");
    expect(screen.getByText("1 card to share")).toBeVisible();
    const current = screen.getByRole("combobox", { name: "Cards to share" });
    expect(screen.queryByRole("button", { name: "Image", exact: true })).not.toBeInTheDocument();
    expect(current).toHaveTextContent("This card");
    await chooseScope("Selected cards");
    expect(screen.getByText("No cards selected to share")).toBeVisible();
    expect(current).toHaveTextContent("Selected cards");
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
    goStep("design");
    expect(screen.getByRole("group", { name: "Image settings" })).toBeVisible();
    const size = screen.getByRole("combobox", { name: "Image size" });
    expect(size).toHaveAccessibleDescription(
      "Long readings continue across numbered cards, with their source on every part.",
    );
    goStep("content");
    expect(screen.getByRole("combobox", { name: "Label language" })).toHaveAccessibleDescription(
      "Card labels only. English translation is a separate addition. Word meanings are available in Arabic only.",
    );
    expect(screen.queryByRole("button", { name: "Image", exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Text", exact: true })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Link", exact: true })).not.toBeInTheDocument();
    showCaption();
    expect(screen.queryByText("Image settings")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy text" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Copy reading link" })).toBeEnabled();
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
    await waitFor(() => expect(details.querySelector("summary")).toHaveTextContent("Selected additions: 1"));
    details.open = false;
    expect(details.querySelector("summary svg")).toHaveAttribute("aria-hidden", "true");
    expect(details.querySelector("summary")).toHaveTextContent("Selected additions: 1");
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
    showCaption();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain(SAMPLE_ITEMS[0]!.arabicText);
    expect(screen.getByRole("button", { name: "Save text", exact: true })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Copy text", exact: true }));
    expect(await screen.findByText("Select the text and use your device’s copy command.")).toBeVisible();
  });
  it("offers another layout and complete text when a layout cannot be prepared", async () => {
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
    goStep("share");
    expect(screen.getByText("Choose a compatible size to enable saving.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Copy text", exact: true })).toBeEnabled();
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
    goStep("share");
    await chooseScope("Selected cards");
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
      "حاول إعداد الصورة مجدداً. يمكنك أيضاً نسخ نص القراءة من خطوة المشاركة.",
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
    goStep("design");
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

    goStep("share");
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
    showCaption();
    expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain("الحمد لله وحده");
    fireEvent.click(screen.getByRole("button", { name: "نسخ رابط القراءة", exact: true }));
    expect((screen.getByRole("textbox", { name: "رابط القراءة" }) as HTMLTextAreaElement).value).toContain(
      "#/azkar/morning",
    );
  });
  it("keeps a denied image copy visible without silently downloading", async () => {
    const { copyImageToClipboard, downloadFile } = await import("../share/shareDispatcher");
    vi.mocked(copyImageToClipboard).mockResolvedValueOnce(false);
    vi.mocked(downloadFile).mockClear();
    render(
      <CollectionShareModal open onClose={vi.fn()} collectionTitle="أذكار الصباح" items={SAMPLE_ITEMS} language="ar" />,
    );
    await screen.findByRole("img");
    goStep("share");
    fireEvent.click(screen.getByRole("button", { name: "نسخ الصورة", exact: true }));
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
    goStep("share");
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
    goStep("share");
    const footer = screen.getByTestId("sharing-actions");
    expect(Array.from(footer.querySelectorAll("button")).map((button) => button.textContent)).toEqual([
      "Share",
      "Save",
      "Copy image",
    ]);
    expect(footer.querySelectorAll('button svg[aria-hidden="true"]')).toHaveLength(3);
    expect(screen.queryByText("Save and copy options")).not.toBeInTheDocument();
    expect(
      screen
        .getByRole("dialog")
        .querySelector('[id="' + screen.getByRole("dialog").getAttribute("aria-describedby") + '"]'),
    ).toHaveClass("sr-only");
    fireEvent.click(screen.getByRole("button", { name: "Copy image", exact: true }));
    await waitFor(() => expect(copyImageToClipboard).toHaveBeenCalled());
    expect(await screen.findByText("Image copied to clipboard.")).toHaveClass("sharing-feedback");
    expect(screen.getByTestId("sharing-actions")).toContainElement(screen.getByText("Image copied to clipboard."));
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
      goStep("share");
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
  it("keeps multi-image copying explicit and offers separate complete text copying", async () => {
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
      goStep("share");
      await chooseScope("All cards");
      expect(screen.getByRole("button", { name: "Copy image", exact: true })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Copy image", exact: true })).toHaveAccessibleDescription(
        /use Copy text/,
      );
      expect(writeText).not.toHaveBeenCalled();
      showCaption();
      fireEvent.click(screen.getByRole("button", { name: "Copy text", exact: true }));
      await waitFor(() => expect(writeText).toHaveBeenCalledWith(expect.stringContaining(SAMPLE_ITEMS[0]!.arabicText)));
      await waitFor(() => expect(screen.getByRole("button", { name: "Copy text", exact: true })).toBeEnabled());
      fireEvent.click(screen.getByRole("button", { name: "Save text", exact: true }));
      expect(downloadFile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "azkar.txt", type: "text/plain;charset=utf-8" }),
      );
    } finally {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("renders curated routine cards and allows switching between curated and generated modes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(["image"], { type: "image/jpeg" }) }),
    );
    const { shareMultipleFiles } = await import("../share/shareDispatcher");
    vi.mocked(shareMultipleFiles).mockClear();

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

    await screen.findByAltText("أذكار الصباح - صفحة 1 من 5");
    expect(fetch).not.toHaveBeenCalled();
    const curatedChoice = await screen.findByRole("button", { name: "البطاقات المعتمدة" });
    expect(curatedChoice).toHaveAccessibleDescription("بطاقات جاهزة للمجموعة");
    expect(curatedChoice.querySelector(".sharing-choice-icon svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: "تصميم مخصص" })).toHaveAccessibleDescription("اختر المحتوى والتصميم");
    fireEvent.click(curatedChoice);
    expect(await screen.findByAltText(/أذكار الصباح - البطاقة الأولى/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "البطاقات المعتمدة" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText("إعدادات الصورة", { exact: true })).not.toBeInTheDocument();

    const nextBtn = screen.getByRole("button", { name: "البطاقة التالية" });
    fireEvent.click(nextBtn);
    expect(await screen.findByAltText(/أذكار الصباح - البطاقة الثانية/)).toBeInTheDocument();

    goStep("share");
    const shareBtn = screen.getByRole("button", { name: "مشاركة", exact: true });
    fireEvent.click(shareBtn);
    await waitFor(() => expect(shareMultipleFiles).toHaveBeenCalled());

    goStep("content");
    const customStudioBtn = screen.getByRole("button", { name: "تصميم مخصص" });
    fireEvent.click(customStudioBtn);
    expect(customStudioBtn).toHaveAttribute("aria-pressed", "true");
    expect(await screen.findByAltText("أذكار الصباح - صفحة 1 من 5")).toBeInTheDocument();
    vi.unstubAllGlobals();
  });

  it("recovers to generated cards when curated artwork is missing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    try {
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
      fireEvent.click(await screen.findByRole("button", { name: "البطاقات المعتمدة" }));
      expect(await screen.findByAltText("أذكار الصباح - صفحة 1 من 5")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "البطاقات المعتمدة" })).not.toBeInTheDocument();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
