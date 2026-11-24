import { chromium } from "playwright";
import path from "node:path";
import fs from "node:fs";

async function verify() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  const snapDir = "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch";
  fs.mkdirSync(snapDir, { recursive: true });

  // 1. Book 1
  console.log("Loading Book 1...");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book1_al_mukhtar/al_mukhtar_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
  let pages = await page.$$(".page");

  // Page 4: User uploaded image with red squiggles (Intro)
  if (pages.length >= 4) {
    await pages[3].screenshot({ path: path.join(snapDir, "verify_book1_p4.png") });
    console.log("Saved verify_book1_p4.png");
  }

  // Page 5: Intro Part 2
  if (pages.length >= 5) {
    await pages[4].screenshot({ path: path.join(snapDir, "verify_book1_p5.png") });
    console.log("Saved verify_book1_p5.png");
  }

  // Page 6: User Image 1 (whitespace comment)
  if (pages.length >= 6) {
    await pages[5].screenshot({ path: path.join(snapDir, "verify_book1_p6.png") });
    console.log("Saved verify_book1_p6.png");
  }

  // Page 8: User Image 0 (truncation comment)
  if (pages.length >= 8) {
    await pages[7].screenshot({ path: path.join(snapDir, "verify_book1_p8.png") });
    console.log("Saved verify_book1_p8.png");
  }

  // Page 9: Chapter start with Ayat al-Kursi
  if (pages.length >= 9) {
    await pages[8].screenshot({ path: path.join(snapDir, "verify_book1_p9.png") });
    console.log("Saved verify_book1_p9.png");
  }

  // Page 10: 4 Hadiths
  if (pages.length >= 10) {
    await pages[9].screenshot({ path: path.join(snapDir, "verify_book1_p10.png") });
    console.log("Saved verify_book1_p10.png");
  }

  // Page 12: Previously overflowing (10 supplications)
  if (pages.length >= 12) {
    await pages[11].screenshot({ path: path.join(snapDir, "verify_book1_p12.png") });
    console.log("Saved verify_book1_p12.png");
  }

  // Page 14: Balanced 5 cards
  if (pages.length >= 14) {
    await pages[13].screenshot({ path: path.join(snapDir, "verify_book1_p14.png") });
    console.log("Saved verify_book1_p14.png");
  }

  // Page 20: 2 Roomy long supplications
  if (pages.length >= 20) {
    await pages[19].screenshot({ path: path.join(snapDir, "verify_book1_p20.png") });
    console.log("Saved verify_book1_p20.png");
  }

  // 2. Book 2
  console.log("Loading Book 2...");
  await page.goto(`file://${path.resolve(import.meta.dirname, "book2_dalil_al_mutamir/dalil_al_mutamir_light.html")}`, {
    waitUntil: "load",
  });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
  pages = await page.$$(".page");

  if (pages.length >= 8) {
    await pages[7].screenshot({ path: path.join(snapDir, "verify_book2_p8.png") });
    console.log("Saved verify_book2_p8.png");
  }
  if (pages.length >= 10) {
    await pages[9].screenshot({ path: path.join(snapDir, "verify_book2_p10.png") });
    console.log("Saved verify_book2_p10.png");
  }
  if (pages.length >= 12) {
    await pages[11].screenshot({ path: path.join(snapDir, "verify_book2_p12.png") });
    console.log("Saved verify_book2_p12.png");
  }
  if (pages.length >= 14) {
    await pages[13].screenshot({ path: path.join(snapDir, "verify_book2_p14.png") });
    console.log("Saved verify_book2_p14.png");
  }

  // 3. Book 3
  console.log("Loading Book 3...");
  await page.goto(
    `file://${path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    {
      waitUntil: "load",
    },
  );
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });
  pages = await page.$$(".page");

  if (pages.length >= 20) {
    await pages[19].screenshot({ path: path.join(snapDir, "verify_book3_p20.png") });
    console.log("Saved verify_book3_p20.png");
  }

  await browser.close();
  console.log("All verification snapshots captured successfully!");
}

verify().catch(console.error);
