import { useState } from "react";
import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useLocation,
  useRouter,
} from "@tanstack/react-router";
import {
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  Users,
  X,
} from "lucide-react";
import logo from "@/assets/Skytlab logo M2.png";
import { Toaster } from "@/components/ui/sonner";
import { adminLogout, getAdminSession } from "@/lib/cms/api/admin";
import { cn } from "@/lib/utils";

/** Pages reachable without signing in. */
const PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const user = await getAdminSession();
    const onLogin = location.pathname === "/admin/login";
    if (!user && !PUBLIC_PATHS.includes(location.pathname)) {
      throw redirect({ to: "/admin/login", search: { redirect: location.href } });
    }
    if (user && onLogin) throw redirect({ to: "/admin" });
    return { user };
  },
  head: () => ({
    meta: [{ title: "SkytLabs Admin" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pages", label: "Pages & SEO", icon: FileText },
  { to: "/admin/blog", label: "Blog", icon: Newspaper },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/media", label: "Media library", icon: ImageIcon },
  { to: "/admin/settings", label: "Settings", icon: Settings },
  { to: "/admin/users", label: "Users", icon: Users, adminOnly: true },
] as const;

function AdminLayout() {
  const { user } = Route.useRouteContext();
  const location = useLocation();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || PUBLIC_PATHS.includes(location.pathname)) {
    return (
      <>
        <Outlet />
        <Toaster richColors position="top-right" />
      </>
    );
  }

  async function logout() {
    await adminLogout();
    await router.invalidate();
    await router.navigate({ to: "/admin/login", search: { redirect: undefined } });
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Admin">
      {NAV.filter((item) => !("adminOnly" in item) || user.role === "admin").map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: "exact" in item ? item.exact : false }}
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/40 hover:text-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
        >
          <item.icon className="size-4" aria-hidden="true" />
          {item.label}
        </Link>
      ))}
      <div className="mt-auto space-y-1 border-t border-border pt-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          View website
        </a>
        <button
          type="button"
          onClick={() => void logout()}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/40 hover:text-foreground"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sign out
        </button>
        <div className="px-3 pt-2 text-xs text-muted-foreground">
          <p className="truncate font-medium text-foreground">{user.name}</p>
          <p className="truncate">{user.email}</p>
          <p className="capitalize">{user.role}</p>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
        <Link to="/admin" className="flex items-center gap-2">
          <img src={logo} alt="SkytLabs" className="h-6 w-auto" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="rounded-md p-2"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </header>
      {mobileOpen && (
        <div className="fixed inset-0 top-14 z-30 flex flex-col bg-background lg:hidden">{nav}</div>
      )}

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background lg:flex">
        <Link to="/admin" className="flex h-16 items-center gap-2 border-b border-border px-6">
          <img src={logo} alt="SkytLabs" className="h-7 w-auto" />
          <span className="text-xs font-semibold text-muted-foreground uppercase">Admin</span>
        </Link>
        {nav}
      </aside>

      <main className={cn("px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10")}>
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
