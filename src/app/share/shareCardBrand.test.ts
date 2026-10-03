import { describe, expect, it, vi } from "vitest";
import { centeredInkBaseline, drawInkTop } from "./shareCardBrand";
import { SHARE_PILL } from "./shareLayout";

describe("share card visible-ink spacing", () => {
  for (const [text, ascent, descent] of [
    ["٣ مرات", 29, 9],
    ["3 repetitions", 22, 7],
  ] as const) {
    it(`centers ${text} by its actual glyph bounds and preserves the four-pixel content gap`, () => {
      const ctx = {
        font: "600 30px sans-serif",
        textBaseline: "top",
        measureText() {
          expect(this.textBaseline).toBe("alphabetic");
          return { actualBoundingBoxAscent: ascent, actualBoundingBoxDescent: descent };
        },
        fillText: vi.fn(),
      } as unknown as CanvasRenderingContext2D;
      const center = SHARE_PILL.top + SHARE_PILL.height / 2;
      const baseline = centeredInkBaseline(ctx, text, center);
      expect((baseline - ascent + baseline + descent) / 2).toBe(center);
      expect(baseline - ascent).toBeGreaterThan(SHARE_PILL.top);
      expect(baseline + descent).toBeLessThan(SHARE_PILL.top + SHARE_PILL.height);
      drawInkTop(ctx, "Reading text", 112, SHARE_PILL.textTop);
      expect(ctx.textBaseline).toBe("alphabetic");
      const inkTop = vi.mocked(ctx.fillText).mock.calls[0]![2] - ascent;
      expect(inkTop - (SHARE_PILL.top + SHARE_PILL.height)).toBe(4);
    });
  }
});
