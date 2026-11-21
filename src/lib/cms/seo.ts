import type { ImageValue, SeoFields } from "./types";

export type SiteSeo = {
  /** Absolute origin, e.g. https://skytlabs.com (no trailing slash). */
  origin: string;
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: ImageValue;
  twitterHandle: string;
};

type MetaTag = Record<string, string>;
type HeadResult = {
  meta: MetaTag[];
  links: { rel: string; href: string }[];
  scripts: { type: string; children: string }[];
};

export function absoluteUrl(origin: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  if (!origin) return path;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildHead(args: {
  seo: Pick<SeoFields, "title" | "description" | "noindex"> &
    Partial<Pick<SeoFields, "canonical" | "structuredData" | "ogImage">>;
  path: string;
  site: SiteSeo;
  ogType?: string;
  image?: ImageValue | null;
  jsonLd?: unknown[];
  extraMeta?: MetaTag[];
}): HeadResult {
  const { seo, path, site } = args;
  const title = seo.title || site.defaultTitle;
  const description = seo.description || site.defaultDescription;
  const url = seo.canonical?.trim() || absoluteUrl(site.origin, path);
  const image =
    (seo.ogImage?.src ? seo.ogImage : null) ??
    (args.image?.src ? args.image : null) ??
    (site.defaultOgImage.src ? site.defaultOgImage : null);

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: args.ogType ?? "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: site.siteName },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
  if (image) {
    const imageUrl = absoluteUrl(site.origin, image.src);
    meta.push(
      { property: "og:image", content: imageUrl },
      { name: "twitter:image", content: imageUrl },
    );
    if (image.alt) meta.push({ property: "og:image:alt", content: image.alt });
  }
  if (site.twitterHandle) meta.push({ name: "twitter:site", content: site.twitterHandle });
  meta.push({
    name: "robots",
    content: seo.noindex ? "noindex, nofollow" : "index, follow",
  });
  if (args.extraMeta) meta.push(...args.extraMeta);

  const scripts: HeadResult["scripts"] = [];
  for (const data of args.jsonLd ?? []) {
    scripts.push({ type: "application/ld+json", children: JSON.stringify(data) });
  }
  if (seo.structuredData?.trim()) {
    try {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify(JSON.parse(seo.structuredData)),
      });
    } catch {
      // Invalid JSON is rejected on save; ignore defensively here.
    }
  }

  return { meta, links: [{ rel: "canonical", href: url }], scripts };
}
