import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { permanentlyDeleteDeletedPublicPageForOwner } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  id: string;
};

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

export async function DELETE(
  request: Request,
  context: { params: Promise<RouteParams> },
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "Invalid deleted page id." }, { status: 400, headers: protectedHeaders });
  }

  try {
    const result = await permanentlyDeleteDeletedPublicPageForOwner(id, session);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status, headers: protectedHeaders });
    }
    return NextResponse.json({ ok: true }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[deleted-public-pages] DELETE failed", error);
    return NextResponse.json(
      { error: "Failed to permanently delete public page." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
