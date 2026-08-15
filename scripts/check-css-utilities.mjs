import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Guards against DEC-064 / F01: a `@source not` pattern in src/styles/tailwind.css
 * silently stopped Tailwind compiling every utility used only inside
 * src/app/components/ui/*. Nothing failed — the classes simply resolved to
 * nothing, which left the destructive-action confirm dialog unpositioned, every
 * modal scrim transparent, and menu items without their indicator gutter.
 *
 * Each canary below is load-bearing and appears ONLY in a design-system
 * primitive, so it is generated only while those files are being scanned.
 */
export const CANARY_UTILITIES = [
  { selector: ".rounded-sm", reason: "menu and select item radius" },
  { selector: ".ps-8", reason: "menu item indicator gutter" },
  { selector: ".pe-2", reason: "menu item trailing padding" },
  { selector: ".start-2", reason: "menu item indicator inset" },
  { selector: ".size-4", reason: "menu indicator icon size" },
  { selector: ".min-w-\\[8rem\\]", reason: "menu minimum width" },
  { selector: ".outline-hidden", reason: "menu item focus handling" },
  { selector: ".bg-black\\/50", reason: "dialog and drawer scrim" },
  { selector: ".left-\\[50\\%\\]", reason: "dialog horizontal centring" },
  { selector: ".top-\\[50\\%\\]", reason: "dialog vertical centring" },
  { selector: ".translate-x-\\[-50\\%\\]", reason: "dialog horizontal centring" },
  { selector: ".translate-y-\\[-50\\%\\]", reason: "dialog vertical centring" },
  { selector: ".max-w-\\[calc\\(100\\%-2rem\\)\\]", reason: "dialog narrow-screen inset" },
  { selector: ".border-input", reason: "OTP field boundary" },
  { selector: ".animate-caret-blink", reason: "OTP caret" },
];

/**
 * Tailwind merges rules that share a declaration, so a canary may appear as
 * `.rounded-md,.rounded-sm{…}`. Match the selector followed by any character
 * that can legally terminate it rather than assuming it opens its own block.
 */
export function findMissingUtilities(css, canaries = CANARY_UTILITIES) {
  return canaries.filter(({ selector }) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return !new RegExp(`${escaped}(?=[,{:\\s])`).test(css);
  });
}

async function readBuiltCss(assetsDirectory) {
  const entries = await readdir(assetsDirectory);
  const stylesheets = entries.filter((entry) => entry.endsWith(".css"));

  if (stylesheets.length === 0) {
    throw new Error(`No stylesheets found in ${assetsDirectory}. Run the build first.`);
  }

  const contents = await Promise.all(stylesheets.map((entry) => readFile(path.join(assetsDirectory, entry), "utf8")));
  return contents.join("\n");
}

const isDirectInvocation = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));

if (isDirectInvocation) {
  const css = await readBuiltCss(path.resolve("dist/assets"));
  const missing = findMissingUtilities(css);

  if (missing.length > 0) {
    console.error(
      "Design-system utilities are missing from the built CSS.\n" +
        "Tailwind is not scanning src/app/components/ui — check the @source rules in\n" +
        "src/styles/tailwind.css. See DEC-064 / F01.\n\n" +
        missing.map(({ selector, reason }) => `  ${selector} — ${reason}`).join("\n"),
    );
    process.exit(1);
  }
}
