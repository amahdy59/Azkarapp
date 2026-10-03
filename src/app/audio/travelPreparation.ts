import type { Zikr } from "../types";
import type { AudioPreferences } from "./audioTypes";
import { downloadAudioForZikrs } from "./audioOfflineCache";
import { downloadMushaf } from "../content/mushafOfflineCache";

/** Independent jobs keep successful collections when another job fails. */
export async function prepareTravelDownloads(
  collections: readonly (readonly Zikr[])[],
  preferences: AudioPreferences,
  options: {
    signal: AbortSignal;
    onProgress: (completedJobs: number, totalJobs: number) => void;
    onJobProgress?: (group: number, completed: number, total: number) => void;
  },
) {
  const jobs = [
    () =>
      downloadMushaf({
        signal: options.signal,
        onProgress: (completed, total) => options.onJobProgress?.(0, completed, total),
      }),
    ...collections.map(
      (zikrs, index) => () =>
        downloadAudioForZikrs(zikrs, preferences, {
          signal: options.signal,
          onProgress: (completed, total) => options.onJobProgress?.(index + 1, completed, total),
        }),
    ),
  ];
  let failures = 0;
  const failedJobs: number[] = [];
  let completed = 0;
  for (const job of jobs) {
    options.signal.throwIfAborted();
    try {
      await job();
    } catch (error) {
      if (options.signal.aborted) throw error;
      failures += 1;
      failedJobs.push(completed);
    }
    completed += 1;
    options.onProgress(completed, jobs.length);
  }
  return { failures, failedJobs };
}
