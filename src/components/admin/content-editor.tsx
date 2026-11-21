/**
 * Generic content editor. The form is inferred from the page's default content
 * (see lib/cms/defaults.ts), so every piece of copy on a page is editable:
 *
 *   string            -> text input / textarea (long copy)
 *   "icon" string     -> icon picker
 *   boolean           -> switch
 *   { src, alt }      -> image picker with alt text
 *   { label, href }   -> link / call-to-action (label + URL)
 *   string[]          -> list of paragraphs / bullet points
 *   object[]          -> repeatable cards (add, remove, reorder)
 *   object            -> group of fields
 */
import { useId, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICON_NAMES, getIcon } from "@/lib/cms/icons";
import type { ImageValue, LinkValue } from "@/lib/cms/types";
import { cn } from "@/lib/utils";
import { ImageField } from "./image-field";

type Json = unknown;
type Obj = Record<string, unknown>;

/* ------------------------------ labelling ----------------------------- */

const LABELS: Record<string, string> = {
  ctaBanner: "Closing call-to-action banner",
  cta: "Button",
  primaryCta: "Primary button",
  secondaryCta: "Secondary button",
  button: "Button",
  link: "Link",
  eyebrow: "Eyebrow",
  titleLead: "Headline (first part)",
  titleHighlight: "Headline (highlighted part)",
  intro: "Introduction",
  body: "Body text",
  blurb: "Short description",
  href: "Link URL",
  backgroundImage: "Background image",
  whatWeDo: "What we do",
  whySkytlabs: "Why SkytLabs",
  whoWeAre: "Who we are",
  howWeWork: "How we work",
  serviceGroups: "Service groups",
  group: "Group name",
  ogImage: "Social sharing image",
  defaultOgImage: "Default social sharing image",
  siteUrl: "Site URL",
  seo: "Default SEO",
  twitterHandle: "X / Twitter handle",
  countryCode: "Country code",
  mapLocation: "Map location (address shown on the embedded Google map)",
  copyrightName: "Copyright name",
  shortName: "Short name",
};

const HELP: Record<string, string> = {
  eyebrow: "Small uppercase label shown above the heading.",
  href: "Internal path like /contact or a full URL like https://…",
  siteUrl:
    "Public address of the website, e.g. https://www.skytlabs.com. Used for canonical URLs, social sharing and the sitemap.",
  titleHighlight: "Shown in the brand gradient after the first part.",
  navigation: "Leave a label empty to hide that link from the menu.",
  countryCode: "Two-letter ISO code, e.g. NG.",
  address: "Full address as displayed on the site.",
  streetAddress: "Used in search-engine structured data.",
  paragraphs: "Each item is shown as its own paragraph.",
};

const LONG_KEYS =
  /^(intro|body|description|blurb|paragraphs?|message|successBody|emptyBody|defaultDescription|messagePlaceholder)$/;

