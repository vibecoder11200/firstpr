import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

/**
 * Run pending Drizzle migrations against DATABASE_URL.
 * Idempotent: re-running applies nothing new (drizzle records `__drizzle_migrations`).
 */
export async function runMigrations(connectionString: string): Promise<void> {
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);
  await migrate(db, { migrationsFolder: new URL("../migrations", import.meta.url).pathname });
  await pool.end();
}
