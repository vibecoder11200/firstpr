import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Environment-relative resolution so `npm run db:generate` works from the
// workspace package dir as well as from the repo root.
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgres://firstpr:firstpr@localhost:5432/firstpr";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: DATABASE_URL,
  },
  // Print SQL on generate; helpful for reviewing migration content.
  verbose: true,
  strict: true,
});
