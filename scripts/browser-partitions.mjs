// One shared release schedule: keep expensive engines split and retain every
// existing device project. Native Playwright sharding divides each selection.
export const BROWSER_PARTITIONS = [
  { name: "chromium-1", projects: "desktop-chromium", shard: "1/3" },
  { name: "chromium-2", projects: "desktop-chromium", shard: "2/3" },
  { name: "chromium-3", projects: "desktop-chromium", shard: "3/3" },
  { name: "firefox-1", projects: "desktop-firefox-smoke", shard: "1/2" },
  { name: "firefox-2", projects: "desktop-firefox-smoke", shard: "2/2" },
  { name: "webkit-1", projects: "mobile-webkit-smoke", shard: "1/3" },
  { name: "webkit-2", projects: "mobile-webkit-smoke", shard: "2/3" },
  { name: "webkit-3", projects: "mobile-webkit-smoke", shard: "3/3" },
  { name: "responsive", projects: "mobile-chromium,tablet-chromium", shard: "1/1" },
];
