import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { OwnerControlClient } from "@/components/admin/owner-control-client";
import {
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionFromCookieValue,
} from "@/lib/server/admin-auth";

export default async function OwnerControlPage() {
  const cookieStore = await cookies();
  const session = await getAdminSessionFromCookieValue(
    cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value,
  );

  if (!session) {
    redirect("/admin/login?next=/admin/owner");
  }
  if (session.role !== "owner") {
    redirect("/admin");
  }

  return <OwnerControlClient viewerName={session.displayName} />;
}
