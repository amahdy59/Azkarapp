import latest from "../../public/release-notes.json";
import type { ReleaseNotes } from "./releaseNotes";
import archiveUrl from "./release-history.bin?url";

export const latestBundledRelease: ReleaseNotes = latest;
let cached: Promise<ReleaseNotes[]> | undefined;
/** The lossless archive is precached with the app and decoded locally. */
export function loadReleaseHistory(): Promise<ReleaseNotes[]> {
  return (cached ??= (async () => {
    try {
      const response = await fetch(archiveUrl);
      if (!response.ok) return [latestBundledRelease];
      const bytes = await response.arrayBuffer();
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
      const history = JSON.parse(await new Response(stream).text()) as ReleaseNotes[];
      return history;
    } catch {
      return [latestBundledRelease];
    }
  })());
}
