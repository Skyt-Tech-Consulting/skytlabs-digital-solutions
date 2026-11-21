import type { PageKey } from "./defaults";

export type PageMeta = {
  key: PageKey;
  label: string;
  description: string;
  /** Pages whose URL cannot be changed from the admin. */
  fixedPath: string | null;
  /** The settings document is not a routable page. */
  routable: boolean;
};

export const PAGES: PageMeta[] = [
  {
    key: "home",
    label: "Home",
    description: "Hero, highlights, why SkytLabs, product spotlight and closing CTA.",
    fixedPath: "/",
    routable: true,
  },
  {
    key: "about",
    label: "About",
    description: "Company introduction, who we are and how we work.",
    fixedPath: null,
    routable: true,
  },
  {
    key: "services",
    label: "Services",
    description: "Service groups and the description of every service.",
    fixedPath: null,
    routable: true,
  },
  {
    key: "products",
    label: "Products",
    description: "AI Call Center product page.",
    fixedPath: null,
    routable: true,
  },
  {
    key: "projects",
    label: "Projects",
    description: "Digital Transformation Schedule case study.",
    fixedPath: null,
    routable: true,
  },
  {
    key: "contact",
    label: "Contact",
    description: "Contact details, map and contact-form wording.",
    fixedPath: null,
    routable: true,
  },
  {
    key: "blog",
    label: "Blog listing",
    description: "Headline and wording of the blog listing and article pages.",
    fixedPath: "/blog",
    routable: true,
  },
  {
    key: "site",
    label: "Header, footer & site settings",
    description: "Logos, navigation labels, company details, footer and default SEO.",
    fixedPath: null,
    routable: false,
  },
];

export const PAGE_KEYS = PAGES.map((p) => p.key);

export function isPageKey(value: string): value is PageKey {
  return (PAGE_KEYS as string[]).includes(value);
}

export function getPageMeta(key: PageKey): PageMeta {
  return PAGES.find((p) => p.key === key)!;
}

/** Pages served through the dynamic `/$slug` route. */
export const SLUG_PAGES = ["about", "services", "products", "projects", "contact"] as const;
export type SlugPageKey = (typeof SLUG_PAGES)[number];

export function isSlugPageKey(value: string): value is SlugPageKey {
  return (SLUG_PAGES as readonly string[]).includes(value);
}

/** First path segments that can never be used as a page slug. */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "blog",
  "media",
  "assets",
  "sitemap.xml",
  "robots.txt",
  "favicon.png",
  "_serverFn",
  "__l5e",
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80;
}

/** Map of page key -> public path, built from the published slugs. */
export type PagePaths = Record<"home" | "blog" | SlugPageKey, string>;

export const DEFAULT_PAGE_PATHS: PagePaths = {
  home: "/",
  about: "/about",
  services: "/services",
  products: "/products",
  projects: "/projects",
  contact: "/contact",
  blog: "/blog",
};

/**
 * Rewrites links that point at a default page path (e.g. "/contact") to that
 * page's current path, so internal CTAs keep working after a slug change.
 */
export function resolveHref(href: string, paths: PagePaths): string {
  if (!href.startsWith("/")) return href;
  const [pathPart = "", rest = ""] = splitOnce(href, /[?#]/);
  for (const key of Object.keys(DEFAULT_PAGE_PATHS) as (keyof PagePaths)[]) {
    if (DEFAULT_PAGE_PATHS[key] === pathPart) return paths[key] + rest;
  }
  return href;
}

function splitOnce(value: string, separator: RegExp): [string, string] {
  const match = separator.exec(value);
  if (!match) return [value, ""];
  return [value.slice(0, match.index), value.slice(match.index)];
}
