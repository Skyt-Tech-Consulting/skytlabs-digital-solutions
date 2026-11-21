import { createFileRoute } from "@tanstack/react-router";
import type { SiteSettings } from "@/lib/cms/defaults";
import { getActiveVersion } from "@/lib/cms/server/repo.server";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const site = (await getActiveVersion("site", false)).content as SiteSettings;
        const origin = site.seo.siteUrl.replace(/\/+$/, "") || new URL(request.url).origin;
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
