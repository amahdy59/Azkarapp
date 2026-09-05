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
 * Tests are scanned separately from the app, because the two answers differ.
 * `.reduce-transparency` was declared here, asserted by an e2e test, and set by
 * no app code: dead in the product but load-bearing for the suite. In one
 * bucket it reads as "safe to delete", and deleting it turned the suite red.
 * Split out, it reads as what it was — a half-built setting whose CSS shipped
 * ahead of the control that turns it on.
 *
 * A report, not a gate. Deleting CSS needs a person to check whether a class is
 * an intentional part of the stylesheet's API — `.ui-surface` is declared in
 * `@layer components` for call sites that do not exist yet, which is a
 * legitimate answer — so this prints and exits zero.
 */
const cssFiles = execSync('git ls-files "src/**/*.css"', { encoding: "utf8" }).trim().split("\n").filter(Boolean);
// Pathspecs, not globs: git's `*` already spans `/`, so a `**/` segment
// demands a subdirectory and quietly skips whatever sits at the root of the
// directory — which is every e2e spec. Naming the directories matches both.
const allSources = execSync('git ls-files "src" "e2e" "*.html"', { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter((file) => /\.(ts|tsx|html)$/.test(file));

const isTest = (file) => file.startsWith("e2e/") || /\.test\.tsx?$/.test(file);
const read = (files) => files.map((file) => readFileSync(file, "utf8")).join("\n");
const sourceText = read(allSources.filter((file) => !isTest(file)));
const testText = read(allSources.filter(isTest));

/**
 * Strips what looks like a selector but is not one.
 *
 * `url(...)` payloads: inline SVG data-URIs carry `http://www.w3.org/2000/svg`,
 * and a naive scan reads the `.org` in that namespace as a class selector —
 * which is how the first version of this report accused two stylesheets of an
 * unused `.org`.
 *
 * Comments: a rule counted once but named twice — once in a selector, once in
 * the comment above it explaining what it is for — reads as a class two rules
 * compose with, and gets treated as in use. Prose about a class is not a use
 * of it.
 */
function withoutNonSelectors(css) {
  return css.replace(/url\((["']?)[\s\S]*?\1\)/g, "url()").replace(/\/\*[\s\S]*?\*\//g, "");
}

const cssText = cssFiles.map((file) => withoutNonSelectors(readFileSync(file, "utf8"))).join("\n");
const declared = new Map();

for (const file of cssFiles) {
  const css = withoutNonSelectors(readFileSync(file, "utf8"));
  for (const match of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    if (!declared.has(match[1])) declared.set(match[1], new Set());
    declared.get(match[1]).add(file);
  }
}

/**
 * Every identifier-shaped token in a body of source.
 *
 * A class counts as mentioned when it appears as a whole token: in a
 * `className`, a querySelector string, a classList call. Tokenising once beats
 * building a delimiter regex per class — the same answer in one pass, and no
 * escaping to get wrong.
 */
const tokenise = (text) => new Set(text.match(/[A-Za-z_][\w-]*/g) || []);
const sourceTokens = tokenise(sourceText);
const testTokens = tokenise(testText);

const timesInCss = new Map();
for (const match of cssText.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
  timesInCss.set(match[1], (timesInCss.get(match[1]) || 0) + 1);
}

const unreferenced = [];
const testOnly = [];
for (const [name, files] of declared) {
  // A class another rule composes with is in use even if no TSX names it.
  if (sourceTokens.has(name) || (timesInCss.get(name) || 0) > files.size) continue;
  (testTokens.has(name) ? testOnly : unreferenced).push({ name, files: [...files] });
}

const list = (entries) => {
  for (const entry of entries.sort((a, b) => a.files[0].localeCompare(b.files[0]))) {
    console.log(`  .${entry.name}  ←  ${entry.files.join(", ")}`);
  }
};

console.log(`Hand-written CSS: ${declared.size} classes declared, ${unreferenced.length} unreferenced.`);
list(unreferenced);

if (testOnly.length > 0) {
  console.log(`\n${testOnly.length} referenced only by tests — no app code sets these:`);
  list(testOnly);
  console.log("  Each is either a setting that was never wired up, or a test asserting CSS nothing can reach.");
}
