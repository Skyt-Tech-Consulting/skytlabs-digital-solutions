import { useState } from "react";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail, Trash2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteEnquiryFn, getEnquiryForAdmin, updateEnquiryFn } from "@/lib/cms/api/admin";
import type { EnquiryStatus } from "@/lib/cms/types";
import {
  AdminPageHeader,
  Panel,
  StatusBadge,
  errorMessage,
  formatDateTime,
} from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/enquiries/$id")({
  loader: async ({ params }) => {
    const enquiry = await getEnquiryForAdmin({ data: { id: params.id } });
    if (!enquiry) throw notFound();
    return enquiry;
  },
  component: EnquiryDetail,
});

const STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
  { value: "spam", label: "Spam" },
];

function EnquiryDetail() {
  const initial = Route.useLoaderData();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState(initial);
  const [notes, setNotes] = useState(initial.notes);
  const [busy, setBusy] = useState<string | null>(null);

  async function update(
    patch: { status?: EnquiryStatus; notes?: string; read?: boolean },
    label: string,
  ) {
    setBusy(label);
    try {
      const next = await updateEnquiryFn({ data: { id: enquiry.id, ...patch } });
      setEnquiry(next);
      toast.success("Enquiry updated");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      await deleteEnquiryFn({ data: { id: enquiry.id } });
      toast.success("Enquiry deleted");
      await navigate({ to: "/admin/enquiries" });
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(null);
    }
  }

  const replySubject = encodeURIComponent(`Re: Your enquiry to SkytLabs`);
  const replyBody = encodeURIComponent(
    `Dear ${enquiry.name},\n\nThank you for contacting SkytLabs.\n\n\n\n---\nYour message:\n${enquiry.message}`,
  );

  return (
    <>
      <Link
        to="/admin/enquiries"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All enquiries
      </Link>
      <AdminPageHeader
        title={enquiry.name}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={enquiry.status} />
            Received {formatDateTime(enquiry.createdAt)}
          </span>
        }
        actions={
          <Button asChild>
            <a href={`mailto:${enquiry.email}?subject=${replySubject}&body=${replyBody}`}>
              <Mail className="size-4" />
              Reply by email
            </a>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel title="Message">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{enquiry.message}</p>
          </Panel>

          <Panel title="Internal notes" description="Only visible to staff in the admin.">
            <Textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button
              className="mt-3"
              variant="outline"
              disabled={busy !== null || notes === enquiry.notes}
              onClick={() => void update({ notes }, "notes")}
            >
              {busy === "notes" && <Loader2 className="size-4 animate-spin" />}
              Save notes
            </Button>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Contact details">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>
                  <a
                    href={`mailto:${enquiry.email}`}
                    className="text-primary break-all hover:underline"
                  >
                    {enquiry.email}
                  </a>
                </dd>
              </div>
              {enquiry.phone && (
                <div>
                  <dt className="text-xs text-muted-foreground">Phone</dt>
                  <dd>
                    <a href={`tel:${enquiry.phone}`} className="text-primary hover:underline">
                      {enquiry.phone}
                    </a>
                  </dd>
                </div>
              )}
              {enquiry.company && (
                <div>
                  <dt className="text-xs text-muted-foreground">Company</dt>
                  <dd>{enquiry.company}</dd>
                </div>
              )}
            </dl>
          </Panel>

          <Panel title="Status">
            <div className="space-y-3">
              <Label className="sr-only">Status</Label>
              <Select
                value={enquiry.status}
                onValueChange={(v) => void update({ status: v as EnquiryStatus }, "status")}
                disabled={busy !== null}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                disabled={busy !== null}
                onClick={() => void update({ read: false }, "unread")}
              >
                Mark as unread
              </Button>
            </div>
          </Panel>

          <Panel title="Email notification">
            {enquiry.status === "spam" && !enquiry.emailNotification.sent ? (
              <p className="text-sm text-muted-foreground">
                Not sent — this message was flagged as spam.
              </p>
            ) : enquiry.emailNotification.sent ? (
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="size-4" /> Notification sent
              </p>
            ) : (
              <p className="flex items-start gap-2 text-sm text-amber-700">
                <XCircle className="mt-0.5 size-4 shrink-0" />
                {enquiry.emailNotification.error ?? "Not sent"}
              </p>
            )}
          </Panel>

          <Panel title="Technical details">
            <dl className="space-y-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">Page</dt>
                <dd className="break-all">{enquiry.pageUrl || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">IP address</dt>
                <dd>{enquiry.ip || "—"}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">Browser</dt>
                <dd className="break-all">{enquiry.userAgent || "—"}</dd>
              </div>
            </dl>
          </Panel>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive"
                disabled={busy !== null}
              >
                <Trash2 className="size-4" />
                Delete enquiry
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the message from {enquiry.name}. Consider marking it
                  closed instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDelete()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
