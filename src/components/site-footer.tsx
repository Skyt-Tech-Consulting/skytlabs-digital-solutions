import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SiteSettings } from "@/lib/cms/defaults";
import type { PagePaths } from "@/lib/cms/pages";
import { buildNavLinks } from "./site-header";

export function SiteFooter({
  site,
  paths,
  serviceGroupNames,
}: {
  site: SiteSettings;
  paths: PagePaths;
  serviceGroupNames: string[];
}) {
  const { footer, company } = site;
  const links = buildNavLinks(site, paths);

  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          {footer.logo.src && (
            <img src={footer.logo.src} alt={footer.logo.alt} className="h-8 w-auto" />
          )}
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/70">
            {footer.blurb}
          </p>
          <div className="mt-6 space-y-3 text-sm text-navy-foreground/80">
            {company.address && (
              <p className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
                <span>{company.address}</span>
              </p>
            )}
            {company.email && (
              <p className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
                <a href={`mailto:${company.email}`} className="hover:text-cyan">
                  {company.email}
                </a>
              </p>
            )}
            {company.phone && (
              <p className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
                <a href={`tel:${company.phone.replace(/\s+/g, "")}`} className="hover:text-cyan">
                  {company.phone}
                </a>
              </p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
            {footer.companyHeading}
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {links.map((link) => (
              <li key={link.key}>
                <Link to={link.to} className="text-navy-foreground/70 hover:text-navy-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
            {footer.capabilitiesHeading}
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/70">
            {serviceGroupNames.map((name, index) => (
              <li key={`${index}-${name}`}>
                <Link to={paths.services} className="hover:text-navy-foreground">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {footer.copyrightName}. All rights reserved.
          </p>
          <p>{footer.location}</p>
        </div>
      </div>
    </footer>
  );
}
