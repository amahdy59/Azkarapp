import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Explicit feature selection is a development aid, never a release gate or
// an inferred guarantee that unrelated features cannot be affected.
export const FEATURE_SPECS = {
  reader: ["reader-*.spec.ts", "devotional-footer.spec.ts", "reading-reliability.spec.ts"],
  quran: [
    "quran-*.spec.ts",
    "mushaf-*.spec.ts",
    "khatmah-reader.spec.ts",
    "reader-mushaf-lettering.spec.ts",
    "audio-surah-stream.spec.ts",
  ],
  audio: [
    "audio*.spec.ts",
    "quran-listening.spec.ts",
    "quran-translation.spec.ts",
    "player-containment-benefits.spec.ts",
  ],
  progress: [
    "progress-*.spec.ts",
    "quiet-garden.spec.ts",
    "settings-progress-clarity.spec.ts",
    "manual-checklist.spec.ts",
  ],
  controls: ["responsive.spec.ts", "narrow-layout.spec.ts", "overlay-geometry.spec.ts", "settings-experience.spec.ts"],
  settings: ["settings-*.spec.ts", "offline-downloads.spec.ts"],
  sharing: ["sharing-*.spec.ts", "ayah-*.spec.ts"],
  offline: ["offline-*.spec.ts", "pwa-*.spec.ts", "reader-mushaf-lettering.spec.ts"],
  persistence: ["audio-integrity.spec.ts", "reading-reliability.spec.ts", "offline-core.spec.ts"],
};

export function featureBrowserArguments(feature, extraArgs = []) {
  const specs = Object.hasOwn(FEATURE_SPECS, feature) && FEATURE_SPECS[feature];
  if (!specs) throw new Error(`Choose a feature: ${Object.keys(FEATURE_SPECS).join(", ")}.`);
  return ["test", ...specs.map((spec) => `e2e/${spec.replaceAll(".", "\\.").replaceAll("*", ".*")}`), ...extraArgs];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = featureBrowserArguments(process.argv[2], process.argv.slice(3));
    const require = createRequire(import.meta.url);
    const cli = path.join(path.dirname(require.resolve("@playwright/test/package.json")), "cli.js");
    const child = spawn(process.execPath, [cli, ...args], { stdio: "inherit" });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.on("SIGINT", interrupt);
    process.on("SIGTERM", terminate);
    child.once("error", (error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
    child.once("exit", (code) => {
      process.off("SIGINT", interrupt);
      process.off("SIGTERM", terminate);
      process.exitCode = code ?? 1;
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
