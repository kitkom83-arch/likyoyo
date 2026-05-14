import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { listPublicPages } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const protectedResponseHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401, headers: protectedResponseHeaders },
    );
  }

  try {
    const pages = await listPublicPages(session);
    return NextResponse.json(
      {
        pages: pages.map((page) => ({
          slug: page.slug,
          data: page.data,
          updatedAt: page.updated_at ?? null,
          ownerAdminId: page.owner_admin_id ?? null,
          owner: page.owner ?? null,
        })),
        viewer: {
          adminId: session.adminId,
          username: session.username,
          displayName: session.displayName,
          role: session.role,
        },
      },
      { headers: protectedResponseHeaders },
    );
  } catch (error) {
    console.error("[public-pages] LIST failed", error);
    return NextResponse.json(
      { error: "Failed to list public pages." },
      { status: 500, headers: protectedResponseHeaders },
    );
  }
}
