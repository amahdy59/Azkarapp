import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { generateAyahCards, loadAyahEnglishTranslation, shareMultipleFiles, downloadFile, canShareMultipleFiles } =
  vi.hoisted(() => ({
    generateAyahCards: vi.fn(),
    loadAyahEnglishTranslation: vi.fn(),
    canShareMultipleFiles: vi.fn(),
    shareMultipleFiles: vi.fn(),
    downloadFile: vi.fn(),
  }));
vi.mock("../share/ayahShareCard", () => ({ generateAyahCards }));
vi.mock("../content/quranTranslations", () => ({ loadAyahEnglishTranslation }));
vi.mock("../share/shareDispatcher", () => ({ shareMultipleFiles, downloadFile, canShareMultipleFiles }));
import AyahShareStudio from "./AyahShareStudio";
const props = {
  verseKey: "112:1",
  text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
  title: "Al-Ikhlas · Ayah 1",
  language: "en" as const,
  meanings: [{ id: "one", surahNumber: 112, ayahNumber: 1, word: "أَحَدٌ", explanationArabic: "واحد" }],
  onBack: vi.fn(),
  onClose: vi.fn(),
};
function goStep(step: "content" | "design" | "share") {
  const nav = screen.getByRole("navigation", { name: "Sharing steps" });
  fireEvent.click(within(nav).getByRole("button", { name: new RegExp(`^${step[0]!.toUpperCase()}${step.slice(1)},`) }));
}

