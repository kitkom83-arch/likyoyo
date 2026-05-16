import { ProfileHeader } from "@/features/builder/types";

export const AVATAR_HEADER_FALLBACK_SRC = "/placeholders/avatar-default.svg";
export const HERO_HEADER_FALLBACK_SRC = "/placeholders/wallpaper-default.svg";

export type HeaderLayout = NonNullable<ProfileHeader["layout"]>;

export const normalizeHeaderMediaSrc = (
  value: string | null | undefined,
  fallback: string | null = null,
): string | null => {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim();
  return normalized || fallback;
};

export const getHeaderLayout = (header: ProfileHeader): HeaderLayout => {
  const layout = typeof header.layout === "string" ? header.layout.trim().toLowerCase() : "";
  return layout === "hero" || layout === "none" ? layout : "classic";
};

export const getExplicitHeroHeaderSrc = (header: ProfileHeader): string | null =>
  normalizeHeaderMediaSrc(header.heroImageUrl);

export const getAvatarHeaderRequestSrc = (header: ProfileHeader): string =>
  normalizeHeaderMediaSrc(header.avatarUrl, AVATAR_HEADER_FALLBACK_SRC) ?? AVATAR_HEADER_FALLBACK_SRC;

export const getAvatarHeaderSrc = (
  header: ProfileHeader,
  brokenAvatarSources: Record<string, true>,
): string => {
  const requestSrc = getAvatarHeaderRequestSrc(header);
  return brokenAvatarSources[requestSrc] ? AVATAR_HEADER_FALLBACK_SRC : requestSrc;
};

export const getHeroHeaderRequestSrc = (header: ProfileHeader): string =>
  normalizeHeaderMediaSrc(header.heroImageUrl, HERO_HEADER_FALLBACK_SRC) ??
  HERO_HEADER_FALLBACK_SRC;

export const getHeroHeaderFallbackSrc = (): string => HERO_HEADER_FALLBACK_SRC;

export const getHeroHeaderKey = (requestSrc: string): string => `header::hero::${requestSrc}`;

export const getHeroHeaderSrc = (
  header: ProfileHeader,
  brokenHeroKeys: Record<string, true>,
): string => {
  const explicitHeroSrc = getExplicitHeroHeaderSrc(header);
  if (explicitHeroSrc) {
    return explicitHeroSrc;
  }

  const requestSrc = getHeroHeaderRequestSrc(header);
  const heroHeaderKey = getHeroHeaderKey(requestSrc);
  return brokenHeroKeys[heroHeaderKey] ? getHeroHeaderFallbackSrc() : requestSrc;
};
