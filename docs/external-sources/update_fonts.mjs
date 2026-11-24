import fs from "node:fs";
import path from "node:path";

const fontsJsonPath = path.resolve("docs/external-sources/fonts_base64.json");
const fonts = JSON.parse(fs.readFileSync(fontsJsonPath, "utf-8"));

const fontFilesDir = path.resolve("node_modules/@fontsource/ibm-plex-sans-arabic/files");

function getBase64(filename) {
  const p = path.join(fontFilesDir, filename);
  return fs.readFileSync(p).toString("base64");
}

fonts.plex500 = getBase64("ibm-plex-sans-arabic-arabic-500-normal.woff2");
fonts.plex600 = getBase64("ibm-plex-sans-arabic-arabic-600-normal.woff2");

fs.writeFileSync(fontsJsonPath, JSON.stringify(fonts), "utf-8");
console.log("Updated fonts_base64.json with plex500 and plex600! Total keys:", Object.keys(fonts));
