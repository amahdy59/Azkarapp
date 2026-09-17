import { fireEvent, render, screen } from "@testing-library/react";
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
  removeDownloadedAudio: audioMocks.remove,
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
    fireEvent.click(await screen.findByRole("button", { name: /Morning Core/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Free some space or reconnect");
    expect(screen.queryByText(/raw download/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove downloaded audio" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not remove downloaded audio");
    expect(screen.queryByText(/raw cache/i)).not.toBeInTheDocument();
  });
});
