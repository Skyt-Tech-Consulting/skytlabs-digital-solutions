import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import logo from "@/assets/Skytlab logo M2.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/cms/api/admin";
import { errorMessage } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/login")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { redirect?: string | undefined; reset?: boolean | undefined } => {
    const r = search["redirect"];
    return {
      ...(typeof r === "string" && r.startsWith("/admin") ? { redirect: r } : {}),
      ...(search["reset"] === true || search["reset"] === "true" ? { reset: true } : {}),
    };
  },
  component: LoginPage,
});

function LoginPage() {
  const { redirect, reset } = Route.useSearch();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await adminLogin({ data: { email, password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await router.invalidate();
      await router.navigate({ href: redirect ?? "/admin" });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <img src={logo} alt="SkytLabs Limited" className="h-9 w-auto" />
          <p className="text-sm font-medium text-muted-foreground">Website administration</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold">Sign in</h1>
          {reset && (
            <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
              Your password has been reset. Sign in with your new password.
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="password">Password</Label>
              <Link
                to="/admin/forgot-password"
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
