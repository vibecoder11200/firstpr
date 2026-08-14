import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.js";

export type DB = NodePgDatabase<typeof schema>;

/** Shared connection pool. Process-global so API/worker reuse connections. */
let pool: Pool | null = null;

/** Create (or reuse) the Postgres pool + Drizzle instance. */
export function createDb(connectionString: string): DB {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
  }
  return drizzle(pool, { schema, logger: false });
}

/** For tests / teardown. */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { schema };
