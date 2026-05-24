import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { getAdminSessionFromRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_PREFIX = "builder-images";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const protectedHeaders = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
};

type ImageUploadEnv = {
  nextPublicSupabaseUrl: string;
  supabaseServiceRoleKey: string;
  linkbioImagesBucket: string;
};

class AdminImageUploadError extends Error {
  public readonly status: number;

  public readonly publicMessage: string;

  constructor(message: string, publicMessage: string, status = 500) {
    super(message);
    this.name = "AdminImageUploadError";
    this.publicMessage = publicMessage;
    this.status = status;
  }
}

const toErrorLog = (error: unknown) => {
  if (error instanceof Error) {
    const maybeStatus = error as Error & { status?: number; statusCode?: number | string };
    return {
      name: error.name,
      message: error.message,
      status: maybeStatus.status,
      statusCode: maybeStatus.statusCode,
    };
  }
  return { raw: error };
};

const isSupportedImageType = (type: string): boolean =>
  Object.hasOwn(MIME_EXTENSIONS, type);

const getImageUploadEnv = (): ImageUploadEnv => {
  const nextPublicSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
  const linkbioImagesBucket = (process.env.LINKBIO_IMAGES_BUCKET ?? "").trim();

  if (!linkbioImagesBucket) {
    throw new AdminImageUploadError(
      "LINKBIO_IMAGES_BUCKET is missing.",
      "Missing bucket config: LINKBIO_IMAGES_BUCKET is not configured.",
    );
  }

  if (!nextPublicSupabaseUrl || !supabaseServiceRoleKey) {
    throw new AdminImageUploadError(
      "Supabase storage env is incomplete for admin image uploads.",
      "Missing storage config: Supabase URL or service role key is not configured.",
    );
  }

  return {
    nextPublicSupabaseUrl,
    supabaseServiceRoleKey,
    linkbioImagesBucket,
  };
};

const sanitizePathSegment = (value: string, fallback: string): string => {
  const normalized = value.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
  return normalized || fallback;
};

const getSafeExtension = (file: File): string => {
  const fromMime = MIME_EXTENSIONS[file.type];
  if (fromMime) {
    return fromMime;
  }

  const parsedExt = path.extname(file.name || "").toLowerCase().replace(/[^a-z0-9.]/g, "");
  return parsedExt || ".img";
};

const createUploadPath = (file: File, context: string): string => {
  const now = new Date();
  const yyyy = String(now.getUTCFullYear());
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const safeContext = sanitizePathSegment(context, "builder");
  const ext = getSafeExtension(file);
  return [
    UPLOAD_PREFIX,
    safeContext,
    yyyy,
    mm,
    `${Date.now()}-${crypto.randomUUID()}${ext}`,
  ].join("/");
};

export async function POST(request: Request) {
  const session = await getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthenticated: please sign in to admin again." },
      { status: 401, headers: protectedHeaders },
    );
  }

  let env: ImageUploadEnv;
  try {
    env = getImageUploadEnv();
  } catch (error) {
    console.error("[admin-images] invalid env", toErrorLog(error));
    const message =
      error instanceof AdminImageUploadError
        ? error.publicMessage
        : "Missing storage config: admin image uploads are not configured.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: protectedHeaders },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid upload request." },
      { status: 400, headers: protectedHeaders },
    );
  }

  const file = formData.get("file");
  const rawContext = formData.get("context");
  const context = typeof rawContext === "string" ? rawContext : "";
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Image file is required." },
      { status: 400, headers: protectedHeaders },
    );
  }
  if (!isSupportedImageType(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type: choose a PNG, JPG, JPEG, or WebP image." },
      { status: 415, headers: protectedHeaders },
    );
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large: upload an image under 5 MB." },
      { status: 413, headers: protectedHeaders },
    );
  }

  const client = createClient(env.nextPublicSupabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    const { data: bucketData, error: bucketError } = await client.storage.getBucket(
      env.linkbioImagesBucket,
    );
    if (bucketError) {
      throw bucketError;
    }
    if (bucketData && bucketData.public === false) {
      throw new AdminImageUploadError(
        "LINKBIO_IMAGES_BUCKET is not public.",
        "Storage upload failed: image bucket must be public.",
      );
    }

    const objectPath = createUploadPath(file, context || "builder");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { data: uploadData, error: uploadError } = await client.storage
      .from(env.linkbioImagesBucket)
      .upload(objectPath, fileBuffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });
    if (uploadError) {
      throw uploadError;
    }

    const uploadedPath = uploadData?.path || objectPath;
    const { data: publicUrlData } = client.storage
      .from(env.linkbioImagesBucket)
      .getPublicUrl(uploadedPath);
    if (!publicUrlData.publicUrl) {
      throw new Error("Supabase did not return a public image URL.");
    }

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path: uploadedPath,
    }, { headers: protectedHeaders });
  } catch (error) {
    console.error("[admin-images] upload failed", toErrorLog(error));
    const message =
      error instanceof AdminImageUploadError
        ? error.publicMessage
        : "Storage upload failed: Supabase could not store the image.";
    const status = error instanceof AdminImageUploadError ? error.status : 500;
    return NextResponse.json(
      { error: message },
      { status, headers: protectedHeaders },
    );
  }
}
