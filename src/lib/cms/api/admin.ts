/**
 * Server functions for the admin area. Every function (except login/session)
 * requires a signed-in user; user management and settings require the admin role.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestIP, getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import type { PageKey } from "../defaults";
import { PAGES, isPageKey } from "../pages";
import type {
  AdminSettings,
  Article,
  ArticleSummary,
  EmailStatus,
  Enquiry,
  JsonObject,
  MediaItem,
  PageDoc,
  PublicUser,
} from "../types";
import {
  authenticate,
  createPasswordReset,
  endSession,
  getSessionUser,
  hashPassword,
  listStoredUsers,
  requireUser,
  resetPasswordWithToken,
  saveStoredUsers,
  startSession,
  toPublicUser,
  validatePasswordStrength,
  AuthError,
} from "../server/auth.server";
import {
  getEmailStatus,
  parseRecipients,
  sendEmail,
  sendPasswordResetEmail,
} from "../server/email.server";
import { getEnv } from "../server/env.server";
import { consumeRateLimit, resetRateLimit } from "../server/ratelimit.server";
import { getTurnstileSiteKey } from "../server/spam.server";
import {
  articleDisplayStatus,
  deleteArticle,
  deleteEnquiry,
  deleteMedia,
  discardPageDraft,
  getActiveVersion,
  getAdminSettings,
  getArticle,
  getEnquiry,
  getPageDoc,
  getPagePaths,
  hasUnpublishedChanges,
  listArticleSummaries,
  listEnquiries,
  listMedia,
  publishPage,
  saveAdminSettings,
  saveArticle,
  saveMedia,
  savePageDraft,
  updateEnquiry,
  updateMediaAlt,
} from "../server/repo.server";

const pageKeySchema = z.string().refine(isPageKey, "Unknown page.");
const idSchema = z.string().regex(/^[a-z0-9]{1,64}$/i, "Invalid id.");

/* ================================ Auth ================================ */

export const getAdminSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicUser | null> => {
    const user = await getSessionUser();
    return user ? toPublicUser(user) : null;
  },
);

export const adminLogin = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().max(200), password: z.string().max(500) }))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    const limiterId = `${ip}:${data.email.toLowerCase()}`;
    if (!(await consumeRateLimit("login", limiterId, 8, 15 * 60 * 1000))) {
      return { ok: false, error: "Too many sign-in attempts. Please wait 15 minutes." };
    }
    try {
      const user = await authenticate(data.email, data.password);
      if (!user) return { ok: false, error: "Incorrect email or password." };
      await resetRateLimit("login", limiterId);
      await startSession(user);
      return { ok: true };
    } catch (e) {
      if (e instanceof AuthError) return { ok: false, error: e.message };
      throw e;
    }
  });

/**
 * The public address used in reset links. Deliberately ignores X-Forwarded-Host so a forged
 * header can't make the email point at someone else's site.
 */
async function trustedOrigin(): Promise<string> {
  const site = (await getActiveVersion("site", false)).content as { seo?: { siteUrl?: string } };
  const configured = site.seo?.siteUrl?.trim() || getEnv("URL")?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  return getRequestUrl().origin;
}

const RESET_REQUESTED =
  "If an account exists for that email, a reset link is on its way. It expires in 30 minutes; check your spam folder if it doesn't arrive.";

export const requestPasswordReset = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().trim().toLowerCase().max(200) }))
  .handler(
    async ({ data }): Promise<{ ok: true; message: string } | { ok: false; error: string }> => {
      const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
      if (
        !(await consumeRateLimit("reset-ip", ip, 5, 15 * 60 * 1000)) ||
        !(await consumeRateLimit("reset-email", data.email, 3, 60 * 60 * 1000))
      ) {
        return { ok: false, error: "Too many reset requests. Please wait a while and try again." };
      }
      if (!getEmailStatus().configured) {
        return {
          ok: false,
          error:
            "Email isn't set up on this website, so reset links can't be sent. Ask an administrator to reset your password.",
        };
      }
      const reset = await createPasswordReset(data.email);
      if (reset) {
        const url = `${await trustedOrigin()}/admin/reset-password?token=${reset.token}`;
        try {
          await sendPasswordResetEmail(
            reset.user.email,
            reset.user.name,
            url,
            reset.expiresInMinutes,
          );
        } catch (e) {
          // Logged only: telling the visitor would reveal that the account exists.
          console.error("[password-reset] email failed:", e instanceof Error ? e.message : e);
        }
      }
      return { ok: true, message: RESET_REQUESTED };
    },
  );

