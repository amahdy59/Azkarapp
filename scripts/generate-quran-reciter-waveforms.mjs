/** Authoring only: append exact-byte peaks for the three accepted local Quran files. */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { format, resolveConfig } from "prettier";

const manifest = JSON.parse(await readFile("docs/audio/quran-reciter-pilot/manifest.json", "utf8"));
const acceptance = JSON.parse(await readFile("docs/audio/quran-reciter-pilot/activation.json", "utf8"));
const output = "src/app/audio/audioWaveforms.json";
const peaks = JSON.parse(await readFile(output, "utf8"));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const accepted of acceptance.recordings) {
    const recording = manifest.recordings.find((entry) => entry.readingId === accepted.readingId);
    const bytes = await readFile(`output/quran-reciter-review/media/${recording.file}`);
    const checksum = createHash("sha256").update(bytes).digest("hex");
    if (checksum !== accepted.sha256 || checksum !== recording.sha256 || bytes.length !== recording.byteSize)
      throw new Error("Local recording does not match owner acceptance");
    if (peaks[checksum]) continue;
    peaks[checksum] = await page.evaluate(async (encoded) => {
      const data = Uint8Array.from(globalThis.atob(encoded), (character) => character.charCodeAt(0));
      const context = new globalThis.OfflineAudioContext(1, 1, 8000);
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
    console.log(`${recording.nameEnglish}: decoded 96 exact-byte waveform peaks.`);
  }
  await writeFile(output, await format(JSON.stringify(peaks), { ...(await resolveConfig(output)), parser: "json" }));
} finally {
  await browser.close();
}
