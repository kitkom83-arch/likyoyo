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

const stripHostPort = (host: string): string =>
  host.split(":")[0]?.trim().toLowerCase() ?? "";

// Builds the shareable public URL for a single-segment slug. When
// NEXT_PUBLIC_ROOT_DOMAIN is configured, returns the subdomain form
// (https://slug.rootdomain). Otherwise falls back to the path form on `origin`.
export const buildPublicPageUrl = (
  slug: string,
  origin: string,
): string => {
  const normalizedSlug = normalizePublicPageSlug(slug);
  const rootDomain = stripHostPort(process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  const pathForm = `${origin.replace(/\/+$/, "")}/${normalizedSlug}`;

  if (!rootDomain || !normalizedSlug || normalizedSlug.includes("/")) {
    return pathForm;
  }

  // Keep the path form on localhost hosts that lack subdomain support in the browser.
  let protocol = "https:";
  let originHost = "";
  try {
    const parsed = new URL(origin);
    protocol = parsed.protocol;
    originHost = stripHostPort(parsed.host);
  } catch {
    return pathForm;
  }

  if (originHost !== rootDomain && originHost !== `www.${rootDomain}`) {
    return pathForm;
  }

  const port = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.includes(":")
    ? `:${process.env.NEXT_PUBLIC_ROOT_DOMAIN.split(":")[1]}`
    : "";
  return `${protocol}//${normalizedSlug}.${rootDomain}${port}`;
};

export const getPublicPageApiPath = (publicPath: string): string => {
  const { ownerUsername, pageSlug } = splitPublicPagePath(publicPath);
  if (ownerUsername) {
    return `/api/public-pages/${encodeURIComponent(ownerUsername)}/${encodeURIComponent(pageSlug)}`;
  }
  return `/api/public-pages/${encodeURIComponent(pageSlug)}`;
};
