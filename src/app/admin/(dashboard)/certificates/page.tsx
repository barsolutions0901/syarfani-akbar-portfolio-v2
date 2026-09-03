import { CertificatesManager } from "@/components/admin/forms/certificates-manager";
import { prisma } from "@/lib/db";

export const metadata = { title: "Certificates" };

export default async function AdminCertificatesPage() {
  const items = await prisma.certificate.findMany({
    orderBy: [{ order: "asc" }, { issueDate: "desc" }],
  });

  return (
    <div className="grid gap-8">
      <div>
        <p className="eyebrow">Admin</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Certificates
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your certifications — add, edit, publish, and order entries.
        </p>
      </div>

      <section>
        <CertificatesManager items={items} />
      </section>
    </div>
  );
}
