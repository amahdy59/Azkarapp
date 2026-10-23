export const SHARED_APP_URL = "https://wa-zaker.com/";

/** The preview and native image payload must use precisely the same caption. */
export function getImageCaption(text?: string): string {
  if (text?.includes("https://wa-zaker.com")) return text;
  return [text?.trim(), SHARED_APP_URL].filter(Boolean).join("\n\n");
}

/** Generic landing pages are attribution, not a meaningful reading destination. */
export function getReadingLink(value: string | undefined, single: boolean): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    const route = url.hash.startsWith("#/") ? url.hash.slice(1).split("?")[0]!.replace(/\/$/u, "") : "";
    if (route) {
      if (/^\/azkar\/[^/]+(?:\/\d+)?$/u.test(route)) {
        return !single || /\/\d+$/u.test(route) ? value : undefined;
      }
      if (/^\/quran\/\d+$/u.test(route)) return value;
      return !single && route === "/benefits" ? value : undefined;
    }
    if (["wa-zaker.com", "www.wa-zaker.com", "amahdy59.github.io", "localhost", "127.0.0.1"].includes(url.hostname))
      return undefined;
    return url.pathname.replace(/\/$/u, "") && !/\/index\.html?$/u.test(url.pathname) ? value : undefined;
  } catch {
    return undefined;
  }
}
