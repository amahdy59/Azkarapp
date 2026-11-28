import fs from "node:fs";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";
import {
  applyProseAuditCorrection,
  correctedSourceChapter,
  correctedSourcePage,
  loadRestoredMukhtar,
} from "../docs/external-sources/book-content.mjs";

const withoutMarks = (text) =>
  text
    .normalize("NFC")
    .replace(/[\u064b-\u065f\u0670\u06d6-\u06edـ]/g, "")
    .replace(/ٱ/g, "ا");
const sourcePage = (book, number) => {
  const file = book === "al-mukhtar" ? "book1_al_mukhtar_pages.json" : "book3_al_wird_an_nabawi_pages.json";
  const original = JSON.parse(fs.readFileSync(`docs/external-sources/${file}`, "utf8"))[number - 1];
  return new JSDOM(correctedSourcePage(book, original)).window.document;
};
const canonical = (keys) => {
  const verses = new Map();
  for (const file of fs.readdirSync("public/data/mushaf"))
    for (const verse of JSON.parse(fs.readFileSync(`public/data/mushaf/${file}`, "utf8")))
      if (keys.includes(verse.k))
        verses.set(
          verse.k,
          verse.w
            .filter((word) => !word[2])
            .map((word) => word[3])
            .join(" "),
        );
  return keys
    .map((key) => verses.get(key))
    .join(" ")
    .replace(/\s+/g, " ");
};
const quotationText = (pages) =>
  pages
    .flatMap((page) => [...page.querySelectorAll(".quran-quote")])
    .map((node) => node.textContent.replace(/[﴿﴾]/g, "").trim())
    .join(" ")
    .replace(/\s+/g, " ");

