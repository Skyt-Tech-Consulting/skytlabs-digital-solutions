import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <div className="mt-1.5 text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-100 text-emerald-800 border-emerald-200",
  live: "bg-emerald-100 text-emerald-800 border-emerald-200",
  scheduled: "bg-sky-100 text-sky-800 border-sky-200",
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  changes: "bg-amber-100 text-amber-800 border-amber-200",
  new: "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-slate-100 text-slate-700 border-slate-200",
  spam: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  in_progress: "In progress",
  changes: "Unpublished changes",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const label = STATUS_LABELS[status] ?? status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[status], className)}>
      {label}
    </Badge>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section
      className={cn("min-w-0 rounded-xl border border-border bg-card p-5 sm:p-6", className)}
    >
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function CharCount({ value, ideal }: { value: string; ideal: number }) {
  const over = value.length > ideal;
  return (
    <span className={cn("text-xs tabular-nums", over ? "text-amber-600" : "text-muted-foreground")}>
      {value.length}/{ideal}
    </span>
  );
}
