import Link from "next/link";

import { prisma } from "@/lib/db";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [projects, publishedProjects, technologies, profileExists] =
    await Promise.all([
      prisma.project.count({ where: { deletedAt: null } }),
      prisma.project.count({ where: { isPublished: true, deletedAt: null } }),
      prisma.technology.count(),
      (await prisma.profile.count()) > 0,
    ]);

  const stats = [
    { label: "Projects", value: projects, href: "/admin/projects" },
    {
      label: "Published",
      value: publishedProjects,
      href: "/admin/projects",
    },
    {
      label: "Technologies",
      value: technologies,
      href: "/admin/technologies",
    },
    { label: "Profile", value: profileExists ? 1 : 0, href: "/admin/profile" },
  ];

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Manage your portfolio content from here.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-primary/40"
          >
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted">
              {stat.label}
            </p>
            <p className="mt-1 font-display text-3xl font-semibold">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {!profileExists && (
        <div className="rounded-2xl border border-line bg-warm-soft/50 p-6">
          <h2 className="font-display text-lg font-semibold">
            Get started
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            Fill in your profile so the public site has something to show.
          </p>
          <Link
            href="/admin/profile"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2"
          >
            Set up your profile →
          </Link>
        </div>
      )}
    </div>
  );
}