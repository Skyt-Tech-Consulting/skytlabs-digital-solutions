import { Link } from "@tanstack/react-router";
import { Mail, MapPin } from "lucide-react";
import logoLight from "@/assets/Skytlab logo M1.png";
import { COMPANY, NAV_LINKS, SERVICE_GROUPS } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <img src={logoLight} alt="SkytLabs Limited" className="h-8 w-auto" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/70">
            {COMPANY.name} is a Nigerian IT consulting firm building, securing and operating the
            systems that enterprises run on — from strategy through to production support.
          </p>
          <div className="mt-6 space-y-3 text-sm text-navy-foreground/80">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
              <span>{COMPANY.address}</span>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-cyan" aria-hidden="true" />
              <a href={`mailto:${COMPANY.email}`} className="hover:text-cyan">
                {COMPANY.email}
              </a>
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">Company</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-navy-foreground/70 hover:text-navy-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.18em] text-cyan uppercase">
            Capabilities
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-navy-foreground/70">
            {SERVICE_GROUPS.map((group) => (
              <li key={group.id}>{group.group}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            &copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
          </p>
          <p>Lagos, Nigeria</p>
        </div>
      </div>
    </footer>
  );
}
