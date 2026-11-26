import fs from "node:fs";

const pagesData = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf-8"));

const repetitions = new Set();
const virtues = [];

const repRegex =
  /(ثَلَاثَ مَرَّاتٍ|ثَلَاثًا|عَشْرَ مَرَّاتٍ|عَشْرًا|مِائَةَ مَرَّةٍ|مِائَةً|سَبْعَ مَرَّاتٍ|سَبْعًا|أَرْبَعَ مَرَّاتٍ|مَرَّتَيْنِ)/g;

for (const p of pagesData) {
  if (p.page >= 17 && p.page <= 132) {
    const text = (p.lines || []).join(" ");
    const matches = text.match(repRegex);
    if (matches) {
      matches.forEach((m) => repetitions.add(m));
    }
    if (
      text.includes("مَنْ قَالَ") ||
      text.includes("فَضْل") ||
      text.includes("غُفِرَتْ") ||
      text.includes("كَانَتْ لَهُ عِدْلَ") ||
      text.includes("حُرِّمَ")
    ) {
      virtues.push({ page: p.page, text: text.slice(0, 100) });
    }
  }
}

console.log("Found repetition patterns:", Array.from(repetitions));
console.log("Found virtue pages:", virtues.length, "pages");
console.log("Sample virtue pages:", virtues.slice(0, 5));
