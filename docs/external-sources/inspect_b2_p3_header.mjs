import { chromium } from "playwright";
import path from "node:path";

async function inspectB2P3() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  await page.goto(`file://${path.resolve(import.meta.dirname, "book2_dalil_al_mutamir/dalil_al_mutamir_light.html")}`, {
    waitUntil: "load",
  });

  const res = await page.evaluate(() => {
    const p3 = globalThis.document.querySelector("#p-3");
    const a = p3.querySelector(".header-chapter");
    return {
      tagName: a.tagName,
      className: a.className,
      style: a.getAttribute("style"),
      computedTextDecoration: globalThis.window.getComputedStyle(a).textDecoration,
      computedTextDecorationLine: globalThis.window.getComputedStyle(a).textDecorationLine,
      html: a.outerHTML,
    };
  });

  console.log(JSON.stringify(res, null, 2));
  await browser.close();
}

inspectB2P3().catch(console.error);
