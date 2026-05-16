export const RESERVED_PUBLIC_PATH_SEGMENTS = new Set([
  "admin",
  "api",
  "_next",
  "icon.png",
  "favicon.ico",
]);

const SAFE_PUBLIC_SEGMENT_PATTERN = /^[a-z0-9][a-z0-9._-]{0,119}$/;

export const normalizePublicPathSegment = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const isSafePublicPathSegment = (
  value: string,
  options: { allowReserved?: boolean } = {},
): boolean => {
  const normalized = value.trim().toLowerCase();
  if (!SAFE_PUBLIC_SEGMENT_PATTERN.test(normalized)) {
    return false;
  }
  if (normalized.includes("..")) {
    return false;
  }
  if (!options.allowReserved && RESERVED_PUBLIC_PATH_SEGMENTS.has(normalized)) {
    return false;
  }
  return true;
};

export const normalizePublicPageSlug = (value: string): string =>
  normalizePublicPathSegment(value);

export const normalizeAdminUsername = (value: string): string =>
  normalizePublicPathSegment(value);

export const isSafePublicPageSlug = (value: string): boolean =>
  isSafePublicPathSegment(value);

export const isSafeAdminUsername = (value: string): boolean =>
  isSafePublicPathSegment(value);

export const splitPublicPagePath = (
  value: string,
): { ownerUsername: string | null; pageSlug: string; publicPath: string } => {
  const normalized = value.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const ownerUsername = parts[0];
    const pageSlug = parts.slice(1).join("/");
    return {
      ownerUsername,
      pageSlug,
      publicPath: `${ownerUsername}/${pageSlug}`,
    };
  }
  return {
    ownerUsername: null,
    pageSlug: normalized,
    publicPath: normalized,
  };
};

export const buildNestedPublicPagePath = (
  ownerUsername: string,
  pageSlug: string,
): string => `${normalizeAdminUsername(ownerUsername)}/${normalizePublicPageSlug(pageSlug)}`;

export const getPublicPageApiPath = (publicPath: string): string => {
  const { ownerUsername, pageSlug } = splitPublicPagePath(publicPath);
  if (ownerUsername) {
    return `/api/public-pages/${encodeURIComponent(ownerUsername)}/${encodeURIComponent(pageSlug)}`;
  }
  return `/api/public-pages/${encodeURIComponent(pageSlug)}`;
};
