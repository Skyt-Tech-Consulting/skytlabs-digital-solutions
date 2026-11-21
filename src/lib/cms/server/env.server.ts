/**
 * Reads configuration from `process.env` (Node / dev) or the Cloudflare Workers
 * env object that Nitro exposes as `globalThis.__env__`.
 */
export function getEnv(name: string): string | undefined {
  const fromProcess = typeof process !== "undefined" ? process.env?.[name] : undefined;
  if (fromProcess !== undefined && fromProcess !== "") return fromProcess;
  const cfEnv = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const fromCf = cfEnv?.[name];
  return typeof fromCf === "string" && fromCf !== "" ? fromCf : undefined;
}

export function isProduction(): boolean {
  return getEnv("NODE_ENV") === "production";
}
