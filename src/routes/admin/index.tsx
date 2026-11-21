import { Link, createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, FileText, Inbox, Newspaper } from "lucide-react";
import { getDashboard } from "@/lib/cms/api/admin";
import { AdminPageHeader, Panel, StatusBadge, formatDateTime } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/")({
  loader: () => getDashboard(),
  component: Dashboard,
});

function Stat({
  label,
  value,
  to,
  icon: Icon,
}: {
  label: string;
  value: number;
  to: string;
  icon: typeof Inbox;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <span className="inline-flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

function Dashboard() {
  const data = Route.useLoaderData();
  const { user } = Route.useRouteContext();

  return (
    <>
      <AdminPageHeader
        title={`Welcome, ${user?.name ?? ""}`}
        description="Manage website content, articles and enquiries."
      />

      {!data.email.configured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Email notifications are not configured</p>
            <p className="mt-1">
              Enquiries are still saved here, but no email is sent. A developer needs to set the
              SMTP settings (<code>SMTP_HOST</code>, <code>SMTP_USER</code>,{" "}
              <code>SMTP_PASSWORD</code>) in the hosting environment.{" "}
              <Link to="/admin/settings" className="underline">
                Settings
              </Link>
            </p>
          </div>
        </div>
      )}
      {data.enquiries.failedNotifications > 0 && data.email.configured && (
        <div className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p>
            {data.enquiries.failedNotifications} enquiry notification(s) failed to send. Open the
            enquiry for details.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Unread enquiries"
          value={data.enquiries.unread}
          to="/admin/enquiries"
          icon={Inbox}
        />
        <Stat
          label="Open enquiries"
          value={data.enquiries.open}
          to="/admin/enquiries"
          icon={Inbox}
        />
        <Stat
          label="Published articles"
          value={data.articles.published}
          to="/admin/blog"
          icon={Newspaper}
        />
        <Stat
          label="Drafts & scheduled"
          value={data.articles.drafts + data.articles.scheduled}
          to="/admin/blog"
          icon={FileText}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Latest enquiries"
          actions={
            <Link
              to="/admin/enquiries"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              View all <ArrowRight className="size-4" />
            </Link>
          }
        >
          {data.enquiries.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.enquiries.recent.map((e) => (
                <li key={e.id}>
                  <Link
                    to="/admin/enquiries/$id"
                    params={{ id: e.id }}
                    className="flex items-center justify-between gap-4 py-3 hover:text-primary"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        {!e.read && (
                          <span className="size-2 rounded-full bg-primary" aria-label="Unread" />
                        )}
                        {e.name}
                        {e.company && <span className="text-muted-foreground">· {e.company}</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{e.message}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(e.createdAt)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Pages with unpublished changes"
          actions={
            <Link
              to="/admin/pages"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              All pages <ArrowRight className="size-4" />
            </Link>
          }
        >
          {data.pagesWithChanges.length === 0 ? (
            <p className="text-sm text-muted-foreground">Everything is published.</p>
          ) : (
            <ul className="space-y-2">
              {data.pagesWithChanges.map((p) => (
                <li key={p.key}>
                  <Link
                    to="/admin/pages/$key"
                    params={{ key: p.key }}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm hover:border-primary"
                  >
                    {p.label}
                    <StatusBadge status="changes" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