function humanize(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function isObj(v: unknown): v is Obj {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function isImage(v: unknown): v is ImageValue {
  return isObj(v) && Object.keys(v).length === 2 && "src" in v && "alt" in v;
}
function isLink(v: unknown): v is LinkValue {
  return isObj(v) && Object.keys(v).length === 2 && "label" in v && "href" in v;
}

/** Creates an empty item shaped like the template (for "Add item"). */
function blankFrom(template: Json): Json {
  if (typeof template === "string") return "";
  if (typeof template === "boolean") return false;
  if (typeof template === "number") return 0;
  if (Array.isArray(template)) return [];
  if (isObj(template)) {
    const out: Obj = {};
    for (const [k, v] of Object.entries(template)) out[k] = k === "icon" ? v : blankFrom(v);
    return out;
  }
  return template;
}

function itemTitle(item: Json, index: number, fallback: string): string {
  if (isObj(item)) {
    for (const key of ["title", "group", "label", "name"]) {
      const v = item[key];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return `${fallback} ${index + 1}`;
}

function singular(label: string): string {
  if (/ies$/i.test(label)) return label.replace(/ies$/i, "y");
  if (/ses$/i.test(label)) return label.replace(/es$/i, "");
  if (/s$/i.test(label)) return label.replace(/s$/i, "");
  return "Item";
}

/* ------------------------------- editors ------------------------------ */

type FieldProps = {
  name: string;
  value: Json;
  template: Json;
  onChange: (value: Json) => void;
  depth: number;
};

function Field({ name, value, template, onChange, depth }: FieldProps) {
  const label = humanize(name);
  const help = HELP[name];
  const id = useId();

  if (typeof template === "boolean") {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
        <Label htmlFor={id}>{label}</Label>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(v) => onChange(v)} />
      </div>
    );
  }

  if (typeof template === "string") {
    const text = typeof value === "string" ? value : "";
    if (name === "icon") return <IconField label="Icon" value={text} onChange={onChange} />;
    const long = LONG_KEYS.test(name) || template.length > 110;
    return (
      <div className="space-y-1.5">
        <Label htmlFor={id}>{label}</Label>
        {long ? (
          <Textarea
            id={id}
            value={text}
            rows={Math.min(8, Math.max(3, Math.ceil(text.length / 90)))}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <Input id={id} value={text} onChange={(e) => onChange(e.target.value)} />
        )}
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
      </div>
    );
  }

  if (isImage(template)) {
    const img = isImage(value) ? value : { src: "", alt: "" };
    return <ImageField label={label} value={img} onChange={onChange} {...(help ? { help } : {})} />;
  }

  if (isLink(template)) {
    const link = isLink(value) ? value : { label: "", href: "" };
    return (
      <fieldset className="space-y-3 rounded-lg border border-border p-3">
        <legend className="px-1 text-sm font-medium">{label}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Text</Label>
            <Input
              value={link.label}
              onChange={(e) => onChange({ ...link, label: e.target.value })}
              placeholder="Leave empty to hide"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Link URL</Label>
            <Input
              value={link.href}
              onChange={(e) => onChange({ ...link, href: e.target.value })}
              placeholder="/contact or https://…"
            />
          </div>
        </div>
      </fieldset>
    );
  }

  if (Array.isArray(template)) {
    const list = Array.isArray(value) ? value : [];
    const itemTemplate = template[0] ?? "";
    if (typeof itemTemplate === "string") {
      return (
        <StringListField
          label={label}
          help={help}
          items={list.map((v) => (typeof v === "string" ? v : ""))}
          long={LONG_KEYS.test(name) || itemTemplate.length > 110}
          onChange={onChange}
        />
      );
    }
    return (
      <ObjectListField
        label={label}
        items={list}
        template={itemTemplate}
        onChange={onChange}
        depth={depth}
      />
    );
  }

  if (isObj(template)) {
    const obj = isObj(value) ? value : {};
    return (
      <fieldset
        className={cn(
          "space-y-4",
          depth > 0 && "rounded-lg border border-dashed border-border p-4",
        )}
      >
        {depth > 0 && <legend className="px-1 text-sm font-semibold">{label}</legend>}
        {help && <p className="text-xs text-muted-foreground">{help}</p>}
        <ObjectFields value={obj} template={template} onChange={onChange} depth={depth + 1} />
      </fieldset>
    );
  }

  return null;
}

function ObjectFields({
  value,
  template,
  onChange,
  depth,
}: {
  value: Obj;
  template: Obj;
  onChange: (value: Obj) => void;
  depth: number;
}) {
  return (
    <div className="space-y-5">
      {Object.entries(template).map(([key, tpl]) => (
        <Field
          key={key}
          name={key}
          value={value[key]}
          template={tpl}
          depth={depth}
          onChange={(v) => onChange({ ...value, [key]: v })}
        />
      ))}
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  if (item !== undefined) next.splice(to, 0, item);
  return next;
}

function StringListField({
  label,
  help,
  items,
  long,
  onChange,
}: {
  label: string;
  help: string | undefined;
  items: string[];
  long: boolean;
  onChange: (items: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            {long ? (
              <Textarea
                value={item}
                rows={Math.min(8, Math.max(3, Math.ceil(item.length / 90)))}
                onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
              />
            ) : (
              <Input
                value={item}
                onChange={(e) => onChange(items.map((v, i) => (i === index ? e.target.value : v)))}
              />
            )}
            <RowActions
              index={index}
              count={items.length}
              onMove={(to) => onChange(move(items, index, to))}
              onRemove={() => onChange(items.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
        <Plus className="size-4" />
        Add {long ? "paragraph" : "item"}
      </Button>
    </div>
  );
}

function ObjectListField({
  label,
  items,
  template,
  onChange,
  depth,
}: {
  label: string;
  items: Json[];
  template: Json;
  onChange: (items: Json[]) => void;
  depth: number;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const itemLabel = singular(label);
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => {
          const open = openIndex === index;
          return (
            <div key={index} className="rounded-lg border border-border bg-background">
              <div className="flex items-center gap-2 p-2 pl-3">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                >
                  <ChevronDown
                    className={cn("size-4 shrink-0 transition-transform", open && "rotate-180")}
                  />
                  <span className="truncate">{itemTitle(item, index, itemLabel)}</span>
                </button>
                <RowActions
                  index={index}
                  count={items.length}
                  onMove={(to) => {
                    onChange(move(items, index, to));
                    setOpenIndex(open ? to : openIndex);
                  }}
                  onRemove={() => {
                    onChange(items.filter((_, i) => i !== index));
                    setOpenIndex(null);
                  }}
                />
              </div>
              {open && (
                <div className="border-t border-border p-4">
                  {isObj(template) ? (
                    <ObjectFields
                      value={isObj(item) ? item : {}}
                      template={template}
                      depth={depth + 1}
                      onChange={(v) => onChange(items.map((it, i) => (i === index ? v : it)))}
                    />
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          onChange([...items, blankFrom(template)]);
          setOpenIndex(items.length);
        }}
      >
        <Plus className="size-4" />
        Add {itemLabel.toLowerCase()}
      </Button>
    </div>
  );
}

function RowActions({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-start gap-0.5">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
        aria-label="Move up"
      >
        <ArrowUp className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8"
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
        aria-label="Move down"
      >
        <ArrowDown className="size-4" />
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-8 text-destructive hover:text-destructive"
        onClick={onRemove}
        aria-label="Remove"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

function IconField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const Current = getIcon(value);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue>
            <span className="flex items-center gap-2">
              <Current className="size-4" />
              {value}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {ICON_NAMES.map((name) => {
            const Icon = getIcon(name);
            return (
              <SelectItem key={name} value={name}>
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {name}
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

/* ------------------------------ top level ----------------------------- */

/**
 * Renders one collapsible panel per top-level section of the page content.
 */
export function ContentEditor({
  value,
  template,
  onChange,
}: {
  value: Obj;
  template: Obj;
  onChange: (value: Obj) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  return (
    <div className="space-y-4">
      {Object.entries(template).map(([key, tpl]) => {
        const isCollapsed = collapsed[key] ?? false;
        return (
          <section key={key} className="rounded-xl border border-border bg-card">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
              onClick={() => setCollapsed((c) => ({ ...c, [key]: !isCollapsed }))}
              aria-expanded={!isCollapsed}
            >
              <span className="text-base font-semibold">{humanize(key)}</span>
              <ChevronDown
                className={cn("size-5 transition-transform", !isCollapsed && "rotate-180")}
              />
            </button>
            {!isCollapsed && (
              <div className="border-t border-border p-5">
                {isObj(tpl) && !isImage(tpl) && !isLink(tpl) ? (
                  <ObjectFields
                    value={isObj(value[key]) ? (value[key] as Obj) : {}}
                    template={tpl}
                    depth={1}
                    onChange={(v) => onChange({ ...value, [key]: v })}
                  />
                ) : (
                  <Field
                    name={key}
                    value={value[key]}
                    template={tpl}
                    depth={1}
                    onChange={(v) => onChange({ ...value, [key]: v })}
                  />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
