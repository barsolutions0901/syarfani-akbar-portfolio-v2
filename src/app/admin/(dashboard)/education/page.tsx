import { EducationManager } from "@/components/admin/forms/education-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Education" };

export default async function AdminEducationPage() {
  const items = await prisma.education.findMany({
    orderBy: [{ order: "asc" }, { startDate: "desc" }],
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Education
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your academic background — add, edit, publish, and order entries.
        </p>
      </div>

      <section>
        <EducationManager items={items} />
      </section>
    </div>
  );
}
