import { pageDefaults, type PageKey } from "../defaults";
import { mergeWithDefaults } from "../merge";
import {
  DEFAULT_PAGE_PATHS,
  RESERVED_SLUGS,
  SLUG_PAGES,
  getPageMeta,
  isValidSlug,
  type PagePaths,
  type SlugPageKey,
} from "../pages";
import type {
  AdminSettings,
  Article,
  ArticleDisplayStatus,
  ArticleSummary,
  Enquiry,
  MediaItem,
  PageDoc,
  PageDocVersion,
  SeoFields,
} from "../types";
import { getEnv } from "./env.server";
import { getStorage, newId } from "./storage.server";

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/* =============================== Pages =============================== */

type AnyVersion = PageDocVersion<unknown>;

function defaultVersion(key: PageKey): AnyVersion {
  const d = pageDefaults[key];
  return { content: d.content, seo: d.seo };
}

function normalizeVersion(key: PageKey, stored: unknown): AnyVersion {
  return mergeWithDefaults(defaultVersion(key), stored);
}

export async function getPageDoc(key: PageKey): Promise<PageDoc> {
  const storage = await getStorage();
  const stored = await storage.getItem<PageDoc>(`pages:${key}`);
  if (!stored) {
    return {
      draft: defaultVersion(key),
      published: null,
      draftUpdatedAt: null,
      draftUpdatedBy: null,
      publishedAt: null,
      publishedBy: null,
      previousSlugs: [],
    };
  }
  return {
    ...stored,
    draft: normalizeVersion(key, stored.draft),
    published: stored.published ? normalizeVersion(key, stored.published) : null,
    previousSlugs: stored.previousSlugs ?? [],
  };
}

/** The live version (published, or the built-in defaults when never published). */
export async function getActiveVersion(key: PageKey, preview: boolean): Promise<AnyVersion> {
  const doc = await getPageDoc(key);
  if (preview) return doc.draft;
  return doc.published ?? defaultVersion(key);
}

export function hasUnpublishedChanges(doc: PageDoc): boolean {
  if (!doc.draftUpdatedAt) return false;
  if (!doc.publishedAt) return true;
  return doc.draftUpdatedAt > doc.publishedAt;
}

function sanitizeSeo(key: PageKey, seo: SeoFields): SeoFields {
  const meta = getPageMeta(key);
  const slug = meta.fixedPath !== null || !meta.routable ? pageDefaults[key].seo.slug : seo.slug;
  return {
    ...seo,
    slug: slug
      .trim()
      .toLowerCase()
      .replace(/^\/+|\/+$/g, ""),
  };
}

async function assertSlugAvailable(key: PageKey, slug: string): Promise<void> {
  if (!(SLUG_PAGES as readonly string[]).includes(key)) return;
  if (!isValidSlug(slug)) {
    throw new ValidationError(
      "URL slug may only contain lowercase letters, numbers and single hyphens (e.g. about-us).",
    );
  }
  if (RESERVED_SLUGS.includes(slug)) {
    throw new ValidationError(`"${slug}" is reserved by the system. Choose a different slug.`);
  }
  for (const other of SLUG_PAGES) {
    if (other === key) continue;
    const doc = await getPageDoc(other);
    const slugs = [doc.draft.seo.slug, doc.published?.seo.slug ?? pageDefaults[other].seo.slug];
    if (slugs.includes(slug)) {
      throw new ValidationError(`The slug "${slug}" is already used by the ${other} page.`);
    }
  }
}

function validateStructuredData(seo: SeoFields): void {
  if (!seo.structuredData.trim()) return;
  try {
    JSON.parse(seo.structuredData);
  } catch {
    throw new ValidationError("Structured data must be valid JSON (JSON-LD).");
  }
}

export async function savePageDraft(
  key: PageKey,
  version: AnyVersion,
  userEmail: string,
): Promise<PageDoc> {
  const doc = await getPageDoc(key);
  const normalized = normalizeVersion(key, version);
  normalized.seo = sanitizeSeo(key, normalized.seo);
  await assertSlugAvailable(key, normalized.seo.slug);
  validateStructuredData(normalized.seo);
  const next: PageDoc = {
    ...doc,
    draft: normalized,
    draftUpdatedAt: new Date().toISOString(),
    draftUpdatedBy: userEmail,
  };
  const storage = await getStorage();
  await storage.setItem(`pages:${key}`, next);
  return next;
}

