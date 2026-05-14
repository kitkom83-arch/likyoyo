import { createClient } from "@supabase/supabase-js";

import { builderDataSchema } from "@/features/builder/schema";
import { BuilderData } from "@/features/builder/types";
import { normalizeBuilderData } from "@/features/builder/utils";
import { type AdminSession } from "@/lib/server/admin-auth";
import { getAdminUserById } from "@/lib/server/admin-users-store";
import { validateCriticalServerEnv } from "@/lib/server/env-validation";

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

type PublicPageDbRow = {
  slug: string;
  data: BuilderData;
  updated_at?: string | null;
  owner_admin_id?: string | null;
  admin_users?: {
    id: string;
    username: string;
    display_name: string;
    role: string;
  } | null;
};

export type PublicPageMutationResult =
  | { ok: true; created?: boolean }
  | { ok: false; status: 403 | 404 | 409; error: string };

const PUBLIC_PAGES_TABLE = "public_pages";
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

const mapPublicPageRow = (row: PublicPageDbRow): PublicPageRow | null => {
  const parsedData = parseStoredPublicPageData(row.data, row.slug);
  if (!parsedData) {
    return null;
  }
  return {
    slug: row.slug,
    data: parsedData,
    updated_at: row.updated_at ?? null,
    owner_admin_id: row.owner_admin_id ?? null,
    owner: row.admin_users
      ? {
          id: row.admin_users.id,
          username: row.admin_users.username,
          displayName: row.admin_users.display_name,
          role: row.admin_users.role,
        }
      : null,
  };
};

export const getPublicPageBySlug = async (slug: string): Promise<BuilderData | null> => {
  const client = getSupabaseAdminClient();
  const { data, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug,data")
    .eq("slug", slug)
    .maybeSingle<Pick<PublicPageRow, "slug" | "data">>();

  if (error) {
    throw error;
  }
  return data ? parseStoredPublicPageData(data.data, data.slug) : null;
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
    throw error;
  }
  return data;
};

export const listPublicPages = async (
  session?: AdminSession,
): Promise<PublicPageRow[]> => {
  const client = getSupabaseAdminClient();
  let query = client
    .from(PUBLIC_PAGES_TABLE)
    .select(
      "slug,data,updated_at,owner_admin_id,admin_users!public_pages_owner_admin_id_fkey(id,username,display_name,role)",
    );

  if (session?.role === "admin") {
    query = query.eq("owner_admin_id", session.adminId);
  }

  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .returns<PublicPageDbRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapPublicPageRow).filter((row): row is PublicPageRow => Boolean(row));
};

export const countPublicPagesForAdmin = async (adminId: string): Promise<number> => {
  const client = getSupabaseAdminClient();
  const { count, error } = await client
    .from(PUBLIC_PAGES_TABLE)
    .select("slug", { count: "exact", head: true })
    .eq("owner_admin_id", adminId);

  if (error) {
    throw error;
  }
  return count ?? 0;
};

export const upsertPublicPageForSession = async (
  slug: string,
  data: BuilderData,
  session: AdminSession,
): Promise<PublicPageMutationResult> => {
  const client = getSupabaseAdminClient();
  const normalizedData = normalizeBuilderData(data);
  const existing = await getPublicPageOwnershipBySlug(slug);

  if (existing) {
    if (session.role !== "owner" && existing.owner_admin_id !== session.adminId) {
      return {
        ok: false,
        status: 403,
        error: "This slug belongs to another admin.",
      };
    }

    const { error } = await client
      .from(PUBLIC_PAGES_TABLE)
      .update({ data: normalizedData, updated_at: new Date().toISOString() })
      .eq("slug", slug);

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
    const currentCount = await countPublicPagesForAdmin(session.adminId);
    if (currentCount >= admin.slugLimit) {
      return {
        ok: false,
        status: 409,
        error: `Slug limit reached (${currentCount}/${admin.slugLimit}).`,
      };
    }
  }

  const { error } = await client.from(PUBLIC_PAGES_TABLE).insert({
    slug,
    data: normalizedData,
    owner_admin_id: session.adminId,
    updated_at: new Date().toISOString(),
  });

  if (error) {
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
  if (PROTECTED_PUBLIC_SLUGS.has(slug)) {
    return {
      ok: false,
      status: 403,
      error: "/110 is protected and cannot be deleted.",
    };
  }

  const client = getSupabaseAdminClient();
  const existing = await getPublicPageOwnershipBySlug(slug);
  if (!existing) {
    return { ok: false, status: 404, error: "Not found." };
  }
  if (session.role !== "owner" && existing.owner_admin_id !== session.adminId) {
    return {
      ok: false,
      status: 403,
      error: "This slug belongs to another admin.",
    };
  }

  const { error } = await client.from(PUBLIC_PAGES_TABLE).delete().eq("slug", slug);

  if (error) {
    throw error;
  }
  return { ok: true };
};
