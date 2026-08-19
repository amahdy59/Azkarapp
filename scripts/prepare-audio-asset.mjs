/**
 * Turns one recorded file into a manifest record.
 *
 * Every field the catalog validator checks is derived here rather than typed by
 * hand: the SHA-256, the byte size, the duration, the storage key, and — the one
 * nobody can work out on paper — the FNV-1a fingerprint of the zikr's own text.
 * A wrong fingerprint fails the build with `asset-text-hash`, and the only way
 * to get it right is to compute it from the same text the app renders.
 *
 * Usage:
 *   node scripts/prepare-audio-asset.mjs --file ./asbahna.m4a --zikr m-hm-77m --voice muhammad-moataz
 *
 * Options:
 *   --version N   immutable path version, default 1
 *   --source ID   source record id, default <voice>-recordings
 *   --json        print only the record, for piping
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
};

const filePath = flag("file");
const zikrId = flag("zikr");
const voiceId = flag("voice");
const version = Number(flag("version", "1"));
const jsonOnly = args.includes("--json");

if (!filePath || !zikrId || !voiceId) {
  console.error("Required: --file <path> --zikr <id> --voice <voiceId>");
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`No such file: ${filePath}`);
  process.exit(1);
}

const root = process.cwd();
const content = loadTypeScriptModule(path.join(root, "src/app/content/azkar.ts"));
const comprehensive = loadTypeScriptModule(path.join(root, "src/app/content/comprehensiveDuas.ts"));
const matching = loadTypeScriptModule(path.join(root, "src/app/audio/arabicMatching.ts"));
const voices = loadTypeScriptModule(path.join(root, "src/app/audio/audioVoices.ts"));

const zikr = [...content.ALL_AZKAR, ...comprehensive.COMPREHENSIVE_DUAS].find((item) => item.id === zikrId);
if (!zikr) {
  console.error(`Unknown zikr id: ${zikrId}`);
  process.exit(1);
}
if (!voices.isKnownAudioVoice(voiceId)) {
  console.error(`Unknown voice id: ${voiceId}. Add it to src/app/audio/audioVoices.ts first.`);
  process.exit(1);
}

const bytes = fs.readFileSync(filePath);
const sha256 = crypto.createHash("sha256").update(bytes).digest("hex");

/* Exact, not estimated. The validator compares this against the served file,
   and a rounded duration is a failed build rather than a small inaccuracy. */
let durationMs;
try {
  const probed = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", filePath],
    { encoding: "utf8" },
  );
  durationMs = Math.round(Number.parseFloat(probed.trim()) * 1000);
} catch {
  console.error(
    "ffprobe is required for an exact duration and was not found on PATH.\n" +
      "Install ffmpeg, or pass the duration yourself once you have it.",
  );
  process.exit(1);
}

const extension = path.extname(filePath).toLowerCase();
const MIME_BY_EXTENSION = { ".m4a": "audio/mp4", ".mp4": "audio/mp4", ".mp3": "audio/mpeg", ".ogg": "audio/ogg" };
const mimeType = MIME_BY_EXTENSION[extension];
if (!mimeType) {
  console.error(`Unsupported extension ${extension}. Expected .m4a, .mp4, .mp3 or .ogg.`);
  process.exit(1);
}

const contentKind = zikr.isSurah ? "quran" : "dua";
const relativePath = `${contentKind}/${zikr.id}/${voiceId}/v${version}/${zikr.id}${extension}`;
const fingerprint = matching.createArabicTextFingerprint(zikr.arabicText);
const voiceName = voices.getAudioVoiceName(voiceId, "ar");

const asset = {
  id: zikr.id,
  titleArabic: zikr.surahNameArabic ?? zikr.benefitArabic ?? zikr.id,
  titleEnglish: zikr.surahNameEnglish ?? zikr.benefit ?? zikr.id,
  contentKind,
  kind: "single",
  canonicalArabicText: zikr.arabicText,
  normalizedTextHash: fingerprint,
  segments: [
    {
      id: `${zikr.id}-1`,
      order: 1,
      transcriptArabic: zikr.arabicText,
      normalizedTranscriptHash: fingerprint,
      variants: [
        {
          id: `${zikr.id}-${voiceId}-v${version}`,
          voiceId,
          voiceName,
          relativePath,
          mimeType,
          durationMs,
          byteSize: bytes.byteLength,
          sha256,
          sourceId: flag("source", `${voiceId}-recordings`),
          reviewStatus: "pending",
        },
      ],
    },
  ],
  defaultVoiceId: voiceId,
  reviewStatus: "pending",
  version,
};

if (jsonOnly) {
  console.log(JSON.stringify(asset, null, 2));
  process.exit(0);
}

console.log(`\nZikr        ${zikr.id}`);
console.log(`Voice       ${voiceName} (${voiceId})`);
console.log(`Duration    ${(durationMs / 1000).toFixed(2)}s`);
console.log(`Size        ${(bytes.byteLength / 1024).toFixed(1)} KiB`);
console.log(`Type        ${mimeType}`);
console.log(`\nUpload to this exact key:\n  ${relativePath}`);
console.log(
  `\n  supabase storage cp "${filePath}" "ss:///audio/${relativePath}" \\\n` +
    `    --content-type ${mimeType} \\\n` +
    `    --cache-control "public, max-age=31536000, immutable"`,
);
console.log(`\nManifest record — paste into AUDIO_ASSETS in src/app/audio/audioManifest.ts:\n`);
console.log(JSON.stringify({ [zikr.id]: asset }, null, 2));
console.log(
  `\nBoth reviewStatus fields are "pending" on purpose: nothing plays until a\n` +
    `qualified reviewer sets them to "approved". Run \`pnpm validate:audio\` once\n` +
    `the file is uploaded and VITE_AUDIO_BASE_URL is set.\n`,
);
