import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile, lstat, readlink, mkdir, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const receiptPath = (root) => path.join(root, "output/release-quality-receipt.json");

/** Content, rather than commit identity: committing a tested tree does not invalidate it. */
export async function qualityFingerprint(root = process.cwd(), environment = process.env) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify([process.version, process.platform, process.arch]));
  const relevantEnvironment = Object.entries(environment)
    .filter(([name]) => name.startsWith("VITE_") || ["NODE_OPTIONS", "NODE_ENV", "TZ"].includes(name))
    .sort(([a], [b]) => a.localeCompare(b));
  hash.update(JSON.stringify(relevantEnvironment));
  const listing = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  });
  for (const name of [...new Set(listing.split("\0").filter(Boolean))].sort()) {
    hash.update(JSON.stringify(name));
    try {
      const target = path.join(root, name);
      const info = await lstat(target);
      hash.update(String(info.mode));
      hash.update(info.isSymbolicLink() ? await readlink(target) : await readFile(target));
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      hash.update("deleted");
    }
  }
  // Vite reads ignored local dotenv files too. Hash them without recording their values.
  for (const name of (await readdir(root)).filter((name) => name === ".env" || name.startsWith(".env.")).sort()) {
    hash.update(name);
    hash.update(await readFile(path.join(root, name)));
  }
  // The frozen install must still run before reuse; bind the installed graph too.
  try {
    hash.update(await readFile(path.join(root, "node_modules/.pnpm/lock.yaml")));
  } catch {
    hash.update("no-installed-lock");
  }
  return hash.digest("hex");
}

export async function invalidateQualityPass(root = process.cwd()) {
  await rm(receiptPath(root), { force: true });
}

export async function recordQualityPass(startFingerprint, root = process.cwd()) {
  if (process.env.CI) return false;
  if ((await qualityFingerprint(root)) !== startFingerprint) return false;
  await mkdir(path.dirname(receiptPath(root)), { recursive: true });
  await writeFile(
    receiptPath(root),
    JSON.stringify({ version: 1, fingerprint: startFingerprint, passedAt: Date.now() }),
  );
  return true;
}

export async function hasCurrentQualityPass(root = process.cwd(), now = Date.now()) {
  if (process.env.CI) return false;
  try {
    const receipt = JSON.parse(await readFile(receiptPath(root), "utf8"));
    return (
      receipt.version === 1 &&
      Number.isFinite(receipt.passedAt) &&
      now >= receipt.passedAt &&
      now - receipt.passedAt <= MAX_AGE_MS &&
      receipt.fingerprint === (await qualityFingerprint(root))
    );
  } catch {
    return false;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const valid = await hasCurrentQualityPass();
  console.log(
    valid ? "Reusing the unchanged local quality pass (less than 24 hours old)." : "A fresh quality pass is required.",
  );
  process.exitCode = valid ? 0 : 1;
}
