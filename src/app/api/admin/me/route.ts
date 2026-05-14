import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { getAdminUserById } from "@/lib/server/admin-users-store";
import { countPublicPagesForAdmin } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
  }

  try {
    const user = await getAdminUserById(session.adminId);
    if (!user || !user.active) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: protectedHeaders });
    }

    const used = await countPublicPagesForAdmin(user.id);
    return NextResponse.json(
      {
        user: {
          adminId: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          slugLimit: user.slugLimit,
          active: user.active,
        },
        quota: {
          used,
          limit: user.slugLimit,
          remaining: Math.max(user.slugLimit - used, 0),
        },
      },
      { headers: protectedHeaders },
    );
  } catch (error) {
    console.error("[admin-me] GET failed", error);
    return NextResponse.json(
      { error: "Failed to load admin session." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
