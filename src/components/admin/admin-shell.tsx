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
import {
  splitPublicPagePath,
} from "@/lib/public-pages/paths";

type CollisionDialogState = {
  targetSlug: string;
  existingProfile: BuilderData;
  pendingPayload: BuilderData;
  pendingSnapshot: string;
};

type WorkspaceSwitchOptions = {
  fallbackData?: BuilderData;
  markUnsaved?: boolean;
  showSwitchingState?: boolean;
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

const SAFE_PUBLIC_HANDLE_PATTERN = /^[a-z0-9._-]{1,119}$/i;

const getPageSlugForPublicPath = (publicPath: string): string => {
  const pageSlug = splitPublicPagePath(publicPath).pageSlug;
  return pageSlug || toProfileSlug(publicPath);
};

const getLastPathSegment = (value: string): string => {
  const parts = toProfileSlug(value).split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
};

const isDuplicatedOwnerHandle = (value: string, publicPath: string): boolean => {
  const { ownerUsername, pageSlug } = splitPublicPagePath(publicPath);
  if (!ownerUsername) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  const normalizedPageSlug = getLastPathSegment(pageSlug);
  return (
    normalized === ownerUsername ||
    normalized === `${ownerUsername}-${normalizedPageSlug}` ||
    normalized === `${ownerUsername}_${normalizedPageSlug}` ||
    normalized === `${ownerUsername}.${normalizedPageSlug}`
  );
};

const normalizePublicHandleCandidate = (
  value: string | null | undefined,
  publicPath: string,
): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (!SAFE_PUBLIC_HANDLE_PATTERN.test(trimmed) || isDuplicatedOwnerHandle(trimmed, publicPath)) {
    return null;
  }
  return trimmed;
};

const normalizeExplicitPublicHandle = (publicPath: string, payload: BuilderData): string | null => {
  if (typeof payload.header.publicHandle !== "string") {
    return null;
  }
  const trimmed = payload.header.publicHandle.trim();
  if (!trimmed) {
    return "";
  }
  return normalizePublicHandleCandidate(trimmed, publicPath) ?? "";
};

const getPublicHandleFallback = (publicPath: string, payload: BuilderData): string => {
  const explicitHandle = normalizeExplicitPublicHandle(publicPath, payload);
  if (explicitHandle !== null) {
    return explicitHandle;
  }
  const pageSlug = getPageSlugForPublicPath(publicPath);
  const pageHandle = getLastPathSegment(pageSlug);
  const candidates = [payload.header.publicUsername, pageHandle];
  return (
    candidates
      .map((value) => normalizePublicHandleCandidate(value, publicPath))
      .find((value): value is string => Boolean(value)) ?? "page"
  );
};

const normalizeWorkspaceData = (slug: string, payload: BuilderData): BuilderData => {
  const normalizedSlug = toProfileSlug(slug);
  const pageSlug = getPageSlugForPublicPath(normalizedSlug);
  const fallbackPublicHandle = getPublicHandleFallback(normalizedSlug, payload);

  return {
    ...payload,
    header: {
      ...payload.header,
      username: pageSlug,
      publicHandle: fallbackPublicHandle,
    },
  };
};

