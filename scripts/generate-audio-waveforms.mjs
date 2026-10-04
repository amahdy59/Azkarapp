/* global fetch, AbortSignal, atob, OfflineAudioContext */
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { format, resolveConfig } from "prettier";
import { chromium } from "playwright";
import { loadTypeScriptModule } from "./load-typescript-module.mjs";

// Build-time only: decode approved bytes; ship peaks, never recordings or a decoder.
const { AUDIO_CATALOG } = loadTypeScriptModule("src/app/audio/audioManifest.ts");
const variants = [
  ...new Map(
    Object.values(AUDIO_CATALOG.assets)
      .filter((asset) => asset.reviewStatus === "approved")
      .flatMap((asset) => asset.segments.flatMap((segment) => segment.variants))
      .filter((variant) => variant.reviewStatus === "approved")
      .map((variant) => [variant.sha256, variant]),
  ).values(),
];
const output = path.resolve("src/app/audio/audioWaveforms.json");
const baseUrl = (process.env.VITE_AUDIO_BASE_URL || "https://pub-6e537fd865454e599c23a2bcfc22136e.r2.dev").replace(
  /\/+$/,
  "",
);
const browser = await chromium.launch({ headless: true });
const peaks = JSON.parse(await fs.readFile(output, "utf8").catch(() => "{}"));
const failures = [];
try {
  const pending = variants.filter((variant) => !peaks[variant.sha256]);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      const page = await browser.newPage();
      while (pending.length) {
        const variant = pending.shift();
        console.log(`Verifying ${variant.id} (${Math.round(variant.byteSize / 1024)} KiB)`);
        const response = await fetch(`${baseUrl}/${variant.relativePath}?sha256=${variant.sha256}`, {
          signal: AbortSignal.timeout(600000),
        });
        if (!response.ok) throw new Error(`${variant.id}: HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length !== variant.byteSize || createHash("sha256").update(bytes).digest("hex") !== variant.sha256) {
          failures.push({
            variantId: variant.id,
            manifestChecksum: variant.sha256,
            hostedChecksum: createHash("sha256").update(bytes).digest("hex"),
            expectedSize: variant.byteSize,
            actualSize: bytes.length,
          });
          console.error(
            `${variant.id}: size ${bytes.length}/${variant.byteSize}, checksum match ${createHash("sha256").update(bytes).digest("hex") === variant.sha256}`,
          );
          continue;
        }
        peaks[variant.sha256] = await page.evaluate(async (encoded) => {
          const data = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
          const context = new OfflineAudioContext(1, 1, 8000);
          const audio = await context.decodeAudioData(data.buffer);
          const samples = audio.getChannelData(0);
          const bins = Array.from({ length: 96 }, (_, index) => {
            const start = Math.floor((index * samples.length) / 96);
            const end = Math.floor(((index + 1) * samples.length) / 96);
            let peak = 0;
            for (let sample = start; sample < end; sample++) peak = Math.max(peak, Math.abs(samples[sample]));
            return peak;
          });
          const max = Math.max(...bins, 0.000001);
          return bins.map((value) => Math.round((value / max) * 255));
        }, bytes.toString("base64"));
        await fs.writeFile(output, `${JSON.stringify(peaks)}\n`);
        if (Object.keys(peaks).length % 20 === 0)
          console.log(`Decoded ${Object.keys(peaks).length}/${variants.length}`);
      }
      await page.close();
    }),
  );
  const orderedPeaks = Object.fromEntries(
    variants.filter((variant) => peaks[variant.sha256]).map((variant) => [variant.sha256, peaks[variant.sha256]]),
  );
  const formatOptions = { ...(await resolveConfig(output)), parser: "json" };
  await fs.writeFile(output, await format(JSON.stringify(orderedPeaks), formatOptions));
  await fs.writeFile(
    path.resolve("src/app/audio/audioWaveformUnavailable.json"),
    await format(JSON.stringify(failures.sort((a, b) => a.variantId.localeCompare(b.variantId))), formatOptions),
  );
  console.log(
    `Verified and generated ${Object.keys(peaks).length}/${variants.length} recording waveforms. ${failures.length} unverified recordings retain timeline fallback.`,
  );
} finally {
  await browser.close();
}
