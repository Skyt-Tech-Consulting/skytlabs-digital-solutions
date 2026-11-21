import { defineDriver } from "unstorage";

/**
 * unstorage driver that keeps every CMS record in one Postgres table:
 *
 *   cms_kv(key text primary key, value text not null, updated_at timestamptz)
 *
 * The table is created automatically on first use, so no manual SQL is needed.
 * `query` runs one parameterised statement and returns the result rows; in
 * production it is backed by Neon's serverless HTTP driver.
 */
export type QueryFn = (text: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;

const TABLE = "cms_kv";

export const postgresKvDriver = defineDriver((opts: { query: QueryFn }) => {
  const { query } = opts;
  let ready: Promise<void> | undefined;

  const ensureTable = () => {
    ready ??= query(
      `CREATE TABLE IF NOT EXISTS ${TABLE} (
         key text PRIMARY KEY,
         value text NOT NULL,
         updated_at timestamptz NOT NULL DEFAULT now()
       )`,
    )
      .then(() => undefined)
      .catch((error: unknown) => {
        ready = undefined;
        throw error;
      });
    return ready;
  };

  return {
    name: "postgres-kv",
    async hasItem(key) {
      await ensureTable();
      const rows = await query(`SELECT 1 FROM ${TABLE} WHERE key = $1`, [key]);
      return rows.length > 0;
    },
    async getItem(key) {
      await ensureTable();
      const rows = await query(`SELECT value FROM ${TABLE} WHERE key = $1`, [key]);
      return (rows[0]?.["value"] as string | undefined) ?? null;
    },
    async getItems(items) {
      await ensureTable();
      const keys = items.map((i) => i.key);
      if (keys.length === 0) return [];
      const rows = await query(`SELECT key, value FROM ${TABLE} WHERE key = ANY($1::text[])`, [
        keys,
      ]);
      const byKey = new Map(rows.map((r) => [r["key"] as string, r["value"] as string]));
      return keys.map((key) => ({ key, value: byKey.get(key) ?? null }));
    },
    async setItem(key, value) {
      await ensureTable();
      await query(
        `INSERT INTO ${TABLE} (key, value, updated_at) VALUES ($1, $2, now())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
        [key, value],
      );
    },
    async removeItem(key) {
      await ensureTable();
      await query(`DELETE FROM ${TABLE} WHERE key = $1`, [key]);
    },
    async getKeys(base) {
      await ensureTable();
      // starts_with avoids LIKE, whose "_" and "%" wildcards appear in keys.
      const rows = base
        ? await query(`SELECT key FROM ${TABLE} WHERE starts_with(key, $1)`, [base])
        : await query(`SELECT key FROM ${TABLE}`);
      return rows.map((r) => r["key"] as string);
    },
    async clear(base) {
      await ensureTable();
      if (base) await query(`DELETE FROM ${TABLE} WHERE starts_with(key, $1)`, [base]);
      else await query(`DELETE FROM ${TABLE}`);
    },
  };
});
