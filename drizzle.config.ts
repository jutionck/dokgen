import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load env files in priority order: .env.development -> .env.local -> .env.production -> .env
loadEnv({ path: [".env.development", ".env.local", ".env.production", ".env"], quiet: true });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
