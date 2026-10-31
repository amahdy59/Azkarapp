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

function audioContentType(url: string) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".wav")) return "audio/wav";
  if (pathname.endsWith(".ogg") || pathname.endsWith(".oga")) return "audio/ogg";
  if (pathname.endsWith(".m4a")) return "audio/mp4";
  return "audio/mpeg";
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
  throw new TypeError("Unsupported native binary data");
}

function headerValue(headers: Record<string, string>, name: string) {
  return headers[name] ?? headers[Object.keys(headers).find((key) => key.toLowerCase() === name.toLowerCase()) ?? ""];
}

/** The native request cannot be cancelled, but it must not retain the caller. */
function nativeRequest(options: Parameters<typeof CapacitorHttp.get>[0], signal?: AbortSignal) {
  signal?.throwIfAborted();
  return new Promise<Awaited<ReturnType<typeof CapacitorHttp.get>>>((resolve, reject) => {
    const cancel = () => reject(signal?.reason ?? new DOMException("Download cancelled", "AbortError"));
    signal?.addEventListener("abort", cancel, { once: true });
    void CapacitorHttp.get({ ...options, connectTimeout: 30_000, readTimeout: 30_000 })
      .then(resolve, reject)
      .finally(() => signal?.removeEventListener("abort", cancel));
  });
}

async function fetchNativeAudioStream(url: string, signal?: AbortSignal) {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal?.reason);
  signal?.throwIfAborted();
  signal?.addEventListener("abort", cancel, { once: true });
  const cleanup = () => signal?.removeEventListener("abort", cancel);
  const request = (offset: number) =>
    nativeRequest(
      { url, headers: { Range: `bytes=${offset}-${offset + AUDIO_RANGE_BYTES - 1}` }, responseType: "arraybuffer" },
      controller.signal,
    );
  let first: Awaited<ReturnType<typeof request>>;
  try {
    first = await request(0);
  } catch (error) {
    cleanup();
    throw error;
  }
  const headers = new Headers(first.headers);
  if (first.status !== 206 && first.status !== 200) {
    cleanup();
    return new Response(null, { status: first.status, headers });
  }
  let nextByte = 0;
  let totalBytes: number | undefined;
  // The Response is created before the first range request is pulled. Infer
  // the type up front so WAV/OGG recordings are not rejected by the transfer
  // verifier as audio/mpeg before the native headers arrive.
  const firstHeaders = (first.headers ?? {}) as Record<string, string>;
  let contentType = headerValue(firstHeaders, "content-type") || audioContentType(url);
  let pending: typeof first | undefined = first;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        signal?.throwIfAborted();
        const result = pending ?? (await request(nextByte));
        pending = undefined;
        if (result.status !== 206 && result.status !== 200)
          throw new Error(`Native audio request failed: ${result.status}`);

        const headers = (result.headers ?? {}) as Record<string, string>;
        const responseContentType = headerValue(headers, "content-type");
        if (responseContentType) contentType = responseContentType;
        const contentRange = headerValue(headers, "content-range");
        const rangeMatch = contentRange?.match(/bytes\s+(\d+)-(\d+)\/(\d+)/i);
        if (rangeMatch) {
          const rangeStart = Number(rangeMatch[1]);
          const rangeEnd = Number(rangeMatch[2]);
          const expectedTotal = Number(rangeMatch[3]);
          if (totalBytes !== undefined && totalBytes !== expectedTotal) throw new Error("Audio resource changed");
          totalBytes = expectedTotal;
          if (rangeStart !== nextByte || rangeEnd < rangeStart) throw new Error("Invalid audio range");
        } else if (result.status === 200) {
          const length = Number(headerValue(headers, "content-length"));
          if (!Number.isFinite(length) || nextByte !== 0) throw new Error("Audio ranges unsupported");
          totalBytes = length;
        } else {
          throw new Error("Missing Content-Range");
        }

        const bytes = toBytes(result.data);
        if (!bytes.byteLength || bytes.byteLength > AUDIO_RANGE_BYTES) throw new Error("Invalid audio range size");
        nextByte += bytes.byteLength;
        controller.enqueue(bytes);
        if (nextByte >= totalBytes) {
          cleanup();
          controller.close();
        }
      } catch (error) {
        cleanup();
        controller.error(error);
      }
    },
    cancel() {
      controller.abort();
      cleanup();
    },
  });

  // Metadata is available before the Response is exposed; do not invent MPEG
  // headers for WAV recordings or hide a real HTTP error behind status 200.
  return new Response(stream, {
    status: 200,
    headers: { "content-type": contentType },
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

  const result = await nativeRequest({ url, responseType: "arraybuffer" }, signal);
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
