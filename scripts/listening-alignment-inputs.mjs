import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

export const textSha256 = (text) => crypto.createHash("sha256").update(text, "utf8").digest("hex");

/** Working model input only. All offsets refer to the untouched source string. */
export function tokenizeAlignmentText(text, language) {
  return [...text.matchAll(/[\p{L}\p{N}][\p{L}\p{M}\p{N}'’-]*/gu)].map((match, index) => ({
    index,
    startOffset: match.index,
    endOffset: match.index + match[0].length,
    text: match[0],
    alignmentText:
      language === "ar"
        ? match[0].normalize("NFC").replace(/\p{M}/gu, "").replace(/ـ/g, "").replace(/ٱ/g, "ا")
        : match[0].normalize("NFC").replace(/’/g, "'").replace(/-/g, "").toUpperCase(),
  }));
}

export function collectAlignmentJobs(catalog, content, fingerprint, semanticWords = new Map()) {
  const byArabicIdentity = new Map();
  for (const item of content) {
    const key = fingerprint(item.arabicText);
    const group = byArabicIdentity.get(key) ?? [];
    group.push(item);
    byArabicIdentity.set(key, group);
  }
  const jobs = new Map();
  for (const asset of Object.values(catalog.assets)) {
    if (asset.reviewStatus !== "approved") continue;
    for (const segment of asset.segments) {
      for (const variant of segment.variants) {
        if (variant.reviewStatus !== "approved") continue;
        const language = variant.voiceId === "english-george" ? "en" : "ar";
        const identity = `${variant.sha256}:${language}`;
        const job = jobs.get(identity) ?? {
          sha256: variant.sha256,
          byteSize: variant.byteSize,
          durationMs: variant.durationMs,
          language,
          relativePath: variant.relativePath,
          embeddedRepetitions: variant.embeddedRepetitions ?? 1,
          variants: [],
          candidates: [],
          status: "unreviewed-input",
        };
        if (
          job.byteSize !== variant.byteSize ||
          job.durationMs !== variant.durationMs ||
          job.embeddedRepetitions !== (variant.embeddedRepetitions ?? 1)
        )
          throw new Error(`Conflicting metadata for identical recording ${variant.id}`);
        job.variants.push({
          variantId: variant.id,
          assetId: asset.id,
          segmentId: segment.id,
          relativePath: variant.relativePath,
        });
        let candidates;
        if (language === "en") {
          // A canonical Arabic match identifies candidates, never proves spoken English wording.
          candidates = (byArabicIdentity.get(asset.normalizedTextHash) ?? [])
            .filter((item) => item.translation?.trim())
            .map((item) => ({
              text: item.translation,
              source: item.id,
              tokens: tokenizeAlignmentText(item.translation, "en"),
            }));
        } else if (segment.quranReference && semanticWords.size) {
          const { surah, ayahStart, ayahEnd } = segment.quranReference;
          const words = [];
          for (let ayah = ayahStart; ayah <= ayahEnd; ayah++) {
            const verseKey = `${surah}:${ayah}`;
            const verse = semanticWords.get(verseKey);
            if (!verse?.length) throw new Error(`Missing canonical Quran words ${verseKey}`);
            words.push(...verse.map((word) => ({ ...word, verseKey })));
          }
          let offset = 0;
          const tokens = words.map((word, index) => {
            const token = {
              index,
              position: word.position,
              verseKey: word.verseKey,
              text: word.text,
              alignmentText: tokenizeAlignmentText(word.text, "ar")
                .map((t) => t.alignmentText)
                .join(""),
              startOffset: offset,
              endOffset: offset + word.text.length,
            };
            offset = token.endOffset + 1;
            return token;
          });
          candidates = [
            { text: words.map((w) => w.text).join(" "), source: `mushaf:${surah}:${ayahStart}-${ayahEnd}`, tokens },
          ];
        } else {
          candidates = [
            {
              text: segment.transcriptArabic,
              source: segment.id,
              tokens: tokenizeAlignmentText(segment.transcriptArabic, "ar"),
            },
            ...(byArabicIdentity.get(asset.normalizedTextHash) ?? []).map((item) => ({
              text: item.arabicText,
              source: item.id,
              tokens: tokenizeAlignmentText(item.arabicText, "ar"),
            })),
          ];
        }
        for (const candidate of candidates) {
          const digest = textSha256(candidate.text);
          const existing = job.candidates.find((item) => item.textSha256 === digest);
          if (existing) {
            if (!existing.sources.includes(candidate.source)) existing.sources.push(candidate.source);
          } else job.candidates.push({ ...candidate, sources: [candidate.source], textSha256: digest });
        }
        jobs.set(identity, job);
      }
    }
  }
  return [...jobs.values()].sort((a, b) => a.durationMs - b.durationMs || a.sha256.localeCompare(b.sha256));
}

export function readSemanticWords(directory) {
  const verses = new Map();
  for (const file of fs.readdirSync(directory).filter((name) => name.endsWith(".json"))) {
    for (const verse of JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"))) {
      const words = verses.get(verse.k) ?? new Map();
      for (const word of verse.w) {
        if (word[2]) continue;
        if (words.has(word[0]) && words.get(word[0]) !== word[3])
          throw new Error(`Conflicting Quran word ${verse.k}:${word[0]}`);
        words.set(word[0], word[3]);
      }
      verses.set(verse.k, words);
    }
  }
  return new Map(
    [...verses].map(([key, words]) => [
      key,
      [...words]
        .sort((a, b) => a[0] - b[0])
        .map(([position, text], index) => {
          if (position !== index + 1) throw new Error(`Incomplete Quran word positions ${key}`);
          return { position, text };
        }),
    ]),
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const output = path.resolve(process.argv[2] ?? "output/listening-alignment");
  const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
  const { ALL_AZKAR } = loadTypeScriptModule("src/app/content/azkar.ts");
  const { COMPREHENSIVE_DUAS } = loadTypeScriptModule("src/app/content/comprehensiveDuas.ts");
  const { FRIDAY_KAHF } = loadTypeScriptModule("src/app/content/fridayKahf.ts");
  const { createArabicTextFingerprint } = loadTypeScriptModule("src/app/audio/arabicMatching.ts");
  const jobs = collectAlignmentJobs(
    AUDIO_CATALOG,
    [...ALL_AZKAR, ...COMPREHENSIVE_DUAS, ...FRIDAY_KAHF],
    createArabicTextFingerprint,
    readSemanticWords("public/data/mushaf"),
  );
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, "jobs.json"),
    JSON.stringify({ status: "unreviewed-preparation", jobs }, null, 2) + "\n",
  );
  console.log(
    `Prepared ${jobs.length} unique recording jobs; ${jobs.filter((job) => !job.candidates.length).length} lack transcript candidates. No timestamps or approvals were generated.`,
  );
}
