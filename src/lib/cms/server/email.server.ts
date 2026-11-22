import type { EmailStatus, Enquiry } from "../types";
import { getEnv } from "./env.server";

/**
 * Transactional email. Two providers are supported; SMTP wins when both are configured.
 *
 * 1. SMTP (e.g. Zoho Mail) — SMTP_HOST, SMTP_PORT (465 or 587), SMTP_USER, SMTP_PASSWORD.
 *    EMAIL_FROM defaults to SMTP_USER; with Zoho it must be that mailbox or one of its aliases.
 *    Requires a Node.js runtime (Vercel, Node servers) — not available on Cloudflare Workers.
 * 2. Resend HTTP API — RESEND_API_KEY + EMAIL_FROM (on a domain verified in Resend).
 */
type SmtpConfig = { host: string; port: number; user: string; password: string };

function getSmtpConfig(): SmtpConfig | null {
  const host = getEnv("SMTP_HOST");
  const user = getEnv("SMTP_USER");
  const password = getEnv("SMTP_PASSWORD");
  if (!host || !user || !password) return null;
  const port = Number(getEnv("SMTP_PORT") ?? "465");
  return { host, port: Number.isFinite(port) ? port : 465, user, password };
}

function getFrom(smtp: SmtpConfig | null): string | null {
  return getEnv("EMAIL_FROM") ?? smtp?.user ?? null;
}

export function getEmailStatus(): EmailStatus {
  const smtp = getSmtpConfig();
  if (smtp) return { configured: true, provider: `SMTP (${smtp.host})`, from: getFrom(smtp) };
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getFrom(null);
  return { configured: Boolean(apiKey && from), provider: apiKey ? "Resend" : null, from };
}

type SendArgs = { to: string[]; subject: string; text: string; html: string; replyTo?: string };

export async function sendEmail(args: SendArgs): Promise<void> {
  const smtp = getSmtpConfig();
  if (smtp) return sendViaSmtp(smtp, args);
  return sendViaResend(args);
}

async function sendViaSmtp(smtp: SmtpConfig, { to, subject, text, html, replyTo }: SendArgs) {
  const { createTransport } = await import("nodemailer");
  const transport = createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465, // 465 = SSL; 587 = STARTTLS
    requireTLS: smtp.port !== 465,
    auth: { user: smtp.user, pass: smtp.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  try {
    await transport.sendMail({
      from: getFrom(smtp) ?? smtp.user,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`SMTP server rejected the email: ${message.slice(0, 300)}`);
  } finally {
    transport.close();
  }
}

async function sendViaResend({ to, subject, text, html, replyTo }: SendArgs): Promise<void> {
  const apiKey = getEnv("RESEND_API_KEY");
  const from = getFrom(null);
  if (!apiKey || !from) {
    throw new Error(
      "Email is not configured (set SMTP_HOST, SMTP_USER and SMTP_PASSWORD, or RESEND_API_KEY and EMAIL_FROM).",
    );
  }
  // RESEND_API_URL is only for local testing against a mock endpoint.
  const endpoint = getEnv("RESEND_API_URL") ?? "https://api.resend.com/emails";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to,
      subject,
      text,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Email provider returned ${response.status}: ${detail.slice(0, 300)}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
  expiresInMinutes: number,
): Promise<void> {
  const text = [
    `Hello ${name},`,
    "",
    "Someone asked to reset the password for your SkytLabs website admin account.",
    `Use this link within ${expiresInMinutes} minutes to choose a new password:`,
    "",
    resetUrl,
    "",
    "Resetting your password signs out every device that is currently signed in.",
    "If you did not ask for this, you can ignore this email; your password will not change.",
  ].join("\n");
  const html = `
  <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2937;max-width:600px">
    <p>Hello ${escapeHtml(name)},</p>
    <p>Someone asked to reset the password for your SkytLabs website admin account.
      Use the button below within ${expiresInMinutes} minutes to choose a new password.</p>
    <p style="margin:24px 0"><a href="${escapeHtml(resetUrl)}"
      style="background:#1d4ed8;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a></p>
    <p style="color:#6b7280">Or paste this link into your browser:<br>${escapeHtml(resetUrl)}</p>
    <p style="color:#6b7280">Resetting your password signs out every device that is currently signed in.
      If you did not ask for this, ignore this email; your password will not change.</p>
  </div>`;
  await sendEmail({ to: [to], subject: "Reset your SkytLabs admin password", text, html });
}

export function parseRecipients(value: string): string[] {
  return value
    .split(/[,;\s]+/)
    .map((v) => v.trim())
    .filter((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
}

export async function sendEnquiryNotification(
  enquiry: Enquiry,
  recipients: string[],
  adminUrl: string,
): Promise<void> {
  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Company", enquiry.company || "—"],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "—"],
    ["Received", new Date(enquiry.createdAt).toUTCString()],
  ];
  const text = [
    "New enquiry from the SkytLabs website",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    enquiry.message,
    "",
    `View in admin: ${adminUrl}`,
  ].join("\n");

  const html = `
  <div style="font-family:Arial,sans-serif;font-size:14px;color:#1f2937;max-width:600px">
    <h2 style="margin:0 0 16px">New website enquiry</h2>
    <table style="border-collapse:collapse;width:100%;margin-bottom:16px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 12px 6px 0;color:#6b7280;width:110px">${k}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <div style="white-space:pre-wrap;background:#f3f4f6;border-radius:8px;padding:16px">${escapeHtml(enquiry.message)}</div>
    <p style="margin-top:24px"><a href="${escapeHtml(adminUrl)}" style="background:#1d4ed8;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open in admin</a></p>
    <p style="color:#9ca3af;font-size:12px">Reply to this email to respond to ${escapeHtml(enquiry.name)} directly.</p>
  </div>`;

  await sendEmail({
    to: recipients,
    subject: `New enquiry: ${enquiry.name}${enquiry.company ? ` (${enquiry.company})` : ""}`,
    text,
    html,
    replyTo: enquiry.email,
  });
}
