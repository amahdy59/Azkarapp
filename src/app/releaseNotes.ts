import { reportError } from "../lib/observability";
import type { AppLanguage } from "./types";

const SEEN_RELEASE_KEY = "azkarapp.release-seen";

export interface ReleaseNotes {
  /**
   * Identifies the release these notes describe, so the app can tell notes it
   * has already shown from notes it has not. Set by hand and enforced by
   * `scripts/check-release-notes.mjs`.
   */
  readonly release: string;
  readonly ar: readonly string[];
  readonly en: readonly string[];
}

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
  if (!ar || !en || ar.length !== en.length) {
    return null;
  }

  // A missing stamp is tolerated rather than rejected: it only costs the app
  // its "have these already been read" comparison, which is not worth losing
  // the notes themselves over.
  const release = typeof candidate.release === "string" ? candidate.release.trim() : "";
  return { release, ar, en };
}

export function notesFor(notes: ReleaseNotes, language: AppLanguage): readonly string[] {
  return language === "ar" ? notes.ar : notes.en;
}

export async function loadReleaseNotes(): Promise<ReleaseNotes | null> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}release-notes.json?update=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;

    const parsed = parseReleaseNotes(await response.json());
    if (!parsed) {
      // The deployed manifest is malformed. Every reader silently falls back to
      // the generic update message, so without this nobody would ever find out.
      reportError(new Error("The deployed release notes manifest is not valid"), "release-notes");
    }
    return parsed;
  } catch {
    // A failed fetch is ordinary offline behaviour, not a fault worth reporting.
    return null;
  }
}

/** The release whose notes were last shown, or null on a first run. */
export function readSeenRelease(): string | null {
  try {
    return window.localStorage.getItem(SEEN_RELEASE_KEY);
  } catch {
    return null;
  }
}

export function markReleaseSeen(release: string) {
  try {
    window.localStorage.setItem(SEEN_RELEASE_KEY, release);
  } catch {
    // Without storage the notes may be shown again after the next update.
    // Repeating them is a far smaller cost than blocking the reader.
  }
}
