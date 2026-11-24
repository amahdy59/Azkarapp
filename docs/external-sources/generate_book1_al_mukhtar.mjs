import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "book1_al_mukhtar");
fs.mkdirSync(outputDir, { recursive: true });

const pagesData = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, "book1_al_mukhtar_pages.json"), "utf-8"),
);
const fonts = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "fonts_base64.json"), "utf-8"));

const ICONS = {
  bookOpen: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  sparkles: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
};

const THEMES = {
  light: {
    name: "light",
    bg: "#FBF9F5",
    canvasBg: "#FFFFFF",
    frameOuter: "#C5A869",
    frameInner: "#E8DCC4",
    text: "#1C1917",
    textMuted: "#6B655B",
    gold: "#9E7422",
    goldLight: "#F7F3EA",
    amber: "#A15C07",
    emerald: "#136F48",
    divider: "#E4DAC6",
    coverBg: "linear-gradient(145deg, #181512 0%, #2A241E 100%)",
    coverText: "#F5F0E8",
  },
  dark: {
    name: "dark",
    bg: "#0F0E0D",
    canvasBg: "#171513",
    frameOuter: "#B8860B",
    frameInner: "#383127",
    text: "#F5F0E8",
    textMuted: "#9E9484",
    gold: "#D4AF37",
    goldLight: "#262016",
    amber: "#F59E0B",
    emerald: "#10B981",
    divider: "#332C22",
    coverBg: "linear-gradient(145deg, #0A0908 0%, #1A1714 100%)",
    coverText: "#F5F0E8",
  },
  navy: {
    name: "navy",
    bg: "#0A1124",
    canvasBg: "#101B36",
    frameOuter: "#C99D32",
    frameInner: "#243763",
    text: "#F5F0E8",
    textMuted: "#8F9EB8",
    gold: "#E5B942",
    goldLight: "#18274C",
    amber: "#FBBF24",
    emerald: "#34D399",
    divider: "#1F3158",
    coverBg: "linear-gradient(145deg, #050B1A 0%, #0F1C38 100%)",
    coverText: "#F5F0E8",
  },
};