export async function publishPage(key: PageKey, userEmail: string): Promise<PageDoc> {
  const doc = await getPageDoc(key);
  await assertSlugAvailable(key, doc.draft.seo.slug);
  const now = new Date().toISOString();
  const oldSlug = (doc.published ?? defaultVersion(key)).seo.slug;
  const newSlug = doc.draft.seo.slug;
  const previousSlugs = new Set(doc.previousSlugs);
  if (oldSlug && oldSlug !== newSlug) previousSlugs.add(oldSlug);
  previousSlugs.delete(newSlug);

  const next: PageDoc = {
    ...doc,
    published: doc.draft,
    publishedAt: now,
    publishedBy: userEmail,
    draftUpdatedAt: doc.draftUpdatedAt ?? now,
    previousSlugs: [...previousSlugs],
  };
  const storage = await getStorage();
  await storage.setItem(`pages:${key}`, next);

  // A slug that now belongs to this page must stop redirecting elsewhere.
  if (newSlug) {
    for (const other of SLUG_PAGES) {
      if (other === key) continue;
      const otherDoc = await getPageDoc(other);
      if (otherDoc.previousSlugs.includes(newSlug)) {
        await storage.setItem(`pages:${other}`, {
          ...otherDoc,
          previousSlugs: otherDoc.previousSlugs.filter((s) => s !== newSlug),
        });
      }
    }
  }
  return next;
}

export async function discardPageDraft(key: PageKey): Promise<PageDoc> {
  const doc = await getPageDoc(key);
  const next: PageDoc = {
    ...doc,
    draft: doc.published ?? defaultVersion(key),
    draftUpdatedAt: doc.publishedAt,
    draftUpdatedBy: doc.publishedBy,
  };
  const storage = await getStorage();
  await storage.setItem(`pages:${key}`, next);
  return next;
}

export async function getPagePaths(preview: boolean): Promise<PagePaths> {
  const paths: PagePaths = { ...DEFAULT_PAGE_PATHS };
  await Promise.all(
    SLUG_PAGES.map(async (key) => {
      const version = await getActiveVersion(key, preview);
      paths[key] = `/${version.seo.slug || pageDefaults[key].seo.slug}`;
    }),
  );
  return paths;
}

export type SlugResolution =
  { type: "page"; key: SlugPageKey } | { type: "redirect"; to: string } | { type: "none" };

export async function resolvePageSlug(slug: string, preview: boolean): Promise<SlugResolution> {
  const normalized = slug.toLowerCase();
  const paths = await getPagePaths(preview);
  for (const key of SLUG_PAGES) {
    if (paths[key] === `/${normalized}`) return { type: "page", key };
  }
  for (const key of SLUG_PAGES) {
    const doc = await getPageDoc(key);
    const published = doc.published?.seo.slug;
    if (
      doc.previousSlugs.includes(normalized) ||
      pageDefaults[key].seo.slug === normalized ||
      published === normalized
    ) {
      return { type: "redirect", to: paths[key] };
    }
  }
  return { type: "none" };
}

/* ============================== Articles ============================= */

export function articleDisplayStatus(article: Article, now = Date.now()): ArticleDisplayStatus {
  if (article.status !== "published") return "draft";
  if (article.publishAt && new Date(article.publishAt).getTime() > now) return "scheduled";
  return "published";
}

export function isArticleLive(article: Article): boolean {
  return articleDisplayStatus(article) === "published";
}

function summarize(article: Article): ArticleSummary {
  const { body: _body, ...rest } = article;
  return { ...rest, displayStatus: articleDisplayStatus(article) };
}

async function loadAllArticles(): Promise<Article[]> {
  const storage = await getStorage();
  const keys = await storage.getKeys("articles");
  if (keys.length === 0) return [];
  const items = await storage.getItems<Article>(keys);
  return items.map((i) => i.value).filter((a): a is Article => Boolean(a && a.id));
}

function sortByDate(a: Article, b: Article): number {
  const da = a.publishAt ?? a.updatedAt;
  const db = b.publishAt ?? b.updatedAt;
  return db.localeCompare(da);
}

export async function listArticleSummaries(): Promise<ArticleSummary[]> {
  const articles = await loadAllArticles();
  return articles.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((a) => summarize(a));
}

export async function listLiveArticles(): Promise<ArticleSummary[]> {
  const articles = await loadAllArticles();
  return articles
    .filter(isArticleLive)
    .sort(sortByDate)
    .map((a) => summarize(a));
}

