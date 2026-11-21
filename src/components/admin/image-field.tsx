import { useId, useState } from "react";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageValue } from "@/lib/cms/types";
import { MediaPickerDialog } from "./media-picker";

export function ImageField({
  label,
  value,
  onChange,
  help,
  allowEmpty = true,
}: {
  label: string;
  value: ImageValue;
  onChange: (value: ImageValue) => void;
  help?: string;
  allowEmpty?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const altId = useId();
  const missingAlt = Boolean(value.src) && !value.alt.trim();

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-col gap-4 rounded-lg border border-border p-3 sm:flex-row">
        <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted sm:w-44">
          {value.src ? (
            <img src={value.src} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
              {value.src ? "Replace image" : "Choose image"}
            </Button>
            {allowEmpty && value.src && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange({ src: "", alt: "" })}
              >
                <X className="size-4" />
                Remove
              </Button>
            )}
          </div>
          <div>
            <Label htmlFor={altId} className="text-xs text-muted-foreground">
              Alt text (describes the image for screen readers and search engines)
            </Label>
            <Input
              id={altId}
              value={value.alt}
              onChange={(e) => onChange({ ...value, alt: e.target.value })}
              placeholder="e.g. Consultants reviewing a dashboard"
              className="mt-1"
              aria-invalid={missingAlt}
            />
            {missingAlt && (
              <p className="mt-1 text-xs text-amber-600">Add alt text for accessibility and SEO.</p>
            )}
          </div>
        </div>
      </div>
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        onSelect={(item) => onChange({ src: item.url, alt: value.alt || item.alt })}
      />
    </div>
  );
}
