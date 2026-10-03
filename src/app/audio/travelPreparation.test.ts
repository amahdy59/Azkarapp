import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_AUDIO_PREFERENCES } from "./audioPreferences";
import { prepareTravelDownloads } from "./travelPreparation";
import { downloadAudioForZikrs } from "./audioOfflineCache";
import { downloadMushaf } from "../content/mushafOfflineCache";
vi.mock("./audioOfflineCache", () => ({ downloadAudioForZikrs: vi.fn() }));
vi.mock("../content/mushafOfflineCache", () => ({ downloadMushaf: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
});
describe("travel preparation", () => {
  it("keeps independent jobs running after a failure and reports the failed group", async () => {
    vi.mocked(downloadMushaf).mockRejectedValue(new Error("offline"));
    vi.mocked(downloadAudioForZikrs).mockResolvedValue({ assetCount: 1, byteSize: 1 });
    const onProgress = vi.fn();
    expect(
      await prepareTravelDownloads([[], [], [], []], DEFAULT_AUDIO_PREFERENCES, {
        signal: new AbortController().signal,
        onProgress,
      }),
    ).toEqual({ failures: 1, failedJobs: [0] });
    expect(downloadAudioForZikrs).toHaveBeenCalledTimes(4);
    expect(onProgress).toHaveBeenLastCalledWith(5, 5);
  });
  it("cancels without beginning later jobs or deleting successful work", async () => {
    const controller = new AbortController();
    vi.mocked(downloadMushaf).mockImplementation(async () => {
      controller.abort();
    });
    await expect(
      prepareTravelDownloads([[]], DEFAULT_AUDIO_PREFERENCES, { signal: controller.signal, onProgress: vi.fn() }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(downloadAudioForZikrs).not.toHaveBeenCalled();
  });
});
