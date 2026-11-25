import { describe, it, expect } from "vitest";
import { PostgresUpsertGenerator } from "../src/batch-upsert.js";

describe("PostgresUpsertGenerator", () => {
  it("generates valid ON CONFLICT DO UPDATE query", () => {
    const queries = PostgresUpsertGenerator.generateUpsert(
      {
        tableName: "employees",
        columns: ["id", "external_id", "name", "email"],
        conflictKeys: ["external_id"],
        maxChunkSize: 2,
      },
      [
        { id: "uuid-1", external_id: "ext-1", name: "Alice", email: "alice@test.com" },
        { id: "uuid-2", external_id: "ext-2", name: "Bob", email: "bob@test.com" },
        { id: "uuid-3", external_id: "ext-3", name: "Charlie", email: "charlie@test.com" },
      ]
    );

    expect(queries.length).toBe(2); // 2 in first chunk, 1 in second chunk
    expect(queries[0].sql).toContain("INSERT INTO employees (id, external_id, name, email)");
    expect(queries[0].sql).toContain("ON CONFLICT (external_id) DO UPDATE SET id = EXCLUDED.id, name = EXCLUDED.name, email = EXCLUDED.email");
    expect(queries[0].values.length).toBe(8); // 2 rows * 4 columns
    expect(queries[1].values.length).toBe(4); // 1 row * 4 columns
  });

  it("returns empty array for empty rows", () => {
    const queries = PostgresUpsertGenerator.generateUpsert(
      {
        tableName: "users",
        columns: ["id"],
        conflictKeys: ["id"],
      },
      []
    );
    expect(queries).toEqual([]);
  });
});
