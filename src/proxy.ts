import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { isSafePublicPathSegment, normalizePublicPathSegment } from "@/lib/public-pages/paths";

const ADMIN_LOGIN_PATH = "/admin/login";
const LOCAL_LAB_ACCESS_FLAG = "ENABLE_LOCAL_LAB_ACCESS";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

// Host labels that must never be treated as a public page slug.
const IGNORED_HOST_LABELS = new Set(["www", "app", "admin", "api", "dashboard"]);

const isEnabled = (value: string | undefined): boolean =>
  typeof value === "string" && TRUE_VALUES.has(value.trim().toLowerCase());

const isLocalHost = (hostname: string): boolean =>
  hostname === "localhost" || hostname === "127.0.0.1";

const isAdminLabPath = (pathname: string): boolean =>
  pathname === "/admin/lab" || pathname.startsWith("/admin/lab/");

const isLocalLabAccessAllowed = (request: NextRequest): boolean =>
  process.env.NODE_ENV === "development" &&
  isEnabled(process.env[LOCAL_LAB_ACCESS_FLAG]) &&
  isLocalHost(request.nextUrl.hostname) &&
  isAdminLabPath(request.nextUrl.pathname);

const stripPort = (host: string): string => host.split(":")[0]?.trim().toLowerCase() ?? "";

// Subdomain routing: `slug.yourdomain.com` is rewritten to `/slug` so each saved
// page can be served from its own subdomain while the app keeps a single route tree.
// Enable by setting NEXT_PUBLIC_ROOT_DOMAIN (e.g. "yourdomain.com", or "localhost:3000"
// for local testing via `slug.localhost:3000`). Unset = no-op, path routing still works.
const extractSubdomainSlug = (request: NextRequest): string | null => {
  const rootDomain = stripPort(process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "");
  if (!rootDomain) {
    return null;
  }

  const hostname = stripPort(request.nextUrl.hostname);
  if (!hostname || hostname === rootDomain || hostname === `www.${rootDomain}`) {
    return null;
  }

  const suffix = `.${rootDomain}`;
  if (!hostname.endsWith(suffix)) {
    return null;
  }

  const label = hostname.slice(0, hostname.length - suffix.length);
  if (!label || label.includes(".") || IGNORED_HOST_LABELS.has(label)) {
    return null;
  }

  const slug = normalizePublicPathSegment(label);
  return slug && isSafePublicPathSegment(slug) ? slug : null;
};

const handleSubdomainRewrite = (request: NextRequest): NextResponse | null => {
  const slug = extractSubdomainSlug(request);
  if (!slug) {
    return null;
  }

  const { pathname, search } = request.nextUrl;
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) {
    return null;
  }

  const suffix = pathname === "/" ? "" : pathname;
  return NextResponse.rewrite(new URL(`/${slug}${suffix}${search}`, request.url));
};

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  // Public pages: apply subdomain rewrite, otherwise pass through untouched.
  if (!isAdminPath) {
    return handleSubdomainRewrite(request) ?? NextResponse.next();
  }

  // Admin area: keep the existing authentication gate.
  if (isLocalLabAccessAllowed(request)) {
    return NextResponse.next();
  }

  const { ADMIN_SESSION_COOKIE_NAME, isAdminSessionCookieValid } = await import(
    "@/lib/server/admin-auth"
  );
  const cookieValue = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = await isAdminSessionCookieValid(cookieValue);

  if (pathname === ADMIN_LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
