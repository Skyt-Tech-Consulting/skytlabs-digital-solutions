import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import type { SiteSettings } from "@/lib/cms/defaults";
import type { PagePaths } from "@/lib/cms/pages";
import { CmsLink } from "./site-context";

const NAV_ORDER = ["home", "about", "services", "products", "projects", "blog", "contact"] as const;

export function buildNavLinks(site: SiteSettings, paths: PagePaths) {
  return NAV_ORDER.map((key) => ({ key, to: paths[key], label: site.navigation[key] })).filter(
    (link) => link.label.trim() !== "",
  );
}

export function SiteHeader({ site, paths }: { site: SiteSettings; paths: PagePaths }) {
  const [open, setOpen] = useState(false);
  const links = buildNavLinks(site, paths);
  const { logo, cta } = site.header;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Link to="/" className="shrink-0" aria-label={`${site.company.shortName} home`}>
          <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.key}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {cta.label && (
          <div className="hidden lg:block">
            <CmsLink
              href={cta.href}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {cta.label}
            </CmsLink>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-border bg-background px-5 pb-5 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.key}>
                <Link
                  to={link.to}
                  activeOptions={{ exact: link.to === "/" }}
                  onClick={() => setOpen(false)}
                  className="block border-b border-border/60 py-3.5 text-sm font-medium text-muted-foreground data-[status=active]:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {cta.label && (
            <CmsLink
              href={cta.href}
              onClick={() => setOpen(false)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              {cta.label}
            </CmsLink>
          )}
        </nav>
      )}
    </header>
  );
}
