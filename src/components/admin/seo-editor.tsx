import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SeoFields } from "@/lib/cms/types";
import { CharCount, Panel } from "./admin-ui";
import { ImageField } from "./image-field";

export function SearchSnippet({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">Search result preview</p>
      <p className="mt-2 truncate text-xs text-emerald-700">{url}</p>
      <p className="mt-1 line-clamp-1 text-lg text-blue-700">{title || "Untitled page"}</p>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
        {description || "Add a meta description to control the text shown in search results."}
      </p>
    </div>
  );
}

export function SeoEditor({
  value,
  onChange,
  fixedPath,
  origin,
}: {
  value: SeoFields;
  onChange: (value: SeoFields) => void;
  /** When set, the slug field is read-only and shows this path. */
  fixedPath: string | null;
  origin: string;
}) {
  const set = <K extends keyof SeoFields>(key: K, v: SeoFields[K]) =>
    onChange({ ...value, [key]: v });
  const path = fixedPath ?? `/${value.slug}`;

  return (
    <div className="space-y-6">
      <Panel title="Search appearance">
        <div className="space-y-5">
          <SearchSnippet title={value.title} description={value.description} url={origin + path} />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-title">SEO page title</Label>
              <CharCount value={value.title} ideal={60} />
            </div>
            <Input
              id="seo-title"
              value={value.title}
              onChange={(e) => set("title", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shown in the browser tab and as the headline in search results. Aim for 50–60
              characters.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="seo-description">Meta description</Label>
              <CharCount value={value.description} ideal={160} />
            </div>
            <Textarea
              id="seo-description"
              rows={3}
              value={value.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              The summary shown under the title in search results. Aim for 120–160 characters.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-slug">URL slug</Label>
            {fixedPath !== null ? (
              <>
                <Input id="seo-slug" value={fixedPath} disabled />
                <p className="text-xs text-muted-foreground">This page's address is fixed.</p>
              </>
            ) : (
              <>
                <div className="flex items-center rounded-md border border-input focus-within:ring-1 focus-within:ring-ring">
                  <span className="pl-3 text-sm text-muted-foreground">/</span>
                  <input
                    id="seo-slug"
                    value={value.slug}
                    onChange={(e) =>
                      set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))
                    }
                    className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Lowercase letters, numbers and hyphens. When you publish a new slug, the old
                  address automatically redirects (301) to the new one and site links update.
                </p>
              </>
            )}
          </div>
        </div>
      </Panel>

      <Panel title="Social sharing">
        <ImageField
          label="Sharing image (Open Graph)"
          value={value.ogImage}
          onChange={(v) => set("ogImage", v)}
          help="Shown when the page is shared on LinkedIn, WhatsApp, X, etc. Recommended 1200×630. Leave empty to use the page's main image or the site default."
        />
      </Panel>

      <Panel title="Indexing & structured data">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
            <div>
              <Label>Hide from search engines</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Adds <code>noindex, nofollow</code> and removes the page from the sitemap.
              </p>
            </div>
            <Switch checked={value.noindex} onCheckedChange={(v) => set("noindex", v)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-canonical">Canonical URL override (optional)</Label>
            <Input
              id="seo-canonical"
              value={value.canonical}
              placeholder={origin + path}
              onChange={(e) => set("canonical", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use this page's own address.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seo-jsonld">Additional structured data (JSON-LD, optional)</Label>
            <Textarea
              id="seo-jsonld"
              rows={6}
              className="font-mono text-xs"
              value={value.structuredData}
              placeholder={
                '{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  ...\n}'
              }
              onChange={(e) => set("structuredData", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Organization, WebSite, service list and article schema are generated automatically.
              Add extra schema.org JSON here if marketing has prepared it.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
