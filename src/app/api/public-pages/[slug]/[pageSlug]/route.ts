import { NextResponse } from "next/server";

import { builderDataSchema } from "@/features/builder/schema";
import { BuilderData } from "@/features/builder/types";
import { normalizeBuilderData } from "@/features/builder/utils";
import { buildNestedPublicPagePath, isSafeAdminUsername, isSafePublicPageSlug } from "@/lib/public-pages/paths";
import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";
import {
  getPublicPageByOwnerAndSlug,
  removePublicPageBySlugForSession,
  upsertPublicPageForSession,
} from "@/lib/server/public-pages-store";

export const dynamic = "force-dynamic";

type RouteParams = {
  slug: string;
  pageSlug: string;
};

const isDevelopment = process.env.NODE_ENV !== "production";

const getParams = async (params: Promise<RouteParams>) => {
  const resolved = await params;
  return {
    ownerUsername: (resolved.slug ?? "").trim().toLowerCase(),
    pageSlug: (resolved.pageSlug ?? "").trim().toLowerCase(),
  };
};

const getValidationDetails = (error: { issues: Array<{ path: PropertyKey[]; message: string }> }) =>
  error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));

const validateRouteParams = (ownerUsername: string, pageSlug: string): boolean =>
  isSafeAdminUsername(ownerUsername) && isSafePublicPageSlug(pageSlug);

export async function GET(
  _request: Request,
  context: { params: Promise<RouteParams> },
) {
  const { ownerUsername, pageSlug } = await getParams(context.params);
  if (!validateRouteParams(ownerUsername, pageSlug)) {
    return NextResponse.json({ error: "Invalid public path." }, { status: 400 });
  }

  let data: BuilderData | null;
  try {
    data = await getPublicPageByOwnerAndSlug(ownerUsername, pageSlug);
  } catch (error) {
    console.error("[public-pages] nested GET failed", error);
    return NextResponse.json({ error: "Failed to load public page." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PUT(
  request: Request,
  context: { params: Promise<RouteParams> },
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { ownerUsername, pageSlug } = await getParams(context.params);
  if (!validateRouteParams(ownerUsername, pageSlug)) {
    return NextResponse.json({ error: "Invalid public path." }, { status: 400 });
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    payload = rawBody.trim() ? JSON.parse(rawBody) : null;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const candidate = (payload as { data?: unknown })?.data;
  const parsed = builderDataSchema.safeParse(candidate);
  if (!parsed.success) {
    const details = getValidationDetails(parsed.error);
    console.error("[public-pages] nested PUT invalid profile payload", {
      ownerUsername,
      pageSlug,
      details,
    });
    return NextResponse.json(
      {
        error: "Invalid profile payload.",
        ...(isDevelopment ? { details } : {}),
      },
      { status: 400 },
    );
  }

  try {
    const result = await upsertPublicPageForSession(
      buildNestedPublicPagePath(ownerUsername, pageSlug),
      normalizeBuilderData(parsed.data as BuilderData),
      session,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  } catch (error) {
    console.error("[public-pages] nested PUT failed", error);
    return NextResponse.json({ error: "Failed to save public page." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<RouteParams> },
) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { ownerUsername, pageSlug } = await getParams(context.params);
  if (!validateRouteParams(ownerUsername, pageSlug)) {
    return NextResponse.json({ error: "Invalid public path." }, { status: 400 });
  }

  try {
    const result = await removePublicPageBySlugForSession(
      buildNestedPublicPagePath(ownerUsername, pageSlug),
      session,
    );
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
  } catch (error) {
    console.error("[public-pages] nested DELETE failed", error);
    return NextResponse.json({ error: "Failed to delete public page." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
