import fs from "node:fs";

let code = fs.readFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", "utf8");

// 1. Add id="p-X" to special pages
code = code.replace(
  '<div class="page" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">',
  '<div class="page" id="p-1" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">',
);
code = code.replace(
  '<div class="page" style="background:${t.bg}; color:${t.text};">\n        <div class="page-frame-outer"></div>\n        <div class="page-frame-inner"></div>\n        <div class="page-header">\n          <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>\n          <div class="header-chapter">بَيَانَاتُ النَّشْرِ وَالإِيدَاعِ</div>',
  '<div class="page" id="p-2" style="background:${t.bg}; color:${t.text};">\n        <div class="page-frame-outer"></div>\n        <div class="page-frame-inner"></div>\n        <div class="page-header">\n          <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>\n          <a href="#p-134" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">بَيَانَاتُ النَّشْرِ وَالإِيدَاعِ ↰</a>',
);
code = code.replace(
  '<div class="page" style="background:${t.bg}; color:${t.text};">\n        <div class="page-frame-outer"></div>\n        <div class="page-frame-inner"></div>\n        <div class="page-header">\n          <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>\n          <div class="header-chapter">وِرْدُ الصَّبَاحِ وَالْمَسَاءِ</div>',
  '<div class="page" id="p-17" style="background:${t.bg}; color:${t.text};">\n        <div class="page-frame-outer"></div>\n        <div class="page-frame-inner"></div>\n        <div class="page-header">\n          <div class="header-book-title">${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>\n          <a href="#p-134" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">وِرْدُ الصَّبَاحِ وَالْمَسَاءِ ↰</a>',
);
code = code.replace(
  '<div class="page" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">\n        <div class="page-frame-outer" style="border-color:${t.gold}; opacity:0.75;"></div>\n        <div class="page-frame-inner" style="border-color:${t.gold}; opacity:0.4;"></div>\n\n        <div style="margin-top:16mm;">',
  '<div class="page" id="p-137" style="background:${t.coverBg}; color:${t.coverText}; text-align:center;">\n        <div class="page-frame-outer" style="border-color:${t.gold}; opacity:0.75;"></div>\n        <div class="page-frame-inner" style="border-color:${t.gold}; opacity:0.4;"></div>\n\n        <div style="margin-top:16mm;">',
);

// 2. Add id="p-${p.page}" to normal pages
code = code.replace(
  '<div class="page ${densityClass}" style="background:${t.bg}; color:${t.text};">',
  '<div class="page ${densityClass}" id="p-${p.page}" style="background:${t.bg}; color:${t.text};">',
);

// 3. Make header chapter link back to TOC on page 134
code = code.replace(
  '<div class="header-chapter">${p.chapter}</div>',
  '<a href="#p-134" class="header-chapter" style="text-decoration:none; color:inherit;" title="انتقل إلى الفهرس">${p.chapter} ↰</a>',
);

// 4. Dedicated rendering for TOC pages (134, 135, 136)
const tocPageHandling = `    // Dedicated Table of Contents rendering (Pages 134, 135, 136)
    if (p.page >= 134 && p.page <= 136) {
      const partNumber = p.page === 134 ? "الأَوَّلُ" : p.page === 135 ? "الثَّانِي" : "الثَّالِثُ";
      const tocItems = (p.lines || [])
        .map((line) => {
          const match = line.match(/^(\\d+)\\s*\\.{3,}\\s*(.+)$/);
          if (match) {
            return { pageNum: parseInt(match[1], 10), title: match[2].trim() };
          }
          return null;
        })
        .filter(Boolean);

      pagesHtml += \`
      <div class="page" id="p-\${p.page}" style="background:\${t.bg}; color:\${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">\${ICONS.bookOpen}<span>الورد النبوي (الصغير)</span></div>
          <div class="header-chapter">فِهْرِسُ المَوْضُوعَاتِ</div>
        </div>

        <div class="devotional-body" style="justify-content:flex-start; gap:2mm;">
          <div class="chapter-banner" style="margin-bottom:1.5mm;">
            <div class="chapter-badge"><span>✦</span><span>فِهْرِسُ الكِتَابِ</span></div>
            <h2 class="chapter-title" style="font-size:11pt;">فِهْرِسُ المَوْضُوعَاتِ — الجُزْءُ \${partNumber}</h2>
          </div>

          <div class="toc-container">
            \${tocItems
              .map(
                (item) => \`
            <a href="#p-\${item.pageNum}" class="toc-item">
              <span class="toc-item-title">\${item.title}</span>
              <span class="toc-item-dots"></span>
              <span class="toc-item-page">\${toArabicNumeral(item.pageNum)}</span>
            </a>
            \`
              )
              .join("")}
          </div>
        </div>

        <div class="page-footer">
          <span>الورد النبوي (الصغير)</span>
          <span class="footer-page-pill">— ص \${toArabicNumeral(p.page)} —</span>
          <span>فهرس الموضوعات</span>
        </div>
      </div>
      \`;
      continue;
    }

`;

const normalPagesStart = "    // Normal Devotional Content Pages";
code = code.replace(normalPagesStart, tocPageHandling + normalPagesStart);

// 5. Repetition Badge & Virtue Callout in devotional pages
const devotionalFlowTarget = `        <div class="hadith-flow">
          <div class="hadith-card">
            <div class="hadith-text">\${formatHadithContent(fullText, t)}</div>
          </div>
        </div>`;

