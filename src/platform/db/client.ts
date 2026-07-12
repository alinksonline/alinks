import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPlatformDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!client) {
    // prepare:false required for Supabase pooler (transaction/session).
    // Keep max low for serverless (Vercel) connection limits.
    const sql = postgres(process.env.DATABASE_URL, {
      max: 5,
      prepare: false,
      ssl: "require",
      connect_timeout: 15,
    });
    client = drizzle(sql, { schema });
  }
  return client;
}