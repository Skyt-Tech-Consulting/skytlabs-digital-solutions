import { getStorage, keySegment } from "./storage.server";

type Bucket = { count: number; resetAt: number };

/**
 * Fixed-window rate limiter backed by CMS storage.
 * Returns true when the action is allowed (and records it).
 */
export async function consumeRateLimit(
  scope: string,
  identifier: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  const storage = await getStorage();
  const key = `ratelimit:${keySegment(scope)}:${keySegment(identifier)}`;
  const now = Date.now();
  const bucket = await storage.getItem<Bucket>(key);
  if (!bucket || bucket.resetAt < now) {
    await storage.setItem(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  await storage.setItem(key, { count: bucket.count + 1, resetAt: bucket.resetAt });
  return true;
}

export async function resetRateLimit(scope: string, identifier: string): Promise<void> {
  const storage = await getStorage();
  await storage.removeItem(`ratelimit:${keySegment(scope)}:${keySegment(identifier)}`);
}
