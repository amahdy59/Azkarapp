/** Local authoring/review only. Does not change the playback catalogue or defaults. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const { fetch, AbortSignal, URL } = globalThis;
const directory = "output/quran-reciter-review";
const manifestPath = "docs/audio/quran-reciter-pilot/manifest.json";
const selected = [
  { reciterId: 112, readingId: 112, nameArabic: "محمد صديق المنشاوي", nameEnglish: "Muhammad Siddiq Al-Minshawi" },
  { reciterId: 118, readingId: 118, nameArabic: "محمود خليل الحصري", nameEnglish: "Mahmoud Khalil Al-Hussary" },
  { reciterId: 92, readingId: 92, nameArabic: "ياسر الدوسري", nameEnglish: "Yasser Al-Dosari" },
];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );
async function fetchBytes(url, maxBytes) {
  const response = await fetch(url, { signal: AbortSignal.timeout(45_000) });
  if (!response.ok) throw new Error(`Source HTTP ${response.status}: ${url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > maxBytes) throw new Error("Source exceeds review size bound");
  return bytes;
}
async function writeImmutable(path, bytes) {
  try {
    const previous = await readFile(path);
    if (hash(previous) !== hash(bytes)) throw new Error(`Refusing to replace changed review evidence: ${path}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeFile(path, bytes);
  }
}

await mkdir(`${directory}/media`, { recursive: true });
await mkdir("docs/audio/quran-reciter-pilot", { recursive: true });
const inventoryUrl = "https://www.mp3quran.net/api/v3/reciters?language=eng";
const timingReadsUrl = "https://www.mp3quran.net/api/v3/ayat_timing/reads";
const permissionUrl = "https://www.mp3quran.net/eng/privacy";
const inventory = JSON.parse(await fetchBytes(inventoryUrl, 1_000_000));
const timingReads = JSON.parse(await fetchBytes(timingReadsUrl, 1_000_000));
const livePermissionBytes = await fetchBytes(permissionUrl, 1_000_000);
let permissionBytes;
try {
  permissionBytes = await readFile("docs/audio/quran-reciter-pilot/provider-permission.html");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  permissionBytes = livePermissionBytes;
}
const livePermissionText = livePermissionBytes
  .toString("utf8")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
if (!livePermissionText.includes("we allow any visitor or developer to copy any material or use any link"))
  throw new Error("Live provider copying permission could not be verified");
const permissionText = permissionBytes
  .toString("utf8")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ");
if (!permissionText.includes("we allow any visitor or developer to copy any material or use any link"))
  throw new Error("Provider copying permission could not be verified");
await writeImmutable(`${directory}/provider-permission.html`, permissionBytes);
const recordings = [];
for (const selection of selected) {
  const reciter = inventory.reciters.find((entry) => entry.id === selection.reciterId);
  const reading = reciter?.moshaf.find((entry) => entry.id === selection.readingId);
  const timingRead = timingReads.find((entry) => entry.id === selection.readingId);
  if (
    !reading ||
    !reading.name.includes("Hafs") ||
    !reading.name.includes("Murattal") ||
    timingRead?.folder_url !== reading.server
  )
    throw new Error("Recording/reading/timing-source identity mismatch");
  const sourceUrl = new URL("067.mp3", reading.server).href;
  const file = `reading-${selection.readingId}-067.mp3`;
  let bytes;
  try {
    bytes = await readFile(`${directory}/media/${file}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    bytes = await fetchBytes(sourceUrl, 25_000_000);
  }
  if (bytes.length < 1000 || !(bytes.subarray(0, 3).toString() === "ID3" || bytes[0] === 0xff))
    throw new Error("Source is not MP3");
  await writeImmutable(`${directory}/media/${file}`, bytes);
  const timingUrl = `https://www.mp3quran.net/api/v3/ayat_timing?surah=67&read=${selection.readingId}`;
  const timingBytes = await fetchBytes(timingUrl, 1_000_000);
  const timing = JSON.parse(timingBytes);
  if (
    !Array.isArray(timing) ||
    !Array.from({ length: 30 }, (_, index) => index + 1).every((ayah) => timing.some((entry) => entry.ayah === ayah))
  )
    throw new Error("Provider timing inventory lacks the complete selected surah");
  await writeImmutable(`${directory}/reading-${selection.readingId}-067-timing.json`, timingBytes);
  recordings.push({
    ...selection,
    sourceUrl,
    sourceReading: reading.name,
    file,
    sha256: hash(bytes),
    byteSize: bytes.length,
    timingUrl,
    timingSha256: hash(timingBytes),
    reviewStatus: "pending",
    appAssetId: "s-hm-110b",
    requiredRange: { surah: 67, ayahStart: 1, ayahEnd: 30 },
  });
  console.log(
    `${selection.nameEnglish}: retained ${bytes.length} original bytes and recording-specific provider timing. Listening acceptance is stored separately.`,
  );
}
const manifest = {
  preparedOn: "2026-11-26",
  inventoryUrl,
  timingReadsUrl,
  permissionUrl,
  permissionSha256: hash(permissionBytes),
  permissionScope:
    "Provider explicitly permits visitors/developers to copy material and use site links; no third-party scholarly attestation is inferred.",
  recordings,
};
await writeImmutable(manifestPath, Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`));
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const current = AUDIO_CATALOG.assets["s-hm-110b"];
const original = current.segments[0].variants.find((variant) => variant.voiceId === current.defaultVoiceId);
const currentUrl = `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/${original.relativePath}?sha256=${original.sha256}`;
const cards = recordings
  .map(
    (recording) =>
      `<article><h2>${escape(recording.nameArabic)}</h2><p lang="en" dir="ltr">${escape(recording.nameEnglish)}</p><audio controls preload="metadata" aria-label="${escape(recording.nameArabic)} — سورة الملك"><source src="media/${recording.file}" type="audio/mpeg"></audio><p><a href="${escape(recording.sourceUrl)}">تسجيل المصدر / Original recording</a></p></article>`,
  )
  .join("\n");
let accepted = false;
try {
  const approval = JSON.parse(await readFile("docs/audio/quran-reciter-pilot/activation.json", "utf8"));
  accepted = recordings.every((recording) => approval.recordings.some((entry) => entry.sha256 === recording.sha256));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const html = `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>مراجعة قرّاء القرآن — wa-zaker</title><style>body{margin:0;background:#111b34;color:#f5f1e5;font:18px/1.8 system-ui,sans-serif}main{max-width:800px;margin:auto;padding:24px}h1{font-size:1.6rem}article,details{background:#1a2743;border:1px solid #65718b;border-radius:18px;padding:20px;margin:18px 0}h2{margin:0;font-size:1.3rem}audio{width:100%;display:block;margin:16px 0}a,summary{color:#edd18a;min-height:44px;display:inline-flex;align-items:center}a:focus-visible,summary:focus-visible{outline:3px solid #edd18a;outline-offset:4px}p{overflow-wrap:anywhere}.transcript{white-space:pre-wrap;font-size:1.3rem}small{display:block}</style><main><h1>مراجعة قرّاء القرآن</h1><p>سورة الملك كاملة، الآيات ١–٣٠. ${accepted ? "اعتمد المالك هذه التسجيلات كخيارات إضافية لسورة الملك." : "استمع إلى كل تسجيل قبل اعتماده كخيار إضافي."} هذه الصفحة لا تغيّر القارئ الافتراضي.</p><p lang="en" dir="ltr">Local comparison: complete Al-Mulk (67:1–30), Hafs/Murattal. ${accepted ? "The owner accepted these Al-Mulk recordings as optional app voices." : "These candidates await listening acceptance."} Existing app defaults are unchanged.</p><article><h2>التسجيل الحالي — عبد الله محمد</h2><audio controls preload="none" aria-label="التسجيل الحالي — عبد الله محمد"><source src="${escape(currentUrl)}" type="${original.mimeType}"></audio></article>${cards}<details><summary>النص الحالي في التطبيق / Current app transcript</summary><p class="transcript">${escape(current.canonicalArabicText)}</p></details><p><a href="${permissionUrl}">MP3Quran — المصدر وسياسة الاستخدام / Source and reuse policy</a></p><p><a href="/#/learn">العودة إلى الكتب / Back to books</a></p><small>التوقيت المرفق خاص بكل تسجيل ولم يُفعّل تظليل الكلمات في التطبيق. Provider timings remain review evidence; app word highlighting is unchanged.</small></main><script>for(const audio of document.querySelectorAll('audio'))audio.addEventListener('play',()=>{for(const other of document.querySelectorAll('audio'))if(other!==audio)other.pause()});</script></html>`;
await writeFile(`${directory}/index.html`, html);
console.log(`Review page: http://127.0.0.1:5173/${directory}/index.html`);
