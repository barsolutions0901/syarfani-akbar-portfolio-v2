import "server-only";

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

/**
 * Authorization guard for server actions & route handlers.
 * Redirects to the login page when there is no authenticated session.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session.user;
}

/**
 * Returns the admin user if authenticated, otherwise null.
 * Useful when explicit null-handling is preferred over redirect.
 */
export async function getAdmin() {
  const session = await auth();
  return session?.user ?? null;
}