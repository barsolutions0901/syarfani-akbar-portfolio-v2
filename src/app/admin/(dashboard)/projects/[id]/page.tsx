import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/forms/project-form";
import { prisma } from "@/lib/db";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [project, technologies] = await Promise.all([
    prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { images: { orderBy: { sortOrder: "asc" } }, technologies: true },
    }),
    prisma.technology.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Edit project
      </h1>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <ProjectForm project={project} technologies={technologies} isNew={false} />
      </div>
    </div>
  );
}