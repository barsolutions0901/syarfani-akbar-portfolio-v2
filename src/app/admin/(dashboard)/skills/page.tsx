import { SkillsManager } from "@/components/admin/forms/skills-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Skills" };

export default async function AdminSkillsPage() {
  const items = await prisma.skill.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Skills
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your skills and proficiency levels — add, edit, publish, and order.
        </p>
      </div>

      <section>
        <SkillsManager items={items} />
      </section>
    </div>
  );
}
