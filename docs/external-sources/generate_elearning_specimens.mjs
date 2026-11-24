import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const outputDir = path.resolve(import.meta.dirname, "specimens");
fs.mkdirSync(outputDir, { recursive: true });

// Untitled UI Style Minimalist Vector Icons (24x24, 1.75px stroke)
const ICONS = {
  compass: (color) => `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="${color}" fill-opacity="0.2"/>
    </svg>`,
  rotateCcw: (color) => `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
      <path d="M3 3v5h5"/>
      <circle cx="12" cy="12" r="2.5" fill="${color}"/>
    </svg>`,
  footsteps: (color) => `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 4v16"/>
      <path d="M17 8l-4-4-4 4"/>
      <path d="M7 20l4 4 4-4"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>`,
  scissors: (color) => `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <line x1="20" y1="4" x2="8.12" y2="15.88"/>
      <line x1="14.47" y1="14.48" x2="20" y2="20"/>
      <line x1="8.12" y1="8.12" x2="12" y2="12"/>
    </svg>`,
  bookOpen: (color) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>`,
  lightbulb: (color) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5h6.18z" fill="${color}" fill-opacity="0.15"/>
    </svg>`,
  shieldAlert: (color) => `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
  checkCircle: (color) => `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>`,
  target: (color) => `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2" fill="${color}"/>
    </svg>`,
};

const THEMES = [
  {
    id: "light",
    name: "الوضع الفاتح (Light / Warm Paper)",
    bg: "#F8F5F0",
    cardBg: "#FFFFFF",
    text: "#171717",
    textMuted: "#585160",
    cardText: "#1E1B24",
    gold: "#A97F36",
    goldDark: "#855E1D",
    goldLight: "rgba(169, 127, 54, 0.12)",
    emerald: "#166534",
    emeraldBg: "#F0FDF4",
    emeraldBorder: "#BBF7D0",
    amber: "#B45309",
    amberBg: "#FFFBEB",
    amberBorder: "#FDE68A",
    teal: "#0F766E",
    tealBg: "#F0FDFA",
    tealBorder: "#99F6E4",
    border: "#E8E1D1",
    borderSubtle: "#DCD4C0",
    coverBg: "radial-gradient(circle at 50% 30%, #1A4734 0%, #0D261C 100%)",
    coverText: "#FFFFFF",
    footerText: "#7B6F60",
  },
  {
    id: "dark",
    name: "الوضع الداكن (Dark / OLED Pitch)",
    bg: "#0D0D0D",
    cardBg: "#171717",
    text: "#F5F0E8",
    textMuted: "#B2ADC2",
    cardText: "#EDE8DF",
    gold: "#E5A93C",
    goldDark: "#C28822",
    goldLight: "rgba(229, 169, 60, 0.15)",
    emerald: "#22C55E",
    emeraldBg: "rgba(34, 197, 94, 0.12)",
    emeraldBorder: "#14532D",
    amber: "#F59E0B",
    amberBg: "rgba(245, 158, 11, 0.12)",
    amberBorder: "#78350F",
    teal: "#14B8A6",
    tealBg: "rgba(20, 184, 166, 0.12)",
    tealBorder: "#134E4A",
    border: "#282828",
    borderSubtle: "#333333",
    coverBg: "radial-gradient(circle at 50% 30%, #1E1E1E 0%, #0A0A0A 100%)",
    coverText: "#F5F0E8",
    footerText: "#8E89A0",
  },
  {
    id: "navy",
    name: "الوضع الليلي الملكي (Midnight Navy)",
    bg: "#0A1228",
    cardBg: "#111B35",
    text: "#F5F0E8",
    textMuted: "#CBD5E1",
    cardText: "#EBF1FC",
    gold: "#F0C14B",
    goldDark: "#D4A020",
    goldLight: "rgba(240, 193, 75, 0.16)",
    emerald: "#34D399",
    emeraldBg: "rgba(52, 211, 153, 0.12)",
    emeraldBorder: "#064E3B",
    amber: "#FBBF24",
    amberBg: "rgba(251, 191, 36, 0.12)",
    amberBorder: "#78350F",
    teal: "#2DD4BF",
    tealBg: "rgba(45, 212, 191, 0.12)",
    tealBorder: "#134E4A",
    border: "#23355C",
    borderSubtle: "#334A75",
    coverBg: "radial-gradient(circle at 50% 30%, #162B5E 0%, #070E22 100%)",
    coverText: "#F5F0E8",
    footerText: "#8E9EB8",
  },
];

function generateHTML(t) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>دليل المعتمر التفاعلي - ${t.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Amiri+Quran&family=Cairo:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: 148mm 210mm;
      margin: 0;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      width: 148mm;
      background: ${t.bg};
      color: ${t.text};
      direction: rtl;
      text-align: right;
      font-family: 'Noto Naskh Arabic', 'Amiri', serif;
      -webkit-font-smoothing: antialiased;
    }
    .page {
      width: 148mm;
      height: 210mm;
      max-height: 210mm;
      overflow: hidden;
      padding: 9mm 11mm 8mm 11mm;
      background: ${t.bg};
      position: relative;
      page-break-inside: avoid;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Subtle Architectural Border */
    .page-frame {
      position: absolute;
      top: 4.5mm;
      bottom: 4.5mm;
      left: 4.5mm;
      right: 4.5mm;
      border: 1px solid ${t.gold};
      border-radius: 6px;
      pointer-events: none;
      opacity: 0.45;
    }
    .page-frame-inner {
      position: absolute;
      top: 6mm;
      bottom: 6mm;
      left: 6mm;
      right: 6mm;
      border: 0.5px dashed ${t.gold};
      border-radius: 4px;
      pointer-events: none;
      opacity: 0.25;
    }

    /* ELEVATED HEADER & FOOTER */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid ${t.border};
      padding-bottom: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8.5pt;
      font-weight: 600;
    }
    .header-tag {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      color: ${t.gold};
      font-weight: 700;
    }
    .header-step-pill {
      font-size: 7.5pt;
      background: ${t.goldLight};
      color: ${t.gold};
      padding: 1px 8px;
      border-radius: 12px;
      border: 0.5px solid ${t.gold};
    }

    .page-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid ${t.border};
      padding-top: 2mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7.8pt;
      color: ${t.footerText};
    }
    .page-number-pill {
      font-weight: 700;
      color: ${t.gold};
      background: ${t.goldLight};
      padding: 1px 8px;
      border-radius: 10px;
      border: 0.5px solid ${t.gold};
    }

    /* FRONT COVER (PAGE 1) - ELEVATED WITH VISUAL ANCHORS */
    .cover-front {
      background: ${t.coverBg};
      color: ${t.coverText};
      text-align: center;
      justify-content: space-between;
      align-items: center;
      padding: 11mm 11mm;
    }
    .hero-badge-row {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2mm;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 1.5mm;
      padding: 3px 12px;
      background: ${t.goldLight};
      border: 1px solid ${t.gold};
      border-radius: 20px;
      color: ${t.gold};
      font-family: 'Cairo', sans-serif;
      font-size: 8pt;
      font-weight: 700;
    }
    .cover-h1 {
      font-family: 'Amiri', serif;
      font-size: 26pt;
      font-weight: 700;
      color: #FFFFFF;
      line-height: 1.3;
      margin: 2mm 0 1mm 0;
      text-shadow: 0 2px 10px rgba(0,0,0,0.6);
    }
    .cover-sub {
      font-family: 'Cairo', sans-serif;
      font-size: 10pt;
      color: #E7E2D6;
      font-weight: 600;
    }
    
    /* Process Roadmap ribbon on Cover */
    .cover-roadmap {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      padding: 3mm 4mm;
      width: 100%;
      margin: 2.5mm 0;
    }
    .roadmap-title {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: ${t.gold};
      font-weight: 700;
      margin-bottom: 2mm;
      text-align: center;
    }
    .roadmap-steps {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
    }
    .roadmap-step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1mm;
      flex: 1;
    }
    .roadmap-icon-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid ${t.gold};
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .roadmap-label {
      font-family: 'Cairo', sans-serif;
      font-size: 6.8pt;
      color: #E2DFD8;
      font-weight: 600;
    }

    .cover-author-panel {
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid ${t.gold};
      border-radius: 6px;
      padding: 3mm 6mm;
      width: 92%;
      margin: 2mm auto;
    }
    .cover-author-panel .label {
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      color: #C8BFAD;
    }
    .cover-author-panel .name {
      font-family: 'Amiri', serif;
      font-size: 13.5pt;
      font-weight: 700;
      color: #FFFDF8;
      margin: 0.5mm 0;
    }
    .cover-credits-text {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: #C2D0BE;
      line-height: 1.45;
    }

    /* PAGE 2: ELEARNING INTERACTIVE RITUAL JOURNEY */
    .journey-stepper-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 2mm 3mm;
      margin-bottom: 2.5mm;
    }
    .step-node {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7.2pt;
      color: ${t.textMuted};
    }
    .step-node.active {
      color: ${t.emerald};
      font-weight: 700;
    }
    .step-badge-num {
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: ${t.emeraldBg};
      border: 1px solid ${t.emerald};
      color: ${t.emerald};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6.8pt;
      font-weight: 800;
    }
    .step-arrow {
      color: ${t.borderSubtle};
      font-size: 8pt;
    }

    /* Section Title */
    .module-title-box {
      text-align: center;
      margin-bottom: 2mm;
    }
    .module-title {
      font-family: 'Amiri', serif;
      font-size: 15.5pt;
      font-weight: 700;
      color: ${t.gold};
    }
    .module-sub {
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      color: ${t.textMuted};
    }

    /* Cognitive Card Grid: Arkan (Emerald) vs Wajibat (Amber) */
    .category-header {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-family: 'Cairo', sans-serif;
      font-size: 8.2pt;
      font-weight: 700;
      margin-bottom: 1.5mm;
    }
    .category-badge-pill {
      font-size: 6.8pt;
      padding: 1px 7px;
      border-radius: 10px;
      font-weight: 700;
    }

    .learning-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 2mm;
      margin-bottom: 2.5mm;
    }
    .learning-card {
      background: ${t.cardBg};
      border-radius: 6px;
      padding: 2.5mm 2mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 1px 4px rgba(0,0,0,0.02);
    }
    .learning-card.is-rukn {
      border: 1px solid ${t.emeraldBorder};
      border-top: 2.5px solid ${t.emerald};
    }
    .learning-card.is-wajib {
      border: 1px solid ${t.amberBorder};
      border-top: 2.5px solid ${t.amber};
    }
    .card-icon-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5mm;
    }
    .card-title {
      font-family: 'Cairo', sans-serif;
      font-size: 9pt;
      font-weight: 700;
      color: ${t.text};
      margin-bottom: 0.5mm;
    }
    .card-desc {
      font-size: 7pt;
      color: ${t.textMuted};
      line-height: 1.35;
    }

    /* RETRIEVAL CUE / COGNITIVE RETENTION BOX */
    .retention-box {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-right: 3.5px solid ${t.gold};
      border-radius: 6px;
      padding: 2.5mm 3.5mm;
      margin-bottom: 2.5mm;
      display: flex;
      gap: 2.5mm;
      align-items: flex-start;
    }
    .retention-icon {
      flex-shrink: 0;
      margin-top: 0.5mm;
    }
    .retention-content-title {
      font-family: 'Cairo', sans-serif;
      font-size: 7.8pt;
      font-weight: 700;
      color: ${t.gold};
      margin-bottom: 0.5mm;
    }
    .retention-content-text {
      font-size: 7.2pt;
      color: ${t.cardText};
      line-height: 1.5;
    }

    /* Dua Card with Dual-Coding Visual Indicators */
    .dua-interactive-card {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 3mm 3.5mm;
      margin-bottom: 2mm;
    }
    .dua-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5mm;
    }
    .dua-title-pill {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7.5pt;
      font-weight: 700;
      color: ${t.gold};
    }
    .dua-quran-text {
      font-family: 'Amiri Quran', 'Amiri', serif;
      font-size: 11.5pt;
      line-height: 2.05;
      color: ${t.cardText};
      text-align: justify;
      margin-bottom: 2mm;
    }
    .dua-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Cairo', sans-serif;
      font-size: 7.2pt;
    }
    .takhrij-badge {
      color: ${t.textMuted};
      background: rgba(125, 125, 125, 0.08);
      padding: 0.8mm 2.5mm;
      border-radius: 4px;
    }

    /* VOCABULARY INSIGHT CALLOUT (Linguistic retention) */
    .vocab-insight-box {
      background: ${t.bg};
      border: 1px solid ${t.borderSubtle};
      border-radius: 5px;
      padding: 2mm 3mm;
      margin-top: 1.5mm;
    }
    .vocab-insight-header {
      display: flex;
      align-items: center;
      gap: 1.5mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7.4pt;
      font-weight: 700;
      color: ${t.gold};
      margin-bottom: 1mm;
    }
    .vocab-insight-item {
      font-size: 7.2pt;
      color: ${t.textMuted};
      line-height: 1.45;
    }
    .vocab-insight-item strong {
      color: ${t.text};
    }

    /* PAGE 3: COMPREHENSIVE REFERENCES & DIGITAL VERIFICATION */
    .cover-back {
      background: ${t.bg};
      color: ${t.text};
      padding: 9mm 11mm 8mm 11mm;
      text-align: center;
      justify-content: space-between;
      align-items: center;
    }
    .ref-hero-title {
      font-family: 'Amiri', serif;
      font-size: 15.5pt;
      font-weight: 700;
      color: ${t.gold};
      margin-bottom: 0.5mm;
    }
    .ref-hero-sub {
      font-family: 'Cairo', sans-serif;
      font-size: 7.8pt;
      color: ${t.textMuted};
    }

    .bibliography-matrix {
      background: ${t.cardBg};
      border: 1px solid ${t.border};
      border-radius: 6px;
      padding: 2.5mm 3.5mm;
      width: 100%;
      text-align: right;
      font-family: 'Cairo', sans-serif;
      margin: 1.5mm 0;
    }
    .matrix-title {
      font-size: 7.8pt;
      font-weight: 700;
      color: ${t.gold};
      border-bottom: 1px solid ${t.border};
      padding-bottom: 1mm;
      margin-bottom: 1.5mm;
      display: flex;
      justify-content: space-between;
    }
    .matrix-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2mm 2.5mm;
      font-size: 6.8pt;
      line-height: 1.35;
      color: ${t.textMuted};
    }
    .matrix-item {
      display: flex;
      align-items: baseline;
      gap: 1mm;
    }
    .matrix-num {
      color: ${t.gold};
      font-weight: 700;
      min-width: 3mm;
    }

    .official-handoff-card {
      background: ${t.cardBg};
      border: 1px solid ${t.borderSubtle};
      border-radius: 6px;
      padding: 2.5mm 3.5mm;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'Cairo', sans-serif;
      font-size: 7.2pt;
      text-align: right;
    }
    .handoff-right .label {
      color: ${t.textMuted};
    }
    .handoff-right .value {
      color: ${t.gold};
      font-weight: 700;
    }
    .handoff-left {
      text-align: left;
    }
    .handoff-left a {
      color: ${t.gold};
      text-decoration: none;
      font-weight: 600;
    }

    .learning-reflection-chip {
      background: ${t.goldLight};
      border: 0.8px dashed ${t.gold};
      border-radius: 5px;
      padding: 1.5mm 3mm;
      font-family: 'Cairo', sans-serif;
      font-size: 7pt;
      color: ${t.cardText};
      line-height: 1.4;
      text-align: center;
      width: 100%;
    }
  </style>
</head>
<body>

  <!-- ==================================================== -->
  <!-- PAGE 1: FRONT COVER (ELEVATED HERO & VISUAL ROADMAP) -->
  <!-- ==================================================== -->
  <div class="page cover-front">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>

    <!-- Top Badge Row -->
    <div class="hero-badge-row">
      <div class="hero-badge">
        <span>✦</span>
        <span>سلسلة الكتيبات التفاعلية • تطبيق أذكار</span>
      </div>
    </div>

    <!-- Title & Subtitle -->
    <div>
      <h1 class="cover-h1">دَلِيلُ الْمُعْتَمِرِ</h1>
      <div class="cover-sub">صِفَةُ العُمْرَةِ بِأَيْسَرِ بَيَانٍ • وَيَلِيهِ الْمُخْتَارُ مِنْ صَحِيحِ الأَدْعِيَةِ</div>
      <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; margin-top: 1mm;">
        ${t.name}
      </div>
    </div>

    <!-- Visual Journey Roadmap (eLearning Schema) -->
    <div class="cover-roadmap">
      <div class="roadmap-title">مَسَارُ رِحْلَةِ العُمْرَةِ المَنْهَجِيَّةُ (٥ مَحَطَّاتٍ)</div>
      <div class="roadmap-steps">
        <div class="roadmap-step-item">
          <div class="roadmap-icon-circle">${ICONS.compass(t.gold)}</div>
          <div class="roadmap-label">١. الإِحْرَام</div>
        </div>
        <div style="color: ${t.gold}; font-size: 9pt;">➔</div>
        <div class="roadmap-step-item">
          <div class="roadmap-icon-circle">${ICONS.rotateCcw(t.gold)}</div>
          <div class="roadmap-label">٢. الطَّوَاف</div>
        </div>
        <div style="color: ${t.gold}; font-size: 9pt;">➔</div>
        <div class="roadmap-step-item">
          <div class="roadmap-icon-circle">${ICONS.footsteps(t.gold)}</div>
          <div class="roadmap-label">٣. السَّعْي</div>
        </div>
        <div style="color: ${t.gold}; font-size: 9pt;">➔</div>
        <div class="roadmap-step-item">
          <div class="roadmap-icon-circle">${ICONS.scissors(t.gold)}</div>
          <div class="roadmap-label">٤. التَّحَلُّل</div>
        </div>
      </div>
    </div>

    <!-- Author & Institutional Endorsement -->
    <div style="width: 100%;">
      <div class="cover-author-panel">
        <div class="label">اعتنى بجمعه وترتيبه</div>
        <div class="name">أبو محمد يوسف بن زبن الله بن محمد العطير</div>
      </div>
      <div class="cover-credits-text">
        موثق ومراجع من 16 مصدراً فقهياً لكبار العلماء<br>
        بإشراف وكالة الرئاسة العامة لشؤون المسجد النبوي الشريف
      </div>
    </div>

    <!-- Waqf Seal -->
    <div style="font-family: 'Cairo', sans-serif; font-size: 7.5pt; color: ${t.gold}; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1.5mm; width: 85%;">
      وَقْفٌ لِلَّهِ تَعَالَى • مُهْدَى وَلَا يُبَاعُ • طَبْعَةٌ رَقْمِيَّةٌ مُحَقَّقَةٌ 1446هـ
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- PAGE 2: INTERACTIVE LEARNING & COGNITIVE RETENTION   -->
  <!-- ==================================================== -->
  <div class="page">
    <div class="page-frame"></div>

    <!-- Header with Chapter Breadcrumbs -->
    <div class="page-header">
      <div class="header-tag">
        ${ICONS.bookOpen(t.gold)}
        <span>دليل المعتمر والورد النبوي</span>
      </div>
      <div class="header-step-pill">المَحَطَّةُ التَّعْلِيمِيَّةُ ② • المَنَاسِك</div>
    </div>

    <div>
      <!-- Stepper Progress Bar -->
      <div class="journey-stepper-bar">
        <div class="step-node active">
          <span class="step-badge-num">١</span>
          <span>الإحرام بالميقات</span>
        </div>
        <span class="step-arrow">◀</span>
        <div class="step-node active">
          <span class="step-badge-num">٢</span>
          <span>الطواف (٧ أشواط)</span>
        </div>
        <span class="step-arrow">◀</span>
        <div class="step-node">
          <span class="step-badge-num" style="border-color:${t.border}; background:transparent; color:${t.textMuted};">٣</span>
          <span>السعي (٧ أشواط)</span>
        </div>
        <span class="step-arrow">◀</span>
        <div class="step-node">
          <span class="step-badge-num" style="border-color:${t.border}; background:transparent; color:${t.textMuted};">٤</span>
          <span>الحلق/التقصير</span>
        </div>
      </div>

      <!-- Module Title -->
      <div class="module-title-box">
        <h2 class="module-title">مَنظُومَةُ أَرْكَانِ وَوَاجِبَاتِ العُمْرَةِ</h2>
        <div class="module-sub">فهم الفروق الجوهرية وفق التحقيق الفقهي للشيخ ابن باز والشيخ ابن عثيمين</div>
      </div>

      <!-- Arkan Category (Color-coded Emerald) -->
      <div class="category-header" style="color: ${t.emerald};">
        ${ICONS.target(t.emerald)}
        <span>أولاً: أركان العمرة (٣ أركان لا تصح العمرة ولا تجبر بدم إلا بفعلها)</span>
      </div>

      <div class="learning-cards-grid">
        <!-- Card 1 -->
        <div class="learning-card is-rukn">
          <div class="card-icon-avatar" style="background: ${t.emeraldBg};">
            ${ICONS.compass(t.emerald)}
          </div>
          <div class="card-title">١. الإِحْرَام</div>
          <div class="card-desc">نية الدخول في النسك من الميقات المكاني المعتمد.</div>
        </div>
        <!-- Card 2 -->
        <div class="learning-card is-rukn">
          <div class="card-icon-avatar" style="background: ${t.emeraldBg};">
            ${ICONS.rotateCcw(t.emerald)}
          </div>
          <div class="card-title">٢. الطَّوَاف</div>
          <div class="card-desc">٧ أشواط كاملة حول الكعبة يبدأ بالحجر الأسود ويختم به.</div>
        </div>
        <!-- Card 3 -->
        <div class="learning-card is-rukn">
          <div class="card-icon-avatar" style="background: ${t.emeraldBg};">
            ${ICONS.footsteps(t.emerald)}
          </div>
          <div class="card-title">٣. السَّعْي</div>
          <div class="card-desc">٧ أشواط بين الصفا والمروة يبدأ بالصفا ويختم بالمروة.</div>
        </div>
      </div>

      <!-- Retention / Memory Anchor Box -->
      <div class="retention-box">
        <div class="retention-icon">${ICONS.shieldAlert(t.gold)}</div>
        <div>
          <div class="retention-content-title">قَاعِدَةٌ ذَهَبِيَّةٌ لِلتَّمْيِيزِ بَيْنَ الرُّكْنِ وَالوَاجِبِ:</div>
          <div class="retention-content-text">
            <strong>الركن:</strong> لا يسقط سهواً ولا عمداً ولا يجبره دم، بل يلزم الإتيان به لصحة العمرة.<br>
            <strong>الواجب:</strong> كالإحرام من الميقات والحلق؛ من تركه لزمه دم (شاة بمكة للفقراء) وتصح عمرته.
          </div>
        </div>
      </div>

      <!-- Dua & Hadith Card with Takhrij -->
      <div class="dua-interactive-card">
        <div class="dua-meta-row">
          <div class="dua-title-pill">
            ${ICONS.bookOpen(t.gold)}
            <span>الدعاء الثابت بين الركن اليماني والحجر الأسود</span>
          </div>
          <span style="font-size: 6.8pt; color: ${t.gold}; font-weight:700;">سُنَّةٌ فِي كُلِّ شَوْطٍ</span>
        </div>
        <div class="dua-quran-text">
          «رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ»
        </div>
        <div class="dua-footer-row">
          <span class="takhrij-badge">📚 رواه أبو داود (١٨٩٢) وأحمد وصححه النووي والألباني</span>
          <span style="color: ${t.emerald}; font-weight:700;">✓ حديث صحيح</span>
        </div>

        <!-- Linguistic Insight Box (Al-Owashez) -->
        <div class="vocab-insight-box">
          <div class="vocab-insight-header">
            ${ICONS.lightbulb(t.gold)}
            <span>بَيَانُ مَعَانِي الدُّعَاءِ وَغَرِيبِهِ (مِنْ تَحْقِيقِ د. عَلِي العُوَيْشِزِ):</span>
          </div>
          <div class="vocab-insight-item">
            • <strong>فِي الدُّنْيَا حَسَنَةً:</strong> تَشْمَلُ العَافِيَةَ، وَالرِّزْقَ الطَّيِّبَ، وَالعِلْمَ النَّافِعَ، وَالزَّوْجَ الصَّالِحَ.<br>
            • <strong>وَفِي الْآخِرَةِ حَسَنَةً:</strong> أَعْلَاهَا دُخُولُ الجَنَّةِ، وَالأَمْنُ مِنَ الفَزَعِ الأَكْبَرِ، وَالنَّظَرُ إِلَى وَجْهِ اللهِ الكَرِيمِ.
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="page-footer">
      <div>المصدر: التحقيق والإيضاح للشيخ ابن باز رحمه الله</div>
      <div class="page-number-pill">— ص ٥ —</div>
      <div>تطبيق أذكار • Azkarapp</div>
    </div>
  </div>

  <!-- ==================================================== -->
  <!-- PAGE 3: BACK COVER / BIBLIOGRAPHY & ACTIVE PORTAL    -->
  <!-- ==================================================== -->
  <div class="page cover-back">
    <div class="page-frame"></div>
    <div class="page-frame-inner"></div>

    <!-- Header Section -->
    <div style="margin-top: 1mm;">
      <h2 class="ref-hero-title">ثَبَتُ المَرَاجِعِ وَالتَّوْثِيقِ الشَّرْعِيِّ</h2>
      <div class="ref-hero-sub">المصادر الفقهية الـ 16 المعتمدة التي بنيت عليها أحكام وأذكار هذا الكتيب</div>
    </div>

    <!-- 16 References Matrix with Numbered Anchors -->
    <div class="bibliography-matrix">
      <div class="matrix-title">
        <span>قَائِمَةُ الكُتُبِ وَالمُصَنَّفَاتِ الفِقْهِيَّةِ لِكِبَارِ العُلَمَاءِ</span>
        <span>توثيق رسمي</span>
      </div>
      <div class="matrix-grid">
        <div class="matrix-item"><span class="matrix-num">١.</span><span>«التحقيق والإيضاح» لسماحة الشيخ ابن باز.</span></div>
        <div class="matrix-item"><span class="matrix-num">٢.</span><span>«مجموع فتاوى ومقالات» للشيخ ابن باز.</span></div>
        <div class="matrix-item"><span class="matrix-num">٣.</span><span>«المنهج لمريد العمرة والحج» للشيخ ابن عثيمين.</span></div>
        <div class="matrix-item"><span class="matrix-num">٤.</span><span>«أخطاء يرتكبها بعض الحجاج» للشيخ ابن عثيمين.</span></div>
        <div class="matrix-item"><span class="matrix-num">٥.</span><span>«جلسات الحج» للعلامة ابن عثيمين رحمه الله.</span></div>
        <div class="matrix-item"><span class="matrix-num">٦.</span><span>«مجموع فتاوى ورسائل» للشيخ ابن عثيمين.</span></div>
        <div class="matrix-item"><span class="matrix-num">٧.</span><span>«فقه العبادات» لفضيلة الشيخ ابن عثيمين.</span></div>
        <div class="matrix-item"><span class="matrix-num">٨.</span><span>«فضل المدينة وآداب زيارتها» للشيخ عبد المحسن العباد.</span></div>
        <div class="matrix-item"><span class="matrix-num">٩.</span><span>«أدعية وأذكار من الكتاب والسنة» للشيخ العباد.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٠.</span><span>«صحيح الترغيب والترهيب» للعلامة الألباني.</span></div>
        <div class="matrix-item"><span class="matrix-num">١١.</span><span>«شرح السنة» للإمام الحسين بن مسعود البغوي.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٢.</span><span>«الإفصاح شرح التحقيق» للشيخ عبد الله بن جبرين.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٣.</span><span>«دروس عقدية مستفادة من الحج» للشيخ عبد الرزاق البدر.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٤.</span><span>«الدعاء من الكتاب والسنة» للشيخ سعيد القحطاني.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٥.</span><span>«آداب زيارة المسجد النبوي» وكالة شؤون المسجد النبوي.</span></div>
        <div class="matrix-item"><span class="matrix-num">١٦.</span><span>«صفة العمرة وجوامع الدعاء» إدارة شؤون الحرم المكي.</span></div>
      </div>
    </div>

    <!-- Official Registry Card -->
    <div class="official-handoff-card">
      <div class="handoff-right">
        <div><span class="label">كتاب المضاهاة والتحقيق:</span> <span class="value">«الورد النبوي الصغير» (د. علي العويشز)</span></div>
        <div><span class="label">رقم الإيداع الوطني:</span> <span class="value">1445 / 11446 هـ — مكتبة الملك فهد الوطنية</span></div>
        <div><span class="label">الردمك المعتمد (ISBN):</span> <span class="value" style="font-family:sans-serif; direction:ltr;">978-603-04-8666-3</span></div>
      </div>
      <div class="handoff-left">
        <div>🔗 <a href="https://alialowashez.com/9007/">موقع د. علي العويشز الرسمي</a></div>
        <div>🔗 <a href="https://azkar.app">بوابة تطبيق أذكار (azkar.app)</a></div>
        <div style="color: ${t.gold}; font-weight:700; margin-top:0.8mm;">وقف لله تعالى • مهدى ولا يباع</div>
      </div>
    </div>

    <!-- Cognitive Learning Reflection Chip -->
    <div class="learning-reflection-chip">
      💡 <strong>نصيحة تعليمية للمعتمر:</strong> استحضر نيتك الصادقة عند كل ركن، وتدبر معاني الأدعية النبوية الجامعة؛ فإن العبرة بحضور القلب وخشوعه لا بمجرد حركة اللسان.
    </div>

    <!-- Bottom App Footer -->
    <div class="page-footer" style="width:100%; border-top:1px solid ${t.border}; padding-top:2mm;">
      <div>معتمد وفق معايير التصميم التعليمي وتقليل العبء الإدراكي (Cognitive Load)</div>
      <div class="page-number-pill">— ص ٦ —</div>
      <div>تطبيق أذكار • الإصدار التفاعلي 1446هـ</div>
    </div>
  </div>

</body>
</html>
`;
}

async function main() {
  console.log("Generating Enhanced eLearning PDFs with Untitled UI Icons...");
  const browser = await chromium.launch();

  for (const t of THEMES) {
    console.log(`Rendering Theme: ${t.name} (${t.id})...`);
    const page = await browser.newPage();
    const html = generateHTML(t);

    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluateHandle("globalThis.document.fonts.ready");

    const pdfPath = path.join(outputDir, `elearning_theme_${t.id}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: "A5",
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    console.log(`Saved PDF: ${pdfPath}`);

    const pageElements = await page.$$(".page");
    for (let i = 0; i < pageElements.length; i++) {
      const imgPath = path.join(outputDir, `elearning_${t.id}_page_${i + 1}.png`);
      await pageElements[i].screenshot({ path: imgPath });
      console.log(`Saved preview: ${imgPath}`);
    }

    await page.close();
  }

  await browser.close();
  console.log("All eLearning PDF specimens generated successfully!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
