import { fillRoundedRect } from "./canvasBotanicals";
import { SHARE_ARABIC_FONT, SHARE_UI_FONT } from "./shareLayout";

/** Position visible ink, rather than the font's invisible leading. */
export function drawInkTop(ctx: CanvasRenderingContext2D, text: string, x: number, top: number): void {
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(text);
  const size = Number(ctx.font.match(/(\d+)px/u)?.[1] ?? 30);
  ctx.fillText(text, x, top + (metrics.actualBoundingBoxAscent ?? size * 0.8));
}

export function centeredInkBaseline(ctx: CanvasRenderingContext2D, text: string, center: number): number {
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(text);
  const size = Number(ctx.font.match(/(\d+)px/u)?.[1] ?? 30);
  return (
    center + ((metrics.actualBoundingBoxAscent ?? size * 0.8) - (metrics.actualBoundingBoxDescent ?? size * 0.2)) / 2
  );
}

/** Vector crescent and live font lettering stay crisp without upscaling the supplied small PNG. */
export function drawShareBrand(
  ctx: CanvasRenderingContext2D,
  top: number,
  foreground: string,
  accent = "#efd18a",
  iconBackground = "#091426",
): void {
  ctx.save();
  // Grow the whole vector/font lockup from 56 to 64px, around its center.
  ctx.translate(540, top);
  ctx.scale(64 / 56, 64 / 56);
  ctx.translate(-540, -top);
  ctx.font = `700 32px ${SHARE_ARABIC_FONT}`;
  const arabicWidth = ctx.measureText("وَذَكِّرْ").width;
  ctx.font = `600 14px ${SHARE_UI_FONT}`;
  const wordWidth = Math.max(arabicWidth, ctx.measureText("WA ZAKER").width);
  const wordRight = 540 - (wordWidth + 72) / 2 + wordWidth;
  const iconX = wordRight + 16;
  fillRoundedRect(ctx, iconX, top, 56, 56, 16, iconBackground);
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(iconX + 26, top + 29, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = iconBackground;
  ctx.beginPath();
  ctx.arc(iconX + 33, top + 23, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = accent;
  ctx.fillRect(iconX + 43, top + 13, 4, 4);
  ctx.textAlign = "right";
  ctx.direction = "rtl";
  ctx.fillStyle = foreground;
  ctx.font = `700 32px ${SHARE_ARABIC_FONT}`;
  drawInkTop(ctx, "وَذَكِّرْ", wordRight, top);
  const wordmark = ctx.measureText("وَذَكِّرْ");
  const labelTop = top + wordmark.actualBoundingBoxAscent + wordmark.actualBoundingBoxDescent + 6;
  ctx.direction = "ltr";
  ctx.font = `600 14px ${SHARE_UI_FONT}`;
  drawInkTop(ctx, "WA ZAKER", wordRight, Number.isFinite(labelTop) ? labelTop : top + 45);
  ctx.restore();
}

export function drawWebsiteText(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  accent = "#b49142",
): void {
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 30px ${SHARE_UI_FONT}`;
  ctx.fillStyle = accent;
  ctx.fillText("wa-zaker.com", centerX, centeredInkBaseline(ctx, "wa-zaker.com", centerY));
}
