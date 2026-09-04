import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viewer = readFileSync("src/app/components/MushafPageViewer.tsx", "utf8");
const immersive = readFileSync("src/app/components/MushafImmersiveReader.tsx", "utf8");
const layout = readFileSync("src/styles/theme/layout.css", "utf8");
const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");

describe("the Mushaf page frame", () => {
  it("draws no rule around the page — the paper alone marks its edge", () => {
    // DEC-135 made the rule optional once the page had a paper ground of its
    // own; the page background task dropped it in favour of that ground plus
    // wider padding, rather than drawing a box on top of it.
    expect(viewer).not.toContain("mushaf-page-rule");
    expect(layout).not.toContain(".mushaf-page-rule");
  });

  it("uses the same gold as the illuminated opening frame", () => {
    // #d4b47c is the accent in public/images/mushaf-fatiha-frame.svg — the
    // token stays defined (the short-surah passage frame still uses it) even
    // though the multi-page view no longer draws a rule with it.
    expect(tokens).toContain("--mushaf-rule-ink: #d4b47c");
    const svg = readFileSync("public/images/mushaf-fatiha-frame.svg", "utf8");
    expect(svg).toContain("#d4b47c");
  });

  it("gives the type generous room to sit inside the paper's edge", () => {
    const frame = layout.slice(
      layout.indexOf(".mushaf-page-frame {"),
      layout.indexOf(".high-contrast .mushaf-page-frame"),
    );
    // The frame's max-width grows with this padding, so widening it moves the
    // edge outward rather than squeezing the measure — DEC-089's fifteen-line
    // geometry is page data and must not shift.
    expect(frame).toContain("max-width: min(100%, calc(var(--mushaf-measure, 100%) + 2 * var(--mushaf-frame-pad)))");
    // Widened past the old 0.75rem floor now that the rule no longer needs a
    // share of the edge for itself.
    expect(frame).toMatch(/--mushaf-frame-pad: clamp\(1\.25rem/);
    expect(frame).toContain("padding-block:");
  });

  it("renders the Mushaf inside the reader with the Mushaf's own settings", () => {
    // The immersive view took neither, so a reader who had set a Mushaf text
    // size or asked for reduced motion lost both the moment a surah opened it.
    expect(immersive).toContain("reduceMotion={reducedMotion}");
    expect(immersive).toContain("textScale={textScale}");
  });

  it("gives the page a paper surface of its own, distinct from the app background", () => {
    // DEC-135: The page is paper, not a transparent rectangle drawn on the shell.
    const frame = layout.slice(
      layout.indexOf(".mushaf-page-frame {"),
      layout.indexOf(".high-contrast .mushaf-page-frame"),
    );
    expect(frame).toContain("background: var(--mushaf-paper)");
    expect(frame).toContain("border-radius: 0.5rem");

    expect(tokens).toContain("--mushaf-paper: #101010"); // root fallback
    expect(tokens).toContain("--mushaf-paper: #141312"); // dark
    expect(tokens).toContain("--mushaf-paper: #fffdf8"); // light
    expect(tokens).toContain("--mushaf-paper: #101b3a"); // midnight
    expect(tokens).toContain("--mushaf-paper: #02050d"); // high-contrast
    expect(tokens).toContain("--mushaf-paper: #000000"); // oled
  });

  it("isolates OLED mode so it does not inherit a lighter ground from the app theme", () => {
    // When the app is in light theme, selecting OLED in Mushaf settings must
    // still keep the page pure black rather than inheriting #fffdf8.
    expect(viewer).toContain('theme === "oled" ? "theme-oled"');
    expect(tokens).toMatch(/\.theme-oled\s*\{[^}]*--mushaf-paper:\s*#000000/);

    // High contrast and OLED omit drop shadow to preserve contrast purity
    expect(layout).toMatch(/\.theme-oled \.mushaf-page-frame\s*\{[^}]*box-shadow:\s*none/);
  });
});
