import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * `public/release-notes.json` is what the update prompt shows a reader when a
 * new version is waiting. It is fetched from the deployed site rather than
 * bundled, so it describes the release being shipped — it never accumulates.
 *
 * A documented rule was not enough: the manifest once drifted 48 commits while
 * still advertising a bundle-size improvement that had long since shipped.
 * `releaseNotes.test.ts` could not catch it because a file frozen for months
 * still has a perfectly valid shape. This check closes that gap by comparing
 * the manifest against the commits that have landed since it last changed.
 */

const MANIFEST = "public/release-notes.json";
const MIN_NOTES = 3;
const MAX_NOTES = 4;

/**
 * Commits that can change what a reader sees. Tests, docs, tooling and the
 * manifest itself are excluded: a release made only of those has nothing to
 * announce, and demanding notes for it would train everyone to write filler.
 */
const USER_FACING_PATHS = [
  "src",
  "public",
  ":(exclude)src/**/*.test.ts",
  ":(exclude)src/**/*.test.tsx",
  ":(exclude)src/**/*.test.mjs",
  `:(exclude)${MANIFEST}`,
];

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args.join(" ")} failed`);
  }
  return result.stdout;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateNoteList(value, language, problems) {
  if (!Array.isArray(value)) {
    problems.push(`"${language}" must be an array of notes.`);
    return;
  }
  if (value.length < MIN_NOTES || value.length > MAX_NOTES) {
    problems.push(`"${language}" has ${value.length} notes; keep between ${MIN_NOTES} and ${MAX_NOTES}.`);
  }
  if (!value.every(isNonEmptyString)) {
    problems.push(`"${language}" contains an empty or non-string note.`);
  }
}

/**
 * Mirrors `parseReleaseNotes` so a manifest that would silently fall back to
 * the generic update message fails here instead — at the desk, not in
 * production where nobody would ever see it.
 */
export function validateManifest(value) {
  const problems = [];
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return ["The manifest must be a JSON object."];
  }

  validateNoteList(value.ar, "ar", problems);
  validateNoteList(value.en, "en", problems);

  if (Array.isArray(value.ar) && Array.isArray(value.en) && value.ar.length !== value.en.length) {
    problems.push(`"ar" has ${value.ar.length} notes and "en" has ${value.en.length}; both languages must match.`);
  }

  if (!isNonEmptyString(value.release)) {
    problems.push('"release" must be a non-empty string identifying this release, for example "2026-08-19".');
  }

  return problems;
}

function sameNotes(a, b) {
  return JSON.stringify([a?.ar, a?.en]) === JSON.stringify([b?.ar, b?.en]);
}

/**
 * @param commits    user-facing commits landed since the manifest last changed
 * @param current    the manifest as it stands in the working tree
 * @param previous   the manifest as it was when it last changed, or null
 */
export function findStaleness({ commits, current, previous }) {
  const problems = [];

  if (commits.length > 0) {
    problems.push(
      `${commits.length} user-facing commit(s) have landed since the notes last changed:\n` +
        commits.map((commit) => `      ${commit}`).join("\n"),
    );
  }

  if (previous && !sameNotes(current, previous) && current.release === previous.release) {
    problems.push(
      `The notes changed but "release" is still "${current.release}". ` +
        "Bump it so the app can tell that these notes are new.",
    );
  }

  return problems;
}

function readManifestAt(revision) {
  try {
    return JSON.parse(git(["show", `${revision}:${MANIFEST}`]));
  } catch {
    return null;
  }
}

function run() {
  const current = JSON.parse(readFileSync(MANIFEST, "utf8"));
  const problems = validateManifest(current);

  const lastNotesCommit = git(["log", "-1", "--format=%H", "--", MANIFEST]).trim();
  if (lastNotesCommit) {
    const commits = git(["log", "--format=%h %s", `${lastNotesCommit}..HEAD`, "--", ...USER_FACING_PATHS])
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    problems.push(...findStaleness({ commits, current, previous: readManifestAt(lastNotesCommit) }));
  }

  if (problems.length === 0) {
    console.log(`${MANIFEST} describes the commits waiting to deploy.`);
    return;
  }

  console.error(`\n${MANIFEST} is not ready to deploy:\n`);
  for (const problem of problems) {
    console.error(`  - ${problem}`);
  }
  console.error(
    "\nRewrite the file so it covers only what changed since the last deployment," +
      '\nreplacing every entry rather than adding to them, and bump "release".' +
      '\nSee AGENTS.md, "Required release notes on every deployment".' +
      "\n\nFor a release with genuinely nothing to announce: ALLOW_STALE_RELEASE_NOTES=1\n",
  );
  process.exit(1);
}

const isDirectInvocation = process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]));

if (isDirectInvocation) {
  if (process.env.ALLOW_STALE_RELEASE_NOTES === "1") {
    console.log("Skipping the release-notes freshness check (ALLOW_STALE_RELEASE_NOTES=1).");
  } else {
    try {
      run();
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  }
}
