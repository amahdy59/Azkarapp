import { chromium } from "playwright";
import path from "node:path";

async function snap() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  const htmlPath = path.resolve(import.meta.dirname, "book1_al_mukhtar/al_mukhtar_light.html");
  await page.goto(`file://${htmlPath}`, { waitUntil: "load" });
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const pages = await page.$$(".page");
  console.log("Total pages loaded in DOM:", pages.length);
  if (pages.length >= 14) {
    const page14 = pages[13]; // 0-indexed: page 14
    const snapPath = path.resolve(
      "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/book1_p14_revised.png",
    );
    await page14.screenshot({ path: snapPath });
    console.log("Screenshot saved:", snapPath);
  }
  await browser.close();
}

snap().catch(console.error);
