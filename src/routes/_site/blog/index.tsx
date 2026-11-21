import { createFileRoute } from "@tanstack/react-router";
import { getBlogIndex } from "@/lib/cms/api/public";
import { absoluteUrl, buildHead } from "@/lib/cms/seo";
import { BlogListPage } from "@/components/pages/blog-pages";

export const Route = createFileRoute("/_site/blog/")({
  loaderDeps: ({ search }) => ({ preview: search.preview === true }),
  loader: ({ deps }) => getBlogIndex({ data: { preview: deps.preview } }),
  head: ({ loaderData }) =>
    loaderData
      ? buildHead({
          seo: loaderData.seo,
          path: "/blog",
          site: loaderData.siteSeo,
          jsonLd: [
            {
              "@context": "https://schema.org",
              "@type": "Blog",
              name: loaderData.content.hero.title,
              url: absoluteUrl(loaderData.siteSeo.origin, "/blog"),
              blogPost: loaderData.articles.slice(0, 20).map((a) => ({
                "@type": "BlogPosting",
                headline: a.title,
                url: absoluteUrl(loaderData.siteSeo.origin, `/blog/${a.slug}`),
                datePublished: a.publishAt,
              })),
            },
          ],
        })
      : {},
  component: BlogIndexRoute,
});

function BlogIndexRoute() {
  const { content, articles } = Route.useLoaderData();
  return <BlogListPage content={content} articles={articles} />;
}
