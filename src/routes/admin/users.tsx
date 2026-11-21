import { useState, type FormEvent } from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { KeyRound, Loader2, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  createUserFn,
  deleteUserFn,
  listUsersForAdmin,
  setUserPasswordFn,
} from "@/lib/cms/api/admin";
import type { PublicUser, UserRole } from "@/lib/cms/types";
import { AdminPageHeader, Panel, errorMessage, formatDateTime } from "@/components/admin/admin-ui";

export const Route = createFileRoute("/admin/users")({
  beforeLoad: ({ context }) => {
    if (context.user?.role !== "admin") throw redirect({ to: "/admin" });
  },
  loader: () => listUsersForAdmin(),
  component: UsersPage,
});

function UsersPage() {
  const initial = Route.useLoaderData();
  const { user: me } = Route.useRouteContext();
  const [users, setUsers] = useState<PublicUser[]>(initial);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as UserRole,
  });
  const [busy, setBusy] = useState(false);

  async function addUser(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      setUsers(await createUserFn({ data: form }));
      setForm({ name: "", email: "", password: "", role: "editor" });
      toast.success("User added. Share the password with them securely.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function removeUser(email: string) {
    try {
      setUsers(await deleteUserFn({ data: { email } }));
      toast.success("User removed");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function resetPassword(email: string) {
    const password = window.prompt(`New password for ${email} (at least 10 characters):`);
    if (!password) return;
    try {
      await setUserPasswordFn({ data: { email, password } });
      toast.success("Password updated");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Administrators can manage everything, including users and notification settings. Editors can manage pages, blog, media and enquiries."
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Team">
          <ul className="divide-y divide-border">
            {users.map((u) => (
              <li key={u.email} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {u.name}{" "}
                    {u.email === me?.email && <span className="text-muted-foreground">(you)</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.email} · <span className="capitalize">{u.role}</span> · added{" "}
                    {formatDateTime(u.createdAt)}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => void resetPassword(u.email)}>
                  <KeyRound className="size-4" />
                  Reset password
                </Button>
                {u.email !== me?.email && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove {u.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          They will no longer be able to sign in to the admin.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => void removeUser(u.email)}>
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Add a user">
          <form onSubmit={addUser} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u-name">Name</Label>
              <Input
                id="u-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-email">Email</Label>
              <Input
                id="u-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-password">Temporary password</Label>
              <Input
                id="u-password"
                type="text"
                required
                minLength={10}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                At least 10 characters. Ask them to change it under Settings after signing in.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as UserRole })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
              Add user
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
