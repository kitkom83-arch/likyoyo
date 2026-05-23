import { createClient } from "@supabase/supabase-js";

import { builderDataSchema } from "@/features/builder/schema";
import { BuilderData } from "@/features/builder/types";
import { normalizeBuilderData } from "@/features/builder/utils";
import { type AdminSession } from "@/lib/server/admin-auth";
import { getAdminUserById, type AdminUser } from "@/lib/server/admin-users-store";
import { validateCriticalServerEnv } from "@/lib/server/env-validation";
import {
  buildNestedPublicPagePath,
  isSafeAdminUsername,
  isSafePublicPageSlug,
  normalizePublicPageSlug,
  splitPublicPagePath,
} from "@/lib/public-pages/paths";

export type PublicPageOwner = {
  id: string;
  username: string;
  displayName: string;
  role: string;
};

export type PublicPageRow = {
  slug: string;
  data: BuilderData;
  updated_at?: string | null;
  owner_admin_id?: string | null;
  owner?: PublicPageOwner | null;
};

export type PublicPageListRow = Omit<PublicPageRow, "data"> & {
  displayName: string;
};

export type DeletedPublicPageRow = {
  id: string;
  slug: string;
  displayName: string;
  owner_admin_id: string | null;
  original_updated_at: string | null;
  deleted_at: string;
  deleted_reason: string | null;
  deleted_by_admin_id: string | null;
  owner: PublicPageOwner | null;
  deletedBy: PublicPageOwner | null;
};

type PublicPageDbRow = {
  slug: string;
  data: BuilderData;
  updated_at?: string | null;
  owner_admin_id?: string | null;
};

type AdminUserLookupRow = {
  id: string;
  username: string;
  display_name: string;
  role: string;
  active?: boolean;
};

type ActivePublicPageArchiveSourceRow = {
  slug: string;
  data: unknown;
  updated_at?: string | null;
  owner_admin_id?: string | null;
};

type DeletedPublicPageDbRow = {
  id: string;
  slug: string;
  data: unknown;
  owner_admin_id?: string | null;
  original_updated_at?: string | null;
  deleted_at: string;
  deleted_by_admin_id?: string | null;
  deleted_reason?: string | null;
};

export type PublicPageMutationResult =
  | { ok: true; created?: boolean }
  | { ok: false; status: 400 | 403 | 404 | 409; error: string };

export type DeletedPublicPageMutationResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404 | 409; error: string };

const PUBLIC_PAGES_TABLE = "public_pages";
const PUBLIC_PAGES_DELETED_TABLE = "public_pages_deleted";
export const PROTECTED_PUBLIC_SLUGS = new Set(["110"]);

const getSupabaseServerConfig = () => {
  const env = validateCriticalServerEnv();
  const url = env.nextPublicSupabaseUrl;
  const anonKey = env.nextPublicSupabaseAnonKey;
  const serviceRoleKey = env.supabaseServiceRoleKey;

  return {
    url,
    anonKey,
    serviceRoleKey,
    isReady: Boolean(url && anonKey && serviceRoleKey),
  };
};

