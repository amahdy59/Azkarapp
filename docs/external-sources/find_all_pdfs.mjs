import fs from "node:fs";
import path from "node:path";

function findPdfs(dir, list = []) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules" && e.name !== "dist") {
        findPdfs(full, list);
      } else if (e.isFile() && e.name.toLowerCase().endsWith(".pdf")) {
        list.push(full);
      }
    }
  } catch {
    // Continue past unreadable folders when listing local reference documents.
  }
  return list;
}

console.log("All PDFs in workspace:");
console.log(findPdfs("."));