export const resetPasswordFn = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string().max(200), password: z.string().max(500) }))
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!(await consumeRateLimit("reset-use", ip, 10, 15 * 60 * 1000))) {
      return { ok: false, error: "Too many attempts. Please wait 15 minutes." };
    }
    const weak = validatePasswordStrength(data.password);
    if (weak) return { ok: false, error: weak };
    try {
      await resetPasswordWithToken(data.token, data.password);
      endSession();
      return { ok: true };
    } catch (e) {
      if (e instanceof AuthError) return { ok: false, error: e.message };
      throw e;
    }
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  endSession();
  return { ok: true };
});

/* ============================== Dashboard ============================= */

export const getDashboard = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  const [enquiries, articles, pages] = await Promise.all([
    listEnquiries(),
    listArticleSummaries(),
    Promise.all(PAGES.map(async (p) => ({ meta: p, doc: await getPageDoc(p.key) }))),
  ]);
  return {
    enquiries: {
      total: enquiries.filter((e) => e.status !== "spam").length,
      unread: enquiries.filter((e) => !e.read && e.status !== "spam").length,
      open: enquiries.filter((e) => e.status === "new" || e.status === "in_progress").length,
      recent: enquiries.filter((e) => e.status !== "spam").slice(0, 5),
      failedNotifications: enquiries.filter((e) => e.status !== "spam" && e.emailNotification.error)
        .length,
    },
    articles: {
      published: articles.filter((a) => a.displayStatus === "published").length,
      scheduled: articles.filter((a) => a.displayStatus === "scheduled").length,
      drafts: articles.filter((a) => a.displayStatus === "draft").length,
    },
    pagesWithChanges: pages
      .filter((p) => hasUnpublishedChanges(p.doc))
      .map((p) => ({ key: p.meta.key, label: p.meta.label })),
    email: getEmailStatus(),
  };
});

/* ================================ Pages =============================== */

export type PageListItem = {
  key: PageKey;
  label: string;
  description: string;
  path: string | null;
  publishedAt: string | null;
  draftUpdatedAt: string | null;
  hasChanges: boolean;
};

export const listPagesForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<PageListItem[]> => {
    await requireUser();
    const paths = await getPagePaths(false);
    return Promise.all(
      PAGES.map(async (meta) => {
        const doc = await getPageDoc(meta.key);
        const path = meta.routable ? (paths[meta.key as keyof typeof paths] ?? null) : null;
        return {
          key: meta.key,
          label: meta.label,
          description: meta.description,
          path,
          publishedAt: doc.publishedAt,
          draftUpdatedAt: doc.draftUpdatedAt,
          hasChanges: hasUnpublishedChanges(doc),
        };
      }),
    );
  },
);

export type PageEditPayload = {
  key: PageKey;
  doc: PageDoc<JsonObject>;
  hasChanges: boolean;
  livePath: string | null;
  draftPath: string | null;
};

async function pageEditPayload(key: PageKey, doc: PageDoc): Promise<PageEditPayload> {
  const meta = PAGES.find((p) => p.key === key)!;
  const [live, draft] = await Promise.all([getPagePaths(false), getPagePaths(true)]);
  const pick = (paths: typeof live) =>
    meta.routable ? (paths[key as keyof typeof paths] ?? null) : null;
  return {
    key,
    doc: doc as PageDoc<JsonObject>,
    hasChanges: hasUnpublishedChanges(doc),
    livePath: pick(live),
    draftPath: pick(draft),
  };
}

export const getPageForEdit = createServerFn({ method: "GET" })
  .validator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    await requireUser();
    const key = data.key as PageKey;
    return pageEditPayload(key, await getPageDoc(key));
  });

