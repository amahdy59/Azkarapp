import { describe, expect, it } from "vitest";
import { CATEGORY_IDS } from "../app/types";
import schema from "../../supabase/schema.sql?raw";
import latestCategoryMigration from "../../supabase/migrations/202608020001_expand_collection_categories.sql?raw";

describe("Supabase category contract", () => {
  it.each(CATEGORY_IDS)("allows %s in the schema and latest category migration", (category) => {
    expect(schema.match(new RegExp(`'${category}'`, "g"))?.length).toBeGreaterThanOrEqual(2);
    expect(latestCategoryMigration.match(new RegExp(`'${category}'`, "g"))?.length).toBeGreaterThanOrEqual(2);
  });
});
