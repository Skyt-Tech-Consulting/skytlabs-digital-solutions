import { useMemo, useRef, useState } from "react";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { renderMarkdown } from "@/lib/cms/markdown";
import { MediaPickerDialog } from "./media-picker";

type Action = {
  icon: typeof Bold;
  label: string;
  apply: (sel: string) => [string, string, string];
};

const ACTIONS: Action[] = [
  { icon: Heading2, label: "Heading", apply: (s) => ["\n## ", s || "Heading", "\n"] },
  { icon: Heading3, label: "Subheading", apply: (s) => ["\n### ", s || "Subheading", "\n"] },
  { icon: Bold, label: "Bold", apply: (s) => ["**", s || "bold text", "**"] },
  { icon: Italic, label: "Italic", apply: (s) => ["_", s || "italic text", "_"] },
  { icon: Link2, label: "Link", apply: (s) => ["[", s || "link text", "](https://)"] },
  { icon: List, label: "Bulleted list", apply: (s) => ["\n- ", s || "List item", "\n"] },
  { icon: ListOrdered, label: "Numbered list", apply: (s) => ["\n1. ", s || "List item", "\n"] },
  { icon: Quote, label: "Quote", apply: (s) => ["\n> ", s || "Quote", "\n"] },
  { icon: Minus, label: "Divider", apply: (s) => [s, "\n\n---\n\n", ""] },
];

export function MarkdownEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState("write");
  const [pickerOpen, setPickerOpen] = useState(false);
  const html = useMemo(() => (tab === "preview" ? renderMarkdown(value) : ""), [tab, value]);

  function insert(build: (selected: string) => [string, string, string]) {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const [before, middle, after] = build(value.slice(start, end));
    const next = value.slice(0, start) + before + middle + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + middle.length);
    });
  }

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {tab === "write" && (
          <div className="flex flex-wrap gap-0.5" role="toolbar" aria-label="Formatting">
            {ACTIONS.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="ghost"
                size="icon"
                className="size-8"
                title={action.label}
                aria-label={action.label}
                onClick={() => insert(action.apply)}
              >
                <action.icon className="size-4" />
              </Button>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              title="Insert image"
              aria-label="Insert image"
              onClick={() => setPickerOpen(true)}
            >
              <ImageIcon className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <TabsContent value="write" className="mt-3">
        <Textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={22}
          className="font-mono text-sm leading-relaxed"
          placeholder={
            "Write the article here. Use the toolbar or Markdown, e.g.\n\n## A section heading\n\nA paragraph with **bold** text and a [link](https://example.com)."
          }
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Formatting uses Markdown. Leave a blank line between paragraphs.
        </p>
      </TabsContent>
      <TabsContent value="preview" className="mt-3">
        <div className="min-h-64 rounded-md border border-border bg-background p-6">
          {value.trim() ? (
            <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
          )}
        </div>
      </TabsContent>
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={(item) =>
          insert((s) => ["\n![", s || item.alt || "Image description", `](${item.url})\n`])
        }
      />
    </Tabs>
  );
}
