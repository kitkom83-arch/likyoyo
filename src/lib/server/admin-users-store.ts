import { createClient } from "@supabase/supabase-js";

import { validateCriticalServerEnv } from "@/lib/server/env-validation";

export type AdminRole = "owner" | "admin";

export type AdminUser = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: AdminRole;
  slugLimit: number;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminUserSummary = Omit<AdminUser, "passwordHash"> & {
  slugCount: number;
  slugs: string[];
};

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  role: AdminRole;
  slug_limit: number;
  active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type AdminUserSummaryRow = AdminUserRow & {
  public_pages?: Array<{ slug: string }> | null;
};

const ADMIN_USERS_TABLE = "admin_users";

const getSupabaseAdminClient = () => {
  const env = validateCriticalServerEnv();
  return createClient(env.nextPublicSupabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const mapAdminUser = (row: AdminUserRow): AdminUser => ({
  id: row.id,
  username: row.username,
  passwordHash: row.password_hash,
  displayName: row.display_name,
  role: row.role,
  slugLimit: row.slug_limit,
  active: row.active,
  createdAt: row.created_at ?? null,
  updatedAt: row.updated_at ?? null,
});

const mapAdminUserSummary = (row: AdminUserSummaryRow): AdminUserSummary => {
  const user = mapAdminUser(row);
  const slugs = (row.public_pages ?? [])
    .map((page) => page.slug)
    .filter((slug): slug is string => typeof slug === "string")
    .sort((left, right) => left.localeCompare(right));

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    slugLimit: user.slugLimit,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    slugCount: slugs.length,
    slugs,
  };
};

export const getAdminUserByUsername = async (
  username: string,
): Promise<AdminUser | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .select("id,username,password_hash,display_name,role,slug_limit,active,created_at,updated_at")
    .eq("username", username.trim().toLowerCase())
    .maybeSingle<AdminUserRow>();

  if (error) {
    throw error;
  }
  return data ? mapAdminUser(data) : null;
};

export const getAdminUserById = async (id: string): Promise<AdminUser | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .select("id,username,password_hash,display_name,role,slug_limit,active,created_at,updated_at")
    .eq("id", id)
    .maybeSingle<AdminUserRow>();

  if (error) {
    throw error;
  }
  return data ? mapAdminUser(data) : null;
};

export const listAdminUserSummaries = async (): Promise<AdminUserSummary[]> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .select(
      "id,username,password_hash,display_name,role,slug_limit,active,created_at,updated_at,public_pages(slug)",
    )
    .order("created_at", { ascending: true })
    .returns<AdminUserSummaryRow[]>();

  if (error) {
    throw error;
  }
  return (data ?? []).map(mapAdminUserSummary);
};

export const createAdminUser = async (input: {
  username: string;
  passwordHash: string;
  displayName: string;
  role: AdminRole;
  slugLimit: number;
}): Promise<AdminUserSummary> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .insert({
      username: input.username.trim().toLowerCase(),
      password_hash: input.passwordHash,
      display_name: input.displayName.trim(),
      role: input.role,
      slug_limit: input.slugLimit,
      active: true,
      updated_at: new Date().toISOString(),
    })
    .select("id,username,password_hash,display_name,role,slug_limit,active,created_at,updated_at")
    .single<AdminUserRow>();

  if (error) {
    throw error;
  }
  return { ...mapAdminUser(data), slugCount: 0, slugs: [] };
};

export const countActiveOwners = async (): Promise<number> => {
  const client = getSupabaseAdminClient();
  const { count, error } = await client
    .from(ADMIN_USERS_TABLE)
    .select("id", { count: "exact", head: true })
    .eq("role", "owner")
    .eq("active", true);

  if (error) {
    throw error;
  }
  return count ?? 0;
};

export const updateAdminUser = async (
  id: string,
  input: {
    displayName?: string;
    slugLimit?: number;
    active?: boolean;
  },
): Promise<AdminUserSummary> => {
  const client = getSupabaseAdminClient();
  const patch: Record<string, string | number | boolean> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof input.displayName === "string") {
    patch.display_name = input.displayName.trim();
  }
  if (typeof input.slugLimit === "number") {
    patch.slug_limit = input.slugLimit;
  }
  if (typeof input.active === "boolean") {
    patch.active = input.active;
  }

  const { data, error } = await client
    .from(ADMIN_USERS_TABLE)
    .update(patch)
    .eq("id", id)
    .select(
      "id,username,password_hash,display_name,role,slug_limit,active,created_at,updated_at,public_pages(slug)",
    )
    .single<AdminUserSummaryRow>();

  if (error) {
    throw error;
  }
  return mapAdminUserSummary(data);
};

export const resetAdminUserPassword = async (
  id: string,
  passwordHash: string,
): Promise<void> => {
  const client = getSupabaseAdminClient();
  const { error } = await client
    .from(ADMIN_USERS_TABLE)
    .update({
      password_hash: passwordHash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
};
