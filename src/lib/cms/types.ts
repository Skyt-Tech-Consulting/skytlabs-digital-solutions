/**
 * Shared CMS types (safe to import from client and server code).
 */

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export type JsonObject = { [key: string]: JsonValue };

export type ImageValue = { src: string; alt: string };
export type LinkValue = { label: string; href: string };

/** Page-level SEO fields editable from the admin. */
export type SeoFields = {
  /** <title> tag. */
  title: string;
  /** Meta description. */
  description: string;
  /** URL slug (without leading slash). Ignored for pages with a fixed path (home, blog). */
  slug: string;
  /** Social sharing image. Empty src falls back to the site default. */
  ogImage: ImageValue;
  /** When true the page gets `noindex, nofollow` and is left out of the sitemap. */
  noindex: boolean;
  /** Optional absolute canonical URL override. */
  canonical: string;
  /** Optional extra JSON-LD structured data (raw JSON). */
  structuredData: string;
};

export type PageDocVersion<T = unknown> = { content: T; seo: SeoFields };

/** Stored document for one editable page (draft + published copies). */
export type PageDoc<T = unknown> = {
  draft: PageDocVersion<T>;
  published: PageDocVersion<T> | null;
  draftUpdatedAt: string | null;
  draftUpdatedBy: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  /** Slugs this page used previously; requests to them 301 to the current slug. */
  previousSlugs: string[];
};

export type ArticleStatus = "draft" | "published";
export type ArticleDisplayStatus = "draft" | "scheduled" | "published";

export type Article = {
  id: string;
  title: string;
  slug: string;
  previousSlugs: string[];
  excerpt: string;
  /** Markdown body. */
  body: string;
  author: string;
  tags: string[];
  featuredImage: ImageValue;
  seo: { title: string; description: string; noindex: boolean };
  status: ArticleStatus;
  /** ISO date. When status is "published" and this is in the future, the article is scheduled. */
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type ArticleSummary = Omit<Article, "body"> & { displayStatus: ArticleDisplayStatus };

export type EnquiryStatus = "new" | "in_progress" | "closed" | "spam";

export type Enquiry = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  status: EnquiryStatus;
  notes: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  ip: string;
  userAgent: string;
  pageUrl: string;
  emailNotification: { sent: boolean; error: string | null };
};

export type MediaItem = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string;
  url: string;
  /** Set when the file is stored in Vercel Blob (url then points at the CDN). */
  blobUrl?: string | null;
  createdAt: string;
  uploadedBy: string | null;
};

export type UserRole = "admin" | "editor";

export type PublicUser = {
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
};

export type AdminSettings = {
  /** Where contact-form notifications are sent. Comma-separated list allowed. */
  notificationEmail: string;
};

export type EmailStatus = {
  configured: boolean;
  provider: string | null;
  from: string | null;
};

export type ContactConfig = {
  turnstileSiteKey: string | null;
};
