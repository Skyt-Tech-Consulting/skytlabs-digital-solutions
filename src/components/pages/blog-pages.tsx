import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PageContent } from "@/lib/cms/defaults";
import type { ArticleSummary, ImageValue } from "@/lib/cms/types";
import { CtaBanner, PageHero, Section } from "@/components/site-sections";

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

export function ArticleCard({
  article,
  readMoreLabel,
}: {
  article: ArticleSummary;
  readMoreLabel: string;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
      <Link to="/blog/$slug" params={{ slug: article.slug }} className="block">
        {article.featuredImage.src ? (
          <img
            src={article.featuredImage.src}
            alt={article.featuredImage.alt}
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
        ) : (
          <div className="brand-gradient-bar aspect-[16/9] w-full opacity-80" aria-hidden="true" />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-7">
        <p className="text-xs font-semibold tracking-[0.12em] text-primary uppercase">
          {formatDate(article.publishAt)}
          {article.tags[0] ? ` · ${article.tags[0]}` : ""}
        </p>
        <h2 className="mt-3 text-xl font-semibold">
          <Link to="/blog/$slug" params={{ slug: article.slug }} className="hover:text-primary">
            {article.title}
          </Link>
        </h2>
        {article.excerpt && (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {article.excerpt}
          </p>
        )}
        <Link
          to="/blog/$slug"
          params={{ slug: article.slug }}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          aria-label={`${readMoreLabel}: ${article.title}`}
        >
          {readMoreLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function BlogListPage({
  content,
  articles,
}: {
  content: PageContent<"blog">;
  articles: ArticleSummary[];
}) {
  const { hero, listing, ctaBanner } = content;
  return (
    <>
      <PageHero {...hero} />
      <Section>
        {articles.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border p-12 text-center">
            <h2 className="text-2xl font-semibold">{listing.emptyTitle}</h2>
            <p className="mt-3 text-muted-foreground">{listing.emptyBody}</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                readMoreLabel={listing.readMoreLabel}
              />
            ))}
          </div>
        )}
      </Section>
      <CtaBanner {...ctaBanner} />
    </>
  );
}

export function ArticlePage({
  blog,
  article,
  related,
}: {
  blog: PageContent<"blog">;
  article: {
    title: string;
    excerpt: string;
    html: string;
    author: string;
    tags: string[];
    featuredImage: ImageValue;
    publishAt: string | null;
    readingMinutes: number;
  };
  related: ArticleSummary[];
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-navy px-5 py-16 text-navy-foreground lg:px-8 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-24 size-96 rounded-full bg-cyan/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-3xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {blog.article.backLabel}
          </Link>
          <h1 className="mt-6 text-4xl leading-[1.08] font-bold sm:text-5xl">{article.title}</h1>
          {article.excerpt && (
            <p className="mt-6 text-lg leading-relaxed text-navy-foreground/70">
              {article.excerpt}
            </p>
          )}
          <p className="mt-8 text-sm text-navy-foreground/60">
            {[article.author, formatDate(article.publishAt), `${article.readingMinutes} min read`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </section>

      <Section className="!pt-12">
        <div className="mx-auto max-w-3xl">
          {article.featuredImage.src && (
            <img
              src={article.featuredImage.src}
              alt={article.featuredImage.alt}
              className="mb-12 w-full rounded-2xl border border-border object-cover"
            />
          )}
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: article.html }} />
          {article.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Section>

      {related.length > 0 && (
        <Section tone="muted">
          <h2 className="text-2xl font-bold sm:text-3xl">{blog.article.relatedTitle}</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ArticleCard
                key={item.id}
                article={item}
                readMoreLabel={blog.listing.readMoreLabel}
              />
            ))}
          </div>
        </Section>
      )}

      <CtaBanner {...blog.ctaBanner} />
    </>
  );
}
