import { fillRoundedRect, strokeRoundedRect } from "./canvasBotanicals";
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
export function drawShareBrand(ctx: CanvasRenderingContext2D, top: number, foreground: string): void {
  ctx.save();
  ctx.font = `700 32px ${SHARE_ARABIC_FONT}`;
  const arabicWidth = ctx.measureText("وَذَكِّرْ").width;
  ctx.font = `600 14px ${SHARE_UI_FONT}`;
  const wordWidth = Math.max(arabicWidth, ctx.measureText("WA ZAKER").width);
  const wordRight = 540 - (wordWidth + 72) / 2 + wordWidth;
  const iconX = wordRight + 16;
  fillRoundedRect(ctx, iconX, top, 56, 56, 16, "#091426");
  ctx.fillStyle = "#efd18a";
  ctx.beginPath();
  ctx.arc(iconX + 26, top + 29, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#091426";
  ctx.beginPath();
  ctx.arc(iconX + 33, top + 23, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#efd18a";
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

export function drawWebsiteBadge(ctx: CanvasRenderingContext2D, centerX: number, centerY: number): void {
  fillRoundedRect(ctx, centerX - 190, centerY - 31, 380, 62, 31, "#f8f5ed");
  strokeRoundedRect(ctx, centerX - 190, centerY - 31, 380, 62, 31, "#b49142", 2);
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 30px ${SHARE_UI_FONT}`;
  ctx.fillStyle = "#091426";
  ctx.fillText("wa-zaker.com", centerX, centeredInkBaseline(ctx, "wa-zaker.com", centerY));
}
