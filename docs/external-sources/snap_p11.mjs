import { chromium } from "playwright";
import path from "node:path";

async function snapP11() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 1130 } });

  await page.goto(
    `file://${path.resolve("docs/external-sources/book3_al_wird_an_nabawi/al_wird_an_nabawi_light.html")}`,
    { waitUntil: "load" },
  );
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
  });

  const pages = await page.$$(".page");
  if (pages.length >= 11) {
    const snapPath =
      "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/verify_book3_p11_clean.png";
    await pages[10].screenshot({ path: snapPath });
    console.log("Saved verify_book3_p11_clean.png");
  }

  // Also snapshot Page 35 (Ayat al-Kursi) to verify Quranic text in devotional body
  if (pages.length >= 35) {
    const snapPath35 =
      "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/verify_book3_p35_kursi.png";
    await pages[34].screenshot({ path: snapPath35 });
    console.log("Saved verify_book3_p35_kursi.png");
  }

  await browser.close();
}

snapP11().catch(console.error);
