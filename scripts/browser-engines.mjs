import path from "node:path";
import { fileURLToPath } from "node:url";

const engines = {
  "desktop-chromium": "chromium",
  "mobile-chromium": "chromium",
  "tablet-chromium": "chromium",
  "desktop-firefox-smoke": "firefox",
  "mobile-webkit-smoke": "webkit",
};

/** Install every runtime a selected project needs, without unrelated engines. */
export function browserEngines(projects = "") {
  if (!projects) return ["chromium", "firefox", "webkit"];
  return [
    ...new Set(
      projects.split(",").map((project) => {
        if (!Object.hasOwn(engines, project)) throw new Error(`Unknown browser project: ${project}`);
        return engines[project];
      }),
    ),
  ];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    console.log(browserEngines(process.argv[2]).join(" "));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
