import type { LearningAsset, LearningNode, LearningPack, LearningResource } from "./types";
import { learningEditionId } from "./types";
import type { LearningEditionId } from "./types";
import { allLearningEditions, isLearningResourceAvailable } from "./catalogue";

declare const __LEARNING_ASSET_BASE__: string;
export const LEARNING_CACHE = "azkar-learning-v1";
class LearningIntegrityError extends Error {}
let pageClosing = false;
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    pageClosing = true;
  });
  window.addEventListener("pageshow", () => {
    pageClosing = false;
  });
}
const tags = new Set([
  "bdi",
  "diagram",
  "header",
  "section",
  "footer",
  "illustration",
  "div",
  "p",
  "span",
  "strong",
  "em",
  "b",
  "i",
  "br",
  "ul",
  "ol",
  "li",
  "aside",
  "blockquote",
  "figure",
  "figcaption",
  "h2",
  "h3",
  "h4",
  "a",
  "img",
]);
const classes = new Set([
  "visual",
  "quran",
  "meaning",
  "photo",
  "cover",
  "panel",
  "quote",
  "note",
  "meta",
  "text",
  "metadata",
  "number",
  "mistake",
  "correct",
  "steps",
  "title",
]);
let generation = 0;

export function learningAssetUrl(asset: LearningAsset): string {
  const base = typeof __LEARNING_ASSET_BASE__ === "string" ? __LEARNING_ASSET_BASE__ : "/__learning-assets__/";
  return new URL(base + asset.path, window.location.origin).href;
}

async function verified(response: Response, asset: LearningAsset) {
  if (!response.ok) throw new LearningIntegrityError("Learning asset unavailable");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength !== asset.bytes) throw new LearningIntegrityError("Learning asset size mismatch");
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  if (hash !== asset.sha256) throw new LearningIntegrityError("Learning asset checksum mismatch");
  return bytes;
}

async function openCache() {
  try {
    return await caches.open(LEARNING_CACHE);
  } catch {
    return undefined;
  }
}

export async function fetchLearningAsset(
  asset: LearningAsset,
  signal?: AbortSignal,
  save = true,
  resourceId?: LearningEditionId,
): Promise<ArrayBuffer> {
  signal?.throwIfAborted();
  const epoch = generation;
  const url = learningAssetUrl(asset);
  const cache = save ? await openCache() : undefined;
  const cached = await cache?.match(url).catch(() => undefined);
  if (cached) {
    try {
      return await verified(cached, asset);
    } catch (error) {
      if (!pageClosing && error instanceof LearningIntegrityError) await cache?.delete(url).catch(() => false);
    }
  }
  const bytes = await verified(await fetch(url, { signal, credentials: "omit", cache: "no-store" }), asset);
  signal?.throwIfAborted();
  if (cache && !pageClosing && epoch === generation) {
    try {
      await cache.put(
        url,
        new Response(bytes, {
          headers: { "Content-Type": asset.mime, ...(resourceId ? { "X-Learning-Resource": resourceId } : {}) },
        }),
      );
      if (epoch !== generation) await cache.delete(url);
    } catch {
      /* Reading still works when offline storage is denied/full. */
    }
  }
  return bytes;
}

function validateNode(value: unknown, images: Set<string>, depth = 0): value is LearningNode {
  if (typeof value === "string") return value.length < 100_000;
  if (!value || typeof value !== "object" || depth > 25) return false;
  const node = value as Exclude<LearningNode, string>;
  return (
    tags.has(node.tag) &&
    (node.tag !== "illustration" || (Number.isInteger(node.artwork) && node.artwork! >= 1 && node.artwork! <= 6)) &&
    (!node.className || classes.has(node.className)) &&
    (!node.target || /^p-[1-9]\d{0,3}$/.test(node.target)) &&
    (!node.asset || images.has(node.asset)) &&
    (node.alt === undefined || typeof node.alt === "string") &&
    (node.lang === undefined || node.lang === "ar" || node.lang === "en") &&
    (node.dir === undefined || node.dir === "rtl" || node.dir === "ltr") &&
    (node.href === undefined || (typeof node.href === "string" && /^https:\/\/[^\s]+$/u.test(node.href))) &&
    (node.tag !== "diagram" ||
      ((node.diagram === "tawaf" || node.diagram === "sai") &&
        typeof node.label === "string" &&
        typeof node.alt === "string")) &&
    Array.isArray(node.children) &&
    node.children.every((child) => validateNode(child, images, depth + 1))
  );
}

