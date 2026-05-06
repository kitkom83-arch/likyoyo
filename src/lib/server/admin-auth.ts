import { validateCriticalServerEnv } from "@/lib/server/env-validation";

export const ADMIN_SESSION_COOKIE_NAME = "linkbio_admin_session";
const ADMIN_SESSION_VERSION = "v1";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const getAdminPassword = (): string => validateCriticalServerEnv().adminPassword;

export const isAdminPasswordValid = (inputPassword: string): boolean => {
  const expected = getAdminPassword();
  if (!expected) {
    return false;
  }
  return inputPassword === expected;
};

const toBase64Url = (input: string | ArrayBuffer): string => {
  const bytes =
    typeof input === "string"
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const fromBase64Url = (value: string): string => {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const signSessionPayload = async (payload: string): Promise<string> => {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getAdminPassword()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    keyMaterial,
    new TextEncoder().encode(payload),
  );
  return toBase64Url(signature);
};

const timingSafeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
};

export const isAdminSessionCookieValid = async (
  cookieValue: string | undefined,
): Promise<boolean> => {
  if (!cookieValue) {
    return false;
  }

  const [version, payload, signature] = cookieValue.split(".");
  if (version !== ADMIN_SESSION_VERSION || !payload || !signature) {
    return false;
  }

  try {
    const expectedSignature = await signSessionPayload(payload);
    if (!timingSafeEqual(signature, expectedSignature)) {
      return false;
    }

    const session = JSON.parse(fromBase64Url(payload)) as { expiresAt?: unknown };
    return typeof session.expiresAt === "number" && session.expiresAt > Date.now();
  } catch {
    return false;
  }
};

const shouldUseSecureCookie = (request?: Request): boolean => {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (forwardedProto) {
    return forwardedProto === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return process.env.NODE_ENV === "production";
  }
};

export const createAdminSessionCookie = async (request?: Request) => {
  const payload = toBase64Url(
    JSON.stringify({
      issuedAt: Date.now(),
      expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
      nonce: crypto.randomUUID(),
    }),
  );
  const signature = await signSessionPayload(payload);

  return {
    name: ADMIN_SESSION_COOKIE_NAME,
    value: `${ADMIN_SESSION_VERSION}.${payload}.${signature}`,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  };
};

export const getAdminSessionCookieFromRequest = (request: Request): string | undefined => {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE_NAME}=`));
  if (!match) {
    return undefined;
  }
  return decodeURIComponent(match.slice(ADMIN_SESSION_COOKIE_NAME.length + 1));
};

export const isAdminRequestAuthenticated = async (request: Request): Promise<boolean> =>
  isAdminSessionCookieValid(getAdminSessionCookieFromRequest(request));
