import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import extractionCorrections from "./mukhtar-extraction-corrections.json" with { type: "json" };
import quranCorrections from "./mukhtar-quran-corrections.json" with { type: "json" };
import sourceCorrections from "./book-source-corrections.json" with { type: "json" };
import proseAudit from "./book-prose-audit-corrections.json" with { type: "json" };
import { wirdSourceChapter } from "./wird-source-navigation.mjs";

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function sourceCorrection(book, original) {
  const correction = sourceCorrections.changes.find((item) => item.book === book && item.page === original.page);
  if (!correction) return null;
  const digest = createHash("sha256").update(JSON.stringify(original)).digest("hex");
  if (digest !== correction.beforeSha256) throw new Error(`Changed source extraction ${book} p${original.page}`);
  return correction;
}

export function correctedSourceChapter(book, original) {
  return (
    sourceCorrection(book, original)?.chapter ??
    (book === "al-wird-an-nabawi" ? wirdSourceChapter(original) : original.chapter)
  );
}

/** Source-specific paragraphs; no runtime interpretation or replacement of app content. */
export function correctedSourcePage(book, original, root = path.resolve(import.meta.dirname, "../..")) {
  const correction = sourceCorrection(book, original);
  if (!correction) return null;
  const ranges = correction.blocks.flatMap((block) => block.ranges ?? []);
  const words = new Map();
  if (ranges.length) {
    for (const file of fs.readdirSync(path.join(root, "public/data/mushaf")))
      for (const verse of JSON.parse(fs.readFileSync(path.join(root, "public/data/mushaf", file), "utf8")))
        if (ranges.some(([key]) => key === verse.k))
          words.set(verse.k, [...(words.get(verse.k) ?? []), ...verse.w.filter((word) => !word[2])]);
  }
  return correction.blocks
    .map((block) => {
      let content;
      if (block.ranges) {
        content =
          "﴿" +
          block.ranges
            .map(([key, start, end]) => {
              const selection = words
                .get(key)
                ?.filter(([index]) => index >= start && index <= end)
                .sort((a, b) => a[0] - b[0]);
              if (selection?.length !== end - start + 1) throw new Error(`Incomplete source range ${key}`);
              return selection.map((word) => escapeHtml(word[3])).join(" ");
            })
            .join(" ") +
          "﴾";
      } else
        content = block.parts
          ? block.parts
              .map((part) =>
                typeof part === "string" ? escapeHtml(part) : `<bdi dir="ltr">${escapeHtml(part.ltr)}</bdi>`,
              )
              .join("")
          : escapeHtml(block.text);
      const tag = block.kind === "title" ? "h1" : block.kind === "heading" ? "h3" : "p";
      return `<${tag} class="${{ text: "body-text", meta: "source-note-meta narrator-line", note: "source-note", quran: "quran-quote", heading: "section-title", title: "source-cover-title" }[block.kind]}">${content}</${tag}>`;
    })
    .join("\n");
}

// Source: al-Mukhtar, 12th edition, printed pages 32-35, visually compared
// 2026-11-25. Word positions copy the existing reviewed Mushaf text unchanged.
// These are source excerpts, not necessarily complete verses.
export const MUKHTAR_RESTORATIONS = [
  ...quranCorrections.changes,
  { page: 32, number: 100, reference: "نوح: ٢٨", ranges: [["71:28", 1, 4]] },
  { page: 32, number: 101, reference: "النمل: ١٩", ranges: [["27:19", 6, 24]] },
  { page: 32, number: 102, reference: "الأحقاف: ١٥", ranges: [["46:15", 22, 45]] },
  { page: 32, number: 103, reference: "الإسراء: ٢٤", ranges: [["17:24", 8, 12]] },
  {
    page: 32,
    number: 104,
    reference: "إبراهيم: ٤٠–٤١",
    ranges: [
      ["14:40", 1, 9],
      ["14:41", 1, 8],
    ],
  },
  { page: 32, number: 105, reference: "آل عمران: ٣٨", ranges: [["3:38", 6, 15]] },
  // Printed p32/item106 says "رب هب لي من الصالحين" (37:100), not 26:83.
  { page: 32, number: 106, reference: "الصافات: ١٠٠", ranges: [["37:100", 1, 5]] },
  { page: 33, number: 107, reference: "الفرقان: ٧٤", ranges: [["25:74", 3, 13]] },
  { page: 34, number: 111, reference: "البقرة: ٢٨٦", ranges: [["2:286", 13, 49]] },
  { page: 34, number: 112, reference: "آل عمران: ٥٣", ranges: [["3:53", 1, 9]] },
  {
    page: 34,
    number: 113,
    reference: "طه: ٢٥–٢٦",
    ranges: [
      ["20:25", 2, 5],
      ["20:26", 1, 3],
    ],
  },
  { page: 34, number: 114, reference: "يوسف: ١٠١", ranges: [["12:101", 13, 21]] },
  { page: 34, number: 115, reference: "الإسراء: ٨٠", ranges: [["17:80", 2, 14]] },
  // Printed p34/item116 says "رب انصرني على القوم المفسدين" (29:30).
  { page: 34, number: 116, reference: "العنكبوت: ٣٠", ranges: [["29:30", 2, 6]] },
  {
    page: 34,
    number: 117,
    reference: "الشعراء: ٨٣–٨٥",
    ranges: [
      ["26:83", 1, 6],
      ["26:84", 1, 6],
      ["26:85", 1, 5],
    ],
  },
  { page: 35, number: 118, reference: "الأعراف: ١٢٦", ranges: [["7:126", 11, 16]] },
  { page: 35, number: 119, reference: "البقرة: ٢٥٠", ranges: [["2:250", 6, 15]] },
  {
    page: 35,
    number: 120,
    reference: "يونس: ٨٥–٨٦",
    ranges: [
      ["10:85", 5, 10],
      ["10:86", 1, 5],
    ],
  },
  { page: 35, number: 121, reference: "الأنبياء: ٨٧", ranges: [["21:87", 15, 23]] },
];

