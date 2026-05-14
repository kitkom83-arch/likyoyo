import {
  getAdminUserById,
  getAdminUserByUsername,
  type AdminRole,
} from "@/lib/server/admin-users-store";

export const ADMIN_SESSION_COOKIE_NAME = "linkbio_admin_session";
const ADMIN_SESSION_VERSION = "v1";
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
const PASSWORD_HASH_ALGORITHM = "pbkdf2_sha256";
const PASSWORD_HASH_ITERATIONS = 210_000;
const PASSWORD_HASH_SALT_BYTES = 16;
const PASSWORD_HASH_BYTES = 32;

export type AdminSession = {
  adminId: string;
  username: string;
  displayName: string;
  role: AdminRole;
  expiresAt: number;
};

const getAdminSessionSecret = (): string => {
  const secret = (process.env.ADMIN_SESSION_SECRET ?? "").trim();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is required for admin sessions.");
  }
  return secret;
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
    new TextEncoder().encode(getAdminSessionSecret()),
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

export const timingSafeEqual = (left: string, right: string): boolean => {
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
};

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");

const fromHex = (value: string): Uint8Array => {
  if (value.length % 2 !== 0 || /[^a-f0-9]/i.test(value)) {
    throw new Error("Invalid hex value.");
  }
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
};

const derivePasswordHash = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> => {
  const saltBuffer = new ArrayBuffer(salt.byteLength);
  new Uint8Array(saltBuffer).set(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBuffer,
      iterations,
    },
    keyMaterial,
    PASSWORD_HASH_BYTES * 8,
  );
  return new Uint8Array(bits);
};

export const hashAdminPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(PASSWORD_HASH_SALT_BYTES));
  const hash = await derivePasswordHash(password, salt, PASSWORD_HASH_ITERATIONS);
  return [
    PASSWORD_HASH_ALGORITHM,
    PASSWORD_HASH_ITERATIONS.toString(),
    toHex(salt),
    toHex(hash),
  ].join("$");
};

export const verifyAdminPasswordHash = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const [algorithm, rawIterations, rawSalt, expectedHash] = storedHash.split("$");
  const iterations = Number.parseInt(rawIterations ?? "", 10);
  if (
    algorithm !== PASSWORD_HASH_ALGORITHM ||
    !Number.isFinite(iterations) ||
    iterations < 100_000 ||
    !rawSalt ||
    !expectedHash
  ) {
    return false;
  }

  try {
    const actualHash = await derivePasswordHash(password, fromHex(rawSalt), iterations);
    return timingSafeEqual(toHex(actualHash), expectedHash);
  } catch {
    return false;
  }
};

export const authenticateAdminUser = async (
  username: string,
  password: string,
): Promise<AdminSession | null> => {
  const user = await getAdminUserByUsername(username);
  if (!user || !user.active) {
    return null;
  }
  const passwordMatches = await verifyAdminPasswordHash(password, user.passwordHash);
  if (!passwordMatches) {
    return null;
  }
  return {
    adminId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    expiresAt: Date.now() + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  };
};

export const parseAdminSessionCookie = async (
  cookieValue: string | undefined,
): Promise<AdminSession | null> => {
  if (!cookieValue) {
    return null;
  }

  const [version, payload, signature] = cookieValue.split(".");
  if (version !== ADMIN_SESSION_VERSION || !payload || !signature) {
    return null;
  }

  try {
    const expectedSignature = await signSessionPayload(payload);
    if (!timingSafeEqual(signature, expectedSignature)) {
      return null;
    }

    const session = JSON.parse(fromBase64Url(payload)) as Partial<AdminSession>;
    if (
      typeof session.adminId !== "string" ||
      typeof session.username !== "string" ||
      typeof session.displayName !== "string" ||
      (session.role !== "owner" && session.role !== "admin") ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }
    return session as AdminSession;
  } catch {
    return null;
  }
};

export const isAdminSessionCookieValid = async (
  cookieValue: string | undefined,
): Promise<boolean> => Boolean(await parseAdminSessionCookie(cookieValue));

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

export const createAdminSessionCookie = async (
  session: AdminSession,
  request?: Request,
) => {
  const payload = toBase64Url(JSON.stringify(session));
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

export const getAdminSessionFromRequest = async (
  request: Request,
): Promise<AdminSession | null> => {
  return getAdminSessionFromCookieValue(getAdminSessionCookieFromRequest(request));
};

export const getAdminSessionFromCookieValue = async (
  cookieValue: string | undefined,
): Promise<AdminSession | null> => {
  const session = await parseAdminSessionCookie(cookieValue);
  if (!session) {
    return null;
  }
  const user = await getAdminUserById(session.adminId);
  if (!user || !user.active) {
    return null;
  }
  return {
    adminId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    expiresAt: session.expiresAt,
  };
};

export const isAdminRequestAuthenticated = async (request: Request): Promise<boolean> =>
  Boolean(await getAdminSessionFromRequest(request));

export const isOwnerRequestAuthenticated = async (request: Request): Promise<boolean> => {
  const session = await getAdminSessionFromRequest(request);
  return session?.role === "owner";
};
