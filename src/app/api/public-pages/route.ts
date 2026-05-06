import { NextResponse } from "next/server";

import { isAdminRequestAuthenticated } from "@/lib/server/admin-auth";
import { listPublicPages } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminRequestAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const pages = await listPublicPages();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error("[public-pages] LIST failed", error);
    return NextResponse.json({ error: "Failed to list public pages." }, { status: 500 });
  }
}
