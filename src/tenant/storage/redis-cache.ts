import { getEnv } from "@/core/config/env";
import { CACHE_TTL_SECONDS } from "./types";

interface CacheEntry {
  value: string;
  expiresAt: number;
}

const memoryStore = new Map<string, CacheEntry>();

function isExpired(entry: CacheEntry): boolean {
  return Date.now() > entry.expiresAt;
}

async function upstashFetch(command: string[]): Promise<string | null> {
  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return null;

  const res = await fetch(env.UPSTASH_REDIS_REST_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { result?: string | null };
  return data.result ?? null;
}

export async function cacheGet(key: string): Promise<string | null> {
  const remote = await upstashFetch(["GET", key]);
  if (remote !== null) return remote;

  const entry = memoryStore.get(key);
  if (!entry || isExpired(entry)) {
    memoryStore.delete(key);
    return null;
  }
  return entry.value;
}

export async function cacheSet(key: string, value: string, ttlSeconds = CACHE_TTL_SECONDS): Promise<void> {
  const remoteOk = await upstashFetch(["SET", key, value, "EX", String(ttlSeconds)]);
  if (remoteOk !== null) return;

  memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheDel(key: string): Promise<void> {
  await upstashFetch(["DEL", key]);
  memoryStore.delete(key);
}

export function cacheKey(businessId: string, tab: string): string {
  return `alinks:sheet:${businessId}:${tab}`;
}