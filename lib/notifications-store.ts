import { JobNotification, NewJobNotification } from "./notifications";

// ---------------------------------------------------------------------------
// Where job notifications live.
//
// Same "demo mode" pattern used for payments: if Upstash Redis isn't
// configured, this falls back to an in-memory list so the admin page and
// job board work immediately, with zero setup, for local dev and quick
// testing.
//
// That in-memory fallback is NOT reliable once deployed to Vercel — each
// serverless invocation can run on a different instance with its own
// memory, so the admin page and /repairmen job board may not see the same
// list. For real usage, add a Redis database from the Vercel Marketplace
// (search "Upstash" or "Redis") and connect it to this project; it
// auto-injects KV_REST_API_URL / KV_REST_API_TOKEN and this file picks
// them up automatically — no code changes needed.
// ---------------------------------------------------------------------------

const REDIS_KEY = "repair:notifications";
const MAX_STORED = 100;

let redis: import("@upstash/redis").Redis | null | undefined;

async function getRedis() {
  if (redis !== undefined) return redis;
  const hasEnv =
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

  if (!hasEnv) {
    redis = null;
    return redis;
  }

  const { Redis } = await import("@upstash/redis");
  redis = Redis.fromEnv();
  return redis;
}

// In-memory fallback store, scoped to this server instance only.
const memoryStore: JobNotification[] = [];

export async function listNotifications(): Promise<JobNotification[]> {
  const client = await getRedis();
  if (!client) {
    return [...memoryStore].sort((a, b) => b.createdAt - a.createdAt);
  }
  const items = await client.lrange<JobNotification>(REDIS_KEY, 0, MAX_STORED - 1);
  return items;
}

export async function addNotification(input: NewJobNotification): Promise<JobNotification> {
  const notification: JobNotification = {
    ...input,
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
  };

  const client = await getRedis();
  if (!client) {
    memoryStore.unshift(notification);
    memoryStore.length = Math.min(memoryStore.length, MAX_STORED);
    return notification;
  }

  await client.lpush(REDIS_KEY, notification);
  await client.ltrim(REDIS_KEY, 0, MAX_STORED - 1);
  return notification;
}

export async function isPersistentStoreConfigured(): Promise<boolean> {
  return (await getRedis()) !== null;
}
