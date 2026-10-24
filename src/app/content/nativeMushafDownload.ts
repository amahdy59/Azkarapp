import { Capacitor, CapacitorHttp } from "@capacitor/core";

const QCF_FONT_ROOT = "https://verses.quran.foundation/fonts/quran/hafs/v2/woff2/";
const AUDIO_ORIGIN = "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/";
const AUDIO_RANGE_BYTES = 1024 * 1024;

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

function toBytes(data: unknown) {
  if (typeof data === "string") return decodeBase64(data);
  if (data instanceof Uint8Array) return data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  throw new TypeError("Native HTTP returned an unsupported binary payload");
}

function headerValue(headers: Record<string, string>, name: string) {
  return headers[name] ?? headers[Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase()) ?? ""];
}

async function fetchNativeAudioStream(url: string, signal?: AbortSignal) {
  let nextByte = 0;
  let totalBytes: number | undefined;
  let contentType = "audio/mpeg";
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (signal?.aborted) {
        controller.error(new DOMException("Download cancelled", "AbortError"));
        return;
      }
      try {
        const endByte = nextByte + AUDIO_RANGE_BYTES - 1;
        const result = await CapacitorHttp.get({
          url,
          headers: { Range: `bytes=${nextByte}-${endByte}` },
          responseType: "arraybuffer",
        });
        if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");
        if (result.status !== 206 && result.status !== 200)
          throw new Error(`Native audio request failed: ${result.status}`);

        const headers = (result.headers ?? {}) as Record<string, string>;
        contentType = headerValue(headers, "content-type") || contentType;
        const contentRange = headerValue(headers, "content-range");
        const rangeMatch = contentRange?.match(/bytes\s+(\d+)-(\d+)\/(\d+)/i);
        if (rangeMatch) {
          const rangeStart = Number(rangeMatch[1]);
          const rangeEnd = Number(rangeMatch[2]);
          totalBytes = Number(rangeMatch[3]);
          if (rangeStart !== nextByte) throw new Error("Native audio server returned an unexpected range");
          if (rangeEnd < rangeStart) throw new Error("Native audio server returned an empty range");
        } else if (result.status === 200) {
          const length = Number(headerValue(headers, "content-length"));
          if (!Number.isFinite(length) || nextByte !== 0)
            throw new Error("Native audio server does not support ranges");
          totalBytes = length;
        } else {
          throw new Error("Native audio response omitted Content-Range");
        }

        const bytes = toBytes(result.data);
        if (!bytes.byteLength || bytes.byteLength > AUDIO_RANGE_BYTES)
          throw new Error("Native audio response was empty");
        nextByte += bytes.byteLength;
        controller.enqueue(bytes);
        if (nextByte >= totalBytes) controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel() {
      // CapacitorHttp does not expose a request cancellation handle; the signal
      // still stops subsequent ranges and the transfer reader releases promptly.
    },
  });

  signal?.throwIfAborted();
  return new Response(stream, {
    status: 200,
    headers: { "content-type": contentType, ...(totalBytes ? { "content-length": String(totalBytes) } : {}) },
  });
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

  if (isAudioUrl(url)) return fetchNativeAudioStream(url, signal);

  const result = await CapacitorHttp.get({ url, responseType: "arraybuffer" });
  if (signal?.aborted) throw new DOMException("Download cancelled", "AbortError");

  const bytes = toBytes(result.data);
  const contentType = result.headers["content-type"] ?? result.headers["Content-Type"] ?? "font/woff2";
  const body = new Uint8Array(bytes.byteLength);
  body.set(bytes);
  return new Response(body.buffer as ArrayBuffer, {
    status: result.status,
    headers: { "content-type": contentType },
  });
}

export const fetchMushafResource = fetchNativeBinaryResource;
