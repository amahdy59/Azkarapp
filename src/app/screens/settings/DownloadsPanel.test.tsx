import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const audioMocks = vi.hoisted(() => ({
  download: vi.fn(),
  remove: vi.fn(),
  summary: vi.fn(() => ({ assetCount: 1, byteSize: 1024 })),
}));

vi.mock("../../audio/audioPreferences", () => ({ loadAudioPreferences: () => ({}) }));
vi.mock("../../content/azkar", () => ({ getAzkarForMode: () => [] }));
vi.mock("../../audio/audioOfflineCache", () => ({
  downloadAudioForZikrs: audioMocks.download,
  estimateAudioDownloadBytes: () => 1024,
  getDownloadedAudioSummary: audioMocks.summary,
  getAudioDownloadStatuses: vi.fn(async (groups) =>
    groups.map(() => ({ completed: 0, total: 4, remainingBytes: 4096 })),
  ),
  removeAudioForZikrs: audioMocks.remove,
}));
vi.mock("../../content/mushafOfflineCache", () => ({
  downloadMushaf: vi.fn(),
  getMushafDownloadStatus: vi.fn().mockResolvedValue({ downloadedPages: 0, totalPages: 604 }),
}));

import { DownloadsPanel } from "./DownloadsPanel";

describe("DownloadsPanel", () => {
  it.each(["baqarah", "kahf"])("downloads and removes %s independently with confirmation", async (id) => {
    const { getAudioDownloadStatuses } = await import("../../audio/audioOfflineCache");
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: vi.fn().mockResolvedValue({ usage: 0, quota: 1e9 }) },
    });
    audioMocks.download.mockResolvedValue({ assetCount: 1, byteSize: 1024 });
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const row = await screen.findByTestId(`offline-resource-${id}`);
    const download = within(row).getByRole("button", { name: /^Download ·/ });
    await waitFor(() => expect(download).toBeEnabled());
    vi.mocked(getAudioDownloadStatuses).mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => ({
        completed: index === (id === "kahf" ? 3 : 4) ? 4 : 0,
        total: 4,
        remainingBytes: 0,
      })),
    );
    fireEvent.click(download);
    await waitFor(() => expect(audioMocks.download).toHaveBeenCalledTimes(1));
    const zikrs = audioMocks.download.mock.calls[0]![0];
    expect(zikrs.map((z: { id: string }) => z.id)).toEqual([id === "kahf" ? "friday-kahf" : "ir-baqarah"]);
    const remove = await within(row).findByRole("button", { name: /^Remove download ·/ });
    await waitFor(() => expect(remove).toBeEnabled());
    fireEvent.click(remove);
    expect(audioMocks.remove).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Remove download", exact: true }));
    await waitFor(() => expect(audioMocks.remove).toHaveBeenCalledWith(zikrs, {}));
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    expect(downloadMushaf).not.toHaveBeenCalled();
  });

  it("uses persisted verified coverage after reopening the panel and isolates numeric sizes", async () => {
    const { getAudioDownloadStatuses } = await import("../../audio/audioOfflineCache");
    vi.mocked(getAudioDownloadStatuses).mockResolvedValue(
      Array.from({ length: 6 }, () => ({ completed: 1, total: 4, remainingBytes: 77_256_100 })),
    );
    const view = render(<DownloadsPanel language="ar" onBack={vi.fn()} />);
    await waitFor(() =>
      expect(within(screen.getByTestId("offline-resource-kahf")).getByRole("progressbar")).toHaveAttribute(
        "value",
        "1",
      ),
    );
    expect(screen.getByTestId("offline-resource-kahf").querySelector('bdi[dir="ltr"]')).toHaveTextContent("٧٧.٣ MB");
    view.unmount();
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    await waitFor(() =>
      expect(within(screen.getByTestId("offline-resource-kahf")).getByRole("progressbar")).toHaveAttribute(
        "value",
        "1",
      ),
    );
  });
  beforeEach(async () => {
    vi.clearAllMocks();
    const { getAudioDownloadStatuses } = await import("../../audio/audioOfflineCache");
    vi.mocked(getAudioDownloadStatuses).mockImplementation(async (groups) =>
      groups.map(() => ({ completed: 0, total: 4, remainingBytes: 4096 })),
    );
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    vi.mocked(downloadMushaf).mockReset();
    audioMocks.download.mockRejectedValue(new Error("raw download implementation detail"));
    audioMocks.remove.mockRejectedValue(new Error("raw cache implementation detail"));
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { getRegistration: vi.fn().mockResolvedValue({ active: {} }) },
    });
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: vi.fn().mockResolvedValue({ usage: 1024, quota: 4096 }) },
    });
    Object.defineProperty(window, "caches", {
      configurable: true,
      value: { keys: vi.fn().mockResolvedValue(["app-cache"]) },
    });
  });

  it("maps download and removal failures to localized actionable copy", async () => {
    const { getAudioDownloadStatuses } = await import("../../audio/audioOfflineCache");
    vi.mocked(getAudioDownloadStatuses).mockResolvedValue(
      Array.from({ length: 6 }, () => ({ completed: 1, total: 4, remainingBytes: 4096 })),
    );
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const morningDownload = await screen.findByRole("button", { name: /^(Download|Resume) · Morning Core$/ });
    await waitFor(() => expect(morningDownload).toBeEnabled());
    fireEvent.click(morningDownload);
    expect(await screen.findByRole("alert")).toHaveTextContent("Free some space or reconnect");
    expect(screen.queryByText(/raw download/i)).not.toBeInTheDocument();

    await waitFor(() => expect(screen.getByRole("button", { name: "Remove download · Morning Core" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Remove download · Morning Core" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove download", exact: true }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not remove downloaded audio"));
    expect(screen.queryByText(/raw cache/i)).not.toBeInTheDocument();
  });

  it("waits for initial storage status before allowing a download to start", async () => {
    let resolveStorage!: (estimate: StorageEstimate) => void;
    const storage = new Promise<StorageEstimate>((resolve) => {
      resolveStorage = resolve;
    });
    vi.mocked(navigator.storage.estimate).mockReturnValueOnce(storage);
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const mushaf = screen.getByRole("button", { name: "Download complete Mushaf · Complete Mushaf offline" });
    const audio = await screen.findByRole("button", { name: /^(Download|Resume) · Morning Core$/ });
    expect(mushaf).toBeDisabled();
    expect(audio).toBeDisabled();
    fireEvent.click(mushaf);
    fireEvent.click(audio);
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    expect(downloadMushaf).not.toHaveBeenCalled();
    expect(audioMocks.download).not.toHaveBeenCalled();
    await act(async () => resolveStorage({ usage: 1024, quota: 4096 }));
    await waitFor(() => expect(mushaf).toBeEnabled());
    expect(audio).toBeEnabled();
    fireEvent.click(audio);
    expect(await screen.findByRole("alert")).toHaveTextContent("Free some space or reconnect");
  });

  it("handles Mushaf download progress and cancellation independently without affecting audio", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: vi.fn().mockResolvedValue({ usage: 1024, quota: 512 * 1024 * 1024 }) },
    });
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    let capturedSignal: AbortSignal | undefined;

    vi.mocked(downloadMushaf).mockImplementation(async (options) => {
      capturedSignal = options?.signal;
      options?.onProgress?.(100, 604);
      return new Promise((_, reject) => {
        options?.signal?.addEventListener("abort", () => {
          reject(new DOMException("Download cancelled", "AbortError"));
        });
      });
    });

    render(<DownloadsPanel language="en" onBack={vi.fn()} />);

    const downloadMushafBtn = await screen.findByRole("button", {
      name: "Download complete Mushaf · Complete Mushaf offline",
    });
    await waitFor(() => expect(downloadMushafBtn).toBeEnabled());
    fireEvent.click(downloadMushafBtn);

    // Shows progress and cancel button
    const cancelBtn = await screen.findByRole("button", { name: "Cancel download · Complete Mushaf offline" });
    expect(cancelBtn).toBeInTheDocument();
    expect(screen.getByText(/100 of 604 pages downloaded/i)).toBeInTheDocument();

    // Clicking cancel aborts the signal and displays cancelled status
    fireEvent.click(cancelBtn);
    expect(capturedSignal?.aborted).toBe(true);
    await waitFor(() => {
      expect(screen.getByText(/download cancelled/i)).toBeInTheDocument();
    });
  });

  it("does not start a Mushaf download when estimated storage is insufficient", async () => {
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const downloadMushafBtn = await screen.findByRole("button", {
      name: "Download complete Mushaf · Complete Mushaf offline",
    });
    await waitFor(() => expect(downloadMushafBtn).toBeEnabled());
    fireEvent.click(downloadMushafBtn);
    expect(await screen.findByRole("alert")).toHaveTextContent(/space/i);
    expect(downloadMushaf).not.toHaveBeenCalled();
  });

  it("reports individual travel failures while preserving successful download groups", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { estimate: vi.fn().mockResolvedValue({ usage: 0, quota: 1024 * 1024 * 1024 }) },
    });
    const { downloadMushaf } = await import("../../content/mushafOfflineCache");
    vi.mocked(downloadMushaf).mockRejectedValue(new Error("network"));
    audioMocks.download.mockResolvedValue({ assetCount: 1, byteSize: 1024 });
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const prepare = screen.getByRole("button", { name: "Download essentials" });
    await waitFor(() => expect(prepare).toBeEnabled());
    fireEvent.click(prepare);
    expect(await screen.findByRole("alert")).toHaveTextContent("Completed downloads are kept");
    expect(screen.getByRole("alert")).toHaveTextContent("Complete Mushaf offline");
    expect(audioMocks.download).toHaveBeenCalledTimes(4);
    expect(audioMocks.download.mock.calls[3]?.[0]).not.toHaveLength(0);
  });

  it("does not claim travel readiness when there are no verified audio recordings", async () => {
    const { getMushafDownloadStatus } = await import("../../content/mushafOfflineCache");
    const { getAudioDownloadStatuses } = await import("../../audio/audioOfflineCache");
    vi.mocked(getMushafDownloadStatus).mockResolvedValueOnce({
      downloadedPages: 604,
      downloadedFonts: 604,
      totalPages: 604,
      isComplete: true,
    });
    vi.mocked(getAudioDownloadStatuses).mockResolvedValueOnce(
      Array.from({ length: 6 }, () => ({ completed: 0, total: 0, remainingBytes: 0 })),
    );
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole("button", { name: "Download essentials" })).toBeEnabled());
    expect(screen.getByTestId("travel-readiness")).toHaveTextContent("not fully downloaded");
  });
});
