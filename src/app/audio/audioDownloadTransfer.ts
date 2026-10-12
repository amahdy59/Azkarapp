import type { AudioVariant } from "./audioTypes";

export type AudioDownloadPhase = "receiving" | "retrying" | "verifying" | "saved";
export type AudioDownloadFailure = "network" | "server" | "integrity" | "unsupported";

export class AudioDownloadError extends Error {
  constructor(
    public readonly code: AudioDownloadFailure,
    public readonly recordingId: string,
    public readonly status?: number,
    public readonly retryAfterMs = 0,
  ) {
    super(`Audio download ${code}: ${recordingId}`);
    this.name = "AudioDownloadError";
  }
}

/** Cancel both a stalled request and its body; large files have no total-time ceiling. */
async function receiveAudio(
  url: string,
  variant: AudioVariant,
  signal: AbortSignal | undefined,
  onBytes: (bytes: number) => void,
) {
  const controller = new AbortController();
  const cancel = () => controller.abort(signal?.reason);
  signal?.throwIfAborted();
  signal?.addEventListener("abort", cancel, { once: true });
  let timer: ReturnType<typeof setTimeout>;
  const keepAlive = () => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(), 30_000);
  };
  keepAlive();
  try {
    const response = await fetch(url, { cache: "no-store", credentials: "omit", signal: controller.signal });
    if (response.status !== 200 || !response.ok) {
      const retryAfter = response.headers.get("retry-after");
      const seconds = retryAfter === null ? NaN : Number(retryAfter);
      const retryAfterMs = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(retryAfter ?? "") - Date.now();
      await response.body?.cancel();
      throw new AudioDownloadError(
        "server",
        variant.id,
        response.status,
        Math.min(30_000, Math.max(0, retryAfterMs || 0)),
      );
    }
    if (response.headers.get("content-type")?.split(";")[0]?.trim() !== variant.mimeType) {
      await response.body?.cancel();
      throw new AudioDownloadError("integrity", variant.id);
    }
    keepAlive();
    if (!response.body) {
      const buffer = await response.arrayBuffer();
      onBytes(buffer.byteLength);
      return { buffer, headers: response.headers };
    }
    // One exact-size buffer, rather than retaining chunks and allocating a second full copy.
    const bytes = new Uint8Array(variant.byteSize);
    const reader = response.body.getReader();
    let received = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        keepAlive();
        if (received + value.byteLength > bytes.byteLength) throw new AudioDownloadError("integrity", variant.id);
        bytes.set(value, received);
        received += value.byteLength;
        onBytes(received);
      }
      if (received !== bytes.byteLength) throw new AudioDownloadError("integrity", variant.id);
      return { buffer: bytes.buffer, headers: response.headers };
    } finally {
      await reader.cancel().catch(() => undefined);
      reader.releaseLock();
    }
  } finally {
    clearTimeout(timer!);
    signal?.removeEventListener("abort", cancel);
  }
}

function waitToRetry(delay: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    signal?.throwIfAborted();
    const cancel = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      reject(signal?.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, delay);
    signal?.addEventListener("abort", cancel, { once: true });
  });
}

export async function transferAudio(
  url: string,
  variant: AudioVariant,
  options: { signal?: AbortSignal; onTransfer: (phase: AudioDownloadPhase, bytes: number, attempt: number) => void },
) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    options.signal?.throwIfAborted();
    options.onTransfer("receiving", 0, attempt);
    try {
      return await receiveAudio(url, variant, options.signal, (bytes) =>
        options.onTransfer("receiving", bytes, attempt),
      );
    } catch (error) {
      options.signal?.throwIfAborted();
      const failure = error instanceof AudioDownloadError ? error : new AudioDownloadError("network", variant.id);
      const retryable =
        failure.code === "network" ||
        (failure.code === "server" && (failure.status === 429 || (failure.status ?? 0) >= 500));
      if (!retryable || attempt === 3) throw failure;
      options.onTransfer("retrying", 0, attempt + 1);
      await waitToRetry(Math.max(1000 * 2 ** (attempt - 1), failure.retryAfterMs), options.signal);
    }
  }
  throw new AudioDownloadError("network", variant.id);
}
