import { useState, type FormEvent } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthCard, FormAlert } from "@/components/admin/auth-card";
import { errorMessage } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordFn } from "@/lib/cms/api/admin";

export const Route = createFileRoute("/admin/reset-password")({
  validateSearch: (search: Record<string, unknown>): { token?: string | undefined } => {
    const t = search["token"];
    return typeof t === "string" ? { token: t } : {};
  },
  head: () => ({
    meta: [
      { title: "Choose a new password | SkytLabs Admin" },
      // Keep the token in the URL out of Referer headers.
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { token } = Route.useSearch();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const result = await resetPasswordFn({ data: { token: token ?? "", password } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      await router.invalidate();
      await router.navigate({ to: "/admin/login", search: { redirect: undefined, reset: true } });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const backLink = (
    <Link to="/admin/forgot-password" className="font-medium text-primary hover:underline">
      Request a new link
    </Link>
  );

  if (!token) {
    return (
      <AuthCard footer={backLink}>
        <h1 className="text-xl font-semibold">Reset link missing</h1>
        <FormAlert tone="error">
          This page needs the link from your reset email. Open the link in the email again, or
          request a new one.
        </FormAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard footer={backLink}>
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Use at least 10 characters. Every device currently signed in will be signed out.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <FormAlert tone="error">{error}</FormAlert>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Set new password
        </Button>
      </form>
    </AuthCard>
  );
}
