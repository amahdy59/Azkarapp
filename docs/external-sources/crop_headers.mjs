import { chromium } from "playwright";
import path from "node:path";

async function cropHeader() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  await page.goto(`file://${path.resolve(import.meta.dirname, "book2_dalil_al_mutamir/dalil_al_mutamir_light.html")}`, {
    waitUntil: "load",
  });

  const header = await page.$("#p-3 .page-header");
  await header.screenshot({
    path: "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/crop_b2_p3_header.png",
  });

  await page.goto(
    `file://${path.resolve(import.meta.dirname, "book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    { waitUntil: "load" },
  );

  const headerB3 = await page.$("#p-21 .page-header");
  await headerB3.screenshot({
    path: "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/crop_b3_p21_header.png",
  });

  await browser.close();
}

cropHeader().catch(console.error);
