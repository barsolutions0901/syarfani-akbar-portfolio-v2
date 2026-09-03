import { SettingsManager } from "@/components/admin/forms/settings-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const items = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Simple key/value site settings — add, edit, and remove as needed.
        </p>
      </div>

      <section>
        <SettingsManager items={items} />
      </section>
    </div>
  );
}
