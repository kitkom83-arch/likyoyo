import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAdminSessionFromRequest,
  hashAdminPassword,
} from "@/lib/server/admin-auth";
import {
  getAdminUserById,
  resetAdminUserPassword,
} from "@/lib/server/admin-users-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  id: string;
};

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

const resetPasswordSchema = z.object({
  password: z.string().min(8).max(256),
});

const getIdFromParams = async (params: Promise<RouteParams>): Promise<string> => {
  const resolved = await params;
  return (resolved.id ?? "").trim();
};

export async function POST(
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
    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid password payload.", details: parsed.error.flatten() },
        { status: 400, headers: protectedHeaders },
      );
    }
    const existing = await getAdminUserById(id);
    if (!existing) {
      return NextResponse.json({ error: "Not found." }, { status: 404, headers: protectedHeaders });
    }

    await resetAdminUserPassword(id, await hashAdminPassword(parsed.data.password));
    return NextResponse.json({ ok: true }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[admin-users] RESET PASSWORD failed", error);
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
