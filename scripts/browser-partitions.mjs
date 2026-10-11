// One shared release schedule: keep expensive engines split and retain every
// existing device project. Native Playwright sharding divides each selection.
export const BROWSER_PARTITIONS = [
  { name: "chromium-1", projects: "desktop-chromium", shard: "1/2" },
  { name: "chromium-2", projects: "desktop-chromium", shard: "2/2" },
  { name: "firefox", projects: "desktop-firefox-smoke", shard: "1/1" },
  { name: "webkit-1", projects: "mobile-webkit-smoke", shard: "1/2" },
  { name: "webkit-2", projects: "mobile-webkit-smoke", shard: "2/2" },
  { name: "responsive", projects: "mobile-chromium,tablet-chromium", shard: "1/1" },
];
