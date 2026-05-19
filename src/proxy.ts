import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
const LOCAL_LAB_ACCESS_FLAG = "ENABLE_LOCAL_LAB_ACCESS";
const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

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

export async function proxy(request: NextRequest) {
  if (isLocalLabAccessAllowed(request)) {
    return NextResponse.next();
  }

  const { ADMIN_SESSION_COOKIE_NAME, isAdminSessionCookieValid } = await import(
    "@/lib/server/admin-auth"
  );
  const { pathname, search } = request.nextUrl;
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
  matcher: ["/admin/:path*"],
};
