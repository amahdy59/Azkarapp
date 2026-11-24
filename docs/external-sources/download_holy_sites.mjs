import fs from "node:fs";
import path from "node:path";
import { Buffer } from "node:buffer";

const dir = "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/scratch/holy_sites";
fs.mkdirSync(dir, { recursive: true });

async function download(url, filename) {
  console.log(`Downloading ${filename} from ${url}...`);
  try {
    const res = await globalThis.fetch(url, {
      headers: {
        "User-Agent": "AzkarappDevotionalBot/1.0 (devotional educational open source; contact@example.com)",
      },
    });
    if (!res.ok) {
      console.error(`Failed: ${res.status} ${res.statusText}`);
      return false;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const outPath = path.join(dir, filename);
    fs.writeFileSync(outPath, buf);
    console.log(`Saved ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    return true;
  } catch (err) {
    console.error(`Error downloading ${filename}:`, err.message);
    return false;
  }
}

async function main() {
  // 1. Safa and Marwa (Masa'a)
  await download(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Sa%27y_between_Safa_and_Marwa_01.jpg/1024px-Sa%27y_between_Safa_and_Marwa_01.jpg",
    "safa_marwa.jpg",
  );

  // 2. The Green Dome / Rawdah at Prophet's Mosque
  await download(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/The_Green_Dome%2C_Masjid_Nabawi%2C_Madina.jpg/1024px-The_Green_Dome%2C_Masjid_Nabawi%2C_Madina.jpg",
    "madinah_rawdah.jpg",
  );

  // 3. Quba Mosque
  await download(
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Masjid_Quba_Mosque.jpg/1024px-Masjid_Quba_Mosque.jpg",
    "quba_mosque.jpg",
  );
}

main().catch(console.error);
