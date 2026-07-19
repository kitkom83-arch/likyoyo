import { NextResponse } from "next/server";
import { z } from "zod";

import { isSafeAdminUsername } from "@/lib/public-pages/paths";
import {
  getAdminSessionFromRequest,
  hashAdminPassword,
} from "@/lib/server/admin-auth";
import { createAdminUser } from "@/lib/server/admin-users-store";
import {
  createPageManager,
  listPageManagers,
  removePageManager,
  updatePageManager,
  type PageManager,
} from "@/lib/server/page-managers-store";
import { resolvePageAccessForSession } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

const createManagerSchema = z.object({
  slug: z.string().trim().min(1),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(64)
    .regex(/^[a-z0-9._-]+$/)
    .refine((value) => isSafeAdminUsername(value), {
      message: "Reserved or unsafe username.",
    }),
  displayName: z.string().trim().min(1).max(120),
  password: z.string().min(8).max(256),
  canManageManagers: z.boolean().default(false),
});

const updateManagerSchema = z.object({
  slug: z.string().trim().min(1),
  adminUserId: z.string().trim().min(1),
  canManageManagers: z.boolean(),
});

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: string }).code === "23505";

const toPublicManager = (manager: PageManager) => ({
  id: manager.id,
  slug: manager.slug,
  adminUserId: manager.adminUserId,
  username: manager.username,
  displayName: manager.displayName,
  active: manager.active,
  canManageManagers: manager.canManageManagers,
  createdByAdminId: manager.createdByAdminId,
  createdAt: manager.createdAt,
});

const forbidden = () =>
  NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });

const notFound = () =>
  NextResponse.json({ error: "Page not found." }, { status: 404, headers: protectedHeaders });

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
  }

  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";
  if (!slug) {
    return NextResponse.json({ error: "Missing slug." }, { status: 400, headers: protectedHeaders });
  }

  try {
    const access = await resolvePageAccessForSession(slug, session);
    if (!access) {
      return notFound();
    }
    if (!access.canView) {
      return forbidden();
    }
    const managers = await listPageManagers(access.slug);
    return NextResponse.json(
      {
        managers: managers.map(toPublicManager),
        canManageTeam: access.canManageTeam,
        slug: access.slug,
      },
      { headers: protectedHeaders },
    );
  } catch (error) {
    console.error("[page-managers] LIST failed", error);
    return NextResponse.json(
      { error: "Failed to list page managers." },
      { status: 500, headers: protectedHeaders },
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
  }

  try {
    const parsed = createManagerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid page manager payload.", details: parsed.error.flatten() },
        { status: 400, headers: protectedHeaders },
      );
    }

    const access = await resolvePageAccessForSession(parsed.data.slug, session);
    if (!access) {
      return notFound();
    }
    if (!access.canManageTeam) {
      return forbidden();
    }

    const passwordHash = await hashAdminPassword(parsed.data.password);
    let account;
    try {
      account = await createAdminUser({
        username: parsed.data.username,
        displayName: parsed.data.displayName,
        role: "admin",
        slugLimit: 0,
        passwordHash,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: "username_taken" },
          { status: 409, headers: protectedHeaders },
        );
      }
      throw error;
    }

    try {
      const manager = await createPageManager({
        slug: access.slug,
        adminUserId: account.id,
        canManageManagers: parsed.data.canManageManagers,
        createdByAdminId: session.adminId,
      });
      return NextResponse.json(
        { manager: toPublicManager(manager) },
        { headers: protectedHeaders },
      );
    } catch (error) {
      if (isUniqueViolation(error)) {
        return NextResponse.json(
          { error: "already_manager" },
          { status: 409, headers: protectedHeaders },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[page-managers] CREATE failed", error);
    return NextResponse.json(
      { error: "Failed to create page manager." },
      { status: 500, headers: protectedHeaders },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
  }

  try {
    const parsed = updateManagerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid page manager payload.", details: parsed.error.flatten() },
        { status: 400, headers: protectedHeaders },
      );
    }

    const access = await resolvePageAccessForSession(parsed.data.slug, session);
    if (!access) {
      return notFound();
    }
    if (!access.canManageTeam) {
      return forbidden();
    }

    const manager = await updatePageManager(access.slug, parsed.data.adminUserId, {
      canManageManagers: parsed.data.canManageManagers,
    });
    if (!manager) {
      return NextResponse.json(
        { error: "Manager not found." },
        { status: 404, headers: protectedHeaders },
      );
    }
    return NextResponse.json(
      { manager: toPublicManager(manager) },
      { headers: protectedHeaders },
    );
  } catch (error) {
    console.error("[page-managers] UPDATE failed", error);
    return NextResponse.json(
      { error: "Failed to update page manager." },
      { status: 500, headers: protectedHeaders },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim() ?? "";
  const adminUserId = url.searchParams.get("adminUserId")?.trim() ?? "";
  if (!slug || !adminUserId) {
    return NextResponse.json(
      { error: "Missing slug or adminUserId." },
      { status: 400, headers: protectedHeaders },
    );
  }

  try {
    const access = await resolvePageAccessForSession(slug, session);
    if (!access) {
      return notFound();
    }
    if (!access.canManageTeam) {
      return forbidden();
    }
    const removed = await removePageManager(access.slug, adminUserId);
    if (!removed) {
      return NextResponse.json(
        { error: "Manager not found." },
        { status: 404, headers: protectedHeaders },
      );
    }
    return NextResponse.json({ ok: true }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[page-managers] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to remove page manager." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
