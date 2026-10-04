/* global fetch, AbortController, clearTimeout */

/** Bound network work while retaining every recording's validation and retry policy. */
export async function probeAudioVariants(
  variants,
  baseUrl,
  {
    concurrency = 4,
    fetchImpl = fetch,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    timeoutMs = 20_000,
  } = {},
) {
  if (!Number.isInteger(concurrency) || concurrency < 1) throw new Error("Concurrency must be a positive integer.");
  const issues = new Array(variants.length);
  const probes = new Map();
  let next = 0;
  async function fetchMetadata(url) {
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        response = await fetchImpl(url, {
          headers: { Range: "bytes=0-0" },
          signal: controller.signal,
        });
        break;
      } catch (error) {
        if (attempt === 3) throw error;
        // Release the request timer before the retry backoff.
        clearTimeout(timer);
        await sleep(1000 * 2 ** (attempt - 1));
      } finally {
        clearTimeout(timer);
      }
    }
    try {
      return { status: response.status, mimeType: response.headers.get("content-type")?.split(";")[0] };
    } finally {
      // A server ignoring Range must not leave a full recording downloading.
      await response.body?.cancel();
    }
  }
  async function probe(variant) {
    const url = `${baseUrl}/${variant.relativePath.replace(/^\/+/, "")}`;
    // Reused recordings need one request per run, but every variant still
    // compares the response against its own manifest metadata.
    if (!probes.has(url)) probes.set(url, fetchMetadata(url));
    const { status, mimeType } = await probes.get(url);
    if (![200, 206].includes(status)) throw new Error(`HTTP ${status}`);
    if (mimeType !== variant.mimeType) throw new Error(`MIME ${mimeType ?? "missing"}`);
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, variants.length) }, async () => {
      while (next < variants.length) {
        const index = next++;
        const variant = variants[index];
        try {
          await probe(variant);
        } catch (error) {
          issues[index] = {
            code: "unavailable-url",
            message: `${variant.id}: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      }
    }),
  );
  return issues.filter(Boolean);
}
