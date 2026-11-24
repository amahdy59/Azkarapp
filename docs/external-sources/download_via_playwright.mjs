import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const dir = "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/holy_sites";
fs.mkdirSync(dir, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Safa and Marwa (Masa'a) from Wikimedia Commons
  const urls = {
    "safa_marwa.jpg": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Sa%27y_between_Safa_and_Marwa_01.jpg",
    "quba_mosque.jpg": "https://upload.wikimedia.org/wikipedia/commons/a/af/Masjid_Quba_Mosque.jpg",
  };

  for (const [name, url] of Object.entries(urls)) {
    try {
      console.log(`Fetching ${name}...`);
      const res = await page.goto(url, { waitUntil: "load" });
      if (res.ok()) {
        const buf = await res.body();
        fs.writeFileSync(path.join(dir, name), buf);
        console.log(`Successfully saved ${name} (${(buf.length / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`Failed ${name}: ${res.status()}`);
      }
    } catch (e) {
      console.error(`Error ${name}:`, e.message);
    }
  }

  await browser.close();
}

run().catch(console.error);
