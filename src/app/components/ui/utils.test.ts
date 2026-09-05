import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { cn, TYPE_SCALE_NAMES } from "./utils";

/**
 * The type scale's names have to reach tailwind-merge, or it reads them as
 * colours and drops the text colour they appear to override. The failure is
 * silent — the class list still looks plausible — and it surfaced as a primary
 * button drawing cream on gold at 2.09:1.
 */
const SCALE = TYPE_SCALE_NAMES.map((name) => `text-${name}`);

describe("cn", () => {
  it("registers every size the theme declares", () => {
    const theme = readFileSync("src/styles/tailwind.css", "utf8");
    const declared = [...theme.matchAll(/^\s*--text-([a-z-]+):/gm)].map((match) => match[1]);
    expect(declared.length).toBeGreaterThan(0);
    // A token declared in @theme but unknown to tailwind-merge reads as a
    // colour, and silently removes the colour it appears to override.
    expect([...declared].sort()).toEqual([...TYPE_SCALE_NAMES].sort());
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
});
