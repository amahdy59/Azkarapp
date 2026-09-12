import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../app/types";
import authSource from "./auth.ts?raw";
import schema from "../../supabase/schema.sql?raw";
import initialAccountMigration from "../../supabase/migrations/202607010000_initial_account_schema.sql?raw";
import latestCategoryMigration from "../../supabase/migrations/202608020001_expand_collection_categories.sql?raw";
import privilegeMigration from "../../supabase/migrations/202609110001_harden_data_api_privileges.sql?raw";

describe("Supabase category contract", () => {
  it.each(CATEGORY_IDS)("allows %s in the schema and latest category migration", (category) => {
    expect(schema.match(new RegExp(`'${category}'`, "g"))?.length).toBeGreaterThanOrEqual(2);
    expect(latestCategoryMigration.match(new RegExp(`'${category}'`, "g"))?.length).toBeGreaterThanOrEqual(2);
  });

  it("replays the account baseline with RLS and least-privilege grants", () => {
    for (const table of ["profiles", "user_settings", "user_progress", "session_history"]) {
      expect(initialAccountMigration).toContain(`create table if not exists public.${table}`);
      expect(initialAccountMigration).toContain(`alter table public.${table} enable row level security`);
    }
    expect(initialAccountMigration).toMatch(/from anon, authenticated/);
    expect(privilegeMigration).toMatch(/from anon, authenticated/);
    expect(privilegeMigration).not.toMatch(/grant all/i);
  });

  it("inserts saved zikr idempotently without requiring update permission", () => {
    expect(authSource).toMatch(/from\("saved_zikr"\)[\s\S]*?\.upsert\([\s\S]*?ignoreDuplicates:\s*true/);
  });
});
