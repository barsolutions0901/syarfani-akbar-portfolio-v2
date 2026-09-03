import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

const moduleLinks = [
  { label: "Dashboard", href: "/admin" },
  { label: "Profile & links", href: "/admin/profile" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Technologies", href: "/admin/technologies" },
  { label: "Experience", href: "/admin/experience" },
  { label: "Education", href: "/admin/education" },
  { label: "Skills", href: "/admin/skills" },
  { label: "Certificates", href: "/admin/certificates" },
  { label: "Settings", href: "/admin/settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-dvh bg-paper">
      <AdminNav links={moduleLinks} userEmail={session.user.email ?? "admin"} />
      <main className="px-5 pb-12 pt-6 lg:pl-64">{children}</main>
    </div>
  );
}