"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { EditorPanel } from "@/components/admin/editor-panel";
import { SaveStatus, SaveStatusBar } from "@/components/admin/save-status-bar";
import { MobilePreview } from "@/components/preview/mobile-preview";
import { Button } from "@/components/ui/button";
import { mockBuilderData } from "@/features/builder/mock-data";
import { BuilderData } from "@/features/builder/types";
import { useBuilderStore } from "@/features/builder/store/use-builder-store";
import { useI18n } from "@/i18n/use-i18n";
import {
  clearStaleLocalStorageKeysOnce,
  getActiveEditorSlug,
  setActiveEditorSlug,
  toProfileSlug,
} from "@/lib/local-storage/profile-storage";
import {
  getPublicPageBySlug,
  getCurrentAdmin,
  listPublicPages,
  upsertPublicPageBySlug,
  type AdminMe,
  type PublicPageListItem,
} from "@/lib/public-pages/public-pages-client";

type CollisionDialogState = {
  targetSlug: string;
  existingProfile: BuilderData;
  pendingPayload: BuilderData;
  pendingSnapshot: string;
};

type WorkspaceSwitchOptions = {
  fallbackData?: BuilderData;
  markUnsaved?: boolean;
};

type WorkspaceSwitchResult = "remote" | "fallback";

const getUniqueSlug = (baseSlug: string, existingSlugs: Set<string>) => {
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }
  let index = 2;
  while (existingSlugs.has(`${baseSlug}-${index}`)) {
    index += 1;
  }
  return `${baseSlug}-${index}`;
};

const selectBuilderDataSnapshot = (): BuilderData => {
  const state = useBuilderStore.getState();
  return {
    header: state.header,
    theme: state.theme,
    text: state.text,
    buttonStyle: state.buttonStyle,
    socials: state.socials,
    links: state.links,
  };
};

const normalizeWorkspaceData = (slug: string, payload: BuilderData): BuilderData => {
  const normalizedSlug = toProfileSlug(slug);
  const fallbackPublicHandle =
    typeof payload.header.publicHandle === "string" && payload.header.publicHandle.trim()
      ? payload.header.publicHandle.trim()
      : typeof payload.header.publicUsername === "string" && payload.header.publicUsername.trim()
        ? payload.header.publicUsername.trim()
        : payload.header.username;

  return {
    ...payload,
    header: {
      ...payload.header,
      username: normalizedSlug,
      publicHandle: fallbackPublicHandle,
    },
  };
};