function toArabicNumeral(n) {
  return n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

function buildHtml(theme) {
  const t = THEMES[theme];
  let pagesHtml = "";

  for (const p of pagesData) {
    if (p.page === 1) {
      // Cover Page
      pagesHtml += `
      <div class="page cover-page" style="background: ${t.coverBg}; color: ${t.coverText}; text-align: center;">
        <div class="page-frame-outer" style="border-color: ${t.gold}; opacity: 0.75;"></div>
        <div class="page-frame-inner" style="border-color: ${t.gold}; opacity: 0.4;"></div>
        
        <div style="margin-top: 14mm;">
          <div style="font-family:'IBM Plex Arabic'; font-size:8.5pt; color:${t.gold}; font-weight:700; letter-spacing:1px; margin-bottom:5mm;">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
          </div>
          <div style="display:inline-block; border-bottom: 2px solid ${t.gold}; padding-bottom: 3.5mm; margin-bottom: 6mm;">
            <h1 style="font-family:'Amiri Quran'; font-size:28pt; font-weight:700; color:#FFFFFF; line-height:1.25; margin:0;">
              المُخْتَارُ
            </h1>
            <div style="font-family:'IBM Plex Arabic'; font-size:12pt; color:${t.gold}; font-weight:700; margin-top:2mm;">
              مِنْ صَحِيحِ الأَدْعِيَةِ وَالأَذْكَارِ
            </div>
          </div>
          <div style="font-family:'IBM Plex Arabic'; font-size:7.8pt; color:#CCCCCC; margin-bottom:12mm;">
            مِنَ الكِتَابِ الكَرِيمِ وَالسُّنَّةِ النَّبَوِيَّةِ المُطَهَّرَةِ
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.035); border: 1px solid ${t.gold}; border-radius: 8px; padding: 5.5mm; margin: 0 4mm;">
          <div style="font-family:'IBM Plex Arabic'; font-size:7pt; color:${t.gold}; margin-bottom:2mm;">اعْتَنَى بِجَمْعِهِ وَتَرْتِيبِهِ:</div>
          <div style="font-family:'Amiri Quran'; font-size:14.5pt; font-weight:700; color:#FFFFFF;">أَبُو مُحَمَّدٍ يُوسُفُ بْنُ زَبْنِ اللهِ العُطَيْرِ</div>
          <div style="font-family:'IBM Plex Arabic'; font-size:6.8pt; color:#AAAAAA; margin-top:2.5mm;">غَفَرَ اللهُ لَهُ وَلِوَالِدَيْهِ وَلِجَمِيعِ المُسْلِمِينَ</div>
        </div>

        <div style="margin-bottom: 12mm;">
          <div style="display:inline-block; background:${t.gold}; color:#000000; font-family:'IBM Plex Arabic'; font-size:6.8pt; font-weight:700; padding:1.2mm 4mm; border-radius:20px; margin-bottom:2.5mm;">
            الطَّبْعَةُ الثَّانِيَةَ عَشْرَةَ — مُرَاجَعَةٌ وَمَزِيدَةٌ
          </div>
          <div style="font-family:'IBM Plex Arabic'; font-size:6.8pt; color:${t.gold};">
            يُوَزَّعُ مَجَّانًا وَلَا يُبَاعُ • وَقْفٌ للهِ تَعَالَى
          </div>
        </div>
      </div>
      `;
      continue;
    }

    if (p.page === 2 || p.page === 3) {
      // Table of Contents - Luxury 2-Column Balanced Design
      pagesHtml += `
      <div class="page" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
          <div class="header-chapter">فِهْرِسُ المَوْضُوعَاتِ</div>
        </div>

        <div style="flex:1; display:flex; flex-direction:column;">
          <div class="chapter-banner">
            <div class="chapter-badge"><span>✦</span><span>دَلِيلُ أَبْوَابِ الكِتَابِ</span></div>
            <h2 class="chapter-title">فِهْرِسُ مَوْضُوعَاتِ الكِتَابِ ${p.page === 2 ? "(الجزء الأول)" : "(الجزء الثاني)"}</h2>
          </div>

          <div class="toc-grid">
            ${p.lines
              .map((l) => {
                const match = l.match(/(.+?)\s*[.ـ…]{3,}\s*(\d+)/) || l.match(/^(\d+)\s*[.ـ…]{3,}\s*(.+)/);
                if (match) {
                  let title = match[1].trim();
                  let pageNum = match[2].trim();
                  if (/^\d+$/.test(title)) {
                    const tmp = title;
                    title = pageNum;
                    pageNum = tmp;
                  }
                  return `
                <div class="toc-item">
                  <span class="toc-item-title">${title}</span>
                  <span class="toc-item-leader"></span>
                  <span class="toc-item-page">${toArabicNumeral(pageNum)}</span>
                </div>`;
                }
                if (l && !l.includes("الفهرس") && l !== str(p.page)) {
                  return `<div class="toc-section-header">${l}</div>`;
                }
                return "";
              })
              .join("")}
          </div>
        </div>

        <div class="page-footer">
          <span>المختار من صحيح الأدعية والأذكار</span>
          <span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span>
          <span>الفهرس</span>
        </div>
      </div>
      `;
      continue;
    }

    // Special Page: Introduction (Pages 4 and 5)
    if (p.page === 4 || p.page === 5) {
      pagesHtml += `
      <div class="page page-intro" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
          <div class="header-chapter">${p.page === 4 ? "المُقَدِّمَةُ" : "المُقَدِّمَةُ (تَتِمَّةٌ)"}</div>
        </div>

        <div class="intro-page-container">
          ${
            p.page === 4
              ? `
          <div class="chapter-banner" style="margin-bottom:2.5mm;">
            <div class="chapter-badge"><span>✦</span><span>مُقَدِّمَةُ الجَامِعِ</span></div>
            <h2 class="chapter-title">مُقَدِّمَةُ كِتَابِ «المُخْتَارِ»</h2>
          </div>
          `
              : ""
          }

          <div class="intro-card-luxury">
            ${
              p.page === 4
                ? `
            <div class="intro-besmalah">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ</div>
            <div class="intro-body-p">
              الْحَمْدُ لِلَّهِ الَّذِي لَمْ يَجْعَلْ بَيْنَهُ وَبَيْنَ عِبَادِهِ وَاسِطَةً فِي الدُّعَاءِ، وَهُوَ القَائِلُ سُبْحَانَهُ:
            </div>
            <div class="quran-quote-box">
              <div class="quran-ayah-text">﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ﴾</div>
              <div class="ayah-ref">[سورة البقرة: ١٨٦]</div>
            </div>
            <div class="quran-quote-box">
              <div class="quran-ayah-text">﴿وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ﴾</div>
              <div class="ayah-ref">[سورة غافر: ٦٠]</div>
            </div>
            <div class="intro-body-p">
              وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِهِ الأَمِينِ، القَائِلِ ﷺ:
              <span class="hadith-inline-quote">«الدُّعَاءُ هُوَ العِبَادَةُ»</span> <span class="takhrij-micro">[رواه أحمد والترمذي، صحيح]</span>،
              وَالقَائِلِ صَلَوَاتُ رَبِّي وَسَلَامُهُ عَلَيْهِ:
              <span class="hadith-inline-quote">«مَنْ لَمْ يَسْأَلِ اللَّهَ؛ يَغْضَبْ عَلَيْهِ»</span> <span class="takhrij-micro">[رواه الترمذي، حسن]</span>.
            </div>
            <div class="intro-divider-fleuron">✦ • ✦ • ✦</div>
            <div class="intro-body-p">
              <strong>وَبَعْدُ:</strong> فَإِنَّ دُعَاءَ اللَّهِ وَالإِلْحَاحَ عَلَيْهِ؛ شَأْنُ نَبِيِّنَا مُحَمَّدٍ ﷺ، وَشَأْنُ الأَنْبِيَاءِ مِنْ قَبْلِهِ، وَشَأْنُ الصَّالِحِينَ، وَلَيْسَ أَمْرٌ مِنْ أُمُورِ الدُّنْيَا وَالآخِرَةِ إِلَّا وَقَدْ جَعَلَ اللَّهُ مِفْتَاحَ تَحْقِيقِهِ وَالوُصُولِ إِلَيْهِ: <strong>الدُّعَاءَ</strong>.
            </div>
            `
                : `
            <div class="intro-body-p">
              وَاللَّهُ سُبْحَانَهُ يُحِبُّ المُلِحِّينَ فِي الدُّعَاءِ، وَيُجِيبُ دَعْوَةَ المُضْطَرِّينَ كَمَا قَالَ تَعَالَى:
            </div>
            <div class="quran-quote-box">
              <div class="quran-ayah-text">﴿أَمَّنْ يُجِيبُ الْمُضْطَرَّ إِذَا دَعَاهُ وَيَكْشِفُ السُّوءَ﴾</div>
              <div class="ayah-ref">[سورة النمل: ٦٢]</div>
            </div>
            <div class="intro-body-p">
              وَأَفْضَلُ الدُّعَاءِ وَالذِّكْرِ: مَا كَانَ مَأْخُوذًا مِنْ كَلَامِ رَبِّنَا تَبَارَكَ وَتَعَالَى، وَمِنْ سُنَّةِ نَبِيِّنَا مُحَمَّدٍ ﷺ.
            </div>
            <div class="intro-divider-fleuron">✦ • ✦ • ✦</div>
            <div class="intro-body-p">
              وَتَعَاوُنًا عَلَى البِرِّ وَالتَّقْوَى، وَتَسْهِيلًا عَلَى إِخْوَانِي المُسْلِمِينَ، وَخَاصَّةً عَلَى مَنْ لَا يَحْفَظُ الأَدْعِيَةَ؛ فَقَدْ يَسَّرَ اللَّهُ جَمْعَ هَذِهِ الأَدْعِيَةِ مِنَ الكِتَابِ وَالسُّنَّةِ الصَّحِيحَةِ، وَأَرْجُو مِنَ اللَّهِ الثَّوَابَ، وَأَنْ يَنْفَعَنِي بِهَذَا الجَمْعِ وَإِخْوَانِي المُسْلِمِينَ.
            </div>
            <div class="intro-body-p" style="font-weight:600;">
              وَصَلَّى اللَّهُ وَسَلَّمَ عَلَى نَبِيِّنَا مُحَمَّدٍ، وَعَلَى آلِهِ وَصَحْبِهِ أَجْمَعِينَ.
            </div>
            <div class="intro-signature-box">
              <div class="signature-title">الدَّاعِي لَكُمْ بِالخَيْرِ:</div>
              <div class="signature-name">أَبُو مُحَمَّدٍ يُوسُفُ بْنُ زَبْنِ اللهِ العُطَيْرِ</div>
              <div class="signature-dua">غَفَرَ اللهُ لَهُ وَلِوَالِدَيْهِ وَلِجَمِيعِ المُسْلِمِينَ</div>
            </div>
            `
            }
          </div>
        </div>

        <div class="page-footer">
          <span>المختار من صحيح الأدعية والأذكار</span>
          <span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span>
          <span>المقدمة</span>
        </div>
      </div>
      `;
      continue;
    }

    // Special Page: Etiquette of Dua (Page 8 - 10 points)
    if (p.page === 8) {
      const items = [];
      let footnote = "";
      for (const l of p.lines) {
        const m = l.match(/^([٠-٩\d]+)[-–.]\s*(.*)/);
        if (m) {
          items.push({ num: m[1], text: m[2] });
        } else if (l.includes("انظر:") || l.includes("إدارة شؤون")) {
          footnote = l;
        }
      }

      pagesHtml += `
      <div class="page" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
          <div class="header-chapter">آدَابُ الدُّعَاءِ وَأَسْبَابُ إِجَابَتِهِ</div>
        </div>

        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
          <div class="chapter-banner" style="margin-bottom:2mm;">
            <div class="chapter-badge"><span>✦</span><span>فِقْهُ الدُّعَاءِ</span></div>
            <h2 class="chapter-title">مِنْ آدَابِ الدُّعَاءِ وَأَسْبَابِ اسْتِجَابَتِهِ (١٠ آدَابٍ)</h2>
          </div>

          <div class="adab-card">
            <div class="adab-list">
              ${items
                .map(
                  (it) => `
                <div class="adab-row">
                  <span class="adab-num-pill">${toArabicNumeral(it.num)}</span>
                  <span class="adab-text">${it.text}</span>
                </div>
              `,
                )
                .join("")}
            </div>
            ${footnote ? `<div class="adab-footnote">${footnote}</div>` : ""}
          </div>
        </div>

        <div class="page-footer">
          <span>المختار من صحيح الأدعية والأذكار</span>
          <span class="footer-page-pill">— ص ٨ —</span>
          <span>آداب الدعاء وأسباب استجابته</span>
        </div>
      </div>
      `;
      continue;
    }

    // Special Page: Advisory for Pilgrims (Page 60)
    if (p.page === 60) {
      const advisoryText = p.lines.filter((l) => l && !l.includes("تنبيه خاص") && l !== "60").join(" ");
      pagesHtml += `
      <div class="page" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
          <div class="header-chapter">تَنْبِيهٌ خَاصٌّ بِالحُجَّاجِ وَالمُعْتَمِرِينَ</div>
        </div>

        <div style="flex:1; display:flex; flex-direction:column; justify-content:center;">
          <div class="chapter-banner" style="margin-bottom:3mm;">
            <div class="chapter-badge"><span>✦</span><span>تَوْجِيهٌ شَرْعِيٌّ</span></div>
            <h2 class="chapter-title">تَنْبِيهٌ مُهِمٌّ لِقَاصِدِي البَيْتِ الحَرَامِ</h2>
          </div>

          <div class="advisory-card">
            <div class="advisory-body">
              ${advisoryText}
            </div>
          </div>
        </div>

        <div class="page-footer">
          <span>المختار من صحيح الأدعية والأذكار</span>
          <span class="footer-page-pill">— ص ٦٠ —</span>
          <span>تنبيه خاص بالحجاج والمعتمرين</span>
        </div>
      </div>
      `;
      continue;
    }

    // Special Page: Kaffarat al-Majlis (Page 64)
    if (p.page === 64) {
      pagesHtml += `
      <div class="page" style="background:${t.bg}; color:${t.text};">
        <div class="page-frame-outer"></div>
        <div class="page-frame-inner"></div>

        <div class="page-header">
          <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
          <div class="header-chapter">كَفَّارَةُ المَجْلِسِ وَالخَاتِمَةُ</div>
        </div>

        <div style="flex:1; display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div class="chapter-banner" style="margin-bottom:3mm;">
            <div class="chapter-badge"><span>✦</span><span>خَاتِمَةُ الكِتَابِ</span></div>
            <h2 class="chapter-title">دُعَاءُ كَفَّارَةِ المَجْلِسِ</h2>
          </div>

          <div class="conclusion-card">
            <div class="dua-matn" style="font-size:12.8pt; line-height:2.2; text-align:center; color:${t.gold}; font-weight:700;">
              «سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ»
            </div>
            <div class="takhrij" style="text-align:center; margin-top:3mm; font-size:8pt; color:${t.textMuted};">
              [رواه الترمذي وأبو داود والنسائي، صحيح]
            </div>
            <div style="margin-top:6mm; border-top:0.75px solid ${t.divider}; padding-top:4mm; font-size:8.5pt; color:${t.text}; font-weight:600;">
              تَمَّ بِحَمْدِ اللهِ وَتَوْفِيقِهِ جَمْعُ وَتَرْتِيبُ كِتَابِ «المُخْتَارِ مِنْ صَحِيحِ الأَدْعِيَةِ وَالأَذْكَارِ»
            </div>
          </div>
        </div>

        <div class="page-footer">
          <span>المختار من صحيح الأدعية والأذكار</span>
          <span class="footer-page-pill">— ص ٦٤ —</span>
          <span>كفارة المجلس والخاتمة</span>
        </div>
      </div>
      `;
      continue;
    }

    // Normal Devotional Content Pages
    const isChapterStart = [6, 9, 12, 15, 16, 18, 24, 26, 31, 32, 34, 47, 48, 52, 54, 57, 61].includes(p.page);
    const flowResult = formatLuxuryFlow(p.lines, t, p.chapter);
    let flowClass;
    if (flowResult.count >= 8) {
      flowClass = "flow-ultra-dense";
    } else if (flowResult.count >= 6) {
      flowClass = "flow-dense";
    } else if (flowResult.count === 1) {
      flowClass = "flow-sparse";
    } else if (flowResult.count <= 3) {
      flowClass = "flow-roomy";
    } else {
      flowClass = "flow-normal";
    }

    pagesHtml += `
    <div class="page" style="background:${t.bg}; color:${t.text};">
      <div class="page-frame-outer"></div>
      <div class="page-frame-inner"></div>

      <div class="page-header">
        <div class="header-book-title">${ICONS.bookOpen}<span>المختار من صحيح الأدعية والأذكار</span></div>
        <div class="header-chapter">${p.chapter}</div>
      </div>

      ${
        isChapterStart
          ? `
      <div class="chapter-banner">
        <div class="chapter-badge"><span>✦</span><span>مِنَ الكِتَابِ وَالسُّنَّةِ</span></div>
        <h2 class="chapter-title">${p.chapter}</h2>
      </div>
      `
          : ""
      }

      <div class="devotional-flow ${flowClass}">
        ${flowResult.html}
      </div>

      <div class="page-footer">
        <span>المختار من صحيح الأدعية والأذكار</span>
        <span class="footer-page-pill">— ص ${toArabicNumeral(p.page)} —</span>
        <span>${p.chapter}</span>
      </div>
    </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>المختار من صحيح الأدعية والأذكار</title>
  <style>
    @font-face {
      font-family: 'Amiri Quran';
      src: url('data:font/woff2;base64,${fonts.amiri}') format('woff2');
      font-weight: normal;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex400}') format('woff2');
      font-weight: 400;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex500}') format('woff2');
      font-weight: 500;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex600}') format('woff2');
      font-weight: 600;
      font-style: normal;
    }
    @font-face {
      font-family: 'IBM Plex Arabic';
      src: url('data:font/woff2;base64,${fonts.plex700}') format('woff2');
      font-weight: 700;
      font-style: normal;
    }

    @page { size: 148mm 210mm; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

    body {
      margin: 0;
      padding: 0;
      font-family: 'IBM Plex Arabic', sans-serif;
      background: ${t.bg};
      color: ${t.text};
      direction: rtl;
    }

    .page {
      width: 148mm;
      height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      page-break-after: always;
      position: relative;
      padding: 8.5mm 11mm 8.5mm 11mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${t.bg};
    }

    /* Double Ornamental Frame */
    .page-frame-outer {
      position: absolute;
      top: 3.5mm;
      bottom: 3.5mm;
      right: 3.5mm;
      left: 3.5mm;
      border: 1px solid ${t.frameOuter};
      border-radius: 4px;
      pointer-events: none;
    }
    .page-frame-inner {
      position: absolute;
      top: 5mm;
      bottom: 5mm;
      right: 5mm;
      left: 5mm;
      border: 0.5px solid ${t.frameInner};
      border-radius: 3px;
      pointer-events: none;
    }

    /* Sacred Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1.5mm;
      margin-bottom: 2mm;
      border-bottom: 0.75px solid ${t.divider};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      position: relative;
      z-index: 5;
    }
    .header-book-title {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-weight: 700;
      color: ${t.gold};
    }
    .header-chapter {
      font-weight: 600;
      color: ${t.textMuted};
    }

    /* Sacred Footer */
    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5mm;
      margin-top: auto;
      border-top: 0.75px solid ${t.divider};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.6pt;
      color: ${t.textMuted};
      position: relative;
      z-index: 5;
      background: ${t.bg};
    }
    .footer-page-pill {
      font-weight: 700;
      font-size: 7.2pt;
      padding: 0.4mm 3mm;
      border-radius: 12px;
      border: 0.75px solid ${t.frameOuter};
      background: ${t.canvasBg};
      color: ${t.gold};
    }

    /* Chapter Title Banner */
    .chapter-banner {
      text-align: center;
      margin-bottom: 2.2mm;
      padding-bottom: 1mm;
      position: relative;
    }
    .chapter-badge {
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
      background: ${t.goldLight};
      border: 1px solid ${t.frameOuter};
      color: ${t.gold};
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      font-weight: 700;
      padding: 0.5mm 2.5mm;
      border-radius: 20px;
      margin-bottom: 1mm;
    }
    .chapter-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 12.5pt;
      font-weight: 700;
      color: ${t.text};
      margin: 0;
      line-height: 1.25;
    }

    /* Devotional Flow (Structured Luxury Card Geometry) */
    .devotional-flow {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 1mm 0;
    }

    .dua-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
      border-radius: 6px;
      padding: 3.5mm 4.5mm;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
      gap: 1.5mm;
    }

    .dua-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      margin-bottom: 0.5mm;
    }

    .dua-card-meta-right {
      display: flex;
      align-items: center;
      gap: 2mm;
    }

    .dua-num-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${t.goldLight};
      color: ${t.gold};
      border: 1px solid ${t.frameOuter};
      border-radius: 12px;
      font-weight: 700;
      font-size: 7.2pt;
      padding: 0.3mm 2.2mm;
      line-height: 1.2;
    }

    .narrator-line {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.6pt;
      font-weight: 600;
      color: ${t.textMuted};
    }

    .dua-text {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 10.6pt;
      line-height: 1.88;
      color: ${t.text};
      text-align: justify;
    }

    .takhrij-inline {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      font-weight: 500;
      color: ${t.textMuted};
      background: ${t.goldLight};
      padding: 0.4mm 2mm;
      border-radius: 4px;
      border: 0.5px solid ${t.divider};
      white-space: nowrap;
    }

    /* 0. SPARSE (Single Card) - Full Proportional Center */
    .devotional-flow.flow-sparse {
      gap: 0;
    }
    .devotional-flow.flow-sparse .dua-card {
      padding: 8mm 9mm;
      border-right-width: 4px;
    }
    .devotional-flow.flow-sparse .dua-text {
      font-size: 13pt;
      line-height: 2.3;
      text-align: center;
    }

    /* 1. ROOMY (2-3 cards) - Balanced Equal Flex */
    .devotional-flow.flow-roomy {
      gap: 4.5mm;
    }
    .devotional-flow.flow-roomy .dua-card {
      padding: 5mm 6.5mm;
      gap: 2mm;
    }
    .devotional-flow.flow-roomy .dua-text {
      font-size: 11.6pt;
      line-height: 2.05;
    }
    .devotional-flow.flow-roomy .dua-num-pill {
      font-size: 7.8pt;
      padding: 0.35mm 2.6mm;
    }
    .devotional-flow.flow-roomy .narrator-line {
      font-size: 8pt;
    }
    .devotional-flow.flow-roomy .takhrij-inline {
      font-size: 7.2pt;
      padding: 0.45mm 2.4mm;
    }

    /* 2. NORMAL (4-5 cards) - Proportional Flex */
    .devotional-flow.flow-normal {
      gap: 3mm;
    }
    .devotional-flow.flow-normal .dua-card {
      padding: 3.2mm 4.5mm;
      gap: 1.2mm;
    }
    .devotional-flow.flow-normal .dua-text {
      font-size: 10.6pt;
      line-height: 1.88;
    }
    .devotional-flow.flow-normal .dua-num-pill {
      font-size: 7.2pt;
      padding: 0.3mm 2.2mm;
    }
    .devotional-flow.flow-normal .narrator-line {
      font-size: 7.6pt;
    }
    .devotional-flow.flow-normal .takhrij-inline {
      font-size: 6.8pt;
      padding: 0.4mm 2mm;
    }

    /* 3. DENSE (6-7 cards) - Proportional Flex */
    .devotional-flow.flow-dense {
      gap: 2mm;
    }
    .devotional-flow.flow-dense .dua-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2.2mm 3.2mm;
      gap: 0.8mm;
    }
    .devotional-flow.flow-dense .dua-text {
      font-size: 9.6pt;
      line-height: 1.62;
    }
    .devotional-flow.flow-dense .dua-num-pill {
      font-size: 6.6pt;
      padding: 0.2mm 1.8mm;
    }
    .devotional-flow.flow-dense .narrator-line {
      font-size: 7pt;
    }
    .devotional-flow.flow-dense .takhrij-inline {
      font-size: 6.2pt;
      padding: 0.25mm 1.6mm;
    }

    /* 4. ULTRA-DENSE (8+ cards, e.g. Page 12) - Micro-gap, guaranteed fit */
    .devotional-flow.flow-ultra-dense {
      justify-content: flex-start;
      gap: 1.1mm;
    }
    .devotional-flow.flow-ultra-dense .dua-card {
      flex: 0 0 auto;
      padding: 1.4mm 2.4mm;
      gap: 0.5mm;
      border-right-width: 2.5px;
    }
    .devotional-flow.flow-ultra-dense .dua-card-header {
      margin-bottom: 0.1mm;
    }
    .devotional-flow.flow-ultra-dense .dua-text {
      font-size: 8.5pt;
      line-height: 1.46;
    }
    .devotional-flow.flow-ultra-dense .dua-num-pill {
      font-size: 6.2pt;
      padding: 0.15mm 1.5mm;
    }
    .devotional-flow.flow-ultra-dense .narrator-line {
      font-size: 6.6pt;
    }
    .devotional-flow.flow-ultra-dense .takhrij-inline {
      font-size: 6pt;
      padding: 0.2mm 1.4mm;
    }

    /* Introduction Page Luxury Elements (Pages 4 & 5) */
    .intro-page-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .intro-card-luxury {
      flex: 1;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
      border-radius: 8px;
      padding: 5.5mm 7mm;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .intro-besmalah {
      text-align: center;
      font-family: 'Amiri Quran', serif;
      font-size: 13.5pt;
      color: ${t.gold};
      font-weight: 700;
      margin-bottom: 1.5mm;
    }
    .intro-body-p {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 9.8pt;
      line-height: 1.88;
      color: ${t.text};
      text-align: justify;
    }
    .quran-quote-box {
      background: ${t.goldLight};
      border: 0.75px solid ${t.frameOuter};
      border-radius: 6px;
      padding: 2mm 3.2mm;
      margin: 1.2mm 0;
      text-align: center;
    }
    .quran-ayah-text {
      font-family: 'Amiri Quran', serif;
      font-size: 10.5pt;
      line-height: 1.68;
      color: ${t.gold};
      font-weight: 700;
    }
    .ayah-ref {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      color: ${t.textMuted};
      margin-top: 0.5mm;
    }
    .hadith-inline-quote {
      font-weight: 700;
      color: ${t.gold};
    }
    .takhrij-micro {
      font-size: 7pt;
      color: ${t.textMuted};
    }
    .intro-divider-fleuron {
      text-align: center;
      color: ${t.gold};
      opacity: 0.6;
      font-size: 8pt;
      letter-spacing: 2px;
      margin: 1mm 0;
    }
    .intro-signature-box {
      background: ${t.goldLight};
      border: 0.75px solid ${t.divider};
      border-radius: 6px;
      padding: 2.5mm 3.5mm;
      text-align: center;
      margin-top: 2mm;
    }
    .signature-title {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7pt;
      color: ${t.gold};
      font-weight: 600;
    }
    .signature-name {
      font-family: 'Amiri Quran', serif;
      font-size: 12pt;
      font-weight: 700;
      color: ${t.text};
      margin: 0.5mm 0;
    }
    .signature-dua {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7pt;
      color: ${t.textMuted};
    }

    /* Etiquette Card (Page 8 - 10 items) */
    .adab-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
      border-radius: 8px;
      padding: 2.5mm 3.5mm;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .adab-list {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1mm;
      flex: 1;
    }
    .adab-row {
      display: flex;
      align-items: baseline;
      gap: 2mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 8.2pt;
      line-height: 1.48;
      color: ${t.text};
    }
    .adab-num-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: ${t.goldLight};
      color: ${t.gold};
      border: 0.75px solid ${t.frameOuter};
      border-radius: 10px;
      font-weight: 700;
      font-size: 6.8pt;
      padding: 0.2mm 2mm;
      flex-shrink: 0;
    }
    .adab-text {
      flex: 1;
      text-align: justify;
    }
    .adab-footnote {
      margin-top: 1.5mm;
      border-top: 0.5px solid ${t.divider};
      padding-top: 1mm;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 6.8pt;
      color: ${t.textMuted};
    }

    /* Advisory & Conclusion Cards */
    .advisory-card, .conclusion-card {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background: ${t.canvasBg};
      border: 1px solid ${t.divider};
      border-right: 3.5px solid ${t.gold};
      border-radius: 8px;
      padding: 6mm 7.5mm;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }
    .advisory-body {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-weight: 500;
      font-size: 10.2pt;
      line-height: 1.95;
      color: ${t.text};
      text-align: justify;
    }

    /* Table of Contents Styling */
    .toc-grid {
      display: flex;
      flex-direction: column;
      gap: 1mm;
      padding: 1mm 2mm;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.2pt;
    }
    .toc-item-title {
      font-weight: 600;
      white-space: nowrap;
    }
    .toc-item-leader {
      flex: 1;
      border-bottom: 1px dotted ${t.divider};
      margin: 0 2mm;
      height: 1px;
    }
    .toc-item-page {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 0.2mm 2mm;
      border-radius: 8px;
      font-size: 6.8pt;
    }
    .toc-section-header {
      font-family: 'IBM Plex Arabic', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: ${t.gold};
      margin-top: 2mm;
      margin-bottom: 0.5mm;
      border-bottom: 0.5px solid ${t.divider};
      padding-bottom: 0.5mm;
    }
  </style>
</head>
<body>
  ${pagesHtml}
</body>
</html>`;
}

function formatLuxuryFlow(lines, t, chapter) {
  const entries = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i].trim();
    if (
      !l ||
      l === "." ||
      l === ".»" ||
      l === "»" ||
      l === "«" ||
      l === chapter ||
      l === `سؤال ${chapter}` ||
      l.startsWith("الأدعية والأذكار") ||
      l.includes("والثناءُ عليه") ||
      l.startsWith("والصلاة والسلام على رسوله") ||
      l.startsWith("الترغيب في ") ||
      l.startsWith("من آداب ") ||
      l.startsWith("الفهرس")
    )
      continue;

    // Check if line contains a dua/hadith number at start or end
    const startNumMatch = l.match(/^[(«]?\s*([٠-٩\d]+)\s*[)».-]/);
    const endNumMatch = l.match(/[«(]\s*([٠-٩\d]+)\s*$/);

    if (startNumMatch) {
      if (current) entries.push(current);
      const num = startNumMatch[1];
      const text = l.replace(startNumMatch[0], "").trim();
      current = { num, lines: [text] };
    } else if (endNumMatch) {
      if (current) entries.push(current);
      const num = endNumMatch[1];
      const text = l.replace(endNumMatch[0], "").trim();
      current = { num, lines: [text] };
    } else if (
      l.startsWith("عَنْ ") ||
      l.startsWith("وَعَنْ ") ||
      l.startsWith("عَنِ ") ||
      l.startsWith("وَعَنِ ") ||
      l.startsWith("عَنْهُ ") ||
      l.startsWith("وَعَنْهُ ") ||
      l.startsWith("الترغيب في ") ||
      l.startsWith("من آداب ") ||
      l.startsWith("• ") ||
      l.startsWith("* ")
    ) {
      if (current) entries.push(current);
      current = { num: "", lines: [l.replace(/^[•*]\s*/, "")] };
    } else {
      if (current) {
        current.lines.push(l);
      } else {
        current = { num: "", lines: [l] };
      }
    }
  }

  if (current) entries.push(current);

  if (entries.length === 0) {
    entries.push({ num: "", lines: [lines.join(" ")] });
  }

  let html = "";
  for (let j = 0; j < entries.length; j++) {
    const entry = entries[j];
    let raw = entry.lines.join(" ").trim();
    if (!raw) continue;

    // Clean leading/trailing quotes and bullets
    raw = raw
      .replace(/^[*•-]\s*/, "")
      .replace(/^\.»\s*/, "")
      .replace(/^«\s*/, "")
      .replace(/\s*\.»$/, "")
      .replace(/\s*«\s*$/, "")
      .replace(/\s*»\s*$/, "")
      .trim();

    // Check for number
    let numStr = "";
    if (entry.num) {
      numStr = toArabicNumeral(entry.num);
    } else {
      const inlineNumMatch = raw.match(/^\(([٠-٩\d]+)\)/) || raw.match(/^([٠-٩\d]+)[.\s-]/);
      if (inlineNumMatch) {
        numStr = toArabicNumeral(inlineNumMatch[1]);
        raw = raw.replace(inlineNumMatch[0], "").trim();
      }
    }

    // Extract takhrij/reference
    let takhrij = "";
    const refMatch = raw.match(
      /(\[(?:صحيح|رواه|مسلم|البخاري|أحمد|الترمذي|أبو داود|النسائي|ابن ماجه|الطبراني|الحاكم|الدارمي|النووي|حسن|بإِسناد|بإسناد|الأعراف|البقرة|هود|إبراهيم|المؤمنون|الفرقان|القصص|الحشر|الأنبياء|الممتحنة|التحريم|التوبة|الأنعام|يونس|الكهف|الفاتحة|آل عمران|الأحقاف)[^\]]*\])/,
    );
    if (refMatch) {
      takhrij = refMatch[1].trim();
      raw = raw.replace(takhrij, "").trim();
    }

    // Clean any residual broken quote symbols and tatweel in raw
    raw = raw
      .replace(/[.»«]{1,}/g, " ")
      .replace(/ـ+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    // Check for narrator vs prophetic matn
    let narrator = "";
    let matn = raw;
    const splitMatch = raw.match(
      /^(عَنْ[^:«»]+|وَعَنْ[^:«»]+|عَنِ[^:«»]+|وَعَنِ[^:«»]+|عَنْهُ[^:«»]+|وَعَنْهُ[^:«»]+)(:?\s*)(.*)$/,
    );
    if (splitMatch) {
      narrator = splitMatch[1].trim();
      matn = splitMatch[3].trim();
    }

    html += `
    <div class="dua-card">
      ${
        numStr || narrator || takhrij
          ? `
      <div class="dua-card-header">
        <div class="dua-card-meta-right">
          ${numStr ? `<span class="dua-num-pill">${numStr}</span>` : ""}
          ${narrator ? `<span class="narrator-line">${narrator}:</span>` : ""}
        </div>
        ${takhrij ? `<div class="takhrij-inline">${takhrij}</div>` : ""}
      </div>
      `
          : ""
      }
      <div class="dua-text">${matn}</div>
    </div>`;
  }

  return {
    html,
    count: entries.length,
    totalChars: entries.reduce((acc, e) => acc + e.lines.join(" ").length, 0),
  };
}

function str(v) {
  return String(v);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const themes = ["light", "dark", "navy"];

  for (const th of themes) {
    console.log(`Generating Luxury Book 1 (${th})...`);
    const page = await browser.newPage();
    const htmlContent = buildHtml(th);

    const htmlPath = path.join(outputDir, `al_mukhtar_${th}.html`);
    fs.writeFileSync(htmlPath, htmlContent, "utf-8");

    await page.setContent(htmlContent, { waitUntil: "load" });
    await page.evaluate(async () => {
      await globalThis.document.fonts.ready;
    });

    const pdfPath = path.join(outputDir, `al_mukhtar_${th}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A5",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    const stat = fs.statSync(pdfPath);
    console.log(`Generated: ${pdfPath} (${(stat.size / 1024).toFixed(1)} KB)`);
    await page.close();
  }

  await browser.close();
  console.log("Book 1 regenerated with Luxury Typography & Design!");
}

run().catch(console.error);
