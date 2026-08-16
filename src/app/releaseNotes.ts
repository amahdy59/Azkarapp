import type { AppLanguage } from "./types";

export type ReleaseNotes = Readonly<Record<AppLanguage, readonly string[]>>;

function normalizeList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length < 3 || value.length > 4) {
    return null;
  }

  const notes = value.map((note) => (typeof note === "string" ? note.trim() : ""));
  return notes.every(Boolean) ? notes : null;
}

export function parseReleaseNotes(value: unknown): ReleaseNotes | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const ar = normalizeList(candidate.ar);
  const en = normalizeList(candidate.en);
  return ar && en ? { ar, en } : null;
}

export async function loadReleaseNotes(): Promise<ReleaseNotes | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}release-notes.json?update=${Date.now()}`, {
      cache: "no-store",
    });
    return response.ok ? parseReleaseNotes(await response.json()) : null;
  } catch {
    return null;
  }
}
