import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * theme.css is a barrel of sequential parts (DEC-077), so these contracts are
 * asserted against the concatenation in the barrel's own import order — which
 * is the CSS the browser actually sees. Reading the parts through the barrel
 * rather than naming them keeps this test correct if a rule moves between
 * parts, and fails loudly if a part stops being imported.
 */
const themeCssPath = resolve(process.cwd(), "src/styles/theme.css");
const barrel = readFileSync(themeCssPath, "utf-8");
const importedParts = [...barrel.matchAll(/@import\s+"\.\/([^"]+)"/g)].map((match) => match[1]);
if (importedParts.length === 0) throw new Error("theme.css imports no parts; the theme layer cannot be verified");
const themeCss = importedParts
  .map((part) => readFileSync(resolve(process.cwd(), "src/styles", part), "utf-8"))
  .join("\n");

function themeBlock(selector: string): string {
  const start = themeCss.indexOf(selector);
  if (start === -1) throw new Error(`Theme block not found: ${selector}`);
  const braceStart = themeCss.indexOf("{", start);
  const braceEnd = themeCss.indexOf("}", braceStart);
  return themeCss.slice(braceStart, braceEnd);
}

describe("theme token contracts (Phase 02 delta)", () => {
  const namedThemeSelectors = [".dark,\n.theme-dark", ".light-mode,\n.theme-light", ".theme-midnight"];

  it.each(namedThemeSelectors)("%s defines theme-aware status tokens with foreground pairs", (selector) => {
    const block = themeBlock(selector);
    for (const role of ["success", "warning", "info"]) {
      expect(block).toMatch(new RegExp(`--${role}:\\s*#[0-9a-f]{6}`, "i"));
      expect(block).toMatch(new RegExp(`--${role}-foreground:\\s*#[0-9a-f]{6}`, "i"));
    }
  });

  it("no longer declares a theme-independent --success/--warning pair", () => {
    // The old global pair lived in the geometry :root block alongside --sleep;
    // guard against it silently reappearing outside per-theme blocks.
    const geometryBlock = themeBlock(":root {\n  --sleep");
    expect(geometryBlock).not.toMatch(/--success:/);
    expect(geometryBlock).not.toMatch(/--warning:/);
  });

  it("maps status and shadow tokens into the Tailwind @theme inline layer", () => {
    const themeInline = themeBlock("@theme inline");
    expect(themeInline).toContain("--color-success: var(--success)");
    expect(themeInline).toContain("--color-warning: var(--warning)");
    expect(themeInline).toContain("--color-info: var(--info)");
    expect(themeInline).toContain("--shadow-raised: var(--ds-shadow-raised)");
    expect(themeInline).toContain("--shadow-overlay: var(--ds-shadow-overlay)");
  });

  it("defines exactly two elevation tokens (three levels: flat/raised/overlay)", () => {
    expect(themeCss).toMatch(/--ds-shadow-raised:/);
    expect(themeCss).toMatch(/--ds-shadow-overlay:/);
  });

  it("keeps .bg-card opaque by default; blur stays scoped to the glass/wird opt-in", () => {
    // Regression guard for the old rule that put .bg-card in the same
    // backdrop-filter block as .glass-card/.wird-card.
    expect(themeCss).not.toMatch(/\.bg-card\s*,\s*\n\s*\.glass-card/);

    const glassBlock = themeBlock(".glass-card,\n.wird-card");
    expect(glassBlock).toContain("backdrop-filter: blur(16px)");
  });

  it("no longer references the removed orphaned word-meaning-dialog CSS", () => {
    expect(themeCss).not.toContain("word-meaning-dialog");
  });

  it("keeps Arabic UI and devotional reading typography as separate contracts", () => {
    expect(themeCss).not.toMatch(/\.font-arabic\s*,\s*\n\s*\.zikr-text/);
    expect(themeBlock(".arabic-ui,")).toContain("font-family: var(--font-ui-arabic)");
    // The zikr face now goes through --font-zikr so the reader can choose it,
    // but the separation this test exists to protect is unchanged: whatever the
    // choice, the devotional face is never the UI face.
    expect(themeBlock(".zikr-text,")).toContain("font-family: var(--font-zikr)");
    expect(themeCss).toContain("--font-zikr: var(--font-reading-arabic)");
    for (const match of themeCss.matchAll(/--font-zikr:\s*([^;]+);/g)) {
      expect(match[1]).not.toContain("--font-ui-arabic");
    }
  });

  it("defines --mushaf-paper across all named themes", () => {
    for (const selector of namedThemeSelectors) {
      const block = themeBlock(selector);
      expect(block).toMatch(/--mushaf-paper:\s*#[0-9a-f]{6}/i);
    }
  });
});
