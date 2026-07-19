import { createClient } from "@supabase/supabase-js";

import { validateCriticalServerEnv } from "@/lib/server/env-validation";

export type PageManager = {
  id: string;
  slug: string;
  adminUserId: string;
  username: string;
  displayName: string;
  active: boolean;
  canManageManagers: boolean;
  createdByAdminId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type PageManagerRow = {
  id: string;
  slug: string;
  admin_user_id: string;
  can_manage_managers: boolean;
  created_by_admin_id: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type AdminUserLookupRow = {
  id: string;
  username: string;
  display_name: string;
  active: boolean;
};

const PAGE_MANAGERS_TABLE = "page_managers";
const ADMIN_USERS_TABLE = "admin_users";

/**
 * True when the page_managers table has not been created yet (migration not run).
 * The feature degrades gracefully instead of throwing when this happens.
 */
export const isMissingPageManagersTableError = (
  error: { code?: string; message?: string } | null,
): boolean => error?.code === "PGRST205" && /page_managers/i.test(error.message ?? "");

const getSupabaseAdminClient = () => {
  const env = validateCriticalServerEnv();
  return createClient(env.nextPublicSupabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const fetchAdminUserLookups = async (
  client: ReturnType<typeof getSupabaseAdminClient>,
  adminUserIds: string[],
): Promise<Map<string, AdminUserLookupRow>> => {
  const uniqueIds = Array.from(new Set(adminUserIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return new Map();
  }
  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .select("id,username,display_name,active")
    .in("id", uniqueIds)
    .returns<AdminUserLookupRow[]>();

  if (error) {
    throw error;
  }
  return new Map((data ?? []).map((row) => [row.id, row]));
};

const mapPageManager = (
  row: PageManagerRow,
  lookup: AdminUserLookupRow | undefined,
): PageManager => ({
  id: row.id,
  slug: row.slug,
  adminUserId: row.admin_user_id,
  username: lookup?.username ?? "",
  displayName: lookup?.display_name ?? "",
  active: lookup?.active ?? true,
  canManageManagers: row.can_manage_managers,
  createdByAdminId: row.created_by_admin_id ?? null,
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

/** All managers attached to a given page slug (full public path). */
export const listPageManagers = async (slug: string): Promise<PageManager[]> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .select("id,slug,admin_user_id,can_manage_managers,created_by_admin_id,created_at,updated_at")
    .eq("slug", slug)
    .order("created_at", { ascending: true })
    .returns<PageManagerRow[]>();

  if (error) {
    if (isMissingPageManagersTableError(error)) {
      return [];
    }
    throw error;
  }

  const lookups = await fetchAdminUserLookups(
    client,
    (data ?? []).map((row) => row.admin_user_id),
  );
  return (data ?? []).map((row) => mapPageManager(row, lookups.get(row.admin_user_id)));
};

/** Slugs (full public paths) that the given admin user may co-manage. */
export const listSlugsManagedByAdmin = async (adminUserId: string): Promise<string[]> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .select("slug")
    .eq("admin_user_id", adminUserId)
    .returns<Array<{ slug: string }>>();

  if (error) {
    if (isMissingPageManagersTableError(error)) {
      return [];
    }
    throw error;
  }
  return Array.from(new Set((data ?? []).map((row) => row.slug)));
};

/** The membership record for a specific admin user on a specific page, if any. */
export const getPageManagerRecord = async (
  slug: string,
  adminUserId: string,
): Promise<PageManagerRow | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .select("id,slug,admin_user_id,can_manage_managers,created_by_admin_id,created_at,updated_at")
    .eq("slug", slug)
    .eq("admin_user_id", adminUserId)
    .maybeSingle<PageManagerRow>();

  if (error) {
    if (isMissingPageManagersTableError(error)) {
      return null;
    }
    throw error;
  }
  return data ?? null;
};

export const isPageManagerForSlug = async (
  adminUserId: string,
  slug: string,
): Promise<boolean> => Boolean(await getPageManagerRecord(slug, adminUserId));

export const canManageTeamForSlug = async (
  adminUserId: string,
  slug: string,
): Promise<boolean> => {
  const record = await getPageManagerRecord(slug, adminUserId);
  return Boolean(record?.can_manage_managers);
};

export const createPageManager = async (input: {
  slug: string;
  adminUserId: string;
  canManageManagers: boolean;
  createdByAdminId: string | null;
}): Promise<PageManager> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .insert({
      slug: input.slug,
      admin_user_id: input.adminUserId,
      can_manage_managers: input.canManageManagers,
      created_by_admin_id: input.createdByAdminId,
      updated_at: new Date().toISOString(),
    })
    .select("id,slug,admin_user_id,can_manage_managers,created_by_admin_id,created_at,updated_at")
    .single<PageManagerRow>();

  if (error) {
    throw error;
  }
  const lookups = await fetchAdminUserLookups(client, [data.admin_user_id]);
  return mapPageManager(data, lookups.get(data.admin_user_id));
};

export const updatePageManager = async (
  slug: string,
  adminUserId: string,
  input: { canManageManagers: boolean },
): Promise<PageManager | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .update({
      can_manage_managers: input.canManageManagers,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug)
    .eq("admin_user_id", adminUserId)
    .select("id,slug,admin_user_id,can_manage_managers,created_by_admin_id,created_at,updated_at")
    .maybeSingle<PageManagerRow>();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }
  const lookups = await fetchAdminUserLookups(client, [data.admin_user_id]);
  return mapPageManager(data, lookups.get(data.admin_user_id));
};

export const removePageManager = async (
  slug: string,
  adminUserId: string,
): Promise<boolean> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PAGE_MANAGERS_TABLE)
    .delete()
    .eq("slug", slug)
    .eq("admin_user_id", adminUserId)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    throw error;
  }
  return Boolean(data);
};
