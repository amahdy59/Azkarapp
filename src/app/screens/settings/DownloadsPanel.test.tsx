import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  getAudioDownloadStatus: vi.fn().mockResolvedValue({ completed: 0, total: 4, remainingBytes: 4096 }),
  removeDownloadedAudio: audioMocks.remove,
}));
vi.mock("../../content/mushafOfflineCache", () => ({
  downloadMushaf: vi.fn(),
  getMushafDownloadStatus: vi.fn().mockResolvedValue({ downloadedPages: 0, totalPages: 604 }),
}));

import { DownloadsPanel } from "./DownloadsPanel";

describe("DownloadsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    const morningDownload = await screen.findByRole("button", { name: /Morning Core/i });
    await waitFor(() => expect(morningDownload).toBeEnabled());
    fireEvent.click(morningDownload);
    expect(await screen.findByRole("alert")).toHaveTextContent("Free some space or reconnect");
    expect(screen.queryByText(/raw download/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove downloaded audio" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Could not remove downloaded audio"));
    expect(screen.queryByText(/raw cache/i)).not.toBeInTheDocument();
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

    const downloadMushafBtn = await screen.findByRole("button", { name: "Download complete Mushaf" });
    fireEvent.click(downloadMushafBtn);

    // Shows progress and cancel button
    const cancelBtn = await screen.findByRole("button", { name: "Cancel download" });
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
    fireEvent.click(await screen.findByRole("button", { name: "Download complete Mushaf" }));
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
    const prepare = screen.getByRole("button", { name: "Prepare offline reading and audio" });
    await waitFor(() => expect(prepare).toBeEnabled());
    fireEvent.click(prepare);
    expect(await screen.findByRole("alert")).toHaveTextContent("Completed downloads are kept");
    expect(screen.getByRole("alert")).toHaveTextContent("Complete Mushaf offline");
    expect(audioMocks.download).toHaveBeenCalledTimes(4);
    expect(audioMocks.download.mock.calls[3]?.[0]).not.toHaveLength(0);
  });

  it("does not claim travel readiness when there are no verified audio recordings", async () => {
    const { getMushafDownloadStatus } = await import("../../content/mushafOfflineCache");
    const { getAudioDownloadStatus } = await import("../../audio/audioOfflineCache");
    vi.mocked(getMushafDownloadStatus).mockResolvedValueOnce({
      downloadedPages: 604,
      downloadedFonts: 604,
      totalPages: 604,
      isComplete: true,
    });
    vi.mocked(getAudioDownloadStatus).mockResolvedValueOnce({ completed: 0, total: 0, remainingBytes: 0 });
    render(<DownloadsPanel language="en" onBack={vi.fn()} />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Prepare offline reading and audio" })).toBeEnabled(),
    );
    expect(screen.getByTestId("travel-readiness")).toHaveTextContent("not complete yet");
  });
});
