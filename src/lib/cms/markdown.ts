import { Marked, type Tokens } from "marked";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(trimmed)) return trimmed;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed; // relative URL
  return null;
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    // Raw HTML in article bodies is shown as text rather than executed.
    html(token: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(token.text);
    },
    link(token: Tokens.Link) {
      const text = this.parser.parseInline(token.tokens);
      const href = safeUrl(token.href);
      if (!href) return text;
      const external = /^https?:/i.test(href);
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      const rel = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${title}${rel}>${text}</a>`;
    },
    image(token: Tokens.Image) {
      const src = safeUrl(token.href);
      if (!src) return "";
      const title = token.title ? ` title="${escapeHtml(token.title)}"` : "";
      return `<img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}"${title} loading="lazy" />`;
    },
  },
});

/** Renders article Markdown to sanitised HTML. */
export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown, { async: false });
}

/** Rough reading time in minutes. */
export function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
