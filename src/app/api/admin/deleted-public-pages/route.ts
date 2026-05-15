import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { listDeletedPublicPagesForOwner } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

export async function GET(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403, headers: protectedHeaders });
  }

  try {
    const pages = await listDeletedPublicPagesForOwner(session);
    return NextResponse.json({ pages }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[deleted-public-pages] LIST failed", error);
    return NextResponse.json(
      { error: "Failed to list deleted public pages." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
