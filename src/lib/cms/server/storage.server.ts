import { createStorage, type Storage } from "unstorage";
import { getEnv } from "./env.server";

/**
 * Persistent key-value storage for all CMS data (pages, articles, enquiries,
 * media, users, settings).
 *
 * - Neon Postgres (Vercel Marketplace) when `DATABASE_URL` (or `POSTGRES_URL`) is set.
 *   Data lives in one table, `cms_kv`, created automatically.
 * - Upstash Redis when its REST credentials are present:
 *   `KV_REST_API_URL` + `KV_REST_API_TOKEN`, or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`.
 * - On Cloudflare Workers: the KV namespace bound as `SKYTLABS_CMS`
 *   (override the binding name with `CMS_KV_BINDING`).
 * - Otherwise (local dev, long-running Node servers): the filesystem under
 *   `CMS_DATA_DIR` (default `.data/cms`). Never used on Vercel, whose filesystem is temporary.
 */
export function getRedisCredentials(): { url: string; token: string } | null {
  const url = getEnv("KV_REST_API_URL") ?? getEnv("UPSTASH_REDIS_REST_URL");
  const token = getEnv("KV_REST_API_TOKEN") ?? getEnv("UPSTASH_REDIS_REST_TOKEN");
  return url && token ? { url, token } : null;
}

export function getPostgresUrl(): string | null {
  return getEnv("DATABASE_URL") ?? getEnv("NETLIFY_DATABASE_URL") ?? getEnv("POSTGRES_URL") ?? null;
}

let storagePromise: Promise<Storage> | undefined;

export function getStorage(): Promise<Storage> {
  storagePromise ??= createAppStorage().catch((error: unknown) => {
    storagePromise = undefined;
    throw error;
  });
  return storagePromise;
}

async function createAppStorage(): Promise<Storage> {
  const postgresUrl = getPostgresUrl();
  if (postgresUrl) {
    const [{ neon }, { postgresKvDriver }] = await Promise.all([
      import("@neondatabase/serverless"),
      import("./postgres-driver.server"),
    ]);
    const sql = neon(postgresUrl);
    return createStorage({
      driver: postgresKvDriver({
        query: (text, params) =>
          sql.query(text, params ?? []) as Promise<Record<string, unknown>[]>,
      }),
    });
  }

  const redis = getRedisCredentials();
  if (redis) {
    const { default: upstash } = await import("unstorage/drivers/upstash");
    return createStorage({
      driver: upstash({ url: redis.url, token: redis.token, base: "skytlabs-cms" }),
    });
  }

  const isNetlify =
    typeof (globalThis as { Netlify?: unknown }).Netlify !== "undefined" ||
    Boolean(getEnv("NETLIFY"));
  if (isNetlify) {
    throw new Error(
      "CMS storage unavailable on Netlify: create a Neon database and set DATABASE_URL in " +
        "Site configuration > Environment variables, then redeploy.",
    );
  }

  if (getEnv("VERCEL")) {
    throw new Error(
      "CMS storage unavailable on Vercel: add a Neon database from the Vercel Storage tab " +
        "and connect it to this project for this environment (it sets DATABASE_URL), then redeploy.",
    );
  }

  const bindingName = getEnv("CMS_KV_BINDING") ?? "SKYTLABS_CMS";
  const g = globalThis as Record<string, unknown> & { __env__?: Record<string, unknown> };
  if (g.__env__?.[bindingName] || g[bindingName]) {
    const { default: cloudflareKV } = await import("unstorage/drivers/cloudflare-kv-binding");
    return createStorage({ driver: cloudflareKV({ binding: bindingName }) });
  }

  const isWorkers =
    typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
  if (isWorkers) {
    throw new Error(
      `CMS storage unavailable: bind a Cloudflare KV namespace as "${bindingName}" to this Worker.`,
    );
  }

  const { default: fsLite } = await import("unstorage/drivers/fs-lite");
  return createStorage({ driver: fsLite({ base: getEnv("CMS_DATA_DIR") ?? ".data/cms" }) });
}

/** Makes an arbitrary string safe to use as a storage key segment. */
export function keySegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 120);
}

export function newId(): string {
  const time = Date.now().toString(36).padStart(9, "0");
  const random = crypto.getRandomValues(new Uint8Array(6));
  const suffix = Array.from(random, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${time}${suffix}`;
}