const getSupabaseAdminClient = () => {
  const config = getSupabaseServerConfig();
  if (!config.isReady) {
    throw new Error("Supabase env is incomplete for public page persistence.");
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const isMissingOwnerAdminIdError = (error: { code?: string; message?: string } | null): boolean =>
  error?.code === "42703" && /owner_admin_id/i.test(error.message ?? "");

const isMissingAdminUsersError = (error: { code?: string; message?: string } | null): boolean =>
  error?.code === "PGRST205" && /admin_users/i.test(error.message ?? "");

const parseStoredPublicPageData = (rawData: unknown, slug: string): BuilderData | null => {
  const parsed = builderDataSchema.safeParse(rawData);
  if (!parsed.success) {
    console.error("[public-pages] Stored profile payload is invalid", {
      slug,
      details: parsed.error.issues.map((issue) => ({
        path: issue.path.length ? issue.path.join(".") : "(root)",
        message: issue.message,
      })),
    });
    return null;
  }
  return normalizeBuilderData(parsed.data as BuilderData);
};

const mapAdminUserToOwner = (user: AdminUser | AdminUserLookupRow): PublicPageOwner => ({
  id: user.id,
  username: user.username,
  displayName: "displayName" in user ? user.displayName : user.display_name,
  role: user.role,
});

const mapPublicPageListRow = (
  row: PublicPageDbRow,
  owner: PublicPageOwner | null = null,
): PublicPageListRow => ({
  slug: row.slug,
  displayName: getDisplayNameFromStoredData(row.data) || row.slug,
  updated_at: row.updated_at ?? null,
  owner_admin_id: row.owner_admin_id ?? null,
  owner,
});

const normalizePublicSlug = normalizePublicPageSlug;

const isOwnerActive = (owner: Pick<AdminUser, "active"> | AdminUserLookupRow | null): boolean =>
  owner?.active !== false;

const getAdminUserLookupById = async (id: string | null | undefined): Promise<AdminUser | null> => {
  if (!id) {
    return null;
  }
  try {
    return await getAdminUserById(id);
  } catch (error) {
    if (isMissingAdminUsersError(error as { code?: string; message?: string })) {
      return null;
    }
    throw error;
  }
};

const getAdminUserLookupsByIds = async (
  client: ReturnType<typeof getSupabaseAdminClient>,
  ids: Array<string | null | undefined>,
): Promise<Map<string, AdminUserLookupRow>> => {
  const uniqueIds = Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
  if (uniqueIds.length === 0) {
    return new Map();
  }

  const { data, error } = await client
    .from("admin_users")
    .select("id,username,display_name,role,active")
    .in("id", uniqueIds)
    .returns<AdminUserLookupRow[]>();

  if (error) {
    if (isMissingAdminUsersError(error)) {
      return new Map();
    }
    throw error;
  }

  return new Map((data ?? []).map((row) => [row.id, row]));
};

const getDisplayNameFromStoredData = (rawData: unknown): string => {
  if (
    rawData &&
    typeof rawData === "object" &&
    "header" in rawData &&
    rawData.header &&
    typeof rawData.header === "object" &&
    "displayName" in rawData.header &&
    typeof rawData.header.displayName === "string"
  ) {
    return rawData.header.displayName.trim();
  }
  return "";
};

const retargetStoredDataSlug = (rawData: unknown, slug: string): unknown => {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return rawData;
  }
  const data = rawData as Record<string, unknown>;
  const header =
    data.header && typeof data.header === "object" && !Array.isArray(data.header)
      ? (data.header as Record<string, unknown>)
      : {};

  return {
    ...data,
    header: {
      ...header,
      username: slug,
    },
  };
};

const mapDeletedPublicPageRow = (row: DeletedPublicPageDbRow): DeletedPublicPageRow => ({
  id: row.id,
  slug: row.slug,
  displayName: getDisplayNameFromStoredData(row.data),
  owner_admin_id: row.owner_admin_id ?? null,
  original_updated_at: row.original_updated_at ?? null,
  deleted_at: row.deleted_at,
  deleted_reason: row.deleted_reason ?? null,
  deleted_by_admin_id: row.deleted_by_admin_id ?? null,
  owner: null,
  deletedBy: null,
});

export const getPublicPageBySlug = async (slug: string): Promise<BuilderData | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,data")
    .eq("slug", slug)
    .maybeSingle<Pick<PublicPageDbRow, "slug" | "data">>();

  if (error) {
    throw error;
  }
  return data ? parseStoredPublicPageData(data.data, data.slug) : null;
};

export const getPublicPageByOwnerAndSlug = async (
  ownerUsername: string,
  pageSlug: string,
): Promise<BuilderData | null> => {
  const normalizedOwner = ownerUsername.trim().toLowerCase();
  const normalizedSlug = pageSlug.trim().toLowerCase();
  if (!isSafeAdminUsername(normalizedOwner) || !isSafePublicPageSlug(normalizedSlug)) {
    return null;
  }

  const publicPath = buildNestedPublicPagePath(normalizedOwner, normalizedSlug);
  const byPath = await getPublicPageBySlug(publicPath);
  if (byPath) {
    return byPath;
  }

  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,data,owner_admin_id")
    .eq("slug", normalizedSlug)
    .maybeSingle<{
      slug: string;
      data: BuilderData;
      owner_admin_id?: string | null;
    }>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      return null;
    }
    throw error;
  }
  const owner = await getAdminUserLookupById(data?.owner_admin_id);
  if (!data || owner?.username !== normalizedOwner || !isOwnerActive(owner)) {
    return null;
  }
  return parseStoredPublicPageData(data.data, data.slug);
};

export const getPublicPageOwnershipBySlug = async (
  slug: string,
): Promise<Pick<PublicPageRow, "slug" | "owner_admin_id"> | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,owner_admin_id")
    .eq("slug", slug)
    .maybeSingle<{ slug: string; owner_admin_id: string | null }>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      const fallback = await client
        .from(PUBLIC_PAGES_TABLE)
        .select("slug")
        .eq("slug", slug)
        .maybeSingle<{ slug: string }>();
      if (fallback.error) {
        throw fallback.error;
      }
      return fallback.data ? { slug: fallback.data.slug, owner_admin_id: null } : null;
    }
    throw error;
  }
  return data;
};

