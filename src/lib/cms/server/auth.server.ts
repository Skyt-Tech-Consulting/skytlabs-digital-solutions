import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server";
import type { PublicUser, UserRole } from "../types";
import { getEnv, isProduction } from "./env.server";
import { getStorage } from "./storage.server";

const SESSION_COOKIE = "skyt_admin";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const PBKDF2_ITERATIONS = 100_000; // Cloudflare Workers' maximum.
const USERS_KEY = "system:users";
const SECRET_KEY = "system:session-secret";
const RESETS_KEY = "system:password-resets";
const RESET_TTL_MS = 30 * 60 * 1000;

export type StoredUser = PublicUser & { passwordHash: string; salt: string };

export class AuthError extends Error {
  constructor(message = "You must be signed in to do that.") {
    super(message);
    this.name = "AuthError";
  }
}

/* ----------------------------- encoding ------------------------------ */

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ----------------------------- passwords ----------------------------- */

async function derive(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS },
    key,
    256,
  );
  return toBase64Url(new Uint8Array(bits));
}

export async function hashPassword(password: string): Promise<{ salt: string; hash: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return { salt: toBase64Url(salt), hash: await derive(password, salt) };
}

async function verifyPassword(password: string, user: StoredUser): Promise<boolean> {
  const hash = await derive(password, fromBase64Url(user.salt));
  return timingSafeEqual(hash, user.passwordHash);
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) return "Password must be at least 10 characters.";
  return null;
}

/* ------------------------------- users ------------------------------- */

export async function listStoredUsers(): Promise<StoredUser[]> {
  const storage = await getStorage();
  return (await storage.getItem<StoredUser[]>(USERS_KEY)) ?? [];
}

export async function saveStoredUsers(users: StoredUser[]): Promise<void> {
  const storage = await getStorage();
  await storage.setItem(USERS_KEY, users);
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
}

/**
 * Authenticates a user. When no accounts exist yet, the first administrator is
 * created from the ADMIN_EMAIL / ADMIN_PASSWORD environment variables.
 */
export async function authenticate(email: string, password: string): Promise<StoredUser | null> {
  const normalized = email.trim().toLowerCase();
  const users = await listStoredUsers();

  if (users.length === 0) {
    const bootstrapEmail = getEnv("ADMIN_EMAIL")?.trim().toLowerCase();
    const bootstrapPassword = getEnv("ADMIN_PASSWORD");
    if (!bootstrapEmail || !bootstrapPassword) {
      throw new AuthError(
        "No administrator account exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server, then sign in with them.",
      );
    }
    if (normalized !== bootstrapEmail || !timingSafeEqual(password, bootstrapPassword)) return null;
    const { salt, hash } = await hashPassword(password);
    const admin: StoredUser = {
      email: bootstrapEmail,
      name: "Administrator",
      role: "admin",
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: hash,
    };
    await saveStoredUsers([admin]);
    return admin;
  }

  const user = users.find((u) => u.email === normalized);
  if (!user) {
    // Spend comparable time to avoid revealing which emails exist.
    await derive(password, crypto.getRandomValues(new Uint8Array(16)));
    return null;
  }
  return (await verifyPassword(password, user)) ? user : null;
}

/* ------------------------------ sessions ----------------------------- */

let cachedSecret: CryptoKey | undefined;

async function getSigningKey(): Promise<CryptoKey> {
  if (cachedSecret) return cachedSecret;
  let secret = getEnv("SESSION_SECRET");
  if (!secret) {
    // Fall back to a random secret generated once and persisted in storage.
    const storage = await getStorage();
    secret = (await storage.getItem<string>(SECRET_KEY)) ?? undefined;
    if (!secret) {
      secret = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
      await storage.setItem(SECRET_KEY, secret);
    }
  }
  cachedSecret = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return cachedSecret;
}

async function sign(value: string): Promise<string> {
  const key = await getSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
}

