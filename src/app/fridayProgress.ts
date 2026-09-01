export const FRIDAY_KAHF_WEEK_KEY = "azkarapp.friday-kahf-week.v1";

/**
 * The sunan the Friday companion tracks, in the order its rows are numbered.
 *
 * Kept here rather than in the screen because the summary Home and Progress
 * read needs the same list. The two used to hold separate copies — a literal
 * seven in one file and a literal array in the other — so adding a sunnah
 * would have silently left the summary counting the old number.
 */
export const FRIDAY_PRACTICE_IDS = ["ghusl", "siwak", "perfume", "best_clothes", "early", "walking", "listen"] as const;

export type FridayPracticeId = (typeof FRIDAY_PRACTICE_IDS)[number];

/**
 * The three deeds the companion counts alongside the sunan above: reading
 * Al-Kahf, the salawat target, and the Friday duas.
 */
export const FRIDAY_EXTRA_DEEDS = 3;

/** Everything the Friday progress bar counts. */
export const FRIDAY_TOTAL_DEEDS = FRIDAY_PRACTICE_IDS.length + FRIDAY_EXTRA_DEEDS;
export type FridaySalawatTarget = number;

export interface FridaySalawatProgress {
  count: number;
  target: FridaySalawatTarget;
}

export function getIsoWeekKey(date = new Date()): string {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

/**
 * The Friday a piece of progress belongs to, as `YYYY-MM-DD`.
 *
 * Progress used to be keyed by ISO week, which rolls on *Monday* — so Friday's
 * completed checklist stayed on screen through Saturday and Sunday before
 * clearing. Keying by the current-or-upcoming Friday resets the companion the
 * moment Friday ends, and lets work done on Thursday evening count toward the
 * Friday it is preparing for.
 */
export function getFridayCycleKey(date = new Date()): string {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  day.setDate(day.getDate() + ((5 - day.getDay() + 7) % 7));
  const month = String(day.getMonth() + 1).padStart(2, "0");
  return `${day.getFullYear()}-${month}-${String(day.getDate()).padStart(2, "0")}`;
}

export function fridayChecklistKey(cycle = getFridayCycleKey()): string {
  return `azkarapp.friday-checklist.${cycle}`;
}

export function fridayKahfOpenedKey(cycle = getFridayCycleKey()): string {
  return `azkarapp.friday-kahf-opened.${cycle}`;
}

export function fridaySalawatKey(cycle = getFridayCycleKey()): string {
  return `azkarapp.friday-salawat.${cycle}`;
}

export function fridayDuasKey(cycle = getFridayCycleKey()): string {
  return `azkarapp.friday-duas.${cycle}`;
}

/**
 * Matches cycle-scoped Friday keys. The ISO-week form is still matched so that
 * keys written before the switch are pruned on first launch rather than left
 * behind forever. `FRIDAY_KAHF_WEEK_KEY` ends in `.v1` and matches neither, so
 * it is never pruned.
 */
const CYCLE_SCOPED_FRIDAY_KEY = /^azkarapp\.friday-[a-z-]+\.(\d{4}-W\d{2}|\d{4}-\d{2}-\d{2})$/;

/**
 * Friday progress is written under a fresh cycle every seven days and was never
 * cleaned up, so a long-lived install accumulated four dead keys per week
 * indefinitely. Only the current cycle is ever read, so anything else is waste.
 *
 * Called once at startup from `main.tsx`, deliberately not from the read
 * functions: those take an explicit `cycle`, so pruning against *today* inside
 * a read would delete the very data a non-current-cycle read asked for.
 */
export function pruneStaleFridayProgress(currentCycle = getFridayCycleKey()): void {
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      const cycle = key?.match(CYCLE_SCOPED_FRIDAY_KEY)?.[1];
      if (key && cycle && cycle !== currentCycle) localStorage.removeItem(key);
    }
  } catch {
    // Stale weeks only occupy storage; failing to prune them changes nothing.
  }
}

export function readFridayDuaProgress(allowedIds: Iterable<string>, cycle = getFridayCycleKey()): Set<string> {
  try {
    const allowed = new Set(allowedIds);
    const parsed: unknown = JSON.parse(localStorage.getItem(fridayDuasKey(cycle)) ?? "[]");
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && allowed.has(id)) : [],
    );
  } catch {
    return new Set();
  }
}

export function writeFridayDuaProgress(ids: Iterable<string>, cycle = getFridayCycleKey()): void {
  try {
    localStorage.setItem(fridayDuasKey(cycle), JSON.stringify([...new Set(ids)].sort()));
  } catch {
    // Weekly progress remains usable in memory when storage is unavailable.
  }
  notifyFridayProgressChange();
}

export function readFridaySalawatProgress(cycle = getFridayCycleKey()): FridaySalawatProgress {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(fridaySalawatKey(cycle)) ?? "null",
    ) as Partial<FridaySalawatProgress>;
    const target = Number.isFinite(parsed?.target) ? Math.min(100_000, Math.max(1, Math.floor(parsed.target!))) : 100;
    const count = Number.isFinite(parsed?.count) ? Math.max(0, Math.floor(parsed.count!)) : 0;
    return { count, target };
  } catch {
    return { count: 0, target: 100 };
  }
}

