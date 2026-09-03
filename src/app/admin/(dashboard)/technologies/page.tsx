import { TechnologiesManager } from "@/components/admin/forms/technologies-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Technologies" };

export default async function AdminTechnologiesPage() {
  const technologies = await prisma.technology.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { projects: true } } },
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Technologies
        </h1>
        <p className="mt-1 text-sm text-muted">
          A reusable library of technologies you can assign to projects.
        </p>
      </div>

      <section className="rounded-2xl border border-line bg-surface p-6">
        <TechnologiesManager technologies={technologies} />
      </section>
    </div>
  );
}