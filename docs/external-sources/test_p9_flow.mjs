import fs from "node:fs";

const pages = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8"));
const p9 = pages.find((p) => p.page === 9);

// Let's run formatLuxuryFlow logic on p9
const lines = p9.lines;
const chapter = p9.chapter;
const entries = [];
let current = null;

for (let i = 0; i < lines.length; i++) {
  let l = lines[i].trim();
  if (
    !l ||
    l === "." ||
    l === ".»" ||
    l === "»" ||
    l === "«" ||
    l === chapter ||
    l === `سؤال ${chapter}` ||
    l.startsWith("الترغيب في ") ||
    l.startsWith("من آداب ") ||
    l.startsWith("الفهرس")
  )
    continue;

  const startNumMatch = l.match(/^[(«]?\s*([٠-٩\d]+)\s*[)».-]/);
  const endNumMatch = l.match(/[«(]\s*([٠-٩\d]+)\s*$/);

  if (startNumMatch) {
    if (current) entries.push(current);
    const num = startNumMatch[1];
    const text = l.replace(startNumMatch[0], "").trim();
    current = { num, lines: [text] };
  } else if (endNumMatch) {
    if (current) entries.push(current);
    const num = endNumMatch[1];
    const text = l.replace(endNumMatch[0], "").trim();
    current = { num, lines: [text] };
  } else {
    if (current) current.lines.push(l);
    else current = { num: "", lines: [l] };
  }
}
if (current) entries.push(current);

console.log("Entries count:", entries.length);
entries.forEach((e, idx) => console.log(idx + ": num=" + e.num + " text=" + e.lines.join(" ").slice(0, 60)));
