import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AuthCard, FormAlert } from "@/components/admin/auth-card";
import { errorMessage } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/cms/api/admin";

export const Route = createFileRoute("/admin/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password | SkytLabs Admin" }] }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await requestPasswordReset({ data: { email } });
      if (result.ok) setSent(result.message);
      else setError(result.error);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      footer={
        <Link
          to="/admin/login"
          search={{ redirect: undefined, reset: undefined }}
          className="font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      }
    >
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email you sign in with and we'll send you a link to choose a new password.
        </p>
      </div>
      {sent ? (
        <FormAlert tone="info">{sent}</FormAlert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
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
          {error && <FormAlert tone="error">{error}</FormAlert>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
