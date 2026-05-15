import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import { restoreDeletedPublicPageForOwner } from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  id: string;
};

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

const restoreSchema = z.object({
  slug: z.string().trim().min(1).max(120).optional(),
  ownerAdminId: z.uuid().nullable().optional(),
});

const readJsonBody = async (request: Request): Promise<unknown> => {
  const text = await request.text();
  return text.trim() ? JSON.parse(text) : {};
};

export async function POST(
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

  let payload: unknown;
  try {
    payload = await readJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400, headers: protectedHeaders });
  }

  const parsed = restoreSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid restore payload.", details: parsed.error.flatten() },
      { status: 400, headers: protectedHeaders },
    );
  }

  try {
    const result = await restoreDeletedPublicPageForOwner(id, session, parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status, headers: protectedHeaders });
    }
    return NextResponse.json({ ok: true }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[deleted-public-pages] RESTORE failed", error);
    return NextResponse.json(
      { error: "Failed to restore public page." },
      { status: 500, headers: protectedHeaders },
    );
  }
}
