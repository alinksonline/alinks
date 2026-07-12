import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;
let sqlClient: ReturnType<typeof postgres> | null = null;

/**
 * Platform DB for Vercel serverless + Supabase.
 * Prefer transaction pooler URL (port 6543) — session mode (5432) hits
 * "max clients reached" quickly under concurrent Server Components.
 */
export function getPlatformDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!client) {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    sqlClient = postgres(process.env.DATABASE_URL, {
      // One connection per isolate on Vercel; higher only for long-lived local/dev.
      max: isServerless ? 1 : 3,
      prepare: false,
      ssl: "require",
      connect_timeout: 15,
      idle_timeout: 20,
      max_lifetime: 60 * 10,
      // Avoid hanging requests when pool is exhausted
      connection: {
        application_name: "alinks",
      },
    });
    client = drizzle(sqlClient, { schema });
  }
  return client;
}