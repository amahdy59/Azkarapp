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

  it("keeps opening pages page-shaped, evenly spaced, and free of ornamental outlines", () => {
    const opening = layout.slice(layout.indexOf(".mushaf-opening {"), layout.indexOf(".mushaf-page-furniture"));
    expect(opening).toContain("aspect-ratio: 2 / 3");
    expect(opening).not.toContain("border:");
    expect(opening).not.toContain("outline:");
    expect(layout).not.toContain(".mushaf-opening-frame");
    expect(viewer).not.toContain("MushafOpeningFrameArt");
    expect(viewer).toContain("mushaf-opening__content");
    expect(viewer).toContain("gridTemplateRows:");
  });

  it("uses the documented crisp page-turn distance and duration", () => {
    expect(viewer).toContain('"-6px" : "6px"');
    expect(viewer).toContain("duration: 150");
    expect(viewer).not.toContain('"-22px" : "22px"');
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
    // The floor is the phone: 20px each side was 11% of a 375px screen spent
    // on margin beside a measure that cannot use it, and the page is the whole
    // screen there. The top of the clamp is untouched, so a desk-sized screen
    // keeps the generous edge.
    expect(frame).toMatch(/--mushaf-frame-pad: clamp\(0\.5rem/);
  });

  it("renders the Mushaf inside the reader with the Mushaf's own settings", () => {
    // The immersive view took neither, so a reader who had set a Mushaf text
    // size or asked for reduced motion lost both the moment a surah opened it.
    expect(immersive).toContain("reduceMotion={reducedMotion}");
    expect(immersive).toContain("textScale={textScale}");
  });

  it("gives the page a paper surface from the tablet tier up, and the screen itself below it", () => {
    // DEC-135 made the page paper rather than a transparent rectangle on the
    // shell. On a phone there is no shell beside it to be a sheet against: the
    // page fills the viewport, so the ground, the radius and the shadow drew a
    // panel of nearly the app background colour with a rounded edge against
    // nothing. The sheet is now a wide-screen treatment and the phone reads the
    // page directly on the app ground, as high contrast already did.
    const frame = layout.slice(
      layout.indexOf(".mushaf-page-frame {"),
      layout.indexOf(".high-contrast .mushaf-page-frame"),
    );
    expect(frame).toContain("@media (min-width: 640px)");
    expect(frame).toContain("background: var(--mushaf-paper)");
    expect(frame).toContain("border-radius: 0.5rem");
    // Nothing paints a ground before that breakpoint.
    const base = layout.slice(layout.indexOf(".mushaf-page-frame {"), layout.indexOf("@media (min-width: 640px)"));
    expect(base).not.toContain("background:");
    expect(base).not.toContain("box-shadow:");

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
