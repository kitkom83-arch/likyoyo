"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/use-i18n";

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
  const router = useRouter();
  const { t } = useI18n();
  const roleLabel = (role: string) =>
    role === "owner" ? t("owner_role_owner") : t("owner_role_admin");
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
        throw new Error(await requestError(response, t("owner_err_load_deleted")));
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
        text: error instanceof Error ? error.message : t("owner_err_load_deleted"),
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
        throw new Error(await requestError(response, t("owner_err_load_users")));
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
        text: error instanceof Error ? error.message : t("owner_err_load_users"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void refreshUsers();
      void refreshDeletedPages();
    });
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
        throw new Error(await requestError(response, t("owner_err_create_user")));
      }
      setNewUser({
        username: "",
        displayName: "",
        password: "",
        role: "admin",
        slugLimit: "10",
      });
      setStatus({ type: "success", text: t("owner_msg_user_created") });
      await refreshUsers();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : t("owner_err_create_user"),
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
        throw new Error(await requestError(response, t("owner_err_update_user")));
      }
      setStatus({ type: "success", text: t("owner_msg_user_updated") });
      await refreshUsers();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : t("owner_err_update_user"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetPassword = async (id: string) => {
    const password = resetPasswords[id]?.trim() ?? "";
    if (password.length < 8) {
      setStatus({ type: "error", text: t("owner_err_password_length") });
      return;
    }
    if (!window.confirm(t("owner_confirm_reset"))) {
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
        throw new Error(await requestError(response, t("owner_err_reset")));
      }
      setResetPasswords((current) => ({ ...current, [id]: "" }));
      setStatus({ type: "success", text: t("owner_msg_password_reset") });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : t("owner_err_reset"),
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
        throw new Error(await requestError(response, t("owner_err_restore")));
      }
      setStatus({
        type: "success",
        text: t("owner_msg_restored", { slug: input.slug ?? page.slug }),
      });
      setRestoreAsNewPage(null);
      setRestoreAsNewSlug("");
      await refreshOwnerData();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : t("owner_err_restore"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRestore = async (page: DeletedPublicPageSummary) => {
    if (!window.confirm(t("owner_confirm_restore", { slug: page.slug }))) {
      return;
    }
    await restoreDeletedPage(page);
  };

  const handleAssignRestore = async (page: DeletedPublicPageSummary) => {
    const ownerAdminId = restoreOwnerDrafts[page.id] ?? "";
    if (!ownerAdminId) {
      setStatus({ type: "error", text: t("owner_err_choose_admin") });
      return;
    }
    if (!window.confirm(t("owner_confirm_restore", { slug: page.slug }))) {
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
      setStatus({ type: "error", text: t("owner_err_enter_slug") });
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
      setStatus({ type: "error", text: t("owner_err_type_confirm", { text: expected }) });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/admin/deleted-public-pages/${encodeURIComponent(deleteForeverPage.id)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(await requestError(response, t("owner_err_delete_forever")));
      }
      setStatus({
        type: "success",
        text: t("owner_msg_deleted_forever", { slug: deleteForeverPage.slug }),
      });
      setDeleteForeverPage(null);
      setDeleteForeverConfirm("");
      await refreshDeletedPages();
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : t("owner_err_delete_forever"),
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
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t("owner_eyebrow")}</p>
            <h1 className="text-2xl font-semibold">{t("owner_title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("owner_signed_in_as", { name: viewerName })}
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/admin")}>
            {t("owner_open_builder")}
          </Button>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [t("owner_stat_total_admins"), summary.totalAdmins],
            [t("owner_stat_active_admins"), summary.activeAdmins],
            [t("owner_stat_active_slugs"), summary.activeSlugs],
            [t("owner_stat_deleted_slugs"), summary.deletedSlugs],
            [t("owner_stat_remaining"), summary.totalRemaining],
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
          <h2 className="text-base font-semibold">{t("owner_create_heading")}</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-6" onSubmit={handleCreateUser}>
            <Input
              className="md:col-span-1"
              value={newUser.username}
              onChange={(event) => setNewUser((current) => ({ ...current, username: event.target.value }))}
              placeholder={t("owner_ph_username")}
              required
            />
            <Input
              className="md:col-span-1"
              value={newUser.displayName}
              onChange={(event) => setNewUser((current) => ({ ...current, displayName: event.target.value }))}
              placeholder={t("owner_ph_display_name")}
              required
            />
            <Input
              className="md:col-span-1"
              type="password"
              value={newUser.password}
              onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))}
              placeholder={t("owner_ph_password")}
              required
              minLength={8}
            />
            <Input
              className="md:col-span-1"
              type="number"
              min={0}
              value={newUser.slugLimit}
              onChange={(event) => setNewUser((current) => ({ ...current, slugLimit: event.target.value }))}
              placeholder={t("owner_ph_slug_limit")}
              required
            />
            <select
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              value={newUser.role}
              onChange={(event) => setNewUser((current) => ({ ...current, role: event.target.value as AdminRole }))}
            >
              <option value="admin">{t("owner_role_admin")}</option>
              <option value="owner">{t("owner_role_owner")}</option>
            </select>
            <Button type="submit" disabled={isSaving}>
              {t("owner_create_button")}
            </Button>
          </form>
        </section>

        <section className="overflow-hidden rounded-lg border border-border/70 bg-background shadow-sm">
          <div className="border-b border-border/70 p-4">
            <h2 className="text-base font-semibold">{t("owner_admins_heading")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{t("owner_th_display_name")}</th>
                  <th className="px-3 py-2">{t("owner_th_username")}</th>
                  <th className="px-3 py-2">{t("owner_th_role")}</th>
                  <th className="px-3 py-2">{t("owner_th_status")}</th>
                  <th className="px-3 py-2">{t("owner_th_limit")}</th>
                  <th className="px-3 py-2">{t("owner_th_used")}</th>
                  <th className="px-3 py-2">{t("owner_th_remaining")}</th>
                  <th className="px-3 py-2">{t("owner_th_owned_paths")}</th>
                  <th className="px-3 py-2">{t("owner_th_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={9}>
                      {t("owner_loading")}
                    </td>
                  </tr>
                ) : null}
                {!isLoading && users.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={9}>
                      {t("owner_no_users")}
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
                      <td className="px-3 py-3">{roleLabel(user.role)}</td>
                      <td className="px-3 py-3">
                        <div>{user.active ? t("owner_active") : t("owner_inactive")}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {user.active ? t("owner_links_enabled") : t("owner_links_disabled")}
                        </div>
                      </td>
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
                            <span className="text-muted-foreground">{t("owner_no_slugs")}</span>
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
                            {t("owner_save")}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.active ? "destructive" : "secondary"}
                            disabled={isSaving}
                            onClick={() => {
                              if (
                                user.active &&
                                !window.confirm(
                                  t("owner_confirm_disable", { username: user.username }),
                                )
                              ) {
                                return;
                              }
                              void updateUser(user.id, { active: !user.active });
                            }}
                          >
                            {user.active ? t("owner_disable_links") : t("owner_enable_links")}
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
                            placeholder={t("owner_ph_new_password")}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isSaving}
                            onClick={() => {
                              void resetPassword(user.id);
                            }}
                          >
                            {t("owner_reset")}
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
              <h2 className="text-base font-semibold">{t("owner_deleted_heading")}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("owner_deleted_desc")}
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
              {t("owner_refresh")}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">{t("owner_th_slug")}</th>
                  <th className="px-3 py-2">{t("owner_th_display_name")}</th>
                  <th className="px-3 py-2">{t("owner_th_prev_owner")}</th>
                  <th className="px-3 py-2">{t("owner_th_deleted_at")}</th>
                  <th className="px-3 py-2">{t("owner_th_deleted_by")}</th>
                  <th className="px-3 py-2">{t("owner_th_actions")}</th>
                </tr>
              </thead>
              <tbody>
                {isDeletedLoading ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      {t("owner_loading")}
                    </td>
                  </tr>
                ) : null}
                {!isDeletedLoading && deletedPages.length === 0 ? (
                  <tr>
                    <td className="px-3 py-8 text-center text-muted-foreground" colSpan={6}>
                      {t("owner_no_deleted")}
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
                          {t("owner_restore")}
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
                          {t("owner_restore_as_new")}
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
                          <option value="">{t("owner_choose_admin")}</option>
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
                          {t("owner_assign")}
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
                        {t("owner_delete_forever")}
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
            <h3 className="text-base font-semibold">{t("owner_restore_as_new")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("owner_restore_modal_desc", { slug: restoreAsNewPage.slug })}
            </p>
            <div className="mt-4 space-y-1">
              <label htmlFor="restore-new-slug" className="text-xs text-muted-foreground">
                {t("owner_new_slug_label")}
              </label>
              <Input
                id="restore-new-slug"
                value={restoreAsNewSlug}
                onChange={(event) => setRestoreAsNewSlug(normalizeSlug(event.target.value))}
                placeholder={t("owner_ph_new_slug")}
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
                {t("owner_cancel")}
              </Button>
              <Button
                disabled={isSaving || !restoreAsNewSlug}
                onClick={() => {
                  void handleRestoreAsNewSlug();
                }}
              >
                {t("owner_restore")}
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
            <h3 className="text-base font-semibold">{t("owner_delete_modal_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("owner_delete_modal_desc")}</p>
            <div className="mt-4 space-y-1">
              <label htmlFor="delete-forever-confirm" className="text-xs text-muted-foreground">
                {t("owner_delete_modal_label", { slug: deleteForeverPage.slug })}
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
                {t("owner_cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={isSaving || deleteForeverConfirm !== `DELETE ${deleteForeverPage.slug}`}
                onClick={() => {
                  void handleDeleteForever();
                }}
              >
                {t("owner_delete_forever")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