describe("AyahShareStudio", () => {
  it("skips optional design without regenerating or resetting the selected format", async () => {
    render(
      <AyahShareStudio {...props} options={{ format: "square", includeTranslation: false, includeMeanings: false }} />,
    );
    await screen.findByRole("img");
    const calls = generateAyahCards.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: "Skip design" }));
    await waitFor(() => expect(screen.getByRole("heading", { name: "Share", exact: true })).toHaveFocus());
    expect(generateAyahCards).toHaveBeenCalledTimes(calls);
    expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled();
    goStep("design");
    expect(screen.getByRole("combobox", { name: "Image size" })).toHaveTextContent("Square");
  });
  it("regenerates bounded text size and respects the fit preference", async () => {
    render(<AyahShareStudio {...props} />);
    goStep("design");
    screen.getByText("Card text", { selector: "summary" }).closest("details")!.open = true;
    const size = screen.getByRole("slider", { name: /Text size/ });
    expect(size).toHaveAttribute("min", "0.75");
    expect(size).toHaveAttribute("max", "1.125");
    fireEvent.change(size, { target: { value: "0.75" } });
    await waitFor(() => expect(generateAyahCards.mock.lastCall![0]).toMatchObject({ textScale: 0.75, fitAyah: true }));
    await userEvent.setup().click(screen.getByRole("checkbox", { name: "Fit ayah on one card" }));
    await waitFor(() => expect(generateAyahCards.mock.lastCall![0]).toMatchObject({ textScale: 0.75, fitAyah: false }));
  });
  it("keeps focused controls reachable after content reflow and cleans up resize work", async () => {
    let measure = () => {};
    let frame: FrameRequestCallback = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    const cancel = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          measure = callback;
        }
        observe = observe;
        disconnect = disconnect;
      },
    );
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      frame = callback;
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const { unmount } = render(<AyahShareStudio {...props} />);
    const root = screen.getByTestId("ayah-share-studio");
    Object.defineProperty(root, "clientHeight", { value: 400 });
    Object.defineProperty(root.querySelector("header"), "offsetHeight", { value: 150 });
    Object.defineProperty(root.querySelector("footer"), "offsetHeight", { value: 200 });
    const button = screen.getByRole("button", { name: "Close" });
    const reveal = vi.fn();
    Object.defineProperty(button, "scrollIntoView", { value: reveal });
    button.focus();
    act(() => measure());
    expect(root).toHaveAttribute("data-scroll-whole", "true");
    expect(observe).toHaveBeenCalledWith(root.querySelector(".ayah-share-body"));
    reveal.mockClear();
    act(() => frame(0));
    expect(reveal).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalled();
  });
  it("offers an explicit preview expansion without changing the generated card", async () => {
    render(<AyahShareStudio {...props} />);
    const image = await screen.findByRole("img");
    const source = image.getAttribute("src");
    fireEvent.click(screen.getByRole("button", { name: "Enlarge preview" }));
    const collapse = screen.getByRole("button", { name: "Reduce preview" });
    expect(collapse).toHaveAttribute("aria-expanded", "true");
    expect(image).toHaveAttribute("src", source);
    fireEvent.click(collapse);
    expect(screen.getByRole("button", { name: "Enlarge preview" })).toHaveAttribute("aria-expanded", "false");
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", Object.assign(URL, { revokeObjectURL: vi.fn() }));
    loadAyahEnglishTranslation.mockResolvedValue("Say: He is Allah, the One!");
    canShareMultipleFiles.mockReturnValue(true);
    generateAyahCards.mockImplementation(async () => [
      {
        file: new File(["png"], "ayah.png", { type: "image/png" }),
        url: "blob:preview",
        width: 1080,
        height: 1350,
        page: { rows: [] },
      },
    ]);
    shareMultipleFiles.mockResolvedValue({ method: "cancelled", fileCount: 1 });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("uses opt-in content, regenerates format, shares and cleans up previews", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<AyahShareStudio {...props} />);
    expect(screen.getByRole("heading", { name: "Share ayah" })).toHaveFocus();
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled());
    expect(generateAyahCards.mock.lastCall![0]).toMatchObject({
      text: props.text,
      format: "portrait",
      translation: undefined,
      meanings: undefined,
    });
    goStep("content");
    await user.click(screen.getByRole("checkbox", { name: "Include English translation" }));
    await user.click(screen.getByRole("checkbox", { name: "Include Arabic word explanations" }));
    goStep("design");
    await user.click(screen.getByRole("combobox", { name: "Image size" }));
    await user.click(screen.getByRole("option", { name: "Square · 1:1", exact: true }));
    await waitFor(() =>
      expect(generateAyahCards.mock.lastCall![0]).toMatchObject({
        format: "square",
        translation: {
          text: "Say: He is Allah, the One!",
          label: "English translation · Saheeh International",
        },
        meanings: { text: "أَحَدٌ: واحد" },
      }),
    );
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Share card" }));
    expect(shareMultipleFiles).toHaveBeenCalledOnce();
    expect(await screen.findByRole("status")).toHaveTextContent("Sharing cancelled");
    expect(shareMultipleFiles.mock.lastCall![1]).toMatchObject({ downloadFallback: false });
    expect(shareMultipleFiles.mock.lastCall![1].text).toBeUndefined();
    await user.click(screen.getByRole("checkbox", { name: "Include text with image" }));
    const caption = (screen.getByRole("textbox", { name: "Caption preview" }) as HTMLTextAreaElement).value;
    expect(caption).toContain("Saheeh International");
    await user.click(screen.getByRole("button", { name: "Share card" }));
    expect(shareMultipleFiles.mock.lastCall![1].text).toBe(caption);
    await user.click(screen.getByRole("button", { name: "Save this card" }));
    expect(downloadFile).toHaveBeenCalledOnce();
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("explains unavailable content and announces a generation error", async () => {
    loadAyahEnglishTranslation.mockResolvedValue(null);
    generateAyahCards.mockRejectedValue(new Error("encoding failed"));
    render(<AyahShareStudio {...props} meanings={[]} />);
    expect(await screen.findByText(/Translation is unavailable on this device/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Include English translation" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Include Arabic word explanations" })).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not|Unable|try again/i);
    goStep("share");
    expect(screen.getByRole("button", { name: "Save this card" })).toBeDisabled();
  });
  it("offers explicit saving when native sharing is unsupported", async () => {
    canShareMultipleFiles.mockReturnValue(false);
    const user = userEvent.setup();
    render(<AyahShareStudio {...props} />);
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Save this card" })).toBeEnabled());
    expect(screen.getByRole("status")).toHaveTextContent("Image sharing is unavailable");
    await user.click(screen.getByRole("button", { name: "Save this card" }));
    expect(downloadFile).toHaveBeenCalledOnce();
    expect(shareMultipleFiles).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("Download started");
  });
  it("names the full sharing scope and saves only the displayed continuation", async () => {
    const first = {
      file: new File(["one"], "one.png"),
      url: "blob:one",
      width: 1080,
      height: 1350,
      page: { rows: [] },
    };
    const second = { ...first, file: new File(["two"], "two.png"), url: "blob:two" };
    generateAyahCards.mockResolvedValue([first, second]);
    const user = userEvent.setup();
    render(<AyahShareStudio {...props} />);
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share all 2 cards" })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: "Share all 2 cards" }));
    expect(shareMultipleFiles.mock.lastCall![0]).toEqual([first.file, second.file]);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("img")).toHaveAttribute("src", "blob:two");
    await user.click(screen.getByRole("button", { name: "Save this card" }));
    expect(downloadFile).toHaveBeenCalledWith(second.file);
  });
  it("can retry generation without silently downloading after a sharing failure", async () => {
    generateAyahCards.mockRejectedValueOnce(new Error("encoding failed"));
    const user = userEvent.setup();
    render(<AyahShareStudio {...props} />);
    goStep("share");
    await screen.findByRole("alert");
    await user.click(screen.getByRole("button", { name: "Try again" }));
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled());
    shareMultipleFiles.mockRejectedValueOnce(new Error("native service failed"));
    await user.click(screen.getByRole("button", { name: "Share card" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("share");
    expect(downloadFile).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Save this card" })).toBeEnabled();
  });
  it("retains the previous preview while blocking stale exports and cancels superseded generation", async () => {
    const user = userEvent.setup();
    render(<AyahShareStudio {...props} />);
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled());
    const oldSignal = generateAyahCards.mock.lastCall![1] as AbortSignal;
    let finish!: (value: unknown) => void;
    generateAyahCards.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    goStep("design");
    await user.click(screen.getByRole("combobox", { name: "Image size" }));
    await user.click(screen.getByRole("option", { name: "Square · 1:1", exact: true }));
    expect(oldSignal.aborted).toBe(true);
    expect(screen.getByRole("img")).toHaveAttribute("src", "blob:preview");
    goStep("share");
    expect(screen.getByRole("button", { name: "Save this card" })).toBeDisabled();
    await waitFor(() => expect(finish).toBeDefined());
    finish([{ file: new File(["new"], "new.png"), url: "blob:new", width: 1080, height: 1080, page: { rows: [] } }]);
    goStep("share");
    await waitFor(() => expect(screen.getByRole("button", { name: "Share card" })).toBeEnabled());
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("recovers generation and translation independently and exposes complete selectable text", async () => {
    loadAyahEnglishTranslation.mockResolvedValueOnce(null);
    const user = userEvent.setup();
    render(<AyahShareStudio {...props} />);
    await user.click(await screen.findByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.getByRole("checkbox", { name: "Include English translation" })).toBeEnabled());
    goStep("content");
    await user.click(screen.getByRole("checkbox", { name: "Include English translation" }));
    goStep("share");
    await user.click(screen.getByText("Read the card text"));
    await user.click(screen.getByRole("button", { name: "Copy text" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Reading text copied."));
    expect(await navigator.clipboard.readText()).toContain("Saheeh International");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(props.onClose).toHaveBeenCalled();
  });
});