export const AdminShell = () => {
  const { t } = useI18n();
  const storageWarningMessage = t("storage_warning_quota");
  const header = useBuilderStore((state) => state.header);
  const theme = useBuilderStore((state) => state.theme);
  const text = useBuilderStore((state) => state.text);
  const buttonStyle = useBuilderStore((state) => state.buttonStyle);
  const socials = useBuilderStore((state) => state.socials);
  const links = useBuilderStore((state) => state.links);
  const replaceBuilderData = useBuilderStore((state) => state.replaceBuilderData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [savedProfiles, setSavedProfiles] = useState<PublicPageListItem[]>([]);
  const [savedPagesError, setSavedPagesError] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState<{
    type: "error" | "info";
    text: string;
  } | null>(null);
  const [collisionDialog, setCollisionDialog] = useState<CollisionDialogState | null>(null);
  const [currentEditorSlug, setCurrentEditorSlug] = useState(toProfileSlug(header.username));
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);
  const [isSwitchingWorkspace, setIsSwitchingWorkspace] = useState(false);
  const [workspaceHydrationKey, setWorkspaceHydrationKey] = useState(0);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [adminMe, setAdminMe] = useState<AdminMe | null>(null);

  const workspaceSlugRef = useRef<string>(toProfileSlug(header.username));
  const adminScopeKeyRef = useRef<string | null>(null);
  const accessibleSlugsRef = useRef<Set<string>>(new Set());
  const lastSavedSnapshotRef = useRef<string>("");
  const hasInitializedRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const saveOperationTimerRef = useRef<number | null>(null);
  const workspaceLoadTokenRef = useRef(0);
  const isSwitchingWorkspaceRef = useRef(false);
  const pendingAutosaveRef = useRef(false);

  const builderData = useMemo<BuilderData>(
    () => ({ header, theme, text, buttonStyle, socials, links }),
    [buttonStyle, header, links, socials, text, theme],
  );

  const refreshSavedPages = useCallback(async () => {
    try {
      const pages = await listPublicPages();
      accessibleSlugsRef.current = new Set(pages.map((page) => page.slug));
      setSavedProfiles(pages);
      setSavedPagesError(null);
      setAdminNotice((current) =>
        current?.text === t("save_status_load_error") ? null : current,
      );
      return pages;
    } catch (error) {
      console.error("[admin-shell] saved pages refresh failed", error);
      const message = t("save_status_load_error");
      setSavedPagesError(message);
      setAdminNotice({ type: "error", text: message });
      return null;
    }
  }, [t]);

  const refreshAdminContext = useCallback(async () => {
    try {
      const currentAdmin = await getCurrentAdmin();
      adminScopeKeyRef.current = currentAdmin.user.adminId;
      setAdminMe(currentAdmin);
      return currentAdmin;
    } catch (error) {
      console.error("[admin-shell] admin context refresh failed", error);
      setAdminMe(null);
      return null;
    }
  }, []);

  const clearPendingSaves = useCallback(() => {
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    if (saveOperationTimerRef.current) {
      window.clearTimeout(saveOperationTimerRef.current);
      saveOperationTimerRef.current = null;
    }
  }, []);

  const applyWorkspaceIdentity = useCallback(
    (slug: string, baselineData?: BuilderData) => {
      const normalized = toProfileSlug(slug);
      clearPendingSaves();
      workspaceSlugRef.current = normalized;
      setCurrentEditorSlug(normalized);
      setActiveEditorSlug(normalized, adminScopeKeyRef.current);
      const snapshot = JSON.stringify(baselineData ?? selectBuilderDataSnapshot());
      lastSavedSnapshotRef.current = snapshot;
      pendingAutosaveRef.current = false;
      setSaveStatus("saved");
      setCollisionDialog(null);
      setWorkspaceHydrationKey((value) => value + 1);
    },
    [clearPendingSaves],
  );

  const loadWorkspaceFromSlug = useCallback(
    async (
      slug: string,
      options: WorkspaceSwitchOptions = {},
    ): Promise<WorkspaceSwitchResult> => {
      const normalized = toProfileSlug(slug);
      if (
        !options.fallbackData &&
        adminMe?.user.role === "admin" &&
        !accessibleSlugsRef.current.has(normalized)
      ) {
        setAdminNotice({ type: "error", text: "This page belongs to another admin." });
        return "fallback";
      }
      const loadToken = workspaceLoadTokenRef.current + 1;
      workspaceLoadTokenRef.current = loadToken;
      const completeSwitch = () => {
        isSwitchingWorkspaceRef.current = false;
        setIsSwitchingWorkspace(false);
      };

      clearPendingSaves();
      isSwitchingWorkspaceRef.current = true;
      setIsSwitchingWorkspace(true);
      workspaceSlugRef.current = normalized;
      setCurrentEditorSlug(normalized);
      setActiveEditorSlug(normalized, adminScopeKeyRef.current);

      let remoteData: BuilderData | null = null;
      try {
        remoteData = await getPublicPageBySlug(normalized);
      } catch (error) {
        console.error("[admin-shell] load workspace failed", error);
        setAdminNotice({ type: "error", text: t("save_status_load_error") });
        completeSwitch();
        throw error;
      }

      if (workspaceLoadTokenRef.current !== loadToken) {
        completeSwitch();
        return "fallback";
      }

      if (remoteData) {
        const hydratedRemote = normalizeWorkspaceData(normalized, remoteData);
        replaceBuilderData(hydratedRemote);
        applyWorkspaceIdentity(normalized, hydratedRemote);
        setLastSavedAt(new Date());
        setAdminNotice(null);
        completeSwitch();
        return "remote";
      }

      const fallbackSource = options.fallbackData ?? mockBuilderData;
      const fallbackHydrated = normalizeWorkspaceData(normalized, fallbackSource);
      replaceBuilderData(fallbackHydrated);
      applyWorkspaceIdentity(normalized, fallbackHydrated);
      setLastSavedAt(null);
      if (options.markUnsaved) {
        lastSavedSnapshotRef.current = "";
        pendingAutosaveRef.current = true;
        setSaveStatus("unsaved");
      }
      completeSwitch();
      return "fallback";
    },
    [adminMe?.user.role, applyWorkspaceIdentity, clearPendingSaves, replaceBuilderData, t],
  );

  const handleWorkspaceSwitchRequest = useCallback(
    async (slug: string, options?: WorkspaceSwitchOptions) =>
      loadWorkspaceFromSlug(slug, options),
    [loadWorkspaceFromSlug],
  );

  const persistProfile = useCallback(
    (payload: BuilderData, snapshot: string) => {
      if (isSwitchingWorkspaceRef.current) {
        return;
      }
      if (saveOperationTimerRef.current) {
        window.clearTimeout(saveOperationTimerRef.current);
      }

      const targetSlug = workspaceSlugRef.current;
      setCollisionDialog(null);
      setSaveStatus("saving");
      saveOperationTimerRef.current = window.setTimeout(() => {
        void (async () => {
          if (isSwitchingWorkspaceRef.current || targetSlug !== workspaceSlugRef.current) {
            setSaveStatus("saved");
            saveOperationTimerRef.current = null;
            return;
          }
          try {
            const payloadForSave: BuilderData = {
              ...payload,
              header: {
                ...payload.header,
                username: targetSlug,
                publicHandle:
                  payload.header.publicHandle?.trim() ||
                  payload.header.publicUsername?.trim() ||
                  payload.header.username,
              },
            };
            await upsertPublicPageBySlug(targetSlug, payloadForSave);
            workspaceSlugRef.current = targetSlug;
            setCurrentEditorSlug(targetSlug);
            setActiveEditorSlug(targetSlug, adminScopeKeyRef.current);
            lastSavedSnapshotRef.current = snapshot;
            pendingAutosaveRef.current = false;
            setLastSavedAt(new Date());
            setSaveStatus("saved");
            setAdminNotice(null);
            window.dispatchEvent(new Event("storage"));
            setProfileRefreshKey((value) => value + 1);
            void refreshSavedPages();
            void refreshAdminContext();
          } catch (error) {
            console.error("[admin-shell] save failed", error);
            setAdminNotice({ type: "error", text: t("save_status_save_error") });
            pendingAutosaveRef.current = true;
            setSaveStatus("unsaved");
          } finally {
            saveOperationTimerRef.current = null;
          }
        })();
      }, 180);
    },
    [refreshAdminContext, refreshSavedPages, t],
  );

  const handleSaveNow = useCallback(() => {
    if (isSwitchingWorkspaceRef.current) {
      return;
    }
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    const snapshot = JSON.stringify(builderData);
    persistProfile(builderData, snapshot);
  }, [builderData, persistProfile]);

  const handleLogout = useCallback(() => {
    void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      window.location.href = "/admin/login";
    });
  }, []);

  useEffect(() => {
    let syncFrameId: number | null = null;
    let canceled = false;

    clearStaleLocalStorageKeysOnce();

    const initialize = async () => {
      const currentAdmin = await refreshAdminContext();
      const scopeKey = currentAdmin?.user.adminId ?? null;
      const activeSlug = getActiveEditorSlug(scopeKey);
      const pages = await refreshSavedPages();
      const normalizedActiveSlug = activeSlug ? toProfileSlug(activeSlug) : null;
      const hasActiveInRemotePages = Boolean(
        normalizedActiveSlug && pages?.some((page) => page.slug === normalizedActiveSlug),
      );
      const resolvedSlug =
        (hasActiveInRemotePages ? normalizedActiveSlug : pages?.[0]?.slug) ?? workspaceSlugRef.current;
      if (canceled) {
        return;
      }
      try {
        await loadWorkspaceFromSlug(resolvedSlug);
      } catch {
        // Error notice is set by loadWorkspaceFromSlug; keep the editor usable.
      }
      if (canceled) {
        return;
      }
      syncFrameId = window.requestAnimationFrame(() => {
        setIsWorkspaceReady(true);
      });
    };

    void initialize();

    const onStorage = () => {
      setProfileRefreshKey((value) => value + 1);
      void refreshSavedPages();
    };
    const onStorageWarning = () => {
      setStorageWarning(storageWarningMessage);
      window.setTimeout(() => {
        setStorageWarning((current) =>
          current === storageWarningMessage ? null : current,
        );
      }, 2600);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("linkbio-storage-warning", onStorageWarning);
    const intervalId = window.setInterval(onStorage, 2500);

    return () => {
      canceled = true;
      if (syncFrameId) {
        window.cancelAnimationFrame(syncFrameId);
      }
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("linkbio-storage-warning", onStorageWarning);
      window.clearInterval(intervalId);
      clearPendingSaves();
    };
  }, [clearPendingSaves, loadWorkspaceFromSlug, refreshAdminContext, refreshSavedPages, storageWarningMessage]);

  useEffect(() => {
    const activeSlug = getActiveEditorSlug(adminScopeKeyRef.current);
    const normalized = activeSlug ? toProfileSlug(activeSlug) : null;
    if (normalized && normalized !== workspaceSlugRef.current && !isSwitchingWorkspaceRef.current) {
      const frameId = window.requestAnimationFrame(() => {
        void loadWorkspaceFromSlug(normalized).catch(() => undefined);
      });
      return () => window.cancelAnimationFrame(frameId);
    }
  }, [loadWorkspaceFromSlug, profileRefreshKey]);

  useEffect(() => {
    if (!isWorkspaceReady || isSwitchingWorkspace) {
      return;
    }

    const snapshot = JSON.stringify(builderData);

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      if (snapshot === lastSavedSnapshotRef.current) {
        return;
      }
      const initFrameId = window.requestAnimationFrame(() => {
        persistProfile(builderData, snapshot);
      });
      return () => {
        window.cancelAnimationFrame(initFrameId);
      };
    }

    if (snapshot === lastSavedSnapshotRef.current && !pendingAutosaveRef.current) {
      return;
    }

    if (saveOperationTimerRef.current) {
      window.clearTimeout(saveOperationTimerRef.current);
      saveOperationTimerRef.current = null;
    }

    const frameId = window.requestAnimationFrame(() => {
      setSaveStatus("unsaved");
    });

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      persistProfile(builderData, snapshot);
      autosaveTimerRef.current = null;
    }, 800);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [builderData, isSwitchingWorkspace, isWorkspaceReady, persistProfile]);

  const slugCollisionWarning = useMemo(() => {
    void profileRefreshKey;
    void savedProfiles;
    return null;
  }, [profileRefreshKey, savedProfiles]);

  const handleLoadExistingRoute = () => {
    if (!collisionDialog) {
      return;
    }
    const loaded = collisionDialog.existingProfile;
    const normalizedLoaded = normalizeWorkspaceData(loaded.header.username, loaded);
    replaceBuilderData(normalizedLoaded);
    const nextSlug = toProfileSlug(loaded.header.username);
    applyWorkspaceIdentity(nextSlug, normalizedLoaded);
    setLastSavedAt(new Date());
    setCollisionDialog(null);
  };

  const handleDuplicateIntoNewSlug = () => {
    if (!collisionDialog) {
      return;
    }
    const existingSlugs = new Set(savedProfiles.map((item) => item.slug));
    const duplicateSlug = getUniqueSlug(`${collisionDialog.targetSlug}-copy`, existingSlugs);
    const duplicated: BuilderData = {
      ...collisionDialog.pendingPayload,
      header: {
        ...collisionDialog.pendingPayload.header,
        username: duplicateSlug,
        publicHandle:
          collisionDialog.pendingPayload.header.publicHandle?.trim() ||
          collisionDialog.pendingPayload.header.publicUsername?.trim() ||
          collisionDialog.pendingPayload.header.username,
      },
    };
    replaceBuilderData(duplicated);
    applyWorkspaceIdentity(duplicateSlug, duplicated);
    setSaveStatus("unsaved");
    setCollisionDialog(null);
  };

  return (
    <>
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#e6edf9,_transparent_35%),radial-gradient(circle_at_top_right,_#e8f4ed,_transparent_32%),linear-gradient(to_bottom,_var(--background),_var(--muted))] px-3 py-4 sm:px-5 sm:py-5 lg:px-8">
      <div className="mx-auto grid max-w-[1700px] gap-3 lg:gap-4 xl:gap-5 lg:grid-cols-12">
        <div className="lg:col-span-3 xl:col-span-2">
          <div className="lg:sticky lg:top-4 rounded-3xl border border-border/60 bg-gradient-to-b from-background/95 to-muted/35 p-2 shadow-sm backdrop-blur">
            <AdminSidebar
              currentSlug={currentEditorSlug}
              adminMe={adminMe}
              isSwitchingWorkspace={isSwitchingWorkspace}
              onSwitchWorkspace={handleWorkspaceSwitchRequest}
              savedProfiles={savedProfiles}
              savedPagesError={savedPagesError}
              onRefreshSavedPages={refreshSavedPages}
            />
          </div>
        </div>

        <div className="lg:col-span-6 xl:col-span-6">
          <div className="rounded-3xl border border-border/60 bg-gradient-to-b from-background/95 to-muted/25 p-2.5 shadow-sm sm:p-3.5">
            <SaveStatusBar
              status={saveStatus}
              lastSavedAt={lastSavedAt}
              onSaveNow={handleSaveNow}
              onLogout={handleLogout}
              isSwitchingWorkspace={isSwitchingWorkspace}
            />
            {adminNotice ? (
              <div
                className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                  adminNotice.type === "error"
                    ? "border-red-300 bg-red-50 text-red-800"
                    : "border-sky-300 bg-sky-50 text-sky-800"
                }`}
              >
                {adminNotice.text}
              </div>
            ) : null}
            <div className={isSwitchingWorkspace ? "pointer-events-none opacity-65" : ""}>
              <EditorPanel key={workspaceHydrationKey} slugCollisionWarning={slugCollisionWarning} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 xl:col-span-4">
          <div className="lg:sticky lg:top-4 rounded-3xl border border-border/60 bg-gradient-to-b from-background/95 to-muted/20 p-2 shadow-sm">
            <MobilePreview
              key={workspaceHydrationKey}
              data={builderData}
              routeSlug={currentEditorSlug}
              mode="admin"
            />
          </div>
        </div>
      </div>
      </main>
      {collisionDialog ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 shadow-2xl"
          >
            <h3 className="text-base font-semibold">{t("collision_title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("collision_line_1", { slug: collisionDialog.targetSlug })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("collision_line_2")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("collision_line_3")}
            </p>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" onClick={handleLoadExistingRoute}>
                {t("collision_load_existing")}
              </Button>
              <Button variant="outline" onClick={handleDuplicateIntoNewSlug}>
                {t("collision_duplicate_new")}
              </Button>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setCollisionDialog(null);
                }}
              >
                {t("collision_cancel")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
      {storageWarning ? (
        <div className="fixed right-4 bottom-4 z-[96] rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 shadow-lg">
          {storageWarning}
        </div>
      ) : null}
    </>
  );
};
