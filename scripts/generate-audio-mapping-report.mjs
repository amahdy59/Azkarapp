import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const root = process.cwd();
const content = loadTypeScriptModule(path.join(root, "src/app/content/azkar.ts"));
const comprehensive = loadTypeScriptModule(path.join(root, "src/app/content/comprehensiveDuas.ts"));
const manifest = loadTypeScriptModule(path.join(root, "src/app/audio/audioManifest.ts"));
const validation = loadTypeScriptModule(path.join(root, "src/app/audio/validateAudioCatalog.ts"));
const zikrs = [...content.ALL_AZKAR, ...comprehensive.COMPREHENSIVE_DUAS];
const catalog = manifest.AUDIO_CATALOG;
const issues = validation.validateAudioCatalog(catalog, zikrs);
const groupBy = (values, keyFor) => {
  const groups = new Map();
  for (const value of values) {
    const key = keyFor(value);
    const group = groups.get(key) ?? [];
    group.push(value);
    groups.set(key, group);
  }
  return groups;
};
const canonicalGroups = groupBy(zikrs, (zikr) => zikr.canonicalKey);
const assigned = zikrs.filter((zikr) => catalog.assignments[zikr.id]);
const unmatched = zikrs.filter((zikr) => !catalog.assignments[zikr.id]);
const reused = [...canonicalGroups.entries()].filter(([, items]) => items.length > 1);
const duplicatePaths = groupBy(
  Object.values(catalog.assets).flatMap((asset) => asset.segments.flatMap((segment) => segment.variants)),
  (variant) => variant.relativePath,
);
const duplicatePathCount = [...duplicatePaths.values()].filter((variants) => variants.length > 1).length;
const pending = Object.values(catalog.assets).filter((asset) => asset.reviewStatus === "pending").length;
const licenseWarnings = issues.filter((issue) =>
  ["missing-source", "missing-attribution", "missing-license"].includes(issue.code),
).length;
const quranErrors = issues.filter((issue) => issue.code === "quran-range").length;
const recordingInventory = [...canonicalGroups.entries()].map(([canonicalKey, items]) => {
  const representative = items[0];
  const contentKind = representative.isSurah || canonicalKey.startsWith("quran-") ? "quran" : "dua";
  return {
    canonicalKey,
    assetId: representative.id,
    fileName: `${representative.id}.mp3`,
    uploadKey: `${contentKind}/${representative.id}/<voice-id>/v1/${representative.id}.mp3`,
    instanceIds: items.map((item) => item.id),
  };
});
const report = `# Generated audio mapping report

Generated: ${new Date().toISOString()}

| Metric | Count |
| --- | ---: |
| Zikr instances | ${zikrs.length} |
| Total canonical zikrs | ${canonicalGroups.size} |
| Approved audio mappings | ${assigned.length} |
| Pending assets | ${pending} |
| Unmatched zikrs | ${unmatched.length} |
| Duplicate asset paths | ${duplicatePathCount} |
| Shared canonical groups | ${reused.length} |
| Qur'anic range errors | ${quranErrors} |
| Licence metadata warnings | ${licenseWarnings} |
| Unavailable URLs | ${issues.filter((issue) => issue.code === "unavailable-url").length} |

## Shared asset reuse

${reused.map(([key, items]) => `- \`${key}\`: ${items.map((item) => `\`${item.id}\``).join(", ")}`).join("\n") || "- None"}

## Recording filenames and upload keys

Record one file per canonical row, not one file per screen instance. The filename and object key below match the current \`prepare:audio\` convention. Replace \`<voice-id>\` with \`abdullah-muhammad\`, \`muhammad-alshara\`, or \`muhammad-moataz\`.

| Canonical content | Asset ID | Recording filename | Supabase \`audio\` bucket object key | App instance IDs |
| --- | --- | --- | --- | --- |
${recordingInventory
  .map(
    ({ canonicalKey, assetId, fileName, uploadKey, instanceIds }) =>
      `| \`${canonicalKey}\` | \`${assetId}\` | \`${fileName}\` | \`${uploadKey}\` | ${instanceIds.map((id) => `\`${id}\``).join(", ")} |`,
  )
  .join("\n")}

## Unmatched zikrs

${unmatched.map((zikr) => `- \`${zikr.id}\` — \`${zikr.canonicalKey}\``).join("\n") || "- None"}
`;
const formattedReport = await prettier.format(report, { parser: "markdown" });

if (process.argv.includes("--write")) {
  const target = path.join(root, "docs/audio/generated-mapping-report.md");
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, formattedReport);
  console.log(`Wrote ${path.relative(root, target)}`);
} else {
  process.stdout.write(formattedReport);
}
