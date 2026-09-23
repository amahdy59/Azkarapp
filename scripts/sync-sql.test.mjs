import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("cloudflare/worker.ts", "utf8");
const schema = readFileSync("cloudflare/schema.sql", "utf8");
function database() {
  const db = new DatabaseSync(":memory:");
  db.exec(schema);
  db.prepare("INSERT INTO accounts VALUES (?, ?)").run("a", 1);
  return db;
}

describe("Worker SQL concurrency contracts", () => {
  it("rejects competing initial snapshots and stale revisions without overwriting progress", () => {
    const db = database();
    try {
      const insert = source.match(/"(INSERT INTO sync_snapshots[^"\n]+RETURNING revision)"/)[1];
      const update = source.match(/"(UPDATE sync_snapshots[^"\n]+RETURNING revision)"/)[1];
      expect(db.prepare(insert).get("a", "first", 1).revision).toBe(1);
      expect(db.prepare(insert).get("a", "competing", 2)).toBeUndefined();
      expect(db.prepare(update).get("new", 3, "a", 1).revision).toBe(2);
      expect(db.prepare(update).get("stale", 4, "a", 1)).toBeUndefined();
      expect(db.prepare("SELECT snapshot FROM sync_snapshots").get().snapshot).toBe("new");
    } finally {
      db.close();
    }
  });

  it("enforces a bounded request bucket and permits a new window", () => {
    const db = database();
    try {
      const query = source.match(/`(INSERT INTO request_limits[\s\S]+?RETURNING hits)`/)[1];
      const statement = db.prepare(query);
      expect(statement.get("window1", 100, 2).hits).toBe(1);
      expect(statement.get("window1", 100, 2).hits).toBe(2);
      expect(statement.get("window1", 100, 2)).toBeUndefined();
      expect(statement.get("window2", 200, 2).hits).toBe(1);
    } finally {
      db.close();
    }
  });
});