/**
 * A short fingerprint of the user's current password hash, stored in the session.
 * Changing or resetting the password changes it, which signs out every existing session.
 */
async function passwordFingerprint(user: StoredUser): Promise<string> {
  return (await sign(`pw:${user.passwordHash}`)).slice(0, 22);
}

export async function startSession(user: StoredUser): Promise<void> {
  const payload = toBase64Url(
    encoder.encode(
      JSON.stringify({
        e: user.email,
        x: Date.now() + SESSION_TTL_MS,
        v: await passwordFingerprint(user),
      }),
    ),
  );
  const token = `${payload}.${await sign(payload)}`;
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction(),
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function endSession(): void {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

/** Returns the signed-in user, or null. Never throws for a bad cookie. */
export async function getSessionUser(): Promise<StoredUser | null> {
  const token = getCookie(SESSION_COOKIE);
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  try {
    if (!timingSafeEqual(await sign(payload), signature)) return null;
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      e?: string;
      x?: number;
      v?: string;
    };
    if (!data.e || !data.x || !data.v || data.x < Date.now()) return null;
    const users = await listStoredUsers();
    const user = users.find((u) => u.email === data.e);
    if (!user || !timingSafeEqual(await passwordFingerprint(user), data.v)) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser(role?: UserRole): Promise<StoredUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthError();
  if (role === "admin" && user.role !== "admin") {
    throw new AuthError("Only administrators can do that.");
  }
  return user;
}

/* --------------------------- password reset -------------------------- */

type ResetRecord = { tokenHash: string; email: string; expiresAt: number; fingerprint: string };

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return toBase64Url(new Uint8Array(digest));
}

async function loadResets(): Promise<ResetRecord[]> {
  const storage = await getStorage();
  const all = (await storage.getItem<ResetRecord[]>(RESETS_KEY)) ?? [];
  return all.filter((r) => r.expiresAt > Date.now());
}

async function saveResets(records: ResetRecord[]): Promise<void> {
  const storage = await getStorage();
  await storage.setItem(RESETS_KEY, records);
}

/**
 * Creates a single-use reset token for the account, valid for 30 minutes. Only a hash of
 * the token is stored. Requesting a new link cancels earlier ones for that account.
 * Returns null when no account has that email.
 */
export async function createPasswordReset(
  email: string,
): Promise<{ token: string; user: StoredUser; expiresInMinutes: number } | null> {
  const normalized = email.trim().toLowerCase();
  const user = (await listStoredUsers()).find((u) => u.email === normalized);
  if (!user) return null;
  const token = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const records = (await loadResets()).filter((r) => r.email !== user.email);
  records.push({
    tokenHash: await sha256(token),
    email: user.email,
    expiresAt: Date.now() + RESET_TTL_MS,
    fingerprint: await passwordFingerprint(user),
  });
  await saveResets(records);
  return { token, user, expiresInMinutes: RESET_TTL_MS / 60_000 };
}

/** Sets a new password using a reset token. Throws AuthError for invalid or used links. */
export async function resetPasswordWithToken(token: string, password: string): Promise<void> {
  const invalid = new AuthError(
    "This reset link is invalid or has expired. Please request a new one.",
  );
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) throw invalid;
  const tokenHash = await sha256(token);
  const records = await loadResets();
  const record = records.find((r) => timingSafeEqual(r.tokenHash, tokenHash));
  if (!record) throw invalid;
  const users = await listStoredUsers();
  const user = users.find((u) => u.email === record.email);
  // The fingerprint check makes the link unusable once the password has changed.
  if (!user || !timingSafeEqual(await passwordFingerprint(user), record.fingerprint)) {
    await saveResets(records.filter((r) => r !== record));
    throw invalid;
  }
  const { salt, hash } = await hashPassword(password);
  user.salt = salt;
  user.passwordHash = hash;
  await saveStoredUsers(users);
  await saveResets(records.filter((r) => r.email !== user.email));
}
