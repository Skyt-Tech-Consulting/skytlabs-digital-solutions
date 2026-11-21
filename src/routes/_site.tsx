import { Outlet, createFileRoute } from "@tanstack/react-router";
import { getSiteData } from "@/lib/cms/api/public";
import { absoluteUrl } from "@/lib/cms/seo";
import { PathsProvider } from "@/components/site-context";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PreviewBanner } from "@/components/site-sections";

type SiteSearch = { preview?: boolean };

/**
 * Public website layout: header + footer from the CMS "site" settings.
 * `?preview=true` shows draft content to signed-in staff.
 */
export const Route = createFileRoute("/_site")({
  validateSearch: (search: Record<string, unknown>): SiteSearch => {
    const raw = search["preview"];
    return raw === true || raw === 1 || raw === "1" || raw === "true" ? { preview: true } : {};
  },
  loaderDeps: ({ search }) => ({ preview: search.preview === true }),
  loader: ({ deps }) => getSiteData({ data: { preview: deps.preview } }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { site, siteSeo } = loaderData;
    const org = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: site.company.name,
      email: site.company.email,
      ...(site.company.phone ? { telephone: site.company.phone } : {}),
      url: absoluteUrl(siteSeo.origin, "/"),
      logo: absoluteUrl(siteSeo.origin, site.header.logo.src),
      address: {
        "@type": "PostalAddress",
        streetAddress: site.company.streetAddress,
        addressLocality: site.company.city,
        addressCountry: site.company.countryCode,
      },
    };
    return {
      meta: [{ name: "author", content: site.company.name }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify(org) }],
    };
  },
  component: SiteLayout,
});

function SiteLayout() {
  const { site, paths, serviceGroupNames, preview } = Route.useLoaderData();
  return (
    <PathsProvider paths={paths}>
      {preview && <PreviewBanner />}
      <div className="flex min-h-screen flex-col">
        <SiteHeader site={site} paths={paths} />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter site={site} paths={paths} serviceGroupNames={serviceGroupNames} />
      </div>
    </PathsProvider>
  );
}