const getActivePublicPageArchiveSourceBySlug = async (
  slug: string,
): Promise<ActivePublicPageArchiveSourceRow | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,data,updated_at,owner_admin_id")
    .eq("slug", slug)
    .maybeSingle<ActivePublicPageArchiveSourceRow>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      const fallback = await client
        .from(PUBLIC_PAGES_TABLE)
        .select("slug,data,updated_at")
        .eq("slug", slug)
        .maybeSingle<Omit<ActivePublicPageArchiveSourceRow, "owner_admin_id">>();
      if (fallback.error) {
        throw fallback.error;
      }
      return fallback.data ? { ...fallback.data, owner_admin_id: null } : null;
    }
    throw error;
  }
  return data;
};

export const listPublicPages = async (
  session?: AdminSession,
): Promise<PublicPageListRow[]> => {
  const client = getSupabaseAdminClient();
  let query = client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,data,updated_at,owner_admin_id");

  if (session?.role === "admin") {
    query = query.eq("owner_admin_id", session.adminId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .returns<PublicPageDbRow[]>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      if (session?.role === "admin") {
        return [];
      }
      const fallback = await client
        .from(PUBLIC_PAGES_TABLE)
        .select("slug,data,updated_at")
        .order("updated_at", { ascending: false })
        .returns<Array<Omit<PublicPageDbRow, "owner_admin_id">>>();
      if (fallback.error) {
        throw fallback.error;
      }
      return (fallback.data ?? [])
        .map((row) => mapPublicPageListRow({ ...row, owner_admin_id: null }));
    }
    throw error;
  }

  const ownerById = await getAdminUserLookupsByIds(
    client,
    (data ?? []).map((row) => row.owner_admin_id),
  );

  return (data ?? [])
    .map((row) =>
      mapPublicPageListRow(
        row,
        row.owner_admin_id && ownerById.has(row.owner_admin_id)
          ? mapAdminUserToOwner(ownerById.get(row.owner_admin_id)!)
          : null,
      ),
    );
};

export const countPublicPagesForAdmin = async (adminId: string): Promise<number> => {
  const client = getSupabaseAdminClient();
  const { count, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug", { count: "exact", head: true })
    .eq("owner_admin_id", adminId);

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      return 0;
    }
    throw error;
  }
  return count ?? 0;
};

const getPageSlugFromPublicPath = (publicPath: string): string =>
  splitPublicPagePath(publicPath).pageSlug;

const resolveMutationPublicPath = (
  requestedSlug: string,
  session: AdminSession,
): { ok: true; publicPath: string; pageSlug: string } | { ok: false; status: 400 | 403; error: string } => {
  const normalized = requestedSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  const parts = normalized.split("/").filter(Boolean);

  if (parts.length > 2 || parts.length === 0) {
    return { ok: false, status: 400, error: "Invalid public path." };
  }

  if (session.role !== "admin") {
    const publicPath = parts.join("/");
    const pageSlug = getPageSlugFromPublicPath(publicPath);
    if (!isSafePublicPageSlug(pageSlug)) {
      return { ok: false, status: 400, error: "Invalid slug." };
    }
    if (parts.length === 2 && !isSafeAdminUsername(parts[0])) {
      return { ok: false, status: 400, error: "Invalid owner username." };
    }
    return { ok: true, publicPath, pageSlug };
  }

  const pageSlug = parts.length === 2 ? parts[1] : parts[0];
  const ownerUsername = parts.length === 2 ? parts[0] : session.username;
  if (ownerUsername !== session.username) {
    return { ok: false, status: 403, error: "This namespace belongs to another admin." };
  }
  if (!isSafePublicPageSlug(pageSlug)) {
    return { ok: false, status: 400, error: "Invalid slug." };
  }
  return {
    ok: true,
    publicPath: buildNestedPublicPagePath(session.username, pageSlug),
    pageSlug,
  };
};

const findOwnedPageWithPageSlug = async (
  ownerAdminId: string,
  pageSlug: string,
): Promise<Pick<PublicPageRow, "slug" | "owner_admin_id"> | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,owner_admin_id")
    .eq("owner_admin_id", ownerAdminId)
    .returns<Array<{ slug: string; owner_admin_id: string | null }>>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      return null;
    }
    throw error;
  }

  return (
    (data ?? []).find((row) => getPageSlugFromPublicPath(row.slug) === pageSlug) ?? null
  );
};

