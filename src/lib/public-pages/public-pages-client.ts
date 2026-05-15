import { BuilderData } from "@/features/builder/types";
import { resolveBuilderDataImagesForPersistence } from "@/lib/local-storage/image-storage";

export type PublicPageListItem = {
  slug: string;
  data: BuilderData;
  updatedAt: string | null;
  ownerAdminId?: string | null;
  owner?: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  } | null;
};

type PublicPageListResponseItem = Omit<PublicPageListItem, "updatedAt"> & {
  updatedAt?: string | null;
  updated_at?: string | null;
};

export type AdminViewer = {
  adminId: string;
  username: string;
  displayName: string;
  role: "owner" | "admin";
  slugLimit?: number;
  active?: boolean;
};

export type AdminQuota = {
  used: number;
  limit: number;
  remaining: number;
};

export type AdminMe = {
  user: AdminViewer;
  quota: AdminQuota;
};

type PublicPageListResponse = {
  pages: PublicPageListResponseItem[];
  viewer?: AdminViewer;
};

const REQUEST_TIMEOUT_MS = 20_000;

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> => {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort();
  }, REQUEST_TIMEOUT_MS);
  const upstreamSignal = init.signal;
  const abortFromUpstream = () => timeoutController.abort();

  if (upstreamSignal?.aborted) {
    timeoutController.abort();
  } else {
    upstreamSignal?.addEventListener("abort", abortFromUpstream, { once: true });
  }

  try {
    return await fetch(input, {
      ...init,
      signal: timeoutController.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
    upstreamSignal?.removeEventListener("abort", abortFromUpstream);
  }
};

const parseErrorMessage = async (response: Response, fallback: string) => {
  try {
    const payload = (await parseJsonResponse(response)) as { error?: unknown } | null;
    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    return fallback;
  }
  return fallback;
};

const parseJsonResponse = async <T = unknown>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }
  return JSON.parse(text) as T;
};

export const listPublicPages = async (signal?: AbortSignal): Promise<PublicPageListItem[]> => {
  const response = await fetchWithTimeout("/api/me/public-pages", {
    method: "GET",
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to list public pages."));
  }

  const payload = await parseJsonResponse<PublicPageListResponse>(response);
  if (!payload || !Array.isArray(payload.pages)) {
    throw new Error("Unexpected public pages response shape.");
  }

  return payload.pages.map((page) => ({
    slug: page.slug,
    data: page.data,
    updatedAt: page.updatedAt ?? page.updated_at ?? null,
    ownerAdminId: page.ownerAdminId ?? null,
    owner: page.owner ?? null,
  }));
};

export const getCurrentAdmin = async (): Promise<AdminMe> => {
  const response = await fetchWithTimeout("/api/admin/me", {
    method: "GET",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load admin session."));
  }
  const payload = await parseJsonResponse<AdminMe>(response);
  if (!payload?.user || !payload.quota) {
    throw new Error("Failed to load admin session.");
  }
  return payload;
};

export const getPublicPageBySlug = async (slug: string): Promise<BuilderData | null> => {
  const response = await fetchWithTimeout(`/api/public-pages/${encodeURIComponent(slug)}`, {
    method: "GET",
    cache: "no-store",
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to load public page."));
  }

  const payload = await parseJsonResponse<{ data?: BuilderData }>(response);
  return payload?.data ?? null;
};

export const upsertPublicPageBySlug = async (slug: string, data: BuilderData): Promise<void> => {
  const durableData = await resolveBuilderDataImagesForPersistence(data);
  const response = await fetchWithTimeout(`/api/public-pages/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: durableData }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to save public page."));
  }
};

export const deletePublicPageBySlug = async (slug: string): Promise<void> => {
  const response = await fetchWithTimeout(`/api/public-pages/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, "Failed to delete public page."));
  }
};
