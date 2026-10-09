import { drawInkTop, drawShareBrand, drawWebsiteText } from "./shareCardBrand";
import { fillRoundedRect, strokeRoundedRect, drawOrnateFlourish } from "./canvasBotanicals";
import { wrapShareText, SHARE_UI_FONT } from "./shareLayout";
import { dataUrlToBlob } from "./zikrShareCard";

export const AYAH_MUSHAF_FONT = '"Amiri Quran", serif';
export interface AyahCardInput {
  verseKey: string;
  text: string;
  title: string;
  format: "portrait" | "square";
  translation?: { text: string; label: string };
  meanings?: { text: string; label: string };
  continuation: string;
}
export interface AyahCardRow {
  text: string;
  font: string;
  direction: "rtl" | "ltr";
  height: number;
  label?: boolean;
}
export interface AyahCardPage {
  rows: AyahCardRow[];
  height: number;
  width: number;
}

/** Fixed readable type, complete ordered text, measured marks and continued cards. */
export function layoutAyahCards(ctx: CanvasRenderingContext2D, input: AyahCardInput): AyahCardPage[] {
  const height = input.format === "portrait" ? 1350 : 1080;
  const capacity = height - 420;
  const pages: AyahCardPage[] = [];
  let rows: AyahCardRow[] = [],
    used = 0;
  const push = () => {
    if (rows.length) pages.push({ rows, width: 1080, height });
    rows = [];
    used = 0;
  };
  const add = (row: AyahCardRow) => {
    if (used + row.height > capacity) push();
    rows.push(row);
    used += row.height;
  };
  for (const section of [
    { text: input.text, font: `400 64px ${AYAH_MUSHAF_FONT}`, direction: "rtl" as const, size: 64, label: undefined },
    ...(input.translation
      ? [{ ...input.translation, font: `400 36px ${SHARE_UI_FONT}`, direction: "ltr" as const, size: 36 }]
      : []),
    ...(input.meanings
      ? [{ ...input.meanings, font: `400 34px ${SHARE_UI_FONT}`, direction: "rtl" as const, size: 34 }]
      : []),
  ]) {
    ctx.font = section.font;
    const lines = wrapShareText(section.text, (value) => ctx.measureText(value).width, 848);
    const measure = (line: string) => {
      const metrics = ctx.measureText(line.trim());
      return Math.ceil(
        Math.max(
          section.size * (section.direction === "rtl" ? 1.7 : 1.5),
          (metrics.actualBoundingBoxAscent ?? section.size) + (metrics.actualBoundingBoxDescent ?? 0) + 20,
        ),
      );
    };
    ctx.font = `600 28px ${SHARE_UI_FONT}`;
    const labelRows: AyahCardRow[] = section.label
      ? wrapShareText(section.label, (value) => ctx.measureText(value).width, 848).map((text) => ({
          text,
          font: ctx.font,
          direction: section.direction,
          height: 52,
          label: true,
        }))
      : [];
    ctx.font = section.font;
    const labelHeight = labelRows.reduce((sum, row) => sum + row.height, 0);
    if (labelRows.length) {
      if (used + labelHeight + measure(lines[0]!) > capacity) push();
      labelRows.forEach(add);
    }
    for (const line of lines) {
      const row = { text: line, font: section.font, direction: section.direction, height: measure(line) };
      if (used + row.height > capacity && labelRows.length) {
        push();
        labelRows.forEach(add);
      }
      add(row);
    }
    const gap = Math.min(28, capacity - used);
    if (rows.length) rows[rows.length - 1]!.height += gap;
    used += gap;
  }
  push();
  return pages;
}

export function renderAyahCard(input: AyahCardInput, page: AyahCardPage, index: number, total: number) {
  const canvas = document.createElement("canvas");
  canvas.width = page.width;
  canvas.height = page.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ede8dc";
  ctx.fillRect(0, 0, page.width, page.height);
  fillRoundedRect(ctx, 40, 40, page.width - 80, page.height - 80, 32, "#fffdf7");
  strokeRoundedRect(ctx, 56, 56, page.width - 112, page.height - 112, 24, "#cbb58a", 2);
  drawShareBrand(ctx, 86, "#223128", "#957038", "#e7dfca");
  ctx.font = `600 38px ${SHARE_UI_FONT}`;
  ctx.fillStyle = "#223128";
  ctx.textAlign = "center";
  ctx.direction = /[\u0600-\u06ff]/u.test(input.title) ? "rtl" : "ltr";
  drawInkTop(ctx, input.title, 540, 180);
  drawOrnateFlourish(ctx, 540, 258, 320, "#9b773a");
  const contentHeight = page.rows.reduce((sum, row) => sum + row.height, 0);
  let top = 302 + Math.max(0, (page.height - 420 - contentHeight) / 2);
  for (const row of page.rows) {
    ctx.font = row.font;
    ctx.direction = row.direction;
    ctx.textAlign = row.direction === "rtl" ? "right" : "left";
    ctx.fillStyle = row.label ? "#735425" : "#223128";
    drawInkTop(ctx, row.text.trim(), row.direction === "rtl" ? 964 : 116, top);
    top += row.height;
  }
  ctx.direction = /[\u0600-\u06ff]/u.test(input.continuation) ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.font = `400 24px ${SHARE_UI_FONT}`;
  ctx.fillStyle = "#526055";
  if (total > 1) {
    // Canvas engines differ on bidi isolates: paint label and numbers as separate runs.
    const numbers = `${index + 1} / ${total} · ${input.verseKey}`;
    const labelWidth = ctx.measureText(input.continuation).width;
    const numberWidth = ctx.measureText(numbers).width;
    const left = 540 - (labelWidth + numberWidth + 16) / 2;
    const rtl = ctx.direction === "rtl";
    ctx.direction = "ltr";
    ctx.textAlign = "left";
    drawInkTop(ctx, numbers, rtl ? left : left + labelWidth + 16, page.height - 118);
    ctx.direction = rtl ? "rtl" : "ltr";
    ctx.textAlign = rtl ? "right" : "left";
    drawInkTop(ctx, input.continuation, rtl ? left + numberWidth + 16 + labelWidth : left, page.height - 118);
  } else drawInkTop(ctx, input.verseKey, 540, page.height - 104);
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  drawWebsiteText(ctx, 540, page.height - 84, "#526055");
  return canvas;
}

export async function generateAyahCards(input: AyahCardInput) {
  if (document.fonts)
    await Promise.all([
      document.fonts.load(`400 64px ${AYAH_MUSHAF_FONT}`, input.text),
      document.fonts.load(`400 36px ${SHARE_UI_FONT}`, "Translation المصدر"),
      document.fonts.ready,
    ]);
  const measure = document.createElement("canvas").getContext("2d")!;
  const pages = layoutAyahCards(measure, input);
  const result: { file: File; url: string; page: AyahCardPage; width: number; height: number }[] = [];
  try {
    pages.forEach((page, index) => {
      const canvas = renderAyahCard(input, page, index, pages.length);
      const blob = dataUrlToBlob(canvas.toDataURL("image/png"));
      result.push({
        file: new File([blob], `ayah-${input.verseKey.replace(":", "-")}-${input.format}-${index + 1}.png`, {
          type: "image/png",
        }),
        url: URL.createObjectURL(blob),
        page,
        width: canvas.width,
        height: canvas.height,
      });
    });
    return result;
  } catch (cause) {
    result.forEach((page) => URL.revokeObjectURL(page.url));
    throw cause;
  }
}
