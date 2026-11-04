import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Explicit feature selection is a development aid, never a release gate or
// an inferred guarantee that unrelated features cannot be affected.
export const FEATURE_SPECS = {
  home: [
    "adaptive-navigation.spec.ts",
    "compact-practice.spec.ts",
    "home-*.spec.ts",
    "motion-control-polish.spec.ts",
    "compact-icon-feedback.spec.ts",
    "todays-path.spec.ts",
    "reminder-responsive.spec.ts",
    "contextual-reminder-plan.spec.ts",
  ],
  reminders: [
    "settings-readiness-surfaces.spec.ts",
    "first-use-calm-controls.spec.ts",
    "reminder-responsive.spec.ts",
    "contextual-reminder-plan.spec.ts",
    "pwa-update-flow.spec.ts",
  ],
  reader: ["reader-*.spec.ts", "devotional-footer.spec.ts", "reading-reliability.spec.ts"],
  quran: [
    "button-family-consistency.spec.ts",
    "adaptive-navigation.spec.ts",
    "compact-practice.spec.ts",
    "reader-alignment.spec.ts",
    "paper-grain.spec.ts",
    "final-touch-quality.spec.ts",
    "quran-*.spec.ts",
    "mushaf-*.spec.ts",
    "khatmah-reader.spec.ts",
    "reader-mushaf-lettering.spec.ts",
    "audio-surah-stream.spec.ts",
  ],
  audio: [
    "compact-practice.spec.ts",
    "final-touch-quality.spec.ts",
    "audio*.spec.ts",
    "quran-listening.spec.ts",
    "quran-translation.spec.ts",
    "player-containment-benefits.spec.ts",
  ],
  progress: [
    "button-family-consistency.spec.ts",
    "adaptive-navigation.spec.ts",
    "compact-practice.spec.ts",
    "final-touch-quality.spec.ts",
    "progress-*.spec.ts",
    "shared-card-finish.spec.ts",
    "quiet-garden.spec.ts",
    "settings-progress-clarity.spec.ts",
    "manual-checklist.spec.ts",
  ],
  controls: [
    "settings-row-hover.spec.ts",
    "button-family-consistency.spec.ts",
    "adaptive-navigation.spec.ts",
    "compact-practice.spec.ts",
    "reader-alignment.spec.ts",
    "enlarged-control-reflow.spec.ts",
    "reader-focus-intent.spec.ts",
    "owner-followup-controls.spec.ts",
    "focus-highlight-surfaces.spec.ts",
    "mushaf-sizing-feedback.spec.ts",
    "paper-grain.spec.ts",
    "final-touch-quality.spec.ts",
    "modal-card-feedback.spec.ts",
    "consolidated-reading.spec.ts",
    "navigation-motion.spec.ts",
    "progress-compact-panels.spec.ts",
    "shared-card-finish.spec.ts",
    "responsive.spec.ts",
    "narrow-layout.spec.ts",
    "overlay-geometry.spec.ts",
    "settings-experience.spec.ts",
    "compact-icon-feedback.spec.ts",
    "first-use-calm-controls.spec.ts",
  ],
  settings: [
    "button-family-consistency.spec.ts",
    "adaptive-navigation.spec.ts",
    "focus-highlight-surfaces.spec.ts",
    "final-touch-quality.spec.ts",
    "settings-*.spec.ts",
    "offline-downloads.spec.ts",
  ],
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
