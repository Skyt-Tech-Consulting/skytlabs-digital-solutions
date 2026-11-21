import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listEnquiriesForAdmin } from "@/lib/cms/api/admin";
import type { Enquiry, EnquiryStatus } from "@/lib/cms/types";
import { AdminPageHeader, StatusBadge, formatDateTime } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/enquiries/")({
  loader: () => listEnquiriesForAdmin(),
  component: EnquiriesList,
});

type Filter = "active" | EnquiryStatus | "all";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "active", label: "Open" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
  { value: "all", label: "All" },
];

function matches(e: Enquiry, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "active") return e.status === "new" || e.status === "in_progress";
  return e.status === filter;
}

function exportCsv(rows: Enquiry[]) {
  const header = ["Received", "Name", "Company", "Email", "Phone", "Status", "Message", "Notes"];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    header.join(","),
    ...rows.map((e) =>
      [e.createdAt, e.name, e.company, e.email, e.phone, e.status, e.message, e.notes]
        .map((v) => escape(v ?? ""))
        .join(","),
    ),
  ];
  const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skytlabs-enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function EnquiriesList() {
  const enquiries = Route.useLoaderData();
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter(
      (e) =>
        matches(e, filter) &&
        (!q || [e.name, e.company, e.email, e.message].some((v) => v.toLowerCase().includes(q))),
    );
  }, [enquiries, filter, query]);

  return (
    <>
      <AdminPageHeader
        title="Enquiries"
        description="Messages submitted through the website contact form."
        actions={
          <Button
            variant="outline"
            onClick={() => exportCsv(visible)}
            disabled={visible.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "default" : "ghost"}
              onClick={() => setFilter(f.value)}
            >
              {f.label} ({enquiries.filter((e) => matches(e, f.value)).length})
            </Button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, message"
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {visible.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted-foreground">No enquiries here.</p>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((e) => (
              <li key={e.id}>
                <Link
                  to="/admin/enquiries/$id"
                  params={{ id: e.id }}
                  className="flex items-start gap-3 p-4 hover:bg-surface"
                >
                  <span
                    className={`mt-2 size-2 shrink-0 rounded-full ${e.read ? "bg-transparent" : "bg-primary"}`}
                    aria-label={e.read ? undefined : "Unread"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm ${e.read ? "" : "font-semibold"}`}>
                      {e.name}
                      {e.company && (
                        <span className="font-normal text-muted-foreground"> · {e.company}</span>
                      )}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{e.message}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={e.status} />
                    <span className="text-xs whitespace-nowrap text-muted-foreground">
                      {formatDateTime(e.createdAt)}
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
