import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(import.meta.dirname, "../..");
const out = path.join(root, "output/pdf/book-improvements-2026-11-25/evidence");
fs.mkdirSync(out, { recursive: true });
const axePath = createRequire(import.meta.url).resolve("axe-core/axe.min.js");
const books = [
  "book1_al_mukhtar/al_mukhtar",
  "book2_dalil_al_mutamir/dalil_al_mutamir",
  "book3_al_wird_an_nabawi/al_wird_an_nabawi",
];
const selectedBooks = process.argv[2] ? books.filter((book) => book.includes(process.argv[2])) : books;
assert.ok(selectedBooks.length, "No matching book selected");
const report = [];
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const book of selectedBooks) {
    for (const theme of ["light", "dark", "navy"]) {
      const file = path.join(import.meta.dirname, `${book}_${theme}.html`);
      await page.goto(pathToFileURL(file).href);
      await page.evaluate(async () => {
        await globalThis.document.fonts.ready;
      });
      await page.emulateMedia({ media: "print" });
      const print = await page.evaluate(() => {
        const d = globalThis.document;
        const issues = [];
        for (const p of d.querySelectorAll(".page")) {
          const r = p.getBoundingClientRect();
          const footer = p.querySelector(".page-footer")?.getBoundingClientRect();
          for (const e of p.querySelectorAll(
            "p,h1,h2,h3,.toc-item,.source-note,.roadmap-card,.step-title,.step-desc",
          )) {
            const er = e.getBoundingClientRect();
            if (er.bottom > r.bottom - 12 || er.right > r.right - 10 || er.left < r.left + 10)
              issues.push({ page: p.id, class: e.className, issue: "page bounds" });
            if (footer && !e.closest(".page-footer,.page-header") && er.bottom > footer.top + 1)
              issues.push({ page: p.id, class: e.className, issue: "footer overlap" });
          }
        }
        return { count: d.querySelectorAll(".page").length, issues };
      });
      assert.deepEqual(print.issues, [], `${file}: print bounds`);
      await page.addScriptTag({ path: axePath });
      const scan = await page.evaluate(async () => {
        const result = await globalThis.axe.run(globalThis.document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
        });
        return result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
        }));
      });
      fs.writeFileSync(path.join(out, `${path.basename(file, ".html")}-axe.json`), JSON.stringify(scan, null, 2));
      assert.deepEqual(scan, [], `${file}: automated print/source accessibility`);
      const sizes = [];
      await page.emulateMedia({ media: "screen", reducedMotion: "reduce" });
      for (const width of [320, 390, 834, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        for (const size of [1, 2]) {
          await page.evaluate(
            (s) => globalThis.document.documentElement.style.setProperty("--book-size", String(s)),
            size,
          );
          const geometry = await page.evaluate(() => {
            const d = globalThis.document;
            const bad = [];
            for (const e of d.querySelectorAll(
              "main p,main h1,main h2,main h3,main a,main aside,main .step-title,main .step-desc",
            )) {
              const r = e.getBoundingClientRect();
              if (r.left < -1 || r.right > globalThis.innerWidth + 1 || e.scrollWidth > e.clientWidth + 2)
                bad.push({
                  class: e.className,
                  text: e.textContent.slice(0, 70),
                  left: r.left,
                  right: r.right,
                  scroll: e.scrollWidth,
                  client: e.clientWidth,
                });
            }
            return { width: globalThis.innerWidth, document: d.documentElement.scrollWidth, bad };
          });
          assert.equal(geometry.document, width, `${file}: ${width}px/${size * 100}% document overflow`);
          assert.deepEqual(geometry.bad, [], `${file}: ${width}px/${size * 100}% text bounds`);
          sizes.push({ width, size });
        }
      }
      // Test the actual text-size controls rather than only the CSS variable.
      await page.reload();
      await page.emulateMedia({ media: "screen" });
      await page.setViewportSize({ width: 390, height: 900 });
      const plus = page.getByRole("button", { name: "تكبير النص", exact: true });
      for (let i = 0; i < 4; i++) await plus.click();
      assert.equal(await page.locator(".reader-size-value").textContent(), "200%");
      assert.equal(await plus.isDisabled(), true);
      await page.getByRole("button", { name: "تصغير النص", exact: true }).click();
      assert.equal(await page.locator(".reader-size-value").textContent(), "175%");
      await page.locator(".book-toolbar a").first().click();
      assert.equal(await page.evaluate(() => globalThis.location.hash), book.startsWith("book3") ? "#p-134" : "#p-2");
      if (theme === "light") {
        await page.evaluate(() => globalThis.document.documentElement.style.setProperty("--book-size", "1"));
        await page
          .locator(".page")
          .nth(book.startsWith("book2") ? 3 : 5)
          .screenshot({ path: path.join(out, `${path.basename(file, ".html")}-phone.png`) });
      }
      report.push({
        edition: path.basename(file),
        printPages: print.count,
        accessibilityViolations: scan.length,
        screenCases: sizes.length,
        textControls: "pass",
        contents: "pass",
      });
      console.log(
        `PASS ${path.basename(file)}: ${print.count} print pages, ${sizes.length} responsive cases, axe, controls and contents`,
      );
    }
  }
} finally {
  await browser.close();
  const reportPath = path.join(out, "browser-verification.json");
  const previous = process.argv[2] && fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, "utf8")) : [];
  const retained = previous.filter((entry) => !report.some((result) => result.edition === entry.edition));
  fs.writeFileSync(reportPath, JSON.stringify([...retained, ...report], null, 2));
}
