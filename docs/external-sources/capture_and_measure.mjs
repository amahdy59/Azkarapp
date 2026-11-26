import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  const snapDir = "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch";
  fs.mkdirSync(snapDir, { recursive: true });

  console.log("\n==========================================");
  console.log("1. MEASURING & VERIFYING BOOK 1 (AL-MUKHTAR)");
  console.log("==========================================");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book1_al_mukhtar/al_mukhtar_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b1Pages = await page.$$(".page");
  console.log(`Total Pages in Book 1: ${b1Pages.length}`);

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

  const b1Overflow = b1Reports.filter((r) => r.isOverflowing);
  const b1Gaps = b1Reports.filter((r) => r.emptySpacePx > 150);
  console.log("Book 1 Overflowing Pages:", b1Overflow.length === 0 ? "ZERO (0px overflow)" : b1Overflow);
  console.log("Book 1 Gaps > 150px:", b1Gaps.length === 0 ? "ZERO excessive gaps" : b1Gaps);

  // Snapshots for Book 1
  await b1Pages[1].screenshot({ path: path.join(snapDir, "verify_b1_p2_toc.png") }); // Page 2 TOC
  await b1Pages[5].screenshot({ path: path.join(snapDir, "verify_b1_p6_virtues.png") }); // Page 6 Repetitions & Virtues
  await b1Pages[13].screenshot({ path: path.join(snapDir, "verify_b1_p14_balanced.png") }); // Page 14 Balanced

  console.log("\n==========================================");
  console.log("2. MEASURING & VERIFYING BOOK 2 (DALIL AL-MUTAMIR)");
  console.log("==========================================");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book2_dalil_al_mutamir/dalil_al_mutamir_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b2Pages = await page.$$(".page");
  console.log(`Total Pages in Book 2: ${b2Pages.length}`);

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

  const b2Overflow = b2Reports.filter((r) => r.isOverflowing);
  const b2Gaps = b2Reports.filter((r) => r.emptySpacePx > 150);
  console.log("Book 2 Overflowing Pages:", b2Overflow.length === 0 ? "ZERO (0px overflow)" : b2Overflow);
  console.log("Book 2 Gaps > 150px:", b2Gaps.length === 0 ? "ZERO excessive gaps" : b2Gaps);

  // Snapshots for Book 2
  await b2Pages[1].screenshot({ path: path.join(snapDir, "verify_b2_p2_toc.png") }); // Page 2 TOC
  await b2Pages[2].screenshot({ path: path.join(snapDir, "verify_b2_p3_roadmap.png") }); // Page 3 Visual Roadmap
  await b2Pages[9].screenshot({ path: path.join(snapDir, "verify_b2_p10_mistakes.png") }); // Page 10 Mistakes & Corrections
  await b2Pages[11].screenshot({ path: path.join(snapDir, "verify_b2_p12_prophet_visit.png") }); // Page 12 Holy Visit

  console.log("\n==========================================");
  console.log("3. MEASURING & VERIFYING BOOK 3 (AL-WIRD AN-NABAWI)");
  console.log("==========================================");
  await page.goto(
    `file://${path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    { waitUntil: "load" },
  );
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const b3Pages = await page.$$(".page");
  console.log(`Total Pages in Book 3: ${b3Pages.length}`);

  const b3Reports = await page.evaluate(() => {
    return Array.from(globalThis.document.querySelectorAll(".page"))
      .map((p, i) => {
        const body = p.querySelector(".devotional-body, .toc-container");
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

  const b3Overflow = b3Reports.filter((r) => r.isOverflowing);
  const b3Gaps = b3Reports.filter((r) => r.emptySpacePx > 150);
  console.log("Book 3 Overflowing Pages:", b3Overflow.length === 0 ? "ZERO (0px overflow)" : b3Overflow);
  console.log("Book 3 Gaps > 150px:", b3Gaps.length === 0 ? "ZERO excessive gaps" : b3Gaps);

  // Snapshots for Book 3
  await b3Pages[10].screenshot({ path: path.join(snapDir, "verify_b3_p11_clean_quran.png") }); // Page 11 (Previously corrupt font glyphs)
  await b3Pages[20].screenshot({ path: path.join(snapDir, "verify_b3_p21_badges_virtues.png") }); // Page 21 Repetitions & Virtues
  await b3Pages[133].screenshot({ path: path.join(snapDir, "verify_b3_p134_interactive_toc.png") }); // Page 134 Dedicated Interactive TOC

  await browser.close();
  console.log("\nAll measurements and verification snapshots completed successfully!");
}

main().catch(console.error);
