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

type DeletedPublicPageSummary = {
  id: string;
  slug: string;
  displayName: string;
  owner_admin_id: string | null;
  original_updated_at: string | null;
  deleted_at: string;
  deleted_reason: string | null;
  deleted_by_admin_id: string | null;
  owner: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  } | null;
  deletedBy: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  } | null;
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

const normalizeSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const formatDateTime = (value: string | null | undefined): string => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

export const OwnerControlClient = ({ viewerName }: OwnerControlClientProps) => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [deletedPages, setDeletedPages] = useState<DeletedPublicPageSummary[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [restoreOwnerDrafts, setRestoreOwnerDrafts] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletedLoading, setIsDeletedLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [restoreAsNewPage, setRestoreAsNewPage] = useState<DeletedPublicPageSummary | null>(null);
  const [restoreAsNewSlug, setRestoreAsNewSlug] = useState("");
  const [deleteForeverPage, setDeleteForeverPage] = useState<DeletedPublicPageSummary | null>(null);
  const [deleteForeverConfirm, setDeleteForeverConfirm] = useState("");
  const [newUser, setNewUser] = useState({
    username: "",
    displayName: "",
    password: "",
    role: "admin" as AdminRole,
    slugLimit: "10",
  });
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});

  const refreshDeletedPages = async () => {
    setIsDeletedLoading(true);
    try {
      const response = await fetch("/api/admin/deleted-public-pages", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to load deleted pages."));
      }
      const payload = await parseJson<{ pages?: DeletedPublicPageSummary[] }>(response);
      const nextPages = payload?.pages ?? [];
      setDeletedPages(nextPages);
      setRestoreOwnerDrafts(
        Object.fromEntries(
          nextPages.map((page) => [page.id, page.owner_admin_id ?? ""]),
        ),
      );
      setStatus(null);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load deleted pages.",
      });
    } finally {
      setIsDeletedLoading(false);
    }
  };

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
    void refreshDeletedPages();
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
      activeSlugs: totalSlugs,
      deletedSlugs: deletedPages.length,
      totalRemaining,
    };
  }, [deletedPages.length, users]);

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

  const refreshOwnerData = async () => {
    await Promise.all([refreshUsers(), refreshDeletedPages()]);
  };

  const restoreDeletedPage = async (
    page: DeletedPublicPageSummary,
    input: { slug?: string; ownerAdminId?: string | null } = {},
  ) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/deleted-public-pages/${encodeURIComponent(page.id)}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        },
      );
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to restore deleted page."));
      }
      setStatus({ type: "success", text: `Restored /${input.slug ?? page.slug}.` });
      setRestoreAsNewPage(null);
      setRestoreAsNewSlug("");
      await refreshOwnerData();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to restore deleted page.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (page: DeletedPublicPageSummary) => {
    if (!window.confirm(`Restore /${page.slug}?`)) {
      return;
    }
    await restoreDeletedPage(page);
  };

  const handleAssignRestore = async (page: DeletedPublicPageSummary) => {
    const ownerAdminId = restoreOwnerDrafts[page.id] ?? "";
    if (!ownerAdminId) {
      setStatus({ type: "error", text: "Choose an admin to assign this page." });
      return;
    }
    if (!window.confirm(`Restore /${page.slug}?`)) {
      return;
    }
    await restoreDeletedPage(page, { ownerAdminId });
  };

  const handleRestoreAsNewSlug = async () => {
    if (!restoreAsNewPage) {
      return;
    }
    const slug = normalizeSlug(restoreAsNewSlug);
    if (!slug) {
      setStatus({ type: "error", text: "Enter a new slug." });
      return;
    }
    await restoreDeletedPage(restoreAsNewPage, {
      slug,
      ownerAdminId: restoreOwnerDrafts[restoreAsNewPage.id] || undefined,
    });
  };

  const handleDeleteForever = async () => {
    if (!deleteForeverPage) {
      return;
    }
    const expected = `DELETE ${deleteForeverPage.slug}`;
    if (deleteForeverConfirm !== expected) {
      setStatus({ type: "error", text: `Type ${expected} to confirm.` });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/deleted-public-pages/${encodeURIComponent(deleteForeverPage.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(await requestError(response, "Failed to delete forever."));
      }
      setStatus({ type: "success", text: `Deleted /${deleteForeverPage.slug} forever.` });
      setDeleteForeverPage(null);
      setDeleteForeverConfirm("");
      await refreshDeletedPages();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete forever.",
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

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Total admins", summary.totalAdmins],
            ["Active admins", summary.activeAdmins],
            ["Active slugs", summary.activeSlugs],
            ["Deleted slugs", summary.deletedSlugs],
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

        <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold">Deleted Pages</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Deleted slugs are archived here until restored or deleted forever.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isDeletedLoading || isSaving}
              onClick={() => {
                void refreshDeletedPages();
              }}
            >
              Refresh
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Display name</th>
                  <th className="px-3 py-2">Previous owner</th>
                  <th className="px-3 py-2">Deleted at</th>
                  <th className="px-3 py-2">Deleted by</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isDeletedLoading ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      Loading...
                    </td>
                  </tr>
                ) : null}
                {!isDeletedLoading && deletedPages.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      No deleted pages.
                    </td>
                  </tr>
                ) : null}
                {deletedPages.map((page) => (
                  <tr key={page.id} className="border-t border-border/60 align-top">
                    <td className="px-3 py-3 font-medium">/{page.slug}</td>
                    <td className="px-3 py-3">{page.displayName || "-"}</td>
                    <td className="px-3 py-3">
                      {page.owner ? `${page.owner.displayName} (${page.owner.username})` : "-"}
                    </td>
                    <td className="px-3 py-3">{formatDateTime(page.deleted_at)}</td>
                    <td className="px-3 py-3">
                      {page.deletedBy
                        ? `${page.deletedBy.displayName} (${page.deletedBy.username})`
                        : "-"}
                    </td>
                    <td className="space-y-2 px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => {
                            void handleRestore(page);
                          }}
                        >
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isSaving}
                          onClick={() => {
                            setRestoreAsNewPage(page);
                            setRestoreAsNewSlug(`${page.slug}-restored`);
                          }}
                        >
                          Restore as new slug
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          className="h-9 min-w-52 rounded-md border border-input bg-transparent px-3 text-sm"
                          value={restoreOwnerDrafts[page.id] ?? ""}
                          onChange={(event) =>
                            setRestoreOwnerDrafts((current) => ({
                              ...current,
                              [page.id]: event.target.value,
                            }))
                          }
                        >
                          <option value="">Choose admin</option>
                          {users
                            .filter((user) => user.active)
                            .map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.displayName} ({user.username})
                              </option>
                            ))}
                        </select>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isSaving}
                          onClick={() => {
                            void handleAssignRestore(page);
                          }}
                        >
                          Assign to admin
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={isSaving}
                        onClick={() => {
                          setDeleteForeverPage(page);
                          setDeleteForeverConfirm("");
                        }}
                      >
                        Delete forever
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {restoreAsNewPage ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-2xl"
          >
            <h3 className="text-base font-semibold">Restore as new slug</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter a new slug for /{restoreAsNewPage.slug}.
            </p>
            <div className="mt-4 space-y-1">
              <label htmlFor="restore-new-slug" className="text-xs text-muted-foreground">
                New slug
              </label>
              <Input
                id="restore-new-slug"
                value={restoreAsNewSlug}
                onChange={(event) => setRestoreAsNewSlug(normalizeSlug(event.target.value))}
                placeholder="new-slug"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                disabled={isSaving}
                onClick={() => {
                  setRestoreAsNewPage(null);
                  setRestoreAsNewSlug("");
                }}
              >
                Cancel
              </Button>
              <Button
                disabled={isSaving || !restoreAsNewSlug}
                onClick={() => {
                  void handleRestoreAsNewSlug();
                }}
              >
                Restore
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {deleteForeverPage ? (
        <div className="fixed inset-0 z-[81] flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-lg border border-border bg-background p-5 shadow-2xl"
          >
            <h3 className="text-base font-semibold">ยืนยันการลบถาวร</h3>
            <p className="mt-2 text-sm text-muted-foreground">การลบนี้กู้คืนไม่ได้</p>
            <div className="mt-4 space-y-1">
              <label htmlFor="delete-forever-confirm" className="text-xs text-muted-foreground">
                พิมพ์ DELETE {deleteForeverPage.slug} เพื่อยืนยัน
              </label>
              <Input
                id="delete-forever-confirm"
                value={deleteForeverConfirm}
                onChange={(event) => setDeleteForeverConfirm(event.target.value)}
                placeholder={`DELETE ${deleteForeverPage.slug}`}
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                disabled={isSaving}
                onClick={() => {
                  setDeleteForeverPage(null);
                  setDeleteForeverConfirm("");
                }}
              >
                ยกเลิก
              </Button>
              <Button
                variant="destructive"
                disabled={isSaving || deleteForeverConfirm !== `DELETE ${deleteForeverPage.slug}`}
                onClick={() => {
                  void handleDeleteForever();
                }}
              >
                ลบถาวร
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
