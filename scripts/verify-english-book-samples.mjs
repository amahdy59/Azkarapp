import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { SAMPLE_OUTPUT, resolveEnglishSamples } from "./english-book-samples.mjs";

const samples = await resolveEnglishSamples();
const evidence = path.join(SAMPLE_OUTPUT, "evidence");
await fs.mkdir(evidence, { recursive: true });
const results = [];
for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const sample of samples) {
      await page.goto(pathToFileURL(path.join(SAMPLE_OUTPUT, `${sample.id}-english-sample.html`)).href);
      await page.evaluate(async () => globalThis.document.fonts.ready);
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ["light", "dark", "navy"]) {
          await page.getByRole("radio", { name: theme, exact: false }).check();
          await page.evaluate((width) => {
            globalThis.document.documentElement.style.fontSize = width === 320 ? "200%" : "100%";
          }, width);
          const geometry = await page.evaluate(() => {
            const overflow = [...globalThis.document.querySelectorAll("main,.reader-tools,.quran-pair")]
              .filter((element) => element.scrollWidth > element.clientWidth + 1)
              .map((element) => element.className || element.tagName);
            return {
              overflow,
              documentOverflow: globalThis.document.documentElement.scrollWidth > globalThis.innerWidth + 1,
            };
          });
          if (geometry.documentOverflow || geometry.overflow.length)
            throw new Error(`${engine}/${sample.id}/${width}/${theme}: ${JSON.stringify(geometry)}`);
          const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
          if (scan.violations.length)
            throw new Error(JSON.stringify({ engine, id: sample.id, width, theme, violations: scan.violations }));
          results.push({
            engine,
            id: sample.id,
            width,
            textPercent: width === 320 ? 200 : 100,
            theme,
            axeViolations: 0,
            horizontalOverflow: false,
          });
          if (engine === "chromium" && ((width === 1280 && theme === "light") || (width === 320 && theme === "navy")))
            await page.screenshot({ path: path.join(evidence, `${sample.id}-${width}-${theme}.png`), fullPage: true });
        }
      }
      await page.evaluate(() => {
        globalThis.document.documentElement.style.fontSize = "100%";
      });
      await page.getByRole("button", { name: "Increase reading text size" }).click();
      if ((await page.locator("#size-value").textContent()) !== "125%") throw new Error("Text enlargement failed");
      await page.getByRole("button", { name: "Decrease reading text size" }).click();
      // A reload can restore the focused size control. A fresh document proves
      // the entry tab order without relying on browser focus restoration.
      const keyboardPage = await context.newPage();
      await keyboardPage.goto(pathToFileURL(path.join(SAMPLE_OUTPUT, `${sample.id}-english-sample.html`)).href);
      await keyboardPage.keyboard.press("Tab");
      if ((await keyboardPage.locator(":focus").textContent()) !== "Skip to reading")
        throw new Error(`${engine}/${sample.id}: keyboard skip link unavailable`);
      await keyboardPage.keyboard.press("Enter");
      if ((await keyboardPage.locator(":focus").getAttribute("id")) !== "reading")
        throw new Error(`${engine}/${sample.id}: skip link focus failed`);
      await keyboardPage.close();
      console.log(`${engine}/${sample.id}: 9 responsive/theme cases and keyboard/text controls passed`);
    }
  } finally {
    await browser.close();
  }
}
await fs.writeFile(path.join(evidence, "browser-verification.json"), JSON.stringify(results, null, 2) + "\n");
console.log(
  `${results.length} responsive/theme cases passed across three engines; text controls and keyboard skip verified.`,
);
