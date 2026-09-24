import { describe, expect, it } from "vitest";
import { DEFAULT_APP_STATE } from "./state";
import { APP_BACKUP_FORMAT, createAppBackup, parseAppBackup } from "./appBackup";

describe("app backup files", () => {
  it("round-trips a versioned backup through normalization", () => {
    const state = {
      ...DEFAULT_APP_STATE,
      savedZikrIds: ["m-hm-75a"],
      sessions: [
        {
          id: "session-1",
          category: "morning" as const,
          completedAt: "2026-09-24T01:00:00.000Z",
          completedCount: 1,
          totalCount: 1,
          durationSeconds: 30,
          isComplete: true,
        },
      ],
    };
    const backup = createAppBackup(state, new Date("2026-09-24T02:00:00.000Z"));

    expect(backup.format).toBe(APP_BACKUP_FORMAT);
    expect(parseAppBackup(JSON.stringify(backup))).toMatchObject({
      savedZikrIds: ["m-hm-75a"],
      sessions: [{ id: "session-1" }],
    });
  });

  it("accepts legacy raw-state exports", () => {
    expect(parseAppBackup(JSON.stringify({ ...DEFAULT_APP_STATE, savedZikrIds: ["m-hm-75"] }))).toMatchObject({
      savedZikrIds: ["m-hm-75"],
    });
  });

  it("rejects unrelated JSON and unknown backup versions", () => {
    expect(() => parseAppBackup(JSON.stringify({ hello: "world" }))).toThrow("invalid-backup");
    expect(() =>
      parseAppBackup(JSON.stringify({ format: APP_BACKUP_FORMAT, version: 99, state: DEFAULT_APP_STATE })),
    ).toThrow("unsupported-backup");
  });
});
