import { createFileRoute } from "@tanstack/react-router";
import type { SiteSettings } from "@/lib/cms/defaults";
import { SLUG_PAGES } from "@/lib/cms/pages";
import {
  getActiveVersion,
  getPageDoc,
  getPagePaths,
  listLiveArticles,
} from "@/lib/cms/server/repo.server";

function xmlEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const site = (await getActiveVersion("site", false)).content as SiteSettings;
        const origin = site.seo.siteUrl.replace(/\/+$/, "") || new URL(request.url).origin;
        const paths = await getPagePaths(false);
        const entries: { loc: string; lastmod: string | null }[] = [];

        for (const key of ["home", ...SLUG_PAGES, "blog"] as const) {
          const doc = await getPageDoc(key);
          const version = doc.published ?? doc.draft;
          if (doc.published ? doc.published.seo.noindex : false) continue;
          if (!doc.published && version.seo.noindex) continue;
          entries.push({ loc: origin + paths[key], lastmod: doc.publishedAt });
        }
        for (const article of await listLiveArticles()) {
          if (article.seo.noindex) continue;
          entries.push({ loc: `${origin}/blog/${article.slug}`, lastmod: article.updatedAt });
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) =>
      `  <url><loc>${xmlEscape(e.loc)}</loc>${e.lastmod ? `<lastmod>${e.lastmod.slice(0, 10)}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;
        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
          },
        });
      },
    },
  },
});
