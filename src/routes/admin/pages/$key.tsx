import { useState } from "react";
import { Link, createFileRoute, notFound, useBlocker } from "@tanstack/react-router";
import { ArrowLeft, Eye, Loader2, Rocket, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  discardPageFn,
  getPageForEdit,
  publishPageFn,
  savePage,
  type PageEditPayload,
} from "@/lib/cms/api/admin";
import { pageDefaults } from "@/lib/cms/defaults";
import { getPageMeta, isPageKey } from "@/lib/cms/pages";
import type { PageDocVersion, SeoFields } from "@/lib/cms/types";
import { ContentEditor } from "@/components/admin/content-editor";
import { SeoEditor } from "@/components/admin/seo-editor";
import {
  AdminPageHeader,
  StatusBadge,
  errorMessage,
  formatDateTime,
} from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/pages/$key")({
  loader: async ({ params }) => {
    if (!isPageKey(params.key)) throw notFound();
    return getPageForEdit({ data: { key: params.key } });
  },
  component: PageEditor,
});

type Version = PageDocVersion<Record<string, unknown>>;

function PageEditor() {
  const initial = Route.useLoaderData();
  return <PageEditorInner key={initial.key} initial={initial} />;
}

function PageEditorInner({ initial }: { initial: PageEditPayload }) {
  const [payload, setPayload] = useState(initial);
  const [version, setVersion] = useState<Version>(initial.doc.draft as Version);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "publish" | "preview" | "discard">(null);

  const meta = getPageMeta(payload.key);
  const template = pageDefaults[payload.key].content as unknown as Record<string, unknown>;
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useBlocker({
    shouldBlockFn: () =>
      dirty && !window.confirm("You have unsaved changes. Leave without saving?"),
    enableBeforeUnload: () => dirty,
  });

  function update(next: Version) {
    setVersion(next);
    setDirty(true);
  }

  async function save(): Promise<PageEditPayload | null> {
    try {
      const result = await savePage({ data: { key: payload.key, version } });
      setPayload(result);
      setVersion(result.doc.draft as Version);
      setDirty(false);
      return result;
    } catch (e) {
      toast.error(errorMessage(e));
      return null;
    }
  }

  async function handleSave() {
    setBusy("save");
    if (await save()) toast.success("Draft saved");
    setBusy(null);
  }

  async function handlePreview() {
    // Open the tab synchronously so pop-up blockers allow it.
    const tab = window.open("about:blank", "_blank");
    setBusy("preview");
    const result = dirty ? await save() : payload;
    setBusy(null);
    if (!result) {
      tab?.close();
      return;
    }
    const path = result.draftPath ?? "/";
    if (tab) tab.location.href = `${path}?preview=true`;
  }

  async function handlePublish() {
    setBusy("publish");
    try {
      if (dirty && !(await save())) return;
      const result = await publishPageFn({ data: { key: payload.key } });
      setPayload(result);
      setVersion(result.doc.draft as Version);
      toast.success(`${meta.label} published — changes are now live.`);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleDiscard() {
    setBusy("discard");
    try {
      const result = await discardPageFn({ data: { key: payload.key } });
      setPayload(result);
      setVersion(result.doc.draft as Version);
      setDirty(false);
      toast.success("Draft discarded");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const unpublished = dirty || payload.hasChanges;

  const editor = (
    <ContentEditor
      value={version.content}
      template={template}
      onChange={(content) => update({ ...version, content })}
    />
  );

  return (
    <>
      <Link
        to="/admin/pages"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All pages
      </Link>
      <AdminPageHeader
        title={meta.label}
        description={
          <span className="flex flex-wrap items-center gap-2">
            {unpublished ? <StatusBadge status="changes" /> : <StatusBadge status="live" />}
            {payload.livePath && (
              <a href={payload.livePath} target="_blank" rel="noreferrer" className="underline">
                {payload.livePath}
              </a>
            )}
            <span>
              {payload.doc.publishedAt
                ? `Published ${formatDateTime(payload.doc.publishedAt)}${payload.doc.publishedBy ? ` by ${payload.doc.publishedBy}` : ""}`
                : "Not yet published from the CMS (original content is live)"}
            </span>
          </span>
        }
      />

      {/* Sticky action bar */}
      <div className="sticky top-14 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-2 border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:rounded-xl lg:border">
        <Button
          onClick={() => void handleSave()}
          variant="outline"
          disabled={busy !== null || !dirty}
        >
          {busy === "save" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save draft
        </Button>
        <Button onClick={() => void handlePreview()} variant="outline" disabled={busy !== null}>
          {busy === "preview" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Eye className="size-4" />
          )}
          Preview
        </Button>
        <Button onClick={() => void handlePublish()} disabled={busy !== null || !unpublished}>
          {busy === "publish" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Rocket className="size-4" />
          )}
          Publish
        </Button>
        {payload.hasChanges && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" disabled={busy !== null} className="ml-auto">
                <Undo2 className="size-4" />
                Discard draft
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard unpublished changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  The draft will be reset to the version that is currently live. This cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleDiscard()}>Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {dirty && <span className="text-xs text-amber-600">Unsaved changes</span>}
      </div>

      {meta.routable ? (
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>
          <TabsContent value="content" className="mt-6">
            {editor}
          </TabsContent>
          <TabsContent value="seo" className="mt-6">
            <SeoEditor
              value={version.seo}
              onChange={(seo: SeoFields) => update({ ...version, seo })}
              fixedPath={meta.fixedPath}
              origin={origin}
            />
          </TabsContent>
        </Tabs>
      ) : (
        editor
      )}
    </>
  );
}
