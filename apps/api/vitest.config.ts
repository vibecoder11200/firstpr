import { defineConfig } from "vitest/config";
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load .env for integration tests (DATABASE_URL etc).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../.env") });

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 20_000,
    // stale compiled output must not be picked up as tests
    exclude: ["dist/**", "node_modules/**"],
  },
});