export function writeFridaySalawatProgress(progress: FridaySalawatProgress, cycle = getFridayCycleKey()): void {
  try {
    const target = Math.min(100_000, Math.max(1, Math.floor(progress.target)));
    const count = Math.max(0, Math.floor(progress.count));
    localStorage.setItem(fridaySalawatKey(cycle), JSON.stringify({ count, target }));
  } catch {
    // Counting remains usable in memory when storage is unavailable.
  }
  notifyFridayProgressChange();
}

/**
 * Anything that changes Friday progress announces it here.
 *
 * The alternative was for every screen that writes to also remember to push the
 * result into app state, which is exactly the kind of obligation that gets
 * forgotten when a fifth write site is added. One subscription in `App` now
 * catches all of them.
 */
type FridayProgressListener = () => void;
const fridayProgressListeners = new Set<FridayProgressListener>();

export function onFridayProgressChange(listener: FridayProgressListener): () => void {
  fridayProgressListeners.add(listener);
  return () => fridayProgressListeners.delete(listener);
}

function notifyFridayProgressChange(): void {
  for (const listener of fridayProgressListeners) listener();
}

/** Completed sunan for a cycle. Replaces raw writes to the checklist key. */
export function writeFridayPractices(ids: Iterable<string>, cycle = getFridayCycleKey()): void {
  try {
    localStorage.setItem(fridayChecklistKey(cycle), JSON.stringify([...new Set(ids)].sort()));
  } catch {
    // Progress stays usable in memory when storage is unavailable.
  }
  notifyFridayProgressChange();
}

/** Records that Al-Kahf was opened this cycle. Replaces raw writes to that key. */
export function markFridayKahfOpened(cycle = getFridayCycleKey()): void {
  try {
    localStorage.setItem(fridayKahfOpenedKey(cycle), "true");
  } catch {
    // Progress stays usable in memory when storage is unavailable.
  }
  notifyFridayProgressChange();
}

/** Everything the Friday companion records for one cycle. */
export interface FridayCycleProgress {
  /** The Friday this belongs to, as `YYYY-MM-DD`. */
  cycle: string;
  /** Completed sunan, from {@link FRIDAY_PRACTICE_IDS}. */
  practices: string[];
  kahfOpened: boolean;
  duas: string[];
  salawat: FridaySalawatProgress;
}

/**
 * The stored dua ids without an allow-list.
 *
 * {@link readFridayDuaProgress} filters against the duas currently in the
 * content, which is right when rendering but wrong here: this value is handed
 * to the account, and filtering at write time would drop a dua that exists on
 * the other device but not on this build.
 */
function readStoredDuaIds(cycle: string): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(fridayDuasKey(cycle)) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function readFridayPractices(cycle = getFridayCycleKey()): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(fridayChecklistKey(cycle)) ?? "[]");
    const allowed = new Set<string>(FRIDAY_PRACTICE_IDS);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && allowed.has(id)) : [];
  } catch {
    return [];
  }
}

/**
 * The whole cycle in one value.
 *
 * The four key families were read and written directly from six different
 * files, three of them reaching into `localStorage` inline. That is why none of
 * it ever reached the account: there was no single value to hand the sync.
 */
export function readFridayCycle(cycle = getFridayCycleKey()): FridayCycleProgress {
  let kahfOpened: boolean;
  try {
    kahfOpened = localStorage.getItem(fridayKahfOpenedKey(cycle)) === "true";
  } catch {
    kahfOpened = false;
  }
  return {
    cycle,
    practices: readFridayPractices(cycle),
    kahfOpened,
    duas: readStoredDuaIds(cycle),
    salawat: readFridaySalawatProgress(cycle),
  };
}

export function writeFridayCycle(progress: FridayCycleProgress): void {
  const { cycle } = progress;
  writeFridayPractices(progress.practices, cycle);
  if (progress.kahfOpened) markFridayKahfOpened(cycle);
  writeFridayDuaProgress(progress.duas, cycle);
  writeFridaySalawatProgress(progress.salawat, cycle);
}

/**
 * Combines the same Friday as recorded on two devices.
 *
 * A deed done on either device was still done, so sets union, the Kahf flag
 * ORs, and the count takes the higher of the two — a merge can only ever move
 * progress forward. The target follows whichever side counted further, because
 * that is the device the reader was actually using.
 */
export function mergeFridayCycles(a: FridayCycleProgress, b: FridayCycleProgress): FridayCycleProgress {
  if (a.cycle !== b.cycle) return a.cycle > b.cycle ? a : b;
  const ahead = b.salawat.count > a.salawat.count ? b : a;
  return {
    cycle: a.cycle,
    practices: [...new Set([...a.practices, ...b.practices])].sort(),
    kahfOpened: a.kahfOpened || b.kahfOpened,
    duas: [...new Set([...a.duas, ...b.duas])].sort(),
    salawat: { count: Math.max(a.salawat.count, b.salawat.count), target: ahead.salawat.target },
  };
}
