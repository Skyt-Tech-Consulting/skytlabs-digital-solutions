import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listMediaForAdmin, uploadMedia } from "@/lib/cms/api/admin";
import type { MediaItem } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { errorMessage } from "./admin-ui";

export const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";

export async function uploadImageFile(file: File, alt = ""): Promise<MediaItem> {
  const form = new FormData();
  form.append("file", file);
  form.append("alt", alt);
  return uploadMedia({ data: form });
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MediaItem) => void;
}) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setItems(await listMediaForAdmin());
    } catch (e) {
      toast.error(errorMessage(e));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelected(null);
      void load();
    }
  }, [open, load]);

  async function handleUpload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      let last: MediaItem | null = null;
      for (const file of Array.from(files)) last = await uploadImageFile(file);
      await load();
      if (last) setSelected(last.id);
      toast.success(files.length > 1 ? "Images uploaded" : "Image uploaded");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const chosen = items?.find((i) => i.id === selected) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0 sm:max-w-4xl">
        <div className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b border-border p-6">
            <DialogTitle>Media library</DialogTitle>
            <DialogDescription>
              Choose an existing image or upload a new one (JPG, PNG, WebP, GIF or AVIF, up to 4
              MB).
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              multiple
              className="hidden"
              onChange={(e) => void handleUpload(e.target.files)}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="mb-6 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Upload className="size-6" />
              )}
              {uploading ? "Uploading…" : "Upload images"}
            </button>

            {items === null ? (
              <div className="flex justify-center py-10">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No images uploaded yet.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item.id)}
                    onDoubleClick={() => {
                      onSelect(item);
                      onOpenChange(false);
                    }}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border-2 bg-muted text-left",
                      selected === item.id ? "border-primary" : "border-transparent",
                    )}
                  >
                    <img
                      src={item.url}
                      alt={item.alt}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <span className="block truncate px-2 py-1.5 text-xs">{item.filename}</span>
                    {selected === item.id && (
                      <span className="absolute top-2 right-2 inline-flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-4" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-border p-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={!chosen}
              onClick={() => {
                if (chosen) onSelect(chosen);
                onOpenChange(false);
              }}
            >
              <ImagePlus className="size-4" />
              Use selected image
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
