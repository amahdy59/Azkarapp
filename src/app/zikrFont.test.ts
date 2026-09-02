import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { applyAppAppearance } from "./theme";
import { DEFAULT_APP_STATE, mergeAppStates, normalizeAppState } from "./state";

describe("zikr font selection", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.zikrFont;
  });

  it("leaves the default face unmarked, so it costs no override", () => {
    applyAppAppearance({ themeMode: "midnight", zikrFont: "humanist" });
    // "humanist" is what --font-zikr already resolves to. Stamping an attribute
    // for it would add a rule that changes nothing.
    expect(document.documentElement.dataset.zikrFont).toBeUndefined();
  });

  it("marks the root for each face the reader can choose", () => {
    applyAppAppearance({ themeMode: "midnight", zikrFont: "clear" });
    expect(document.documentElement.dataset.zikrFont).toBe("clear");
    applyAppAppearance({ themeMode: "midnight", zikrFont: "naskh" });
    expect(document.documentElement.dataset.zikrFont).toBe("naskh");
  });

  it("clears the mark when the reader goes back to the default", () => {
    applyAppAppearance({ themeMode: "midnight", zikrFont: "naskh" });
    applyAppAppearance({ themeMode: "midnight", zikrFont: "humanist" });
    // Left behind, the old attribute would keep overriding the token forever.
    expect(document.documentElement.dataset.zikrFont).toBeUndefined();
  });

  it("styles only the zikr text, not the interface around it", () => {
    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    expect(tokens).toContain("font-family: var(--font-zikr)");
    // The UI face is a separate token and no override may touch it.
    for (const face of ["clear", "naskh"]) {
      const marker = `:root[data-zikr-font="${face}"] {`;
      expect(tokens, `${face} override`).toContain(marker);
      const block = tokens.slice(tokens.indexOf(marker), tokens.indexOf("}", tokens.indexOf(marker)));
      expect(block).toContain("--font-zikr:");
      expect(block).not.toContain("--font-ui-arabic");
      expect(block).not.toContain("--font-mushaf");
    }
  });

  it("offers only families the app already ships", () => {
    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    const fonts = readFileSync("src/styles/fonts.css", "utf8");
    const shipped = ["IBM Plex Sans Arabic", "Noto Sans Arabic Variable", "Amiri Quran"];
    for (const family of shipped) {
      expect(fonts + readFileSync("package.json", "utf8")).toContain(
        family === "Noto Sans Arabic Variable" ? "noto-sans-arabic" : family.toLowerCase().replace(/ /g, "-"),
      );
    }
    // A fourth family would be a new download for every reader, precached by the
    // service worker, to serve a preference most will never change.
    const declared = [...tokens.matchAll(/--font-zikr:\s*([^;]+);/g)].map((m) => m[1]);
    for (const stack of declared) {
      if (stack.includes("var(")) continue;
      for (const family of stack.split(",").map((part) => part.trim().replace(/^"|"$/g, ""))) {
        if (["sans-serif", "serif"].includes(family)) continue;
        expect(shipped, `${family} is not shipped`).toContain(family);
      }
    }
  });

  it("leaves no consumer pinned to the fixed reading token", () => {
    // The reader writes the face as an inline style, which outranks every
    // stylesheet rule. While that inline value read --font-reading-arabic the
    // setting changed the token correctly and the text never moved: the whole
    // feature was inert, and only a computed-style check in a browser showed it.
    for (const file of ["src/app/screens/ReaderScreen.tsx", "src/styles/theme/surfaces.css"]) {
      expect(readFileSync(file, "utf8"), `${file} still pins the zikr face`).not.toContain(
        "var(--font-reading-arabic)",
      );
    }
    // Exactly one place still names it: the default the choice falls back to.
    const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
    expect(tokens.split("var(--font-reading-arabic)").length - 1).toBe(1);
  });

  it("keeps the choice across a reload", () => {
    // state.ts whitelists settings keys, so a new one is dropped on save unless
    // it is added there. The picker worked, the root updated, and the choice
    // vanished on reload — nothing in the UI could have shown that.
    const stored = normalizeAppState({ settings: { ...DEFAULT_APP_STATE.settings, zikrFont: "naskh" } });
    expect(stored.settings.zikrFont).toBe("naskh");
  });

  it("falls back to the default rather than trusting a stored value", () => {
    const stored = normalizeAppState({ settings: { ...DEFAULT_APP_STATE.settings, zikrFont: "comic-sans" } });
    expect(stored.settings.zikrFont).toBe("humanist");
  });

  it("carries the choice through an account merge", () => {
    const merged = mergeAppStates(DEFAULT_APP_STATE, {
      settings: { ...DEFAULT_APP_STATE.settings, zikrFont: "clear" },
    });
    expect(merged.settings.zikrFont).toBe("clear");
  });
});
