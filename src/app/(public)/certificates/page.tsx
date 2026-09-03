import type { Metadata } from "next";
import Link from "next/link";

import { ArrowUpRight } from "@/components/icons/arrows";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/public/empty-state";
import { PageHeader } from "@/components/public/page-header";
import { Reveal } from "@/components/site/reveal";
import { getPublishedCertificates } from "@/lib/queries";
import { formatMonthYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "Certificates",
  description:
    "Certifications and credentials earned by Syarfani Akbar.",
};

export default async function CertificatesPage() {
  const certificates = await getPublishedCertificates();

  return (
    <>
      <PageHeader
        eyebrow="Certificates"
        title="Credentials that back the work."
        intro="Certifications and coursework that shape how I approach problems."
      />

      <Container className="pb-24 pt-8">
        {certificates.length === 0 ? (
          <EmptyState title="No certificates yet">
            Certificates will appear here once they are added and published.
          </EmptyState>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, i) => (
              <Reveal key={cert.id} delay={i * 60}>
                <li className="flex h-full flex-col overflow-hidden rounded-3xl border border-line/70 bg-surface">
                  {cert.imageUrl && (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-paper">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cert.imageUrl}
                        alt={cert.title}
                        className="size-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="font-display text-xl tracking-tight">
                      {cert.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-primary-deep">
                      {cert.issuer}
                    </p>
                    {cert.issueDate && (
                      <p className="mt-2 text-sm text-muted">
                        {formatMonthYear(cert.issueDate)}
                      </p>
                    )}
                    {cert.credentialUrl && (
                      <Link
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-primary hover:underline"
                      >
                        View credential
                        <ArrowUpRight className="size-3.5" />
                      </Link>
                    )}
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
