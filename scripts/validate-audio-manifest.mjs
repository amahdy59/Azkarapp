/* global fetch */
import fs from "node:fs";
import path from "node:path";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

const root = process.cwd();
const content = loadTypeScriptModule(path.join(root, "src/app/content/azkar.ts"));
const comprehensive = loadTypeScriptModule(path.join(root, "src/app/content/comprehensiveDuas.ts"));
const fridayKahf = loadTypeScriptModule(path.join(root, "src/app/content/fridayKahf.ts"));
const manifest = loadTypeScriptModule(path.join(root, "src/app/audio/audioManifest.ts"));
const validation = loadTypeScriptModule(path.join(root, "src/app/audio/validateAudioCatalog.ts"));
const zikrs = [...content.ALL_AZKAR, ...comprehensive.COMPREHENSIVE_DUAS, ...fridayKahf.FRIDAY_KAHF];
const issues = validation.validateAudioCatalog(manifest.AUDIO_CATALOG, zikrs);

for (const zikr of zikrs) {
  if (!zikr.canonicalKey || !zikr.audioBehavior) {
    issues.push({
      code: "missing-audio-content-identity",
      message: `${zikr.id} has no finalized audio content identity.`,
    });
  }
  const assignment = manifest.AUDIO_CATALOG.assignments[zikr.id];
  if ((zikr.audioAssetId ?? undefined) !== (assignment ?? undefined)) {
    issues.push({ code: "content-assignment-conflict", message: `${zikr.id} does not match the assignment registry.` });
  }
}

const forbidden = ["getZikrAudioUrl", "useAudioPlayer", "everyayah.com/data"];
const sourceRoot = path.join(root, "src/app");
const sourceFiles = [];
const visit = (directory) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (/\.[jt]sx?$/.test(entry.name) && !entry.name.endsWith(".test.ts") && !entry.name.endsWith(".test.tsx"))
      sourceFiles.push(target);
  }
};
visit(sourceRoot);
for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8");
  for (const marker of forbidden) {
    if (source.includes(marker))
      issues.push({ code: "legacy-resolver", message: `${path.relative(root, file)} contains ${marker}.` });
  }
}

const approvedVariants = Object.values(manifest.AUDIO_CATALOG.assets)
  .filter((asset) => asset.reviewStatus === "approved")
  .flatMap((asset) =>
    asset.segments.flatMap((segment) => segment.variants.filter((variant) => variant.reviewStatus === "approved")),
  );
const baseUrl = process.env.VITE_AUDIO_BASE_URL?.replace(/\/+$/, "");
if (approvedVariants.length > 0 && !baseUrl) {
  issues.push({ code: "missing-base-url", message: "VITE_AUDIO_BASE_URL is required when approved assets exist." });
}

if (baseUrl) {
  for (const variant of approvedVariants) {
    try {
      const response = await fetch(`${baseUrl}/${variant.relativePath.replace(/^\/+/, "")}`, {
        headers: { Range: "bytes=0-0" },
      });
      const mimeType = response.headers.get("content-type")?.split(";")[0];
      if (![200, 206].includes(response.status)) throw new Error(`HTTP ${response.status}`);
      if (mimeType !== variant.mimeType) throw new Error(`MIME ${mimeType ?? "missing"}`);
    } catch (error) {
      issues.push({
        code: "unavailable-url",
        message: `${variant.id}: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }
}

if (issues.length > 0) {
  console.error(`Audio manifest validation failed with ${issues.length} issue(s):`);
  for (const issue of issues) console.error(`- [${issue.code}] ${issue.message}`);
  process.exitCode = 1;
} else {
  console.log(
    `Audio manifest valid: ${zikrs.length} zikr instances, ${Object.keys(manifest.AUDIO_CATALOG.assets).length} assets, ${Object.keys(manifest.AUDIO_CATALOG.assignments).length} approved mappings.`,
  );
}