export const upsertPublicPageForSession = async (
  slug: string,
  data: BuilderData,
  session: AdminSession,
): Promise<PublicPageMutationResult> => {
  const client = getSupabaseAdminClient();
  const normalizedData = normalizeBuilderData(data);
  const resolved = resolveMutationPublicPath(slug, session);
  if (!resolved.ok) {
    return resolved;
  }
  const slugPath = resolved.publicPath;
  const existing = await getPublicPageOwnershipBySlug(slugPath);

  if (existing) {
    if (session.role !== "owner" && existing.owner_admin_id && existing.owner_admin_id !== session.adminId) {
      return {
        ok: false,
        status: 403,
        error: "This slug belongs to another admin.",
      };
    }

    const { error } = await client
      .from(PUBLIC_PAGES_TABLE)
      .update({ data: normalizedData, updated_at: new Date().toISOString() })
      .eq("slug", slugPath);

    if (error) {
      throw error;
    }
    return { ok: true, created: false };
  }

  if (session.role !== "owner") {
    const admin = await getAdminUserById(session.adminId);
    if (!admin || !admin.active) {
      return { ok: false, status: 403, error: "Admin is inactive." };
    }
    const duplicate = await findOwnedPageWithPageSlug(session.adminId, resolved.pageSlug);
    if (duplicate && duplicate.slug !== slugPath) {
      return {
        ok: false,
        status: 409,
        error: "Slug already exists in this admin namespace.",
      };
    }
    const currentCount = await countPublicPagesForAdmin(session.adminId);
    if (currentCount >= admin.slugLimit) {
      return {
        ok: false,
        status: 409,
        error: `Slug limit reached (${currentCount}/${admin.slugLimit}).`,
      };
    }
  }

  const insertPayload = {
    slug: slugPath,
    data: normalizedData,
    owner_admin_id: session.adminId,
    updated_at: new Date().toISOString(),
  };
  const { error } = await client.from(PUBLIC_PAGES_TABLE).insert(insertPayload);

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      const { error: fallbackError } = await client.from(PUBLIC_PAGES_TABLE).insert({
        slug: slugPath,
        data: normalizedData,
        updated_at: insertPayload.updated_at,
      });
      if (!fallbackError) {
        return { ok: true, created: true };
      }
      if (fallbackError.code === "23505") {
        return {
          ok: false,
          status: 409,
          error: "Slug already exists.",
        };
      }
      throw fallbackError;
    }
    if (error.code === "23505") {
      return {
        ok: false,
        status: 409,
        error: "Slug already exists.",
      };
    }
    throw error;
  }
  return { ok: true, created: true };
};

export const removePublicPageBySlugForSession = async (
  slug: string,
  session: AdminSession,
): Promise<PublicPageMutationResult> => {
  const resolved = resolveMutationPublicPath(slug, session);
  if (!resolved.ok) {
    return resolved;
  }
  const slugPath = resolved.publicPath;

  if (PROTECTED_PUBLIC_SLUGS.has(slugPath)) {
    return {
      ok: false,
      status: 403,
      error: "/110 is protected and cannot be deleted.",
    };
  }

  const client = getSupabaseAdminClient();
  const existing = await getActivePublicPageArchiveSourceBySlug(slugPath);
  if (!existing) {
    return { ok: false, status: 404, error: "Not found." };
  }
  if (session.role !== "owner" && existing.owner_admin_id && existing.owner_admin_id !== session.adminId) {
    return {
      ok: false,
      status: 403,
      error: "This slug belongs to another admin.",
    };
  }

  const { error: archiveError } = await client.from(PUBLIC_PAGES_DELETED_TABLE).insert({
    slug: existing.slug,
    data: existing.data,
    owner_admin_id: existing.owner_admin_id ?? null,
    original_updated_at: existing.updated_at ?? null,
    deleted_by_admin_id: session.adminId,
  });

  if (archiveError) {
    throw archiveError;
  }

  const { error: deleteError } = await client.from(PUBLIC_PAGES_TABLE).delete().eq("slug", slugPath);

  if (deleteError) {
    throw deleteError;
  }
  return { ok: true };
};