export async function getArticle(id: string): Promise<Article | null> {
  const storage = await getStorage();
  return storage.getItem<Article>(`articles:${id.replace(/[^a-z0-9]/gi, "")}`);
}

export async function findArticleBySlug(
  slug: string,
): Promise<{ article: Article; redirect: boolean } | null> {
  const articles = await loadAllArticles();
  const direct = articles.find((a) => a.slug === slug);
  if (direct) return { article: direct, redirect: false };
  const moved = articles.find((a) => a.previousSlugs.includes(slug));
  return moved ? { article: moved, redirect: true } : null;
}

export type ArticleInput = Omit<
  Article,
  "id" | "createdAt" | "updatedAt" | "updatedBy" | "previousSlugs"
> & { id: string | null };

export async function saveArticle(input: ArticleInput, userEmail: string): Promise<Article> {
  const title = input.title.trim();
  if (!title) throw new ValidationError("Article title is required.");
  const slug = input.slug.trim().toLowerCase();
  if (!isValidSlug(slug)) {
    throw new ValidationError(
      "Article URL may only contain lowercase letters, numbers and single hyphens.",
    );
  }
  if (input.status === "published" && !input.publishAt) {
    throw new ValidationError("A publish date is required to publish or schedule an article.");
  }
  if (input.publishAt && Number.isNaN(new Date(input.publishAt).getTime())) {
    throw new ValidationError("Publish date is not a valid date.");
  }

  const articles = await loadAllArticles();
  const clash = articles.find(
    (a) => a.id !== input.id && (a.slug === slug || a.previousSlugs.includes(slug)),
  );
  if (clash) throw new ValidationError(`The URL "${slug}" is already used by "${clash.title}".`);

  const existing = input.id ? articles.find((a) => a.id === input.id) : undefined;
  if (input.id && !existing) throw new ValidationError("Article not found.");

  const now = new Date().toISOString();
  const previousSlugs = new Set(existing?.previousSlugs ?? []);
  if (existing && existing.slug !== slug && isArticleLive(existing)) {
    previousSlugs.add(existing.slug);
  }
  previousSlugs.delete(slug);

  const article: Article = {
    id: existing?.id ?? newId(),
    title,
    slug,
    previousSlugs: [...previousSlugs],
    excerpt: input.excerpt.trim(),
    body: input.body,
    author: input.author.trim(),
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    featuredImage: { src: input.featuredImage.src, alt: input.featuredImage.alt.trim() },
    seo: {
      title: input.seo.title.trim(),
      description: input.seo.description.trim(),
      noindex: Boolean(input.seo.noindex),
    },
    status: input.status,
    publishAt: input.publishAt ? new Date(input.publishAt).toISOString() : null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    updatedBy: userEmail,
  };
  const storage = await getStorage();
  await storage.setItem(`articles:${article.id}`, article);
  return article;
}

export async function deleteArticle(id: string): Promise<void> {
  const storage = await getStorage();
  await storage.removeItem(`articles:${id.replace(/[^a-z0-9]/gi, "")}`);
}

/* ============================== Enquiries ============================ */

export async function createEnquiry(
  data: Omit<Enquiry, "id" | "createdAt" | "updatedAt" | "notes" | "read" | "emailNotification">,
): Promise<Enquiry> {
  const now = new Date().toISOString();
  const enquiry: Enquiry = {
    ...data,
    id: newId(),
    notes: "",
    read: false,
    createdAt: now,
    updatedAt: now,
    emailNotification: { sent: false, error: null },
  };
  const storage = await getStorage();
  await storage.setItem(`enquiries:${enquiry.id}`, enquiry);
  return enquiry;
}

