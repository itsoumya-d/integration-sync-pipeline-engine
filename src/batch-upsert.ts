export interface BatchUpsertOptions {
  tableName: string;
  columns: string[];
  conflictKeys: string[];
  maxChunkSize?: number;
}

export interface GeneratedBatchQuery {
  sql: string;
  values: unknown[];
  chunkCount: number;
}

export class PostgresUpsertGenerator {
  public static generateUpsert(
    options: BatchUpsertOptions,
    rows: Record<string, unknown>[]
  ): GeneratedBatchQuery[] {
    if (rows.length === 0) {
      return [];
    }

    const { tableName, columns, conflictKeys, maxChunkSize = 250 } = options;

    if (columns.length === 0 || conflictKeys.length === 0) {
      throw new Error("Columns and conflict keys must be non-empty");
    }

    const updateColumns = columns.filter((col) => !conflictKeys.includes(col));
    const chunks: Record<string, unknown>[][] = [];

    for (let i = 0; i < rows.length; i += maxChunkSize) {
      chunks.push(rows.slice(i, i + maxChunkSize));
    }

    return chunks.map((chunk) => {
      const values: unknown[] = [];
      const valueTuples: string[] = [];

      chunk.forEach((row, rowIndex) => {
        const tuplePlaceholders: string[] = [];
        columns.forEach((col, colIndex) => {
          const paramIndex = rowIndex * columns.length + colIndex + 1;
          tuplePlaceholders.push(`$${paramIndex}`);
          values.push(row[col] ?? null);
        });
        valueTuples.push(`(${tuplePlaceholders.join(", ")})`);
      });

      const conflictTarget = conflictKeys.join(", ");
      let updateClause = "DO NOTHING";

      if (updateColumns.length > 0) {
        const updateAssignments = updateColumns.map((col) => `${col} = EXCLUDED.${col}`);
        updateClause = `DO UPDATE SET ${updateAssignments.join(", ")}`;
      }

      const sql = `INSERT INTO ${tableName} (${columns.join(", ")}) VALUES ${valueTuples.join(", ")} ON CONFLICT (${conflictTarget}) ${updateClause};`;

      return {
        sql,
        values,
        chunkCount: chunk.length,
      };
    });
  }
}
