import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "node:path";
import { defaultSettings } from "../shop-contract";
import { schema } from "./schema";

export interface Sql { query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> }
export interface Database extends Sql { transaction<T>(fn: (sql: Sql) => Promise<T>): Promise<T>; close(): Promise<void> }
export function localDatabase(client: PGlite): Database {
  return { query: (s, p) => client.query(s, p), transaction: fn => client.transaction(tx => fn({ query: (s, p) => tx.query(s, p) })), close: () => client.close() };
}
export function postgresDatabase(connectionString: string): Database {
  const pool = new Pool({ connectionString, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 20000 });
  return {
    async query<T>(s: string, p?: unknown[]) { const result = await pool.query(s, p); return { rows: result.rows as T[] }; },
    async transaction<T>(fn: (sql: Sql) => Promise<T>) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await fn({ async query<R>(s: string, p?: unknown[]) { return { rows: (await client.query(s, p)).rows as R[] }; } });
        await client.query("COMMIT"); return result;
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    },
    close: () => pool.end()
  };
}
export async function migrate(db: Database) {
  await db.transaction(async tx => {
    for (const statement of schema.split(";").filter(s => s.trim())) await tx.query(statement);
    await tx.query("INSERT INTO sift_shop (id,settings) VALUES (1,$1::jsonb) ON CONFLICT (id) DO NOTHING", [JSON.stringify(defaultSettings)]);
  });
}
const cache = globalThis as typeof globalThis & { siftDatabase?: Promise<Database> };
export function getDatabase(): Promise<Database> {
  if (!cache.siftDatabase) cache.siftDatabase = (async () => {
    if (process.env.DATABASE_URL) return postgresDatabase(process.env.DATABASE_URL);
    if (process.env.ORDER_DATABASE_MODE === "local" && process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
      const db = localDatabase(new PGlite(process.env.ORDER_LOCAL_PATH || path.join(process.cwd(), ".data", "sift-orders")));
      await migrate(db); return db;
    }
    throw new Error("Order database is not configured.");
  })().catch(error => { delete cache.siftDatabase; throw error; });
  return cache.siftDatabase;
}
