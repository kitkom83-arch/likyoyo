import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminSessionFromRequest,
  hashAdminPassword,
} from "@/lib/server/admin-auth";
import {
  createAdminUser,
  listAdminUserSummaries,
  type AdminRole,
} from "@/lib/server/admin-users-store";
import { isSafeAdminUsername } from "@/lib/public-pages/paths";

export const dynamic = "force-dynamic";

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

const createAdminUserSchema = z.object({
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
  role: z.enum(["owner", "admin"]).default("admin"),
  slugLimit: z.coerce.number().int().min(0).max(10000).default(10),
});

const toPublicUser = (user: Awaited<ReturnType<typeof createAdminUser>>) => ({
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
});

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });
  }

  try {
    const users = await listAdminUserSummaries();
    return NextResponse.json(
      {
        users: users.map(toPublicUser),
      },
      { headers: protectedHeaders },
    );
  } catch (error) {
    console.error("[admin-users] LIST failed", error);
    return NextResponse.json(
      { error: "Failed to list admin users." },
      { status: 500, headers: protectedHeaders },
    );
  }
}

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });
  }

  try {
    const parsed = createAdminUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid admin user payload.", details: parsed.error.flatten() },
        { status: 400, headers: protectedHeaders },
      );
    }

    const passwordHash = await hashAdminPassword(parsed.data.password);
    const user = await createAdminUser({
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      role: parsed.data.role as AdminRole,
      slugLimit: parsed.data.slugLimit,
      passwordHash,
    });
    return NextResponse.json({ user: toPublicUser(user) }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[admin-users] CREATE failed", error);
    return NextResponse.json(
      { error: "Failed to create admin user." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
