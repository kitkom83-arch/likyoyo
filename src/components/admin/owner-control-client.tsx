"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AdminRole = "owner" | "admin";

type AdminUserSummary = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  slugLimit: number;
  active: boolean;
  slugCount: number;
  slugs: string[];
};

type Draft = {
  displayName: string;
  slugLimit: string;
};

type OwnerControlClientProps = {
  viewerName: string;
};

const parseJson = async <T,>(response: Response): Promise<T | null> => {
  const text = await response.text();
  return text.trim() ? (JSON.parse(text) as T) : null;
};

const requestError = async (response: Response, fallback: string) => {
  try {
    const payload = await parseJson<{ error?: string }>(response);
    return payload?.error || fallback;
  } catch {
    return fallback;
  }
};

export const OwnerControlClient = ({ viewerName }: OwnerControlClientProps) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "admin" as AdminRole,
    slugLimit: "10",
  });
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});

  const refreshUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to load admin users."));
      }
      const payload = await parseJson<{ users?: AdminUserSummary[] }>(response);
      const nextUsers = payload?.users ?? [];
      setUsers(nextUsers);
      setDrafts(
        Object.fromEntries(
          nextUsers.map((user) => [
            user.id,
            {
              displayName: user.displayName,
              slugLimit: user.slugLimit.toString(),
            },
          ]),
        ),
      );
      setStatus(null);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load admin users.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUsers();
  }, []);

  const summary = useMemo(() => {
    const totalSlugs = users.reduce((sum, user) => sum + user.slugCount, 0);
    const totalRemaining = users.reduce(
      (sum, user) => sum + Math.max(user.slugLimit - user.slugCount, 0),
      0,
    );
    return {
      totalAdmins: users.length,
      activeAdmins: users.filter((user) => user.active).length,
      totalSlugs,
      totalRemaining,
    };
  }, [users]);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUser.username,
          displayName: newUser.displayName,
          password: newUser.password,
          role: newUser.role,
          slugLimit: Number.parseInt(newUser.slugLimit, 10),
        }),
      });
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to create admin user."));
      }
      setNewUser({
        username: "",
        displayName: "",
        password: "",
        role: "admin",
        slugLimit: "10",
      });
      setStatus({ type: "success", text: "Admin account created." });
      await refreshUsers();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create admin user.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateUser = async (id: string, patch: Record<string, unknown>) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to update admin user."));
      }
      setStatus({ type: "success", text: "Admin account updated." });
      await refreshUsers();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update admin user.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetPassword = async (id: string) => {
    const password = resetPasswords[id]?.trim() ?? "";
    if (password.length < 8) {
      setStatus({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (!window.confirm("Reset password for this admin?")) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(id)}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to reset password."));
      }
      setResetPasswords((current) => ({ ...current, [id]: "" }));
      setStatus({ type: "success", text: "Password reset." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to reset password.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Owner Control</p>
            <h1 className="text-2xl font-semibold">Admin accounts and slug ownership</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {viewerName}</p>
          </div>
          <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
            Open builder
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total admins", summary.totalAdmins],
            ["Active admins", summary.activeAdmins],
            ["Total slugs", summary.totalSlugs],
            ["Remaining quota", summary.totalRemaining],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border/70 bg-background p-4 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </section>

        {status ? (
          <div
            className={`rounded-lg border px-3 py-2 text-sm ${
              status.type === "error"
                ? "border-red-300 bg-red-50 text-red-800"
                : "border-emerald-300 bg-emerald-50 text-emerald-800"
            }`}
          >
            {status.text}
          </div>
        ) : null}

        <section className="rounded-lg border border-border/70 bg-background p-4 shadow-sm">
          <h2 className="text-base font-semibold">Create admin account</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={handleCreateUser}>
            <Input
              className="md:col-span-1"
              value={newUser.username}
              onChange={(event) => setNewUser((current) => ({ ...current, username: event.target.value }))}
              placeholder="username"
              required
            />
            <Input
              className="md:col-span-1"
              value={newUser.displayName}
              onChange={(event) => setNewUser((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="Display name"
              required
            />
            <Input
              className="md:col-span-1"
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
              placeholder="Password"
              required
              minLength={8}
            />
            <Input
              className="md:col-span-1"
              type="number"
              min={0}
              value={newUser.slugLimit}
              onChange={(event) => setNewUser((current) => ({ ...current, slugLimit: event.target.value }))}
              placeholder="Slug limit"
              required
            />
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={newUser.role}
              onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as AdminRole }))}
            >
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <Button type="submit" disabled={isSaving}>
              Create
            </Button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
          <div className="border-b border-border/70 p-4">
            <h2 className="text-base font-semibold">Admins</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Display name</th>
                  <th className="px-3 py-2">Username</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Limit</th>
                  <th className="px-3 py-2">Used</th>
                  <th className="px-3 py-2">Remaining</th>
                  <th className="px-3 py-2">Slugs</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={9}>
                      Loading...
                    </td>
                  </tr>
                ) : null}
                {!isLoading && users.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={9}>
                      No admin users yet.
                    </td>
                  </tr>
                ) : null}
                {users.map((user) => {
                  const draft = drafts[user.id] ?? {
                    displayName: user.displayName,
                    slugLimit: user.slugLimit.toString(),
                  };
                  return (
                    <tr key={user.id} className="border-t border-border/60 align-top">
                      <td className="px-3 py-3">
                        <Input
                          value={draft.displayName}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: { ...draft, displayName: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-3 font-medium">{user.username}</td>
                      <td className="px-3 py-3">{user.role}</td>
                      <td className="px-3 py-3">{user.active ? "active" : "inactive"}</td>
                      <td className="px-3 py-3">
                        <Input
                          type="number"
                          min={0}
                          value={draft.slugLimit}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [user.id]: { ...draft, slugLimit: event.target.value },
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-3">{user.slugCount}</td>
                      <td className="px-3 py-3">{Math.max(user.slugLimit - user.slugCount, 0)}</td>
                      <td className="max-w-xs px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.slugs.length ? (
                            user.slugs.map((slug) => (
                              <span key={slug} className="rounded bg-muted px-2 py-1 text-xs">
                                /{slug}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No slugs</span>
                          )}
                        </div>
                      </td>
                      <td className="space-y-2 px-3 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={isSaving}
                            onClick={() =>
                              updateUser(user.id, {
                                displayName: draft.displayName,
                                slugLimit: Number.parseInt(draft.slugLimit, 10),
                              })
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant={user.active ? "destructive" : "secondary"}
                            disabled={isSaving}
                            onClick={() => {
                              if (user.active && !window.confirm(`Disable ${user.username}?`)) {
                                return;
                              }
                              void updateUser(user.id, { active: !user.active });
                            }}
                          >
                            {user.active ? "Disable" : "Enable"}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="password"
                            value={resetPasswords[user.id] ?? ""}
                            onChange={(event) =>
                              setResetPasswords((current) => ({
                                ...current,
                                [user.id]: event.target.value,
                              }))
                            }
                            placeholder="New password"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaving}
                            onClick={() => {
                              void resetPassword(user.id);
                            }}
                          >
                            Reset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
};