// Note: Replace the hadith-flow in the template
code = code.replace(
  devotionalFlowTarget,
  `\${(() => {
        let repeatBadge = "";
        if (fullText.includes("ثَلَاثَ مَرَّاتٍ") || fullText.includes("ثَلَاثًا") || fullText.includes("3 مرات") || fullText.includes("ثَلاَثَ مَرَّاتٍ")) {
          repeatBadge = "🔁 ٣ مَرَّاتٍ";
        } else if (fullText.includes("مِائَةَ مَرَّةٍ") || fullText.includes("مِائَةً") || fullText.includes("100 مرة") || fullText.includes("مِائَةِ مَرَّةٍ")) {
          repeatBadge = "🔁 ١٠٠ مَرَّةٍ";
        } else if (fullText.includes("عَشْرَ مَرَّاتٍ") || fullText.includes("عَشْرًا") || fullText.includes("10 مرات") || fullText.includes("عَشْرِ مَرَّاتٍ")) {
          repeatBadge = "🔁 ١٠ مَرَّاتٍ";
        } else if (fullText.includes("سَبْعَ مَرَّاتٍ") || fullText.includes("سَبْعًا") || fullText.includes("7 مرات") || fullText.includes("سَبْعِ مَرَّاتٍ")) {
          repeatBadge = "🔁 ٧ مَرَّاتٍ";
        } else if (fullText.includes("أَرْبَعَ مَرَّاتٍ") || fullText.includes("أَرْبَعًا") || fullText.includes("4 مرات")) {
          repeatBadge = "🔁 ٤ مَرَّاتٍ";
        } else if (fullText.includes("مَرَّتَيْنِ") || fullText.includes("مَرَّتَانِ")) {
          repeatBadge = "🔁 مَرَّتَيْنِ";
        }

        let virtueCallout = "";
        if (fullText.includes("حِرْزًا مِنَ الشَّيْطَانِ") || fullText.includes("عِصْمَةٌ")) {
          virtueCallout = "حِرْزٌ وَأَمَانٌ مِنَ الشَّيْطَانِ وَعِصْمَةٌ لِذَلِكَ اليَوْمِ";
        } else if (fullText.includes("غُفِرَتْ ذُنُوبُهُ") || fullText.includes("غُفِرَتْ لَهُ ذُنُوبُهُ")) {
          virtueCallout = "مَغْفِرَةُ الذُّنُوبِ وَحَطُّ الخَطَايَا وَإِنْ كَانَتْ مِثْلَ زَبَدِ البَحْرِ";
        } else if (fullText.includes("كَانَتْ لَهُ عِدْلَ")) {
          virtueCallout = "عِدْلُ عِتْقِ الرِّقَابِ وَكِتَابَةُ مِائَةِ حَسَنَةٍ وَمَحْوُ مِائَةِ سَيِّئَةٍ";
        } else if (fullText.includes("كَفَتَاهُ") || fullText.includes("لَمْ يَضُرَّهُ شَيْءٌ")) {
          virtueCallout = "كِفَايَةٌ وَعِصْمَةٌ وَوِقَايَةٌ مِنْ كُلِّ ضَرَرٍ وَشَرٍّ";
        } else if (fullText.includes("حُرِّمَ عَلَى النَّارِ") || fullText.includes("أَعَاذَهُ اللهُ")) {
          virtueCallout = "البَرَاءَةُ وَالأَمَانُ مِنَ النَّارِ يَوْمَ القِيَامَةِ";
        } else if (fullText.includes("كَانَ حَقًّا عَلَى اللهِ أَنْ يُرْضِيَهُ")) {
          virtueCallout = "مَوْعُودُ الرِّضَا مِنَ اللهِ سُبْحَانَهُ وَتَعَالَى يَوْمَ القِيَامَةِ";
        }

        return \`
        <div class="hadith-flow">
          <div class="hadith-card">
            \${repeatBadge ? \`
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5mm;">
              <span style="font-size:6.8pt; color:\${t.gold}; font-weight:700;">✦ ذِكْرٌ مَأْثُورٌ</span>
              <span class="repeat-pill">\${repeatBadge}</span>
            </div>
            \` : ""}
            <div class="hadith-text">\${formatHadithContent(fullText, t)}</div>
            \${virtueCallout ? \`
            <div class="virtue-callout">
              <span class="virtue-tag">✦ الفَضْلُ وَالثَّمَرَةُ:</span> \${virtueCallout}
            </div>
            \` : ""}
          </div>
        </div>
        \`;
      })()}`,
);

// 6. Add CSS for TOC items, repeat-pill, and virtue-callout
const cssTarget = "    .hadith-card {";
const newCssRules = `    /* TOC Interactive Styles */
    .toc-container {
      display: flex;
      flex-direction: column;
      gap: 1.4mm;
      flex: 1;
      justify-content: center;
      padding: 1.5mm 3mm;
      background: \${t.canvasBg};
      border: 1px solid \${t.divider};
      border-radius: 8px;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      text-decoration: none;
      color: inherit;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      transition: color 0.15s ease;
    }
    .toc-item:hover {
      color: \${t.gold};
    }
    .toc-item-title {
      font-weight: 600;
      white-space: nowrap;
    }
    .toc-item-dots {
      flex: 1;
      border-bottom: 1px dotted \${t.divider};
      margin: 0 2mm;
      min-width: 5mm;
      height: 1px;
    }
    .toc-item-page {
      font-weight: 700;
      color: \${t.gold};
      min-width: 6mm;
      text-align: left;
    }

    /* Repetition & Virtue Badges */
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
      padding: 0.2mm 2.2mm;
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
      margin-top: 1.8mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
      color: \${t.text};
    }
    .virtue-tag {
      font-weight: 700;
      color: \${t.emerald};
      white-space: nowrap;
    }
`;

code = code.replace(cssTarget, newCssRules + cssTarget);

fs.writeFileSync("docs/external-sources/generate_book3_al_wird_an_nabawi.mjs", code, "utf8");
console.log("Successfully applied Book 3 interactive navigation, repetition badges, and virtue callouts!");
