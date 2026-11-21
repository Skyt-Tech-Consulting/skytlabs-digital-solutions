import { useState, type FormEvent } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getSettingsForAdmin,
  saveSettingsFn,
  sendTestEmailFn,
  setUserPasswordFn,
} from "@/lib/cms/api/admin";
import { AdminPageHeader, Panel, errorMessage } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/settings")({
  loader: () => getSettingsForAdmin(),
  component: SettingsPage,
});

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
      ) : (
        <XCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      )}
      <span>{children}</span>
    </li>
  );
}

function SettingsPage() {
  const data = Route.useLoaderData();
  const { user } = Route.useRouteContext();
  const isAdmin = user?.role === "admin";
  const [recipients, setRecipients] = useState(data.settings.notificationEmail);
  const [saved, setSaved] = useState(data.settings.notificationEmail);
  const [busy, setBusy] = useState<string | null>(null);

  async function saveRecipients(e: FormEvent) {
    e.preventDefault();
    setBusy("save");
    try {
      const result = await saveSettingsFn({ data: { notificationEmail: recipients } });
      setRecipients(result.notificationEmail);
      setSaved(result.notificationEmail);
      toast.success("Notification address saved");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  async function sendTest() {
    setBusy("test");
    try {
      const result = await sendTestEmailFn();
      toast.success(`Test email sent to ${result.recipients.join(", ")}`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description={
          <>
            Contact-form notifications and your account. Company details, logos, navigation and
            default SEO are edited under{" "}
            <Link to="/admin/pages/$key" params={{ key: "site" }} className="underline">
              Header, footer &amp; site settings
            </Link>
            .
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Enquiry notifications"
          description="Every contact-form submission is emailed to these addresses."
        >
          <form onSubmit={saveRecipients} className="space-y-3">
            <Label htmlFor="recipients">Notification email address(es)</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              disabled={!isAdmin}
              placeholder="info@skytlabs.com"
            />
            <p className="text-xs text-muted-foreground">Separate several addresses with commas.</p>
            {isAdmin ? (
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={busy !== null || recipients === saved}>
                  {busy === "save" && <Loader2 className="size-4 animate-spin" />}
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy !== null || !data.email.configured}
                  onClick={() => void sendTest()}
                >
                  {busy === "test" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Send test email
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Only administrators can change this.</p>
            )}
          </form>
        </Panel>

        <Panel title="Delivery & spam protection status">
          <ul className="space-y-3">
            <Check ok={data.email.configured}>
              Email delivery{" "}
              {data.email.configured
                ? `configured via ${data.email.provider} (from ${data.email.from})`
                : "not configured — set SMTP_HOST, SMTP_USER and SMTP_PASSWORD on the server"}
            </Check>
            <Check ok>Hidden honeypot field and minimum fill-time check</Check>
            <Check ok>Rate limit: 5 submissions per visitor per 15 minutes</Check>
            <Check ok>Link-heavy messages are filed under Spam without notification</Check>
            <Check ok={data.turnstile}>
              Cloudflare Turnstile challenge{" "}
              {data.turnstile
                ? "enabled"
                : "off (optional — set TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY to enable)"}
            </Check>
          </ul>
        </Panel>

        {user && <ChangePassword email={user.email} />}
      </div>
    </>
  );
}

function ChangePassword({ email }: { email: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await setUserPasswordFn({ data: { email, password } });
      setPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel title="Change your password">
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">At least 10 characters.</p>
        <Button type="submit" disabled={busy || !password}>
          {busy && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </Panel>
  );
}
