/** Generated verification artifacts never participate in the development app. */
export function ignoreGeneratedWatchPath(root: string) {
  const prefix = `${root.replaceAll("\\", "/").replace(/\/$/, "")}/`;
  const generated = new Set([
    "android",
    "output",
    "coverage",
    "test-results",
    "playwright-report",
    "blob-report",
    ".playwright-dist",
    ".playwright-update",
    ".playwright-cli",
  ]);
  return (file: string) => {
    const normalized = file.replaceAll("\\", "/");
    return normalized.startsWith(prefix) && generated.has(normalized.slice(prefix.length).split("/")[0]!);
  };
}
