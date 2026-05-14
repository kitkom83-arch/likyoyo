import { NextResponse } from "next/server";

import {
  authenticateAdminUser,
  createAdminSessionCookie,
} from "@/lib/server/admin-auth";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let username = "";
    let password = "";

    if (contentType.includes("application/json")) {
      const payload = (await request.json()) as {
        username?: unknown;
        password?: unknown;
      };
      username =
        typeof payload?.username === "string" ? payload.username.trim().toLowerCase() : "";
      password =
        typeof payload?.password === "string" ? payload.password.trim() : "";
    } else {
      const formData = await request.formData();
      const rawUsername = formData.get("username");
      const raw = formData.get("password");
      username = typeof rawUsername === "string" ? rawUsername.trim().toLowerCase() : "";
      password = typeof raw === "string" ? raw.trim() : "";
    }

    const session = await authenticateAdminUser(username, password);
    if (!session) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        adminId: session.adminId,
        username: session.username,
        displayName: session.displayName,
        role: session.role,
      },
    });
    response.cookies.set(await createAdminSessionCookie(session, request));
    return response;
  } catch (error) {
    console.error("[admin-login] Login failed", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
