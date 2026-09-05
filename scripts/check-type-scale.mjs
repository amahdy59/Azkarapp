import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

/**
 * Keeps the interface type scale from eroding back into a continuum.
 *
 * The app once carried twenty-five distinct font sizes written as arbitrary
 * values — a one-pixel ramp from 9px to 18px, which is not a scale, and one
 * rule of generated CSS for each. They are now the named steps in
 * `src/styles/tailwind.css` plus Tailwind's own, and this check exists so the
 * next `text-[0.84rem]` is a conversation rather than a silent nineteenth step.
 *
 * What remains allowed is deliberately not an allow-list of files: brand and
 * celebration art size their own lettering, and `text-[color:…]`,
 * `text-[length:…]` and the display-title clamp are not sizes on this scale at
 * all. The guard counts what is left instead. Adding one fails; removing one
 * and lowering the number is always welcome.
 */
const ALLOWED_ARBITRARY_SIZES = 8;

/** Not sizes: colours, inherited lengths, and the em-based ayah marker. */
const NOT_A_SCALE_SIZE = /^text-\[(color:|length:|clamp\(|[\d.]+em\])/;

const files = execSync('git ls-files "src/**/*.tsx" "src/**/*.ts"', { encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);

const found = new Map();

for (const file of files) {
  for (const match of readFileSync(file, "utf8").matchAll(/text-\[[^\]\s"'`]+\]/g)) {
    const utility = match[0];
    if (NOT_A_SCALE_SIZE.test(utility)) continue;
    const seen = found.get(utility) ?? [];
    seen.push(file);
    found.set(utility, seen);
  }
}

const total = [...found.values()].reduce((count, places) => count + places.length, 0);

if (total > ALLOWED_ARBITRARY_SIZES) {
  console.error(
    `Type scale: ${total} arbitrary font sizes, ${ALLOWED_ARBITRARY_SIZES} allowed.\n\n` +
      [...found].map(([utility, places]) => `  ${utility}\n${places.map((p) => `      ${p}`).join("\n")}`).join("\n") +
      "\n\nUse a step from the scale in src/styles/tailwind.css — micro, xs, label, sm,\n" +
      "subtitle, base, title, lg, xl, headline, 2xl, display, 4xl — or, if this really\n" +
      "is artwork rather than interface text, raise the number in this file so the\n" +
      "exception is reviewed.\n",
  );
  process.exit(1);
}

if (total < ALLOWED_ARBITRARY_SIZES) {
  console.log(
    `Type scale: ${total} arbitrary font sizes remain, below the ${ALLOWED_ARBITRARY_SIZES} allowed.\n` +
      "      Lower ALLOWED_ARBITRARY_SIZES in scripts/check-type-scale.mjs to hold the gain.",
  );
} else {
  console.log(`Type scale: ${total} arbitrary font sizes, all accounted for.`);
}
