import path from "node:path";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { isAdminRequestAuthenticated } from "@/lib/server/admin-auth";
import { validateImageUploadServerEnv } from "@/lib/server/env-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_PREFIX = "builder-images";

const MIME_EXTENSIONS: Record<string, string> = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
};

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
  if (!(await isAdminRequestAuthenticated(request))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let env: ReturnType<typeof validateImageUploadServerEnv>;
  try {
    env = validateImageUploadServerEnv();
  } catch (error) {
    console.error("[admin-images] invalid env", error);
    return NextResponse.json(
      { error: "Server image upload configuration is incomplete." },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const file = formData.get("file");
  const rawContext = formData.get("context");
  const context = typeof rawContext === "string" ? rawContext : "";
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Image is too large. Please upload an image under 5 MB." },
      { status: 400 },
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
      return NextResponse.json(
        { error: "LINKBIO_IMAGES_BUCKET must be public for profile images." },
        { status: 500 },
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
    });
  } catch (error) {
    console.error("[admin-images] upload failed", toErrorLog(error));
    return NextResponse.json(
      { error: "Image upload failed. Please try again." },
      { status: 500 },
    );
  }
}
