import { ProjectList } from "@/components/admin/project-list";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";

export const metadata = { title: "Projects" };

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      order: true,
      isFeatured: true,
      isPublished: true,
      images: {
        where: { isThumbnail: true },
        select: { url: true },
        take: 1,
      },
    },
  });

  const rows = projects.map((project) => ({
    ...project,
    thumbnail: project.images[0] ?? null,
  }));

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create, edit, publish, and order your work.
          </p>
        </div>
        <Button href="/admin/projects/new">New project</Button>
      </div>

      <ProjectList projects={rows} />
    </div>
  );
}