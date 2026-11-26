/** Verify generated local review artifacts; deliberately separate from deployment E2E inventory. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.REVIEW_BASE_URL || "http://127.0.0.1:5173";
const directory = "output/quran-reciter-review";
const manifest = JSON.parse(await readFile("docs/audio/quran-reciter-pilot/manifest.json", "utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
if (sha256(await readFile(`${directory}/provider-permission.html`)) !== manifest.permissionSha256)
  throw new Error("Provider permission evidence mismatch");
for (const candidate of manifest.recordings) {
  const bytes = await readFile(`${directory}/media/${candidate.file}`);
  const timings = await readFile(`${directory}/reading-${candidate.readingId}-067-timing.json`);
  if (
    bytes.length !== candidate.byteSize ||
    sha256(bytes) !== candidate.sha256 ||
    sha256(timings) !== candidate.timingSha256
  )
    throw new Error("Recording or timing checksum mismatch");
}
await mkdir(`${directory}/evidence`, { recursive: true });
const evidence = [];
for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/${directory}/index.html`);
    for (const candidate of manifest.recordings) {
      await page.getByRole("heading", { name: candidate.nameArabic, exact: true }).waitFor();
      const recording = page.getByLabel(`${candidate.nameArabic} — سورة الملك`, { exact: true });
      await recording.evaluate(async (element) => {
        const audio = element;
        if (audio.readyState < 1)
          await new Promise((resolve, reject) => {
            audio.addEventListener("loadedmetadata", resolve, { once: true });
            audio.addEventListener("error", () => reject(new Error("Sample metadata failed")), { once: true });
          });
        await audio.play();
      });
      const status = await recording.evaluate((audio) => ({
        duration: audio.duration,
        paused: audio.paused,
        error: audio.error?.code ?? null,
      }));
      if (status.duration < 120 || status.paused || status.error) throw new Error("Native recording playback failed");
      await recording.evaluate((audio) => audio.pause());
      evidence.push({ engine, name: candidate.nameEnglish, sha256: candidate.sha256, ...status });
    }
    for (const width of [390, 320, 1280]) {
      await page.setViewportSize({ width, height: 950 });
      await page.evaluate((width) => {
        globalThis.document.documentElement.style.fontSize = width === 320 ? "200%" : "100%";
      }, width);
      const geometry = await page.evaluate(() => ({
        scroll: globalThis.document.documentElement.scrollWidth,
        viewport: globalThis.innerWidth,
      }));
      if (geometry.scroll > geometry.viewport + 1) throw new Error(`${engine}: review overflow at ${width}`);
      const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      if (scan.violations.length) throw new Error(JSON.stringify(scan.violations));
      await page.screenshot({ path: `${directory}/evidence/${engine}-${width}.png`, fullPage: true });
      evidence.push({ engine, width, textPercent: width === 320 ? 200 : 100, axeViolations: 0, overflow: false });
    }
    if (engine === "chromium") {
      await page.addInitScript(() => {
        globalThis.localStorage.setItem("azkarapp.onboarding-complete.v1", "true");
        globalThis.localStorage.setItem(
          "azkarapp.state.v1",
          JSON.stringify({ settings: { language: "ar", reduceMotion: true }, profile: { isGuest: true } }),
        );
      });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseUrl}/#/learn`);
      for (const name of ["المختار من صحيح الأدعية والأذكار", "دليل المعتمر", "الورد النبوي الصغير"])
        await page.getByRole("heading", { name, exact: true }).waitFor();
      await page.screenshot({ path: `${directory}/evidence/all-local-review-books.png`, fullPage: true });
    }
  } finally {
    await browser.close();
  }
}
await writeFile(`${directory}/evidence/verification.json`, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(
  "PASS: 9 native recording decodes/playbacks, 9 responsive axe/geometry cases and all three development books.",
);