export async function listEnquiries(): Promise<Enquiry[]> {
  const storage = await getStorage();
  const keys = await storage.getKeys("enquiries");
  if (keys.length === 0) return [];
  const items = await storage.getItems<Enquiry>(keys);
  return items
    .map((i) => i.value)
    .filter((e): e is Enquiry => Boolean(e && e.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEnquiry(id: string): Promise<Enquiry | null> {
  const storage = await getStorage();
  return storage.getItem<Enquiry>(`enquiries:${id.replace(/[^a-z0-9]/gi, "")}`);
}

export async function updateEnquiry(
  id: string,
  patch: Partial<Pick<Enquiry, "status" | "notes" | "read" | "emailNotification">>,
): Promise<Enquiry> {
  const enquiry = await getEnquiry(id);
  if (!enquiry) throw new ValidationError("Enquiry not found.");
  const next: Enquiry = { ...enquiry, ...patch, updatedAt: new Date().toISOString() };
  const storage = await getStorage();
  await storage.setItem(`enquiries:${enquiry.id}`, next);
  return next;
}

export async function deleteEnquiry(id: string): Promise<void> {
  const storage = await getStorage();
  await storage.removeItem(`enquiries:${id.replace(/[^a-z0-9]/gi, "")}`);
}

/* ================================ Media ============================== */

export const MEDIA_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
// Vercel functions accept request bodies up to 4.5 MB, so uploads are capped at 4 MB.
export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

function mediaUrl(id: string, filename: string): string {
  return `/media/${id}/${encodeURIComponent(filename)}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function saveMedia(
  file: { name: string; type: string; bytes: Uint8Array },
  alt: string,
  userEmail: string,
): Promise<MediaItem> {
  const ext = MEDIA_TYPES[file.type];
  if (!ext) throw new ValidationError("Only JPG, PNG, WebP, GIF and AVIF images can be uploaded.");
  if (file.bytes.byteLength > MAX_MEDIA_BYTES) {
    throw new ValidationError("Images must be 4 MB or smaller.");
  }
  const id = newId();
  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "image";
  const filename = `${base}.${ext}`;
  const storage = await getStorage();
  let url = mediaUrl(id, filename);
  let blobUrl: string | null = null;

  if (getEnv("BLOB_READ_WRITE_TOKEN")) {
    // Vercel Blob: the file is served directly from Vercel's CDN.
    const { put } = await import("@vercel/blob");
    const blob = await put(`media/${id}/${filename}`, Buffer.from(file.bytes), {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
      cacheControlMaxAge: 31536000,
    });
    url = blob.url;
    blobUrl = blob.url;
  } else {
    await storage.setItem(`mediablob:${id}`, bytesToBase64(file.bytes));
  }

  const item: MediaItem = {
    id,
    filename,
    contentType: file.type,
    size: file.bytes.byteLength,
    alt: alt.trim(),
    url,
    blobUrl,
    createdAt: new Date().toISOString(),
    uploadedBy: userEmail,
  };
  await storage.setItem(`media:${id}`, item);
  return item;
}

export async function listMedia(): Promise<MediaItem[]> {
  const storage = await getStorage();
  const keys = await storage.getKeys("media");
  if (keys.length === 0) return [];
  const items = await storage.getItems<MediaItem>(keys);
  return items
    .map((i) => i.value)
    .filter((m): m is MediaItem => Boolean(m && m.id))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMediaFile(
  id: string,
): Promise<{ item: MediaItem; bytes: Uint8Array } | null> {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  const storage = await getStorage();
  const item = await storage.getItem<MediaItem>(`media:${safeId}`);
  if (!item) return null;
  const data = await storage.getItem<string>(`mediablob:${safeId}`);
  if (!data) return null;
  return { item, bytes: base64ToBytes(data) };
}

export async function updateMediaAlt(id: string, alt: string): Promise<MediaItem> {
  const storage = await getStorage();
  const item = await storage.getItem<MediaItem>(`media:${id.replace(/[^a-z0-9]/gi, "")}`);
  if (!item) throw new ValidationError("Image not found.");
  const next = { ...item, alt: alt.trim() };
  await storage.setItem(`media:${item.id}`, next);
  return next;
}

export async function deleteMedia(id: string): Promise<void> {
  const safeId = id.replace(/[^a-z0-9]/gi, "");
  const storage = await getStorage();
  const item = await storage.getItem<MediaItem>(`media:${safeId}`);
  if (item?.blobUrl) {
    const { del } = await import("@vercel/blob");
    await del(item.blobUrl);
  }
  await storage.removeItem(`media:${safeId}`);
  await storage.removeItem(`mediablob:${safeId}`);
}

/* ============================== Settings ============================= */

export async function getAdminSettings(): Promise<AdminSettings> {
  const storage = await getStorage();
  const stored = await storage.getItem<Partial<AdminSettings>>("system:settings");
  return {
    notificationEmail:
      stored?.notificationEmail ??
      getEnv("CONTACT_NOTIFICATION_EMAIL") ??
      pageDefaults.site.content.company.email,
  };
}

export async function saveAdminSettings(settings: AdminSettings): Promise<AdminSettings> {
  const storage = await getStorage();
  await storage.setItem("system:settings", settings);
  return settings;
}
