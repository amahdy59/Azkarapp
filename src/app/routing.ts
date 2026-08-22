/**
 * Hash-based routing.
 *
 * The app previously wrote `?view=<name>` for every navigation but only read
 * three of those names back on load, so most URLs it produced were unusable:
 * refreshing `?view=progress` landed on Home. Hash routes work unchanged on
 * GitHub Pages (no server rewrite needed), so they are the format used here.
 *
 * Onboarding and auth views are deliberately absent from the table below. They
 * are steps in a flow gated by stored state, not destinations someone should be
 * able to link into — `routeToHash` returns null for them and the URL is left
 * alone. The one exception is the OAuth return, which arrives as the query
 * parameter `?view=auth-callback` because the provider redirect is configured
 * that way in `getAuthCallbackUrl`; `parseLocation` still honours it.
 */

import { CATEGORIES } from "./content/categories";
import type { CategoryId, View } from "./types";

export interface RouteState {
  view: View;
  categoryId?: CategoryId;
  /** Zero-based index into the collection; the URL shows it one-based. */
  index?: number;
  query?: string;
}

/** Views that map to a stable, linkable path. */
const VIEW_PATHS = {
  khatmah_overview: "/quran-wird",
  home: "/home",
  library: "/azkar",
  progress: "/progress",
  settings: "/settings",
  benefits: "/benefits",
  friday: "/friday",
  friday_salawat: "/friday/salawat",
  custom_counter: "/counter",
  completion: "/completion",
} as const satisfies Partial<Record<View, string>>;

const PATH_VIEWS = new Map<string, View>(Object.entries(VIEW_PATHS).map(([view, path]) => [path, view as View]));

/** `before_sleep` reads better in a URL as `before-sleep`. */
export function categorySlug(categoryId: CategoryId): string {
  return categoryId.replace(/_/g, "-");
}

function categoryFromSlug(slug: string): CategoryId | undefined {
  return CATEGORIES.find((category) => categorySlug(category.id) === slug)?.id;
}

/**
 * Builds the hash for a route, or null when the view should not appear in the
 * URL at all (onboarding and auth steps).
 */
export function routeToHash(route: RouteState): string | null {
  const { view, categoryId, index, query } = route;

  if (view === "category" && categoryId) {
    return `#/azkar/${categorySlug(categoryId)}`;
  }

  if (view === "reader" && categoryId) {
    // One-based so the URL matches how the reader labels the zikr on screen.
    return `#/azkar/${categorySlug(categoryId)}/${(index ?? 0) + 1}`;
  }

  if (view === "search") {
    const trimmed = query?.trim();
    return trimmed ? `#/search/${encodeURIComponent(trimmed)}` : "#/search";
  }

  const path = VIEW_PATHS[view as keyof typeof VIEW_PATHS];
  return path ? `#${path}` : null;
}

/** Parses a hash such as `#/azkar/morning/5`. Returns null when unrecognised. */
export function parseHash(hash: string): RouteState | null {
  const raw = hash.replace(/^#/, "");
  if (!raw || raw === "/") return null;

  const path = raw.startsWith("/") ? raw : `/${raw}`;
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "azkar" && segments.length >= 2) {
    const categoryId = categoryFromSlug(segments[1]!);
    if (!categoryId) return null;

    if (segments.length === 2) {
      return { view: "category", categoryId };
    }

    const oneBased = Number(segments[2]);
    if (!Number.isInteger(oneBased) || oneBased < 1) return null;
    return { view: "reader", categoryId, index: oneBased - 1 };
  }

  if (segments[0] === "search") {
    const query = segments[1] ? safeDecode(segments[1]) : undefined;
    return query ? { view: "search", query } : { view: "search" };
  }

  const view = PATH_VIEWS.get(`/${segments.join("/")}`);
  return view ? { view } : null;
}

function safeDecode(value: string): string | undefined {
  try {
    return decodeURIComponent(value).trim() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves the route for a full location, preferring the hash and falling back
 * to the legacy `?view=` parameter so existing links and the OAuth redirect
 * keep working.
 */
export function parseLocation(search: string, hash: string): RouteState | null {
  const legacyView = new URLSearchParams(search).get("view");
  if (legacyView === "auth-callback") {
    return { view: "auth-callback" };
  }

  const fromHash = parseHash(hash);
  if (fromHash) return fromHash;

  if (legacyView && legacyView in VIEW_PATHS) {
    return { view: legacyView as View };
  }
  // `?view=friday_salawat` and friends predate the hash routes.
  if (legacyView === "custom_counter") return { view: "custom_counter" };
  if (legacyView === "friday") return { view: "friday" };

  return null;
}
