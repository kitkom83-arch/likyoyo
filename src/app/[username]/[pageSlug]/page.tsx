import type { Metadata } from "next";

import { PublicProfilePageClient } from "@/components/public/public-profile-page-client";
import { BuilderData } from "@/features/builder/types";
import { buildNestedPublicPagePath, isSafeAdminUsername, isSafePublicPageSlug } from "@/lib/public-pages/paths";
import { getPublicPageByOwnerAndSlug } from "@/lib/server/public-pages-store";

type NestedPublicPageParams = {
  username: string;
  pageSlug: string;
};

type NestedPublicPageProps = {
  params: Promise<NestedPublicPageParams>;
};

const getFirstNonEmpty = (...values: Array<string | null | undefined>): string => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const isShareableImageUrl = (value: string): boolean =>
  value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/");

const resolveShareMetadata = (profile: BuilderData, publicPath: string) => {
  const title = getFirstNonEmpty(
    profile.header.shareTitle,
    profile.header.displayName,
    profile.header.publicHandle,
    profile.header.publicUsername,
    profile.header.username,
    publicPath,
  );
  const description = getFirstNonEmpty(
    profile.header.shareDescription,
    profile.text.intro,
    profile.header.tagline,
    profile.text.body,
  );
  const imageCandidate = getFirstNonEmpty(
    profile.header.shareImageUrl,
    profile.header.heroImageUrl,
    profile.header.avatarUrl,
  );
  const image = isShareableImageUrl(imageCandidate) ? imageCandidate : "";

  return { title, description, image };
};

const normalizeParams = (params: NestedPublicPageParams) => ({
  ownerUsername: (params.username ?? "").trim().toLowerCase(),
  pageSlug: (params.pageSlug ?? "").trim().toLowerCase(),
});

export async function generateMetadata({ params }: NestedPublicPageProps): Promise<Metadata> {
  const resolved = normalizeParams(await params);
  const { ownerUsername, pageSlug } = resolved;

  if (!isSafeAdminUsername(ownerUsername) || !isSafePublicPageSlug(pageSlug)) {
    return {};
  }

  let profile: BuilderData | null = null;
  try {
    profile = await getPublicPageByOwnerAndSlug(ownerUsername, pageSlug);
  } catch (error) {
    console.error("[public-page] nested metadata load failed", error);
  }

  if (!profile) {
    return {};
  }

  const publicPath = buildNestedPublicPagePath(ownerUsername, pageSlug);
  const { title, description, image } = resolveShareMetadata(profile, publicPath);
  const imageList = image ? [image] : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageList,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: imageList,
    },
  };
}

export default async function NestedPublicProfilePage({ params }: NestedPublicPageProps) {
  const { ownerUsername, pageSlug } = normalizeParams(await params);
  const publicPath = buildNestedPublicPagePath(ownerUsername, pageSlug);
  let profile: BuilderData | null = null;

  if (isSafeAdminUsername(ownerUsername) && isSafePublicPageSlug(pageSlug)) {
    try {
      profile = await getPublicPageByOwnerAndSlug(ownerUsername, pageSlug);
    } catch {
      profile = null;
    }
  }

  return (
    <PublicProfilePageClient
      username={publicPath}
      initialProfile={profile}
      initialProfileResolved
    />
  );
}
