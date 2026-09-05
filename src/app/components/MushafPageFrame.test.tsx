import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viewer = readFileSync("src/app/components/MushafPageViewer.tsx", "utf8");
const immersive = readFileSync("src/app/components/MushafImmersiveReader.tsx", "utf8");
const layout = readFileSync("src/styles/theme/layout.css", "utf8");
const tokens = readFileSync("src/styles/theme/tokens.css", "utf8");
const art = readFileSync("src/app/components/MushafOpeningFrameArt.tsx", "utf8");

describe("the Mushaf page frame", () => {
  it("draws no rule around the page — the paper alone marks its edge", () => {
    // DEC-135 made the rule optional once the page had a paper ground of its
    // own; the page background task dropped it in favour of that ground plus
    // wider padding, rather than drawing a box on top of it.
    expect(viewer).not.toContain("mushaf-page-rule");
    expect(layout).not.toContain(".mushaf-page-rule");
  });

  it("draws the illuminated opening in the Mushaf gold, not the interface accent", () => {
    // The opening frame took its gilt from --accent and its second rule from
    // --secondary, which are interface tokens: gold in one theme, and blue or
    // violet in the colour-blind ones. Both are Mushaf tokens now, and the
    // panel is paper rather than --card.
    expect(tokens).toContain("--mushaf-rule-ink: #d4b47c");
    expect(layout).toContain("--mushaf-opening-gilt: var(--mushaf-rule-ink, #d4b47c)");
    const opening = layout.slice(layout.indexOf(".mushaf-opening {"), layout.indexOf(".mushaf-opening-frame__leaf"));
    expect(opening).toContain("background: var(--mushaf-paper)");
    expect(opening).not.toContain("var(--accent");
    expect(opening).not.toContain("var(--secondary");
    expect(opening).not.toContain("var(--card");
  });

  it("keeps the opening page-shaped and its ornament square at any ratio", () => {
    // It was one 1200x1800 drawing stretched with preserveAspectRatio="none",
    // so at 375x700 the corner leaves flattened by a fifth and the vertical
    // rules drew thinner than the horizontal ones. The rules are boxes now, and
    // the panel keeps the page's proportions instead of the viewport's.
    const opening = layout.slice(layout.indexOf(".mushaf-opening {"), layout.indexOf(".mushaf-page-furniture"));
    expect(opening).toContain("aspect-ratio: 2 / 3");
    expect(opening).toMatch(/\.mushaf-opening-frame__leaf[^}]*width: clamp\([^}]*cqmin/);
    // The art is drawn by the component rather than fetched and injected, so
    // the opening never appears unframed while a request is in flight.
    expect(art).not.toContain("dangerouslySetInnerHTML");
    expect(art).not.toContain("fetch(");
    // Four leaves, one per physical corner, each a rotation of one shape.
    expect((art.match(/rotate: /g) ?? []).length).toBe(4);
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
