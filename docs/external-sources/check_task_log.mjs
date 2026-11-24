import fs from "node:fs";

// Check if original PDF files exist in the project or nearby
const taskLog = fs.readFileSync(
  "C:/Users/AhmedMahdy/.gemini/antigravity/brain/4b1887b6-cfd7-403d-a007-472c7efd6742/.system_generated/tasks/task-1717.log",
  "utf8",
);
console.log(taskLog);
