import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { webcrypto } from "node:crypto";
import { Blob } from "node:buffer";
import { DecompressionStream } from "node:stream/web";
import { OWNER_TIMING_PACK_SHA, expandOwnerTiming } from "./ownerTimingPreviews";
import partitions from "./ownerTimingPartitions.json";
import { getQuranPlaybackCue, validateQuranTiming, type QuranTimingAnnotation } from "./quranTimings";
import { validateListeningTiming, type ListeningTimingAnnotation } from "./listeningTimings";
import type { ResolvedAudioSegment } from "./audioTypes";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});
it("expands only registered same-byte Quran aliases and preserves unhighlighted gaps", () => {
  const record = {
    v: ["first", "alias"],
    s: "a".repeat(64),
    d: 1000,
    l: "ar" as const,
    q: [
      [
        "1:1",
        100,
        800,
        [
          [1, 0, 100],
          [3, 300, 100],
        ],
      ],
    ] as [string, number, number, [number, number, number][]][],
  };
  const pack = {
    version: 2 as const,
    approval: {
      reviewStatus: "owner-preview" as const,
      source: "test",
      authoredBy: "Author",
      reviewedBy: "",
      reviewedAt: "",
      acceptedBy: "Owner",
      acceptedAt: "2026-11-27",
    },
    records: [record],
  };
  const annotation = expandOwnerTiming(pack, record, "", "alias") as QuranTimingAnnotation;
  const segment = {
    variantId: "alias",
    sha256: record.s,
    durationMs: 1000,
    quranReference: { surah: 1, ayahStart: 1, ayahEnd: 1 },
  } as ResolvedAudioSegment;
  expect(validateQuranTiming(annotation, segment)).toEqual([]);
  expect(getQuranPlaybackCue(annotation, 0.15).word?.position).toBe(1);
  expect(getQuranPlaybackCue(annotation, 0.3).word).toBeNull();
  expect(getQuranPlaybackCue(annotation, 0.55).word?.position).toBe(3);
  expect(
    validateQuranTiming(expandOwnerTiming(pack, record, "", "other-reciter") as QuranTimingAnnotation, segment),
  ).not.toEqual([]);
  expect(validateQuranTiming(annotation, { ...segment, sha256: "b".repeat(64) })).not.toEqual([]);
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
it("loads only the current recording's optional partition with its distinct acceptance", async () => {
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("DecompressionStream", DecompressionStream);
  const partition = partitions[0]!;
  const bytes = readFileSync(`docs/audio/timing-assets/${partition.sha256}.bin`);
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(new Response(bytes)));
  vi.stubGlobal("fetch", fetcher);
  const { loadOwnerTimingForRecording } = await import("./ownerTimingLoader");
  const pack = await loadOwnerTimingForRecording(partition.recordings[0]!, new AbortController().signal);
  expect(pack?.records).toHaveLength(92);
  expect(pack?.approval.acceptedAt).toBe("2026-11-27");
  expect(pack?.approval.reviewedBy).toBe("");
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0]![0]).toContain(partition.sha256);
  expect(fetcher.mock.calls[0]![0]).not.toContain(OWNER_TIMING_PACK_SHA);
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
  expect(pack?.records).toHaveLength(276);
  expect(pack?.records.some((record) => record.v.includes("comprehensive-dua-42-abdullah-muhammad-v1"))).toBe(false);
  expect(pack?.records.some((record) => record.v.includes("comprehensive-dua-42-english-george-v1"))).toBe(true);
  expect(pack?.records.some((record) => record.v.includes("comprehensive-dua-39-abdullah-muhammad-v1"))).toBe(false);
  expect(pack?.records.some((record) => record.v.includes("friday-dua-25-abdullah-muhammad-v1"))).toBe(true);
  expect(pack?.records.some((record) => record.v.includes("wu-hm-4-abdullah-muhammad-v1"))).toBe(false);
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
