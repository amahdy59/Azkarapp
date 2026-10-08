import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { Blob } from "node:buffer";
import { DecompressionStream } from "node:stream/web";
import { OWNER_TIMING_PACK_SHA, expandOwnerTiming } from "./ownerTimingPreviews";
import { validateListeningTiming, type ListeningTimingAnnotation } from "./listeningTimings";
import type { ResolvedAudioSegment } from "./audioTypes";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("rejects offline, corrupt and cancelled owner preview packs", async () => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("corrupt")));
  const { loadOwnerTimingPack } = await import("./ownerTimingLoader");
  expect(await loadOwnerTimingPack(new AbortController().signal)).toBeNull();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  expect(await loadOwnerTimingPack(new AbortController().signal)).toBeNull();
  const controller = new AbortController();
  controller.abort();
  expect(await loadOwnerTimingPack(controller.signal)).toBeNull();
});
it("verifies and expands the real compressed library while preserving explicit gaps and acceptance", async () => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("DecompressionStream", DecompressionStream);
  const bytes = readFileSync(`public/data/listening-timings/owner-${OWNER_TIMING_PACK_SHA}.bin`);
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(bytes)));
  vi.stubGlobal("fetch", fetcher);
  const { loadOwnerTimingPack } = await import("./ownerTimingLoader");
  const pack = await loadOwnerTimingPack(new AbortController().signal);
  expect(pack?.records).toHaveLength(290);
  expect(pack?.approval.reviewStatus).toBe("owner-preview");
  expect(pack?.approval.reviewedBy).toBe("");
  expect(await loadOwnerTimingPack(new AbortController().signal)).toBe(pack);
  expect(fetcher).toHaveBeenCalledTimes(1);
  const record = pack!.records.find((value) => value.l === "en" && value.u?.length)!;
  const annotation = expandOwnerTiming(
    pack!,
    record,
    "exact wording supplied by the digest-matched player",
  ) as ListeningTimingAnnotation;
  expect(annotation.unresolvedWords?.length).toBeGreaterThan(0);
  expect(
    validateListeningTiming(
      annotation,
      {
        variantId: record.v[0],
        sha256: "0".repeat(64),
        durationMs: record.d,
        voiceId: "english-george",
      } as ResolvedAudioSegment,
      annotation.transcript,
      "en",
    ),
  ).toContain("Recording, language or exact transcript differs.");
});