export function arabicNumber(n) {
  return String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

export function applyProseAuditCorrection(lines, correction) {
  if (createHash("sha256").update(JSON.stringify(lines)).digest("hex") !== correction.beforeSha256)
    throw new Error(`Changed prose-audit input p${correction.page}`);
  const result = [...lines];
  const changed = new Set();
  for (const edit of correction.edits) {
    if (
      !Number.isInteger(edit.line) ||
      edit.line < 0 ||
      edit.line >= lines.length ||
      changed.has(edit.line) ||
      lines[edit.line] !== edit.before ||
      typeof edit.after !== "string"
    )
      throw new Error(`Invalid prose-audit edit p${correction.page}`);
    changed.add(edit.line);
    result[edit.line] = edit.after;
  }
  if (JSON.stringify(result) !== JSON.stringify(correction.lines))
    throw new Error(`Unrecorded prose-audit change p${correction.page}`);
  return result;
}

export function loadRestoredMukhtar(root = path.resolve(import.meta.dirname, "../..")) {
  const records = JSON.parse(
    fs.readFileSync(path.join(root, "docs/external-sources/book1_al_mukhtar_pages.json"), "utf8"),
  );
  // Retain source-comparison paragraph structure before token-map repairs.
  for (const page of records) {
    const html = correctedSourcePage("al-mukhtar", page, root);
    if (html) page.correctedHtml = html;
  }
  for (const correction of extractionCorrections.pages) {
    const page = records.find((record) => record.page === correction.page);
    const before = page.lines.join("\n");
    if (createHash("sha256").update(before).digest("hex") !== correction.beforeSha256)
      throw new Error(`Changed Al-Mukhtar extraction source p${correction.page}`);
    let after = before;
    for (const item of [...correction.replacements].reverse()) {
      if (after.slice(item.start, item.end) !== item.before) throw new Error("Source correction no longer matches");
      after = after.slice(0, item.start) + item.after + after.slice(item.end);
    }
    if (after !== correction.lines.join("\n")) throw new Error("Source correction text differs from its ledger");
    // Later quotation restoration splices the working page. Never mutate the
    // imported correction ledger: a second verification/build must be identical.
    page.lines = [...correction.lines];
  }
  const words = new Map();
  const wanted = new Set(MUKHTAR_RESTORATIONS.flatMap((r) => r.ranges.map(([key]) => key)));
  for (const file of fs.readdirSync(path.join(root, "public/data/mushaf"))) {
    for (const verse of JSON.parse(fs.readFileSync(path.join(root, "public/data/mushaf", file), "utf8"))) {
      if (!wanted.has(verse.k)) continue;
      words.set(verse.k, [...(words.get(verse.k) ?? []), ...verse.w.filter((word) => !word[2])]);
    }
  }
  const restored = MUKHTAR_RESTORATIONS.map((r) => {
    const text = r.ranges
      .map(([key, start, end]) => {
        const selection = words
          .get(key)
          .filter(([index]) => index >= start && index <= end)
          .sort((a, b) => a[0] - b[0]);
        if (selection.length !== end - start + 1) throw new Error(`Incomplete source range ${key}:${start}-${end}`);
        return selection.map((word) => word[3]).join(" ");
      })
      .join(" ❖ ");
    return {
      ...r,
      text,
      line: `(${arabicNumber(r.number)}) ${r.prefix ? `${r.prefix} ` : ""}﴿${text}﴾ [${r.reference}]`,
    };
  });
  for (const p of records) {
    if (p.page === 32 || p.page === 34) p.lines = restored.filter((r) => r.page === p.page).map((r) => r.line);
    if (p.page === 33)
      p.lines = [restored.find((r) => r.number === 107).line, ...p.lines.filter((line) => line.trim() !== "107")];
    if (p.page === 35) {
      const start = p.lines.findIndex((line) => line.includes("122"));
      if (start < 0) throw new Error("Missing unchanged narration 122 boundary");
      p.lines = [...restored.filter((r) => r.page === 35).map((r) => r.line), ...p.lines.slice(start)];
    }
  }
  const numberOf = (line) => {
    const normalized = line.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
    const match =
      normalized.match(/^\((\d{1,3})\)/) ||
      normalized.match(/^(\d{1,3})$/) ||
      normalized.match(/«[^«]*?\s+(\d{1,3})\s*$/);
    return match ? Number(match[1]) : undefined;
  };
  for (const correction of quranCorrections.changes) {
    const page = records.find((page) => page.page === correction.page);
    const start = page.lines.findIndex((line) => numberOf(line) === correction.number);
    if (start < 0) throw new Error(`Missing original item boundary ${correction.number}`);
    let end = start + 1;
    while (end < page.lines.length && numberOf(page.lines[end]) === undefined) end++;
    page.lines.splice(start, end - start, restored.find((item) => item.number === correction.number).line);
  }
  for (const correction of proseAudit.changes.filter((item) => item.book === "al-mukhtar")) {
    const page = records.find((record) => record.page === correction.page);
    page.lines = applyProseAuditCorrection(page.lines, correction);
    if (correction.footnoteLines) page.footnoteLines = [...correction.footnoteLines];
  }
  return { records, restored };
}

// Exact excerpts from the existing source, retaining conditions and alternatives.
// Never derive a prescription from a numeral that may describe a reward (p64),
// or match "أربعًا" inside "أربعًا وثلاثين" (p39).
export const WIRD_NOTES = {
  26: {
    repeat: ["ثَلَثَ مَرَّاتٍ"],
    virtue: ["لَمْ يَضُرَّهُ شَيْءٌ فِي ذَلِكَ الْيَوْمِ أَوْ فِي تِلْكَ اللَّيْلَةِ"],
  },
  31: {
    repeat: ["فِي يَوْمٍ مِائَةَ مَرَّةٍ"],
    virtue: ["وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ"],
  },
  32: { repeat: ["فِي الْيَوْمِ مِائَةَ مَرَّةٍ"] },
  34: { repeat: ["يَفْعَلُ ذَلِكَ ثَلَاثَ مَرَّاتٍ"] },
  37: { virtue: ["مَنْ قَرَأَهُمَا فِي لَيْلَةٍ كَفَتَاهُ"] },
  39: { repeat: ["ثَلَثًا وَثَلَثِينَ، وَاحْمَدَا ثَلَثًا وَثَلَثِينَ،", "وَاللهُ أَكْبَرُ أَرْبَعًا وَثَلَثِينَ"] },
  107: { virtue: ["لَمْ يَضُرَّهُ شَيْءٌ حَتَّى", "يَرْتَحِلَ مِنْ مَنْزِلِهِ ذَلِكَ"], separated: true },
  109: { repeat: ["وَقُلْ: بِاسْمِ اللهِ ثَلَثًا، وَقُلْ سَبْعَ مَرَّاتٍ:"] },
  125: { repeat: ["كَبَّرَ ثَلَاثًا"] },
};

export function exactNotes(text, page) {
  const note = WIRD_NOTES[page];
  if (!note) return [];
  return Object.entries(note)
    .filter(([kind]) => kind !== "separated")
    .map(([kind, quotes]) => {
      for (const quote of quotes)
        if (!text.includes(quote)) throw new Error(`Source excerpt missing on Wird p${page}: ${quote}`);
      // The split extraction on p107 is not safe to summarize as a new sentence.
      // Keep both exact fragments visibly separated, with no expanded claim.
      return { kind, quotes };
    });
}
