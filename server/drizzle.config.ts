import type { Config } from "drizzle-kit";
import dotenv from "dotenv";
dotenv.config()

export default {
  schema: "./src/db",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  }
} satisfies Config;
