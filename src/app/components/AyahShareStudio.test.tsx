import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const { generateAyahCards, loadAyahTranslation, shareMultipleFiles, downloadFile } = vi.hoisted(() => ({
  generateAyahCards: vi.fn(),
  loadAyahTranslation: vi.fn(),
  shareMultipleFiles: vi.fn(),
  downloadFile: vi.fn(),
}));
vi.mock("../share/ayahShareCard", () => ({ generateAyahCards }));
vi.mock("../content/ayahTranslations", () => ({ loadAyahTranslation }));
vi.mock("../share/shareDispatcher", () => ({ shareMultipleFiles, downloadFile }));
import AyahShareStudio from "./AyahShareStudio";
const props = {
  verseKey: "112:1",
  text: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
  title: "Al-Ikhlas · Ayah 1",
  language: "en" as const,
  meanings: [{ id: "one", surahNumber: 112, ayahNumber: 1, word: "أَحَدٌ", explanationArabic: "واحد" }],
  onBack: vi.fn(),
};
describe("AyahShareStudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", Object.assign(URL, { revokeObjectURL: vi.fn() }));
    loadAyahTranslation.mockResolvedValue({ text: "Say: He is Allah, the One!", source: "Pickthall" });
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
    expect(screen.getByRole("heading", { name: "Ayah card" })).toHaveFocus();
    await waitFor(() => expect(screen.getByRole("button", { name: "Share cards" })).toBeEnabled());
    expect(generateAyahCards.mock.lastCall![0]).toMatchObject({
      text: props.text,
      format: "portrait",
      translation: undefined,
      meanings: undefined,
    });
    await user.click(screen.getByRole("checkbox", { name: "English translation" }));
    await user.click(screen.getByRole("checkbox", { name: "Arabic word meanings" }));
    await user.click(screen.getByRole("radio", { name: /Square/ }));
    await waitFor(() =>
      expect(generateAyahCards.mock.lastCall![0]).toMatchObject({
        format: "square",
        translation: { text: "Say: He is Allah, the One!", label: "English translation · Pickthall" },
        meanings: { text: "أَحَدٌ: واحد" },
      }),
    );
    await user.click(screen.getByRole("button", { name: "Share cards" }));
    expect(shareMultipleFiles).toHaveBeenCalledOnce();
    expect(await screen.findByRole("status")).toHaveTextContent("Sharing cancelled");
    await user.click(screen.getByRole("button", { name: "Save this image" }));
    expect(downloadFile).toHaveBeenCalledOnce();
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
  it("explains unavailable content and announces a generation error", async () => {
    loadAyahTranslation.mockResolvedValue(null);
    generateAyahCards.mockRejectedValue(new Error("encoding failed"));
    render(<AyahShareStudio {...props} meanings={[]} />);
    expect(await screen.findByText(/reviewed translation for this ayah/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "English translation" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Arabic word meanings" })).toBeDisabled();
    expect(await screen.findByRole("alert")).toHaveTextContent(/could not|Unable|try again/i);
    expect(screen.getByRole("button", { name: "Share cards" })).toBeDisabled();
  });
});
