import { useRef, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { deleteMediaFn, listMediaForAdmin, updateMediaAltFn } from "@/lib/cms/api/admin";
import type { MediaItem } from "@/lib/cms/types";
import { AdminPageHeader, errorMessage, formatDateTime } from "@/components/admin/admin-ui";
import { ACCEPTED_IMAGE_TYPES, uploadImageFile } from "@/components/admin/media-picker";

export const Route = createFileRoute("/admin/media")({
  loader: () => listMediaForAdmin(),
  component: MediaLibrary,
});

function MediaLibrary() {
  const items = Route.useLoaderData();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadImageFile(file);
        ok++;
      } catch (e) {
        toast.error(`${file.name}: ${errorMessage(e)}`);
      }
    }
    if (ok) toast.success(`${ok} image${ok > 1 ? "s" : ""} uploaded`);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    await router.invalidate();
  }

  return (
    <>
      <AdminPageHeader
        title="Media library"
        description="Images uploaded here can be used on any page or article. Add alt text so images are accessible and searchable."
        actions={
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              Upload images
            </Button>
          </>
        }
      />
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No images yet. Upload JPG, PNG, WebP, GIF or AVIF files up to 4 MB.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MediaCard key={item.id} item={item} onChanged={() => void router.invalidate()} />
          ))}
        </div>
      )}
    </>
  );
}

function MediaCard({ item, onChanged }: { item: MediaItem; onChanged: () => void }) {
  const [alt, setAlt] = useState(item.alt);
  const [saving, setSaving] = useState(false);

  async function saveAlt() {
    setSaving(true);
    try {
      await updateMediaAltFn({ data: { id: item.id, alt } });
      toast.success("Alt text saved");
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    try {
      await deleteMediaFn({ data: { id: item.id } });
      toast.success("Image deleted");
      onChanged();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <img
        src={item.url}
        alt={item.alt}
        loading="lazy"
        className="aspect-video w-full bg-muted object-cover"
      />
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate text-sm font-medium">{item.filename}</p>
          <p className="text-xs text-muted-foreground">
            {(item.size / 1024).toFixed(0)} KB · {formatDateTime(item.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text"
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            disabled={saving || alt === item.alt}
            onClick={() => void saveAlt()}
          >
            Save
          </Button>
        </div>
        <div className="flex justify-between">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              void navigator.clipboard
                .writeText(window.location.origin + item.url)
                .then(() => toast.success("Image URL copied"));
            }}
          >
            <Copy className="size-4" />
            Copy URL
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                <AlertDialogDescription>
                  Any page or article still using this image will show it as missing. Replace it
                  there first if it is in use.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void remove()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
