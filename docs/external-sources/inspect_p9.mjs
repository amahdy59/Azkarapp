import { chromium } from "playwright";
import path from "node:path";

async function checkP9() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`file://${path.resolve("docs/external-sources/book1_al_mukhtar/al_mukhtar_light.html")}`, {
    waitUntil: "load",
  });

  const info = await page.evaluate(() => {
    const p = globalThis.document.querySelectorAll(".page")[8]; // page 9
    const flow = p.querySelector(".devotional-flow");
    const cards = p.querySelectorAll(".dua-card");
    const footer = p.querySelector(".page-footer");
    return {
      flowClass: flow.className,
      cardCount: cards.length,
      cardHeights: Array.from(cards).map((c) => Math.round(c.getBoundingClientRect().height)),
      gap: footer.getBoundingClientRect().top - cards[cards.length - 1].getBoundingClientRect().bottom,
    };
  });

  console.log(info);
  await browser.close();
}

checkP9().catch(console.error);
