import { getEnv } from "./env.server";

/** Cloudflare Turnstile is enabled when both keys are configured. */
export function getTurnstileSiteKey(): string | null {
  return getEnv("TURNSTILE_SITE_KEY") && getEnv("TURNSTILE_SECRET_KEY")
    ? (getEnv("TURNSTILE_SITE_KEY") ?? null)
    : null;
}

export async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = getEnv("TURNSTILE_SECRET_KEY");
  if (!secret || !getEnv("TURNSTILE_SITE_KEY")) return true; // not enabled
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip) body.append("remoteip", ip);
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

/**
 * Lightweight content heuristics. Messages that trip these are stored with the
 * "spam" status (so nothing is silently lost) and no notification is sent.
 */
export function looksLikeSpam(message: string, name: string): boolean {
  const links = (message.match(/https?:\/\//gi) ?? []).length;
  if (links > 3) return true;
  if (/https?:\/\//i.test(name)) return true;
  if (/\[url=|<a\s+href=/i.test(message)) return true;
  return false;
}
