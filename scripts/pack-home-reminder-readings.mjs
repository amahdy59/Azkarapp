import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import ts from "typescript";

const require = createRequire(import.meta.url);
// Authoring modules remain authoritative; this build-time loader never ships.
require.extensions[".ts"] = (module, filename) => {
  const source = readFileSync(filename, "utf8");
  module._compile(
    ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText,
    filename,
  );
};

// Source JSON stays reviewable. Only this lossless package ships to readers.
const readings = JSON.parse(readFileSync("src/app/content/homeReminderReadings.json", "utf8"));
const fallbacks = JSON.parse(readFileSync("src/app/content/homeReminderFallbacks.json", "utf8"));
const { RELEVANT_NOW_LIBRARY } = require("../src/app/content/relevantNowLibrary.ts");
const { AUTHENTICATED_REMINDER_LIBRARY } = require("../src/app/content/authenticatedReminders.ts");
const { RELEVANT_NOW_VERSES: verses } = require("../src/app/content/relevantNowVerses.ts");
// Obsolete excerpts need not be delivered beside their complete readings.
const library = [...RELEVANT_NOW_LIBRARY, ...AUTHENTICATED_REMINDER_LIBRARY].map((source) => {
  const metadata = { ...source };
  delete metadata.arabic;
  delete metadata.english;
  return metadata;
});
const packed = gzipSync(JSON.stringify({ readings, fallbacks, library, verses }), { level: 9 });
writeFileSync("src/app/content/home-reminder-readings.bin", packed);
const sha256 = createHash("sha256").update(packed).digest("hex");
writeFileSync(
  "src/app/content/homeReminderManifest.json",
  JSON.stringify(
    {
      schema: 1,
      sha256,
      bytes: packed.length,
      url: `https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev/content/home-reminders/v1/home-reminder-readings-${sha256}.bin`,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Packed ${Object.keys(readings).length} readings and ${Object.keys(fallbacks).length} fallback mappings: ${packed.length} bytes.`,
);
