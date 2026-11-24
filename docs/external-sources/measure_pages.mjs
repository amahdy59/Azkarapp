import { chromium } from "playwright";
import path from "node:path";

async function measure() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  // 1. Book 1
  console.log("\n=== MEASURING BOOK 1 (AL-MUKHTAR) ===");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book1_al_mukhtar/al_mukhtar_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b1Reports = await page.evaluate(() => {
    return Array.from(globalThis.document.querySelectorAll(".page"))
      .map((p, i) => {
        const flow = p.querySelector(".devotional-flow, .intro-page-container, .toc-grid");
        const footer = p.querySelector(".page-footer");
        if (!flow) return null;
        const isOverflowing = flow.scrollHeight > flow.clientHeight + 2;
        const overflowPx = flow.scrollHeight - flow.clientHeight;
        const lastChild = flow.lastElementChild;
        let emptySpacePx = 0;
        if (lastChild && footer) {
          emptySpacePx = footer.getBoundingClientRect().top - lastChild.getBoundingClientRect().bottom;
        }
        return { page: i + 1, isOverflowing, overflowPx, emptySpacePx };
      })
      .filter(Boolean);
  });

  console.log(
    "Book 1 Overflowing:",
    b1Reports.filter((r) => r.isOverflowing).map((r) => `p${r.page} (+${Math.round(r.overflowPx)}px)`),
  );
  console.log(
    "Book 1 Gaps > 150px:",
    b1Reports.filter((r) => r.emptySpacePx > 150).map((r) => `p${r.page} (${Math.round(r.emptySpacePx)}px)`),
  );

  // 2. Book 2
  console.log("\n=== MEASURING BOOK 2 (DALIL AL-MUTAMIR) ===");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book2_dalil_al_mutamir/dalil_al_mutamir_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b2Reports = await page.evaluate(() => {
    return Array.from(globalThis.document.querySelectorAll(".page")).map((p, i) => {
      const footer = p.querySelector(".page-footer");
      const isOverflowing = p.scrollHeight > p.clientHeight + 2;
      const overflowPx = p.scrollHeight - p.clientHeight;
      let emptySpacePx = 0;
      const contentParent = p.querySelector(".content-flow") || p.querySelector("div[style*='flex:1']");
      const lastChild = contentParent?.lastElementChild;
      if (lastChild && footer) {
        emptySpacePx = footer.getBoundingClientRect().top - lastChild.getBoundingClientRect().bottom;
      }
      return { page: i + 1, isOverflowing, overflowPx, emptySpacePx };
    });
  });

  console.log(
    "Book 2 Overflowing:",
    b2Reports.filter((r) => r.isOverflowing).map((r) => `p${r.page} (+${Math.round(r.overflowPx)}px)`),
  );
  console.log(
    "Book 2 Gaps > 150px:",
    b2Reports.filter((r) => r.emptySpacePx > 150).map((r) => `p${r.page} (${Math.round(r.emptySpacePx)}px)`),
  );

  // 3. Book 3
  console.log("\n=== MEASURING BOOK 3 (AL-WIRD AN-NABAWI) ===");
  await page.goto(
    `file://${path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    { waitUntil: "load" },
  );
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b3Reports = await page.evaluate(() => {
    return Array.from(globalThis.document.querySelectorAll(".page"))
      .map((p, i) => {
        const body = p.querySelector(".devotional-body");
        if (!body) return null;
        const isOverflowing = body.scrollHeight > body.clientHeight + 2;
        const overflowPx = body.scrollHeight - body.clientHeight;
        const lastChild = body.lastElementChild;
        const footer = p.querySelector(".page-footer");
        let emptySpacePx = 0;
        if (lastChild && footer) {
          emptySpacePx = footer.getBoundingClientRect().top - lastChild.getBoundingClientRect().bottom;
        }
        return { page: i + 1, isOverflowing, overflowPx, emptySpacePx };
      })
      .filter(Boolean);
  });

  console.log(
    "Book 3 Overflowing:",
    b3Reports.filter((r) => r.isOverflowing).map((r) => `p${r.page} (+${Math.round(r.overflowPx)}px)`),
  );
  console.log(
    "Book 3 Gaps > 150px:",
    b3Reports.filter((r) => r.emptySpacePx > 150).map((r) => `p${r.page} (${Math.round(r.emptySpacePx)}px)`),
  );

  await browser.close();
}

measure().catch(console.error);
