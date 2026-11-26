import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox, webkit } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { EDITION_OUTPUT, EDITION_FILES, resolveEnglishEdition } from "./english-book-editions.mjs";

const editions = await Promise.all(EDITION_FILES.map(resolveEnglishEdition));
const evidence = path.join(EDITION_OUTPUT, "evidence");
await fs.mkdir(evidence, { recursive: true });
const results = [],
  interactions = [],
  indexResults = [];
const fileUrl = (edition) => pathToFileURL(path.join(EDITION_OUTPUT, `${edition.id}-english.html`)).href;
const check = (value, message) => {
  if (!value) throw new Error(message);
};
async function scan(page, label) {
  const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  check(!result.violations.length, JSON.stringify({ label, violations: result.violations }));
}
async function dismissOptions(page) {
  await page.keyboard.press("Escape");
  // Native dialog close events are asynchronous in WebKit. Assert the final focus state.
  await page.waitForFunction(() => {
    const opener = globalThis.document.querySelector('[data-open-dialog="options-dialog"]');
    return (
      !globalThis.document.querySelector("#options-dialog").open &&
      opener.getAttribute("aria-expanded") === "false" &&
      globalThis.document.activeElement === opener
    );
  });
}
async function geometry(page, dialog = false) {
  const result = await page.evaluate((dialog) => {
    const doc = globalThis.document;
    const root = dialog ? doc.querySelector("dialog[open]") : doc.querySelector("main");
    const targets = dialog
      ? [...root.querySelectorAll("button,label,.reader-tool-link")]
      : [...doc.querySelectorAll(".reader-tools button")];
    const tooSmall = targets
      .filter((node) => {
        const box = node.getBoundingClientRect();
        return box.width < 43.9 || box.height < 43.9;
      })
      .map((node) => node.textContent);
    const overflow = [
      ...root.querySelectorAll(
        dialog ? ".dialog-body,.size-controls,fieldset" : ".quran-pair,.edition-unit,.teaching-diagram",
      ),
    ]
      .filter((node) => node.scrollWidth > node.clientWidth + 1)
      .map((node) => node.className);
    const bounds = root.getBoundingClientRect();
    return {
      tooSmall,
      overflow,
      documentOverflow: doc.documentElement.scrollWidth > globalThis.innerWidth + 1,
      bounded:
        !dialog ||
        (bounds.top >= 0 &&
          bounds.left >= 0 &&
          bounds.bottom <= globalThis.innerHeight + 1 &&
          bounds.right <= globalThis.innerWidth + 1),
      covered:
        dialog &&
        !root.contains(
          doc.elementFromPoint(bounds.left + bounds.width / 2, Math.min(bounds.bottom - 10, bounds.top + 40)),
        ),
      surface: dialog ? globalThis.getComputedStyle(root).backgroundColor : null,
    };
  }, dialog);
  check(
    !result.tooSmall.length && !result.overflow.length && !result.documentOverflow && result.bounded && !result.covered,
    JSON.stringify(result),
  );
  if (dialog) check(result.surface !== "transparent" && !result.surface.endsWith(", 0)"), "Transparent dialog surface");
}
for (const [engine, launcher] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await launcher.launch();
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    for (const edition of process.argv.includes("--index-only") ? [] : editions) {
      const contentsTarget = edition.pages
        .find((unit) => unit.sourcePage === edition.presentation.contentsSourcePage)
        .blocks.find((block) => block.type === "contents").entries[0][0];
      const diagrams = edition.pages.flatMap((unit) => unit.blocks.filter((block) => block.type === "diagram"));
      await page.goto(fileUrl(edition));
      await page.evaluate(async () => globalThis.document.fonts.ready);
      for (const width of [320, 768, 1280]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate((width) => {
          globalThis.document.documentElement.style.fontSize = width === 320 ? "200%" : "100%";
        }, width);
        for (const appearance of ["light", "dark", "navy"]) {
          await page.getByRole("button", { name: "Reading options", exact: true }).click();
          await page.getByRole("radio", { name: appearance, exact: false }).check();
          await geometry(page, true);
          await scan(page, `${engine}/${width}/${appearance}/options`);
          check(
            (await page.locator("#pdf-link").getAttribute("href")).endsWith(`-${appearance}.pdf`),
            "PDF appearance mismatch",
          );
          if (engine === "chromium" && width === 320 && appearance === "navy")
            await page.screenshot({ path: path.join(evidence, "reading-options-320-200-navy.png") });
          await dismissOptions(page);
          await geometry(page);
          await scan(page, `${engine}/${width}/${appearance}/reader`);
          results.push({
            engine,
            id: edition.id,
            width,
            textPercent: width === 320 ? 200 : 100,
            theme: appearance,
            axeViolations: 0,
            horizontalOverflow: false,
            targets44: true,
            opaqueDialog: true,
          });
          if (
            engine === "chromium" &&
            ((width === 1280 && appearance === "light") || (width === 320 && appearance === "navy"))
          )
            await page.screenshot({ path: path.join(evidence, `${edition.id}-${width}-${appearance}.png`) });
        }
      }
      await page.setViewportSize({ width: 320, height: 900 });
      await page.evaluate(() => {
        globalThis.document.documentElement.style.fontSize = "200%";
      });
      await page.getByRole("button", { name: "Contents", exact: true }).click();
      await geometry(page, true);
      await scan(page, `${engine}/contents`);
      await page.locator(`#contents-dialog a[href="#p-${contentsTarget}"]`).click();
      check((await page.locator(":focus").getAttribute("id")) === `p-${contentsTarget}`, "Contents destination focus");
      check(
        await page
          .locator(`#p-${contentsTarget} > h2`)
          .evaluate(
            (heading) =>
              heading.getBoundingClientRect().top >=
              globalThis.document.querySelector(".reader-tools").getBoundingClientRect().bottom,
          ),
        "Heading obscured by toolbar",
      );
      await page.getByRole("button", { name: "Reading options", exact: true }).click();
      for (let index = 0; index < 12; index++) {
        await page.keyboard.press("Tab");
        await page.waitForFunction(() => {
          const node = globalThis.document.activeElement;
          const dialog = node.closest("dialog[open]");
          if (!dialog) return false;
          const header = dialog.querySelector(".dialog-heading");
          const bounds = node.getBoundingClientRect();
          return (
            bounds.bottom <= dialog.getBoundingClientRect().bottom + 1 &&
            (header.contains(node) || bounds.top >= header.getBoundingClientRect().bottom - 1)
          );
        });
      }
      await page.getByRole("button", { name: "Increase reading text size" }).click();
      check((await page.locator("#size-value").textContent()) === "125%", "Text enlargement failed");
      await page.getByRole("radio", { name: "Dark", exact: true }).check();
      await dismissOptions(page);
      await page.reload();
      check(
        (await page.locator('input[name="theme"]:checked').inputValue()) === "dark" &&
          (await page.locator("#size-value").textContent()) === "125%",
        "Preferences were not restored",
      );
      await page.getByRole("button", { name: "Reading options", exact: true }).click();
      await page.getByRole("button", { name: "Decrease reading text size" }).click();
      await dismissOptions(page);
      await page.setViewportSize({ width: 1280, height: 900 });
      const characterCount = await page.evaluate(() => {
        const node = [...globalThis.document.querySelectorAll(".edition-unit p")].find(
          (element) => element.textContent.length > 300 && element.childNodes.length === 1,
        );
        const first = node.firstChild;
        let count = 0,
          top;
        for (let index = 0; index < Math.min(160, first.length); index++) {
          const range = globalThis.document.createRange();
          range.setStart(first, index);
          range.setEnd(first, index + 1);
          const y = Math.round(range.getBoundingClientRect().top);
          if (top !== undefined && y !== top) break;
          top = y;
          count++;
        }
        return count;
      });
      check(characterCount <= 80, `Prose line too long: ${characterCount}`);
      if (engine === "chromium")
        for (const diagram of diagrams) {
          await page.locator(`[data-diagram="${diagram.kind}"]`).scrollIntoViewIfNeeded();
          await page.screenshot({ path: path.join(evidence, `${diagram.kind}-diagram-desktop.png`) });
        }
      await page.setViewportSize({ width: 320, height: 900 });
      await page.addStyleTag({
        content:
          'p{margin-block-end:2em!important}body *{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}[lang="ar"]{letter-spacing:normal!important}',
      });
      await geometry(page);
      const before = await page
        .locator(".teaching-diagram svg")
        .evaluateAll((nodes) => nodes.map((node) => node.innerHTML));
      await page.evaluate(() => {
        globalThis.document.documentElement.dir = "rtl";
      });
      check(
        await page
          .locator(".teaching-diagram svg")
          .evaluateAll((nodes) =>
            nodes.every(
              (svg) =>
                globalThis.getComputedStyle(svg).transform === "none" &&
                globalThis.getComputedStyle(svg).direction === "ltr",
            ),
          ),
        "Diagram mirrored in RTL",
      );
      check(
        JSON.stringify(
          await page.locator(".teaching-diagram svg").evaluateAll((nodes) => nodes.map((node) => node.innerHTML)),
        ) === JSON.stringify(before),
        "Diagram geometry changed",
      );
      await page.evaluate(() => {
        globalThis.document.documentElement.dir = "ltr";
      });
      await page.emulateMedia({ forcedColors: "active" });
      await geometry(page);
      await page.getByRole("button", { name: "Reading options", exact: true }).click();
      await geometry(page, true);
      await dismissOptions(page);
      await page.emulateMedia({ forcedColors: "none" });
      const keyboardPage = await context.newPage();
      await keyboardPage.goto(fileUrl(edition));
      await keyboardPage.keyboard.press("Tab");
      check(
        (await keyboardPage.locator(":focus").textContent()) === "Skip to reading",
        "Keyboard skip link unavailable",
      );
      await keyboardPage.keyboard.press("Enter");
      check((await keyboardPage.locator(":focus").getAttribute("id")) === "reading", "Skip link focus failed");
      await keyboardPage.close();
      const deniedContext = await browser.newContext();
      await deniedContext.addInitScript(() => {
        Object.defineProperty(globalThis, "localStorage", {
          get() {
            throw new globalThis.DOMException("denied", "SecurityError");
          },
        });
      });
      const deniedPage = await deniedContext.newPage();
      await deniedPage.goto(fileUrl(edition));
      await deniedPage.getByRole("button", { name: "Reading options", exact: true }).click();
      await deniedPage.getByRole("button", { name: "Increase reading text size" }).click();
      check(
        (await deniedPage.locator("#preference-status").textContent()).includes("unavailable"),
        "Storage denial not announced",
      );
      check((await deniedPage.locator("#size-value").textContent()) === "125%", "Storage denial blocked reading size");
      await deniedContext.close();
      interactions.push({
        engine,
        id: edition.id,
        keyboard: true,
        focusRecovery: true,
        noFocusObscured: true,
        preferenceReload: true,
        deniedStorage: true,
        textSpacing: true,
        forcedColors: true,
        fixedDiagramDirection: true,
        proseFirstLineCharacters: characterCount,
      });
      console.log(`${engine}/${edition.id}: 9 reader/options cases and accessibility journeys passed`);
    }
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(pathToFileURL(path.join(EDITION_OUTPUT, "index.html")).href);
    await page.evaluate(() => {
      globalThis.document.documentElement.style.fontSize = "200%";
    });
    await scan(page, `${engine}/review-index`);
    const links = await page.locator("a[href]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    for (const link of links) await fs.access(path.join(EDITION_OUTPUT, link));
    check(
      await page.evaluate(() => globalThis.document.documentElement.scrollWidth <= globalThis.innerWidth + 1),
      "Review index overflow",
    );
    indexResults.push({
      engine,
      width: 320,
      textPercent: 200,
      links: links.length,
      axeViolations: 0,
      horizontalOverflow: false,
    });
    if (engine === "chromium")
      await page.screenshot({ path: path.join(evidence, "review-index-320-200.png"), fullPage: true });
  } finally {
    await browser.close();
  }
}
if (results.length) {
  await fs.writeFile(path.join(evidence, "browser-verification.json"), JSON.stringify(results, null, 2) + "\n");
  await fs.writeFile(
    path.join(evidence, "reader-interaction-verification.json"),
    JSON.stringify(interactions, null, 2) + "\n",
  );
}
await fs.writeFile(path.join(evidence, "review-index-verification.json"), JSON.stringify(indexResults, null, 2) + "\n");
console.log(
  `${results.length} reader cases, ${interactions.length} interaction journeys and ${indexResults.length} enlarged index cases passed.`,
);
