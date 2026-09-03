import { ProjectForm } from "@/components/admin/forms/project-form";
import { prisma } from "@/lib/db";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const technologies = await prisma.technology.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        New project
      </h1>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6">
        <ProjectForm project={null} technologies={technologies} isNew />
      </div>
    </div>
  );
}