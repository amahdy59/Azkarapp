import { afterEach, expect, test, vi } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtemp, writeFile, mkdir, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  hasCurrentQualityPass,
  qualityFingerprint,
  recordQualityPass,
  invalidateQualityPass,
} from "./quality-receipt.mjs";

const roots = [];
async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), "azkar-quality-receipt-"));
  roots.push(root);
  execFileSync("git", ["init", "--quiet"], { cwd: root });
  await writeFile(path.join(root, ".gitignore"), "output/\nnode_modules/\n.env.local\n");
  await writeFile(path.join(root, "tracked.txt"), "tested content");
  execFileSync("git", ["add", "."], { cwd: root });
  return root;
}
afterEach(async () => {
  vi.unstubAllEnvs();
  for (const root of roots.splice(0)) {
    const resolved = path.resolve(root);
    if (
      path.dirname(resolved) !== path.resolve(os.tmpdir()) ||
      !path.basename(resolved).startsWith("azkar-quality-receipt-")
    )
      throw new Error("Unexpected temporary fixture path");
    await rm(resolved, { recursive: true, force: true });
  }
});

test("reuses a successful unchanged snapshot and ignores generated output", async () => {
  const root = await fixture();
  const fingerprint = await qualityFingerprint(root);
  expect(await hasCurrentQualityPass(root)).toBe(false);
  expect(await recordQualityPass(fingerprint, root)).toBe(!process.env.CI);
  await mkdir(path.join(root, "output"), { recursive: true });
  await writeFile(path.join(root, "output", "generated.log"), "not an input");
  expect(await qualityFingerprint(root)).toBe(fingerprint);
  expect(await hasCurrentQualityPass(root)).toBe(!process.env.CI);
  execFileSync("git", ["add", "."], { cwd: root });
  expect(await qualityFingerprint(root)).toBe(fingerprint);
});

test("changes to tracked files, untracked inputs and deleted inputs invalidate the pass", async () => {
  const root = await fixture();
  const fingerprint = await qualityFingerprint(root);
  await recordQualityPass(fingerprint, root);
  await writeFile(path.join(root, "tracked.txt"), "changed content");
  expect(await hasCurrentQualityPass(root)).toBe(false);
  expect(await recordQualityPass(fingerprint, root)).toBe(false);
  await writeFile(path.join(root, "tracked.txt"), "tested content");
  await writeFile(path.join(root, "new.txt"), "new input");
  expect(await qualityFingerprint(root)).not.toBe(fingerprint);
  await rm(path.join(root, "new.txt"));
  await rm(path.join(root, "tracked.txt"));
  expect(await qualityFingerprint(root)).not.toBe(fingerprint);
});

test("dependencies and build environment are part of the snapshot", async () => {
  const root = await fixture();
  const fingerprint = await qualityFingerprint(root);
  await mkdir(path.join(root, "node_modules/.pnpm"), { recursive: true });
  await writeFile(path.join(root, "node_modules/.pnpm/lock.yaml"), "changed graph");
  expect(await qualityFingerprint(root)).not.toBe(fingerprint);
  expect(await qualityFingerprint(root, { VITE_AUDIO_BASE_URL: "https://example.test/audio" })).not.toBe(
    await qualityFingerprint(root, {}),
  );
  const withDependencies = await qualityFingerprint(root);
  await writeFile(path.join(root, ".env.local"), "VITE_AUDIO_BASE_URL=https://example.test/local");
  expect(await qualityFingerprint(root)).not.toBe(withDependencies);
});

test("starting a new check clears an earlier success so a failed rerun cannot reuse it", async () => {
  const root = await fixture();
  await recordQualityPass(await qualityFingerprint(root), root);
  await invalidateQualityPass(root);
  expect(await hasCurrentQualityPass(root)).toBe(false);
});

test("malformed, stale and future receipts fail closed", async () => {
  const root = await fixture();
  await mkdir(path.join(root, "output"), { recursive: true });
  const receipt = path.join(root, "output/release-quality-receipt.json");
  await writeFile(receipt, "broken");
  expect(await hasCurrentQualityPass(root)).toBe(false);
  const fingerprint = await qualityFingerprint(root);
  await writeFile(receipt, JSON.stringify({ version: 1, fingerprint, passedAt: 1000 }));
  expect(await hasCurrentQualityPass(root, 1000 + 24 * 60 * 60 * 1000 + 1)).toBe(false);
  expect(await hasCurrentQualityPass(root, 999)).toBe(false);
});

test("CI never accepts or writes a local receipt", async () => {
  const root = await fixture();
  const fingerprint = await qualityFingerprint(root);
  vi.stubEnv("CI", "");
  expect(await recordQualityPass(fingerprint, root)).toBe(true);
  vi.stubEnv("CI", "true");
  expect(await hasCurrentQualityPass(root)).toBe(false);
  expect(await recordQualityPass(fingerprint, root)).toBe(false);
});