export const savePage = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: pageKeySchema,
      version: z.object({ content: z.unknown(), seo: z.record(z.unknown()) }),
    }),
  )
  .handler(async ({ data }) => {
    const user = await requireUser();
    const key = data.key as PageKey;
    const doc = await savePageDraft(key, data.version as PageDoc["draft"], user.email);
    return pageEditPayload(key, doc);
  });

export const publishPageFn = createServerFn({ method: "POST" })
  .validator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    const user = await requireUser();
    const key = data.key as PageKey;
    return pageEditPayload(key, await publishPage(key, user.email));
  });

export const discardPageFn = createServerFn({ method: "POST" })
  .validator(z.object({ key: pageKeySchema }))
  .handler(async ({ data }) => {
    await requireUser();
    const key = data.key as PageKey;
    return pageEditPayload(key, await discardPageDraft(key));
  });

/* =============================== Articles ============================= */

export const listArticlesForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArticleSummary[]> => {
    await requireUser();
    return listArticleSummaries();
  },
);

export const getArticleForEdit = createServerFn({ method: "GET" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }): Promise<Article | null> => {
    await requireUser();
    return getArticle(data.id);
  });

const imageSchema = z.object({ src: z.string().max(2000), alt: z.string().max(500) });

const articleInputSchema = z.object({
  id: idSchema.nullable(),
  title: z.string().max(300),
  slug: z.string().max(100),
  excerpt: z.string().max(1000),
  body: z.string().max(200_000),
  author: z.string().max(200),
  tags: z.array(z.string().max(60)).max(20),
  featuredImage: imageSchema,
  seo: z.object({
    title: z.string().max(300),
    description: z.string().max(500),
    noindex: z.boolean(),
  }),
  status: z.enum(["draft", "published"]),
  publishAt: z.string().max(40).nullable(),
});

export const saveArticleFn = createServerFn({ method: "POST" })
  .validator(articleInputSchema)
  .handler(async ({ data }) => {
    const user = await requireUser();
    const article = await saveArticle(data, user.email);
    return { article, displayStatus: articleDisplayStatus(article) };
  });

export const deleteArticleFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }) => {
    await requireUser();
    await deleteArticle(data.id);
    return { ok: true };
  });

/* ============================== Enquiries ============================= */

export const listEnquiriesForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<Enquiry[]> => {
    await requireUser();
    return listEnquiries();
  },
);

export const getEnquiryForAdmin = createServerFn({ method: "GET" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }): Promise<Enquiry | null> => {
    await requireUser();
    const enquiry = await getEnquiry(data.id);
    if (enquiry && !enquiry.read) return updateEnquiry(enquiry.id, { read: true });
    return enquiry;
  });

export const updateEnquiryFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: idSchema,
      status: z.enum(["new", "in_progress", "closed", "spam"]).optional(),
      notes: z.string().max(10_000).optional(),
      read: z.boolean().optional(),
    }),
  )
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...rest } = data;
    const patch: Parameters<typeof updateEnquiry>[1] = {};
    if (rest.status !== undefined) patch.status = rest.status;
    if (rest.notes !== undefined) patch.notes = rest.notes;
    if (rest.read !== undefined) patch.read = rest.read;
    return updateEnquiry(id, patch);
  });

export const deleteEnquiryFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }) => {
    await requireUser();
    await deleteEnquiry(data.id);
    return { ok: true };
  });

/* ================================ Media =============================== */

export const listMediaForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<MediaItem[]> => {
    await requireUser();
    return listMedia();
  },
);

export const uploadMedia = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!(input instanceof FormData)) throw new Error("Expected form data.");
    const file = input.get("file");
    if (!(file instanceof File)) throw new Error("No file was uploaded.");
    const alt = input.get("alt");
    return { file, alt: typeof alt === "string" ? alt : "" };
  })
  .handler(async ({ data }): Promise<MediaItem> => {
    const user = await requireUser();
    const bytes = new Uint8Array(await data.file.arrayBuffer());
    return saveMedia({ name: data.file.name, type: data.file.type, bytes }, data.alt, user.email);
  });

