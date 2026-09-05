import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Reports hand-written CSS classes that nothing references.
 *
 * Static rather than runtime coverage, deliberately. Coverage marks a rule
 * unused when its screen simply was not visited, so it cannot tell dead code
 * from a screen the run missed — and the screens most likely to be missed are
 * the ones whose CSS is most likely to have rotted. A class name that appears
 * in no source file is dead whatever any run did.
 *
 * Tailwind's utilities are not in scope: those are generated from usage and
 * already purged, and `check-css-utilities.mjs` guards that separately.
 *
 * A report, not a gate. Deleting CSS needs a person to check whether a class is
 * an intentional part of the stylesheet's API — `.ui-surface` is declared in
 * `@layer components` for call sites that do not exist yet, which is a
 * legitimate answer — so this prints and exits zero.
 */
const cssFiles = execSync('git ls-files "src/**/*.css"', { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const sourceFiles = execSync('git ls-files "src/**/*.ts" "src/**/*.tsx" "*.html"', { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

const sourceText = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");

/**
 * Strips `url(...)` payloads before scanning.
 *
 * Inline SVG data-URIs carry `http://www.w3.org/2000/svg`, and a naive scan
 * reads the `.org` in that namespace as a class selector — which is how the
 * first version of this report accused two stylesheets of an unused `.org`.
 */
function withoutUrlPayloads(css) {
  return css.replace(/url\((["']?)[\s\S]*?\1\)/g, "url()");
}

const cssText = cssFiles.map((file) => withoutUrlPayloads(readFileSync(file, "utf8"))).join("\n");
const declared = new Map();

for (const file of cssFiles) {
  const css = withoutUrlPayloads(readFileSync(file, "utf8"));
  for (const match of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    if (!declared.has(match[1])) declared.set(match[1], new Set());
    declared.get(match[1]).add(file);
  }
}

const unreferenced = [];
for (const [name, files] of declared) {
  const usedInSource = new RegExp(`[\\s"'\`.#\\[]${name}[\\s"'\`\\]:,.)]`).test(sourceText);
  // A class another rule composes with is in use even if no TSX names it.
  const timesInCss = (cssText.match(new RegExp(`\\.${name}\\b`, "g")) || []).length;
  if (!usedInSource && timesInCss <= files.size) unreferenced.push({ name, files: [...files] });
}

console.log(`Hand-written CSS: ${declared.size} classes declared, ${unreferenced.length} unreferenced.`);
for (const entry of unreferenced.sort((a, b) => a.files[0].localeCompare(b.files[0]))) {
  console.log(`  .${entry.name}  ←  ${entry.files.join(", ")}`);
}
