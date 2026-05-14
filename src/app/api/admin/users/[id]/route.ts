import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import {
  countActiveOwners,
  getAdminUserById,
  updateAdminUser,
} from "@/lib/server/admin-users-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  id: string;
};

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

const updateAdminUserSchema = z.object({
  displayName: z.string().trim().min(1).max(120).optional(),
  slugLimit: z.coerce.number().int().min(0).max(10000).optional(),
  active: z.boolean().optional(),
});

const getIdFromParams = async (params: Promise<RouteParams>): Promise<string> => {
  const resolved = await params;
  return (resolved.id ?? "").trim();
};

export async function PATCH(
  request: Request,
  context: { params: Promise<RouteParams> },
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });
  }

  const id = await getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "Invalid user id." }, { status: 400, headers: protectedHeaders });
  }

  try {
    const parsed = updateAdminUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid admin update payload.", details: parsed.error.flatten() },
        { status: 400, headers: protectedHeaders },
      );
    }

    const existing = await getAdminUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404, headers: protectedHeaders });
    }

    if (
      existing.role === "owner" &&
      existing.active &&
      parsed.data.active === false &&
      (await countActiveOwners()) <= 1
    ) {
      return NextResponse.json(
        { error: "Cannot disable the last active owner." },
        { status: 409, headers: protectedHeaders },
      );
    }

    const user = await updateAdminUser(id, parsed.data);
    return NextResponse.json(
      {
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          slugLimit: user.slugLimit,
          active: user.active,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          slugCount: user.slugCount,
          slugs: user.slugs,
        },
      },
      { headers: protectedHeaders },
    );
  } catch (error) {
    console.error("[admin-users] UPDATE failed", error);
    return NextResponse.json(
      { error: "Failed to update admin user." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