export const listDeletedPublicPagesForOwner = async (
  session: AdminSession,
): Promise<DeletedPublicPageRow[]> => {
  if (session.role !== "owner") {
    return [];
  }

  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_DELETED_TABLE)
    .select(
      [
        "id",
        "slug",
        "data",
        "owner_admin_id",
        "original_updated_at",
        "deleted_at",
        "deleted_by_admin_id",
        "deleted_reason",
      ].join(","),
    )
    .order("deleted_at", { ascending: false })
    .returns<DeletedPublicPageDbRow[]>();

  if (error) {
    if (isMissingOwnerAdminIdError(error)) {
      return [];
    }
    throw error;
  }

  const userById = await getAdminUserLookupsByIds(
    client,
    (data ?? []).flatMap((row) => [row.owner_admin_id, row.deleted_by_admin_id]),
  );

  return (data ?? []).map((row) => {
    const mapped = mapDeletedPublicPageRow(row);
    const owner = row.owner_admin_id ? userById.get(row.owner_admin_id) : null;
    const deletedBy = row.deleted_by_admin_id ? userById.get(row.deleted_by_admin_id) : null;
    return {
      ...mapped,
      owner: owner ? mapAdminUserToOwner(owner) : null,
      deletedBy: deletedBy ? mapAdminUserToOwner(deletedBy) : null,
    };
  });
};

export const restoreDeletedPublicPageForOwner = async (
  id: string,
  session: AdminSession,
  input: {
    slug?: string;
    ownerAdminId?: string | null;
  } = {},
): Promise<DeletedPublicPageMutationResult> => {
  if (session.role !== "owner") {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  const client = getSupabaseAdminClient();
  const { data: deletedPage, error: loadError } = await client
    .from(PUBLIC_PAGES_DELETED_TABLE)
    .select("id,slug,data,owner_admin_id,original_updated_at")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      slug: string;
      data: unknown;
      owner_admin_id: string | null;
      original_updated_at: string | null;
    }>();

  if (loadError) {
    throw loadError;
  }
  if (!deletedPage) {
    return { ok: false, status: 404, error: "Deleted page not found." };
  }

  const requestedSlug = input.slug ?? deletedPage.slug;
  const requestedPath = requestedSlug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  const requestedPageSlug = normalizePublicSlug(getPageSlugFromPublicPath(requestedPath));
  if (!requestedPageSlug || !isSafePublicPageSlug(requestedPageSlug)) {
    return { ok: false, status: 400, error: "Invalid slug." };
  }

  const targetOwnerAdminId = input.ownerAdminId ?? deletedPage.owner_admin_id ?? session.adminId;
  const targetOwner = await getAdminUserById(targetOwnerAdminId);
  if (!targetOwner || !targetOwner.active) {
    return { ok: false, status: 400, error: "Target admin is inactive or missing." };
  }
  const targetSlug =
    targetOwner.role === "admin"
      ? buildNestedPublicPagePath(targetOwner.username, requestedPageSlug)
      : requestedPath.includes("/") && splitPublicPagePath(requestedPath).ownerUsername
        ? requestedPath
        : requestedPageSlug;
  const duplicateInNamespace = await findOwnedPageWithPageSlug(targetOwnerAdminId, requestedPageSlug);
  if (duplicateInNamespace && duplicateInNamespace.slug !== targetSlug) {
    return {
      ok: false,
      status: 409,
      error: "Slug already exists in this admin namespace.",
    };
  }

  const existing = await getPublicPageOwnershipBySlug(targetSlug);
  if (existing) {
    return {
      ok: false,
      status: 409,
      error: "Slug already exists. Restore as a new slug.",
    };
  }

  const { error: insertError } = await client.from(PUBLIC_PAGES_TABLE).insert({
    slug: targetSlug,
    data: retargetStoredDataSlug(deletedPage.data, requestedPageSlug),
    owner_admin_id: targetOwnerAdminId,
    updated_at: deletedPage.original_updated_at ?? new Date().toISOString(),
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: false,
        status: 409,
        error: "Slug already exists. Restore as a new slug.",
      };
    }
    throw insertError;
  }

  const { error: deleteError } = await client
    .from(PUBLIC_PAGES_DELETED_TABLE)
    .delete()
    .eq("id", id);

  if (deleteError) {
    throw deleteError;
  }

  return { ok: true };
};

export const permanentlyDeleteDeletedPublicPageForOwner = async (
  id: string,
  session: AdminSession,
): Promise<DeletedPublicPageMutationResult> => {
  if (session.role !== "owner") {
    return { ok: false, status: 403, error: "Forbidden." };
  }

  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_DELETED_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw error;
  }
  if (!data) {
    return { ok: false, status: 404, error: "Deleted page not found." };
  }
  return { ok: true };
};
