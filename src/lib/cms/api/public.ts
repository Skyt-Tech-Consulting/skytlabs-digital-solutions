/**
 * Server functions used by the public website.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP, getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";
import { pageDefaults, type PageContent, type SiteSettings } from "../defaults";
import { renderMarkdown, readingTime } from "../markdown";
import type { PagePaths, SlugPageKey } from "../pages";
import type { SiteSeo } from "../seo";
import type { ArticleSummary, ContactConfig, ImageValue, SeoFields } from "../types";
import { getSessionUser } from "../server/auth.server";
import { getEmailStatus, parseRecipients, sendEnquiryNotification } from "../server/email.server";
import { consumeRateLimit } from "../server/ratelimit.server";
import {
  createEnquiry,
  findArticleBySlug,
  getActiveVersion,
  getAdminSettings,
  getPagePaths,
  isArticleLive,
  listLiveArticles,
  resolvePageSlug,
  updateEnquiry,
} from "../server/repo.server";
import { getTurnstileSiteKey, looksLikeSpam, verifyTurnstile } from "../server/spam.server";

const previewInput = z.object({ preview: z.boolean().optional() });

/** Preview (draft) content is only served to signed-in staff. */
async function effectivePreview(requested: boolean | undefined): Promise<boolean> {
  if (!requested) return false;
  return Boolean(await getSessionUser());
}

function requestOrigin(): string {
  try {
    return getRequestUrl({ xForwardedHost: true, xForwardedProto: true }).origin;
  } catch {
    return "";
  }
}

async function loadSite(preview: boolean) {
  const site = (await getActiveVersion("site", preview)).content as SiteSettings;
  const paths = await getPagePaths(preview);
  const services = (await getActiveVersion("services", preview)).content as PageContent<"services">;
  const siteSeo: SiteSeo = {
    origin: site.seo.siteUrl.replace(/\/+$/, "") || requestOrigin(),
    siteName: site.seo.siteName,
    defaultTitle: site.seo.defaultTitle,
    defaultDescription: site.seo.defaultDescription,
    defaultOgImage: site.seo.defaultOgImage,
    twitterHandle: site.seo.twitterHandle,
  };
  return { site, paths, services, siteSeo };
}

export type SiteData = {
  site: SiteSettings;
  paths: PagePaths;
  serviceGroupNames: string[];
  siteSeo: SiteSeo;
  preview: boolean;
};

export const getSiteData = createServerFn({ method: "GET" })
  .validator(previewInput)
  .handler(async ({ data }): Promise<SiteData> => {
    const preview = await effectivePreview(data.preview);
    const { site, paths, services, siteSeo } = await loadSite(preview);
    return {
      site,
      paths,
      serviceGroupNames: services.serviceGroups.map((g) => g.group),
      siteSeo,
      preview,
    };
  });

export type PagePayload<K extends keyof typeof pageDefaults> = {
  key: K;
  content: PageContent<K>;
  seo: SeoFields;
  path: string;
  siteSeo: SiteSeo;
  preview: boolean;
};

export const getHomePage = createServerFn({ method: "GET" })
  .validator(previewInput)
  .handler(async ({ data }) => {
    const preview = await effectivePreview(data.preview);
    const version = await getActiveVersion("home", preview);
    const { services, siteSeo, site } = await loadSite(preview);
    return {
      key: "home" as const,
      content: version.content as PageContent<"home">,
      seo: version.seo,
      path: "/",
      siteSeo,
      preview,
      serviceGroups: services.serviceGroups,
      company: site.company,
    };
  });

type SlugPagePayload = {
  [K in SlugPageKey]: PagePayload<K> & { type: "page" };
}[SlugPageKey];

export type SlugPageResult =
  | (SlugPagePayload & { company: SiteSettings["company"] })
  | { type: "redirect"; to: string }
  | { type: "none" };

export const getSlugPage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(200), preview: z.boolean().optional() }))
  .handler(async ({ data }): Promise<SlugPageResult> => {
    const preview = await effectivePreview(data.preview);
    const resolved = await resolvePageSlug(data.slug, preview);
    if (resolved.type !== "page") return resolved;
    const version = await getActiveVersion(resolved.key, preview);
    const { siteSeo, site, paths } = await loadSite(preview);
    return {
      type: "page",
      key: resolved.key,
      content: version.content,
      seo: version.seo,
      path: paths[resolved.key],
      siteSeo,
      preview,
      company: site.company,
    } as SlugPageResult;
  });