export function validateLearningPack(value: unknown, resource: LearningResource): LearningPack {
  const pack = value as LearningPack | null;
  const images = new Set(resource.images.map((image) => image.path));
  if (
    !pack ||
    pack.schema !== 1 ||
    pack.language !== resource.language ||
    pack.resourceId !== resource.id ||
    !Array.isArray(pack.units) ||
    pack.units.length < 1 ||
    pack.units.length > 1000 ||
    !pack.units.every(
      (unit) =>
        /^p-[1-9]\d{0,3}$/.test(unit.id) &&
        typeof unit.title === "string" &&
        typeof unit.text === "string" &&
        Number.isInteger(unit.sourcePage) &&
        unit.sourcePage > 0 &&
        Number(unit.id.slice(2)) === unit.sourcePage &&
        Array.isArray(unit.nodes) &&
        unit.nodes.every((node) => validateNode(node, images)),
    ) ||
    new Set(pack.units.map((unit) => unit.id)).size !== pack.units.length ||
    !Array.isArray(pack.contents) ||
    !pack.contents.every(
      (entry) => typeof entry.title === "string" && pack.units.some((unit) => unit.id === entry.unitId),
    )
  ) {
    throw new Error("Invalid learning publication");
  }
  return pack;
}

async function previousSavedPack(resource: LearningResource) {
  const cache = await openCache();
  for (const asset of resource.previousPacks ?? []) {
    const url = learningAssetUrl(asset);
    const response = await cache?.match(url).catch(() => undefined);
    if (!response) continue;
    try {
      return { asset, bytes: await verified(response, asset) };
    } catch (error) {
      if (!pageClosing && error instanceof LearningIntegrityError) await cache?.delete(url).catch(() => false);
    }
  }
  return null;
}

export async function loadLearningPack(resource: LearningResource, signal?: AbortSignal) {
  if (!isLearningResourceAvailable(resource)) throw new Error("Learning edition unavailable");
  let bytes: ArrayBuffer,
    previousEdition = false;
  try {
    bytes = await fetchLearningAsset(resource.pack, signal, true, learningEditionId(resource));
  } catch (error) {
    signal?.throwIfAborted();
    const saved = await previousSavedPack(resource);
    if (!saved) throw error;
    bytes = saved.bytes;
    previousEdition = true;
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  const text = await new Response(stream).text();
  signal?.throwIfAborted();
  const pack = validateLearningPack(JSON.parse(text), resource);
  return previousEdition ? { ...pack, previousEdition: true as const } : pack;
}

export interface LearningOfflineStatus {
  complete: boolean;
  available: boolean;
  savedFiles: number;
  totalFiles: number;
  textSaved?: boolean;
  previousEdition?: true;
}
export async function learningOfflineStatus(resource: LearningResource): Promise<LearningOfflineStatus> {
  const cache = await openCache();
  const assets = [resource.pack, ...resource.images];
  let savedFiles = 0;
  let textSaved = false;
  for (const asset of assets) {
    const url = learningAssetUrl(asset);
    const response = await cache?.match(url).catch(() => undefined);
    if (!response) continue;
    try {
      await verified(response, asset);
      savedFiles++;
      if (asset.path === resource.pack.path) textSaved = true;
    } catch (error) {
      if (!pageClosing && error instanceof LearningIntegrityError) await cache?.delete(url).catch(() => false);
    }
  }
  const previousEdition = !textSaved && Boolean(await previousSavedPack(resource));
  return {
    complete: savedFiles === assets.length,
    available: Boolean(cache),
    savedFiles,
    totalFiles: assets.length,
    textSaved,
    ...(previousEdition ? { previousEdition: true as const } : {}),
  };
}

export async function removeLearningDownload(resource: LearningResource) {
  generation++;
  const cache = await openCache();
  if (!cache) throw new Error("Learning storage unavailable");
  const current = new Set([resource.pack, ...(resource.previousPacks ?? []), ...resource.images].map(learningAssetUrl));
  const identity = learningEditionId(resource);
  const shared = new Set<string>();
  for (const other of allLearningEditions("ar")) {
    if (learningEditionId(other) === identity || !(await cache.match(learningAssetUrl(other.pack)))) continue;
    for (const asset of other.images) shared.add(learningAssetUrl(asset));
  }
  const requests = await cache.keys();
  await Promise.all(
    requests.map(async (request) => {
      const response = await cache.match(request);
      if (
        !shared.has(request.url) &&
        (current.has(request.url) || response?.headers.get("X-Learning-Resource") === identity)
      )
        await cache.delete(request);
    }),
  );
}

export async function clearLearningCache() {
  generation++;
  try {
    await caches.delete(LEARNING_CACHE);
  } catch {
    /* Other erasure paths remain independent. */
  }
}
