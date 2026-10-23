import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const sourceDirectory = path.resolve(".live-update-build");
const outputDirectory = path.resolve("dist/live-updates");
if (!existsSync(sourceDirectory)) throw new Error(`Missing live-update build at ${sourceDirectory}`);

const releaseNotes = JSON.parse(readFileSync("public/release-notes.json", "utf8"));
const release = typeof releaseNotes.release === "string" && releaseNotes.release ? releaseNotes.release : "development";
const commit = (process.env.GITHUB_SHA || "local").slice(0, 12);
const bundleId = `${release}-${commit}`;
const archiveName = `${bundleId}.zip`;
const archivePath = path.join(outputDirectory, archiveName);

rmSync(outputDirectory, { recursive: true, force: true });
mkdirSync(outputDirectory, { recursive: true });

// The Capacitor plugin expects the archive root to contain index.html and the
// assets directly. `zip` is available on GitHub-hosted runners and macOS; no
// runtime package is needed just to publish a static artifact.
execFileSync("zip", ["-qr", archivePath, "."], { cwd: sourceDirectory, stdio: "inherit" });
const checksum = createHash("sha256").update(readFileSync(archivePath)).digest("hex");
const baseUrl = (process.env.VITE_NATIVE_LIVE_UPDATE_BASE_URL || "https://amahdy59.github.io/Azkarapp").replace(
  /\/+$/,
  "",
);

writeFileSync(
  path.join(outputDirectory, "manifest.json"),
  `${JSON.stringify(
    {
      bundleId,
      release,
      url: `${baseUrl}/live-updates/${archiveName}`,
      checksum,
      minVersionCode: "1",
    },
    null,
    2,
  )}\n`,
);

console.log(`Packaged ${archiveName} (${checksum})`);
