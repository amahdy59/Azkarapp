/**
 * `pnpm check` — the merge gate.
 *
 * The gate used to be one `&&` chain, so a sixteen-core machine ran formatting,
 * linting, type-checking, the unit suite and the production build strictly one
 * after another. None of those five reads another's output, so they run
 * together here; only the bundle and CSS budgets have a real dependency, on
 * `dist/`, and they still wait for the build.
 *
 * Every stage's output is buffered and printed whole, so parallel runs do not
 * interleave into unreadable soup. All stages run to completion even after one
 * fails, because a formatting slip and a type error are usually worth seeing in
 * the same pass.
 */

import { spawn } from "node:child_process";
import os from "node:os";

/**
 * How many stages may run at once.
 *
 * Not "all of them": the unit suite runs its own worker pool, and letting the
 * build, the type-checker and the linter fight it for the same cores stretched
 * a 31-second suite to 157 seconds — long enough for one ordinary test to blow
 * through its 15-second timeout inside the pre-push gate. Two heavy stages plus
 * a light one is the shape that stays honest on a sixteen-core machine.
 */
const MAX_CONCURRENT_STAGES = Math.max(2, Math.min(3, Math.floor(os.cpus().length / 4)));

const TOOLCHAIN = { name: "toolchain", command: "node scripts/verify-toolchain.mjs" };

const CONCURRENT = [
  // Longest first, so the pool is never left holding only the slow one.
  { name: "unit tests", command: "vitest run --coverage" },
  { name: "build", command: "vite build" },
  { name: "typecheck", command: "tsc --noEmit" },
  { name: "lint", command: "eslint . --max-warnings 0" },
  { name: "format", command: "prettier --check ." },
  { name: "audio manifest", command: "node scripts/validate-audio-manifest.mjs" },
  { name: "type scale", command: "node scripts/check-type-scale.mjs" },
];

// These read dist/, so they cannot start until the build has finished.
const AFTER_BUILD = [
  { name: "bundle budget", command: "node scripts/check-bundle-budget.mjs" },
  { name: "css utilities", command: "node scripts/check-css-utilities.mjs" },
];

function run({ name, command }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(command, { shell: true, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => (output += chunk));
    child.stderr.on("data", (chunk) => (output += chunk));
    child.on("close", (code) => {
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      resolve({ name, code: code ?? 1, output, seconds });
    });
  });
}

function report(result) {
  const status = result.code === 0 ? "PASS" : "FAIL";
  console.log(`\n──── ${status}  ${result.name}  (${result.seconds}s)\n`);
  if (result.code !== 0 || process.env.CHECK_VERBOSE === "1") {
    process.stdout.write(result.output.trimEnd() + "\n");
  }
}

const started = Date.now();
const results = [];

const toolchain = await run(TOOLCHAIN);
report(toolchain);
results.push(toolchain);

async function runPool(stages, limit) {
  const queue = [...stages];
  const collected = [];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length > 0) {
      const stage = queue.shift();
      const result = await run(stage);
      report(result);
      collected.push(result);
    }
  });
  await Promise.all(workers);
  return collected;
}

if (toolchain.code === 0) {
  const concurrent = await runPool(CONCURRENT, MAX_CONCURRENT_STAGES);
  results.push(...concurrent);

  const build = concurrent.find((result) => result.name === "build");
  if (build?.code === 0) {
    for (const stage of AFTER_BUILD) {
      const result = await run(stage);
      report(result);
      results.push(result);
    }
  } else {
    console.log("\n──── SKIP  bundle budget, css utilities  (the build did not produce dist/)\n");
    results.push({ name: "bundle budget", code: 1, output: "", seconds: "0.0" });
  }
}

const failed = results.filter((result) => result.code !== 0);
console.log(
  `\n════ ${failed.length === 0 ? "check passed" : "check failed"} in ${((Date.now() - started) / 1000).toFixed(1)}s`,
);
if (failed.length > 0) {
  console.log(`     failing stages: ${failed.map((result) => result.name).join(", ")}`);
  process.exit(1);
}
