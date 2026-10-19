import { drawInkTop, drawShareBrand, drawWebsiteText } from "./shareCardBrand";
import { fillRoundedRect, strokeRoundedRect, drawOrnateFlourish } from "./canvasBotanicals";
import { wrapShareText, SHARE_UI_FONT, SHARE_DIMENSIONS, shareDisplayDigits, type ShareFormat } from "./shareLayout";
import type { AppLanguage } from "../types";
import { t } from "../i18n";
import { shareSentenceEnds } from "./shareContinuation";
import { prepareAyahMushafRendering } from "./ayahMushafRendering";

export const AYAH_MUSHAF_FONT = '"Amiri Quran", serif';
export interface AyahCardInput {
  verseKey: string;
  language?: AppLanguage;
  pageNumber?: number;
  arabicDrawing?: { text: string; fontFamily: string };
  text: string;
  title: string;
  format: ShareFormat;
  textScale?: number;
  fitAyah?: boolean;
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
  const height = SHARE_DIMENSIONS[input.format].height;
  const capacity = height - 372;
  const arabicText = input.arabicDrawing?.text ?? input.text;
  const arabicFamily = input.arabicDrawing?.fontFamily ?? AYAH_MUSHAF_FONT;
  const rowHeight = (line: string, size: number, direction: "rtl" | "ltr") => {
    const metrics = ctx.measureText(line.trim());
    return Math.ceil(
      Math.max(
        size * (direction === "rtl" ? 1.55 : 1.5),
        (metrics.actualBoundingBoxAscent ?? size) +
          (metrics.actualBoundingBoxDescent ?? 0) +
          (direction === "rtl" ? 12 : 20),
      ),
    );
  };
  // Keep a complete ayah together whenever it fits at a readable export size.
  const scale = Math.min(1.125, Math.max(0.75, Number.isFinite(input.textScale) ? input.textScale! : 1));
  let arabicSize = Math.round(64 * scale);
  for (let size = arabicSize; input.fitAyah !== false && size >= 48; size -= 2) {
    ctx.font = `400 ${size}px ${arabicFamily}`;
    const lines = wrapShareText(arabicText, (value) => ctx.measureText(value).width, 848);
    if (lines.reduce((sum, line) => sum + rowHeight(line, size, "rtl"), 0) <= capacity) {
      arabicSize = size;
      break;
    }
  }
  const englishSize = Math.max(36, Math.round(46 * scale));
  const meaningsSize = Math.max(30, Math.round(34 * scale));
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
    {
      text: arabicText,
      font: `400 ${arabicSize}px ${arabicFamily}`,
      direction: "rtl" as const,
      size: arabicSize,
      label: undefined,
    },
    ...(input.translation
      ? [
          {
            ...input.translation,
            font: `400 ${englishSize}px ${SHARE_UI_FONT}`,
            direction: "ltr" as const,
            size: englishSize,
          },
        ]
      : []),
    ...(input.meanings
      ? [
          {
            ...input.meanings,
            font: `400 ${meaningsSize}px ${SHARE_UI_FONT}`,
            direction: "rtl" as const,
            size: meaningsSize,
          },
        ]
      : []),
  ]) {
    ctx.font = section.font;
    const lines = wrapShareText(section.text, (value) => ctx.measureText(value).width, 848);
    const measure = (line: string) => {
      return rowHeight(line, section.size, section.direction);
    };
    ctx.font = `600 32px ${SHARE_UI_FONT}`;
    const labelRows: AyahCardRow[] = section.label
      ? wrapShareText(section.label, (value) => ctx.measureText(value).width, 848).map((text) => ({
          text,
          font: ctx.font,
          direction: section.direction,
          height: 56,
          label: true,
        }))
      : [];
    ctx.font = section.font;
    const labelHeight = labelRows.reduce((sum, row) => sum + row.height, 0);
    if (labelRows.length) {
      if (used + labelHeight + measure(lines[0]!) > capacity) push();
      labelRows.forEach(add);
    }
    let sentenceStart = 0;
    for (const sentenceEnd of shareSentenceEnds(section.text, section.direction === "rtl" ? "ar" : "en")) {
      const sentenceLines = wrapShareText(
        section.text.slice(sentenceStart, sentenceEnd),
        (value) => ctx.measureText(value).width,
        848,
      );
      const sentenceHeight = sentenceLines.reduce((sum, line) => sum + measure(line), 0);
      if (sentenceHeight + labelHeight <= capacity && used + sentenceHeight > capacity) {
        push();
        labelRows.forEach(add);
      }
      for (const line of sentenceLines) {
        const row = { text: line, font: section.font, direction: section.direction, height: measure(line) };
        if (used + row.height > capacity && labelRows.length) {
          push();
          labelRows.forEach(add);
        }
        add(row);
      }
      sentenceStart = sentenceEnd;
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
  strokeRoundedRect(ctx, 40, 40, page.width - 80, page.height - 80, 32, "#cbb58a", 2);
  drawShareBrand(ctx, 64, "#223128", "#957038", "#e7dfca");
  ctx.font = `600 38px ${SHARE_UI_FONT}`;
  ctx.fillStyle = "#223128";
  ctx.textAlign = "center";
  ctx.direction = /[\u0600-\u06ff]/u.test(input.title) ? "rtl" : "ltr";
  drawInkTop(ctx, input.title, 540, 148);
  if (total === 1) drawOrnateFlourish(ctx, 540, 220, 240, "#9b773a");
  const contentHeight = page.rows.reduce((sum, row) => sum + row.height, 0);
  let top = 252 + Math.min(96, Math.max(0, (page.height - 372 - contentHeight) / 2));
  const continuationCue = (key: "continuedBefore" | "continuedAfter", x: number) => {
    ctx.font = `500 28px ${SHARE_UI_FONT}`;
    ctx.direction = input.language === "ar" ? "rtl" : "ltr";
    ctx.textAlign = "center";
    ctx.fillStyle = "#735425";
    drawInkTop(ctx, t(input.language ?? "en", `shareStudio.${key}`), x, 202);
  };
  const middle = index > 0 && index < total - 1;
  if (index > 0) continuationCue("continuedBefore", middle ? 300 : 540);
  if (index < total - 1) continuationCue("continuedAfter", middle ? 780 : 540);
  for (const row of page.rows) {
    ctx.font = row.font;
    ctx.direction = row.direction;
    ctx.textAlign = "center";
    ctx.fillStyle = row.label ? "#735425" : "#223128";
    drawInkTop(ctx, row.text.trim(), 540, top);
    top += row.height;
  }
  ctx.direction = /[\u0600-\u06ff]/u.test(input.continuation) ? "rtl" : "ltr";
  ctx.textAlign = "center";
  ctx.font = `400 24px ${SHARE_UI_FONT}`;
  ctx.fillStyle = "#526055";
  if (total > 1) {
    // Canvas engines differ on bidi isolates: paint label and numbers as separate runs.
    const numbers = shareDisplayDigits(`${index + 1} / ${total} · ${input.verseKey}`, input.language ?? "en");
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
  } else drawInkTop(ctx, shareDisplayDigits(input.verseKey, input.language ?? "en"), 540, page.height - 118);
  ctx.direction = "ltr";
  ctx.textAlign = "center";
  drawWebsiteText(ctx, 540, page.height - 72, "#526055");
  return canvas;
}

export async function generateAyahCards(input: AyahCardInput, signal?: AbortSignal) {
  const checkCancelled = () => signal?.throwIfAborted();
  checkCancelled();
  const arabicDrawing = await prepareAyahMushafRendering(input.text, input.verseKey, input.pageNumber);
  checkCancelled();
  const drawingInput = arabicDrawing ? { ...input, arabicDrawing } : input;
  if (document.fonts)
    await Promise.all([
      document.fonts.load(
        `400 64px ${arabicDrawing?.fontFamily ?? AYAH_MUSHAF_FONT}`,
        arabicDrawing?.text ?? input.text,
      ),
      document.fonts.load(`400 46px ${SHARE_UI_FONT}`, "Translation المصدر"),
      document.fonts.ready,
    ]);
  checkCancelled();
  const measure = document.createElement("canvas").getContext("2d")!;
  const pages = layoutAyahCards(measure, drawingInput);
  const result: { file: File; url: string; page: AyahCardPage; width: number; height: number }[] = [];
  try {
    for (const [index, page] of pages.entries()) {
      checkCancelled();
      const canvas = renderAyahCard(drawingInput, page, index, pages.length);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("PNG encoding failed."))), "image/png"),
      );
      checkCancelled();
      result.push({
        file: new File([blob], `ayah-${input.verseKey.replace(":", "-")}-${input.format}-${index + 1}.png`, {
          type: "image/png",
        }),
        url: URL.createObjectURL(blob),
        page,
        width: canvas.width,
        height: canvas.height,
      });
      // Give input and cancellation a turn between full-resolution cards.
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
    return result;
  } catch (cause) {
    result.forEach((page) => URL.revokeObjectURL(page.url));
    throw cause;
  }
}
