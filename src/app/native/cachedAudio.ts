import { AUDIO_CACHE_NAME } from "../audio/audioOfflineCache";

/** Android's packaged shell has no web worker to serve media range requests. */
export async function nativeAudioSource(url: string): Promise<{ url: string; release: () => void }> {
  const remote = { url, release: () => {} };
  try {
    if (!("caches" in globalThis)) return remote;
    const response = await (await caches.open(AUDIO_CACHE_NAME)).match(url);
    if (!response || response.status !== 200 || !response.headers.get("content-type")?.startsWith("audio/"))
      return remote;
    const blob = await response.blob();
    if (!blob.size) return remote;
    const local = URL.createObjectURL(blob);
    return { url: local, release: () => URL.revokeObjectURL(local) };
  } catch {
    return remote;
  }
}
