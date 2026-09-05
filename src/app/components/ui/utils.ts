import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale's names, taught to tailwind-merge.
 *
 * `text-…` is ambiguous: it names both a size and a colour, and tailwind-merge
 * decides which by recognising the value. It knows `text-sm`, and it can parse
 * a length written as an arbitrary value, but `text-label` is neither, so it
 * fell back to reading it as a colour — and dropped the foreground colour it
 * believed was being overridden. That is how a primary button on two settings
 * screens came to draw its own cream text on its gold ground at a contrast
 * ratio of 2.09:1, from a rename that moved no pixels: the size class was the
 * same size, and the colour it silently displaced was the whole defect.
 *
 * Registering the names here is what makes the scale safe to pass through
 * `cn()` at any call site. It must list every `--text-*` token declared in the
 * `@theme` block of src/styles/tailwind.css, which utils.test.ts holds it to by
 * reading that block — a token added there and forgotten here fails the suite
 * rather than quietly deleting a colour somewhere.
 */
export const TYPE_SCALE_NAMES = ["micro", "label", "subtitle", "title", "headline", "display"];

/**
 * The named shadows, for the same reason.
 *
 * `shadow-…` splits the same way `text-…` does — a size or a colour — so
 * `shadow-raised` read as a colour sits alongside a component's `shadow-lg`
 * instead of replacing it, and `shadow-none` fails to remove a named shadow at
 * all: both classes survive and the order rules happen to be written in decides
 * which one draws. No call site relies on that today, which is the moment to
 * register them rather than after one does.
 */
export const SHADOW_NAMES = ["raised", "overlay"];

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: TYPE_SCALE_NAMES }],
      shadow: [{ shadow: SHADOW_NAMES }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
