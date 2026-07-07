import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getPlatformDb() {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  if (!client) {
    const sql = postgres(process.env.DATABASE_URL, { max: 10 });
    client = drizzle(sql, { schema });
  }
  return client;
}