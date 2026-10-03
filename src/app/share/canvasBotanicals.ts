/**
 * canvasBotanicals.ts — Procedural vector decorations and layout primitives
 * for social share cards and story packs.
 *
 * Designed to render 100% offline at 1080x1920 (9:16) with zero external assets.
 */

export interface BotanicalThemePalette {
  leafPrimary: string;
  leafSecondary: string;
  stemColor: string;
  flourishColor: string;
  dotActive: string;
  dotInactive: string;
}

export const DAYLIGHT_BOTANICAL_PALETTE: BotanicalThemePalette = {
  leafPrimary: "rgba(92, 112, 66, 0.42)",
  leafSecondary: "rgba(120, 138, 90, 0.32)",
  stemColor: "rgba(80, 100, 58, 0.38)",
  flourishColor: "rgba(160, 140, 100, 0.55)",
  dotActive: "#2d5a43",
  dotInactive: "#d8d2c4",
};

export const MIDNIGHT_BOTANICAL_PALETTE: BotanicalThemePalette = {
  leafPrimary: "rgba(73, 185, 162, 0.28)",
  leafSecondary: "rgba(45, 130, 120, 0.20)",
  stemColor: "rgba(60, 150, 135, 0.24)",
  flourishColor: "rgba(232, 180, 32, 0.45)",
  dotActive: "#e8b420",
  dotInactive: "#2a3a5e",
};

/**
 * Draws a single botanical olive leaf using two symmetric cubic Bezier curves.
 */
export function drawOliveLeaf(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  baseY: number,
  length: number,
  width: number,
  angleRad: number,
  color: string,
) {
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(angleRad);

  ctx.beginPath();
  ctx.moveTo(0, 0);

  // Left curve to tip
  ctx.bezierCurveTo(-width / 2, length * 0.35, -width / 2, length * 0.7, 0, length);
  // Right curve back to base
  ctx.bezierCurveTo(width / 2, length * 0.7, width / 2, length * 0.35, 0, 0);

  ctx.fillStyle = color;
  ctx.fill();

  // Subtle central vein
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, length * 0.85);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws an organic sprig of olive branches with leaves along a curved stem.
 */
export function drawOliveSprig(
  ctx: CanvasRenderingContext2D,
  rootX: number,
  rootY: number,
  baseAngleRad: number,
  scale: number,
  palette: BotanicalThemePalette,
) {
  ctx.save();
  ctx.translate(rootX, rootY);
  ctx.rotate(baseAngleRad);
  ctx.scale(scale, scale);

  // Draw main curved stem
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(30, 50, 60, 110, 80, 180);
  ctx.strokeStyle = palette.stemColor;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.stroke();

  // Node attachments (distance along stem, leaf length, leaf width, angle relative to stem)
  const leafNodes = [
    { x: 15, y: 30, len: 42, w: 16, ang: -0.65 },
    { x: 18, y: 34, len: 38, w: 14, ang: 0.75 },
    { x: 34, y: 68, len: 48, w: 18, ang: -0.8 },
    { x: 38, y: 74, len: 44, w: 17, ang: 0.7 },
    { x: 52, y: 110, len: 52, w: 19, ang: -0.7 },
    { x: 58, y: 118, len: 46, w: 18, ang: 0.85 },
    { x: 70, y: 150, len: 48, w: 17, ang: -0.6 },
    { x: 74, y: 156, len: 40, w: 15, ang: 0.8 },
    { x: 80, y: 180, len: 45, w: 16, ang: 0.1 }, // Terminal leaf
  ];

  leafNodes.forEach((node, idx) => {
    const leafColor = idx % 2 === 0 ? palette.leafPrimary : palette.leafSecondary;
    drawOliveLeaf(ctx, node.x, node.y, node.len, node.w, node.ang, leafColor);
  });

  ctx.restore();
}

/**
 * Draws soft corner botanicals around the edges of a 1080x1920 canvas.
 */
export function drawCardCornerBotanicals(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  palette: BotanicalThemePalette,
  opposingOnly = false,
) {
  // Top-Right corner
  drawOliveSprig(ctx, canvasWidth + 20, -10, Math.PI / 2, 1.25, palette);
  // Top-Left corner
  if (!opposingOnly) drawOliveSprig(ctx, -20, -10, 0, 1.25, palette);
  // Bottom-Right corner
  if (!opposingOnly) drawOliveSprig(ctx, canvasWidth + 20, canvasHeight + 10, Math.PI, 1.2, palette);
  // Bottom-Left corner
  drawOliveSprig(ctx, -20, canvasHeight + 10, -Math.PI / 2, 1.2, palette);
}

/**
 * Draws an elegant arabesque flourish / decorative divider.
 */
export function drawOrnateFlourish(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";

  const half = width / 2;

  // Left wing
  ctx.beginPath();
  ctx.moveTo(centerX - 16, centerY);
  ctx.bezierCurveTo(centerX - 40, centerY - 8, centerX - half + 30, centerY + 6, centerX - half, centerY);
  ctx.stroke();

  // Right wing
  ctx.beginPath();
  ctx.moveTo(centerX + 16, centerY);
  ctx.bezierCurveTo(centerX + 40, centerY - 8, centerX + half - 30, centerY + 6, centerX + half, centerY);
  ctx.stroke();

  // Center diamond motif
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 6);
  ctx.lineTo(centerX + 7, centerY);
  ctx.lineTo(centerX, centerY + 6);
  ctx.lineTo(centerX - 7, centerY);
  ctx.closePath();
  ctx.fill();

  // Outer small flanking dots
  ctx.beginPath();
  ctx.arc(centerX - 13, centerY, 2.2, 0, Math.PI * 2);
  ctx.arc(centerX + 13, centerY, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws pagination dots (e.g. ● ○ ○ ○ ○) for multi-slide sets.
 */
export function drawPaginationDots(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  totalPages: number,
  activePageIndex: number,
  palette: BotanicalThemePalette,
) {
  if (totalPages <= 1) return;

  const dotRadius = 4.5;
  const activeDotRadius = 6;
  const gap = 20;
  const totalWidth = (totalPages - 1) * gap;
  const startX = centerX - totalWidth / 2;

  ctx.save();
  for (let i = 0; i < totalPages; i += 1) {
    const x = startX + i * gap;
    const isActive = i === activePageIndex;

    ctx.beginPath();
    ctx.arc(x, centerY, isActive ? activeDotRadius : dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? palette.dotActive : palette.dotInactive;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Utility to draw a filled rounded rectangle.
 */
export function fillRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/**
 * Utility to draw a stroked rounded rectangle.
 */
export function strokeRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string,
  lineWidth = 1.5,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}
