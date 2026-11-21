import { createContext, useContext, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { DEFAULT_PAGE_PATHS, resolveHref, type PagePaths } from "@/lib/cms/pages";

const PathsContext = createContext<PagePaths>(DEFAULT_PAGE_PATHS);

export function PathsProvider({ paths, children }: { paths: PagePaths; children: ReactNode }) {
  return <PathsContext.Provider value={paths}>{children}</PathsContext.Provider>;
}

export function usePagePaths(): PagePaths {
  return useContext(PathsContext);
}

/**
 * Renders a CMS-provided link. Internal paths use client-side navigation and
 * follow page slug changes; anything else is a normal anchor.
 */
export function CmsLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const paths = usePagePaths();
  const resolved = resolveHref(href, paths);
  if (resolved.startsWith("/") && !resolved.startsWith("//")) {
    return (
      <Link to={resolved} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(resolved);
  return (
    <a
      href={resolved}
      className={className}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
