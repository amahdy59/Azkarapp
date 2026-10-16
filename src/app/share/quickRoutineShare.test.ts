import { describe, expect, it, vi, afterEach } from "vitest";
import { prepareQuickRoutineShare, shareQuickRoutinePack } from "./quickRoutineShare";
import { canShareMultipleFiles, downloadFile, shareMultipleFiles } from "./shareDispatcher";
import { fetchAllCuratedCardFiles } from "./curatedRoutineCards";
import { createFileArchive } from "./shareArchive";
vi.mock("./shareDispatcher", () => ({
  canShareMultipleFiles: vi.fn(),
  downloadFile: vi.fn(),
  shareMultipleFiles: vi.fn(),
}));
vi.mock("./shareArchive", () => ({ createFileArchive: vi.fn() }));
vi.mock("./curatedRoutineCards", () => ({
  getCuratedRoutinePack: (id: string) => (id === "evening" ? { title: { ar: "المساء", en: "Evening" } } : null),
  fetchAllCuratedCardFiles: vi.fn(),
}));
afterEach(() => vi.resetAllMocks());
const pack = {
  files: [
    new File(["approved"], "one.webp", { type: "image/webp" }),
    new File(["approved"], "two.webp", { type: "image/webp" }),
  ],
  title: "Evening",
};
describe("quick approved routine sharing", () => {
  it("prepares the existing entire approved pack", async () => {
    vi.mocked(fetchAllCuratedCardFiles).mockResolvedValue(pack.files);
    expect(await prepareQuickRoutineShare("evening", "en")).toEqual(pack);
    await expect(prepareQuickRoutineShare("travel", "en")).rejects.toThrow();
  });
  it("shares original files directly without a studio or automatic error fallback", async () => {
    vi.mocked(canShareMultipleFiles).mockReturnValue(true);
    vi.mocked(shareMultipleFiles).mockResolvedValue({ method: "shared", fileCount: 2 });
    expect(await shareQuickRoutinePack(pack)).toBe("shared");
    expect(shareMultipleFiles).toHaveBeenCalledWith(pack.files, { title: "Evening", downloadFallback: false });
    expect(downloadFile).not.toHaveBeenCalled();
  });
  it("downloads one archive when native file sharing is unsupported", async () => {
    vi.mocked(canShareMultipleFiles).mockReturnValue(false);
    const zip = new File(["zip"], "cards.zip");
    vi.mocked(createFileArchive).mockResolvedValue(zip);
    expect(await shareQuickRoutinePack(pack)).toBe("downloaded");
    expect(createFileArchive).toHaveBeenCalledWith(pack.files, "azkar-cards.zip");
    expect(downloadFile).toHaveBeenCalledOnce();
    expect(shareMultipleFiles).not.toHaveBeenCalled();
  });
  it("does not download on native cancellation or failure", async () => {
    vi.mocked(canShareMultipleFiles).mockReturnValue(true);
    vi.mocked(shareMultipleFiles).mockResolvedValue({ method: "cancelled", fileCount: 2 });
    expect(await shareQuickRoutinePack(pack)).toBe("cancelled");
    vi.mocked(shareMultipleFiles).mockRejectedValue(new Error("failed"));
    await expect(shareQuickRoutinePack(pack)).rejects.toThrow("failed");
    expect(downloadFile).not.toHaveBeenCalled();
    expect(createFileArchive).not.toHaveBeenCalled();
  });
});