const normalizePayloadForPublicPath = (publicPath: string, payload: BuilderData): BuilderData => {
  const normalizedPublicPath = toProfileSlug(publicPath);
  const pageSlug = getPageSlugForPublicPath(normalizedPublicPath);
  const hasExplicitPublicHandle = typeof payload.header.publicHandle === "string";
  return {
    ...payload,
    header: {
      ...payload.header,
      username: pageSlug,
      publicHandle: getPublicHandleFallback(normalizedPublicPath, payload),
      publicUsername: hasExplicitPublicHandle ? undefined : payload.header.publicUsername,
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
  const adminRoleRef = useRef<AdminMe["user"]["role"] | null>(null);
  const accessibleSlugsRef = useRef<Set<string>>(new Set());
  const lastSavedSnapshotRef = useRef<string>("");
  const hasInitializedRef = useRef(false);
  const hasStartedInitialLoadRef = useRef(false);
  const hasCompletedInitialLoadRef = useRef(false);
  const autosaveTimerRef = useRef<number | null>(null);
  const saveOperationTimerRef = useRef<number | null>(null);
  const savedPagesRequestRef = useRef<Promise<PublicPageListItem[] | null> | null>(null);
  const savedPagesAbortRef = useRef<AbortController | null>(null);
  const workspaceLoadTokenRef = useRef(0);
  const isSwitchingWorkspaceRef = useRef(false);
  const pendingAutosaveRef = useRef(false);
  const tRef = useRef(t);

  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const builderData = useMemo<BuilderData>(
    () => ({ header, theme, text, buttonStyle, socials, links }),
    [buttonStyle, header, links, socials, text, theme],
  );

  const refreshSavedPages = useCallback(async () => {
    if (savedPagesRequestRef.current) {
      return savedPagesRequestRef.current;
    }

    const controller = new AbortController();
    savedPagesAbortRef.current = controller;
    const request = (async () => {
      try {
        const pages = await listPublicPages(controller.signal);
        accessibleSlugsRef.current = new Set(pages.map((page) => page.slug));
        setSavedProfiles(pages);
        setSavedPagesError(null);
        setAdminNotice((current) =>
          current?.text === tRef.current("save_status_load_error") ? null : current,
        );
        return pages;
      } catch (error) {
        if (controller.signal.aborted) {
          return null;
        }
        console.error("[admin-shell] saved pages refresh failed", error);
        const message = tRef.current("save_status_load_error");
        setSavedPagesError(message);
        setAdminNotice({ type: "error", text: message });
        return null;
      } finally {
        if (savedPagesAbortRef.current === controller) {
          savedPagesRequestRef.current = null;
          savedPagesAbortRef.current = null;
        }
      }
    })();
    savedPagesRequestRef.current = request;
    return request;
  }, []);

  const refreshAdminContext = useCallback(async () => {
    try {
      const currentAdmin = await getCurrentAdmin();
      adminScopeKeyRef.current = currentAdmin.user.adminId;
      adminRoleRef.current = currentAdmin.user.role;
      setAdminMe(currentAdmin);
      return currentAdmin;
    } catch (error) {
      console.error("[admin-shell] admin context refresh failed", error);
      adminScopeKeyRef.current = null;
      adminRoleRef.current = null;
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

  useEffect(() => {
    return () => {
      savedPagesAbortRef.current?.abort();
      clearPendingSaves();
    };
  }, [clearPendingSaves]);

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
        adminRoleRef.current === "admin" &&
        !accessibleSlugsRef.current.has(normalized)
      ) {
        setAdminNotice({ type: "error", text: "This page belongs to another admin." });
        return "fallback";
      }
      const loadToken = workspaceLoadTokenRef.current + 1;
      const showSwitchingState = options.showSwitchingState ?? true;
      workspaceLoadTokenRef.current = loadToken;
      clearPendingSaves();
      if (showSwitchingState) {
        isSwitchingWorkspaceRef.current = true;
        setIsSwitchingWorkspace(true);
      }
      workspaceSlugRef.current = normalized;
      setCurrentEditorSlug(normalized);
      setActiveEditorSlug(normalized, adminScopeKeyRef.current);

      let remoteData: BuilderData | null = null;
      try {
        remoteData = await getPublicPageBySlug(normalized);

        if (workspaceLoadTokenRef.current !== loadToken) {
          return "fallback";
        }

        if (remoteData) {
          const hydratedRemote = normalizeWorkspaceData(normalized, remoteData);
          replaceBuilderData(hydratedRemote);
          applyWorkspaceIdentity(normalized, hydratedRemote);
          setLastSavedAt(new Date());
          setAdminNotice(null);
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
        return "fallback";
      } catch (error) {
        console.error("[admin-shell] load workspace failed", error);
        setAdminNotice({ type: "error", text: tRef.current("save_status_load_error") });
        throw error;
      } finally {
        if (showSwitchingState && workspaceLoadTokenRef.current === loadToken) {
          isSwitchingWorkspaceRef.current = false;
          setIsSwitchingWorkspace(false);
        }
      }
    },
    [applyWorkspaceIdentity, clearPendingSaves, replaceBuilderData],
  );

  const handleWorkspaceSwitchRequest = useCallback(
    async (slug: string, options?: WorkspaceSwitchOptions) =>
      loadWorkspaceFromSlug(slug, options),
    [loadWorkspaceFromSlug],
  );

  const executeProfileSave = useCallback(
    async (targetSlug: string, payload: BuilderData, snapshot: string) => {
      try {
        if (isSwitchingWorkspaceRef.current || targetSlug !== workspaceSlugRef.current) {
          setSaveStatus("saved");
          return;
        }

        const payloadForSave = normalizePayloadForPublicPath(targetSlug, payload);
        await upsertPublicPageBySlug(targetSlug, payloadForSave);
        workspaceSlugRef.current = targetSlug;
        setCurrentEditorSlug(targetSlug);
        setActiveEditorSlug(targetSlug, adminScopeKeyRef.current);
        lastSavedSnapshotRef.current = snapshot;
        pendingAutosaveRef.current = false;
        setLastSavedAt(new Date());
        setSaveStatus("saved");
        setAdminNotice(null);
        await refreshSavedPages();
        void refreshAdminContext();
      } catch (error) {
        console.error("[admin-shell] save failed", error);
        setAdminNotice({ type: "error", text: tRef.current("save_status_save_error") });
        pendingAutosaveRef.current = true;
        setSaveStatus("unsaved");
      } finally {
        saveOperationTimerRef.current = null;
      }
    },
    [refreshAdminContext, refreshSavedPages],
  );

  const persistProfile = useCallback(
    (payload: BuilderData, snapshot: string, options: { immediate?: boolean } = {}) => {
      if (isSwitchingWorkspaceRef.current) {
        return;
      }
      if (saveOperationTimerRef.current) {
        window.clearTimeout(saveOperationTimerRef.current);
        saveOperationTimerRef.current = null;
      }

      const targetSlug = workspaceSlugRef.current;
      setCollisionDialog(null);
      setSaveStatus("saving");

      if (options.immediate) {
        void executeProfileSave(targetSlug, payload, snapshot);
        return;
      }

      saveOperationTimerRef.current = window.setTimeout(() => {
        void executeProfileSave(targetSlug, payload, snapshot);
      }, 180);
    },
    [executeProfileSave],
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
    persistProfile(builderData, snapshot, { immediate: true });
  }, [builderData, persistProfile]);

  const handleLogout = useCallback(() => {
    void fetch("/api/admin/logout", { method: "POST" }).finally(() => {
      window.location.href = "/admin/login";
    });
  }, []);

  useEffect(() => {
    if (hasCompletedInitialLoadRef.current || hasStartedInitialLoadRef.current) {
      return;
    }
    hasStartedInitialLoadRef.current = true;

    let syncFrameId: number | null = null;
    let canceled = false;

    clearStaleLocalStorageKeysOnce();

    const initialize = async () => {
      const currentAdmin = await refreshAdminContext();
      if (canceled) {
        return;
      }
      if (!currentAdmin) {
        syncFrameId = window.requestAnimationFrame(() => {
          hasCompletedInitialLoadRef.current = true;
          setIsWorkspaceReady(true);
        });
        return;
      }

      const scopeKey = currentAdmin?.user.adminId ?? null;
      const activeSlug = getActiveEditorSlug(scopeKey);
      const pages = await refreshSavedPages();
      const normalizedActiveSlug = activeSlug ? toProfileSlug(activeSlug) : null;
      const hasActiveInRemotePages = Boolean(
        normalizedActiveSlug &&
          pages?.some((page) => page.slug === normalizedActiveSlug),
      );
      const resolvedSlug =
        (hasActiveInRemotePages ? normalizedActiveSlug : pages?.[0]?.slug) ?? workspaceSlugRef.current;
      if (canceled) {
        return;
      }
      try {
        await loadWorkspaceFromSlug(resolvedSlug, { showSwitchingState: false });
      } catch {
        // Error notice is set by loadWorkspaceFromSlug; keep the editor usable.
      }
      if (canceled) {
        return;
      }
      syncFrameId = window.requestAnimationFrame(() => {
        hasCompletedInitialLoadRef.current = true;
        setIsWorkspaceReady(true);
      });
    };

    void initialize();

    return () => {
      canceled = true;
      if (!hasCompletedInitialLoadRef.current) {
        hasStartedInitialLoadRef.current = false;
      }
      if (syncFrameId) {
        window.cancelAnimationFrame(syncFrameId);
      }
    };
  }, [loadWorkspaceFromSlug, refreshAdminContext, refreshSavedPages]);

  useEffect(() => {
    const onStorageWarning = () => {
      setStorageWarning(storageWarningMessage);
      window.setTimeout(() => {
        setStorageWarning((current) =>
          current === storageWarningMessage ? null : current,
        );
      }, 2600);
    };
    window.addEventListener("linkbio-storage-warning", onStorageWarning);

    return () => {
      window.removeEventListener("linkbio-storage-warning", onStorageWarning);
    };
  }, [storageWarningMessage]);

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
    void savedProfiles;
    return null;
  }, [savedProfiles]);

  const handleLoadExistingRoute = () => {
    if (!collisionDialog) {
      return;
    }
    const loaded = collisionDialog.existingProfile;
    const normalizedLoaded = normalizeWorkspaceData(collisionDialog.targetSlug, loaded);
    replaceBuilderData(normalizedLoaded);
    const nextSlug = toProfileSlug(collisionDialog.targetSlug);
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
        username: getPageSlugForPublicPath(duplicateSlug),
        publicHandle: getPublicHandleFallback(duplicateSlug, collisionDialog.pendingPayload),
      },
    };
    replaceBuilderData(duplicated);
    applyWorkspaceIdentity(duplicateSlug, duplicated);
    setSaveStatus("unsaved");
    setCollisionDialog(null);
  };

  const currentRouteParts = splitPublicPagePath(currentEditorSlug);
  const currentOwnerUsername = currentRouteParts.ownerUsername || adminMe?.user.username || "-";
  const currentPageSlug = currentRouteParts.pageSlug || currentEditorSlug;
  const currentFullPublicRoute = `/${currentEditorSlug}`;
  const isSaveDisabled = isSwitchingWorkspace || !isWorkspaceReady;

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
              isSwitchingWorkspace={isSaveDisabled}
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
            {!isWorkspaceReady ? (
              <div className="mb-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
                Loading saved workspace data in the background.
              </div>
            ) : null}
            <div className={isSwitchingWorkspace ? "pointer-events-none opacity-65" : ""}>
              <div className="mb-3 grid gap-2 rounded-xl border border-border/60 bg-background/70 p-3 text-xs text-muted-foreground sm:grid-cols-3">
                <div>
                  <span className="block font-medium text-foreground">Workspace/owner</span>
                  <span>{currentOwnerUsername}</span>
                </div>
                <div>
                  <span className="block font-medium text-foreground">Page slug</span>
                  <span>{currentPageSlug}</span>
                </div>
                <div>
                  <span className="block font-medium text-foreground">Full public route</span>
                  <span>{currentFullPublicRoute}</span>
                </div>
              </div>
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
