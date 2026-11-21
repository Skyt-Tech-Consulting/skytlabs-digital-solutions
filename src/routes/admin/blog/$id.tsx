import { useState } from "react";
import { Link, createFileRoute, notFound, useBlocker, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Eye, EyeOff, Loader2, Rocket, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { deleteArticleFn, getArticleForEdit, saveArticleFn } from "@/lib/cms/api/admin";
import { slugify } from "@/lib/cms/pages";
import type { Article, ArticleDisplayStatus } from "@/lib/cms/types";
import {
  AdminPageHeader,
  CharCount,
  Panel,
  StatusBadge,
  errorMessage,
  formatDateTime,
} from "@/components/admin/admin-ui";
import { ImageField } from "@/components/admin/image-field";
import { MarkdownEditor } from "@/components/admin/markdown-editor";
import { SearchSnippet } from "@/components/admin/seo-editor";

export const Route = createFileRoute("/admin/blog/$id")({
  loader: async ({ params }) => {
    if (params.id === "new") return null;
    const article = await getArticleForEdit({ data: { id: params.id } });
    if (!article) throw notFound();
    return article;
  },
  component: ArticleEditorRoute,
});

type Draft = Omit<Article, "id" | "createdAt" | "updatedAt" | "updatedBy" | "previousSlugs"> & {
  id: string | null;
};

const EMPTY: Draft = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  author: "SkytLabs Team",
  tags: [],
  featuredImage: { src: "", alt: "" },
  seo: { title: "", description: "", noindex: false },
  status: "draft",
  publishAt: null,
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function displayStatus(d: Draft): ArticleDisplayStatus {
  if (d.status !== "published") return "draft";
  return d.publishAt && new Date(d.publishAt).getTime() > Date.now() ? "scheduled" : "published";
}

function ArticleEditorRoute() {
  const article = Route.useLoaderData();
  return <ArticleEditor key={article?.id ?? "new"} article={article} />;
}

function ArticleEditor({ article }: { article: Article | null }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft>(article ?? EMPTY);
  const [saved, setSaved] = useState<Article | null>(article);
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [tagsText, setTagsText] = useState((article?.tags ?? []).join(", "));
  const [scheduleAt, setScheduleAt] = useState(toLocalInput(article?.publishAt ?? null));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const allowLeave = useState({ value: false })[0];
  useBlocker({
    shouldBlockFn: () =>
      dirty &&
      !allowLeave.value &&
      !window.confirm("You have unsaved changes. Leave without saving?"),
    enableBeforeUnload: () => dirty,
  });

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    setDirty(true);
  }

  const status = saved ? displayStatus(saved) : "draft";
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  async function persist(overrides: Partial<Draft>, label: string): Promise<Article | null> {
    setBusy(label);
    try {
      const input: Draft = {
        ...draft,
        ...overrides,
        tags: tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const { article: result } = await saveArticleFn({ data: input });
      setSaved(result);
      setDraft({ ...result });
      setScheduleAt(toLocalInput(result.publishAt));
      setDirty(false);
      if (!draft.id) {
        allowLeave.value = true;
        await navigate({ to: "/admin/blog/$id", params: { id: result.id }, replace: true });
      }
      return result;
    } catch (e) {
      toast.error(errorMessage(e));
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function handleSaveDraft() {
    // Keeps the current publication state; only content changes.
    if (await persist({}, "save")) toast.success("Saved");
  }

  async function handlePublishNow() {
    const now = new Date().toISOString();
    const publishAt =
      draft.publishAt && new Date(draft.publishAt).getTime() <= Date.now() ? draft.publishAt : now;
    if (await persist({ status: "published", publishAt }, "publish")) {
      toast.success("Article published — it is now live.");
    }
  }

  async function handleSchedule() {
    if (!scheduleAt) {
      toast.error("Choose a date and time to schedule.");
      return;
    }
    const when = new Date(scheduleAt);
    if (when.getTime() <= Date.now()) {
      toast.error("Scheduled time must be in the future. Use Publish now instead.");
      return;
    }
    if (await persist({ status: "published", publishAt: when.toISOString() }, "schedule")) {
      toast.success(`Scheduled for ${formatDateTime(when.toISOString())}`);
    }
  }

  async function handleUnpublish() {
    if (await persist({ status: "draft" }, "unpublish")) toast.success("Moved back to draft.");
  }

  async function handlePreview() {
    const tab = window.open("about:blank", "_blank");
    const result = dirty || !saved ? await persist({}, "preview") : saved;
    if (!result) {
      tab?.close();
      return;
    }
    if (tab) tab.location.href = `/blog/${result.slug}?preview=true`;
  }

  async function handleDelete() {
    if (!saved) return;
    setBusy("delete");
    try {
      await deleteArticleFn({ data: { id: saved.id } });
      toast.success("Article deleted");
      allowLeave.value = true;
      await navigate({ to: "/admin/blog" });
    } catch (e) {
      toast.error(errorMessage(e));
      setBusy(null);
    }
  }

  const spin = (name: string, Icon: typeof Save) =>
    busy === name ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />;

  return (
    <>
      <Link
        to="/admin/blog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All articles
      </Link>
      <AdminPageHeader
        title={draft.id ? draft.title || "Untitled article" : "New article"}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />
            {saved && status === "scheduled" && (
              <span>Goes live {formatDateTime(saved.publishAt)}</span>
            )}
            {saved && status === "published" && (
              <a
                href={`/blog/${saved.slug}`}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                /blog/{saved.slug}
              </a>
            )}
            {saved && <span>Last saved {formatDateTime(saved.updatedAt)}</span>}
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={draft.title}
                  onChange={(e) => set("title", e.target.value)}
                  className="text-lg font-semibold"
                  placeholder="Article title"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="slug">Article URL</Label>
                <div className="flex items-center rounded-md border border-input focus-within:ring-1 focus-within:ring-ring">
                  <span className="pl-3 text-sm text-muted-foreground">/blog/</span>
                  <input
                    id="slug"
                    value={draft.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                    }}
                    className="h-9 flex-1 bg-transparent px-1 text-sm outline-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated from the title. If you change it after publishing, the old URL redirects
                  to the new one.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => set("excerpt", e.target.value)}
                  placeholder="One or two sentences shown on the blog listing and under the title."
                />
              </div>
            </div>
          </Panel>

          <Panel title="Article body">
            <MarkdownEditor value={draft.body} onChange={(v) => set("body", v)} />
          </Panel>

          <Panel title="SEO">
            <div className="space-y-5">
              <SearchSnippet
                title={draft.seo.title || draft.title}
                description={draft.seo.description || draft.excerpt}
                url={`${origin}/blog/${draft.slug}`}
              />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-title">SEO title</Label>
                  <CharCount value={draft.seo.title} ideal={60} />
                </div>
                <Input
                  id="seo-title"
                  value={draft.seo.title}
                  placeholder={draft.title ? `${draft.title} — SkytLabs Limited` : ""}
                  onChange={(e) => set("seo", { ...draft.seo, title: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the article title.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seo-desc">Meta description</Label>
                  <CharCount value={draft.seo.description} ideal={160} />
                </div>
                <Textarea
                  id="seo-desc"
                  rows={3}
                  value={draft.seo.description}
                  placeholder={draft.excerpt}
                  onChange={(e) => set("seo", { ...draft.seo, description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Leave empty to use the excerpt.</p>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
                <Label>Hide from search engines (noindex)</Label>
                <Switch
                  checked={draft.seo.noindex}
                  onCheckedChange={(v) => set("seo", { ...draft.seo, noindex: v })}
                />
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                disabled={busy !== null}
                onClick={() => void handleSaveDraft()}
              >
                {spin("save", Save)}
                {status === "draft" ? "Save draft" : "Save changes"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={busy !== null || !draft.title || !draft.slug}
                onClick={() => void handlePreview()}
              >
                {spin("preview", Eye)}
                Preview
              </Button>
              {status !== "published" && (
                <Button
                  className="w-full"
                  disabled={busy !== null || !draft.title || !draft.slug}
                  onClick={() => void handlePublishNow()}
                >
                  {spin("publish", Rocket)}
                  Publish now
                </Button>
              )}
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label htmlFor="schedule" className="text-xs">
                  Schedule for later
                </Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                />
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={busy !== null || !draft.title || !draft.slug}
                  onClick={() => void handleSchedule()}
                >
                  {spin("schedule", CalendarClock)}
                  {status === "scheduled" ? "Reschedule" : "Schedule"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  The article goes live automatically at this time (your local time zone).
                </p>
              </div>
              {status !== "draft" && (
                <Button
                  variant="ghost"
                  className="w-full"
                  disabled={busy !== null}
                  onClick={() => void handleUnpublish()}
                >
                  {spin("unpublish", EyeOff)}
                  {status === "scheduled" ? "Cancel schedule" : "Unpublish"}
                </Button>
              )}
              {dirty && <p className="text-center text-xs text-amber-600">Unsaved changes</p>}
            </div>
          </Panel>

          <Panel title="Featured image">
            <ImageField
              label="Image"
              value={draft.featuredImage}
              onChange={(v) => set("featuredImage", v)}
              help="Shown on the listing, at the top of the article and when shared."
            />
          </Panel>

          <Panel title="Details">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={draft.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tagsText}
                  onChange={(e) => {
                    setTagsText(e.target.value);
                    setDirty(true);
                  }}
                  placeholder="Cybersecurity, Cloud"
                />
                <p className="text-xs text-muted-foreground">Separate with commas.</p>
              </div>
            </div>
          </Panel>

          {saved && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  disabled={busy !== null}
                >
                  <Trash2 className="size-4" />
                  Delete article
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this article?</AlertDialogTitle>
                  <AlertDialogDescription>
                    “{saved.title}” will be permanently removed from the website and the admin.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void handleDelete()}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </>
  );
}
