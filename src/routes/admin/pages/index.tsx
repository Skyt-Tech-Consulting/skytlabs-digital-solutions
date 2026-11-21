import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { listPagesForAdmin } from "@/lib/cms/api/admin";
import { AdminPageHeader, StatusBadge, formatDateTime } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/pages/")({
  loader: () => listPagesForAdmin(),
  component: PagesList,
});

function PagesList() {
  const pages = Route.useLoaderData();
  return (
    <>
      <AdminPageHeader
        title="Pages & SEO"
        description="Edit the wording, images, calls to action and SEO of every page on the website. Changes go live when you publish."
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {pages.map((page) => (
            <li key={page.key}>
              <Link
                to="/admin/pages/$key"
                params={{ key: page.key }}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-surface sm:p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{page.label}</p>
                    {page.path && (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                        {page.path}
                      </code>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{page.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {page.publishedAt
                      ? `Last published ${formatDateTime(page.publishedAt)}`
                      : "Showing original launch content"}
                  </p>
                </div>
                {page.hasChanges ? (
                  <StatusBadge status="changes" />
                ) : (
                  <StatusBadge status="live" className="hidden sm:inline-flex" />
                )}
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
