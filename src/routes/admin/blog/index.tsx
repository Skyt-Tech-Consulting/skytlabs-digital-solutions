import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listArticlesForAdmin } from "@/lib/cms/api/admin";
import { AdminPageHeader, StatusBadge, formatDateTime } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/blog/")({
  loader: () => listArticlesForAdmin(),
  component: BlogList,
});

const FILTERS = ["all", "published", "scheduled", "draft"] as const;

function BlogList() {
  const articles = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter(
      (a) =>
        (filter === "all" || a.displayStatus === filter) &&
        (!q || a.title.toLowerCase().includes(q) || a.slug.includes(q)),
    );
  }, [articles, filter, query]);

  return (
    <>
      <AdminPageHeader
        title="Blog"
        description="Write, schedule and publish articles for the Insights section of the website."
        actions={
          <Button asChild>
            <Link to="/admin/blog/$id" params={{ id: "new" }}>
              <Plus className="size-4" />
              New article
            </Link>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "ghost"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f} (
              {f === "all" ? articles.length : articles.filter((a) => a.displayStatus === f).length}
              )
            </Button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {visible.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            {articles.length === 0
              ? "No articles yet. Create the first one."
              : "No articles match."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((a) => (
              <li key={a.id}>
                <Link
                  to="/admin/blog/$id"
                  params={{ id: a.id }}
                  className="flex items-center gap-4 p-4 hover:bg-surface"
                >
                  {a.featuredImage.src ? (
                    <img
                      src={a.featuredImage.src}
                      alt=""
                      className="hidden size-14 shrink-0 rounded-md object-cover sm:block"
                    />
                  ) : (
                    <div className="brand-gradient-bar hidden size-14 shrink-0 rounded-md opacity-60 sm:block" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground">/blog/{a.slug}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                    <StatusBadge status={a.displayStatus} />
                    <span className="text-xs text-muted-foreground">
                      {a.displayStatus === "draft"
                        ? `Edited ${formatDateTime(a.updatedAt)}`
                        : formatDateTime(a.publishAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
