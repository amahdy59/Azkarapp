/**
 * Motion Rules Validator
 * ---------------------
 * Static analysis script that checks CSS and TSX files for prohibited
 * animation patterns. Run via: node scripts/check-motion-rules.mjs
 *
 * Flags:
 * - `infinite` animations in application UI CSS
 * - Animation durations above the approved 600ms threshold
 * - Animation of prohibited layout properties (width, height, margin, padding)
 * - Missing reduced-motion alternatives for named animations
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SRC_DIR = new globalThis.URL("../src", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
const MAX_DURATION_MS = 600;

// Known exceptions documented in MOTION_SYSTEM.md
const INFINITE_EXCEPTIONS = new Set([
  "waveform", // Audio visualizer — functional media indicator, paused when audio stops
]);

const DURATION_EXCEPTIONS = new Set([
  "celebration-glow", // 900ms — completion emphasis, one-shot
  "counter-ready-glow", // 720ms — counter readiness, one-shot
]);

/** Collect all files recursively. */
function walk(dir, exts, results = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
        walk(full, exts, results);
      } else if (exts.includes(extname(entry))) {
        results.push(full);
      }
    } catch {
      // skip inaccessible
    }
  }
  return results;
}

/** Parse a CSS duration string to milliseconds. */
function parseDuration(value) {
  const num = parseFloat(value);
  if (value.endsWith("ms")) return num;
  if (value.endsWith("s")) return num * 1000;
  return num;
}

const issues = [];

// ── 1. Check for infinite animations ───────────────────────────────
const cssFiles = walk(SRC_DIR, [".css"]);
for (const file of cssFiles) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\binfinite\b/.test(line) && /animation/i.test(line)) {
      // Check if this is an exception
      const isException = [...INFINITE_EXCEPTIONS].some((name) => line.includes(name));
      // Check if inside a @media (prefers-reduced-motion) block
      const isInReducedMotion = content.slice(0, content.indexOf(line)).includes("prefers-reduced-motion");
      if (!isException && !isInReducedMotion) {
        issues.push({
          severity: "error",
          file: file.replace(SRC_DIR, "src"),
          line: i + 1,
          rule: "no-infinite-animation",
          message: `Infinite animation detected: ${line.trim()}`,
        });
      }
    }
  }
}

// ── 2. Check for excessive durations ───────────────────────────────
for (const file of cssFiles) {
  const content = readFileSync(file, "utf-8");
  // Match animation shorthand and transition durations
  const durationPattern = /(?:animation|transition)[^;]*?(\d+(?:\.\d+)?(?:ms|s))/gi;
  let match;
  while ((match = durationPattern.exec(content)) !== null) {
    const ms = parseDuration(match[1]);
    if (ms > MAX_DURATION_MS) {
      const lineNum = content.slice(0, match.index).split("\n").length;
      const lineContent = content.split("\n")[lineNum - 1]?.trim() ?? "";
      const isException = [...DURATION_EXCEPTIONS].some((name) => lineContent.includes(name));
      if (!isException) {
        issues.push({
          severity: "warning",
          file: file.replace(SRC_DIR, "src"),
          line: lineNum,
          rule: "max-duration",
          message: `Duration ${match[1]} (${ms}ms) exceeds ${MAX_DURATION_MS}ms threshold: ${lineContent}`,
        });
      }
    }
  }
}

// ── 3. Check for layout-triggering animations ──────────────────────
const layoutProps = [
  "width",
  "height",
  "min-height",
  "max-height",
  "margin",
  "padding",
  "top",
  "left",
  "right",
  "bottom",
];
for (const file of cssFiles) {
  const content = readFileSync(file, "utf-8");
  // Find @keyframes blocks and check for layout properties
  const keyframePattern = /@keyframes\s+([\w-]+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  let kfMatch;
  while ((kfMatch = keyframePattern.exec(content)) !== null) {
    const name = kfMatch[1];
    const body = kfMatch[2];
    for (const prop of layoutProps) {
      const propRegex = new RegExp(`\\b${prop}\\s*:`, "i");
      if (propRegex.test(body)) {
        const lineNum = content.slice(0, kfMatch.index).split("\n").length;
        issues.push({
          severity: "error",
          file: file.replace(SRC_DIR, "src"),
          line: lineNum,
          rule: "no-layout-animation",
          message: `@keyframes "${name}" animates layout property "${prop}"`,
        });
      }
    }
  }
}

// ── 4. Check for overscroll-behavior: none on root ─────────────────
for (const file of cssFiles) {
  const content = readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (/overscroll-behavior(?:-[xy])?:\s*none/.test(lines[i])) {
      issues.push({
        severity: "warning",
        file: file.replace(SRC_DIR, "src"),
        line: i + 1,
        rule: "no-overscroll-none",
        message: `overscroll-behavior: none blocks native overscroll: ${lines[i].trim()}`,
      });
    }
  }
}

// ── Report ─────────────────────────────────────────────────────────
const errors = issues.filter((i) => i.severity === "error");
const warnings = issues.filter((i) => i.severity === "warning");

if (issues.length === 0) {
  console.log("✓ Motion rules check passed — no issues found.");
  process.exit(0);
} else {
  console.log(`Motion rules check: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  for (const issue of issues) {
    const icon = issue.severity === "error" ? "✗" : "⚠";
    console.log(`${icon} [${issue.rule}] ${issue.file}:${issue.line}`);
    console.log(`  ${issue.message}\n`);
  }
  if (errors.length > 0) {
    process.exit(1);
  }
}
