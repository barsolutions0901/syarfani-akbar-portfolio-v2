import { ExperienceManager } from "@/components/admin/forms/experience-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Experience" };

export default async function AdminExperiencePage() {
  const items = await prisma.experience.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Experience
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your work history — add, edit, publish, and order entries.
        </p>
      </div>

      <section>
        <ExperienceManager items={items} />
      </section>
    </div>
  );
}
