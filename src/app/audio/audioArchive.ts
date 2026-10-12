import type { Zikr } from "../types";
import type { AudioPreferences } from "./audioTypes";
import {
  downloadAudioForZikrs,
  estimateAudioDownloadBytes,
  getSavedAudioFiles,
  prepareSavedAudioFile,
  type AudioDownloadProgress,
} from "./audioOfflineCache";
import { createFileArchive } from "../share/shareArchive";

/** Missing files follow the normal verified downloader; exports never remove offline copies. */
export async function prepareAudioArchive(
  zikrs: readonly Zikr[],
  preferences: AudioPreferences,
  options: {
    signal?: AbortSignal;
    onDetail?: (detail: AudioDownloadProgress) => void;
    onArchiveProgress?: (completed: number, total: number) => void;
  } = {},
) {
  await downloadAudioForZikrs(zikrs, preferences, { signal: options.signal, onDetail: options.onDetail });
  options.signal?.throwIfAborted();
  const files = await getSavedAudioFiles(zikrs, preferences);
  if (
    !files.length ||
    files.reduce((sum, file) => sum + file.byteSize, 0) !== estimateAudioDownloadBytes(zikrs, preferences)
  )
    throw new Error("Incomplete audio archive");
  async function* entries() {
    options.onArchiveProgress?.(0, files.length);
    for (let index = 0; index < files.length; index++) {
      options.signal?.throwIfAborted();
      yield await prepareSavedAudioFile(zikrs, preferences, files[index]!.id);
      options.onArchiveProgress?.(index + 1, files.length);
    }
  }
  return createFileArchive(entries(), "wa-zaker-audio.zip", { signal: options.signal });
}
