import { describe, expect, it } from "vitest";
import { ARBITRARY_RADIUS, RAW_PALETTE_CLASS, azkarLintRules } from "./eslint-rules.mjs";

describe("azkar lint rules", () => {
  it("registers every rule referenced by eslint.config.js", () => {
    expect(Object.keys(azkarLintRules.rules).sort()).toEqual([
      "no-arbitrary-radius",
      "no-inline-bilingual-copy",
      "no-raw-palette-color",
      "no-roleless-aria-label",
    ]);
  });

  describe("no-raw-palette-color", () => {
    it.each(["flex bg-amber-500 p-2", "text-emerald-600", "border-slate-950/40", "hover:bg-blue-500"])(
      "rejects %s",
      (value) => expect(RAW_PALETTE_CLASS.test(value)).toBe(true),
    );

    it.each(["bg-primary text-primary-foreground", "text-success", "border-border-control", "bg-on-media-surface/82"])(
      "allows %s",
      (value) => expect(RAW_PALETTE_CLASS.test(value)).toBe(false),
    );

    it("does not flag a token whose name merely contains a palette word", () => {
      expect(RAW_PALETTE_CLASS.test("bg-sleep text-evening")).toBe(false);
    });
  });

  describe("no-arbitrary-radius", () => {
    it.each(["rounded-[28px]", "rounded-b-[36px]", "rounded-t-[1.75rem]"])("rejects %s", (value) =>
      expect(ARBITRARY_RADIUS.test(value)).toBe(true),
    );

    it.each(["rounded-3xl", "rounded-full", "rounded-[var(--ds-radius-overlay)]", "rounded-[inherit]"])(
      "allows %s",
      (value) => expect(ARBITRARY_RADIUS.test(value)).toBe(false),
    );
  });
});
