import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

export async function verifyPagesCandidate({ expectedSha, readMain, hasSuccessfulQuality, wait }) {
  if (!/^[a-f0-9]{40}$/.test(expectedSha ?? "")) throw new Error("Invalid candidate SHA");
  for (let attempt = 1; attempt <= 6; attempt++) {
    if ((await readMain()) !== expectedSha) throw new Error("Candidate is no longer current main");
    if (await hasSuccessfulQuality()) {
      if ((await readMain()) !== expectedSha) throw new Error("Candidate is no longer current main");
      return expectedSha;
    }
    if (attempt < 6) {
      console.log(`Successful exact-commit Quality is not visible yet; retrying (${attempt}/6)`);
      await wait(10_000);
    }
  }
  throw new Error("Candidate has no successful exact-commit Quality run");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const repo = process.env.GITHUB_REPOSITORY;
  const expectedSha = process.env.VERIFIED_SHA;
  const gh = (args) => execFileSync("gh", args, { encoding: "utf8" }).trim();
  const sha = await verifyPagesCandidate({
    expectedSha,
    readMain: () => gh(["api", `repos/${repo}/git/ref/heads/main`, "--jq", ".object.sha"]),
    hasSuccessfulQuality: () =>
      gh([
        "run",
        "list",
        "--repo",
        repo,
        "--workflow",
        "quality.yml",
        "--commit",
        expectedSha,
        "--status",
        "completed",
        "--json",
        "conclusion",
        "--jq",
        'any(.[]; .conclusion == "success")',
      ]) === "true",
    wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  });
  appendFileSync(process.env.GITHUB_OUTPUT, `sha=${sha}\n`);
}