describe("source-compared book extraction repairs", () => {
  it("retains all 207 numbered source items as separate entries", () => {
    const document = new JSDOM(fs.readFileSync("docs/external-sources/book1_al_mukhtar/al_mukhtar_light.html", "utf8"))
      .window.document;
    const numbers = [...document.querySelectorAll(".dua-num-pill")].map((node) =>
      Number(node.textContent.replace(/[٠-٩]/g, (digit) => "٠١٢٣٤٥٦٧٨٩".indexOf(digit))),
    );
    expect(numbers).toEqual(Array.from({ length: 207 }, (_, index) => index + 1));
  });
  it("keeps the source's mixed prose distinct from canonical Quran excerpts", () => {
    const { restored } = loadRestoredMukhtar();
    expect(restored).toHaveLength(48);
    const mixed = restored.find((item) => item.number === 70);
    expect(mixed.line).toContain("رَبِّ أَلْحِقْنِي بِالصَّالِحِينَ. ﴿");
    expect(mixed.ranges).toEqual([
      ["26:84", 1, 6],
      ["26:85", 1, 5],
    ]);
    expect(restored.find((item) => item.number === 43).reference).toBe("الأعراف: ٨٩");
    for (const item of restored) expect(item.text).not.toMatch(/[\ue000-\uf8ff\ufffd]/u);
  });
  it("restores the original introduction, exact Quran boundaries and the complete quoted verse", () => {
    const intro = sourcePage("al-mukhtar", 4);
    expect(intro.body.textContent).toContain("[أحمد وغيره]");
    expect(intro.body.textContent).not.toContain("[رواه أحمد والترمذي، صحيح]");
    const continuation = sourcePage("al-mukhtar", 5);
    const excerpt = withoutMarks(continuation.querySelector(".quran-quote").textContent);
    expect(excerpt).toContain("أمن يجيب المضطر إذا دعاه");
    expect(excerpt).not.toContain("ويكشف");
    expect(continuation.body.textContent.trim()).toMatch(/أبو محمد$/);
    const narration = sourcePage("al-mukhtar", 6);
    expect(narration.body.textContent).toContain("بْنِ بَشِيرٍ رَضِيَ اللهُ عَنْهُمَا");
    expect(withoutMarks(narration.querySelector(".quran-quote").textContent)).toContain(
      "إن الذين يستكبرون عن عبادتى سيدخلون جهنم داخرين",
    );
  });
  it("restores the omitted tawaf and Safa/Marwah quotations without expanding their source excerpts", () => {
    const tawaf = sourcePage("al-mukhtar", 61);
    expect(tawaf.querySelectorAll(".quran-quote")).toHaveLength(2);
    expect(withoutMarks(tawaf.body.textContent)).toContain("وقنا عذاب النار");
    expect(withoutMarks(tawaf.body.textContent)).toContain("واتخذوا من مقام إبرهم مصلى");
    const safa = sourcePage("al-mukhtar", 62);
    expect(withoutMarks(safa.querySelector(".quran-quote").textContent)).toContain("فإن الله شاكر عليم");
    expect(withoutMarks(safa.body.textContent)).toContain("وهزم الأحزاب وحده»");
    const marwah = sourcePage("al-mukhtar", 63);
    expect(withoutMarks(marwah.querySelector(".quran-quote").textContent)).not.toContain("فمن");
    expect(withoutMarks(marwah.body.textContent)).toContain("في الشوط الأول فقط");
  });
  it("keeps repaired supplication wording and damaged references in their source order", () => {
    const { records } = loadRestoredMukhtar();
    expect(records[45].lines[1]).toBe("وَأَعْطِنَا وَلَا تَحْرِمْنَا، وَآثِرْنَا وَلَا تُؤْثِرْ عَلَيْنَا،");
    expect(records[45].lines[2]).toBe("وَارْضِنَا وَارْضَ عَنَّا [الترمذي، بإسناد حسن]");
    expect(records[46].lines[8]).toContain("رَكْعَتَيْنِ، ثُمَّ يَقُولُ:");
    expect(records[32].lines[7]).toContain("[الطبراني في «الصغير»، بإسناد جيد]");
    expect(records[58].lines[6]).toMatch(/\[أحمد\]$/);
  });
  it("rejects stale, duplicate and unrecorded prose edits rather than trusting replacement lines", () => {
    const ledger = JSON.parse(fs.readFileSync("docs/external-sources/book-prose-audit-corrections.json", "utf8"));
    for (const correction of ledger.changes) {
      const before = [...correction.lines];
      for (const edit of correction.edits) before[edit.line] = edit.before;
      expect(applyProseAuditCorrection(before, correction)).toEqual(correction.lines);
      expect(before).not.toBe(correction.lines);
      expect(() => applyProseAuditCorrection([...before, "changed"], correction)).toThrow(/Changed prose-audit input/);
      expect(() =>
        applyProseAuditCorrection(before, { ...correction, lines: [...correction.lines, "unrecorded"] }),
      ).toThrow(/Unrecorded/);
      expect(() =>
        applyProseAuditCorrection(before, { ...correction, edits: [...correction.edits, correction.edits[0]] }),
      ).toThrow(/Invalid/);
    }
  });
  it("restores the printed wind narration and its partial Quran excerpt, with no imported repetition", () => {
    const wind = sourcePage("al-wird-an-nabawi", 118);
    expect(withoutMarks(wind.body.textContent)).toContain("عن عطاء بن أبي رباح");
    expect(withoutMarks(wind.body.textContent)).toContain("إذا عصفت الريح");
    expect(wind.body.textContent).not.toMatch(/مَرَّتَيْنِ|ثَلَاثًا|صَيِّبًا/);
    expect(withoutMarks(wind.querySelector(".quran-quote").textContent)).not.toContain("بل هو");
    expect(wind.body.textContent).toContain("أخرجه مسلم.");
  });
  it("starts the bedtime chapter on its original page, preserving the preceding verse and complete first report", () => {
    const original = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
    expect(correctedSourceChapter("al-wird-an-nabawi", original[32])).toBe(original[31].chapter);
    expect(correctedSourceChapter("al-wird-an-nabawi", original[33])).toBe("وِرْدُ النَّوْمِ");
    const before = sourcePage("al-wird-an-nabawi", 33);
    expect(quotationText([before])).toBe(canonical(["23:118"]).split(" ").slice(2).join(" "));
    expect(withoutMarks(before.body.textContent)).toContain("أو غيرها من صيغ الاستغفار");
    const bedtime = sourcePage("al-wird-an-nabawi", 34);
    expect(withoutMarks(bedtime.body.textContent)).toContain("عن عروة، عن عائشة");
    expect(withoutMarks(bedtime.body.textContent)).toContain("يفعل ذلك ثلاث مرات");
    expect(withoutMarks(bedtime.querySelector(".source-note").textContent)).toContain(
      "لأن التفل لا يكون إلا ومعه شيء من الريق",
    );
  });
  it("keeps both bedtime verses complete across their source pages and restores the surrounding chains and glossary", () => {
    const pages = [36, 37].map((page) => sourcePage("al-wird-an-nabawi", page));
    expect(quotationText(pages)).toBe(canonical(["2:285", "2:286"]));
    expect(pages[0].body.textContent).toContain("عَنْ عَلْقَمَةَ");
    expect(pages[0].querySelectorAll(".source-note")).toHaveLength(3);
    expect(pages[0].body.textContent).not.toContain("مَنْ قَرَأَهُمَا");
    expect(pages[1].body.textContent).toContain("فَسَأَلْتُهُ فَحَدَّثَنِيهِ");
    expect(pages[1].body.textContent).toContain("وَحَذْفُ الْمُتَعَلَّقِ مُشْعِرٌ بِالْعُمُومِ");
    expect(pages[1].body.textContent).toContain("بِصَنِفَةِ ثَوْبِهِ ثَلَاثَ مَرَّاتٍ");
    expect(pages[1].body.textContent.trim()).toMatch(/وَإِنْ$/);
  });
  it("restores all after-prayer alternatives and whole Quran sequences with no missing or duplicated continuation words", () => {
    const pages = [96, 97, 98].map((page) => sourcePage("al-wird-an-nabawi", page));
    expect(quotationText(pages)).toBe(
      canonical([
        "112:1",
        "112:2",
        "112:3",
        "112:4",
        "113:1",
        "113:2",
        "113:3",
        "113:4",
        "113:5",
        "114:1",
        "114:2",
        "114:3",
        "114:4",
        "114:5",
        "114:6",
        "2:255",
      ]),
    );
    expect(pages[0].body.textContent).toContain("أَرْبَعًا وَثَلَاثِينَ");
    expect(pages[0].body.textContent.match(/خَمْسًا وَعِشْرِينَ/g)).toHaveLength(4);
    expect(pages[0].body.textContent.match(/عَشْرَ مَرَّاتٍ/g)).toHaveLength(3);
    expect(pages[2].body.textContent).toContain("بَعْدَ صَلَاةِ الْمَغْرِبِ وَالصُّبْحِ");
    expect(pages[2].body.textContent).toContain("سُبْحَانَ الْمَلِكِ الْقُدُّوسِ ثَلَاثَ مَرَّاتٍ");
    const original = JSON.parse(
      fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"),
    )[96];
    expect(correctedSourceChapter("al-wird-an-nabawi", original)).toBe("التَّسْبِيحُ وَالتَّحْمِيدُ وَالتَّكْبِيرُ");
    expect(() => correctedSourceChapter("al-wird-an-nabawi", { ...original, lines: [] })).toThrow(/Changed source/);
  });
  it("restores advisory paragraphs, two distinct statements and isolated exact source references", () => {
    const original = JSON.parse(fs.readFileSync("docs/external-sources/book1_al_mukhtar_pages.json", "utf8")).find(
      (page) => page.page === 60,
    );
    const html = correctedSourcePage("al-mukhtar", original);
    const document = new JSDOM(html).window.document;
    expect(document.querySelectorAll("p")).toHaveLength(8);
    expect(document.body.textContent).toContain("دُعَاءً مَأْثُورًا، وَأَرَادَ أَنْ يَكْتُبَ أَدْعِيَةً مَأْثُورَةً");
    expect(document.body.textContent).not.toMatch(/\p{M}{5,}/u);
    expect([...document.querySelectorAll('bdi[dir="ltr"]')].map((node) => node.textContent)).toEqual(["٦/٧", "٩١"]);
    expect(() => correctedSourcePage("al-mukhtar", { ...original, lines: [] })).toThrow(/Changed source extraction/);
  });
  it("retains the travel chain, three takbirs, full continuation and five glossary entries", () => {
    const pages = JSON.parse(fs.readFileSync("docs/external-sources/book3_al_wird_an_nabawi_pages.json", "utf8"));
    const html = [125, 126]
      .map((number) =>
        correctedSourcePage(
          "al-wird-an-nabawi",
          pages.find((page) => page.page === number),
        ),
      )
      .join(" ");
    const document = new JSDOM(html).window.document;
    expect(document.body.textContent).toContain("عَلِيًّا الْأَزْدِيَّ");
    expect(document.body.textContent).toContain("كَبَّرَ ثَلَاثًا");
    expect(document.body.textContent).toContain("وَمِنَ الْعَمَلِ مَا تَرْضَى");
    expect(document.body.textContent).toContain("وَالْأَهْلِ»");
    expect(document.body.textContent).toContain("آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ");
    expect(document.body.textContent).toContain("أخرجه البخاري");
    expect(document.querySelectorAll(".source-note")).toHaveLength(5);
    expect(document.querySelector(".quran-quote").textContent).toContain("سُبْحَـٰنَ");
  });
});
