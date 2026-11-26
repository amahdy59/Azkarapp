import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", "utf8");

// 1. Add id="p-${p.page}" to page divs
code = code.replace(
  '<div class="page" style="background:${t.bg}; color:${t.text};">',
  '<div class="page" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">',
);
code = code.replace(
  '<div class="page page-intro" style="background:${t.bg}; color:${t.text};">',
  '<div class="page page-intro" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">',
);

// 2. Make TOC items clickable <a> links
const oldTocItem = `                <div class="toc-item">
                  <span class="toc-item-title">\${title}</span>
                  <span class="toc-item-leader"></span>
                  <span class="toc-item-page">\${toArabicNumeral(pageNum)}</span>
                </div>`;

const newTocItem = `                <a href="#p-\${pageNum}" class="toc-item">
                  <span class="toc-item-title">\${title}</span>
                  <span class="toc-item-leader"></span>
                  <span class="toc-item-page">\${toArabicNumeral(pageNum)}</span>
                </a>`;

code = code.replace(oldTocItem, newTocItem);

// 3. Make header chapter link back to TOC (page 2)
code = code.replace(
  '<div class="header-chapter">${p.chapter}</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">${p.chapter} ↰</a>',
);
code = code.replace(
  '<div class="header-chapter">المُقَدِّمَةُ</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">المُقَدِّمَةُ ↰</a>',
);
code = code.replace(
  '<div class="header-chapter">المُقَدِّمَةُ (تَتِمَّةٌ)</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">المُقَدِّمَةُ (تَتِمَّةٌ) ↰</a>',
);
code = code.replace(
  '<div class="header-chapter">آدَابُ الدُّعَاءِ وَأَسْبَابُ إِجَابَتِهِ</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">آدَابُ الدُّعَاءِ ↰</a>',
);
code = code.replace(
  '<div class="header-chapter">تَنْبِيهٌ خَاصٌّ بِالحُجَّاجِ وَالمُعْتَمِرِينَ</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">تَنْبِيهٌ لِلْحُجَّاجِ ↰</a>',
);
code = code.replace(
  '<div class="header-chapter">كَفَّارَةُ المَجْلِسِ وَالخَاتِمَةُ</div>',
  '<a href="#p-2" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">كَفَّارَةُ المَجْلِسِ ↰</a>',
);

// 4. Update formatLuxuryFlow to detect repetition count and virtues
const flowSearch = "    // Clean any residual broken quote symbols and tatweel in raw";
const flowSearchIdx = code.indexOf(flowSearch);

