import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Server guard for admin routes. Redirects unauthenticated/unauthorized users. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = session.user.role;
  if (role !== "admin" && role !== "editor") {
    redirect("/login?error=forbidden");
  }
  return session;
}
