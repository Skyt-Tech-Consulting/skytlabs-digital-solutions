import { createFileRoute } from "@tanstack/react-router";
import { getHomePage } from "@/lib/cms/api/public";
import { buildHead } from "@/lib/cms/seo";
import { HomePage } from "@/components/pages/home-page";

export const Route = createFileRoute("/_site/")({
  loaderDeps: ({ search }) => ({ preview: search.preview === true }),
  loader: ({ deps }) => getHomePage({ data: { preview: deps.preview } }),
  head: ({ loaderData }) =>
    loaderData
      ? buildHead({
          seo: loaderData.seo,
          path: "/",
          site: loaderData.siteSeo,
          image: loaderData.content.hero.backgroundImage,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: loaderData.siteSeo.siteName,
              url: loaderData.siteSeo.origin || "/",
            },
          ],
        })
      : {},
  component: HomeRoute,
});

function HomeRoute() {
  const { content, serviceGroups } = Route.useLoaderData();
  return <HomePage content={content} serviceGroups={serviceGroups} />;
}