const flowEnhancements = `    // Detect repetition count
    let repeatBadge = "";
    if (raw.includes("ثَلَاثَ مَرَّاتٍ") || raw.includes("ثَلَاثًا") || raw.includes("3 مرات") || raw.includes("ثَلاَثَ مَرَّاتٍ")) {
      repeatBadge = "🔁 ٣ مَرَّاتٍ";
    } else if (raw.includes("مِائَةَ مَرَّةٍ") || raw.includes("مِائَةَ مَرَّه") || raw.includes("100 مرة") || raw.includes("مِائَةِ مَرَّةٍ")) {
      repeatBadge = "🔁 ١٠٠ مَرَّةٍ";
    } else if (raw.includes("عَشْرَ مَرَّاتٍ") || raw.includes("10 مرات") || raw.includes("عَشْرِ مَرَّاتٍ")) {
      repeatBadge = "🔁 ١٠ مَرَّاتٍ";
    } else if (raw.includes("سَبْعَ مَرَّاتٍ") || raw.includes("7 مرات") || raw.includes("سَبْعِ مَرَّاتٍ")) {
      repeatBadge = "🔁 ٧ مَرَّاتٍ";
    } else if (raw.includes("أَرْبَعَ مَرَّاتٍ") || raw.includes("4 مرات")) {
      repeatBadge = "🔁 ٤ مَرَّاتٍ";
    } else if (raw.includes("مَرَّتَيْنِ") || raw.includes("مَرَّتَانِ")) {
      repeatBadge = "🔁 مَرَّتَيْنِ";
    }

    // Detect virtue / promised reward
    let virtueCallout = "";
    if (raw.includes("حِرْزًا مِنَ الشَّيْطَانِ")) {
      virtueCallout = "حِرْزٌ وَأَمَانٌ مِنَ الشَّيْطَانِ فِي ذَلِكَ اليَوْمِ";
    } else if (raw.includes("غُفِرَتْ ذُنُوبُهُ") || raw.includes("غُفِرَتْ لَهُ ذُنُوبُهُ")) {
      virtueCallout = "مَغْفِرَةُ الذُّنُوبِ وَإِنْ كَانَتْ مِثْلَ زَبَدِ البَحْرِ";
    } else if (raw.includes("كَفَتَاهُ")) {
      virtueCallout = "كِفَايَةٌ مِنْ كُلِّ سُوءٍ وَشَرٍّ فِي تِلْكَ اللَّيْلَةِ";
    } else if (raw.includes("لَمْ يَضُرَّهُ شَيْءٌ")) {
      virtueCallout = "عِصْمَةٌ وَوِقَايَةٌ مِنْ كُلِّ ضَرَرٍ وَأَذًى";
    } else if (raw.includes("حَطَّتْ عَنْهُ خَطَايَاهُ") || raw.includes("حُطَّتْ خَطَايَاهُ")) {
      virtueCallout = "حَطُّ الخَطَايَا وَرِفْعَةُ الدَّرَجَاتِ عِنْدَ اللهِ";
    } else if (raw.includes("أَعْتَقَ أَرْبَعَ رِقَابٍ")) {
      virtueCallout = "كَأَجْرِ مَنْ أَعْتَقَ أَرْبَعَةَ أَنْفُسٍ مِنْ وَلَدِ إِسْمَاعِيلَ";
    }

    `;

code = code.slice(0, flowSearchIdx) + flowEnhancements + code.slice(flowSearchIdx);

// 5. Insert repeatBadge into .dua-card-header and virtueCallout into card
const cardHeaderTarget = '${numStr ? `<span class="dua-num-pill">${numStr}</span>` : ""}';
const newCardHeaderTarget =
  '${numStr ? `<span class="dua-num-pill">${numStr}</span>` : ""}\n          ${repeatBadge ? `<span class="repeat-pill">${repeatBadge}</span>` : ""}';

code = code.replace(cardHeaderTarget, newCardHeaderTarget);

const cardTextTarget = '<div class="dua-text">${matn}</div>';
const newCardTextTarget =
  '<div class="dua-text">${matn}</div>\n      ${virtueCallout ? `<div class="virtue-callout"><span class="virtue-tag">✦ الفَضْلُ وَالثَّمَرَةُ:</span> ${virtueCallout}</div>` : ""}';

code = code.replace(cardTextTarget, newCardTextTarget);

// 6. Add CSS for repeat-pill, virtue-callout, and clickable toc-item
const cssTarget = "    .dua-num-pill {";
const newCssRules = `    .toc-item {
      display: flex;
      align-items: baseline;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      text-decoration: none;
      color: inherit;
      transition: color 0.15s ease;
    }
    .toc-item:hover {
      color: \${t.gold};
    }
    .repeat-pill {
      display: inline-flex;
      align-items: center;
      gap: 1mm;
      background: \${t.goldLight};
      color: \${t.amber};
      border: 0.75px solid \${t.amber};
      border-radius: 10px;
      font-weight: 700;
      font-size: 6.8pt;
      padding: 0.2mm 2mm;
      line-height: 1.2;
    }
    .virtue-callout {
      display: flex;
      align-items: baseline;
      gap: 1.5mm;
      background: rgba(19, 111, 72, 0.05);
      border: 0.5px solid \${t.emerald};
      border-radius: 4px;
      padding: 1mm 2.2mm;
      margin-top: 1mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.4pt;
      color: \${t.text};
    }
    .virtue-tag {
      font-weight: 700;
      color: \${t.emerald};
      white-space: nowrap;
    }
`;

code = code.replace(cssTarget, newCssRules + cssTarget);

fs.writeFileSync("docs/external-sources/generate_book1_al_mukhtar.mjs", code, "utf8");
console.log("Successfully applied Book 1 interactive navigation, repetition badges, and virtue callouts!");
