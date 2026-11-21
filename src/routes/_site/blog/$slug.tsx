import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getArticlePage } from "@/lib/cms/api/public";
import { absoluteUrl, buildHead } from "@/lib/cms/seo";
import { ArticlePage } from "@/components/pages/blog-pages";

export const Route = createFileRoute("/_site/blog/$slug")({
  loaderDeps: ({ search }) => ({ preview: search.preview === true }),
  loader: async ({ params, deps }) => {
    const result = await getArticlePage({ data: { slug: params.slug, preview: deps.preview } });
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
    const { article, siteSeo } = loaderData;
    const path = `/blog/${article.slug}`;
    return buildHead({
      seo: {
        title: article.seo.title || `${article.title} — ${siteSeo.siteName}`,
        description: article.seo.description || article.excerpt,
        // Unpublished drafts seen in preview must never be indexed.
        noindex: article.seo.noindex || !loaderData.isLive,
      },
      path,
      site: siteSeo,
      ogType: "article",
      image: article.featuredImage,
      extraMeta: article.publishAt
        ? [{ property: "article:published_time", content: article.publishAt }]
        : [],
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.seo.description || article.excerpt,
          datePublished: article.publishAt,
          dateModified: article.updatedAt,
          mainEntityOfPage: absoluteUrl(siteSeo.origin, path),
          ...(article.featuredImage.src
            ? { image: absoluteUrl(siteSeo.origin, article.featuredImage.src) }
            : {}),
          ...(article.author ? { author: { "@type": "Person", name: article.author } } : {}),
          publisher: { "@type": "Organization", name: siteSeo.siteName },
          keywords: article.tags.join(", "),
        },
      ],
    });
  },
  component: ArticleRoute,
});

function ArticleRoute() {
  const { blog, article, related, preview, isLive } = Route.useLoaderData();
  return (
    <>
      {preview && !isLive && (
        <p className="bg-gold/20 px-5 py-2 text-center text-xs font-medium">
          This article is not live yet — only signed-in staff can see this preview.
        </p>
      )}
      <ArticlePage blog={blog} article={article} related={related} />
    </>
  );
}