export const getBlogIndex = createServerFn({ method: "GET" })
  .validator(previewInput)
  .handler(async ({ data }) => {
    const preview = await effectivePreview(data.preview);
    const version = await getActiveVersion("blog", preview);
    const { siteSeo } = await loadSite(preview);
    const articles: ArticleSummary[] = await listLiveArticles();
    return {
      key: "blog" as const,
      content: version.content as PageContent<"blog">,
      seo: version.seo,
      path: "/blog",
      siteSeo,
      preview,
      articles,
    };
  });

export type ArticlePageResult =
  | {
      type: "article";
      preview: boolean;
      isLive: boolean;
      siteSeo: SiteSeo;
      blog: PageContent<"blog">;
      article: {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        html: string;
        author: string;
        tags: string[];
        featuredImage: ImageValue;
        seo: { title: string; description: string; noindex: boolean };
        publishAt: string | null;
        updatedAt: string;
        readingMinutes: number;
      };
      related: ArticleSummary[];
    }
  | { type: "redirect"; to: string }
  | { type: "none" };

export const getArticlePage = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(200), preview: z.boolean().optional() }))
  .handler(async ({ data }): Promise<ArticlePageResult> => {
    const preview = await effectivePreview(data.preview);
    const found = await findArticleBySlug(data.slug.toLowerCase());
    if (!found) return { type: "none" };
    const { article } = found;
    const live = isArticleLive(article);
    if (!live && !preview) return { type: "none" };
    if (found.redirect) return { type: "redirect", to: `/blog/${article.slug}` };

    const blog = (await getActiveVersion("blog", preview)).content as PageContent<"blog">;
    const { siteSeo } = await loadSite(preview);
    const related = (await listLiveArticles()).filter((a) => a.id !== article.id).slice(0, 3);
    return {
      type: "article",
      preview,
      isLive: live,
      siteSeo,
      blog,
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        html: renderMarkdown(article.body),
        author: article.author,
        tags: article.tags,
        featuredImage: article.featuredImage,
        seo: article.seo,
        publishAt: article.publishAt,
        updatedAt: article.updatedAt,
        readingMinutes: readingTime(article.body),
      },
      related,
    };
  });

/* ---------------------------- Contact form ---------------------------- */

export const getContactConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContactConfig> => ({ turnstileSiteKey: getTurnstileSiteKey() }),
);

const enquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  company: z.string().trim().max(160).default(""),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  phone: z.string().trim().max(40).default(""),
  message: z.string().trim().min(10, "Please tell us a little more (10+ characters).").max(5000),
  /** Honeypot: real visitors never see or fill this field. */
  website: z.string().max(500).default(""),
  /** Milliseconds the visitor spent on the form before submitting. */
  elapsedMs: z.number().int().nonnegative().default(0),
  turnstileToken: z.string().max(4096).default(""),
  pageUrl: z.string().max(500).default(""),
});

export type EnquiryResult = { ok: true } | { ok: false; error: string };

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const parsed = enquirySchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Please check the form and try again.");
    }
    return parsed.data;
  })
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? getRequestHeader("cf-connecting-ip") ?? "";
    const userAgent = getRequestHeader("user-agent") ?? "";

    // Bots that fill the hidden field or submit instantly get a silent "success".
    if (data.website || data.elapsedMs < 2500) return { ok: true };

    if (!(await consumeRateLimit("enquiry", ip || "unknown", 5, 15 * 60 * 1000))) {
      return {
        ok: false,
        error: "You have sent several messages in a short time. Please try again later.",
      };
    }
    if (!(await verifyTurnstile(data.turnstileToken, ip))) {
      return { ok: false, error: "Please complete the verification check and try again." };
    }

    const spam = looksLikeSpam(data.message, data.name);
    const enquiry = await createEnquiry({
      name: data.name,
      company: data.company,
      email: data.email,
      phone: data.phone,
      message: data.message,
      status: spam ? "spam" : "new",
      ip,
      userAgent: userAgent.slice(0, 300),
      pageUrl: data.pageUrl,
    });

    if (!spam) {
      const settings = await getAdminSettings();
      const recipients = parseRecipients(settings.notificationEmail);
      let error: string | null = null;
      if (!getEmailStatus().configured) {
        error = "Email delivery is not configured.";
      } else if (recipients.length === 0) {
        error = "No notification recipient is set.";
      } else {
        try {
          const site = (await getActiveVersion("site", false)).content as SiteSettings;
          const origin = site.seo.siteUrl.replace(/\/+$/, "") || requestOrigin();
          await sendEnquiryNotification(
            enquiry,
            recipients,
            `${origin}/admin/enquiries/${enquiry.id}`,
          );
        } catch (e) {
          error = e instanceof Error ? e.message : String(e);
          console.error("[enquiry] notification failed:", error);
        }
      }
      await updateEnquiry(enquiry.id, { emailNotification: { sent: error === null, error } });
    }
    return { ok: true };
  });