export const updateMediaAltFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idSchema, alt: z.string().max(500) }))
  .handler(async ({ data }) => {
    await requireUser();
    return updateMediaAlt(data.id, data.alt);
  });

export const deleteMediaFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: idSchema }))
  .handler(async ({ data }) => {
    await requireUser();
    await deleteMedia(data.id);
    return { ok: true };
  });

/* =============================== Settings ============================= */

export const getSettingsForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ settings: AdminSettings; email: EmailStatus; turnstile: boolean }> => {
    await requireUser();
    return {
      settings: await getAdminSettings(),
      email: getEmailStatus(),
      turnstile: getTurnstileSiteKey() !== null,
    };
  },
);

export const saveSettingsFn = createServerFn({ method: "POST" })
  .validator(z.object({ notificationEmail: z.string().max(1000) }))
  .handler(async ({ data }) => {
    await requireUser("admin");
    const recipients = parseRecipients(data.notificationEmail);
    if (recipients.length === 0) {
      throw new Error("Enter at least one valid notification email address.");
    }
    return saveAdminSettings({ notificationEmail: recipients.join(", ") });
  });

export const sendTestEmailFn = createServerFn({ method: "POST" }).handler(async () => {
  const user = await requireUser("admin");
  const settings = await getAdminSettings();
  const recipients = parseRecipients(settings.notificationEmail);
  if (recipients.length === 0) throw new Error("No notification recipient is set.");
  await sendEmail({
    to: recipients,
    subject: "SkytLabs website — test notification",
    text: `This is a test email sent from the SkytLabs website admin by ${user.email}. Contact-form notifications will arrive at this address.`,
    html: `<p>This is a test email sent from the SkytLabs website admin by ${user.email}.</p><p>Contact-form notifications will arrive at this address.</p>`,
  });
  return { ok: true, recipients };
});

/* ================================ Users =============================== */

export const listUsersForAdmin = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicUser[]> => {
    await requireUser("admin");
    return (await listStoredUsers()).map(toPublicUser);
  },
);

export const createUserFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().trim().toLowerCase().email().max(200),
      name: z.string().trim().min(1).max(120),
      role: z.enum(["admin", "editor"]),
      password: z.string().max(500),
    }),
  )
  .handler(async ({ data }) => {
    await requireUser("admin");
    const weak = validatePasswordStrength(data.password);
    if (weak) throw new Error(weak);
    const users = await listStoredUsers();
    if (users.some((u) => u.email === data.email)) {
      throw new Error("A user with that email already exists.");
    }
    const { salt, hash } = await hashPassword(data.password);
    users.push({
      email: data.email,
      name: data.name,
      role: data.role,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash: hash,
    });
    await saveStoredUsers(users);
    return users.map(toPublicUser);
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().max(200) }))
  .handler(async ({ data }) => {
    const me = await requireUser("admin");
    if (me.email === data.email) throw new Error("You cannot remove your own account.");
    const users = await listStoredUsers();
    const remaining = users.filter((u) => u.email !== data.email);
    if (!remaining.some((u) => u.role === "admin")) {
      throw new Error("At least one administrator must remain.");
    }
    await saveStoredUsers(remaining);
    return remaining.map(toPublicUser);
  });

export const setUserPasswordFn = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().max(200), password: z.string().max(500) }))
  .handler(async ({ data }) => {
    const me = await requireUser();
    if (me.email !== data.email && me.role !== "admin") {
      throw new Error("Only administrators can change other users' passwords.");
    }
    const weak = validatePasswordStrength(data.password);
    if (weak) throw new Error(weak);
    const users = await listStoredUsers();
    const target = users.find((u) => u.email === data.email);
    if (!target) throw new Error("User not found.");
    const { salt, hash } = await hashPassword(data.password);
    target.salt = salt;
    target.passwordHash = hash;
    await saveStoredUsers(users);
    // A new password signs out existing sessions; keep the person who changed their own.
    if (target.email === me.email) await startSession(target);
    return { ok: true };
  });
