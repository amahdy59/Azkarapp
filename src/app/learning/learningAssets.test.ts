import { createHash, webcrypto } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { learningCatalogue, learningEditions } from "./catalogue";
import {
  fetchLearningAsset,
  learningAssetUrl,
  learningOfflineStatus,
  removeLearningDownload,
  validateLearningPack,
  loadLearningPack,
} from "./learningAssets";
import { cancelLearningDownload, getLearningDownload, startLearningDownload } from "./learningDownloads";
import type { LearningAsset, LearningResource } from "./types";

const bytes = new TextEncoder().encode("Original Arabic content · نَصٌّ");
const digest = createHash("sha256").update(bytes).digest("hex");
const asset: LearningAsset = { path: `${digest}.bin`, sha256: digest, bytes: bytes.length, mime: "application/gzip" };
const resource: LearningResource = { ...learningCatalogue("en")[0]!, pack: asset, images: [] };
let stored: Map<string, Response>;
let network: ReturnType<typeof vi.fn>;
let cache: {
  match: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  keys: ReturnType<typeof vi.fn>;
};

beforeEach(() => {
  vi.stubEnv("DEV", true);
  window.dispatchEvent(new Event("pageshow"));
  stored = new Map();
  cache = {
    match: vi.fn(async (url: string | Request) => stored.get(typeof url === "string" ? url : url.url)?.clone()),
    put: vi.fn(async (url: string, response: Response) => {
      stored.set(url, response.clone());
    }),
    delete: vi.fn(async (url: string | Request) => stored.delete(typeof url === "string" ? url : url.url)),
    keys: vi.fn(async () => [...stored.keys()].map((url) => new Request(url))),
  };
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("caches", { open: async () => cache });
  network = vi.fn(async () => new Response(bytes));
  vi.stubGlobal("fetch", network);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("verified learning downloads", () => {
  it("rejects a withheld production edition before loading or saving any asset", async () => {
    vi.stubEnv("DEV", false);
    vi.stubGlobal("__LEARNING_REVIEW__", false);
    const unavailable = learningEditions("en").find((edition) => edition.language === "en") ?? {
      ...resource,
      id: "dalil-al-mutamir" as const,
      language: "en" as const,
    };
    await expect(loadLearningPack(unavailable)).rejects.toThrow("unavailable");
    await startLearningDownload(unavailable);
    expect(getLearningDownload()?.phase).toBe("failed");
    expect(network).not.toHaveBeenCalled();
    expect(stored.size).toBe(0);
  });
  it("defers cache eviction while the document closes, then rejects and removes corrupt bytes on the next active check", async () => {
    stored.set(learningAssetUrl(asset), new Response(new Uint8Array(bytes.length)));
    window.dispatchEvent(new Event("pagehide"));
    expect((await learningOfflineStatus(resource)).complete).toBe(false);
    expect(stored.size).toBe(1);
    window.dispatchEvent(new Event("pageshow"));
    expect((await learningOfflineStatus(resource)).complete).toBe(false);
    expect(stored.size).toBe(0);
  });
  it("does not erase saved bytes after an interrupted cache-body read", async () => {
    stored.set(learningAssetUrl(asset), new Response(bytes));
    cache.match.mockImplementationOnce(
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.error(new DOMException("Page unloaded", "AbortError"));
            },
          }),
        ),
    );
    expect((await learningOfflineStatus(resource)).complete).toBe(false);
    expect(cache.delete).not.toHaveBeenCalled();
    expect((await learningOfflineStatus(resource)).complete).toBe(true);
  });
  it("preserves shared illustrations and the other saved language when removing one edition", async () => {
    const english = learningEditions("en").find((item) => item.language === "en")!;
    const arabic = learningCatalogue("en").find((item) => item.id === english.id)!;
    const sharedImage = english.images.find((image) => arabic.images.some((other) => other.path === image.path))!;
    expect(sharedImage).toBeDefined();
    stored.set(learningAssetUrl(arabic.pack), new Response("arabic"));
    stored.set(
      learningAssetUrl(english.pack),
      new Response("english", { headers: { "X-Learning-Resource": "dalil-al-mutamir:en" } }),
    );
    stored.set(
      learningAssetUrl(sharedImage),
      new Response("image", { headers: { "X-Learning-Resource": "dalil-al-mutamir:en" } }),
    );
    await removeLearningDownload(english);
    expect(stored.has(learningAssetUrl(arabic.pack))).toBe(true);
    expect(stored.has(learningAssetUrl(sharedImage))).toBe(true);
    expect(stored.has(learningAssetUrl(english.pack))).toBe(false);
  });

  it("retains photos needed by a previously saved hidden edition when removing the public edition", async () => {
    const all = learningEditions("en");
    const english = all.find((item) => item.language === "en")!;
    const arabic = all.find((item) => item.id === english.id && item.language === "ar")!;
    const image = english.images[0]!;
    stored.set(learningAssetUrl(english.pack), new Response("saved review pack"));
    stored.set(learningAssetUrl(arabic.pack), new Response("saved public pack"));
    stored.set(
      learningAssetUrl(image),
      new Response("shared image", { headers: { "X-Learning-Resource": arabic.id } }),
    );
    vi.stubEnv("DEV", false);
    vi.stubGlobal("__LEARNING_REVIEW__", false);
    await removeLearningDownload(arabic);
    expect(stored.has(learningAssetUrl(english.pack))).toBe(true);
    expect(stored.has(learningAssetUrl(image))).toBe(true);
    expect(stored.has(learningAssetUrl(arabic.pack))).toBe(false);
  });
  it("rejects modified network bytes and reuses only verified cached bytes", async () => {
    network.mockResolvedValueOnce(new Response("Wrong bytes"));
    await expect(fetchLearningAsset(asset)).rejects.toThrow("size mismatch");
    expect(stored.size).toBe(0);
    await fetchLearningAsset(asset);
    network.mockRejectedValue(new Error("Offline"));
    expect(Array.from(new Uint8Array(await fetchLearningAsset(asset)))).toEqual(Array.from(bytes));
    expect(network).toHaveBeenCalledTimes(2);
    expect((await learningOfflineStatus(resource)).complete).toBe(true);
  });

  it("detects corruption and eviction instead of retaining a stale ready flag", async () => {
    await fetchLearningAsset(asset);
    stored.set(learningAssetUrl(asset), new Response(new Uint8Array(bytes.length)));
    expect((await learningOfflineStatus(resource)).complete).toBe(false);
    expect(stored.size).toBe(0);
    await fetchLearningAsset(asset);
    stored.clear();
    expect((await learningOfflineStatus(resource)).savedFiles).toBe(0);
  });

  it("keeps online reading usable when cache access or writes fail", async () => {
    cache.put.mockRejectedValue(new Error("Quota"));
    expect((await fetchLearningAsset(asset)).byteLength).toBe(bytes.length);
    vi.stubGlobal("caches", {
      open: async () => {
        throw new Error("Denied");
      },
    });
    expect((await fetchLearningAsset(asset)).byteLength).toBe(bytes.length);
    expect((await learningOfflineStatus(resource)).available).toBe(false);
  });

  it("does not resurrect removed downloads from an in-flight request", async () => {
    let finish!: (response: Response) => void;
    network.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    const request = fetchLearningAsset(asset);
    await waitFor(() => expect(network).toHaveBeenCalled());
    await removeLearningDownload(resource);
    finish(new Response(bytes));
    await request;
    expect(stored.size).toBe(0);
  });

  it("removes previous versions of one book while retaining other books", async () => {
    const oldUrl = "http://localhost/old-book-version.bin";
    const otherUrl = "http://localhost/other-book.bin";
    stored.set(oldUrl, new Response(bytes, { headers: { "X-Learning-Resource": resource.id } }));
    stored.set(otherUrl, new Response(bytes, { headers: { "X-Learning-Resource": "dalil-al-mutamir" } }));
    await fetchLearningAsset(asset, undefined, true, resource.id);
    await removeLearningDownload(resource);
    expect([...stored.keys()]).toEqual([otherUrl]);
  });

  it("cancels, retains verified files, and retries the remaining files", async () => {
    const image = { ...asset, path: `${digest}.jpeg`, mime: "image/jpeg" };
    const illustrated = { ...resource, images: [image] };
    network.mockResolvedValueOnce(new Response(bytes)).mockImplementationOnce(
      (_url: string, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener("abort", () => reject(new DOMException("Cancelled", "AbortError")));
        }),
    );
    const request = startLearningDownload(illustrated);
    await waitFor(() => expect(network).toHaveBeenCalledTimes(2));
    cancelLearningDownload();
    await request;
    expect(getLearningDownload()?.phase).toBe("cancelled");
    expect((await learningOfflineStatus(illustrated)).savedFiles).toBe(1);
    network.mockResolvedValue(new Response(bytes));
    await startLearningDownload(illustrated);
    expect(getLearningDownload()?.phase).toBe("ready");
    expect(network).toHaveBeenCalledTimes(3);
  });

  it("accepts native semantic data and rejects executable or mismatched publications", () => {
    const pack = {
      schema: 1,
      resourceId: resource.id,
      language: "ar",
      units: [{ id: "p-1", title: "Title", sourcePage: 1, text: "نص", nodes: [{ tag: "p", children: ["نص"] }] }],
      contents: [{ unitId: "p-1", title: "Title" }],
    };
    expect(validateLearningPack(pack, resource)).toBe(pack);
    expect(() => validateLearningPack({ ...pack, language: "en" }, resource)).toThrow();
    expect(() =>
      validateLearningPack(
        { ...pack, units: [{ ...pack.units[0], nodes: [{ tag: "a", href: "javascript:bad", children: ["bad"] }] }] },
        resource,
      ),
    ).toThrow();
    expect(() => validateLearningPack({ ...pack, resourceId: "other" }, resource)).toThrow();
    expect(() =>
      validateLearningPack(
        { ...pack, units: [{ ...pack.units[0], nodes: [{ tag: "script", children: ["bad"] }] }] },
        resource,
      ),
    ).toThrow();
    expect(() =>
      validateLearningPack({ ...pack, contents: [{ unitId: "p-99", title: "Broken" }] }, resource),
    ).toThrow();
  });

  it("keeps previously published progress snapshots immutable", async () => {
    const request = startLearningDownload(resource);
    const initial = getLearningDownload();
    expect(initial?.completed).toBe(0);
    await request;
    expect(initial?.completed).toBe(0);
    expect(getLearningDownload()).toMatchObject({ phase: "ready", completed: 1, total: 1 });
  });
});
