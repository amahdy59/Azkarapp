import { chromium } from "playwright";
import path from "node:path";

async function inspectB1() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.resolve("docs/external-sources/book1_al_mukhtar/al_mukhtar_light.html")}`, {
    waitUntil: "load",
  });

  const info = await page.evaluate(() => {
    return [4, 5, 7, 10, 20].map((pageNum) => {
      const p = globalThis.document.querySelectorAll(".page")[pageNum - 1];
      if (!p) return null;
      const flow = p.querySelector(".devotional-flow, .intro-page-container");
      const cards = p.querySelectorAll(".dua-card, .intro-card-luxury");
      const footer = p.querySelector(".page-footer");
      const flowRect = flow?.getBoundingClientRect();
      const footerRect = footer?.getBoundingClientRect();
      const lastCardRect = cards[cards.length - 1]?.getBoundingClientRect();

      return {
        page: pageNum,
        flowClass: flow?.className,
        cardCount: cards.length,
        flowHeight: flowRect?.height,
        lastCardBottom: lastCardRect?.bottom,
        footerTop: footerRect?.top,
        gapPx: footerRect && lastCardRect ? footerRect.top - lastCardRect.bottom : 0,
        cardHeights: Array.from(cards).map((c) => Math.round(c.getBoundingClientRect().height)),
      };
    });
  });

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

inspectB1().catch(console.error);
