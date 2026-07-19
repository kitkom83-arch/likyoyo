"use client";

import { LoaderCircle, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/i18n/use-i18n";
import {
  createPageManager,
  listPageManagers,
  removePageManager,
  updatePageManager,
  type AdminMe,
  type PageManagerItem,
} from "@/lib/public-pages/public-pages-client";

type PageTeamCardProps = {
  currentSlug: string;
  adminMe?: AdminMe | null;
};

type StatusMessage = { type: "success" | "error"; text: string };

const MIN_PASSWORD_LENGTH = 8;

export const PageTeamCard = ({ currentSlug, adminMe }: PageTeamCardProps) => {
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);
  const [notSaved, setNotSaved] = useState(false);
  const [managers, setManagers] = useState<PageManagerItem[]>([]);
  const [canManageTeam, setCanManageTeam] = useState(false);
  const [resolvedSlug, setResolvedSlug] = useState(currentSlug);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [newCanManage, setNewCanManage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const statusTimerRef = useRef<number | null>(null);

  const showToast = useCallback((type: StatusMessage["type"], text: string) => {
    if (statusTimerRef.current) {
      window.clearTimeout(statusTimerRef.current);
    }
    setStatusMessage({ type, text });
    statusTimerRef.current = window.setTimeout(() => {
      setStatusMessage(null);
      statusTimerRef.current = null;
    }, 2600);
  }, []);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        window.clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  const mapErrorMessage = useCallback(
    (error: unknown): string => {
      const raw = error instanceof Error ? error.message : "";
      if (raw === "username_taken") {
        return t("page_team_error_username_taken");
      }
      if (raw === "already_manager") {
        return t("page_team_error_username_taken");
      }
      return t("page_team_error_generic");
    },
    [t],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    setLoading(true);
    setNotSaved(false);

    listPageManagers(currentSlug, controller.signal)
      .then((payload) => {
        if (cancelled) {
          return;
        }
        if (!payload) {
          setNotSaved(true);
          setManagers([]);
          setCanManageTeam(false);
          setResolvedSlug(currentSlug);
          return;
        }
        setManagers(payload.managers);
        setCanManageTeam(payload.canManageTeam);
        setResolvedSlug(payload.slug || currentSlug);
      })
      .catch(() => {
        if (cancelled || controller.signal.aborted) {
          return;
        }
        setManagers([]);
        setCanManageTeam(false);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [currentSlug]);

  const handleAdd = useCallback(async () => {
    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();
    if (!trimmedUsername || !trimmedDisplayName || password.length < MIN_PASSWORD_LENGTH) {
      showToast("error", t("page_team_error_fields"));
      return;
    }
    setSubmitting(true);
    try {
      const manager = await createPageManager({
        slug: resolvedSlug,
        username: trimmedUsername,
        displayName: trimmedDisplayName,
        password,
        canManageManagers: newCanManage,
      });
      setManagers((prev) => [manager, ...prev.filter((item) => item.id !== manager.id)]);
      setUsername("");
      setDisplayName("");
      setPassword("");
      setNewCanManage(false);
      showToast("success", t("page_team_toast_added", { name: manager.displayName }));
    } catch (error) {
      showToast("error", mapErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }, [displayName, mapErrorMessage, newCanManage, password, resolvedSlug, showToast, t, username]);

  const handleToggleManage = useCallback(
    async (manager: PageManagerItem, next: boolean) => {
      setBusyId(manager.id);
      try {
        const updated = await updatePageManager({
          slug: resolvedSlug,
          adminUserId: manager.adminUserId,
          canManageManagers: next,
        });
        setManagers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast("success", t("page_team_toast_updated", { name: updated.displayName }));
      } catch (error) {
        showToast("error", mapErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    },
    [mapErrorMessage, resolvedSlug, showToast, t],
  );

  const handleRemove = useCallback(
    async (manager: PageManagerItem) => {
      if (!window.confirm(t("page_team_remove_confirm", { name: manager.displayName }))) {
        return;
      }
      setBusyId(manager.id);
      try {
        await removePageManager(resolvedSlug, manager.adminUserId);
        setManagers((prev) => prev.filter((item) => item.id !== manager.id));
        showToast("success", t("page_team_toast_removed", { name: manager.displayName }));
      } catch (error) {
        showToast("error", mapErrorMessage(error));
      } finally {
        setBusyId(null);
      }
    },
    [mapErrorMessage, resolvedSlug, showToast, t],
  );

  const currentAdminId = adminMe?.user.adminId ?? null;

  return (
    <Card className="border-border/60">
      <CardHeader className="gap-1">
        <CardTitle className="flex items-center gap-2 text-sm">
          <ShieldCheck className="size-4" />
          {t("page_team_title")}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{t("page_team_desc")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {statusMessage ? (
          <p
            className={`text-xs ${statusMessage.type === "error" ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
          >
            {statusMessage.text}
          </p>
        ) : null}

        {loading ? (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-3.5 animate-spin" />
            {t("page_team_loading")}
          </p>
        ) : notSaved ? (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {t("page_team_save_first")}
          </p>
        ) : (
          <>
            {managers.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("page_team_none")}</p>
            ) : (
              <ul className="space-y-2">
                {managers.map((manager) => {
                  const isSelf = currentAdminId !== null && manager.adminUserId === currentAdminId;
                  const rowBusy = busyId === manager.id;
                  return (
                    <li
                      key={manager.id}
                      className="rounded-md border border-border/60 px-3 py-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {manager.displayName}
                            {isSelf ? (
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({t("page_team_you_badge")})
                              </span>
                            ) : null}
                          </p>
                          <p className="truncate text-muted-foreground">/{manager.username}</p>
                          {!manager.active ? (
                            <p className="text-[10px] text-destructive">{t("page_team_inactive")}</p>
                          ) : null}
                        </div>
                        {canManageTeam && !isSelf ? (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                            disabled={rowBusy}
                            onClick={() => handleRemove(manager)}
                            aria-label={t("page_team_remove")}
                          >
                            {rowBusy ? (
                              <LoaderCircle className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                          </Button>
                        ) : null}
                      </div>
                      <label className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">
                          {manager.canManageManagers
                            ? t("page_team_can_manage_on")
                            : t("page_team_can_manage_off")}
                        </span>
                        <Switch
                          size="sm"
                          checked={manager.canManageManagers}
                          disabled={!canManageTeam || rowBusy}
                          onCheckedChange={(next) => handleToggleManage(manager, next)}
                        />
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            {canManageTeam ? (
              <div className="space-y-2 rounded-md border border-dashed border-border/60 p-3">
                <p className="text-xs font-medium text-foreground">{t("page_team_add_title")}</p>
                <Input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder={t("page_team_username")}
                  autoComplete="off"
                  className="h-8 text-xs"
                />
                <Input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder={t("page_team_display_name")}
                  autoComplete="off"
                  className="h-8 text-xs"
                />
                <Input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t("page_team_password")}
                  type="password"
                  autoComplete="new-password"
                  className="h-8 text-xs"
                />
                <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{t("page_team_can_manage_label")}</span>
                  <Switch
                    size="sm"
                    checked={newCanManage}
                    onCheckedChange={(next) => setNewCanManage(next)}
                  />
                </label>
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  disabled={submitting}
                  onClick={handleAdd}
                >
                  {submitting ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <UserPlus className="size-4" />
                  )}
                  {submitting ? t("page_team_adding") : t("page_team_add_button")}
                </Button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">{t("page_team_readonly")}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PageTeamCard;
