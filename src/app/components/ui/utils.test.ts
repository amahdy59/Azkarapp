import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cn, SHADOW_NAMES, TYPE_SCALE_NAMES } from "./utils";

/**
 * The type scale's names have to reach tailwind-merge, or it reads them as
 * colours and drops the text colour they appear to override. The failure is
 * silent — the class list still looks plausible — and it surfaced as a primary
 * button drawing cream on gold at 2.09:1.
 */
const SCALE = TYPE_SCALE_NAMES.map((name) => `text-${name}`);

/** Names the theme declares under a prefix tailwind-merge splits two ways. */
function declaredIn(file: string, prefix: string) {
  const theme = readFileSync(file, "utf8");
  return [...theme.matchAll(new RegExp(`^\\s*--${prefix}-([a-z-]+):`, "gm"))].map((match) => match[1]).sort();
}

describe("cn", () => {
  it.each([
    ["text", "src/styles/tailwind.css", TYPE_SCALE_NAMES],
    ["shadow", "src/styles/theme/tailwind-bridge.css", SHADOW_NAMES],
  ])("registers every %s token the theme declares", (prefix, file, registered) => {
    const declared = declaredIn(file, prefix);
    expect(declared.length).toBeGreaterThan(0);
    // A token declared in @theme but unknown to tailwind-merge is read as a
    // colour: it stops overriding the size it names, and silently removes the
    // colour it appears to override.
    expect(declared).toEqual([...registered].sort());
  });

  it.each(SCALE)("keeps a text colour when %s sets the size", (size) => {
    const result = cn("bg-primary text-primary-foreground text-sm", size).split(" ");
    expect(result).toContain("text-primary-foreground");
    expect(result).toContain(size);
    // The scale still overrides the size it replaces.
    expect(result).not.toContain("text-sm");
  });

  it.each(SCALE)("lets %s be overridden by a later size", (size) => {
    expect(cn(size, "text-xl").split(" ")).toEqual(["text-xl"]);
  });

  it("still resolves a genuine text-colour conflict", () => {
    expect(cn("text-primary-foreground", "text-muted-foreground").split(" ")).toEqual(["text-muted-foreground"]);
  });

  it.each(SHADOW_NAMES)("lets shadow-%s replace a component's shadow", (name) => {
    expect(cn("shadow-lg", `shadow-${name}`).split(" ")).toEqual([`shadow-${name}`]);
  });

  it.each(SHADOW_NAMES)("lets a call site remove shadow-%s", (name) => {
    expect(cn(`shadow-${name}`, "shadow-none").split(" ")).toEqual(["shadow-none"]);
  });
});
