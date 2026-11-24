import fs from "node:fs";
import path from "node:path";

function searchDir(dir, query) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.includes("node_modules") && !entry.name.includes(".git")) {
        searchDir(fullPath, query);
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".md") ||
        entry.name.endsWith(".json") ||
        entry.name.endsWith(".mjs") ||
        entry.name.endsWith(".html") ||
        entry.name.endsWith(".txt"))
    ) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (content.includes(query)) {
        console.log("Found in:", fullPath);
        const idx = content.indexOf(query);
        console.log(content.slice(Math.max(0, idx - 80), Math.min(content.length, idx + 200)));
      }
    }
  }
}

console.log("Searching for 'المجادلة'...");
searchDir("docs/external-sources", "المجادلة");

console.log("\nSearching for 'الذكر فقال'...");
searchDir("docs/external-sources", "الذكر فقال");

console.log("\nSearching for 'بج بح بخ'...");
searchDir("docs/external-sources", "بج بح بخ");
