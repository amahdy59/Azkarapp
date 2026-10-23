import { Capacitor, CapacitorHttp } from "@capacitor/core";

const QCF_FONT_ROOT = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/";
const AUDIO_ORIGIN = "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/";

function isNativeAndroid() {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
}

function isQcfFontUrl(url: string) {
  return url.startsWith(QCF_FONT_ROOT) && url.endsWith(".woff2");
}

function isAudioUrl(url: string) {
  return url.startsWith(AUDIO_ORIGIN);
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/**
 * Uses Capacitor's native HTTP implementation for Android's cross-origin QCF
 * font downloads. The normal browser fetch remains the source of truth on the
 * PWA and for the bundled Mushaf JSON.
 */
export async function fetchNativeBinaryResource(
  url: string,
  signal?: AbortSignal,
  init: RequestInit = {},
): Promise<Response> {
  if (!isNativeAndroid() || (!isQcfFontUrl(url) && !isAudioUrl(url))) return fetch(url, { ...init, signal });
  if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");

  const result = await CapacitorHttp.get({ url, responseType: "arraybuffer" });
  if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");

  const data = typeof result.data === "string" ? decodeBase64(result.data) : result.data;
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  const contentType = result.headers["content-type"] ?? result.headers["Content-Type"] ?? "font/woff2";
  return new Response(new Blob([bytes.buffer as ArrayBuffer], { type: contentType }), {
    status: result.status,
    headers: { "content-type": contentType },
  });
}

export const fetchMushafResource = fetchNativeBinaryResource;
