import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getSlugPage } from "@/lib/cms/api/public";
import { buildHead } from "@/lib/cms/seo";
import { AboutPage } from "@/components/pages/about-page";
import { ContactPage } from "@/components/pages/contact-page";
import { ProductsPage } from "@/components/pages/products-page";
import { ProjectsPage } from "@/components/pages/projects-page";
import { ServicesPage } from "@/components/pages/services-page";

/**
 * Serves the CMS pages whose URL slug can be changed in the admin
 * (About, Services, Products, Projects, Contact). Old slugs 301-redirect.
 */
export const Route = createFileRoute("/_site/$slug")({
  loaderDeps: ({ search }) => ({ preview: search.preview === true }),
  loader: async ({ params, deps }) => {
    const result = await getSlugPage({ data: { slug: params.slug, preview: deps.preview } });
    if (result.type === "redirect") {
      throw redirect({
        href: deps.preview ? `${result.to}?preview=true` : result.to,
        statusCode: 301,
      });
    }
    if (result.type === "none") throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const jsonLd: unknown[] = [];
    if (loaderData.key === "services") {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${loaderData.siteSeo.siteName} services`,
        itemListElement: loaderData.content.serviceGroups
          .flatMap((g) => g.services)
          .map((service, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: service.title,
          })),
      });
    }
    return buildHead({
      seo: loaderData.seo,
      path: loaderData.path,
      site: loaderData.siteSeo,
      ogType: loaderData.key === "products" ? "product" : "website",
      jsonLd,
    });
  },
  component: SlugPage,
});

function SlugPage() {
  const data = Route.useLoaderData();
  switch (data.key) {
    case "about":
      return <AboutPage content={data.content} />;
    case "services":
      return <ServicesPage content={data.content} />;
    case "products":
      return <ProductsPage content={data.content} />;
    case "projects":
      return <ProjectsPage content={data.content} />;
    case "contact":
      return <ContactPage content={data.content} company={data.company} />;
  }
}
